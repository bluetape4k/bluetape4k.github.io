import test from 'node:test';
import assert from 'node:assert/strict';
import { transformManual } from '../../scripts/manual/lib/frontmatter.mjs';

test('manual metadata and immutable source links are added', () => {
  const sourceCommit = 'a'.repeat(40);
  const result = transformManual({
    content: '---\ntitle: Core\n---\n\n# Core\n\n## Problem {#problem}\n\n[Source](../../../../src/Core.kt)\n',
    module: { id: 'core', group: 'foundation', kind: 'library' },
    repository: 'bluetape4k-projects', sourceCommit, sourcePath: 'docs/manual/en/modules/core.md',
  });
  assert.match(result, /manual:\n  id: "core"/);
  assert.match(result, /layer: "build"/);
  assert.match(result, new RegExp(`github.com/bluetape4k/bluetape4k-projects/blob/${sourceCommit}/src/Core.kt`));
  assert.doesNotMatch(result, /^# Core$/m);
  assert.match(result, /^## Problem$/m);
  assert.doesNotMatch(result, /\{#problem\}/);
});
