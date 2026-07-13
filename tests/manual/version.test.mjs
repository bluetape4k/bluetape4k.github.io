import assert from 'node:assert/strict';
import test from 'node:test';

import {
  mergeVersionCatalog,
  parseStableRelease,
  validateCatalog,
} from '../../scripts/manual/lib/version.mjs';

const stable = (releaseRef, releaseCommit = releaseRef.padEnd(40, '0')) => {
  const parsed = parseStableRelease(releaseRef);
  return { ...parsed, releaseCommit };
};

function throwsCode(block, code, expected, actual) {
  assert.throws(block, (error) => {
    assert.equal(error.code, code);
    assert.ok(Object.hasOwn(error, 'expected'));
    assert.ok(Object.hasOwn(error, 'actual'));
    if (arguments.length >= 3) assert.deepEqual(error.expected, expected);
    if (arguments.length >= 4) assert.deepEqual(error.actual, actual);
    return true;
  });
}

test('parses an optional-v stable release into the exact version object', () => {
  assert.deepEqual(parseStableRelease('v1.11.3'), {
    releaseRef: 'v1.11.3',
    major: 1,
    minor: 11,
    patch: 3,
    minorVersion: '1.11',
    channel: 'stable',
  });
});

test('rejects prereleases and non-canonical numeric versions', () => {
  for (const releaseRef of ['1.12.0-rc.1', '01.12.0', '1.02.0', '1.2']) {
    throwsCode(() => parseStableRelease(releaseRef), 'RELEASE_SEMVER', 'stable semantic release', releaseRef);
  }
});

test('keeps safe integer captures numeric and rejects unsafe semver components', () => {
  assert.equal(parseStableRelease('9007199254740991.1.0').major, 9007199254740991);
  for (const releaseRef of ['9007199254740992.1.0', '1.9007199254740993.0', '1.0.9007199254740992']) {
    assert.throws(() => parseStableRelease(releaseRef), (error) => {
      assert.equal(error.code, 'RELEASE_SEMVER_RANGE');
      assert.equal(error.expected, 'safe integer');
      assert.match(error.actual, /^900719925474099[23]$/);
      return true;
    });
  }
});

test('validates schema, order, uniqueness, latest, and release/minor invariants', () => {
  const valid = {
    schema: 1,
    latest: '1.11',
    versions: [stable('1.10.2'), stable('1.11.0')],
  };
  assert.equal(validateCatalog(valid), valid);

  throwsCode(() => validateCatalog({ ...valid, schema: 2 }), 'CATALOG_SCHEMA', 1, 2);
  throwsCode(
    () => validateCatalog({ ...valid, versions: [stable('1.11.0'), stable('1.10.2')] }),
    'CATALOG_UNSORTED',
  );
  throwsCode(
    () => validateCatalog({ ...valid, versions: [stable('1.10.2'), stable('1.10.3')] }),
    'CATALOG_DUPLICATE_MINOR',
  );
  throwsCode(() => validateCatalog({ ...valid, latest: '1.12' }), 'CATALOG_LATEST', 'a published stable minor', '1.12');
  throwsCode(
    () => validateCatalog({ ...valid, versions: [{ ...stable('1.11.0'), minorVersion: '1.12' }] }),
    'CATALOG_RELEASE_MINOR',
  );
  throwsCode(
    () => validateCatalog({ ...valid, versions: [{ ...stable('1.11.0'), channel: 'preview' }] }),
    'CATALOG_LATEST_STABLE',
    'stable',
    'preview',
  );
});

test('merges a higher patch while preserving every older minor', () => {
  const previous = {
    schema: 1,
    latest: '1.11',
    versions: [stable('1.9.8'), stable('1.10.2'), stable('1.11.0')],
  };

  const merged = mergeVersionCatalog(previous, stable('v1.10.4'));

  assert.deepEqual(merged.versions.map(({ releaseRef }) => releaseRef), ['1.9.8', 'v1.10.4', '1.11.0']);
  assert.equal(merged.latest, '1.11');
  assert.deepEqual(previous.versions.map(({ releaseRef }) => releaseRef), ['1.9.8', '1.10.2', '1.11.0']);
});

test('appends a minor in numeric order and selects the highest stable latest', () => {
  const previous = { schema: 1, latest: '1.9', versions: [stable('1.9.8')] };
  const merged = mergeVersionCatalog(previous, stable('1.11.0'));
  const result = mergeVersionCatalog(merged, stable('1.10.4'));

  assert.deepEqual(result.versions.map(({ minorVersion }) => minorVersion), ['1.9', '1.10', '1.11']);
  assert.equal(result.latest, '1.11');
});

test('rejects patch downgrade, channel change, and equal-patch replacement', () => {
  const previous = { schema: 1, latest: '1.11', versions: [stable('1.11.3')] };
  throwsCode(
    () => mergeVersionCatalog(previous, stable('1.11.2')),
    'CATALOG_PATCH_DOWNGRADE',
    3,
    2,
  );
  throwsCode(
    () => mergeVersionCatalog(previous, { ...stable('1.11.4'), channel: 'preview' }),
    'CATALOG_CHANNEL_CHANGE',
    'stable',
    'preview',
  );
  throwsCode(
    () => mergeVersionCatalog(previous, stable('v1.11.3')),
    'CATALOG_PATCH_NOT_HIGHER',
    '> 3',
    3,
  );
});
