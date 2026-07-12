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

test('chapter metadata and repository-owned asset routes are added', () => {
  const sourceCommit = 'b'.repeat(40);
  const result = transformManual({
    content: [
      '---',
      'title: Lifecycle',
      'manualId: bluetape4k-coroutines',
      'chapterId: lifecycle',
      '---',
      '',
      '# Lifecycle',
      '',
      '![Scope lifecycle](../../../assets/coroutines/scope-lifecycle.svg)',
      '',
    ].join('\n'),
    module: { id: 'bluetape4k-coroutines', group: 'foundation', kind: 'library' },
    chapter: {
      id: 'lifecycle',
      en: 'en/modules/bluetape4k-coroutines/lifecycle.md',
      ko: 'ko/modules/bluetape4k-coroutines/lifecycle.md',
    },
    repository: 'bluetape4k-projects',
    sourceCommit,
    sourcePath: 'docs/manual/en/modules/bluetape4k-coroutines/lifecycle.md',
  });

  assert.match(result, /chapterId: "lifecycle"/);
  assert.match(result, /\/manual-assets\/bluetape4k-projects\/coroutines\/scope-lifecycle\.svg/);
});
