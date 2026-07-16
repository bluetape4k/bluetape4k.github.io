import test from 'node:test';
import assert from 'node:assert/strict';
import { setDocumentSlug, transformManual } from '../../scripts/manual/lib/frontmatter.mjs';

const projects = {
  slug: 'bluetape4k-projects',
  repository: 'bluetape4k/bluetape4k-projects',
  label: { en: 'Projects docs', ko: 'Projects 문서' },
  latestMinor: '1.11',
  route: { en: '/manual/bluetape4k-projects/', ko: '/ko/manual/bluetape4k-projects/' },
};
const exposed = {
  slug: 'bluetape4k-exposed',
  repository: 'bluetape4k/bluetape4k-exposed',
  label: { en: 'Exposed docs', ko: 'Exposed 문서' },
  latestMinor: '1.11',
  route: { en: '/manual/bluetape4k-exposed/', ko: '/ko/manual/bluetape4k-exposed/' },
};

test('pins dotted minor routes with an explicit Starlight slug', () => {
  const result = setDocumentSlug('---\ntitle: Core\n---\n\nBody\n', projects, 'manual/bluetape4k-projects/1.11/modules/core');
  assert.match(result, /^slug: "manual\/bluetape4k-projects\/1\.11\/modules\/core"$/m);
  assert.throws(() => setDocumentSlug(result, projects, 'manual/bluetape4k-projects/111/modules/core'), /SLUG_UNSAFE/);
  assert.throws(() => setDocumentSlug(result, exposed, 'manual/bluetape4k-projects/1.11/modules/core'), /SLUG_UNSAFE/);
});

test('manual metadata keeps provenance while source links use the published release', () => {
  const sourceCommit = 'a'.repeat(40);
  const result = transformManual({
    content: '---\ntitle: Core\n---\n\n# Core\n\n## Problem {#problem}\n\n[Lifecycle](./core/lifecycle.md)\n\n[Source](../../../../src/Core.kt)\n\n[Module](../../../../bluetape4k/core)\n',
    module: { id: 'core', group: 'foundation', kind: 'library', sourceDir: 'bluetape4k/core' },
    repository: projects, sourceCommit, sourcePath: 'docs/manual/en/modules/core.md',
    releaseRef: '1.11.0',
    releaseCommit: 'c'.repeat(40),
    minorVersion: '1.11',
  });
  assert.match(result, /manual:\n  id: "core"/);
  assert.match(result, /layer: "build"/);
  assert.match(result, /releaseRef: "1\.11\.0"/);
  assert.match(result, /minorVersion: "1\.11"/);
  assert.match(result, new RegExp(`releaseCommit: "${'c'.repeat(40)}"`));
  assert.match(result, /sourceDir: "bluetape4k\/core"/);
  assert.match(result, /github\.com\/bluetape4k\/bluetape4k-projects\/blob\/1\.11\.0\/src\/Core\.kt/);
  assert.match(result, /github\.com\/bluetape4k\/bluetape4k-projects\/tree\/1\.11\.0\/bluetape4k\/core/);
  assert.match(result, /\[Lifecycle\]\(\/manual\/bluetape4k-projects\/1\.11\/modules\/core\/lifecycle\/\)/);
  assert.doesNotMatch(result, new RegExp(`/blob/${sourceCommit}/`));
  assert.doesNotMatch(result, /^# Core$/m);
  assert.match(result, /^## Problem$/m);
  assert.doesNotMatch(result, /\{#problem\}/);
});

test('publishes a repository BOM through the site library content kind', () => {
  const result = transformManual({
    content: '# Javers BOM\n\nBody\n',
    module: { id: 'bluetape4k-javers-bom', group: 'foundation', kind: 'bom', sourceDir: 'bom' },
    repository: {
      slug: 'bluetape4k-javers',
      repository: 'bluetape4k/bluetape4k-javers',
      label: { en: 'Javers docs', ko: 'Javers 문서' },
      latestMinor: '0.2',
      route: { en: '/manual/bluetape4k-javers/', ko: '/ko/manual/bluetape4k-javers/' },
    },
    sourceCommit: 'a'.repeat(40),
    sourcePath: 'docs/manual/en/modules/bluetape4k-javers-bom.md',
    releaseRef: '0.2.1',
    releaseCommit: 'b'.repeat(40),
    minorVersion: '0.2',
  });

  assert.match(result, /kind: "library"/);
  assert.doesNotMatch(result, /kind: "bom"/);
  assert.match(result, /layer: "build"/);
});

test('derives safe frontmatter from a plain Markdown title', () => {
  const result = transformManual({
    content: '# Core model\n\nBody\n',
    module: { id: 'core', group: 'foundation', kind: 'library', sourceDir: 'graph/core' },
    repository: projects,
    sourceCommit: 'a'.repeat(40),
    sourcePath: 'docs/manual/en/architecture/core-model.md',
    releaseRef: '1.11.0',
    releaseCommit: 'c'.repeat(40),
    minorVersion: '1.11',
  });

  assert.match(result, /^title: "Core model"$/m);
  assert.match(result, /manual:\n  id: "core"/);
  assert.doesNotMatch(result, /^# Core model$/m);
  assert.match(result, /\nBody\n$/);
});

test('preserves later H1 sections when deriving frontmatter from a plain Markdown title', () => {
  const result = transformManual({
    content: '# Document title\n\nIntro\n\n# Preserved section\n\nBody\n',
    module: { id: 'core', group: 'foundation', kind: 'library', sourceDir: 'graph/core' },
    repository: projects,
    sourceCommit: 'a'.repeat(40),
    sourcePath: 'docs/manual/en/architecture/core-model.md',
    releaseRef: '1.11.0',
    releaseCommit: 'c'.repeat(40),
    minorVersion: '1.11',
  });

  assert.doesNotMatch(result, /^# Document title$/m);
  assert.match(result, /^# Preserved section$/m);
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
      '',
    ].join('\n'),
    module: {
      id: 'bluetape4k-coroutines',
      group: 'foundation',
      kind: 'library',
      sourceDir: 'bluetape4k/coroutines',
    },
    chapter: {
      id: 'lifecycle',
      en: 'en/modules/bluetape4k-coroutines/lifecycle.md',
      ko: 'ko/modules/bluetape4k-coroutines/lifecycle.md',
    },
    repository: projects,
    sourceCommit,
    sourcePath: 'docs/manual/en/modules/bluetape4k-coroutines/lifecycle.md',
    releaseRef: '1.11.0',
    releaseCommit: 'd'.repeat(40),
    minorVersion: '1.11',
  });

  assert.match(result, /chapterId: "lifecycle"/);
  assert.match(result, /\/manual-assets\/bluetape4k-projects\/1\.11\/coroutines\/scope-lifecycle\.svg/);
  assert.ok(!result.endsWith('\n\n'), 'generated manuals end with one LF');
});

test('rewrites Exposed metadata, manuals, assets, and source links inside Exposed', () => {
  const result = transformManual({
    content: '---\ntitle: JDBC\n---\n\n# JDBC\n\n[Guide](../guides/jdbc-vs-r2dbc.md)\n\n![Map](../../../assets/persistence/path-decision.svg)\n\n[Source](../../../../exposed/jdbc)\n',
    module: { id: 'bluetape4k-exposed-jdbc', group: 'persistence', kind: 'library', sourceDir: 'exposed/jdbc' },
    repository: exposed,
    sourceCommit: 'e'.repeat(40),
    sourcePath: 'docs/manual/en/modules/bluetape4k-exposed-jdbc.md',
    releaseRef: '1.11.0',
    releaseCommit: 'f'.repeat(40),
    minorVersion: '1.11',
  });

  assert.match(result, /repository: "bluetape4k-exposed"/);
  assert.match(result, /\/manual\/bluetape4k-exposed\/1\.11\/guides\/jdbc-vs-r2dbc\//);
  assert.match(result, /\/manual-assets\/bluetape4k-exposed\/1\.11\/persistence\/path-decision\.svg/);
  assert.match(result, /github\.com\/bluetape4k\/bluetape4k-exposed\/tree\/1\.11\.0\/exposed\/jdbc/);
});
