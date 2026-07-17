import assert from 'node:assert/strict';
import test from 'node:test';
import { buildManualNavigation, parseManualRouteId } from '../../scripts/manual/lib/navigation.mjs';

const slugs = [
  'bluetape4k-projects',
  'bluetape4k-exposed',
  'bluetape4k-aws',
  'bluetape4k-leader',
  'bluetape4k-image',
  'bluetape4k-graph',
  'bluetape4k-javers',
  'bluetape4k-text',
];

const repositories = {
  schema: 1,
  repositories: slugs.map((slug) => ({
    slug,
    repository: `bluetape4k/${slug}`,
    label: slug === 'bluetape4k-projects'
      ? { en: 'Bluetape4k docs', ko: 'Bluetape4k 문서' }
      : { en: `${slug} docs`, ko: `${slug} 문서` },
    latestMinor: slug === 'bluetape4k-projects' ? '1.12' : '0.2',
    route: { en: `/manual/${slug}/`, ko: `/ko/manual/${slug}/` },
  })),
};

const release = (minorVersion, documents, channel = 'stable') => ({
  minorVersion,
  releaseRef: `${minorVersion}.0`,
  releaseCommit: 'a'.repeat(40),
  sourceCommit: 'b'.repeat(40),
  channel,
  documents: { en: documents, ko: documents },
});

const catalogs = Object.fromEntries(repositories.repositories.map((repository) => [
  repository.slug,
  repository.slug === 'bluetape4k-projects'
    ? {
        schema: 1,
        repository: repository.repository,
        latest: '1.12',
        versions: [
          release('1.11', ['index', 'getting-started', 'modules/alpha'], 'archived'),
          release('1.12', [
            'index',
            'getting-started',
            'architecture/repository-map',
            'guides/learning-path',
            'modules/alpha',
            'modules/alpha/operations',
            'quality/release-gates',
          ]),
        ],
      }
    : {
        schema: 1,
        repository: repository.repository,
        latest: '0.2',
        versions: [release('0.2', [
          'index',
          'getting-started',
          'architecture/repository-map',
          'guides/learning-path',
        ])],
      },
]));

const title = (id, locale) => locale === 'ko'
  ? { index: '매뉴얼 홈', 'getting-started': '시작하기' }[id] ?? `${id} 문서`
  : { index: 'Manual home', 'getting-started': 'Getting started' }[id] ?? `${id} page`;

const documents = Object.values(catalogs).flatMap((catalog) =>
  catalog.versions.flatMap((version) => ['en', 'ko'].flatMap((locale) =>
    version.documents[locale].map((id) => ({
      id,
      locale,
      repository: catalog.repository.split('/')[1],
      minorVersion: version.minorVersion,
      title: title(id, locale),
    })),
  )),
);

function navigation(overrides = {}) {
  return buildManualNavigation({
    registry: repositories,
    catalogs,
    documents,
    current: {
      locale: 'en',
      repository: 'bluetape4k-projects',
      minorVersion: '1.12',
      documentId: 'modules/alpha',
      ...overrides,
    },
  });
}

test('shows repositories in registry order', () => {
  const result = navigation();
  assert.deepEqual(
    result.sidebar.map(({ label }) => label),
    repositories.repositories.map(({ label }) => label.en),
  );
});

test('expands only the current repository', () => {
  const result = navigation();
  assert.deepEqual(
    result.sidebar.map(({ collapsed }) => collapsed),
    [false, true, true, true, true, true, true, true],
  );
  assert.equal(result.sidebar[0].entries[0].label, 'Manual Home');
  assert.equal(result.sidebar[1].entries[0].href, '/manual/bluetape4k-exposed/0.2/');
});

test('builds the complete latest tree before a non-current repository is opened', () => {
  const result = navigation();
  const exposed = result.sidebar[1];

  assert.equal(exposed.collapsed, true);
  assert.deepEqual(exposed.entries.map(({ label }) => label), [
    'Manual Home',
    'Getting started',
    'Architecture',
    'Guides',
  ]);
  assert.equal(exposed.entries[2].entries[0].href, '/manual/bluetape4k-exposed/0.2/architecture/repository-map/');
  assert.equal(exposed.entries[3].entries[0].href, '/manual/bluetape4k-exposed/0.2/guides/learning-path/');
});

test('builds a nested tree and reveals the current page', () => {
  const result = navigation();
  assert.deepEqual(result.order.map(({ documentId }) => documentId), [
    'index',
    'getting-started',
    'architecture/repository-map',
    'guides/learning-path',
    'modules/alpha',
    'modules/alpha/operations',
    'quality/release-gates',
  ]);
  assert.equal(result.order.find(({ documentId }) => documentId === 'modules/alpha').isCurrent, true);
});

test('traverses section boundaries in reading order', () => {
  const result = navigation();
  assert.equal(result.pagination.prev.documentId, 'guides/learning-path');
  assert.equal(result.pagination.next.documentId, 'modules/alpha/operations');
});

test('groups Projects modules by learning stage and follows explicit reading order', () => {
  const customCatalogs = structuredClone(catalogs);
  const projects = customCatalogs['bluetape4k-projects'].versions[1];
  projects.documents = {
    en: [...projects.documents.en],
    ko: [...projects.documents.ko],
  };
  for (const locale of ['en', 'ko']) {
    projects.documents[locale].push(
      'modules/core',
      'modules/coroutines',
      'modules/jdbc',
      'modules/alpha/concepts',
    );
  }
  const customDocuments = documents.map((document) => {
    if (document.repository !== 'bluetape4k-projects' || document.minorVersion !== '1.12') return document;
    if (document.id === 'modules/alpha') {
      return { ...document, group: 'data', learningOrder: 620 };
    }
    if (document.id === 'modules/alpha/operations') {
      return { ...document, group: 'data', learningOrder: 620, chapterOrder: 2 };
    }
    return document;
  });
  for (const locale of ['en', 'ko']) {
    customDocuments.push(
      {
        id: 'modules/core', locale, repository: 'bluetape4k-projects', minorVersion: '1.12',
        title: locale === 'ko' ? '핵심 Kotlin 라이브러리' : 'Core Kotlin Library',
        group: 'foundation', learningOrder: 110,
      },
      {
        id: 'modules/coroutines', locale, repository: 'bluetape4k-projects', minorVersion: '1.12',
        title: locale === 'ko' ? 'Coroutine과 Flow 확장' : 'Coroutine and Flow Extensions',
        group: 'concurrency', learningOrder: 200,
      },
      {
        id: 'modules/jdbc', locale, repository: 'bluetape4k-projects', minorVersion: '1.12',
        title: locale === 'ko' ? 'JDBC와 SQL 확장' : 'JDBC and SQL Extensions',
        group: 'data', learningOrder: 600,
      },
      {
        id: 'modules/alpha/concepts', locale, repository: 'bluetape4k-projects', minorVersion: '1.12',
        title: locale === 'ko' ? '핵심 개념' : 'Concepts',
        group: 'data', learningOrder: 620, chapterOrder: 1,
      },
    );
  }

  const result = buildManualNavigation({
    registry: repositories,
    catalogs: customCatalogs,
    documents: customDocuments,
    current: {
      locale: 'en', repository: 'bluetape4k-projects', minorVersion: '1.12', documentId: 'modules/jdbc',
    },
  });
  const modules = result.sidebar[0].entries.find(({ label }) => label === 'Modules');

  assert.deepEqual(modules.entries.map(({ label }) => label), [
    'Foundations',
    'Concurrency',
    'Data Access',
  ]);
  assert.deepEqual(result.order.map(({ documentId }) => documentId), [
    'index',
    'getting-started',
    'architecture/repository-map',
    'guides/learning-path',
    'modules/core',
    'modules/coroutines',
    'modules/jdbc',
    'modules/alpha',
    'modules/alpha/concepts',
    'modules/alpha/operations',
    'quality/release-gates',
  ]);
  assert.equal(result.pagination.prev.documentId, 'modules/coroutines');
  assert.equal(result.pagination.next.documentId, 'modules/alpha');
});

test('uses archived membership without leaking latest pages', () => {
  const result = navigation({ minorVersion: '1.11', documentId: 'modules/alpha' });
  assert.deepEqual(result.order.map(({ documentId }) => documentId), [
    'index',
    'getting-started',
    'modules/alpha',
  ]);
  assert.equal(result.home.href, '/manual/bluetape4k-projects/1.11/');
  assert.equal(result.pagination.next, undefined);
});

test('keeps Korean labels and routes isolated from English', () => {
  const result = navigation({ locale: 'ko', documentId: 'getting-started' });
  assert.equal(result.sidebar[0].entries[0].label, '매뉴얼 홈');
  assert.equal(result.home.href, '/ko/manual/bluetape4k-projects/1.12/');
  assert.match(result.pagination.next.href, /^\/ko\/manual\//);
  assert.equal(result.order.some(({ href }) => href.startsWith('/manual/')), false);
});

test('creates a readable fallback group for an unknown valid section', () => {
  const custom = structuredClone(catalogs);
  custom['bluetape4k-projects'].versions[1].documents.en.push('runtime-contracts/shutdown');
  const result = buildManualNavigation({
    registry: repositories,
    catalogs: custom,
    documents: [...documents, {
      id: 'runtime-contracts/shutdown',
      locale: 'en',
      repository: 'bluetape4k-projects',
      minorVersion: '1.12',
      title: 'Shutdown',
    }],
    current: {
      locale: 'en',
      repository: 'bluetape4k-projects',
      minorVersion: '1.12',
      documentId: 'runtime-contracts/shutdown',
    },
  });
  assert.equal(result.sidebar[0].entries.some(({ label }) => label === 'Runtime Contracts'), true);
});

test('fails when catalog content is not generated', () => {
  assert.throws(() => buildManualNavigation({
    registry: repositories,
    catalogs,
    documents: documents.filter(({ id }) => id !== 'modules/alpha'),
    current: {
      locale: 'en',
      repository: 'bluetape4k-projects',
      minorVersion: '1.12',
      documentId: 'modules/alpha',
    },
  }), /NAVIGATION_CONTENT_MISSING/);
});

test('fails when generated content descriptors are duplicated', () => {
  assert.throws(() => buildManualNavigation({
    registry: repositories,
    catalogs,
    documents: [...documents, documents[0]],
    current: {
      locale: 'en',
      repository: 'bluetape4k-projects',
      minorVersion: '1.12',
      documentId: 'modules/alpha',
    },
  }), /NAVIGATION_CONTENT_DUPLICATE/);
});

test('fails when the current page is outside the selected catalog', () => {
  assert.throws(() => navigation({ documentId: 'modules/missing' }), /NAVIGATION_CURRENT_MISSING/);
});

test('derives nested document identity from its published route', () => {
  assert.deepEqual(
    parseManualRouteId('/ko/manual/bluetape4k-aws/0.4/modules/bluetape4k-aws-exposed/database-settings/'),
    {
      locale: 'ko',
      repository: 'bluetape4k-aws',
      minorVersion: '0.4',
      documentId: 'modules/bluetape4k-aws-exposed/database-settings',
    },
  );
});
