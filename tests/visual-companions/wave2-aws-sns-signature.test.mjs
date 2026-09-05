import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

import {
  awsSnsSignatureCompanion,
  buildSnsVerificationStory,
} from '../../src/data/visual-companions/wave2-aws-sns-signature.mjs';

const root = resolve(import.meta.dirname, '../..');
const locales = ['en', 'ko'];
const route = 'bluetape4k-aws/aws-sns-signature-verification';

test('Issue #422 model pins the ordered SNS trust boundary and source revision', () => {
  assert.equal(awsSnsSignatureCompanion.issue, '422');
  assert.equal(awsSnsSignatureCompanion.repository, 'bluetape4k-aws');
  assert.equal(awsSnsSignatureCompanion.slug, 'aws-sns-signature-verification');
  assert.equal(awsSnsSignatureCompanion.sourceRevision, 'f73f52e5497f3396d9ccc02c8acb1e3444986bc1');
  assert.deepEqual(awsSnsSignatureCompanion.steps.map(({ id }) => id), [
    'parse',
    'topic-allowlist',
    'certificate-url',
    'certificate-fetch',
    'signature',
    'verified',
    'notification-handler',
    'subscription-confirmation',
  ]);
  assert.deepEqual(awsSnsSignatureCompanion.scenarios.map(({ id }) => id), [
    'valid-v1',
    'valid-v2',
    'malformed',
    'unknown-topic',
    'bad-cert-host',
    'cert-timeout',
    'signature-mismatch',
    'unsupported-version',
  ]);
  assert.equal(awsSnsSignatureCompanion.sources.length, 5);
});

test('valid stories reach only post-verification notification or confirmation paths', () => {
  const v1 = buildSnsVerificationStory('valid-v1');
  assert.deepEqual(v1.ids, [
    'parse',
    'topic-allowlist',
    'certificate-url',
    'certificate-fetch',
    'signature',
    'verified',
    'notification-handler',
  ]);
  assert.equal(v1.verified, true);
  assert.equal(v1.dispatched, true);
  assert.equal(v1.confirmationReached, false);
  assert.equal(v1.failClosed, false);

  const v2 = buildSnsVerificationStory('valid-v2');
  assert.deepEqual(v2.ids, [
    'parse',
    'topic-allowlist',
    'certificate-url',
    'certificate-fetch',
    'signature',
    'verified',
    'subscription-confirmation',
  ]);
  assert.equal(v2.ids.at(-1), 'subscription-confirmation');
  assert.equal(v2.ids.includes('notification-handler'), false);
  assert.equal(v2.verified, true);
  assert.equal(v2.dispatched, false);
  assert.equal(v2.confirmationReached, true);
  assert.equal(v2.failClosed, false);
});

test('every malformed, policy, certificate, and signature failure stops before dispatch', () => {
  const expected = {
    malformed: ['parse', false],
    'unknown-topic': ['topic-allowlist', false],
    'bad-cert-host': ['certificate-url', false],
    'cert-timeout': ['certificate-fetch', true],
    'signature-mismatch': ['signature', true],
    'unsupported-version': ['signature', true],
  };

  for (const [scenario, [terminal, networkStarted]] of Object.entries(expected)) {
    const story = buildSnsVerificationStory(scenario);
    assert.equal(story.ids.at(-1), terminal, scenario);
    assert.equal(story.verified, false, scenario);
    assert.equal(story.dispatched, false, scenario);
    assert.equal(story.confirmationReached, false, scenario);
    assert.equal(story.failClosed, true, scenario);
    assert.equal(story.networkStarted, networkStarted, scenario);
  }
  assert.throws(() => buildSnsVerificationStory('unknown'), RangeError);
});

test('steps and scenarios retain complete bilingual explanations and required security terms', () => {
  const serialized = JSON.stringify(awsSnsSignatureCompanion);
  for (const token of [
    'SnsHttpMessageParser',
    'SnsHttpMessageVerifier',
    'SnsMessageManager',
    'TopicArn',
    'SignatureVersion',
    'SigningCertURL',
    'SignatureVersion 1',
    'SignatureVersion 2',
    'fail closed',
    'certificate',
    'cache',
  ]) assert.match(serialized, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  for (const step of awsSnsSignatureCompanion.steps) {
    for (const field of ['phase', 'event', 'action', 'guard', 'next', 'signal']) {
      assert.deepEqual(Object.keys(step[field]).sort(), ['en', 'ko']);
      assert.ok(step[field].en.length > 14, `${step.id}:${field}:en`);
      assert.ok(step[field].ko.length > 10, `${step.id}:${field}:ko`);
    }
  }
  for (const scenario of awsSnsSignatureCompanion.scenarios) {
    for (const field of ['label', 'summary', 'outcome']) {
      assert.deepEqual(Object.keys(scenario[field]).sort(), ['en', 'ko']);
      assert.ok(scenario[field].en.length > (field === 'label' ? 4 : 18), `${scenario.id}:${field}:en`);
      assert.ok(scenario[field].ko.length > (field === 'label' ? 3 : 12), `${scenario.id}:${field}:ko`);
    }
  }
});

test('generated bilingual explorers stay offline runnable and expose the security sequence contract', async () => {
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-aws-sns-signature.mjs', '--check'], { cwd: root });

  for (const locale of locales) {
    const prefix = locale === 'ko' ? 'ko/' : '';
    const html = await readFile(resolve(root, 'public', prefix, 'visual-companions', route, 'index.html'), 'utf8');
    assert.match(html, new RegExp(`<html lang="${locale}">`));
    assert.match(html, /id="bt4k-issue-422"/);
    assert.match(html, /data-sns-ready="true"/);
    assert.match(html, /data-sequence="true"/);
    assert.equal((html.match(/data-scenario-button=/g) ?? []).length, 8);
    assert.equal((html.match(/data-step-button=/g) ?? []).length, 8);
    assert.equal((html.match(/data-participant=/g) ?? []).length, 5);
    for (const action of ['reset', 'play', 'next']) assert.match(html, new RegExp(`data-action="${action}"`));
    for (const field of ['action', 'guard', 'next', 'signal']) assert.match(html, new RegExp(`data-detail="${field}"`));
    assert.equal((html.match(/data-theme-button=/g) ?? []).length, 3);
    assert.match(html, /data-scroll-hint/);
    assert.match(html, /word-break:keep-all/);
    assert.match(html, /prefers-color-scheme:light/);
    assert.match(html, /prefers-reduced-motion/);
    assert.match(html, /aria-live="polite"/);
    assert.match(html, /issues\/422/);
    assert.match(html, /issues\/457/);
    assert.doesNotMatch(html, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
    for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
      new vm.Script(script, { filename: `issue-422-${locale}.js` });
    }
    if (locale === 'en') assert.doesNotMatch(html, /[가-힣]/);
  }
});

test('static generator preserves bilingual fallback assets, sequence signals, and semantic ledgers', async () => {
  execFileSync(process.execPath, ['scripts/generate-2-0-wave2-aws-sns-signature-visuals.mjs', '--check'], { cwd: root });

  for (const locale of locales) {
    const suffix = locale === 'ko' ? 'ko' : 'en';
    const svg = await readFile(resolve(root, `public/assets/visual-companions/wave2/${awsSnsSignatureCompanion.slug}-${suffix}.svg`), 'utf8');
    const ledger = JSON.parse(await readFile(resolve(root, `docs/diagrams/visual-companions-wave2/${awsSnsSignatureCompanion.slug}-${suffix}.semantic.json`), 'utf8'));
    await access(resolve(root, `public/assets/visual-companions/wave2/${awsSnsSignatureCompanion.slug}-${suffix}.png`));
    assert.match(svg, /width="1800"/);
    assert.match(svg, /height="\d+"/);
    assert.ok((svg.match(/class="lifeline"/g) ?? []).length >= 5);
    assert.ok((svg.match(/class="activation"/g) ?? []).length >= 8);
    assert.ok((svg.match(/class="labelPill"/g) ?? []).length >= 8);
    assert.match(svg, /data-branch="/);
    assert.match(svg, /data-step="[1-8]"/);
    assert.match(svg, /SignatureVersion 1/);
    assert.match(svg, /TopicArn/);
    assert.equal(ledger.source.revision, awsSnsSignatureCompanion.sourceRevision);
    assert.equal(ledger.kind, 'sequence');
    assert.ok(ledger.nodes.length >= 8);
    assert.ok(ledger.edges.length >= 7);
    assert.equal(ledger.behavior.branches, 2);
  }
});
