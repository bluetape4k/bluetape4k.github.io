import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

import {
  awsSqsExtendedCompanion,
  buildSqsExtendedStory,
} from '../../src/data/visual-companions/wave2-aws-sqs-extended-client.mjs';

const root = resolve(import.meta.dirname, '../..');
const locales = ['en', 'ko'];
const route = 'bluetape4k-aws/aws-sqs-extended-client';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('Issue #423 model pins the SQS payload lifecycle and source revision', () => {
  assert.equal(awsSqsExtendedCompanion.issue, '423');
  assert.equal(awsSqsExtendedCompanion.repository, 'bluetape4k-aws');
  assert.equal(awsSqsExtendedCompanion.slug, 'aws-sqs-extended-client');
  assert.equal(awsSqsExtendedCompanion.sourceRevision, '30a28f80dbf995ca08bf86e64d3b60a93f1e2094');
  assert.deepEqual(awsSqsExtendedCompanion.steps.map(({ id }) => id), [
    'size-gate', 's3-upload', 'send-envelope', 'restore', 'handler',
    'handler-complete', 'sqs-ack', 'marker', 'payload-delete',
  ]);
  assert.deepEqual(awsSqsExtendedCompanion.scenarios.map(({ id }) => id), [
    'inline', 'offload-success', 's3-upload-failure', 'sqs-send-failure',
    'missing-object', 'restore-failure', 'ack-failure', 'cleanup-retry',
    'caller-owned-lifecycle',
  ]);
  assert.equal(awsSqsExtendedCompanion.sources.length, 5);
});

test('inline and successful offload paths preserve acknowledgement ordering', () => {
  const inline = buildSqsExtendedStory('inline');
  assert.deepEqual(inline.ids, [
    'size-gate', 'send-envelope', 'restore', 'handler', 'handler-complete', 'sqs-ack',
  ]);
  assert.equal(inline.s3Touched, false);
  assert.equal(inline.handlerReached, true);
  assert.equal(inline.sqsDeleted, true);
  assert.equal(inline.cleanupRequired, false);
  assert.equal(inline.failClosed, false);

  const offload = buildSqsExtendedStory('offload-success');
  assert.deepEqual(offload.ids, awsSqsExtendedCompanion.steps.map(({ id }) => id));
  assert.equal(offload.s3Touched, true);
  assert.equal(offload.handlerReached, true);
  assert.equal(offload.sqsDeleted, true);
  assert.equal(offload.cleanupRequired, false);
  assert.equal(offload.failClosed, false);
});

test('failure and caller-owned paths stop before forbidden operations', () => {
  const upload = buildSqsExtendedStory('s3-upload-failure');
  assert.deepEqual(upload.ids, ['size-gate', 's3-upload']);
  assert.equal(upload.handlerReached, false);
  assert.equal(upload.sqsDeleted, false);

  const send = buildSqsExtendedStory('sqs-send-failure');
  assert.equal(send.s3Touched, true);
  assert.equal(send.handlerReached, false);
  assert.equal(send.ids.at(-1), 'send-envelope');

  for (const scenario of ['missing-object', 'restore-failure']) {
    const story = buildSqsExtendedStory(scenario);
    assert.equal(story.ids.at(-1), 'restore', scenario);
    assert.equal(story.handlerReached, false, scenario);
    assert.equal(story.sqsDeleted, false, scenario);
  }

  const ack = buildSqsExtendedStory('ack-failure');
  assert.equal(ack.sqsDeleted, false);
  assert.equal(ack.ids.includes('marker'), false);
  assert.equal(ack.ids.includes('payload-delete'), false);

  const cleanup = buildSqsExtendedStory('cleanup-retry');
  assert.equal(cleanup.sqsDeleted, true);
  assert.equal(cleanup.cleanupRequired, true);
  assert.equal(cleanup.failure.code, 'S3_DELETE_RETRY');
  assert.deepEqual(cleanup.ids.slice(-3), ['sqs-ack', 'marker', 'payload-delete']);

  const callerOwned = buildSqsExtendedStory('caller-owned-lifecycle');
  assert.equal(callerOwned.sqsDeleted, true);
  assert.equal(callerOwned.ids.includes('marker'), false);
  assert.equal(callerOwned.ids.includes('payload-delete'), false);
  assert.throws(() => buildSqsExtendedStory('unknown'), RangeError);
});

test('steps and scenarios retain bilingual explanations and ownership boundaries', () => {
  const serialized = JSON.stringify(awsSqsExtendedCompanion);
  for (const token of [
    'bt4k-sqs-extended/v1', 'SqsExtendedCleanupHandle', 'sqsDeleted=true',
    'cleanupRequired=true', 'AWS Java Extended Client', '@SqsListener',
    'bucket', 'IAM', 'lifecycle', 'orphan cleanup',
  ]) assert.match(serialized, new RegExp(escapeRegex(token)));

  for (const step of awsSqsExtendedCompanion.steps) {
    for (const field of ['phase', 'event', 'action', 'guard', 'next', 'signal']) {
      assert.deepEqual(Object.keys(step[field]).sort(), ['en', 'ko']);
      assert.ok(step[field].en.length > 14, `${step.id}:${field}:en`);
      assert.ok(step[field].ko.length > 10, `${step.id}:${field}:ko`);
    }
  }
  for (const scenario of awsSqsExtendedCompanion.scenarios) {
    for (const field of ['label', 'summary', 'outcome']) {
      assert.deepEqual(Object.keys(scenario[field]).sort(), ['en', 'ko']);
      assert.ok(scenario[field].en.length > (field === 'label' ? 4 : 18), `${scenario.id}:${field}:en`);
      assert.ok(scenario[field].ko.length > (field === 'label' ? 3 : 12), `${scenario.id}:${field}:ko`);
    }
    if (scenario.failure) {
      assert.deepEqual(Object.keys(scenario.failure.signal).sort(), ['en', 'ko']);
      assert.ok(scenario.failure.signal.en.length > 18, `${scenario.id}:failure.signal:en`);
      assert.ok(scenario.failure.signal.ko.length > 18, `${scenario.id}:failure.signal:ko`);
    }
  }

  assert.match(buildSqsExtendedStory('s3-upload-failure').failure.signal.en, /S3 object=absent · SQS message=0/);
  assert.match(buildSqsExtendedStory('sqs-send-failure').failure.signal.en, /orphan candidate=present · SQS message=0/);
  assert.match(buildSqsExtendedStory('missing-object').failure.signal.en, /object=missing · handler=0 · ack=0/);
  assert.match(buildSqsExtendedStory('restore-failure').failure.signal.en, /restore=failed · handler=0 · ack=0/);
  assert.match(buildSqsExtendedStory('ack-failure').failure.signal.en, /sqsDeleted=false · marker=0 · payload delete=0/);
  assert.match(buildSqsExtendedStory('cleanup-retry').failure.signal.en, /payloadDeleted=false · cleanupRequired=true/);
});

test('generated bilingual explorers stay offline runnable and expose the lifecycle contract', async () => {
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-aws-sqs-extended-client.mjs', '--check'], { cwd: root });

  for (const locale of locales) {
    const prefix = locale === 'ko' ? 'ko/' : '';
    const html = await readFile(resolve(root, 'public', prefix, 'visual-companions', route, 'index.html'), 'utf8');
    assert.match(html, new RegExp(`<html lang="${locale}">`));
    assert.match(html, /id="bt4k-issue-423"/);
    assert.match(html, /data-sqs-extended-ready="true"/);
    assert.match(html, /data-sequence="true"/);
    assert.equal((html.match(/data-scenario-button=/g) ?? []).length, 9);
    assert.equal((html.match(/data-step-button=/g) ?? []).length, 9);
    assert.equal((html.match(/data-participant=/g) ?? []).length, 5);
    assert.match(html, /data-from="producer" data-to="producer" data-direction="self"/);
    assert.match(html, /style="--from:10%;--to:10%;--start:10%;--end:10%;--mid:20%;--rotation:180deg"/);
    assert.match(html, /data-from="producer" data-to="s3" data-direction="forward"/);
    assert.match(html, /data-from="sqs" data-to="consumer" data-direction="forward"/);
    assert.match(html, /data-from="handler" data-to="consumer" data-direction="reverse"/);
    assert.match(html, /style="--from:10%;--to:30%;--start:10%;--end:30%;--mid:20%;--rotation:0deg"/);
    assert.match(html, /style="--from:90%;--to:70%;--start:70%;--end:90%;--mid:80%;--rotation:180deg"/);
    for (const action of ['reset', 'play', 'next']) assert.match(html, new RegExp(`data-action="${action}"`));
    for (const field of ['action', 'guard', 'next', 'signal']) assert.match(html, new RegExp(`data-detail="${field}"`));
    assert.equal((html.match(/data-theme-button=/g) ?? []).length, 3);
    assert.match(html, /CLEANUP_REQUIRED/);
    for (const scenario of awsSqsExtendedCompanion.scenarios.filter(({ failure }) => failure)) {
      assert.match(html, new RegExp(escapeRegex(scenario.failure.signal[locale])));
    }
    assert.match(html, /ack before cleanup/);
    assert.match(html, /issues\/423/);
    assert.match(html, /issues\/455/);
    assert.match(html, new RegExp(awsSqsExtendedCompanion.sourceRevision));
    assert.doesNotMatch(html, /TopicArn|SigningCertURL|SNS signature|certificate chain/);
    assert.doesNotMatch(html, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
    for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
      new vm.Script(script, { filename: `issue-423-${locale}.js` });
    }
    if (locale === 'en') assert.doesNotMatch(html, /[가-힣]/);
  }
});

test('static generator preserves bilingual fallback assets and semantic ledgers', async () => {
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-aws-sqs-extended-client-visuals.mjs', '--check'], { cwd: root });

  for (const locale of locales) {
    const svg = await readFile(resolve(root, `public/assets/visual-companions/wave2/${awsSqsExtendedCompanion.slug}-${locale}.svg`), 'utf8');
    const ledger = JSON.parse(await readFile(resolve(root, `docs/diagrams/visual-companions-wave2/${awsSqsExtendedCompanion.slug}-${locale}.semantic.json`), 'utf8'));
    await access(resolve(root, `public/assets/visual-companions/wave2/${awsSqsExtendedCompanion.slug}-${locale}.png`));
    assert.match(svg, /width="1800"/);
    assert.ok((svg.match(/class="lifeline"/g) ?? []).length >= 5);
    assert.ok((svg.match(/class="activation"/g) ?? []).length >= 16);
    assert.ok((svg.match(/class="labelPill"/g) ?? []).length >= 9);
    assert.ok((svg.match(/data-branch=/g) ?? []).length >= 3);
    assert.match(svg, /data-step="9"/);
    assert.match(svg, /data-decision="size-gate"/);
    assert.doesNotMatch(svg, /data-connector="message-size-gate"/);
    assert.equal((svg.match(/data-connector=/g) ?? []).length, 8);
    assert.match(svg, /SQS delete/);
    assert.match(svg, /marker/);
    assert.match(svg, /payload delete/i);
    assert.doesNotMatch(svg, /TopicArn|SigningCertURL|SignatureVersion/);
    assert.equal(ledger.source.revision, awsSqsExtendedCompanion.sourceRevision);
    assert.equal(ledger.kind, 'sequence');
    assert.equal(ledger.nodes.length, 9);
    assert.equal(ledger.edges.length, 8);
    assert.equal(ledger.behavior.branches, 3);
    assert.equal(ledger.behavior.loops, 1);
  }
});
