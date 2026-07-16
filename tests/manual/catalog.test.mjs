import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildRedirectCatalog,
  buildUnavailablePage,
  mergeVersionCatalog,
  selectorTarget,
  stableJson,
  validateVersionCatalog,
} from '../../scripts/manual/lib/catalog.mjs';

const projects = {
  slug: 'bluetape4k-projects',
  repository: 'bluetape4k/bluetape4k-projects',
  label: { en: 'Bluetape4k docs', ko: 'Bluetape4k 문서' },
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

const sha = (character) => character.repeat(40);
const entry = (minorVersion, releaseRef, documents) => ({
  minorVersion,
  releaseRef,
  releaseCommit: sha(minorVersion === '1.10' ? 'a' : 'b'),
  sourceCommit: sha(minorVersion === '1.10' ? 'c' : 'd'),
  channel: 'stable',
  documents: { en: [...documents].reverse(), ko: [...documents] },
});

const catalog = {
  schema: 1,
  repository: 'bluetape4k/bluetape4k-projects',
  latest: '1.11',
  versions: [
    entry('1.10', '1.10.4', ['index', 'modules/core']),
    entry('1.11', '1.11.0', ['index', 'modules/core', 'modules/new']),
  ],
};

test('validates and normalizes a version catalog without mutating its input', () => {
  const before = structuredClone(catalog);
  const result = validateVersionCatalog(catalog, projects);
  assert.deepEqual(catalog, before);
  assert.notEqual(result, catalog);
  assert.deepEqual(result.versions.map((version) => version.minorVersion), ['1.10', '1.11']);
  assert.deepEqual(result.versions[0].documents.en, ['index', 'modules/core']);
  assert.throws(() => validateVersionCatalog({ ...catalog, repository: 'evil/repo' }, projects), /REPOSITORY_UNSUPPORTED/);
  assert.throws(() => validateVersionCatalog({ ...catalog, versions: [...catalog.versions, catalog.versions[1]] }, projects), /CATALOG_DUPLICATE_MINOR/);
  assert.throws(() => validateVersionCatalog({ ...catalog, versions: [...catalog.versions].reverse() }, projects), /CATALOG_UNSORTED/);
  assert.throws(() => validateVersionCatalog({
    ...catalog,
    versions: [{ ...catalog.versions[0], documents: { en: ['index', 'modules/core.md'], ko: ['index'] } }],
    latest: '1.10',
  }, projects), /CATALOG_DOCUMENT_ID/);
});

test('canonicalizes nested index document identifiers and selector routes', () => {
  const nested = {
    ...catalog,
    versions: catalog.versions.map((version) => ({
      ...version,
      documents: { en: [...version.documents.en, 'guide/index'], ko: [...version.documents.ko, 'guide/index'] },
    })),
  };
  const normalized = validateVersionCatalog(nested, projects);
  assert.ok(normalized.versions[0].documents.en.includes('guide'));
  assert.deepEqual(selectorTarget(normalized, {
    locale: 'ko', targetMinor: '1.11', sourceMinor: '1.10', documentId: 'guide/index',
  }, projects), { kind: 'document', href: '/ko/manual/bluetape4k-projects/1.11/guide/' });
});

test('merges a new version immutably and rejects duplicate document identifiers', () => {
  const previous = { ...catalog, latest: '1.10', versions: [catalog.versions[0]] };
  const before = structuredClone(previous);
  const merged = mergeVersionCatalog(previous, catalog.versions[1], projects);
  assert.deepEqual(previous, before);
  assert.equal(merged.latest, '1.11');
  assert.deepEqual(merged.versions.map((version) => version.minorVersion), ['1.10', '1.11']);
  assert.throws(() => mergeVersionCatalog(previous, {
    ...catalog.versions[1], documents: { en: ['index', 'index'], ko: ['index'] },
  }, projects), /CATALOG_DUPLICATE_DOCUMENT/);
});

test('selects an exact document or a static unavailable page', () => {
  assert.deepEqual(selectorTarget(catalog, {
    locale: 'ko', targetMinor: '1.11', sourceMinor: '1.10', documentId: 'modules/core',
  }, projects), {
    kind: 'document',
    href: '/ko/manual/bluetape4k-projects/1.11/modules/core/',
  });
  assert.deepEqual(selectorTarget(catalog, {
    locale: 'ko', targetMinor: '1.10', sourceMinor: '1.11', documentId: 'modules/new',
  }, projects), {
    kind: 'not-available',
    href: '/ko/manual/bluetape4k-projects/1.10/not-available/from-1.11/modules/new/',
    targetMinor: '1.10',
    sourceMinor: '1.11',
    documentId: 'modules/new',
  });
});

test('builds cumulative latest redirects and rejects chains and loops', () => {
  const previous = {
    schema: 1,
    repository: 'bluetape4k/bluetape4k-projects',
    redirects: [
      { source: '/manual/bluetape4k-projects/old/', target: '/manual/bluetape4k-projects/1.10/index/' },
    ],
  };
  const result = buildRedirectCatalog({ repository: projects, previous, latestEntry: catalog.versions[1] });
  assert.deepEqual(previous.redirects, [
    { source: '/manual/bluetape4k-projects/old/', target: '/manual/bluetape4k-projects/1.10/index/' },
  ]);
  assert.deepEqual(result.redirects.map(({ source }) => source), [...result.redirects.map(({ source }) => source)].sort());
  assert.ok(result.redirects.some(({ source }) => source === '/ko/manual/bluetape4k-projects/modules/new/'));
  assert.ok(result.redirects.every(({ target }) => target.includes('/1.11/')));

  assert.throws(() => buildRedirectCatalog({
    repository: projects,
    previous: {
      schema: 1,
      repository: 'bluetape4k/bluetape4k-projects',
      redirects: [
        { source: '/manual/bluetape4k-projects/a/', target: '/manual/bluetape4k-projects/b/' },
        { source: '/manual/bluetape4k-projects/b/', target: '/manual/bluetape4k-projects/a/' },
      ],
    },
    latestEntry: catalog.versions[1],
  }), /REDIRECT_LOOP/);
});

test('preserves removed-document redirect sources with a successor or locale index fallback', () => {
  const previous = {
    schema: 1,
    repository: 'bluetape4k/bluetape4k-projects',
    redirects: [
      { source: '/manual/bluetape4k-projects/legacy/', target: '/manual/bluetape4k-projects/1.10/modules/removed/' },
      { source: '/ko/manual/bluetape4k-projects/old/', target: '/ko/manual/bluetape4k-projects/1.10/modules/removed/' },
    ],
  };
  const withSuccessor = buildRedirectCatalog({
    repository: projects,
    previous,
    latestEntry: catalog.versions[1],
    successors: { en: { 'modules/removed': 'modules/new' } },
  });
  assert.equal(
    withSuccessor.redirects.find(({ source }) => source.endsWith('/legacy/')).target,
    '/manual/bluetape4k-projects/1.11/modules/new/',
  );
  assert.equal(
    withSuccessor.redirects.find(({ source }) => source.endsWith('/old/')).target,
    '/ko/manual/bluetape4k-projects/1.11/',
  );
});

test('serializes recursively sorted deterministic JSON with one final LF', () => {
  const value = {
    z: 1,
    versions: [catalog.versions[1], catalog.versions[0]],
    nested: { z: true, a: true },
  };
  const serialized = stableJson(value);
  assert.equal(serialized.endsWith('\n'), true);
  assert.equal(serialized.endsWith('\n\n'), false);
  assert.ok(serialized.indexOf('"nested"') < serialized.indexOf('"versions"'));
  assert.ok(serialized.indexOf('"1.10"') < serialized.indexOf('"1.11"'));
  assert.equal(serialized, stableJson(structuredClone(value)));
});

test('generates natural localized unavailable Markdown with a preserved return route', () => {
  const ko = buildUnavailablePage({ repository: projects, locale: 'ko', targetMinor: '1.10', sourceMinor: '1.11', documentId: 'modules/new' });
  assert.equal(ko.path, 'src/content/docs/ko/manual/bluetape4k-projects/1.10/not-available/from-1.11/modules/new.md');
  assert.match(ko.content, /pagefind: false/);
  assert.match(ko.content, /hidden: true/);
  assert.match(ko.content, /slug: "ko\/manual\/bluetape4k-projects\/1\.10\/not-available\/from-1\.11\/modules\/new"/);
  assert.match(ko.content, /이 문서는 1\.10 버전에 없습니다/);
  assert.match(ko.content, /문서 ID: `modules\/new`/);
  assert.match(ko.content, /이 문서는 해당 버전 이후에 추가되었습니다\./);
  assert.match(ko.content, /\[1\.11 버전으로 돌아가기\]\(\/ko\/manual\/bluetape4k-projects\/1\.11\/modules\/new\/\)/);

  const en = buildUnavailablePage({ repository: projects, locale: 'en', targetMinor: '1.10', sourceMinor: '1.11', documentId: 'modules/new' });
  assert.match(en.content, /slug: "manual\/bluetape4k-projects\/1\.10\/not-available\/from-1\.11\/modules\/new"/);
  assert.match(en.content, /This page is not available in version 1\.10/);
  assert.match(en.content, /Document ID: `modules\/new`/);
  assert.match(en.content, /This document was added after this version\./);
  assert.match(en.content, /\[Return to version 1\.11\]\(\/manual\/bluetape4k-projects\/1\.11\/modules\/new\/\)/);
});

test('keeps Exposed catalogs, selectors, redirects, and unavailable pages inside Exposed', () => {
  const exposedCatalog = { ...structuredClone(catalog), repository: exposed.repository };
  const normalized = validateVersionCatalog(exposedCatalog, exposed);
  assert.throws(() => validateVersionCatalog(exposedCatalog, projects), /REPOSITORY_UNSUPPORTED/);
  assert.deepEqual(selectorTarget(normalized, {
    locale: 'en', targetMinor: '1.11', sourceMinor: '1.10', documentId: 'modules/core',
  }, exposed), { kind: 'document', href: '/manual/bluetape4k-exposed/1.11/modules/core/' });

  const redirects = buildRedirectCatalog({
    repository: exposed,
    previous: { schema: 1, repository: exposed.repository, redirects: [] },
    latestEntry: exposedCatalog.versions[1],
  });
  assert.equal(redirects.repository, exposed.repository);
  assert.ok(redirects.redirects.every(({ source, target }) => source.includes(`/${exposed.slug}/`) && target.includes(`/${exposed.slug}/`)));
  assert.throws(() => buildRedirectCatalog({
    repository: exposed,
    previous: { schema: 1, repository: exposed.repository, redirects: [
      { source: '/manual/bluetape4k-exposed/legacy/', target: '/manual/bluetape4k-projects/1.10/modules/core/' },
    ] },
    latestEntry: exposedCatalog.versions[1],
  }), /REDIRECT_TARGET/);

  const unavailable = buildUnavailablePage({
    repository: exposed, locale: 'ko', targetMinor: '1.10', sourceMinor: '1.11', documentId: 'modules/new',
  });
  assert.equal(unavailable.path, 'src/content/docs/ko/manual/bluetape4k-exposed/1.10/not-available/from-1.11/modules/new.md');
  assert.match(unavailable.content, /ko\/manual\/bluetape4k-exposed\/1\.10/);
});
