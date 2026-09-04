import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveManualVisualCompanions } from '../../src/data/visual-companions/wave1-manual-links.mjs';

const targets = [
  ['manual/bluetape4k-image/1.0/modules/spring-boot-image-intelligence-api', 'bluetape4k-image', 'image-intelligence-policy-privacy'],
  ['manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging', 'bluetape4k-aws', 'aws-sqs-reliability'],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-cache-lettuce/near-cache-l1-l2', 'bluetape4k-projects', 'projects-nearjcache-semantics'],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-science', 'bluetape4k-projects', 'projects-netcdf-cf-progress'],
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

test('AWS storage manual exposes both wave 1 SQS and wave 2 Streams companions', () => {
  const entryId = 'manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging';
  const en = resolveManualVisualCompanions(entryId, 'en');
  const ko = resolveManualVisualCompanions(`ko/${entryId}`, 'ko');
  assert.equal(en.length, 2);
  assert.equal(ko.length, 2);
  assert.equal(en[1].route, '/visual-companions/bluetape4k-aws/aws-streams-shard-consumers/');
  assert.equal(ko[1].route, '/ko/visual-companions/bluetape4k-aws/aws-streams-shard-consumers/');
  assert.equal(en[1].image, '/assets/visual-companions/wave2/aws-streams-shard-consumers-en.png');
  assert.equal(ko[1].image, '/assets/visual-companions/wave2/aws-streams-shard-consumers-ko.png');
});

test('Projects science manual exposes the NetCDF CF progress companion', () => {
  const entryId = 'manual/bluetape4k-projects/2.0/modules/bluetape4k-science';
  const [en] = resolveManualVisualCompanions(entryId, 'en');
  const [ko] = resolveManualVisualCompanions(`ko/${entryId}`, 'ko');
  assert.equal(en.route, '/visual-companions/bluetape4k-projects/projects-netcdf-cf-progress/');
  assert.equal(ko.route, '/ko/visual-companions/bluetape4k-projects/projects-netcdf-cf-progress/');
  assert.equal(en.image, '/assets/visual-companions/wave2/projects-netcdf-cf-progress-en.png');
  assert.equal(ko.image, '/assets/visual-companions/wave2/projects-netcdf-cf-progress-ko.png');
});

test('wave 1 manual overlays do not leak onto unrelated release snapshots', () => {
  assert.deepEqual(resolveManualVisualCompanions('manual/bluetape4k-projects/1.0/modules/cache', 'en'), []);
  assert.deepEqual(resolveManualVisualCompanions('blog/index', 'en'), []);
});
