import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { buildStory, tenant } from '../../src/data/visual-companions/wave2-tenant-context.mjs';

const root = new URL('../../', import.meta.url).pathname;

test('tenant model pins four carriers and six comparable scenarios', () => {
  assert.equal(tenant.repository, 'bluetape4k-projects');
  assert.equal(tenant.sourceRevision, '5954b6329a3e11c70ef12b6d4bd8480e7b38be1b');
  assert.deepEqual(tenant.carriers.map(({ id }) => id), ['threadlocal', 'scoped', 'reactor', 'ktor']);
  assert.deepEqual(tenant.scenarios.map(({ id }) => id), ['normal', 'nested', 'missing', 'error', 'cancel', 'handoff']);
  assert.equal(tenant.sources.length >= 4, true);
  for (const carrier of tenant.carriers) {
    for (const key of ['owner', 'install', 'read', 'cleanup', 'boundary']) {
      assert.equal(typeof carrier[key].en, 'string');
      assert.equal(typeof carrier[key].ko, 'string');
    }
  }
});

test('nested stories preserve each carrier contract', () => {
  assert.deepEqual(buildStory('threadlocal', 'nested').steps.map(({ visible }) => visible), [
    'tenant=clinic-a', 'tenant=clinic-b', 'tenant=clinic-a', 'no tenant',
  ]);
  assert.equal(buildStory('threadlocal', 'nested').status, 'RESTORED');
  assert.equal(buildStory('scoped', 'handoff').status, 'PARTIAL_INHERITANCE');
  assert.match(buildStory('scoped', 'handoff').steps[1].visible, /clinic-a/);
  assert.match(buildStory('scoped', 'handoff').steps[2].visible, /no tenant/);
  assert.equal(buildStory('reactor', 'nested').after, 'outer context=clinic-a');
  assert.match(buildStory('reactor', 'nested').steps[1].text.en, /without mutating outer/);
  assert.equal(buildStory('ktor', 'nested').status, 'DUPLICATE_REJECTED');
  assert.match(buildStory('ktor', 'nested').steps[1].text.en, /TenantAlreadyBoundException/);
});

test('missing and unsupported cancellation states fail closed', () => {
  for (const { id: carrier } of tenant.carriers) {
    const missing = buildStory(carrier, 'missing');
    assert.equal(missing.status, 'MISSING');
    assert.match(missing.steps.at(-1).text.en, /MissingTenantContextException/);
    assert.match(missing.steps.at(-1).visible, /no tenant/);
  }
  for (const carrier of ['threadlocal', 'scoped']) {
    const cancellation = buildStory(carrier, 'cancel');
    assert.equal(cancellation.status, 'UNSUPPORTED_COROUTINE_CANCELLATION');
    assert.match(cancellation.outcome.en, /unsupported/);
    assert.match(cancellation.steps[1].text.en, /non-suspending/);
  }
  assert.equal(buildStory('reactor', 'cancel').status, 'CANCELLED_AND_ISOLATED');
  assert.equal(buildStory('ktor', 'cancel').status, 'CANCELLED_AND_RETAINED');
});

test('all carrier and scenario stories have complete bilingual step contracts', () => {
  for (const carrier of tenant.carriers) {
    for (const scenario of tenant.scenarios) {
      const story = buildStory(carrier.id, scenario.id);
      assert.ok(story.steps.length >= 1);
      assert.equal(typeof story.outcome.en, 'string');
      assert.equal(typeof story.outcome.ko, 'string');
      assert.equal(typeof story.status, 'string');
      assert.equal(typeof story.after, 'string');
      assert.equal(new Set(story.steps.map(({ id }) => id)).size, story.steps.length);
      for (const item of story.steps) {
        for (const key of ['id', 'visible', 'owner']) assert.equal(typeof item[key], 'string');
        for (const locale of ['en', 'ko']) {
          assert.equal(typeof item.title[locale], 'string');
          assert.equal(typeof item.text[locale], 'string');
        }
      }
    }
  }
  assert.throws(() => buildStory('unknown', 'normal'), RangeError);
  assert.throws(() => buildStory('threadlocal', 'unknown'), RangeError);
});

test('generated bilingual explorers are offline runnable and expose the workflow contract', () => {
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-tenant-context.mjs', '--check'], { cwd: root });
  for (const locale of ['en', 'ko']) {
    const prefix = locale === 'ko' ? 'ko/' : '';
    const path = `public/${prefix}visual-companions/${tenant.repository}/${tenant.slug}/index.html`;
    assert.equal(existsSync(`${root}/${path}`), true);
    const html = readFileSync(`${root}/${path}`, 'utf8');
    assert.match(html, new RegExp(`<html lang="${locale}">`));
    assert.match(html, /id="tenant-explorer"/);
    assert.match(html, /workflowReady/);
    assert.equal((html.match(/data-carrier="/g) || []).length, tenant.carriers.length);
    assert.equal((html.match(/data-theme-button="/g) || []).length, 3);
    assert.match(html, /prefers-reduced-motion/);
    assert.doesNotMatch(html, /undefined/);
    assert.doesNotMatch(html, /fonts\.googleapis\.com/);
    assert.doesNotMatch(html, /\b(?:fetch|WebSocket|XMLHttpRequest)\s*\(/);
    for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script);
  }
});
