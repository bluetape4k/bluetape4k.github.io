import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRedirectCatalog, validateVersionCatalog } from './lib/catalog.mjs';
import { safeRelativePath } from './lib/paths.mjs';
import { sanitizeDiagnostic } from './lib/release.mjs';
import { validateCommittedSite } from './sync-manual.mjs';
import { loadRepositoryRegistry, repositoryBySlug } from './lib/repositories.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const registry = loadRepositoryRegistry(new URL('../../src/data/manual/repositories.json', import.meta.url));

function parseArgs(argv) {
  let repository;
  let report;
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--report') {
      report = argv[++index];
      if (!report) throw new Error('REPORT_PATH: --report requires a path');
    } else if (argv[index] === '--repository') {
      repository = argv[++index];
      if (!repository) throw new Error('CLI_REPOSITORY: --repository requires a slug');
    }
    else throw new Error(`CLI_OPTION: ${argv[index]}`);
  }
  return { repository, report };
}

function driftPaths(error) {
  const values = [];
  for (const candidate of [error?.actual, error?.path]) {
    if (typeof candidate !== 'string') continue;
    const relative = candidate.startsWith(`${root}${path.sep}`) ? path.relative(root, candidate) : candidate;
    const sanitized = sanitizeDiagnostic({ actual: relative }).actual;
    if (typeof sanitized !== 'string' || !/^(?:src|public)\//.test(sanitized)) continue;
    try { values.push(safeRelativePath(sanitized)); } catch { /* unsafe diagnostics are omitted */ }
  }
  return [...new Set(values)].slice(0, 10);
}

export function failureReport(error, repository) {
  const diagnostic = sanitizeDiagnostic(error);
  const repositoryIdentity = repository ?? (typeof error?.repository === 'string' ? error.repository : undefined);
  return {
    status: 'fail',
    ...(repositoryIdentity ? { repository: repositoryIdentity } : {}),
    code: diagnostic.code ?? 'VALIDATION_FAILED',
    driftPaths: driftPaths(error),
  };
}

async function validateRepository(repositoryDescriptor) {
  const repository = repositoryDescriptor.slug;
  const result = await validateCommittedSite({ targetRoot: root, repository, registry });
  const catalogPath = path.join(root, `src/data/manual/${repository}.versions.json`);
  const catalog = validateVersionCatalog(JSON.parse(await readFile(catalogPath, 'utf8')), repositoryDescriptor);
  const redirects = loadRedirectCatalog(new URL(`../../src/data/manual/${repository}.redirects.json`, import.meta.url), repositoryDescriptor);
  for (const version of catalog.versions) {
    const en = version.documents.en.join('\n');
    const ko = version.documents.ko.join('\n');
    if (en !== ko) {
      const error = new Error(`LOCALE_PARITY: ${version.minorVersion}`);
      error.code = 'LOCALE_PARITY';
      error.actual = `src/data/manual/${repository}.versions.json`;
      throw error;
    }
  }
  const latest = catalog.versions.find(({ minorVersion }) => minorVersion === catalog.latest);
  const manifest = JSON.parse(await readFile(path.join(root, `src/data/manual/${repository}.${catalog.latest}.manifest.json`), 'utf8'));
  return {
    status: 'pass',
    repository: catalog.repository,
    latest: catalog.latest,
    releaseRef: latest.releaseRef,
    releaseCommit: latest.releaseCommit,
    sourceCommit: latest.sourceCommit,
    versions: catalog.versions.length,
    documents: result.documents,
    assets: result.assets,
    redirects: redirects.entries.length,
    modules: manifest.modules.length,
    generationId: result.generationId,
    driftPaths: [],
  };
}

async function validate(repository) {
  if (repository) return validateRepository(repositoryBySlug(registry, repository));
  const repositories = [];
  for (const descriptor of registry.repositories) repositories.push(await validateRepository(descriptor));
  return { status: 'pass', repositories };
}

async function main(argv) {
  const options = parseArgs(argv);
  let report;
  try {
    report = await validate(options.repository);
  } catch (error) {
    let repositoryIdentity;
    if (options.repository) {
      try { repositoryIdentity = repositoryBySlug(registry, options.repository).repository; } catch { /* reported by code */ }
    }
    report = failureReport(error, repositoryIdentity);
    if (options.report) await writeFile(path.resolve(options.report), `${JSON.stringify(report, null, 2)}\n`);
    console.error(`Manual snapshot invalid: code=${report.code} drift=${report.driftPaths.join(',') || 'none'}`);
    process.exitCode = 1;
    return;
  }
  if (options.report) await writeFile(path.resolve(options.report), `${JSON.stringify(report, null, 2)}\n`);
  if (Array.isArray(report.repositories)) {
    console.log(`Manual snapshots valid: repositories=${report.repositories.length}`);
  } else {
    console.log(
      `Manual snapshot valid: repository=${report.repository} latest=${report.latest} release=${report.releaseRef} releaseCommit=${report.releaseCommit} sourceCommit=${report.sourceCommit} versions=${report.versions} documents=${report.documents} assets=${report.assets} redirects=${report.redirects} generation=${report.generationId}`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main(process.argv.slice(2));
