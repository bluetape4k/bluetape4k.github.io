import { parseStableRelease } from './version.mjs';

const ALLOWED_REPOSITORY = 'bluetape4k/bluetape4k-projects';
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

function assertPayloadIdentity(payload) {
  if (Object.hasOwn(payload?.repository ?? {}, 'full_name')) {
    const fullName = payload.repository.full_name;
    if (fullName !== ALLOWED_REPOSITORY) {
      fail('REPOSITORY_IDENTITY', ALLOWED_REPOSITORY, fullName);
    }
  }

  if (Object.hasOwn(payload ?? {}, 'repository_url')) {
    const repositoryUrl = payload.repository_url;
    let matches = false;
    if (typeof repositoryUrl === 'string') {
      try {
        const url = new URL(repositoryUrl);
        matches = url.origin === API_ORIGIN
          && url.pathname === `/repos/${ALLOWED_REPOSITORY}`
          && url.search === ''
          && url.hash === ''
          && url.username === ''
          && url.password === '';
      } catch {
        matches = false;
      }
    }
    if (!matches) {
      fail('REPOSITORY_IDENTITY', `${API_ORIGIN}/repos/${ALLOWED_REPOSITORY}`, repositoryUrl);
    }
  }
}

async function requestJson(pathname, fetchImpl) {
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
  assertPayloadIdentity(payload);
  return payload;
}

function repositoryPath(suffix = '') {
  return `/repos/${ALLOWED_REPOSITORY}${suffix}`;
}

async function resolveCommit(tagName, fetchImpl) {
  const encodedTag = encodeURIComponent(tagName);
  const ref = await requestJson(repositoryPath(`/git/ref/tags/${encodedTag}`), fetchImpl);
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
    const tag = await requestJson(repositoryPath(`/git/tags/${encodeURIComponent(object.sha)}`), fetchImpl);
    object = tag?.object;
    assertCanonicalSha(object);
  }

  if (object?.type !== 'commit' || typeof object.sha !== 'string') {
    fail('RELEASE_TAG_TARGET', 'commit', object?.type ?? null);
  }
  return object.sha;
}

export async function resolveRelease({ repository, releaseRef, fetchImpl = fetch }) {
  if (repository !== ALLOWED_REPOSITORY) {
    fail('REPOSITORY_IDENTITY', ALLOWED_REPOSITORY, repository);
  }
  if (releaseRef !== undefined) parseStableRelease(releaseRef);

  const repositoryPayload = await requestJson(repositoryPath(), fetchImpl);
  if (repositoryPayload?.full_name !== ALLOWED_REPOSITORY) {
    fail('REPOSITORY_IDENTITY', ALLOWED_REPOSITORY, repositoryPayload?.full_name ?? null);
  }

  const releasePath = releaseRef
    ? repositoryPath(`/releases/tags/${encodeURIComponent(releaseRef)}`)
    : repositoryPath('/releases/latest');
  const release = await requestJson(releasePath, fetchImpl);
  if (release?.draft !== false) fail('RELEASE_DRAFT', false, release?.draft ?? null);
  if (release?.prerelease !== false) fail('RELEASE_PRERELEASE', false, release?.prerelease ?? null);
  if (releaseRef && release?.tag_name !== releaseRef) {
    fail('RELEASE_TAG_MISMATCH', releaseRef, release?.tag_name ?? null);
  }

  const tagName = release?.tag_name;
  const parsed = parseStableRelease(tagName);
  const releaseCommit = await resolveCommit(tagName, fetchImpl);
  return {
    repository: ALLOWED_REPOSITORY,
    releaseRef: tagName,
    releaseCommit,
    minorVersion: parsed.minorVersion,
  };
}

export async function assertReleaseUnmoved(resolved, fetchImpl = fetch) {
  const current = await resolveRelease({
    repository: resolved?.repository,
    releaseRef: resolved?.releaseRef,
    fetchImpl,
  });
  if (current.releaseCommit !== resolved?.releaseCommit) {
    fail('RELEASE_MOVED', resolved?.releaseCommit ?? null, current.releaseCommit);
  }
  return resolved;
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

function safeUrl(value) {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    const allowedPrefix = `/repos/${ALLOWED_REPOSITORY}`;
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
  const url = safeUrl(error?.url);
  if (url) diagnostic.url = url;
  const expected = safeScalar(error?.expected);
  if (expected !== undefined) diagnostic.expected = expected;
  const actual = safeScalar(error?.actual);
  if (actual !== undefined) diagnostic.actual = actual;
  return diagnostic;
}
