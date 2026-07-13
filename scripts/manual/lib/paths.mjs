import { lstat, realpath } from 'node:fs/promises';
import path from 'node:path';

const REPOSITORY_SLUG = 'bluetape4k-projects';
const REPOSITORY_FULL_NAME = `bluetape4k/${REPOSITORY_SLUG}`;
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
  if (repository !== REPOSITORY_SLUG) fail('REPOSITORY_UNSUPPORTED', repository);
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

function contentPrefix(locale, minorVersion) {
  return locale === 'ko'
    ? `src/content/docs/ko/manual/${REPOSITORY_SLUG}/${minorVersion}`
    : `src/content/docs/manual/${REPOSITORY_SLUG}/${minorVersion}`;
}

export function destinationFor(locale, relativePath, minorVersion) {
  assertLocale(locale);
  assertMinor(minorVersion);
  const safe = safeRelativePath(relativePath);
  const localePrefix = `${locale}/`;
  if (!safe.startsWith(localePrefix)) fail('LOCALE_UNSUPPORTED', relativePath);
  const prefix = contentPrefix(locale, minorVersion);
  const destination = path.posix.join(prefix, safe.slice(localePrefix.length));
  if (destination !== prefix && !destination.startsWith(`${prefix}/`)) fail('PATH_UNSAFE', destination);
  return destination;
}

export function assetDestinationFor(repository, relativePath, minorVersion) {
  assertRepository(repository);
  assertMinor(minorVersion);
  const safe = safeRelativePath(relativePath);
  if (!safe.startsWith('assets/')) fail('PATH_UNSAFE', relativePath);
  const prefix = `public/manual-assets/${REPOSITORY_SLUG}/${minorVersion}`;
  const destination = path.posix.join(prefix, safe.slice('assets/'.length));
  if (!destination.startsWith(`${prefix}/`)) fail('PATH_UNSAFE', destination);
  return destination;
}

export function manualRouteFor(locale, repository, minorVersion, relativePath) {
  assertLocale(locale);
  assertRepository(repository);
  assertMinor(minorVersion);
  const safe = safeRelativePath(relativePath).replace(/\.md$/, '');
  const routeId = safe === 'index' ? 'index' : safe.replace(/\/index$/, '');
  const suffix = routeId === 'index' ? '' : `${routeId}/`;
  const localePrefix = locale === 'ko' ? '/ko' : '';
  return `${localePrefix}/manual/${REPOSITORY_SLUG}/${minorVersion}/${suffix}`;
}

export function githubSourceUrlFor({ repositoryFullName, releaseRef, sourcePath, kind }) {
  if (repositoryFullName !== REPOSITORY_FULL_NAME) fail('REPOSITORY_UNSUPPORTED', repositoryFullName);
  if (typeof releaseRef !== 'string' || !RELEASE_REF.test(releaseRef)) fail('RELEASE_UNSAFE', releaseRef);
  if (!['blob', 'tree'].includes(kind)) fail('SOURCE_KIND_UNSUPPORTED', kind);
  const encodedPath = safeRelativePath(sourcePath).split('/').map(encodeURIComponent).join('/');
  return `https://github.com/${REPOSITORY_FULL_NAME}/${kind}/${releaseRef}/${encodedPath}`;
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
