import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { verifyReleaseProvenance } from '../../scripts/manual/lib/release-provenance.mjs';

const repository = {
  slug: 'bluetape4k-image',
  repository: 'bluetape4k/bluetape4k-image',
  label: { en: 'Image docs', ko: 'Image 문서' },
  latestMinor: '1.0',
  route: { en: '/manual/bluetape4k-image/', ko: '/ko/manual/bluetape4k-image/' },
};
const releaseCommit = 'b38d4891b66dff8bc63db0018b5e41810d1da9bc';
const catalog = {
  schema: 1,
  repository: repository.repository,
  latest: '1.0',
  versions: [{
    minorVersion: '1.0',
    releaseRef: '1.0.0',
    releaseCommit,
    sourceCommit: releaseCommit,
    channel: 'stable',
    documents: { en: ['index'], ko: ['index'] },
  }],
};

test('verifies the catalog latest release against its exact live tag commit', async () => {
  const calls = [];
  const result = await verifyReleaseProvenance({
    repository,
    catalog,
    resolveReleaseImpl: async (input) => {
      calls.push(input);
      return {
        repository: repository.repository,
        releaseRef: '1.0.0',
        releaseCommit,
        minorVersion: '1.0',
      };
    },
  });

  assert.deepEqual(calls, [{ repository, releaseRef: '1.0.0' }]);
  assert.deepEqual(result, {
    repository: repository.repository,
    latest: '1.0',
    releaseRef: '1.0.0',
    releaseCommit,
    verified: true,
  });
});

test('rejects a live tag that resolves to a different commit', async () => {
  const movedCommit = 'c'.repeat(40);
  await assert.rejects(
    verifyReleaseProvenance({
      repository,
      catalog,
      resolveReleaseImpl: async () => ({
        repository: repository.repository,
        releaseRef: '1.0.0',
        releaseCommit: movedCommit,
        minorVersion: '1.0',
      }),
    }),
    (error) => {
      assert.equal(error.code, 'RELEASE_MOVED');
      assert.equal(error.expected, releaseCommit);
      assert.equal(error.actual, movedCommit);
      assert.equal(error.repository, repository.repository);
      return true;
    },
  );
});

test('rejects a resolver result for a different release tag', async () => {
  await assert.rejects(
    verifyReleaseProvenance({
      repository,
      catalog,
      resolveReleaseImpl: async () => ({
        repository: repository.repository,
        releaseRef: '1.0.1',
        releaseCommit,
        minorVersion: '1.0',
      }),
    }),
    (error) => {
      assert.equal(error.code, 'RELEASE_TAG_MISMATCH');
      assert.equal(error.expected, '1.0.0');
      assert.equal(error.actual, '1.0.1');
      return true;
    },
  );
});

test('Pages Build opts into live Image provenance verification', async () => {
  const workflow = await readFile(new URL('../../.github/workflows/deploy.yml', import.meta.url), 'utf8');
  assert.match(workflow, /check:manual -- --verify-release-provenance bluetape4k-image/);
  assert.match(workflow, /GITHUB_TOKEN: \$\{\{ github\.token \}\}/);
});
