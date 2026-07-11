import test from 'node:test';
import assert from 'node:assert/strict';
import { digestEntries } from '../../scripts/manual/lib/digest.mjs';
import { destinationFor } from '../../scripts/manual/lib/paths.mjs';

test('digest is deterministic and content-sensitive', () => {
  const a = digestEntries([{ path: 'b.md', content: 'B' }, { path: 'a.md', content: 'A' }]);
  const b = digestEntries([{ path: 'a.md', content: 'A' }, { path: 'b.md', content: 'B' }]);
  assert.equal(a, b);
  assert.notEqual(a, digestEntries([{ path: 'a.md', content: 'changed' }]));
});

test('locale paths map to distinct Starlight trees', () => {
  assert.equal(destinationFor('en', 'en/modules/core.md'), 'src/content/docs/manual/bluetape4k-projects/modules/core.md');
  assert.equal(destinationFor('ko', 'ko/modules/core.md'), 'src/content/docs/ko/manual/bluetape4k-projects/modules/core.md');
});
