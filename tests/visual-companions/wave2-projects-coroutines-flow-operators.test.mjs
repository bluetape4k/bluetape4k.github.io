import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

import { projectsCoroutinesFlowOperatorsCompanion } from '../../src/data/visual-companions/wave2-projects-coroutines-flow-operators.mjs';

const root = resolve(import.meta.dirname, '../..');
const locales = ['en', 'ko'];
const route = 'bluetape4k-projects/projects-coroutines-flow-operators';

test('Issue #430 model fixes six families and sixty-six marble-suitable reactive operators', () => {
  const companion = projectsCoroutinesFlowOperatorsCompanion;
  assert.equal(companion.issue, '430');
  assert.equal(companion.repository, 'bluetape4k-projects');
  assert.equal(companion.slug, 'projects-coroutines-flow-operators');
  assert.equal(companion.sourceRevision, '8165a8989e0075e7c17c489bf3000bf41fef8232');
  assert.deepEqual(companion.families.map(({ id, operators }) => [id, operators.length]), [
    ['transform', 7],
    ['admission', 9],
    ['time', 17],
    ['combine', 13],
    ['async', 10],
    ['error', 10],
  ]);
  assert.equal(companion.families.flatMap(({ operators }) => operators).length, 66);
});

test('Issue #430 operator data keeps locale detail, sample lanes, and four-step playback', () => {
  for (const family of projectsCoroutinesFlowOperatorsCompanion.families) {
    assert.deepEqual(Object.keys(family.label).sort(), locales);
    assert.deepEqual(Object.keys(family.description).sort(), locales);
    for (const operator of family.operators) {
      assert.ok(operator.receiver.length > 2, `${operator.name}:receiver`);
      assert.match(operator.signature, /[({]/, `${operator.name}:signature`);
      assert.deepEqual(Object.keys(operator.summary).sort(), locales);
      assert.deepEqual(Object.keys(operator.rule).sort(), locales);
      assert.ok(operator.summary.en.length > 20, `${operator.name}:summary:en`);
      assert.ok(operator.summary.ko.length > 10, `${operator.name}:summary:ko`);
      assert.equal(operator.steps.en.length, 4, `${operator.name}:steps:en`);
      assert.equal(operator.steps.ko.length, 4, `${operator.name}:steps:ko`);
      assert.ok(operator.inputs.length >= 1, `${operator.name}:inputs`);
      assert.ok(operator.outputs.length >= 1, `${operator.name}:outputs`);
    }
  }
});

test('Issue #430 excludes builders, collection materializers, and Subjects helpers', () => {
  const names = projectsCoroutinesFlowOperatorsCompanion.families.flatMap(({ operators }) => operators.map(({ name }) => name));
  for (const excluded of ['intFlowOf', 'flowRangeOf', 'toFastList', 'toUnifiedMap', 'publishSubject', 'behaviorSubject']) {
    assert.ok(!names.includes(excluded), excluded);
  }
});

test('Issue #430 generators keep interactive routes, static assets, ledgers, and wave README current', () => {
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-projects-coroutines-flow-operators-interactive.mjs', '--check'], { cwd: root });
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-projects-coroutines-flow-operators-visuals.mjs', '--check'], { cwd: root });
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-visuals.mjs', '--check'], { cwd: root });
});

for (const locale of locales) {
  test(`#430 ${locale} route exposes every family and operator with independent playback`, async () => {
    const prefix = locale === 'ko' ? 'ko/' : '';
    const html = await readFile(resolve(root, 'public', prefix, 'visual-companions', route, 'index.html'), 'utf8');
    assert.match(html, new RegExp(`<html lang="${locale}">`));
    assert.match(html, /id="bt4k-issue-430"/);
    assert.equal((html.match(/<section class="family-section" data-family-section=/g) ?? []).length, 6);
    assert.equal((html.match(/data-operator-button=/g) ?? []).length, 66);
    assert.equal((html.match(/<button type="button" class="btn btn-primary" data-action="play"/g) ?? []).length, 6);
    assert.equal((html.match(/data-action="next"/g) ?? []).length, 6);
    assert.equal((html.match(/data-action="reset"/g) ?? []).length, 6);
    assert.match(html, /grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(260px,\s*1fr\)\)/);
    assert.match(html, /white-space:\s*nowrap/);
    assert.match(html, /prefers-reduced-motion/);
    assert.match(html, /aria-live="polite"/);
    assert.match(html, /issues\/430/);
    assert.match(html, /8165a8989e0075e7c17c489bf3000bf41fef8232/);
    assert.doesNotMatch(html, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
    for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script, { filename: `issue-430-${locale}.js` });
    if (locale === 'en') assert.doesNotMatch(html, /[가-힣]/);
  });

  test(`#430 ${locale} static fallback and semantic ledger cover all six families`, async () => {
    const svg = await readFile(resolve(root, `public/assets/visual-companions/wave2/projects-coroutines-flow-operators-${locale}.svg`), 'utf8');
    const ledger = JSON.parse(await readFile(resolve(root, `docs/diagrams/visual-companions-wave2/projects-coroutines-flow-operators-${locale}.semantic.json`), 'utf8'));
    await access(resolve(root, `public/assets/visual-companions/wave2/projects-coroutines-flow-operators-${locale}.png`));
    assert.match(svg, /width="1800"/);
    assert.match(svg, /height="5200"/);
    assert.match(svg, /data-intent="source-backed Flow operator marble explorer fallback"/);
    for (const id of ['transform', 'admission', 'time', 'combine', 'async', 'error']) assert.match(svg, new RegExp(`id="family-${id}"`));
    assert.equal(ledger.source.revision, projectsCoroutinesFlowOperatorsCompanion.sourceRevision);
    assert.equal(ledger.kind, 'marble-diagram-catalog');
    assert.equal(ledger.nodes.length, 66);
    assert.equal(ledger.groups.length, 6);
  });
}

test('Issue #430 wave README exposes fallback pairs and both locale routes', async () => {
  const readme = await readFile(resolve(root, 'public/assets/visual-companions/wave2/README.md'), 'utf8');
  assert.match(readme, /#430/);
  assert.match(readme, /projects-coroutines-flow-operators-en\.png/);
  assert.match(readme, /projects-coroutines-flow-operators-ko\.png/);
  assert.match(readme, /\/visual-companions\/bluetape4k-projects\/projects-coroutines-flow-operators\//);
  assert.match(readme, /\/ko\/visual-companions\/bluetape4k-projects\/projects-coroutines-flow-operators\//);
});
