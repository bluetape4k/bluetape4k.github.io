import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

import { projectsNetCdfProgressCompanion } from '../../src/data/visual-companions/wave2-projects-netcdf-progress.mjs';

const root = resolve(import.meta.dirname, '../..');
const locales = ['en', 'ko'];
const route = 'bluetape4k-projects/projects-netcdf-cf-progress';

test('Issue #418 model fixes the source, lanes, scenarios, frames, limits, and progress states', () => {
  assert.equal(projectsNetCdfProgressCompanion.issue, '418');
  assert.equal(projectsNetCdfProgressCompanion.repository, 'bluetape4k-projects');
  assert.equal(projectsNetCdfProgressCompanion.slug, 'projects-netcdf-cf-progress');
  assert.equal(projectsNetCdfProgressCompanion.sourceRevision, '8165a8989e0075e7c17c489bf3000bf41fef8232');
  assert.deepEqual(projectsNetCdfProgressCompanion.lanes, ['coordinates', 'boundedImport', 'progress']);
  assert.deepEqual(
    projectsNetCdfProgressCompanion.scenarios.map(({ id }) => id),
    ['normal-2d', 'one-dimensional-axes', 'invalid-coordinate-crs', 'duplicate-preflight', 'timeout-worker-terminated', 'timeout-worker-alive', 'lease-conflict-resume'],
  );
  assert.deepEqual(
    projectsNetCdfProgressCompanion.frames.map(({ id }) => id),
    ['before-registration', 'register', 'axes', 'cf-bind', 'validate', 'tile-plan', 'duplicate-preflight', 'batch-write', 'slice-checkpoint', 'timeout-worker-check', 'terminal-retry'],
  );
  assert.deepEqual(projectsNetCdfProgressCompanion.progressStates, ['missing', 'pending', 'in-progress', 'completed', 'failed']);
  assert.deepEqual(projectsNetCdfProgressCompanion.limits, {
    nameBytes: 128,
    coordinateTokens: 32,
    auxiliaryAxes: 16,
    variables: 1024,
    dimensions: 256,
    metadataBytes: 1024 * 1024,
    fileBytes: 64 * 1024 ** 3,
    cells: 100_000_000,
    sliceCells: 1_000_000,
    tileCells: 65_536,
    batchRows: 1000,
    auxiliaryJsonBytes: 8192,
    coordinateCacheBytes: 64 * 1024 ** 2,
    duplicateSetBytes: 32 * 1024 ** 2,
    ownedWorkingSetBytes: 128 * 1024 ** 2,
  });
});

test('Issue #418 locale copy stays detailed and structurally equivalent in every lane', () => {
  const serialized = JSON.stringify(projectsNetCdfProgressCompanion);
  for (const token of [
    'fileKey|size|lastModifiedTime',
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED',
    'SRID 4326',
    'lastSliceIdx + 1',
    '100,000,000',
    '65,536',
    '1,000',
    'caller',
  ]) assert.match(serialized, new RegExp(token.replace(/[|+]/g, '\\$&')));

  for (const frame of projectsNetCdfProgressCompanion.frames) {
    for (const laneName of projectsNetCdfProgressCompanion.lanes) {
      const lane = frame[laneName];
      assert.deepEqual(Object.keys(lane).sort(), ['action', 'budget', 'guard', 'next'].sort());
      for (const [fieldName, field] of Object.entries(lane)) {
        assert.deepEqual(Object.keys(field).sort(), locales, `${frame.id}:${laneName}:${fieldName}`);
        assert.ok(field.en.length > 18, `${frame.id}:${laneName}:${fieldName}:en`);
        assert.ok(field.ko.length > 12, `${frame.id}:${laneName}:${fieldName}:ko`);
      }
    }
  }

  assert.ok(projectsNetCdfProgressCompanion.ownership.library.en.length > 40);
  assert.ok(projectsNetCdfProgressCompanion.ownership.caller.en.length > 40);
  assert.equal(projectsNetCdfProgressCompanion.sources.length, 4);
});

test('Issue #418 generators keep committed interactive and static outputs current', () => {
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-projects-netcdf-interactive.mjs', '--check'], { cwd: root });
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-projects-netcdf-visuals.mjs', '--check'], { cwd: root });
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-visuals.mjs', '--check'], { cwd: root });
});

for (const locale of locales) {
  test(`#418 ${locale} route exposes scenarios, playback, three detailed lanes, theme, and provenance`, async () => {
    const prefix = locale === 'ko' ? 'ko/' : '';
    const html = await readFile(resolve(root, 'public', prefix, 'visual-companions', route, 'index.html'), 'utf8');
    assert.match(html, new RegExp(`<html lang="${locale}">`));
    assert.match(html, /id="bt4k-issue-418"/);
    assert.equal((html.match(/data-scenario-button=/g) ?? []).length, 7);
    assert.match(html, /data-action="reset"/);
    assert.match(html, /data-action="play"/);
    assert.match(html, /data-action="next"/);
    assert.match(html, /data-lane="coordinates"/);
    assert.match(html, /data-lane="boundedImport"/);
    assert.match(html, /data-lane="progress"/);
    assert.match(html, /data-detail="action"/);
    assert.match(html, /data-detail="guard"/);
    assert.match(html, /data-detail="next"/);
    assert.match(html, /data-detail="budget"/);
    assert.equal((html.match(/data-theme-button=/g) ?? []).length, 3);
    assert.match(html, /prefers-reduced-motion/);
    assert.match(html, /aria-live="polite"/);
    assert.match(html, /issues\/418/);
    assert.doesNotMatch(html, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);

    for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
      new vm.Script(script, { filename: `issue-418-${locale}.js` });
    }
    if (locale === 'en') assert.doesNotMatch(html, /[가-힣]/);
  });

  test(`#418 ${locale} static asset and semantic ledger preserve the three-lane workflow`, async () => {
    const suffix = locale === 'ko' ? 'ko' : 'en';
    const svg = await readFile(resolve(root, `public/assets/visual-companions/wave2/projects-netcdf-cf-progress-${suffix}.svg`), 'utf8');
    const ledger = JSON.parse(await readFile(resolve(root, `docs/diagrams/visual-companions-wave2/projects-netcdf-cf-progress-${suffix}.semantic.json`), 'utf8'));
    assert.match(svg, /width="1800"/);
    assert.match(svg, /height="4400"/);
    assert.match(svg, /data-lane="coordinates"/);
    assert.match(svg, /data-lane="boundedImport"/);
    assert.match(svg, /data-lane="progress"/);
    assert.match(svg, /one worker \/ one DB connection|worker 하나 \/ DB connection 하나/);
    assert.equal(ledger.source.revision, projectsNetCdfProgressCompanion.sourceRevision);
    assert.equal(ledger.kind, 'workflow');
    assert.ok(ledger.nodes.length <= 10);
    assert.ok(ledger.nodes.length >= 8);
    assert.ok(ledger.edges.length >= 9);
    assert.equal(ledger.behavior.loops, 1);
  });
}
