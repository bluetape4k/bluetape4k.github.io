import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('projects map renders group to module to localized manual route', async () => {
  const source = await readFile(new URL('../../src/components/ProjectsManualMap.astro', import.meta.url), 'utf8');
  assert.match(source, /groups\.map/);
  assert.match(source, /modules\.map/);
  assert.match(source, /module\.routes\[locale\]/);
  assert.match(source, /<details/);
});

test('manual title exposes immutable source metadata only when present', async () => {
  const source = await readFile(new URL('../../src/components/ManualPageTitle.astro', import.meta.url), 'utf8');
  assert.match(source, /data\.manual/);
  assert.match(source, /sourceCommit/);
  assert.match(source, /DefaultPageTitle/);
});
