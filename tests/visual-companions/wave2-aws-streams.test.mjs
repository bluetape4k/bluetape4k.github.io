import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

import { awsStreamsCompanion } from '../../src/data/visual-companions/wave2-aws-streams.mjs';

const root = resolve(import.meta.dirname, '../..');
const locales = ['en', 'ko'];
const route = 'bluetape4k-aws/aws-streams-shard-consumers';

test('Issue #417 source model fixes the service, scenario, frame, and evidence boundaries', () => {
  assert.equal(awsStreamsCompanion.issue, '417');
  assert.equal(awsStreamsCompanion.repository, 'bluetape4k-aws');
  assert.equal(awsStreamsCompanion.slug, 'aws-streams-shard-consumers');
  assert.equal(awsStreamsCompanion.sourceRevision, '632e0f346b807c4d50e3195f7b2b72082def9460');
  assert.deepEqual(awsStreamsCompanion.services, ['kinesis', 'dynamodb']);
  assert.equal(awsStreamsCompanion.scenarios.length, 5);
  assert.equal(awsStreamsCompanion.frames.length, 9);
  assert.deepEqual(
    awsStreamsCompanion.scenarios.map(({ id }) => id),
    ['normal', 'resume', 'lease-loss', 'checkpoint-failure', 'cancellation'],
  );
  assert.deepEqual(
    awsStreamsCompanion.frames.map(({ id }) => id),
    ['ready', 'discover', 'graph', 'gate', 'start', 'poll', 'emit', 'checkpoint', 'shard-end'],
  );
  assert.equal(awsStreamsCompanion.sources.length, 4);
});

test('Issue #417 locale copy stays structurally equivalent and keeps required identifiers', () => {
  const serialized = JSON.stringify(awsStreamsCompanion);
  for (const token of [
    'ListShards',
    'DescribeStream',
    'Semaphore(maxShardConcurrency)',
    'flatMapMerge(maxShardConcurrency)',
    'KinesisCheckpoint.ShardEnd',
    'emit',
    'checkpoint',
    'at-least-once',
    'caller',
  ]) assert.match(serialized, new RegExp(token.replace(/[()]/g, '\\$&')));

  for (const frame of awsStreamsCompanion.frames) {
    for (const service of awsStreamsCompanion.services) {
      const lane = frame[service];
      assert.deepEqual(Object.keys(lane).sort(), ['action', 'guard', 'next'].sort());
      for (const field of Object.values(lane)) {
        assert.deepEqual(Object.keys(field).sort(), locales);
        assert.ok(field.en.length > 20, `${frame.id}:${service}:en detail is too short`);
        assert.ok(field.ko.length > 15, `${frame.id}:${service}:ko detail is too short`);
      }
    }
  }
});

test('Issue #417 generators keep committed interactive and static outputs current', () => {
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-interactive.mjs', '--check'], { cwd: root });
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-visuals.mjs', '--check'], { cwd: root });
});

for (const locale of locales) {
  test(`#417 ${locale} route exposes playback, comparison, detail, theme, and provenance`, async () => {
    const prefix = locale === 'ko' ? 'ko/' : '';
    const html = await readFile(resolve(root, 'public', prefix, 'visual-companions', route, 'index.html'), 'utf8');
    assert.match(html, new RegExp(`<html lang="${locale}">`));
    assert.match(html, /id="bt4k-issue-417"/);
    assert.equal((html.match(/data-scenario-button=/g) ?? []).length, 5);
    assert.match(html, /data-action="reset"/);
    assert.match(html, /data-action="play"/);
    assert.match(html, /data-action="next"/);
    assert.match(html, /data-service="kinesis"/);
    assert.match(html, /data-service="dynamodb"/);
    assert.match(html, /data-detail="action"/);
    assert.match(html, /data-detail="guard"/);
    assert.match(html, /data-detail="next"/);
    assert.equal((html.match(/data-theme-button=/g) ?? []).length, 3);
    assert.match(html, /aria-live="polite"/);
    assert.match(html, /issues\/417/);
    assert.doesNotMatch(html, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);

    for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
      new vm.Script(script, { filename: `issue-417-${locale}.js` });
    }
    if (locale === 'en') assert.doesNotMatch(html, /[가-힣]/);
  });

  test(`#417 ${locale} static asset and semantic ledger preserve the comparison contract`, async () => {
    const suffix = locale === 'ko' ? 'ko' : 'en';
    const svg = await readFile(resolve(root, `public/assets/visual-companions/wave2/aws-streams-shard-consumers-${suffix}.svg`), 'utf8');
    const ledger = JSON.parse(await readFile(resolve(root, `docs/diagrams/visual-companions-wave2/aws-streams-shard-consumers-${suffix}.semantic.json`), 'utf8'));
    assert.match(svg, /width="1800"/);
    assert.match(svg, /height="3600"/);
    assert.match(svg, /data-service="kinesis"/);
    assert.match(svg, /data-service="dynamodb"/);
    assert.match(svg, /KinesisCheckpoint\.ShardEnd/);
    assert.equal(ledger.source.revision, awsStreamsCompanion.sourceRevision);
    assert.equal(ledger.kind, 'workflow');
    assert.ok(ledger.nodes.length >= 8);
    assert.ok(ledger.edges.length >= 8);
  });
}
