import test from 'node:test';
import assert from 'node:assert/strict';
import { digestEntries } from '../../scripts/manual/lib/digest.mjs';
import { destinationFor } from '../../scripts/manual/lib/paths.mjs';

const projects = {
  slug: 'bluetape4k-projects',
  repository: 'bluetape4k/bluetape4k-projects',
  label: { en: 'Projects docs', ko: 'Projects 문서' },
  latestMinor: '1.11',
  route: { en: '/manual/bluetape4k-projects/', ko: '/ko/manual/bluetape4k-projects/' },
};

test('digest is deterministic and content-sensitive', () => {
  const a = digestEntries([{ path: 'b.md', content: 'B' }, { path: 'a.md', content: 'A' }]);
  const b = digestEntries([{ path: 'a.md', content: 'A' }, { path: 'b.md', content: 'B' }]);
  assert.equal(a, b);
  assert.notEqual(a, digestEntries([{ path: 'a.md', content: 'changed' }]));
});

test('locale paths map to distinct Starlight trees', () => {
  assert.equal(destinationFor('en', projects, 'en/modules/core.md', '1.11'), 'src/content/docs/manual/bluetape4k-projects/1.11/modules/core.md');
  assert.equal(destinationFor('ko', projects, 'ko/modules/core.md', '1.11'), 'src/content/docs/ko/manual/bluetape4k-projects/1.11/modules/core.md');
});
