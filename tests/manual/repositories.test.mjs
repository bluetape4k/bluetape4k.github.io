import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  loadRepositoryRegistry,
  repositoryByFullName,
  repositoryBySlug,
  validateRepositoryRegistry,
} from '../../scripts/manual/lib/repositories.mjs';

const projects = {
  slug: 'bluetape4k-projects',
  repository: 'bluetape4k/bluetape4k-projects',
  label: { en: 'Bluetape4k docs', ko: 'Bluetape4k 문서' },
  latestMinor: '1.11',
  route: { en: '/manual/bluetape4k-projects/', ko: '/ko/manual/bluetape4k-projects/' },
};

const exposed = {
  slug: 'bluetape4k-exposed',
  repository: 'bluetape4k/bluetape4k-exposed',
  label: { en: 'Exposed docs', ko: 'Exposed 문서' },
  latestMinor: '1.11',
  route: { en: '/manual/bluetape4k-exposed/', ko: '/ko/manual/bluetape4k-exposed/' },
};

const registry = { schema: 1, repositories: [projects, exposed] };

test('validates and clones an approved repository registry', () => {
  const before = structuredClone(registry);
  const normalized = validateRepositoryRegistry(registry);

  assert.deepEqual(registry, before);
  assert.deepEqual(normalized, before);
  assert.notEqual(normalized, registry);
  assert.notEqual(normalized.repositories[0], registry.repositories[0]);
  assert.equal(repositoryBySlug(normalized, exposed.slug).repository, exposed.repository);
  assert.equal(repositoryByFullName(normalized, projects.repository).slug, projects.slug);
  assert.throws(() => repositoryBySlug(normalized, 'bluetape4k-missing'), /REPOSITORY_UNKNOWN/);
  assert.throws(() => repositoryByFullName(normalized, 'bluetape4k/missing'), /REPOSITORY_UNKNOWN/);
});

test('rejects duplicate identity and route authority', () => {
  assert.throws(() => validateRepositoryRegistry({
    ...registry,
    repositories: [projects, { ...exposed, slug: projects.slug }],
  }), /REPOSITORY_DUPLICATE_SLUG/);
  assert.throws(() => validateRepositoryRegistry({
    ...registry,
    repositories: [projects, { ...exposed, repository: projects.repository }],
  }), /REPOSITORY_DUPLICATE_IDENTITY/);
  assert.throws(() => validateRepositoryRegistry({
    ...registry,
    repositories: [projects, { ...exposed, route: { ...exposed.route, en: projects.route.en } }],
  }), /REPOSITORY_DUPLICATE_ROUTE/);
});

test('rejects unsupported identities, versions, labels, and route slugs', () => {
  assert.throws(() => validateRepositoryRegistry({
    ...registry,
    repositories: [{ ...exposed, repository: 'fork/bluetape4k-exposed' }],
  }), /REPOSITORY_IDENTITY/);
  assert.throws(() => validateRepositoryRegistry({
    ...registry,
    repositories: [{ ...exposed, latestMinor: '1.11.0' }],
  }), /REPOSITORY_MINOR/);
  assert.throws(() => validateRepositoryRegistry({
    ...registry,
    repositories: [{ ...exposed, label: { en: 'Exposed docs' } }],
  }), /REPOSITORY_LABEL/);
  assert.throws(() => validateRepositoryRegistry({
    ...registry,
    repositories: [{ ...exposed, route: { ...exposed.route, ko: '/ko/manual/bluetape4k-projects/' } }],
  }), /REPOSITORY_ROUTE/);
});

test('loads only a local JSON registry through the same validator', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'manual-repositories-'));
  const file = path.join(directory, 'repositories.json');
  await writeFile(file, JSON.stringify(registry));
  const loaded = loadRepositoryRegistry(new URL(`file://${file}`));
  assert.deepEqual(loaded, registry);
  assert.throws(() => loadRepositoryRegistry(new URL('https://example.com/repositories.json')), /REPOSITORY_REGISTRY_URL/);
});
