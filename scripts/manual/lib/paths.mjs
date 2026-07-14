import { lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { validateRepositoryRegistry } from './repositories.mjs';

const MINOR_VERSION = /^\d+\.\d+$/;
const RELEASE_REF = /^(?:v)?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;

function fail(code, actual) {
  const error = new Error(`${code}: ${String(actual)}`);
  error.code = code;
  error.actual = actual;
  throw error;
}

function assertLocale(locale) {
  if (!['en', 'ko'].includes(locale)) fail('LOCALE_UNSUPPORTED', locale);
}

function assertRepository(repository) {
  try {
    return validateRepositoryRegistry({ schema: 1, repositories: [repository] }).repositories[0];
  } catch {
    fail('REPOSITORY_UNSUPPORTED', repository?.repository ?? repository);
  }
}

function assertMinor(minorVersion) {
  if (typeof minorVersion !== 'string' || !MINOR_VERSION.test(minorVersion)) {
    fail('MINOR_UNSAFE', minorVersion);
  }
}

export function safeRelativePath(value) {
  if (typeof value !== 'string' || value === '' || value.includes('\\') || value.includes('\0')) {
    fail('PATH_UNSAFE', value);
  }
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    fail('PATH_UNSAFE', value);
  }
  if (
    decoded === ''
    || decoded.startsWith('/')
    || decoded.startsWith('//')
    || decoded.includes('\\')
    || decoded.includes('\0')
    || decoded.includes('?')
    || decoded.includes('#')
    || /^[a-z][a-z\d+.-]*:/i.test(decoded)
    || /%[\da-f]{2}/i.test(decoded)
    || decoded.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')
  ) fail('PATH_UNSAFE', value);

  const normalized = path.posix.normalize(decoded);
  if (normalized === '.' || normalized.startsWith('../') || path.posix.isAbsolute(normalized)) {
    fail('PATH_UNSAFE', value);
  }
  return normalized;
}

function contentPrefix(locale, repository, minorVersion) {
  return locale === 'ko'
    ? `src/content/docs/ko/manual/${repository.slug}/${minorVersion}`
    : `src/content/docs/manual/${repository.slug}/${minorVersion}`;
}

export function destinationFor(locale, repository, relativePath, minorVersion) {
  assertLocale(locale);
  const approved = assertRepository(repository);
  assertMinor(minorVersion);
  const safe = safeRelativePath(relativePath);
  const localePrefix = `${locale}/`;
  if (!safe.startsWith(localePrefix)) fail('LOCALE_UNSUPPORTED', relativePath);
  const prefix = contentPrefix(locale, approved, minorVersion);
  const destination = path.posix.join(prefix, safe.slice(localePrefix.length));
  if (destination !== prefix && !destination.startsWith(`${prefix}/`)) fail('PATH_UNSAFE', destination);
  return destination;
}

export function assetDestinationFor(repository, relativePath, minorVersion) {
  const approved = assertRepository(repository);
  assertMinor(minorVersion);
  const safe = safeRelativePath(relativePath);
  if (!safe.startsWith('assets/')) fail('PATH_UNSAFE', relativePath);
  const prefix = `public/manual-assets/${approved.slug}/${minorVersion}`;
  const destination = path.posix.join(prefix, safe.slice('assets/'.length));
  if (!destination.startsWith(`${prefix}/`)) fail('PATH_UNSAFE', destination);
  return destination;
}

export function manualRouteFor(locale, repository, minorVersion, relativePath) {
  assertLocale(locale);
  const approved = assertRepository(repository);
  assertMinor(minorVersion);
  const safe = safeRelativePath(relativePath).replace(/\.md$/, '');
  const routeId = safe === 'index' ? 'index' : safe.replace(/\/index$/, '');
  const suffix = routeId === 'index' ? '' : `${routeId}/`;
  const localePrefix = locale === 'ko' ? '/ko' : '';
  return `${localePrefix}/manual/${approved.slug}/${minorVersion}/${suffix}`;
}

export function githubSourceUrlFor({ repository, releaseRef, sourcePath, kind }) {
  const approved = assertRepository(repository);
  if (typeof releaseRef !== 'string' || !RELEASE_REF.test(releaseRef)) fail('RELEASE_UNSAFE', releaseRef);
  if (!['blob', 'tree'].includes(kind)) fail('SOURCE_KIND_UNSUPPORTED', kind);
  const encodedPath = safeRelativePath(sourcePath).split('/').map(encodeURIComponent).join('/');
  return `https://github.com/${approved.repository}/${kind}/${releaseRef}/${encodedPath}`;
}

export async function resolveApprovedPath(root, relativePath, { allowMissing = false } = {}) {
  const safe = safeRelativePath(relativePath);
  const approvedRoot = await realpath(root);
  const target = path.resolve(approvedRoot, ...safe.split('/'));
  if (target !== approvedRoot && !target.startsWith(`${approvedRoot}${path.sep}`)) fail('PATH_UNSAFE', relativePath);

  let cursor = approvedRoot;
  for (const segment of safe.split('/')) {
    cursor = path.join(cursor, segment);
    try {
      const status = await lstat(cursor);
      if (status.isSymbolicLink()) fail('PATH_SYMLINK', relativePath);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      if (!allowMissing) throw error;
      break;
    }
  }
  if (!allowMissing) {
    const resolved = await realpath(target);
    if (resolved !== approvedRoot && !resolved.startsWith(`${approvedRoot}${path.sep}`)) fail('PATH_UNSAFE', relativePath);
    return resolved;
  }
  return target;
}

export function localeOf(relativePath) {
  const safe = safeRelativePath(relativePath);
  if (safe.startsWith('en/')) return 'en';
  if (safe.startsWith('ko/')) return 'ko';
  fail('LOCALE_UNSUPPORTED', relativePath);
}
