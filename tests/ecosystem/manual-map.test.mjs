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

test('manual title links public release provenance without claiming a document source', async () => {
  const source = await readFile(new URL('../../src/components/ManualPageTitle.astro', import.meta.url), 'utf8');
  assert.match(source, /data\.manual/);
  assert.match(source, /releaseRef/);
  assert.match(source, /releases\/tag/);
  assert.match(source, /bt4k-manual-provenance/);
  assert.doesNotMatch(source, /sourcePath|githubSourceUrlFor|kind:\s*'blob'/);
  assert.match(source, /DefaultPageTitle/);
});

test('ecosystem atlas prefers localized manual roots while preserving GitHub', async () => {
  const [source, catalogBytes] = await Promise.all([
    readFile(new URL('../../src/components/EcosystemAtlas.astro', import.meta.url), 'utf8'),
    readFile(new URL('../../src/data/ecosystem/catalog.json', import.meta.url), 'utf8'),
  ]);
  const catalog = JSON.parse(catalogBytes);
  const routes = Object.fromEntries(catalog.nodes.filter(({ manualRoute }) => manualRoute).map(({ id, manualRoute }) => [id, manualRoute]));
  assert.deepEqual(routes, {
    'bluetape4k-projects': '/manual/bluetape4k-projects/',
    'bluetape4k-exposed': '/manual/bluetape4k-exposed/',
    'bluetape4k-aws': '/manual/bluetape4k-aws/',
    'bluetape4k-leader': '/manual/bluetape4k-leader/',
    'bluetape4k-image': '/manual/bluetape4k-image/',
  });
  assert.match(source, /locale === 'ko' \? '\/ko' : ''/);
  assert.match(source, /primaryUrl\(node\)/);
  assert.match(source, /href={node\.url}/);
});
