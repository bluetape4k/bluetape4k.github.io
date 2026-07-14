import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const componentUrl = new URL('../../src/components/EcosystemAtlas.astro', import.meta.url);
const stylesheetUrl = new URL('../../src/styles/atlas.css', import.meta.url);
const atlasPageUrl = new URL('../../src/content/docs/ecosystem/atlas.mdx', import.meta.url);
const koreanAtlasPageUrl = new URL('../../src/content/docs/ko/ecosystem/atlas.mdx', import.meta.url);

test('atlas keeps accessible Kotlin and sibling-language landmarks without JavaScript', async () => {
  const source = await readFile(componentUrl, 'utf8');

  assert.match(source, /bt4k-atlas__kotlin-map/);
  assert.match(source, /bt4k-atlas__other-languages/);
  assert.match(source, /data-ecosystem="kotlin"/);
  assert.match(source, /data-ecosystem={ecosystem}/);
  assert.match(source, /<ul[^>]+bt4k-atlas__nodes/);
  assert.match(source, /<a href=/);
  assert.doesNotMatch(source, /<svg|<noscript/);
});

test('atlas renders staged lanes, relation routes, and a live detail panel', async () => {
  const source = await readFile(componentUrl, 'utf8');

  assert.match(source, /data-stage={layer}/);
  assert.match(source, /data-node-id={node\.id}/);
  assert.match(source, /data-relations={node\.relations\.join/);
  assert.match(source, /data-route-from={route\.from}/);
  assert.match(source, /data-route-to={route\.to}/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /data-default-meta=/);
  assert.match(source, /data-default-url=/);
  assert.match(source, /detailLink\.href = detail\.dataset\.defaultUrl/);
  assert.match(source, /manualUrl\(node\) \? copy\.openManual : copy\.openRepository/);
  assert.match(source, /data-link-label={primaryLabel\(node\)}/);
  assert.match(source, /data-detail-link-label/);
  assert.match(source, /href={node\.url}/);
  assert.match(source, /ResizeObserver/);
  assert.match(source, /--route-angle/);
});

test('atlas highlights relation paths without hiding content', async () => {
  const source = await readFile(componentUrl, 'utf8');

  assert.match(source, /data-active-node/);
  assert.match(source, /data-related/);
  assert.match(source, /data-dimmed/);
  assert.match(source, /pointerenter/);
  assert.match(source, /focusin/);
  assert.match(source, /selectedNode !== button\.dataset\.nodeId/);
  assert.match(source, /event\.key === 'Escape'/);
  assert.doesNotMatch(source, /element\.hidden|data-atlas-filter/);
});

test('atlas styles keyboard focus, high contrast, reduced motion, and mobile layout', async () => {
  const css = await readFile(stylesheetUrl, 'utf8');

  assert.match(css, /bt4k-atlas__kotlin-map/);
  assert.match(css, /grid-template-columns:\s*repeat\(3/);
  assert.match(css, /bt4k-atlas__routes/);
  assert.match(css, /--route-angle/);
  assert.match(css, /\[data-related\]/);
  assert.match(css, /\[data-dimmed\]/);
  assert.match(css, /bt4k-atlas__other-languages/);
  assert.match(css, /\[data-ecosystem='go'\]/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-contrast:\s*more/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@media\s*\(max-width:/);
  assert.match(css, /bt4k-atlas__routes\s*{\s*display:\s*none/);
});

test('atlas pages explain the Kotlin-first boundary and the manual drill-down', async () => {
  const [english, korean] = await Promise.all([
    readFile(atlasPageUrl, 'utf8'),
    readFile(koreanAtlasPageUrl, 'utf8'),
  ]);

  assert.match(english, /Kotlin\/JVM is the primary map/);
  assert.match(english, /Go, Rust, and Python/);
  assert.match(english, /repository → group → module → manual/);
  assert.match(korean, /Kotlin\/JVM이 중심 지도/);
  assert.match(korean, /Go, Rust, Python/);
  assert.match(korean, /저장소 → 그룹 → 모듈 → 매뉴얼/);
});
