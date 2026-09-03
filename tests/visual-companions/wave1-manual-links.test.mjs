import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveWave1ManualCompanion } from '../../src/data/visual-companions/wave1-manual-links.mjs';

const targets = [
  ['manual/bluetape4k-image/1.0/modules/spring-boot-image-intelligence-api', 'bluetape4k-image', 'image-intelligence-policy-privacy'],
  ['manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging', 'bluetape4k-aws', 'aws-sqs-reliability'],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-cache-lettuce/near-cache-l1-l2', 'bluetape4k-projects', 'projects-nearjcache-semantics'],
];

test('wave 1 manual overlays resolve exact locale-matched companion routes and previews', () => {
  for (const [entryId, repository, slug] of targets) {
    const en = resolveWave1ManualCompanion(entryId, 'en');
    const ko = resolveWave1ManualCompanion(`ko/${entryId}`, 'ko');
    assert.equal(en.route, `/visual-companions/${repository}/${slug}/`);
    assert.equal(ko.route, `/ko/visual-companions/${repository}/${slug}/`);
    assert.match(en.image, /-en\.png$/);
    assert.match(ko.image, /-ko\.png$/);
  }
});

test('wave 1 manual overlays do not leak onto unrelated release snapshots', () => {
  assert.equal(resolveWave1ManualCompanion('manual/bluetape4k-projects/1.0/modules/cache', 'en'), undefined);
  assert.equal(resolveWave1ManualCompanion('blog/index', 'en'), undefined);
});
