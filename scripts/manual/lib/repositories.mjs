import { readFileSync } from 'node:fs';

const SLUG = /^bluetape4k-[a-z0-9-]+$/;
const MINOR = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;
const MANUAL_SOURCE_ROOT = /^docs\/manual\/[a-z0-9-]+$/;
const MANUAL_TOOLING_ROOT = /^scripts\/manual\/repositories\/[a-z0-9-]+$/;

export class ManualRepositoryError extends Error {
  constructor(code, actual) {
    super(`${code}: ${String(actual)}`);
    this.name = 'ManualRepositoryError';
    this.code = code;
    this.actual = actual;
  }
}

function fail(code, actual) {
  throw new ManualRepositoryError(code, actual);
}

function requiredText(value, code) {
  if (typeof value !== 'string' || value.length === 0 || value.trim() !== value) fail(code, value);
  return value;
}

function validateManualDescriptor(value, slug) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('REPOSITORY_MANUAL', value);

  const ownership = requiredText(value.ownership, 'REPOSITORY_MANUAL_OWNERSHIP');
  if (!['central', 'legacy'].includes(ownership)) fail('REPOSITORY_MANUAL_OWNERSHIP', ownership);

  const sourceRoot = requiredText(value.sourceRoot, 'REPOSITORY_MANUAL_SOURCE_ROOT');
  if (!MANUAL_SOURCE_ROOT.test(sourceRoot) || sourceRoot !== `docs/manual/${slug}`) {
    fail('REPOSITORY_MANUAL_SOURCE_ROOT', sourceRoot);
  }

  const toolingRoot = requiredText(value.toolingRoot, 'REPOSITORY_MANUAL_TOOLING_ROOT');
  if (!MANUAL_TOOLING_ROOT.test(toolingRoot) || toolingRoot !== `scripts/manual/repositories/${slug}`) {
    fail('REPOSITORY_MANUAL_TOOLING_ROOT', toolingRoot);
  }

  return { ownership, sourceRoot, toolingRoot };
}

function validateDescriptor(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('REPOSITORY_DESCRIPTOR', value);

  const slug = requiredText(value.slug, 'REPOSITORY_SLUG');
  if (!SLUG.test(slug)) fail('REPOSITORY_SLUG', slug);

  const repository = requiredText(value.repository, 'REPOSITORY_IDENTITY');
  if (repository !== `bluetape4k/${slug}`) fail('REPOSITORY_IDENTITY', repository);

  const latestMinor = requiredText(value.latestMinor, 'REPOSITORY_MINOR');
  if (!MINOR.test(latestMinor)) fail('REPOSITORY_MINOR', latestMinor);

  if (!value.label || typeof value.label !== 'object' || Array.isArray(value.label)) {
    fail('REPOSITORY_LABEL', value.label);
  }
  const label = {
    en: requiredText(value.label.en, 'REPOSITORY_LABEL'),
    ko: requiredText(value.label.ko, 'REPOSITORY_LABEL'),
  };

  if (!value.route || typeof value.route !== 'object' || Array.isArray(value.route)) {
    fail('REPOSITORY_ROUTE', value.route);
  }
  const route = {
    en: requiredText(value.route.en, 'REPOSITORY_ROUTE'),
    ko: requiredText(value.route.ko, 'REPOSITORY_ROUTE'),
  };
  if (route.en !== `/manual/${slug}/` || route.ko !== `/ko/manual/${slug}/`) {
    fail('REPOSITORY_ROUTE', `${route.en} | ${route.ko}`);
  }

  const manual = value.manual === undefined ? undefined : validateManualDescriptor(value.manual, slug);
  return { slug, repository, label, latestMinor, route, ...(manual ? { manual } : {}) };
}

export function validateRepositoryRegistry(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('REPOSITORY_REGISTRY', value);
  if (value.schema !== 1) fail('REPOSITORY_REGISTRY_SCHEMA', value.schema);
  if (!Array.isArray(value.repositories) || value.repositories.length === 0) {
    fail('REPOSITORY_REGISTRY_ENTRIES', value.repositories);
  }

  const slugs = new Set();
  const identities = new Set();
  const routes = new Set();
  for (const candidate of value.repositories) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      fail('REPOSITORY_DESCRIPTOR', candidate);
    }
    if (slugs.has(candidate.slug)) fail('REPOSITORY_DUPLICATE_SLUG', candidate.slug);
    if (identities.has(candidate.repository)) fail('REPOSITORY_DUPLICATE_IDENTITY', candidate.repository);
    slugs.add(candidate.slug);
    identities.add(candidate.repository);
    for (const route of Object.values(candidate.route ?? {})) {
      if (routes.has(route)) fail('REPOSITORY_DUPLICATE_ROUTE', route);
      routes.add(route);
    }
  }

  const repositories = value.repositories.map(validateDescriptor);

  return { schema: 1, repositories };
}

export function loadRepositoryRegistry(url) {
  if (!(url instanceof URL) || url.protocol !== 'file:' || !url.pathname.endsWith('/repositories.json')) {
    fail('REPOSITORY_REGISTRY_URL', url?.href ?? url);
  }
  return validateRepositoryRegistry(JSON.parse(readFileSync(url, 'utf8')));
}

export function repositoryBySlug(registry, slug) {
  const normalized = validateRepositoryRegistry(registry);
  const repository = normalized.repositories.find((candidate) => candidate.slug === slug);
  if (!repository) fail('REPOSITORY_UNKNOWN', slug);
  return repository;
}

export function repositoryByFullName(registry, fullName) {
  const normalized = validateRepositoryRegistry(registry);
  const repository = normalized.repositories.find((candidate) => candidate.repository === fullName);
  if (!repository) fail('REPOSITORY_UNKNOWN', fullName);
  return repository;
}
