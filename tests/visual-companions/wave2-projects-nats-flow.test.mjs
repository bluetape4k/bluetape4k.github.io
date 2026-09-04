import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

import { projectsNatsFlowCompanion } from '../../src/data/visual-companions/wave2-projects-nats-flow.mjs';

const root = resolve(import.meta.dirname, '../..');
const locales = ['en', 'ko'];
const route = 'bluetape4k-projects/projects-nats-jetstream-flow';

test('Issue #419 model fixes the cold Flow, bounded intake, and caller policy contract', () => {
  assert.equal(projectsNatsFlowCompanion.issue, '419');
  assert.equal(projectsNatsFlowCompanion.repository, 'bluetape4k-projects');
  assert.equal(projectsNatsFlowCompanion.slug, 'projects-nats-jetstream-flow');
  assert.equal(projectsNatsFlowCompanion.sourceRevision, '0ba5b8699a58a94ad30f6aa31936e043dca533f6');
  assert.deepEqual(projectsNatsFlowCompanion.participants.map(({ id }) => id), ['caller', 'flow', 'adapter', 'nats']);
  assert.deepEqual(projectsNatsFlowCompanion.scenarios.map(({ id }) => id), [
    'normal', 'backpressure-drop', 'redelivery', 'cancellation', 'manual-term',
  ]);
  assert.deepEqual(projectsNatsFlowCompanion.frames.map(({ id }) => id), [
    'cold', 'collect', 'converge', 'bounded', 'deliver', 'ack', 'redelivery', 'drop', 'cancel', 'terminal',
  ]);
  assert.equal(projectsNatsFlowCompanion.frames.length, 10);
  assert.equal(projectsNatsFlowCompanion.sources.length, 5);
});

test('Issue #419 locale data remains equivalent and keeps acknowledgement ownership explicit', () => {
  const serialized = JSON.stringify(projectsNatsFlowCompanion);
  for (const token of [
    'JetStream.consumeAsFlow', 'ConsumerContext.consumeAsFlow', 'Flow<Message>', 'channelFlow.buffer(capacity)',
    'capacity + 1', 'droppedCount', 'NatsConsumerFlowException', 'PublishAck', 'durable consumer',
    'ack()', 'nak()', 'term()', 'at-least-once', 'NonCancellable', 'IterableConsumer', 'JetStreamSubscription',
  ]) assert.match(serialized, new RegExp(token.replace(/[()+]/g, '\\$&')));

  for (const frame of projectsNatsFlowCompanion.frames) {
    for (const fieldName of ['phase', 'event', 'action', 'guard', 'next', 'signal']) {
      const field = frame[fieldName];
      assert.deepEqual(Object.keys(field).sort(), ['en', 'ko']);
      assert.ok(field.en.length > (fieldName === 'event' ? 8 : 18), `${frame.id}:${fieldName}:en`);
      assert.ok(field.ko.length > (fieldName === 'event' ? 8 : 12), `${frame.id}:${fieldName}:ko`);
    }
  }
  for (const scenario of projectsNatsFlowCompanion.scenarios) {
    for (const fieldName of ['label', 'summary', 'outcome']) {
      assert.deepEqual(Object.keys(scenario[fieldName]).sort(), ['en', 'ko']);
      assert.ok(scenario[fieldName].en.length > (fieldName === 'label' ? 10 : 20), `${scenario.id}:${fieldName}:en`);
      assert.ok(scenario[fieldName].ko.length > (fieldName === 'label' ? 8 : 15), `${scenario.id}:${fieldName}:ko`);
    }
  }
});

test('Issue #419 generators keep interactive routes, SVG/PNG assets, ledgers, and wave README current', () => {
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-projects-nats-flow-interactive.mjs', '--check'], { cwd: root });
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-projects-nats-flow-visuals.mjs', '--check'], { cwd: root });
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-visuals.mjs', '--check'], { cwd: root });
});

for (const locale of locales) {
  test(`#419 ${locale} route exposes sequence rows, playback, details, theme, and provenance`, async () => {
    const prefix = locale === 'ko' ? 'ko/' : '';
    const html = await readFile(resolve(root, 'public', prefix, 'visual-companions', route, 'index.html'), 'utf8');
    assert.match(html, new RegExp(`<html lang="${locale}">`));
    assert.match(html, /id="bt4k-issue-419"/);
    assert.match(html, /data-flow-ready="true"/);
    assert.match(html, /data-sequence="true"/);
    assert.equal((html.match(/data-scenario-button=/g) ?? []).length, 5);
    assert.equal((html.match(/data-step-button=/g) ?? []).length, 10);
    assert.equal((html.match(/data-participant=/g) ?? []).length, 4);
    for (const action of ['reset', 'play', 'next']) assert.match(html, new RegExp(`data-action="${action}"`));
    for (const field of ['action', 'guard', 'next', 'signal']) assert.match(html, new RegExp(`data-detail="${field}"`));
    assert.equal((html.match(/data-theme-button=/g) ?? []).length, 3);
    assert.match(html, /prefers-reduced-motion/);
    assert.match(html, /aria-live="polite"/);
    assert.match(html, /issues\/419/);
    assert.match(html, /NatsConsumerFlowException/);
    assert.doesNotMatch(html, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
    for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script, { filename: `issue-419-${locale}.js` });
    if (locale === 'en') assert.doesNotMatch(html, /[가-힣]/);
  });

  test(`#419 ${locale} static asset and ledger preserve sequence grammar and complexity budget`, async () => {
    const suffix = locale === 'ko' ? 'ko' : 'en';
    const svg = await readFile(resolve(root, `public/assets/visual-companions/wave2/projects-nats-jetstream-flow-${suffix}.svg`), 'utf8');
    const ledger = JSON.parse(await readFile(resolve(root, `docs/diagrams/visual-companions-wave2/projects-nats-jetstream-flow-${suffix}.semantic.json`), 'utf8'));
    await access(resolve(root, `public/assets/visual-companions/wave2/projects-nats-jetstream-flow-${suffix}.png`));
    assert.match(svg, /width="1800"/);
    assert.match(svg, /height="4600"/);
    for (const id of ['participant-caller', 'participant-flow', 'participant-adapter', 'participant-nats', 'message-cold', 'message-terminal', 'alt-redelivery', 'else-drop', 'loop-cancel']) assert.match(svg, new RegExp(`id="${id}"`));
    assert.equal((svg.match(/class="lifeline"/g) ?? []).length, 4);
    assert.ok((svg.match(/class="activation"/g) ?? []).length >= 10);
    assert.equal((svg.match(/class="labelPill"/g) ?? []).length, 10);
    assert.match(svg, /markerUnits="userSpaceOnUse"/);
    assert.match(svg, /data-tip-direction="positive-x"/);
    assert.match(svg, /NatsConsumerFlowException/);
    assert.equal(ledger.source.revision, projectsNatsFlowCompanion.sourceRevision);
    assert.equal(ledger.kind, 'sequence');
    assert.equal(ledger.nodes.length, 10);
    assert.equal(ledger.edges.length, 12);
    assert.equal(ledger.behavior.branches, 3);
    assert.equal(ledger.behavior.loops, 1);
  });
}

test('Issue #419 wave README exposes both fallback pairs and locale routes', async () => {
  const readme = await readFile(resolve(root, 'public/assets/visual-companions/wave2/README.md'), 'utf8');
  assert.match(readme, /#419/);
  assert.match(readme, /projects-nats-jetstream-flow-en\.png/);
  assert.match(readme, /projects-nats-jetstream-flow-ko\.png/);
  assert.match(readme, /\/visual-companions\/bluetape4k-projects\/projects-nats-jetstream-flow\//);
  assert.match(readme, /\/ko\/visual-companions\/bluetape4k-projects\/projects-nats-jetstream-flow\//);
});
