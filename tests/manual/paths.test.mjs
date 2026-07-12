import assert from 'node:assert/strict';
import test from 'node:test';
import { assetDestinationFor, destinationFor } from '../../scripts/manual/lib/paths.mjs';

test('preserves nested chapter routes', () => {
  assert.equal(
    destinationFor('ko', 'ko/modules/bluetape4k-coroutines/lifecycle.md'),
    'src/content/docs/ko/manual/bluetape4k-projects/modules/bluetape4k-coroutines/lifecycle.md',
  );
});

test('publishes repository-owned manual assets under one stable namespace', () => {
  assert.equal(
    assetDestinationFor('bluetape4k-projects', 'assets/coroutines/scope-lifecycle.svg'),
    'public/manual-assets/bluetape4k-projects/coroutines/scope-lifecycle.svg',
  );
});
