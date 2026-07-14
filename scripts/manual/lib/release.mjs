import { parseStableRelease } from './version.mjs';
import { validateRepositoryRegistry } from './repositories.mjs';

const API_ORIGIN = 'https://api.github.com';
const MAX_ANNOTATED_TAG_DEPTH = 16;
const CANONICAL_GIT_SHA = /^[0-9a-f]{40}$/;
const SAFE_CODE = /^[A-Z][A-Z0-9_]{1,63}$/;
const TOKEN_LIKE = /(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|bearer\s+\S+|token\s+\S+|token|secret|authorization|password|sentinel)/i;

class ReleaseError extends Error {
  constructor(code, expected, actual, details = {}) {
    super(`${code}: release contract rejected`);
    this.name = 'ReleaseError';
    this.code = code;
    this.expected = expected;
    this.actual = actual;
    Object.assign(this, details);
  }
}

function fail(code, expected, actual, details) {
  throw new ReleaseError(code, expected, actual, details);
}

function safeHeaders() {
  const headers = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

function endpoint(pathname) {
  return new URL(pathname, API_ORIGIN).toString();
}

function approvedRepository(repository) {
  try {
    return validateRepositoryRegistry({ schema: 1, repositories: [repository] }).repositories[0];
  } catch {
    fail('REPOSITORY_IDENTITY', 'approved repository descriptor', repository);
  }
}

function stampRepository(error, repository) {
  if (error && typeof error === 'object') error.repository ??= repository.repository;
  return error;
}

function assertPayloadIdentity(payload, repository) {
  if (Object.hasOwn(payload?.repository ?? {}, 'full_name')) {
    const fullName = payload.repository.full_name;
    if (fullName !== repository.repository) {
      fail('REPOSITORY_IDENTITY', repository.repository, fullName);
    }
  }

  if (Object.hasOwn(payload ?? {}, 'repository_url')) {
    const repositoryUrl = payload.repository_url;
    let matches = false;
    if (typeof repositoryUrl === 'string') {
      try {
        const url = new URL(repositoryUrl);
        matches = url.origin === API_ORIGIN
          && url.pathname === `/repos/${repository.repository}`
          && url.search === ''
          && url.hash === ''
          && url.username === ''
          && url.password === '';
      } catch {
        matches = false;
      }
    }
    if (!matches) {
      fail('REPOSITORY_IDENTITY', `${API_ORIGIN}/repos/${repository.repository}`, repositoryUrl);
    }
  }
}

async function requestJson(pathname, repository, fetchImpl) {
  const url = endpoint(pathname);
  let response;
  try {
    response = await fetchImpl(url, { headers: safeHeaders() });
  } catch (cause) {
    fail('GITHUB_REQUEST', 'successful GitHub API request', 'network failure', { url, cause });
  }
  if (!response?.ok) {
    fail('GITHUB_HTTP_STATUS', '2xx', response?.status ?? null, {
      status: response?.status,
      url: response?.url || url,
    });
  }
  let payload;
  try {
    payload = await response.json();
  } catch (cause) {
    fail('GITHUB_RESPONSE_JSON', 'JSON response', 'invalid JSON', {
      status: response.status,
      url: response.url || url,
      cause,
    });
  }
  assertPayloadIdentity(payload, repository);
  return payload;
}

function repositoryPath(repository, suffix = '') {
  return `/repos/${repository.repository}${suffix}`;
}

async function resolveCommit(tagName, repository, fetchImpl) {
  const encodedTag = encodeURIComponent(tagName);
  const ref = await requestJson(repositoryPath(repository, `/git/ref/tags/${encodedTag}`), repository, fetchImpl);
  let object = ref?.object;
  const visited = new Set();

  const assertCanonicalSha = (candidate) => {
    if (['tag', 'commit'].includes(candidate?.type) && !CANONICAL_GIT_SHA.test(candidate?.sha ?? '')) {
      fail('RELEASE_TAG_SHA', '40 lowercase hexadecimal characters', candidate?.sha ?? null);
    }
  };
  assertCanonicalSha(object);

  for (let depth = 0; object?.type === 'tag'; depth += 1) {
    if (depth >= MAX_ANNOTATED_TAG_DEPTH) {
      fail('RELEASE_TAG_DEPTH', `<= ${MAX_ANNOTATED_TAG_DEPTH}`, depth + 1);
    }
    if (typeof object.sha !== 'string' || visited.has(object.sha)) {
      fail('RELEASE_TAG_CYCLE', 'acyclic annotated tag chain', object?.sha ?? null);
    }
    visited.add(object.sha);
    const tag = await requestJson(repositoryPath(repository, `/git/tags/${encodeURIComponent(object.sha)}`), repository, fetchImpl);
    object = tag?.object;
    assertCanonicalSha(object);
  }

  if (object?.type !== 'commit' || typeof object.sha !== 'string') {
    fail('RELEASE_TAG_TARGET', 'commit', object?.type ?? null);
  }
  return object.sha;
}

export async function resolveRelease({ repository, releaseRef, fetchImpl = fetch }) {
  const approved = approvedRepository(repository);
  try {
    if (releaseRef !== undefined) parseStableRelease(releaseRef);

    const repositoryPayload = await requestJson(repositoryPath(approved), approved, fetchImpl);
    if (repositoryPayload?.full_name !== approved.repository) {
      fail('REPOSITORY_IDENTITY', approved.repository, repositoryPayload?.full_name ?? null);
    }

    const releasePath = releaseRef
      ? repositoryPath(approved, `/releases/tags/${encodeURIComponent(releaseRef)}`)
      : repositoryPath(approved, '/releases/latest');
    const release = await requestJson(releasePath, approved, fetchImpl);
    if (release?.draft !== false) fail('RELEASE_DRAFT', false, release?.draft ?? null);
    if (release?.prerelease !== false) fail('RELEASE_PRERELEASE', false, release?.prerelease ?? null);
    if (releaseRef && release?.tag_name !== releaseRef) {
      fail('RELEASE_TAG_MISMATCH', releaseRef, release?.tag_name ?? null);
    }

    const tagName = release?.tag_name;
    const parsed = parseStableRelease(tagName);
    const releaseCommit = await resolveCommit(tagName, approved, fetchImpl);
    return {
      repository: approved.repository,
      releaseRef: tagName,
      releaseCommit,
      minorVersion: parsed.minorVersion,
    };
  } catch (error) {
    throw stampRepository(error, approved);
  }
}

export async function assertReleaseUnmoved(resolved, repository, fetchImpl = fetch) {
  const approved = approvedRepository(repository);
  try {
    if (resolved?.repository !== approved.repository) {
      fail('REPOSITORY_IDENTITY', approved.repository, resolved?.repository ?? null);
    }
    const current = await resolveRelease({
      repository: approved,
      releaseRef: resolved?.releaseRef,
      fetchImpl,
    });
    if (current.releaseCommit !== resolved?.releaseCommit) {
      fail('RELEASE_MOVED', resolved?.releaseCommit ?? null, current.releaseCommit);
    }
    return resolved;
  } catch (error) {
    throw stampRepository(error, approved);
  }
}

function safeScalar(value) {
  if (!['string', 'number', 'boolean'].includes(typeof value) && value !== null) return undefined;
  if (typeof value === 'number' && !Number.isFinite(value)) return undefined;
  if (typeof value === 'string') {
    let decoded = value;
    for (let depth = 0; depth <= 4; depth += 1) {
      if (decoded.length > 200 || TOKEN_LIKE.test(decoded)) return undefined;
      if (!decoded.includes('%')) return value;
      if (depth === 4) return undefined;
      try {
        const next = decodeURIComponent(decoded);
        if (next === decoded) return undefined;
        decoded = next;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
  return value;
}

function safeUrl(value, repository) {
  if (typeof value !== 'string' || typeof repository !== 'string') return undefined;
  try {
    const url = new URL(value);
    const allowedPrefix = `/repos/${repository}`;
    const allowedPath = url.pathname === allowedPrefix || url.pathname.startsWith(`${allowedPrefix}/`);
    if (url.origin !== API_ORIGIN || !allowedPath || TOKEN_LIKE.test(decodeURIComponent(url.pathname))) {
      return undefined;
    }
    return `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
}

export function sanitizeDiagnostic(error) {
  const diagnostic = {};
  if (typeof error?.code === 'string' && SAFE_CODE.test(error.code)) diagnostic.code = error.code;
  if (Number.isInteger(error?.status) && error.status >= 100 && error.status <= 599) diagnostic.status = error.status;
  const url = safeUrl(error?.url, error?.repository);
  if (url) diagnostic.url = url;
  const expected = safeScalar(error?.expected);
  if (expected !== undefined) diagnostic.expected = expected;
  const actual = safeScalar(error?.actual);
  if (actual !== undefined) diagnostic.actual = actual;
  return diagnostic;
}
