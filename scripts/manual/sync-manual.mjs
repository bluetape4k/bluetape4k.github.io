import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildRedirectCatalog,
  buildUnavailablePage,
  mergeVersionCatalog,
  stableJson,
  validateVersionCatalog,
} from './lib/catalog.mjs';
import { digestEntries } from './lib/digest.mjs';
import { layerFor, setDocumentSlug, transformManual } from './lib/frontmatter.mjs';
import {
  assetDestinationFor,
  destinationFor,
  localeOf,
  manualRouteFor,
  resolveApprovedPath,
  safeRelativePath,
} from './lib/paths.mjs';
import { publishStaged, recoverPublication, stagePublication } from './lib/publication.mjs';
import { assertReleaseUnmoved, resolveRelease, sanitizeDiagnostic } from './lib/release.mjs';
import { loadRepositoryRegistry, repositoryBySlug, validateRepositoryRegistry } from './lib/repositories.mjs';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const repositoryRegistry = loadRepositoryRegistry(new URL('../../src/data/manual/repositories.json', import.meta.url));
const SHA = /^[0-9a-f]{40}$/;
const DIGEST = /^[0-9a-f]{64}$/;
const MINOR = /^\d+\.\d+$/;
const RELEASE = /^(?:v)?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;

class SyncError extends Error {
  constructor(code, expected, actual, exitCode) {
    super(`${code}: manual sync rejected`);
    this.name = 'SyncError';
    this.code = code;
    this.expected = expected;
    this.actual = actual;
    this.exitCode = exitCode;
  }
}

function fail(code, expected, actual, exitCode) {
  throw new SyncError(code, expected, actual, exitCode);
}

async function walk(root, prefix = '') {
  const entries = [];
  for (const item of await readdir(path.join(root, prefix), { withFileTypes: true })) {
    const relative = path.posix.join(prefix, item.name);
    if (item.isSymbolicLink()) fail('SOURCE_SYMLINK', 'regular manual path', relative, 4);
    if (item.isDirectory()) entries.push(...await walk(root, relative));
    else entries.push(relative);
  }
  return entries.sort();
}

async function approvedRootPath(root) {
  const absolute = path.resolve(root);
  const info = await lstat(absolute);
  if (info.isSymbolicLink()) fail('PATH_SYMLINK', 'non-symlink root', absolute, 4);
  if (!info.isDirectory()) fail('PATH_TYPE', 'directory root', absolute, 4);
  return realpath(absolute);
}

async function approvedDirectory(root, relative) {
  const absolute = await resolveApprovedPath(root, safeRelativePath(relative));
  const info = await lstat(absolute);
  if (!info.isDirectory()) fail('PATH_TYPE', 'directory', relative, 4);
  return absolute;
}

async function approvedFile(root, relative) {
  const safe = safeRelativePath(relative);
  const absolute = await resolveApprovedPath(root, safe);
  const info = await lstat(absolute);
  if (!info.isFile()) fail('PATH_TYPE', 'regular file', safe, 4);
  return { relative: safe, absolute };
}

async function readApproved(root, relative, encoding) {
  const approved = await approvedFile(root, relative);
  return readFile(approved.absolute, encoding);
}

export function parseArgs(argv) {
  const result = {};
  const modes = [];
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--latest') modes.push('latest');
    else if (argument === '--release') {
      modes.push('release');
      result.releaseRef = argv[++index];
      if (!result.releaseRef) fail('CLI_RELEASE', 'release value', null, 2);
      if (!RELEASE.test(result.releaseRef)) fail('CLI_RELEASE', 'stable semantic release', result.releaseRef, 2);
    } else if (argument === '--refresh') {
      modes.push('refresh');
      result.releaseRef = argv[++index];
      if (!result.releaseRef) fail('CLI_RELEASE', 'release value', null, 2);
      if (!RELEASE.test(result.releaseRef)) fail('CLI_RELEASE', 'stable semantic release', result.releaseRef, 2);
    } else if (argument === '--check') modes.push('check');
    else if (argument === '--recover') modes.push('recover');
    else if (argument === '--source') {
      result.source = argv[++index];
      if (!result.source) fail('CLI_SOURCE', 'source path', null, 2);
    } else if (argument === '--repository') {
      result.repository = argv[++index];
      if (!result.repository) fail('CLI_REPOSITORY', 'repository slug', null, 2);
    } else fail('CLI_ARGUMENT', 'known option', argument, 2);
  }
  if (modes.length !== 1) fail('CLI_MODE', 'exactly one mode', modes.join(','), 2);
  result.mode = modes[0];
  const writeMode = ['latest', 'release', 'refresh'].includes(result.mode);
  if ((writeMode || result.mode === 'recover') && !result.repository) {
    fail('CLI_REPOSITORY', 'explicit --repository <slug>', null, 2);
  }
  if (writeMode && !result.source) fail('CLI_SOURCE', 'source path', null, 2);
  if (!writeMode && result.source) fail('CLI_MODE', `${result.mode} without source`, 'source supplied', 2);
  return result;
}

function documentId(relative) {
  const withoutLocale = relative.replace(/^(?:en|ko)\//, '').replace(/\.md$/, '');
  if (withoutLocale === 'index') return 'index';
  return withoutLocale.replace(/\/index$/, '');
}

async function approvedManifestPath(manualRoot, relative, prefix, suffix = '') {
  const safe = safeRelativePath(relative);
  if (!safe.startsWith(prefix) || (suffix && !safe.endsWith(suffix))) {
    fail('PATH_UNSAFE', `${prefix}*${suffix}`, relative, 4);
  }
  return { relative: safe, absolute: await resolveApprovedPath(manualRoot, safe) };
}

function versionEntry(input, documents) {
  return {
    minorVersion: input.minorVersion,
    releaseRef: input.releaseRef,
    releaseCommit: input.releaseCommit,
    authoringSourceRef: input.authoringSourceRef,
    sourceCommit: input.sourceCommit,
    channel: 'stable',
    documents,
  };
}

function nextCatalog(previousCatalog, entry, repository, allowReleaseRefresh = false) {
  if (!previousCatalog) {
    return validateVersionCatalog({
      schema: 1,
      repository: repository.repository,
      latest: entry.minorVersion,
      versions: [entry],
    }, repository);
  }
  const previous = validateVersionCatalog(previousCatalog, repository);
  const current = previous.versions.find(({ minorVersion }) => minorVersion === entry.minorVersion);
  if (current && current.releaseRef === entry.releaseRef) {
    if (stableJson(current) !== stableJson(entry)) {
      if (!allowReleaseRefresh) fail('CATALOG_RELEASE_REWRITE', current.releaseRef, entry.releaseRef, 4);
      if (current.releaseCommit !== entry.releaseCommit) {
        fail('CATALOG_RELEASE_COMMIT', current.releaseCommit, entry.releaseCommit, 4);
      }
      return validateVersionCatalog({
        ...previous,
        versions: previous.versions.map((item) => item.minorVersion === entry.minorVersion
          ? { ...entry, channel: item.channel }
          : item),
      }, repository);
    }
    return previous;
  }
  return mergeVersionCatalog(previous, entry, repository);
}

function initialRedirects(repository) {
  return { schema: 1, repository: repository.repository, redirects: [] };
}

function manifestAssets(manifest) {
  return [
    ...(manifest.overview?.assets ?? []),
    ...manifest.modules.flatMap((module) => module.assets ?? []),
  ];
}

function assertResolvedInput(input) {
  if (!input || typeof input !== 'object') fail('SOURCE_INPUT', 'resolved input', input, 2);
  let repository;
  try {
    repository = validateRepositoryRegistry({ schema: 1, repositories: [input.repository] }).repositories[0];
  } catch {
    fail('REPOSITORY_IDENTITY', 'approved repository descriptor', input.repository, 3);
  }
  if (!SHA.test(input.releaseCommit) || !SHA.test(input.sourceCommit)) fail('SOURCE_COMMIT', '40 lowercase hex', null, 4);
  if (!MINOR.test(input.minorVersion)) fail('MINOR_UNSAFE', 'major.minor', input.minorVersion, 4);
  if (typeof input.authoringSourceRef !== 'string' || input.authoringSourceRef.length === 0) {
    fail('SOURCE_REF', 'authoring source ref', input.authoringSourceRef, 4);
  }
  return repository;
}

export async function buildSnapshot(input, {
  previousCatalog = null,
  previousRedirects = null,
  allowReleaseRefresh = false,
} = {}) {
  const repository = assertResolvedInput(input);
  const root = await approvedRootPath(input.source);
  const manualRoot = await approvedDirectory(root, 'docs/manual');
  const manifest = JSON.parse(await readApproved(root, 'docs/manual/generated/manifest.json', 'utf8'));
  if (manifest.schemaVersion !== 2 || !Array.isArray(manifest.modules)) {
    fail('MANIFEST_SCHEMA', 2, manifest.schemaVersion, 4);
  }
  const byPath = new Map();
  const approvedAssets = [];
  for (const relative of manifest.overview?.assets ?? []) {
    approvedAssets.push(await approvedManifestPath(manualRoot, relative, 'assets/'));
  }
  for (const module of manifest.modules) {
    if (typeof module.sourceDir !== 'string' || !module.sourceDir.trim()) {
      fail('MANIFEST_SOURCE_DIR', 'non-empty sourceDir', module.id, 4);
    }
    for (const locale of ['en', 'ko']) {
      const { relative } = await approvedManifestPath(manualRoot, module[locale], `${locale}/`, '.md');
      if (!byPath.has(relative)) byPath.set(relative, { module, chapter: null });
      else if (byPath.get(relative)?.chapter) fail('MANIFEST_DUPLICATE_PATH', 'unique path', relative, 4);
      else byPath.set(relative, null);
    }
    for (const chapter of module.chapters ?? []) {
      for (const locale of ['en', 'ko']) {
        const { relative } = await approvedManifestPath(manualRoot, chapter[locale], `${locale}/`, '.md');
        if (byPath.has(relative)) fail('MANIFEST_DUPLICATE_PATH', 'unique path', relative, 4);
        byPath.set(relative, { module, chapter });
      }
    }
    for (const relative of module.assets ?? []) {
      approvedAssets.push(await approvedManifestPath(manualRoot, relative, 'assets/'));
    }
  }

  const sourcePaths = (await walk(manualRoot)).filter((item) => /^(en|ko)\/.*\.md$/.test(item));
  const sourceEntries = [];
  const contentEntries = [];
  const documents = { en: [], ko: [] };
  for (const relative of sourcePaths) {
    const absolute = await resolveApprovedPath(manualRoot, safeRelativePath(relative));
    const content = await readFile(absolute, 'utf8');
    sourceEntries.push({ path: relative, content });
    const locale = localeOf(relative);
    documents[locale].push(documentId(relative));
    const owner = byPath.get(relative);
    const module = owner?.module ?? {
      id: documentId(relative),
      group: 'overview',
      kind: 'guide',
      sourceDir: 'docs/manual',
    };
    const transformed = transformManual({
      content,
      module,
      chapter: owner?.chapter ?? null,
      repository,
      sourceCommit: input.sourceCommit,
      sourcePath: `docs/manual/${relative}`,
      releaseRef: input.releaseRef,
      releaseCommit: input.releaseCommit,
      minorVersion: input.minorVersion,
    });
    const route = manualRouteFor(locale, repository, input.minorVersion, relative.slice(`${locale}/`.length));
    contentEntries.push({
      path: destinationFor(locale, repository, relative, input.minorVersion),
      content: setDocumentSlug(transformed, repository, route.replace(/^\//, '').replace(/\/$/, '')),
    });
  }
  documents.en.sort();
  documents.ko.sort();

  const assetPaths = approvedAssets.map(({ relative }) => relative);
  if (new Set(assetPaths).size !== assetPaths.length) fail('MANIFEST_DUPLICATE_ASSET', 'unique asset', null, 4);
  const assetEntries = [];
  const assetAliases = [];
  for (const relative of [...assetPaths].sort()) {
    const approved = approvedAssets.find((candidate) => candidate.relative === relative);
    const content = await readFile(approved.absolute);
    assetEntries.push({ path: assetDestinationFor(repository, relative, input.minorVersion), content });
    assetAliases.push({
      path: `public/manual-assets/${repository.slug}/${relative.replace(/^assets\//, '')}`,
      content,
    });
  }

  const normalizedManifest = {
    schemaVersion: 2,
    repository: repository.repository,
    repositorySlug: repository.slug,
    minorVersion: input.minorVersion,
    releaseRef: input.releaseRef,
    releaseCommit: input.releaseCommit,
    authoringSourceRef: input.authoringSourceRef,
    sourceCommit: input.sourceCommit,
    ...(manifest.overview ? { overview: manifest.overview } : {}),
    modules: manifest.modules.map((module) => ({
      ...module,
      layer: layerFor(module.kind),
      routes: {
        en: manualRouteFor('en', repository, input.minorVersion, module.en.replace(/^en\//, '')),
        ko: manualRouteFor('ko', repository, input.minorVersion, module.ko.replace(/^ko\//, '')),
      },
      chapters: (module.chapters ?? []).map((chapter) => ({
        ...chapter,
        routes: {
          en: manualRouteFor('en', repository, input.minorVersion, chapter.en.replace(/^en\//, '')),
          ko: manualRouteFor('ko', repository, input.minorVersion, chapter.ko.replace(/^ko\//, '')),
        },
      })),
    })),
  };
  const snapshot = {
    schemaVersion: 1,
    repository: repository.repository,
    repositorySlug: repository.slug,
    minorVersion: input.minorVersion,
    releaseRef: input.releaseRef,
    releaseCommit: input.releaseCommit,
    authoringSourceRef: input.authoringSourceRef,
    sourceCommit: input.sourceCommit,
    sourceDigest: digestEntries(sourceEntries),
    contentDigest: digestEntries(contentEntries),
    assetDigest: digestEntries(assetEntries),
    sourceFiles: sourceEntries.length,
    documentFiles: contentEntries.length,
    assetFiles: assetEntries.length,
    contentFiles: contentEntries.length + assetEntries.length,
  };
  const entry = versionEntry(input, documents);
  const catalog = nextCatalog(previousCatalog, entry, repository, allowReleaseRefresh);
  const redirects = buildRedirectCatalog({
    repository,
    previous: previousRedirects ?? initialRedirects(repository),
    latestEntry: catalog.versions.find(({ minorVersion }) => minorVersion === catalog.latest),
  });
  const unavailableEntries = [];
  for (const sourceVersion of catalog.versions) {
    for (const targetVersion of catalog.versions) {
      if (sourceVersion.minorVersion === targetVersion.minorVersion) continue;
      for (const locale of ['en', 'ko']) {
        const targetDocuments = new Set(targetVersion.documents[locale]);
        for (const missingDocument of sourceVersion.documents[locale].filter((item) => !targetDocuments.has(item))) {
          unavailableEntries.push(buildUnavailablePage({
            repository,
            locale,
            targetMinor: targetVersion.minorVersion,
            sourceMinor: sourceVersion.minorVersion,
            documentId: missingDocument,
          }));
        }
      }
    }
  }
  const manifestBytes = stableJson(normalizedManifest);
  const snapshotBytes = stableJson(snapshot);
  const dataEntries = [
    { path: `src/data/manual/${repository.slug}.${input.minorVersion}.manifest.json`, content: manifestBytes },
    { path: `src/data/manual/${repository.slug}.${input.minorVersion}.snapshot.json`, content: snapshotBytes },
    { path: `src/data/manual/${repository.slug}.manifest.json`, content: manifestBytes },
    { path: `src/data/manual/${repository.slug}.snapshot.json`, content: snapshotBytes },
    { path: `src/data/manual/${repository.slug}.versions.json`, content: stableJson(catalog) },
    { path: `src/data/manual/${repository.slug}.redirects.json`, content: stableJson(redirects) },
  ];
  const entries = [...contentEntries, ...assetEntries, ...assetAliases, ...unavailableEntries, ...dataEntries]
    .sort((left, right) => left.path.localeCompare(right.path));
  if (new Set(entries.map(({ path: entryPath }) => entryPath)).size !== entries.length) {
    fail('CONTENT_DUPLICATE_PATH', 'unique generated path', null, 4);
  }
  return { entries, contentEntries, assetEntries, assetAliases, snapshot, manifest: normalizedManifest, catalog, redirects };
}

async function optionalJson(root, relative, fallback = null) {
  try {
    return JSON.parse(await readApproved(root, relative, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

function commandOutput(command, args, options = {}) {
  try {
    return execFileSync(command, args, { ...options, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (cause) {
    const error = new SyncError('SOURCE_RELEASE_CONTRACT', 0, cause.status ?? 1, 4);
    error.cause = cause;
    throw error;
  }
}

function gitOutput(source, args) {
  try {
    return execFileSync('git', ['-C', source, ...args], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (cause) {
    const error = new SyncError('SOURCE_GIT', 'successful git command', cause.status ?? 1, 4);
    error.cause = cause;
    throw error;
  }
}

function validatorEnvironment() {
  return Object.fromEntries(
    ['PATH', 'HOME', 'LANG', 'LC_ALL', 'TMPDIR']
      .filter((name) => typeof process.env[name] === 'string')
      .map((name) => [name, process.env[name]]),
  );
}

function canonicalGeneration(entries) {
  const chunks = [];
  for (const entry of [...entries].sort((a, b) => a.path.localeCompare(b.path))) {
    const name = Buffer.from(entry.path);
    const content = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(entry.content);
    chunks.push(Buffer.from(`${name.length}:`), name, Buffer.from(`${content.length}:`), content);
  }
  return createHash('sha256').update(Buffer.concat(chunks)).digest('hex');
}

function canonicalTargetDigest(entries) {
  const hash = createHash('sha256');
  for (const entry of [...entries].sort((a, b) => a.path.localeCompare(b.path))) {
    const name = Buffer.from(entry.path);
    const content = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(entry.content);
    hash.update(`P${name.length}:`).update(name).update(`${content.length}:`).update(content);
  }
  return hash.digest('hex');
}

function dependencies(overrides = {}) {
  return {
    resolveReleaseImpl: resolveRelease,
    assertReleaseUnmovedImpl: assertReleaseUnmoved,
    recoverPublicationImpl: recoverPublication,
    stagePublicationImpl: stagePublication,
    publishStagedImpl: publishStaged,
    buildSnapshotImpl: buildSnapshot,
    commandRunner: commandOutput,
    gitRunner: gitOutput,
    fetchImpl: globalThis.fetch,
    repositoryRegistry,
    ...overrides,
  };
}

export async function validateCommittedRepository({ targetRoot = siteRoot, repository }) {
  const repositoryDescriptor = validateRepositoryRegistry({ schema: 1, repositories: [repository] }).repositories[0];
  const repositorySlug = repositoryDescriptor.slug;
  const root = await approvedRootPath(targetRoot);
  const publicationEntries = [];
  const catalogPath = `src/data/manual/${repositorySlug}.versions.json`;
  const redirectsPath = `src/data/manual/${repositorySlug}.redirects.json`;
  const catalogBytes = await readApproved(root, catalogPath);
  const redirectsBytes = await readApproved(root, redirectsPath);
  const catalog = validateVersionCatalog(JSON.parse(catalogBytes), repositoryDescriptor);
  if (catalog.latest !== repositoryDescriptor.latestMinor) {
    fail('REPOSITORY_LATEST_MINOR', repositoryDescriptor.latestMinor, catalog.latest, 4);
  }
  const redirects = JSON.parse(redirectsBytes);
  publicationEntries.push(
    { path: catalogPath, content: catalogBytes },
    { path: redirectsPath, content: redirectsBytes },
  );
  if (!redirects || redirects.schema !== 1 || redirects.repository !== repositoryDescriptor.repository || !Array.isArray(redirects.redirects)) {
    fail('REDIRECT_SCHEMA', 1, redirects?.schema, 4);
  }
  const redirectSources = new Set();
  for (const redirect of redirects.redirects) {
    if (redirectSources.has(redirect.source)) fail('REDIRECT_DUPLICATE', 'unique source', redirect.source, 4);
    redirectSources.add(redirect.source);
    if (!redirect.target.includes(`/${catalog.latest}/`)) {
      fail('REDIRECT_LATEST', catalog.latest, redirect.target, 4);
    }
  }
  for (const version of catalog.versions) {
    const minor = version.minorVersion;
    const manifestPath = `src/data/manual/${repositorySlug}.${minor}.manifest.json`;
    const snapshotPath = `src/data/manual/${repositorySlug}.${minor}.snapshot.json`;
    const manifestBytes = await readApproved(root, manifestPath);
    const snapshotBytes = await readApproved(root, snapshotPath);
    const manifest = JSON.parse(manifestBytes);
    const snapshot = JSON.parse(snapshotBytes);
    if (minor === catalog.latest) {
      publicationEntries.push(
        { path: manifestPath, content: manifestBytes },
        { path: snapshotPath, content: snapshotBytes },
      );
    }
    if (manifest.minorVersion !== minor || snapshot.minorVersion !== minor) fail('SNAPSHOT_MINOR', minor, snapshot.minorVersion, 4);
    for (const field of ['releaseRef', 'releaseCommit', 'sourceCommit']) {
      if (manifest[field] !== version[field] || snapshot[field] !== version[field]) {
        fail('SNAPSHOT_PROVENANCE', `${field}=${version[field]}`, `${manifest[field]}|${snapshot[field]}`, 4);
      }
    }
    const contentEntries = [];
    for (const relative of [...version.documents.en.map((id) => `en/${id === 'index' ? 'index' : id}.md`),
      ...version.documents.ko.map((id) => `ko/${id === 'index' ? 'index' : id}.md`)]) {
      const locale = localeOf(relative);
      const destination = destinationFor(locale, repositoryDescriptor, relative, minor);
      contentEntries.push({ path: destination, content: await readApproved(root, destination) });
    }
    const assetEntries = [];
    for (const relative of manifestAssets(manifest).sort()) {
      const destination = assetDestinationFor(repositoryDescriptor, relative, minor);
      const content = await readApproved(root, destination);
      assetEntries.push({ path: destination, content });
      if (minor === catalog.latest) {
        const alias = `public/manual-assets/${repositorySlug}/${relative.replace(/^assets\//, '')}`;
        const aliasContent = await readApproved(root, alias);
        if (!content.equals(aliasContent)) fail('ASSET_ALIAS', destination, alias, 4);
        publicationEntries.push({ path: alias, content: aliasContent });
      }
    }
    if (digestEntries(contentEntries) !== snapshot.contentDigest) fail('DIGEST_MISMATCH', snapshot.contentDigest, 'content', 4);
    if (digestEntries(assetEntries) !== snapshot.assetDigest) fail('DIGEST_MISMATCH', snapshot.assetDigest, 'assets', 4);
    if (snapshot.documentFiles !== contentEntries.length || snapshot.assetFiles !== assetEntries.length) {
      fail('SNAPSHOT_COUNT', snapshot.contentFiles, contentEntries.length + assetEntries.length, 4);
    }
    if (minor === catalog.latest) publicationEntries.push(...contentEntries, ...assetEntries);
  }
  const unavailablePaths = new Set();
  for (const sourceVersion of catalog.versions) {
    for (const targetVersion of catalog.versions) {
      if (sourceVersion.minorVersion === targetVersion.minorVersion) continue;
      for (const locale of ['en', 'ko']) {
        const targetDocuments = new Set(targetVersion.documents[locale]);
        for (const missingDocument of sourceVersion.documents[locale].filter((item) => !targetDocuments.has(item))) {
          const expected = buildUnavailablePage({
            repository: repositoryDescriptor,
            locale,
            targetMinor: targetVersion.minorVersion,
            sourceMinor: sourceVersion.minorVersion,
            documentId: missingDocument,
          });
          if (unavailablePaths.has(expected.path)) fail('CONTENT_DUPLICATE_PATH', 'unique unavailable path', expected.path, 4);
          unavailablePaths.add(expected.path);
          let actual;
          try { actual = await readApproved(root, expected.path); }
          catch { fail('UNAVAILABLE_DRIFT', expected.path, 'missing', 4); }
          if (!actual.equals(Buffer.from(expected.content))) fail('UNAVAILABLE_DRIFT', expected.path, 'content mismatch', 4);
          publicationEntries.push({ path: expected.path, content: actual });
        }
      }
    }
  }
  const latestManifest = `src/data/manual/${repositorySlug}.${catalog.latest}.manifest.json`;
  const latestSnapshot = `src/data/manual/${repositorySlug}.${catalog.latest}.snapshot.json`;
  for (const [alias, fixed] of [
    [`src/data/manual/${repositorySlug}.manifest.json`, latestManifest],
    [`src/data/manual/${repositorySlug}.snapshot.json`, latestSnapshot],
  ]) {
    const aliasContent = await readApproved(root, alias);
    if (!aliasContent.equals(await readApproved(root, fixed))) {
      fail('LATEST_ALIAS', fixed, alias, 4);
    }
    publicationEntries.push({ path: alias, content: aliasContent });
  }
  const marker = JSON.parse(await readApproved(root, `.manual-sync-generation.${repositorySlug}.json`, 'utf8'));
  const expectedGeneration = canonicalGeneration(publicationEntries);
  const expectedTreeDigest = canonicalTargetDigest(publicationEntries);
  if (!DIGEST.test(marker.generationId) || !DIGEST.test(marker.treeDigest)
    || marker.generationId !== expectedGeneration || marker.treeDigest !== expectedTreeDigest) {
    fail('PUBLICATION_MARKER', `${expectedGeneration}|${expectedTreeDigest}`, `${marker.generationId}|${marker.treeDigest}`, 4);
  }
  const latest = catalog.versions.find(({ minorVersion }) => minorVersion === catalog.latest);
  return {
    repository: repositoryDescriptor.repository,
    latest: catalog.latest,
    releaseRef: latest.releaseRef,
    releaseCommit: latest.releaseCommit,
    sourceCommit: latest.sourceCommit,
    documents: latest.documents.en.length + latest.documents.ko.length,
    assets: manifestAssets(JSON.parse(await readApproved(root, latestManifest, 'utf8'))).length,
    generationId: marker.generationId,
    changed: false,
    mutated: false,
    recovery: { recovered: false },
  };
}

export async function validateCommittedSite({ targetRoot = siteRoot, repository, registry = repositoryRegistry }) {
  const approvedRegistry = validateRepositoryRegistry(registry);
  if (repository !== undefined) {
    const descriptor = typeof repository === 'string'
      ? repositoryBySlug(approvedRegistry, repository)
      : repositoryBySlug(approvedRegistry, repository?.slug);
    try {
      return await validateCommittedRepository({ targetRoot, repository: descriptor });
    } catch (error) {
      error.repository ??= descriptor.repository;
      throw error;
    }
  }
  const repositories = [];
  for (const descriptor of approvedRegistry.repositories) {
    try {
      repositories.push(await validateCommittedRepository({ targetRoot, repository: descriptor }));
    } catch (error) {
      error.repository ??= descriptor.repository;
      throw error;
    }
  }
  return { repositories, changed: false, mutated: false };
}

export async function syncManual(options, dependencyOverrides = {}) {
  const deps = dependencies(dependencyOverrides);
  const targetRoot = options.targetRoot ?? siteRoot;
  if (options.mode === 'check' || options.check === true) {
    return validateCommittedSite({ targetRoot, repository: options.repository, registry: deps.repositoryRegistry });
  }
  let repository;
  try {
    const repositorySlug = typeof options.repository === 'string' ? options.repository : options.repository?.slug;
    repository = repositoryBySlug(deps.repositoryRegistry, repositorySlug);
  } catch {
    fail('CLI_REPOSITORY', 'registered repository slug', options.repository, 2);
  }
  let recovery;
  try {
    recovery = await deps.recoverPublicationImpl(targetRoot, repository.slug);
  } catch (error) {
    error.exitCode ??= 5;
    error.recovery = { recovered: false };
    throw error;
  }
  if (options.mode === 'recover') {
    return { changed: false, mutated: false, recovery };
  }

  const source = await approvedRootPath(options.source);
  let resolvedRelease;
  try {
    resolvedRelease = await deps.resolveReleaseImpl({
      repository,
      releaseRef: options.mode === 'latest' ? undefined : options.releaseRef,
      fetchImpl: deps.fetchImpl,
    });
  } catch (error) {
    error.exitCode ??= 3;
    error.recovery = recovery;
    throw error;
  }
  const head = deps.gitRunner(source, ['rev-parse', 'HEAD']);
  if (!SHA.test(head)) fail('SOURCE_COMMIT', '40 lowercase hex', head, 4);
  const validatorRelative = 'scripts/manual/validate_release_manuals.rb';
  const validator = await approvedFile(source, validatorRelative);
  const dirty = deps.gitRunner(source, ['status', '--porcelain', '--', 'docs/manual', validatorRelative]);
  if (dirty) fail('SOURCE_DIRTY', 'clean docs/manual and validator', 'dirty', 4);
  if (options.sourceCommit && options.sourceCommit !== head) fail('SOURCE_DRIFT', options.sourceCommit, head, 4);
  const committedValidator = deps.gitRunner(source, ['rev-parse', `HEAD:${validatorRelative}`]);
  const workingValidator = deps.gitRunner(source, ['hash-object', validator.absolute]);
  if (!SHA.test(committedValidator) || workingValidator !== committedValidator) {
    fail('SOURCE_VALIDATOR_BLOB', committedValidator, workingValidator, 4);
  }
  deps.commandRunner('ruby', [validator.absolute, resolvedRelease.releaseRef, resolvedRelease.releaseCommit], {
    cwd: source,
    env: validatorEnvironment(),
  });

  const previousCatalog = await optionalJson(targetRoot, `src/data/manual/${repository.slug}.versions.json`);
  const previousRedirects = await optionalJson(targetRoot, `src/data/manual/${repository.slug}.redirects.json`);
  let built;
  try {
    built = await deps.buildSnapshotImpl({
      source,
      repository,
      releaseRef: resolvedRelease.releaseRef,
      releaseCommit: resolvedRelease.releaseCommit,
      minorVersion: resolvedRelease.minorVersion,
      authoringSourceRef: options.authoringSourceRef ?? head,
      sourceCommit: head,
    }, {
      previousCatalog,
      previousRedirects,
      allowReleaseRefresh: options.mode === 'refresh',
    });
  } catch (error) {
    error.exitCode ??= 4;
    error.recovery = recovery;
    throw error;
  }
  try {
    await deps.assertReleaseUnmovedImpl(resolvedRelease, repository, deps.fetchImpl);
  } catch (error) {
    error.exitCode ??= 3;
    error.recovery = recovery;
    throw error;
  }
  let publication;
  try {
    const staged = await deps.stagePublicationImpl({
      targetRoot,
      entries: built.entries,
      generationId: canonicalGeneration(built.entries),
      scope: repository.slug,
    });
    publication = await deps.publishStagedImpl({ targetRoot, staged });
  } catch (error) {
    error.exitCode ??= 5;
    error.recovery = recovery;
    throw error;
  }
  return {
    repository: repository.repository,
    latest: built.catalog.latest,
    minor: built.snapshot.minorVersion,
    releaseRef: built.snapshot.releaseRef,
    releaseCommit: built.snapshot.releaseCommit,
    sourceCommit: built.snapshot.sourceCommit,
    documents: built.snapshot.documentFiles,
    assets: built.snapshot.assetFiles,
    changed: publication.changed,
    mutated: publication.changed,
    recovery,
  };
}

function safeField(value, pattern) {
  return typeof value === 'string' && pattern.test(value) ? value : undefined;
}

function diagnostic(error, options = {}) {
  const value = sanitizeDiagnostic(error);
  if (typeof error?.repository === 'string') value.repository = error.repository;
  else if (typeof options.repository === 'string') {
    try { value.repository = repositoryBySlug(repositoryRegistry, options.repository).repository; }
    catch { /* an unknown repository is already represented by the error code */ }
  }
  const minor = safeField(options.minor ?? error.minor, MINOR);
  if (minor) value.minor = minor;
  const safePath = safeField(error.path, /^[A-Za-z0-9._/-]{1,200}$/);
  if (safePath) value.path = safePath;
  value.mutated = error.mutated === true;
  const recovery = error.recovery ?? options.recovery;
  if (recovery && typeof recovery === 'object') {
    value.recovery = {
      recovered: recovery.recovered === true,
      ...(typeof recovery.committed === 'boolean' ? { committed: recovery.committed } : {}),
    };
  }
  return value;
}

function exitCodeFor(error) {
  if ([2, 3, 4, 5].includes(error?.exitCode)) return error.exitCode;
  if (/^(?:CLI_)/.test(error?.code ?? '')) return 2;
  if (/^(?:GITHUB_|RELEASE_|REPOSITORY_)/.test(error?.code ?? '')) return 3;
  if (/^(?:PUBLICATION_)/.test(error?.code ?? '')) return 5;
  return 4;
}

function summary(result, mode) {
  if (mode === 'recover') {
    return `Manual recovery: recovered=${result.recovery.recovered === true} changed=false`;
  }
  if (mode === 'check') {
    if (Array.isArray(result.repositories)) {
      return `Manual check: repositories=${result.repositories.length} changed=false`;
    }
    return `Manual check: repository=${result.repository} latest=${result.latest} release=${result.releaseRef} documents=${result.documents} assets=${result.assets} changed=false`;
  }
  return `Manual sync: repository=${result.repository} latest=${result.latest} release=${result.releaseRef} releaseCommit=${result.releaseCommit} sourceCommit=${result.sourceCommit} documents=${result.documents} assets=${result.assets} changed=${result.changed}`;
}

export async function runCli(argv, dependencyOverrides = {}) {
  try {
    const options = parseArgs(argv);
    const result = await syncManual({ ...options, targetRoot: dependencyOverrides.targetRoot }, dependencyOverrides);
    return { exitCode: 0, stdout: `${summary(result, options.mode)}\n`, stderr: '', result };
  } catch (error) {
    return {
      exitCode: exitCodeFor(error),
      stdout: '',
      stderr: `${JSON.stringify(diagnostic(error))}\n`,
      error,
    };
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outcome = await runCli(process.argv.slice(2));
  if (outcome.stdout) process.stdout.write(outcome.stdout);
  if (outcome.stderr) process.stderr.write(outcome.stderr);
  process.exitCode = outcome.exitCode;
}
