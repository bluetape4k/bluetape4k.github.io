import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { projectPublicVisualCompanionManifest, safeSourcePath } from './manifest.mjs';
import {
  loadVisualCompanionRepositories,
  repositoryByFullName,
} from './repositories.mjs';

const execute = promisify(execFile);
const SHA256 = /^[0-9a-f]{64}$/;
const SNAPSHOT_KEYS = ['documents', 'manifestPath', 'repository', 'schemaVersion', 'snapshotDigest', 'sourceRef'];

function fail(code, actual) {
  const error = new Error(`${code}: ${String(actual)}`);
  error.code = code;
  error.actual = actual;
  throw error;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function stableJson(value) {
  if (Array.isArray(value)) return value.map(stableJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableJson(value[key])]));
  }
  return value;
}

function digestSnapshot(value) {
  return sha256(JSON.stringify(stableJson(value)));
}

function repositorySlug(repository) {
  return repository.split('/')[1];
}

export function publicRouteFor(locale, repository, documentId) {
  const localePrefix = locale === 'ko' ? '/ko' : locale === 'en' ? '' : fail('VISUAL_LOCALE', locale);
  const slug = repositorySlug(repository);
  if (!/^[a-z0-9-]+$/.test(slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(documentId)) {
    fail('VISUAL_DOCUMENT_ID', documentId);
  }
  return `${localePrefix}/visual-companions/${slug}/${documentId}/`;
}

function destinationRelative(route) {
  if (typeof route !== 'string' || !route.startsWith('/') || !route.endsWith('/')) {
    fail('VISUAL_ROUTE', route);
  }
  const relative = `public/${route.slice(1)}index.html`;
  if (relative.split('/').some((segment) => segment === '..')) fail('VISUAL_ROUTE', route);
  return relative;
}

async function resolveSourceFile(sourceRoot, relativePath) {
  const safe = safeSourcePath(relativePath);
  const rootStatus = await lstat(sourceRoot);
  if (rootStatus.isSymbolicLink()) fail('VISUAL_SOURCE_SYMLINK', sourceRoot);
  const approvedRoot = await realpath(sourceRoot);
  let cursor = approvedRoot;
  for (const segment of safe.split('/')) {
    cursor = path.join(cursor, segment);
    const status = await lstat(cursor);
    if (status.isSymbolicLink()) fail('VISUAL_SOURCE_SYMLINK', relativePath);
  }
  const resolved = await realpath(cursor);
  if (!resolved.startsWith(`${approvedRoot}${path.sep}`)) fail('VISUAL_SOURCE_PATH', relativePath);
  return resolved;
}

async function git(sourceRoot, args) {
  try {
    const { stdout } = await execute('git', args, { cwd: sourceRoot });
    return stdout.trim();
  } catch (error) {
    fail('VISUAL_SOURCE_GIT', error.stderr?.trim() || error.message);
  }
}

function registryFile(siteRoot) {
  return new URL(
    `file://${path.join(siteRoot, 'src/data/visual-companions/repositories.json')}`,
  );
}

function snapshotFile(siteRoot, repository) {
  return path.join(
    siteRoot,
    'src/data/visual-companions',
    `${repositorySlug(repository)}.snapshot.json`,
  );
}

async function collectIndexFiles(root) {
  const found = [];
  async function visit(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) fail('VISUAL_DESTINATION_SYMLINK', absolute);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile() && entry.name === 'index.html') found.push(absolute);
    }
  }
  await visit(root);
  return found.sort();
}

function snapshotBase({ repository, sourceRef, manifestPath, documents }) {
  return {
    schemaVersion: 1,
    repository,
    sourceRef,
    manifestPath,
    documents,
  };
}

export async function syncVisualCompanionSnapshot({
  siteRoot,
  sourceRoot,
  sourceRef,
  repository,
}) {
  const registry = loadVisualCompanionRepositories(registryFile(siteRoot));
  const descriptor = repositoryByFullName(registry, repository);
  if (sourceRef !== undefined && sourceRef !== descriptor.sourceRef) {
    fail('VISUAL_SOURCE_REF_MISMATCH', `${sourceRef} != ${descriptor.sourceRef}`);
  }
  const head = await git(sourceRoot, ['rev-parse', 'HEAD']);
  if (head !== descriptor.sourceRef) {
    fail('VISUAL_SOURCE_REF_MISMATCH', `${head} != ${descriptor.sourceRef}`);
  }
  const dirty = await git(sourceRoot, ['status', '--porcelain']);
  if (dirty !== '') fail('VISUAL_SOURCE_DIRTY', dirty);

  const manifestAbsolute = await resolveSourceFile(sourceRoot, descriptor.manifestPath);
  const manifest = projectPublicVisualCompanionManifest(
    JSON.parse(await readFile(manifestAbsolute, 'utf8')),
    repository,
  );
  const copied = [];
  const documents = [];
  for (const document of manifest.documents) {
    const locales = {};
    for (const locale of ['en', 'ko']) {
      const sourcePath = document.locales[locale].html;
      const sourceAbsolute = await resolveSourceFile(sourceRoot, sourcePath);
      const content = await readFile(sourceAbsolute);
      const route = publicRouteFor(locale, repository, document.id);
      const destination = destinationRelative(route);
      copied.push({ destination, content });
      locales[locale] = {
        title: document.locales[locale].title,
        sourcePath,
        route,
        sha256: sha256(content),
      };
    }
    documents.push({
      id: document.id,
      source: document.source,
      status: document.status,
      presentation: document.presentation,
      locales,
    });
  }

  const base = snapshotBase({
    repository,
    sourceRef: descriptor.sourceRef,
    manifestPath: descriptor.manifestPath,
    documents,
  });
  const snapshot = { ...base, snapshotDigest: digestSnapshot(base) };

  const slug = repositorySlug(repository);
  const destinations = [
    path.join(siteRoot, 'public/visual-companions', slug),
    path.join(siteRoot, 'public/ko/visual-companions', slug),
  ];
  for (const destination of destinations) await rm(destination, { recursive: true, force: true });
  for (const asset of copied) {
    const absolute = path.join(siteRoot, asset.destination);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, asset.content);
  }
  const output = snapshotFile(siteRoot, repository);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(snapshot, null, 2)}\n`);

  return {
    documentCount: documents.length,
    assetCount: copied.length,
    snapshot,
  };
}

export async function validateVisualCompanionSnapshot({ siteRoot, repository }) {
  const registry = loadVisualCompanionRepositories(registryFile(siteRoot));
  const descriptor = repositoryByFullName(registry, repository);
  const snapshot = JSON.parse(await readFile(snapshotFile(siteRoot, repository), 'utf8'));
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    fail('VISUAL_SNAPSHOT', snapshot);
  }
  const keys = Object.keys(snapshot).sort();
  if (keys.length !== SNAPSHOT_KEYS.length || keys.some((key, index) => key !== SNAPSHOT_KEYS[index])) {
    fail('VISUAL_SNAPSHOT_KEYS', keys.join(','));
  }
  if (
    snapshot.schemaVersion !== 1
    || snapshot.repository !== repository
    || snapshot.sourceRef !== descriptor.sourceRef
    || snapshot.manifestPath !== descriptor.manifestPath
    || !Array.isArray(snapshot.documents)
  ) {
    fail('VISUAL_SNAPSHOT_CONTRACT', repository);
  }
  const { snapshotDigest, ...base } = snapshot;
  if (!SHA256.test(snapshotDigest) || digestSnapshot(base) !== snapshotDigest) {
    fail('VISUAL_SNAPSHOT_DIGEST', snapshotDigest);
  }

  const expected = new Set();
  let assetCount = 0;
  for (const document of snapshot.documents) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(document.id)) {
      fail('VISUAL_DOCUMENT_ID', document.id);
    }
    for (const locale of ['en', 'ko']) {
      const asset = document.locales?.[locale];
      const expectedRoute = publicRouteFor(locale, repository, document.id);
      if (!asset || asset.route !== expectedRoute || !SHA256.test(asset.sha256)) {
        fail('VISUAL_ASSET_CONTRACT', `${document.id}:${locale}`);
      }
      const relative = destinationRelative(asset.route);
      const absolute = path.join(siteRoot, relative);
      const status = await lstat(absolute);
      if (status.isSymbolicLink() || !status.isFile()) fail('VISUAL_DESTINATION_SYMLINK', relative);
      const content = await readFile(absolute);
      if (sha256(content) !== asset.sha256) fail('VISUAL_ASSET_DIGEST', relative);
      expected.add(absolute);
      assetCount += 1;
    }
  }

  const slug = repositorySlug(repository);
  const actual = [
    ...await collectIndexFiles(path.join(siteRoot, 'public/visual-companions', slug)),
    ...await collectIndexFiles(path.join(siteRoot, 'public/ko/visual-companions', slug)),
  ];
  const stale = actual.filter((file) => !expected.has(file));
  const missing = [...expected].filter((file) => !actual.includes(file));
  if (stale.length > 0) fail('VISUAL_ASSET_STALE', stale.join(','));
  if (missing.length > 0) fail('VISUAL_ASSET_MISSING', missing.join(','));

  return {
    repository,
    sourceRef: snapshot.sourceRef,
    snapshotDigest,
    documentCount: snapshot.documents.length,
    assetCount,
  };
}
