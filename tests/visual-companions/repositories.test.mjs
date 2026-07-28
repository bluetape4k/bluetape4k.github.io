import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  loadVisualCompanionRepositories,
  repositoryByFullName,
  validateVisualCompanionRepositories,
} from '../../scripts/visual-companions/lib/repositories.mjs';

const clinic = {
  repository: 'bluetape4k/clinic-appointment',
  sourceRef: '85a09e4ba16644219c15e91d94c5a4ccb7619a64',
  manifestPath: 'docs/visual-companions/manifest.json',
};

const registry = { schemaVersion: 1, repositories: [clinic] };

test('visual companion repository registry accepts the reviewed clinic revision', () => {
  const before = structuredClone(registry);
  const normalized = validateVisualCompanionRepositories(registry);

  assert.deepEqual(registry, before);
  assert.deepEqual(normalized, before);
  assert.notEqual(normalized, registry);
  assert.notEqual(normalized.repositories[0], registry.repositories[0]);
  assert.deepEqual(repositoryByFullName(normalized, clinic.repository), clinic);
  assert.throws(
    () => repositoryByFullName(normalized, 'bluetape4k/missing'),
    /VISUAL_REPOSITORY_UNKNOWN/,
  );
});

test('visual companion repository registry requires an immutable lowercase Git SHA', () => {
  for (const sourceRef of [
    'develop',
    '85A09E4BA16644219C15E91D94C5A4CCB7619A64',
    '85a09e4ba16644219c15e91d94c5a4ccb7619a6',
    'g'.repeat(40),
  ]) {
    assert.throws(
      () => validateVisualCompanionRepositories({
        ...registry,
        repositories: [{ ...clinic, sourceRef }],
      }),
      /VISUAL_SOURCE_REF/,
    );
  }
});

test('visual companion repository registry contains its manifest path', () => {
  for (const manifestPath of [
    '../manifest.json',
    '/tmp/manifest.json',
    'docs/../manifest.json',
    'docs\\manifest.json',
    'https://example.com/manifest.json',
  ]) {
    assert.throws(
      () => validateVisualCompanionRepositories({
        ...registry,
        repositories: [{ ...clinic, manifestPath }],
      }),
      /VISUAL_MANIFEST_PATH/,
    );
  }
});

test('visual companion repository registry rejects duplicates and unknown keys', () => {
  assert.throws(
    () => validateVisualCompanionRepositories({
      ...registry,
      repositories: [clinic, clinic],
    }),
    /VISUAL_REPOSITORY_DUPLICATE/,
  );
  assert.throws(
    () => validateVisualCompanionRepositories({ ...registry, extra: true }),
    /VISUAL_REGISTRY_KEYS/,
  );
  assert.throws(
    () => validateVisualCompanionRepositories({
      ...registry,
      repositories: [{ ...clinic, sourceRoot: '/tmp/clinic' }],
    }),
    /VISUAL_REPOSITORY_KEYS/,
  );
});

test('visual companion repository registry loads only local repositories.json', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'visual-repositories-'));
  const file = path.join(directory, 'repositories.json');
  await writeFile(file, JSON.stringify(registry));

  assert.deepEqual(loadVisualCompanionRepositories(new URL(`file://${file}`)), registry);
  assert.throws(
    () => loadVisualCompanionRepositories(new URL('https://example.com/repositories.json')),
    /VISUAL_REGISTRY_URL/,
  );
});
