import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

import { projectsNetCdfDataModelCompanion } from '../../src/data/visual-companions/wave2-projects-netcdf-data-model.mjs';

const root = resolve(import.meta.dirname, '../..');
const locales = ['en', 'ko'];
const route = 'bluetape4k-projects/projects-netcdf-data-model';

test('Issue #426 model explains one NetCDF container through shapes, domains, and a use loop', () => {
  assert.equal(projectsNetCdfDataModelCompanion.issue, '426');
  assert.equal(projectsNetCdfDataModelCompanion.parentIssue, '418');
  assert.equal(projectsNetCdfDataModelCompanion.repository, 'bluetape4k-projects');
  assert.equal(projectsNetCdfDataModelCompanion.slug, 'projects-netcdf-data-model');
  assert.equal(projectsNetCdfDataModelCompanion.sourceRevision, '8165a8989e0075e7c17c489bf3000bf41fef8232');
  assert.deepEqual(projectsNetCdfDataModelCompanion.phases.map(({ id }) => id), [
    'container', 'dimensions', 'variables', 'coordinates', 'shapes', 'domains', 'use',
  ]);
  assert.deepEqual(projectsNetCdfDataModelCompanion.domains.map(({ id }) => id), [
    'weather-climate', 'ocean', 'satellite', 'hydrology', 'geoscience',
  ]);
  assert.equal(projectsNetCdfDataModelCompanion.visuals.length, 7);
  assert.equal(projectsNetCdfDataModelCompanion.usage.length, 4);
  assert.equal(projectsNetCdfDataModelCompanion.sources.length, 5);
});

test('Issue #426 locale data remains equivalent and keeps the general/subset boundary explicit', () => {
  for (const phase of projectsNetCdfDataModelCompanion.phases) {
    for (const field of ['title', 'question', 'example', 'reason', 'result']) {
      assert.deepEqual(Object.keys(phase[field]).sort(), ['en', 'ko']);
      assert.ok(phase[field].en.length > 20, `${phase.id}:${field}:en`);
      assert.ok(phase[field].ko.length > 15, `${phase.id}:${field}:ko`);
    }
  }
  for (const domain of projectsNetCdfDataModelCompanion.domains) {
    for (const field of ['label', 'discipline', 'shape', 'variables', 'question', 'output']) {
      assert.deepEqual(Object.keys(domain[field]).sort(), ['en', 'ko']);
      assert.ok(domain[field].en.length > 5, `${domain.id}:${field}:en`);
      assert.ok(domain[field].ko.length > 2, `${domain.id}:${field}:ko`);
    }
  }
  assert.match(projectsNetCdfDataModelCompanion.currentImplementation.detail.en, /rank 1–4/);
  assert.match(projectsNetCdfDataModelCompanion.currentImplementation.boundary.en, /every NetCDF-4 feature/);
  assert.match(JSON.stringify(projectsNetCdfDataModelCompanion), /CF/);
  assert.match(JSON.stringify(projectsNetCdfDataModelCompanion), /unlimited/);
});

test('Issue #426 generators keep interactive routes, SVG ledgers, and the wave README current', () => {
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-projects-netcdf-data-model-interactive.mjs', '--check'], { cwd: root });
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-projects-netcdf-data-model-visuals.mjs', '--check'], { cwd: root });
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-visuals.mjs', '--check'], { cwd: root });
});

for (const locale of locales) {
  test(`#426 ${locale} route exposes seven detailed phases, five domain lenses, playback, and provenance`, async () => {
    const prefix = locale === 'ko' ? 'ko/' : '';
    const html = await readFile(resolve(root, 'public', prefix, 'visual-companions', route, 'index.html'), 'utf8');
    assert.match(html, new RegExp(`<html lang="${locale}">`));
    assert.match(html, /id="bt4k-issue-426"/);
    assert.equal((html.match(/data-phase-button=/g) ?? []).length, 7);
    assert.equal((html.match(/data-domain-button=/g) ?? []).length, 5);
    for (const action of ['reset', 'play', 'next']) assert.match(html, new RegExp(`data-action="${action}"`));
    for (const field of ['question', 'example', 'reason', 'result']) assert.match(html, new RegExp(`data-phase-${field}`));
    for (const field of ['shape', 'variables', 'output']) assert.match(html, new RegExp(`data-domain-${field}`));
    assert.equal((html.match(/data-theme-button=/g) ?? []).length, 3);
    assert.match(html, /prefers-reduced-motion/);
    assert.match(html, /aria-live="polite"/);
    assert.match(html, /issues\/426/);
    assert.match(html, /issues\/418/);
    assert.doesNotMatch(html, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
    for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script, { filename: `issue-426-${locale}.js` });
    if (locale === 'en') assert.doesNotMatch(html, /[가-힣]/);
  });

  test(`#426 ${locale} static asset and ledger cover the model-to-domain architecture`, async () => {
    const suffix = locale === 'ko' ? 'ko' : 'en';
    const svg = await readFile(resolve(root, `public/assets/visual-companions/wave2/projects-netcdf-data-model-${suffix}.svg`), 'utf8');
    const ledger = JSON.parse(await readFile(resolve(root, `docs/diagrams/visual-companions-wave2/projects-netcdf-data-model-${suffix}.semantic.json`), 'utf8'));
    await access(resolve(root, `public/assets/visual-companions/wave2/projects-netcdf-data-model-${suffix}.png`));
    assert.match(svg, /width="1800"/);
    assert.match(svg, /height="5200"/);
    assert.match(svg, /data-intent="source-backed scientific data model explainer"/);
    for (const id of ['container', 'dimensions', 'variables', 'attributes', 'coordinates', 'series', 'field', 'volume', 'cube', 'domain-1', 'domain-2', 'domain-3', 'domain-4', 'domain-5', 'use-1', 'use-4']) assert.match(svg, new RegExp(`id="${id}"`));
    assert.ok((svg.match(/data-connector=/g) ?? []).length >= 12);
    assert.doesNotMatch(svg, /undefined/);
    assert.equal(ledger.source.revision, projectsNetCdfDataModelCompanion.sourceRevision);
    assert.equal(ledger.kind, 'architecture');
    assert.equal(ledger.nodes.length, 15);
    assert.equal(ledger.edges.length, 14);
    assert.equal(ledger.behavior.branches, 1);
    assert.equal(ledger.behavior.loops, 0);
  });
}

test('Issue #426 wave README exposes PNG fallbacks and both locale routes', async () => {
  const readme = await readFile(resolve(root, 'public/assets/visual-companions/wave2/README.md'), 'utf8');
  assert.match(readme, /#426/);
  assert.match(readme, /projects-netcdf-data-model-en\.png/);
  assert.match(readme, /projects-netcdf-data-model-ko\.png/);
  assert.match(readme, /\/visual-companions\/bluetape4k-projects\/projects-netcdf-data-model\//);
  assert.match(readme, /\/ko\/visual-companions\/bluetape4k-projects\/projects-netcdf-data-model\//);
});
