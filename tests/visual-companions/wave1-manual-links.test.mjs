import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveManualVisualCompanions } from '../../src/data/visual-companions/wave1-manual-links.mjs';

const targets = [
  ['manual/bluetape4k-image/1.0/modules/spring-boot-image-intelligence-api', 'bluetape4k-image', 'image-intelligence-policy-privacy'],
  ['manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging', 'bluetape4k-aws', 'aws-sqs-reliability'],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-cache-lettuce/near-cache-l1-l2', 'bluetape4k-projects', 'projects-nearjcache-semantics'],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-science', 'bluetape4k-projects', 'projects-netcdf-cf-progress'],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-coroutines/flow', 'bluetape4k-projects', 'projects-coroutines-flow-operators'],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-tenant', 'bluetape4k-projects', 'projects-tenant-context-carriers'],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-tenant-reactor', 'bluetape4k-projects', 'projects-tenant-context-carriers'],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-ktor-tenant', 'bluetape4k-projects', 'projects-tenant-context-carriers'],
];

test('manual overlays resolve exact locale-matched companion routes and previews', () => {
  for (const [entryId, repository, slug] of targets) {
    const [en] = resolveManualVisualCompanions(entryId, 'en');
    const [ko] = resolveManualVisualCompanions(`ko/${entryId}`, 'ko');
    assert.equal(en.route, `/visual-companions/${repository}/${slug}/`);
    assert.equal(ko.route, `/ko/visual-companions/${repository}/${slug}/`);
    assert.match(en.image, /-en\.png$/);
    assert.match(ko.image, /-ko\.png$/);
  }
});

test('AWS storage manual exposes SQS, Streams, Modulith, SNS signature, and Extended Client companions', () => {
  const entryId = 'manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging';
  const en = resolveManualVisualCompanions(entryId, 'en');
  const ko = resolveManualVisualCompanions(`ko/${entryId}`, 'ko');
  assert.equal(en.length, 5);
  assert.equal(ko.length, 5);
  assert.equal(en[1].route, '/visual-companions/bluetape4k-aws/aws-streams-shard-consumers/');
  assert.equal(ko[1].route, '/ko/visual-companions/bluetape4k-aws/aws-streams-shard-consumers/');
  assert.equal(en[1].image, '/assets/visual-companions/wave2/aws-streams-shard-consumers-en.png');
  assert.equal(ko[1].image, '/assets/visual-companions/wave2/aws-streams-shard-consumers-ko.png');
  assert.equal(en[2].route, '/visual-companions/bluetape4k-aws/aws-modulith-event-externalization/');
  assert.equal(ko[2].route, '/ko/visual-companions/bluetape4k-aws/aws-modulith-event-externalization/');
  assert.equal(en[2].image, '/assets/visual-companions/wave2/aws-modulith-event-externalization-en.png');
  assert.equal(ko[2].image, '/assets/visual-companions/wave2/aws-modulith-event-externalization-ko.png');
  assert.equal(en[2].title, 'Spring Modulith event externalization');
  assert.equal(ko[2].title, 'Spring Modulith 이벤트 외부화');
  for (const description of [en[2].description, ko[2].description]) {
    for (const term of ['SNS', 'SQS', 'DIRECT', 'idempotency', 'dispatch', 'acknowledgement']) {
      assert.match(description, new RegExp(term, 'i'), `missing ${term}`);
    }
  }
  assert.equal(en[3].route, '/visual-companions/bluetape4k-aws/aws-sns-signature-verification/');
  assert.equal(ko[3].route, '/ko/visual-companions/bluetape4k-aws/aws-sns-signature-verification/');
  assert.equal(en[3].image, '/assets/visual-companions/wave2/aws-sns-signature-verification-en.png');
  assert.equal(ko[3].image, '/assets/visual-companions/wave2/aws-sns-signature-verification-ko.png');
  assert.equal(en[3].title, 'AWS SNS signature verification');
  assert.equal(ko[3].title, 'AWS SNS 서명 검증');
  for (const description of [en[3].description, ko[3].description]) {
    for (const term of ['TopicArn', 'network', 'SignatureVersion', 'fail-closed', 'handler']) {
      assert.match(description, new RegExp(term, 'i'), `missing ${term}`);
    }
  }
  assert.match(en[3].description, /certificate/i);
  assert.match(ko[3].description, /인증서/);
  assert.equal(en[4].route, '/visual-companions/bluetape4k-aws/aws-sqs-extended-client/');
  assert.equal(ko[4].route, '/ko/visual-companions/bluetape4k-aws/aws-sqs-extended-client/');
  assert.equal(en[4].image, '/assets/visual-companions/wave2/aws-sqs-extended-client-en.png');
  assert.equal(ko[4].image, '/assets/visual-companions/wave2/aws-sqs-extended-client-ko.png');
  assert.equal(en[4].title, 'AWS SQS Extended Client lifecycle');
  assert.equal(ko[4].title, 'AWS SQS Extended Client lifecycle');
  for (const description of [en[4].description, ko[4].description]) {
    for (const term of ['inline', 'S3', 'pointer', 'handler', 'SQS', 'cleanup']) {
      assert.match(description, new RegExp(term, 'i'), `missing ${term}`);
    }
  }
});

test('Projects science manual exposes both NetCDF companions', () => {
  const entryId = 'manual/bluetape4k-projects/2.0/modules/bluetape4k-science';
  const en = resolveManualVisualCompanions(entryId, 'en');
  const ko = resolveManualVisualCompanions(`ko/${entryId}`, 'ko');
  assert.deepEqual(en.map(({ route }) => route), [
    '/visual-companions/bluetape4k-projects/projects-netcdf-cf-progress/',
    '/visual-companions/bluetape4k-projects/projects-netcdf-data-model/',
  ]);
  assert.deepEqual(ko.map(({ route }) => route), [
    '/ko/visual-companions/bluetape4k-projects/projects-netcdf-cf-progress/',
    '/ko/visual-companions/bluetape4k-projects/projects-netcdf-data-model/',
  ]);
  assert.equal(en[0].image, '/assets/visual-companions/wave2/projects-netcdf-cf-progress-en.png');
  assert.equal(ko[0].image, '/assets/visual-companions/wave2/projects-netcdf-cf-progress-ko.png');
  assert.equal(en[1].image, '/assets/visual-companions/wave2/projects-netcdf-data-model-en.png');
  assert.equal(ko[1].image, '/assets/visual-companions/wave2/projects-netcdf-data-model-ko.png');
});

test('Projects Coroutines Flow manual exposes the operator Marble Explorer', () => {
  const entryId = 'manual/bluetape4k-projects/2.0/modules/bluetape4k-coroutines/flow';
  const [en] = resolveManualVisualCompanions(entryId, 'en');
  const [ko] = resolveManualVisualCompanions(`ko/${entryId}`, 'ko');
  assert.equal(en.route, '/visual-companions/bluetape4k-projects/projects-coroutines-flow-operators/');
  assert.equal(ko.route, '/ko/visual-companions/bluetape4k-projects/projects-coroutines-flow-operators/');
  assert.equal(en.image, '/assets/visual-companions/wave2/projects-coroutines-flow-operators-en.png');
  assert.equal(ko.image, '/assets/visual-companions/wave2/projects-coroutines-flow-operators-ko.png');
});

test('Projects NATS manual exposes the JetStream Flow sequence companion', () => {
  const entryId = 'manual/bluetape4k-projects/2.0/modules/bluetape4k-nats/jetstream-streams-consumers';
  const [en] = resolveManualVisualCompanions(entryId, 'en');
  const [ko] = resolveManualVisualCompanions(`ko/${entryId}`, 'ko');
  assert.equal(en.route, '/visual-companions/bluetape4k-projects/projects-nats-jetstream-flow/');
  assert.equal(ko.route, '/ko/visual-companions/bluetape4k-projects/projects-nats-jetstream-flow/');
  assert.equal(en.image, '/assets/visual-companions/wave2/projects-nats-jetstream-flow-en.png');
  assert.equal(ko.image, '/assets/visual-companions/wave2/projects-nats-jetstream-flow-ko.png');
});

test('Projects tenant manuals expose the shared carrier comparison companion', () => {
  const entryIds = [
    'manual/bluetape4k-projects/2.0/modules/bluetape4k-tenant',
    'manual/bluetape4k-projects/2.0/modules/bluetape4k-tenant-reactor',
    'manual/bluetape4k-projects/2.0/modules/bluetape4k-ktor-tenant',
  ];

  for (const entryId of entryIds) {
    const [en] = resolveManualVisualCompanions(entryId, 'en');
    const [ko] = resolveManualVisualCompanions(`ko/${entryId}`, 'ko');
    assert.equal(en.route, '/visual-companions/bluetape4k-projects/projects-tenant-context-carriers/');
    assert.equal(ko.route, '/ko/visual-companions/bluetape4k-projects/projects-tenant-context-carriers/');
    assert.equal(en.image, '/assets/visual-companions/wave2/projects-tenant-context-carriers-en.png');
    assert.equal(ko.image, '/assets/visual-companions/wave2/projects-tenant-context-carriers-ko.png');
    assert.equal(en.title, 'Tenant context carrier comparison');
    assert.equal(ko.title, 'Tenant context carrier 비교');
    for (const description of [en.description, ko.description]) {
      for (const term of ['ThreadLocal', 'ScopedValue', 'Reactor', 'Ktor', 'missing-context']) {
        assert.match(description, new RegExp(term, 'i'), `${entryId}:missing ${term}`);
      }
    }
  }
});

test('wave 1 manual overlays do not leak onto unrelated release snapshots', () => {
  assert.deepEqual(resolveManualVisualCompanions('manual/bluetape4k-projects/1.0/modules/cache', 'en'), []);
  assert.deepEqual(resolveManualVisualCompanions('blog/index', 'en'), []);
});
