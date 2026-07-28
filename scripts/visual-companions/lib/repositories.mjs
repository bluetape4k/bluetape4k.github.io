import { readFileSync } from 'node:fs';
import path from 'node:path';

const SOURCE_REF = /^[0-9a-f]{40}$/;
const REPOSITORY = /^bluetape4k\/[a-z0-9-]+$/;
const REGISTRY_KEYS = ['repositories', 'schemaVersion'];
const REPOSITORY_KEYS = ['manifestPath', 'repository', 'sourceRef'];

export class VisualCompanionRepositoryError extends Error {
  constructor(code, actual) {
    super(`${code}: ${String(actual)}`);
    this.name = 'VisualCompanionRepositoryError';
    this.code = code;
    this.actual = actual;
  }
}

function fail(code, actual) {
  throw new VisualCompanionRepositoryError(code, actual);
}

function assertExactKeys(value, expected, code) {
  const actual = Object.keys(value).sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    fail(code, actual.join(','));
  }
}

function manifestPath(value) {
  if (
    typeof value !== 'string'
    || value === ''
    || value.trim() !== value
    || value.includes('\\')
    || value.includes('\0')
    || path.posix.isAbsolute(value)
    || /^[a-z][a-z\d+.-]*:/i.test(value)
    || value.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')
    || path.posix.normalize(value) !== value
  ) {
    fail('VISUAL_MANIFEST_PATH', value);
  }
  return value;
}

function validateRepository(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('VISUAL_REPOSITORY', value);
  }
  assertExactKeys(value, REPOSITORY_KEYS, 'VISUAL_REPOSITORY_KEYS');

  if (typeof value.repository !== 'string' || !REPOSITORY.test(value.repository)) {
    fail('VISUAL_REPOSITORY_IDENTITY', value.repository);
  }
  if (typeof value.sourceRef !== 'string' || !SOURCE_REF.test(value.sourceRef)) {
    fail('VISUAL_SOURCE_REF', value.sourceRef);
  }

  return {
    repository: value.repository,
    sourceRef: value.sourceRef,
    manifestPath: manifestPath(value.manifestPath),
  };
}

export function validateVisualCompanionRepositories(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('VISUAL_REGISTRY', value);
  }
  assertExactKeys(value, REGISTRY_KEYS, 'VISUAL_REGISTRY_KEYS');
  if (value.schemaVersion !== 1) fail('VISUAL_REGISTRY_SCHEMA', value.schemaVersion);
  if (!Array.isArray(value.repositories) || value.repositories.length === 0) {
    fail('VISUAL_REGISTRY_ENTRIES', value.repositories);
  }

  const identities = new Set();
  const repositories = value.repositories.map((candidate) => {
    const repository = validateRepository(candidate);
    if (identities.has(repository.repository)) {
      fail('VISUAL_REPOSITORY_DUPLICATE', repository.repository);
    }
    identities.add(repository.repository);
    return repository;
  });

  return { schemaVersion: 1, repositories };
}

export function loadVisualCompanionRepositories(url) {
  if (!(url instanceof URL) || url.protocol !== 'file:' || !url.pathname.endsWith('/repositories.json')) {
    fail('VISUAL_REGISTRY_URL', url?.href ?? url);
  }
  return validateVisualCompanionRepositories(JSON.parse(readFileSync(url, 'utf8')));
}

export function repositoryByFullName(registry, fullName) {
  const normalized = validateVisualCompanionRepositories(registry);
  const repository = normalized.repositories.find((candidate) => candidate.repository === fullName);
  if (!repository) fail('VISUAL_REPOSITORY_UNKNOWN', fullName);
  return repository;
}
