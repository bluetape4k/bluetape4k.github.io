import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const componentUrl = new URL('../../src/components/EcosystemAtlas.astro', import.meta.url);
const stylesheetUrl = new URL('../../src/styles/atlas.css', import.meta.url);

test('atlas keeps an accessible hierarchical list available without JavaScript', async () => {
  const source = await readFile(componentUrl, 'utf8');

  assert.match(source, /<nav[^>]+aria-label=/);
  assert.match(source, /<ul[^>]+bt4k-atlas__nodes/);
  assert.match(source, /<a href=/);
  assert.doesNotMatch(source, /<svg|<noscript/);
});

test('atlas exposes Build, Learn, and Apply filter state', async () => {
  const source = await readFile(componentUrl, 'utf8');

  assert.match(source, /data-atlas-filter=/);
  assert.match(source, /aria-pressed="true"/);
  assert.match(source, /node\.layer/);
  assert.match(source, /node\.type/);
  assert.match(source, /element\.hidden/);
});

test('atlas styles keyboard focus, high contrast, reduced motion, and mobile layout', async () => {
  const css = await readFile(stylesheetUrl, 'utf8');

  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-contrast:\s*more/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@media\s*\(max-width:/);
});
