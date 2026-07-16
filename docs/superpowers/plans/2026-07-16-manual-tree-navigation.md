# Repository Manual Tree Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every published manual a repository-aware Starlight sidebar plus localized Manual Home, previous, and next navigation derived from validated version catalogs.

**Architecture:** Add one pure navigation model under `scripts/manual/lib/` so Node tests and Astro route middleware consume the same ordering and validation rules. The route middleware loads typed manual content metadata, replaces sidebar and pagination only for validated manual routes, and exposes the selected-version Home link to a narrow `Pagination` override; non-manual routes continue using Starlight defaults.

**Tech Stack:** Astro 6.3.1, Starlight 0.39.2 route-data middleware and component overrides, TypeScript, Node.js ESM, `node:test`, existing manual JSON catalogs.

---

## File structure

- Create `scripts/manual/lib/navigation.mjs`: pure repository tree, section tree,
  reading-order, localization, and boundary validation.
- Create `tests/manual/navigation.test.mjs`: fast unit tests for ordering,
  localization, archived membership, fallback groups, and failure codes.
- Modify `src/starlightRouteData.ts`: load manual entries and catalogs once,
  invoke the model for manual routes, and leave non-manual route data unchanged.
- Create `src/components/ManualPagination.astro`: render the three-region manual
  footer and delegate non-manual pages to Starlight's default Pagination.
- Modify `astro.config.mjs`: register the Pagination override.
- Modify `src/styles/manual.css`: responsive, focus, forced-color, and print
  styles for the manual footer.
- Modify `tests/manual/version-ui.test.mjs`: copy the new integration files into
  the Astro fixture and assert actual built HTML for manual and non-manual pages.

## Task 1: Lock the pure navigation contract with failing tests

**Files:**
- Create: `tests/manual/navigation.test.mjs`

- [ ] **Step 1: Add fixtures and tests for the approved tree and reading order**

Create `tests/manual/navigation.test.mjs` with concrete descriptors for all
eight repositories and two versions of Projects. The test file imports the API
that Task 2 will implement:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildManualNavigation } from '../../scripts/manual/lib/navigation.mjs';

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
    label: { en: `${slug} docs`, ko: `${slug} 문서` },
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
        versions: [release('0.2', ['index'])],
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

test('shows all repositories in registry order and expands only the current repository', () => {
  const result = navigation();
  assert.deepEqual(result.sidebar.map(({ label }) => label), repositories.repositories.map(({ label }) => label.en));
  assert.deepEqual(result.sidebar.map(({ collapsed }) => collapsed), [false, true, true, true, true, true, true, true]);
  assert.equal(result.sidebar[0].entries[0].label, 'Manual Home');
  assert.equal(result.sidebar[1].entries[0].href, '/manual/bluetape4k-exposed/0.2/');
});

test('builds nested groups, reveals the current page, and traverses section boundaries', () => {
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
  assert.equal(result.pagination.prev.documentId, 'guides/learning-path');
  assert.equal(result.pagination.next.documentId, 'modules/alpha/operations');
  assert.equal(result.order.find(({ documentId }) => documentId === 'modules/alpha').isCurrent, true);
});

test('uses the selected archived membership without leaking latest pages', () => {
  const result = navigation({ minorVersion: '1.11', documentId: 'modules/alpha' });
  assert.deepEqual(result.order.map(({ documentId }) => documentId), ['index', 'getting-started', 'modules/alpha']);
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
      id: 'runtime-contracts/shutdown', locale: 'en', repository: 'bluetape4k-projects', minorVersion: '1.12', title: 'Shutdown',
    }],
    current: { locale: 'en', repository: 'bluetape4k-projects', minorVersion: '1.12', documentId: 'runtime-contracts/shutdown' },
  });
  assert.equal(result.sidebar[0].entries.some(({ label }) => label === 'Runtime Contracts'), true);
});

for (const [name, mutate, code] of [
  ['missing generated content', ({ documents }) => documents.filter(({ id }) => id !== 'modules/alpha'), 'NAVIGATION_CONTENT_MISSING'],
  ['duplicate generated content', ({ documents }) => [...documents, documents[0]], 'NAVIGATION_CONTENT_DUPLICATE'],
  ['unplaceable current page', ({ current }) => ({ ...current, documentId: 'modules/missing' }), 'NAVIGATION_CURRENT_MISSING'],
]) {
  test(`fails for ${name}`, () => {
    const input = {
      registry: repositories,
      catalogs,
      documents,
      current: { locale: 'en', repository: 'bluetape4k-projects', minorVersion: '1.12', documentId: 'modules/alpha' },
    };
    const changed = mutate(input);
    if (Array.isArray(changed)) input.documents = changed;
    else input.current = changed;
    assert.throws(() => buildManualNavigation(input), new RegExp(code));
  });
}
```

- [ ] **Step 2: Run the focused test and verify the missing-module failure**

Run:

```bash
node --test tests/manual/navigation.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for
`scripts/manual/lib/navigation.mjs`.

## Task 2: Implement the catalog-driven navigation model

**Files:**
- Create: `scripts/manual/lib/navigation.mjs`
- Test: `tests/manual/navigation.test.mjs`

- [ ] **Step 1: Implement explicit localization, deterministic ordering, and validation**

Create `scripts/manual/lib/navigation.mjs` with these public and private
contracts. Keep the returned link shape compatible with Starlight's
`SidebarLink`: `type`, `label`, `href`, `isCurrent`, `badge`, and `attrs`.

```js
import { manualRouteFor } from './paths.mjs';
import { validateVersionCatalog } from './catalog.mjs';
import { validateRepositoryRegistry } from './repositories.mjs';

const SECTION_ORDER = [
  'getting-started', 'architecture', 'guides', 'modules', 'core',
  'integrations', 'native', 'backends', 'frameworks', 'persistence',
  'graph-io', 'examples', 'operations', 'quality', 'benchmarks',
];

const SECTION_LABELS = {
  architecture: { en: 'Architecture', ko: '아키텍처' },
  guides: { en: 'Guides', ko: '가이드' },
  modules: { en: 'Modules', ko: '모듈' },
  core: { en: 'Core', ko: '핵심 기능' },
  integrations: { en: 'Integrations', ko: '통합' },
  native: { en: 'Native', ko: '네이티브' },
  backends: { en: 'Backends', ko: '백엔드' },
  frameworks: { en: 'Frameworks', ko: '프레임워크' },
  persistence: { en: 'Persistence', ko: '영속성' },
  'graph-io': { en: 'Graph I/O', ko: '그래프 입출력' },
  examples: { en: 'Examples', ko: '예제' },
  operations: { en: 'Operations', ko: '운영' },
  quality: { en: 'Quality', ko: '품질' },
  benchmarks: { en: 'Benchmarks', ko: '벤치마크' },
};

function fail(code, actual) {
  const error = new Error(`${code}: ${String(actual)}`);
  error.code = code;
  error.actual = actual;
  throw error;
}

function words(value) {
  return value.split('-').map((part) => part.length === 0 ? part : `${part[0].toUpperCase()}${part.slice(1)}`).join(' ');
}

function sectionLabel(section, locale) {
  return SECTION_LABELS[section]?.[locale] ?? words(section);
}

function link({ label, href, isCurrent = false, documentId }) {
  return { type: 'link', label, href, isCurrent, badge: undefined, attrs: {}, documentId };
}

function versionFrom(catalog, minorVersion) {
  const version = catalog.versions.find((candidate) => candidate.minorVersion === minorVersion);
  if (!version) fail('NAVIGATION_VERSION_MISSING', minorVersion);
  return version;
}

function descriptorKey({ repository, minorVersion, locale, id }) {
  return `${repository}\u0000${minorVersion}\u0000${locale}\u0000${id}`;
}

function indexDocuments(documents) {
  const index = new Map();
  for (const document of documents) {
    const key = descriptorKey(document);
    if (index.has(key)) fail('NAVIGATION_CONTENT_DUPLICATE', key);
    if (typeof document.title !== 'string' || document.title.trim() === '') fail('NAVIGATION_TITLE_MISSING', key);
    index.set(key, document);
  }
  return index;
}

function documentRank(documentId) {
  if (documentId === 'index') return -2;
  if (documentId === 'getting-started') return -1;
  const section = SECTION_ORDER.indexOf(documentId.split('/')[0]);
  return section >= 0 ? section : SECTION_ORDER.length;
}

function compareDocumentId(left, right) {
  return documentRank(left) - documentRank(right) || left.localeCompare(right, 'en');
}

function documentLink({ document, locale, repository, minorVersion, currentId }) {
  return link({
    label: document.title,
    href: manualRouteFor(locale, repository, minorVersion, `${document.id}.md`),
    isCurrent: document.id === currentId,
    documentId: document.id,
  });
}

function nestedEntries({ ids, prefix, byId, locale, repository, minorVersion, currentId }) {
  const children = [...new Set(ids
    .filter((id) => id.startsWith(`${prefix}/`))
    .map((id) => id.slice(prefix.length + 1).split('/')[0]))].toSorted();
  const entries = [];
  const overview = byId.get(prefix);
  if (overview) {
    entries.push(link({
      ...documentLink({ document: overview, locale, repository, minorVersion, currentId }),
      label: locale === 'ko' ? '개요' : 'Overview',
    }));
  }
  for (const child of children) {
    const id = `${prefix}/${child}`;
    const descendants = ids.some((candidate) => candidate.startsWith(`${id}/`));
    const document = byId.get(id);
    if (descendants) {
      entries.push({
        type: 'group',
        label: document?.title ?? words(child),
        entries: nestedEntries({ ids, prefix: id, byId, locale, repository, minorVersion, currentId }),
        collapsed: true,
        badge: undefined,
      });
    } else if (document) {
      entries.push(documentLink({ document, locale, repository, minorVersion, currentId }));
    }
  }
  return entries;
}

function currentRepositoryEntries({ ids, byId, locale, repository, minorVersion, currentId }) {
  const homeDocument = byId.get('index');
  if (!homeDocument) fail('NAVIGATION_HOME_MISSING', `${repository.slug}@${minorVersion}:${locale}`);
  const entries = [link({
    label: locale === 'ko' ? '매뉴얼 홈' : 'Manual Home',
    href: manualRouteFor(locale, repository, minorVersion, 'index.md'),
    isCurrent: currentId === 'index',
    documentId: 'index',
  })];
  const gettingStarted = byId.get('getting-started');
  if (gettingStarted) entries.push(documentLink({ document: gettingStarted, locale, repository, minorVersion, currentId }));
  const sections = [...new Set(ids
    .filter((id) => id.includes('/'))
    .map((id) => id.split('/')[0]))].toSorted((left, right) => compareDocumentId(`${left}/`, `${right}/`));
  for (const section of sections) {
    entries.push({
      type: 'group',
      label: sectionLabel(section, locale),
      entries: nestedEntries({ ids, prefix: section, byId, locale, repository, minorVersion, currentId }),
      collapsed: true,
      badge: undefined,
    });
  }
  return entries;
}

function flatten(entries, result = []) {
  for (const entry of entries) {
    if (entry.type === 'link') result.push(entry);
    else flatten(entry.entries, result);
  }
  return result;
}

export function buildManualNavigation({ registry, catalogs, documents, current }) {
  const approvedRegistry = validateRepositoryRegistry(registry);
  if (!['en', 'ko'].includes(current.locale)) fail('NAVIGATION_LOCALE_UNSUPPORTED', current.locale);
  const documentIndex = indexDocuments(documents);
  const currentRepository = approvedRegistry.repositories.find(({ slug }) => slug === current.repository);
  if (!currentRepository) fail('NAVIGATION_REPOSITORY_MISSING', current.repository);

  const sidebar = approvedRegistry.repositories.map((repository) => {
    const rawCatalog = catalogs[repository.slug];
    if (!rawCatalog) fail('NAVIGATION_CATALOG_MISSING', repository.slug);
    const catalog = validateVersionCatalog(rawCatalog, repository);
    const minorVersion = repository.slug === current.repository ? current.minorVersion : catalog.latest;
    const version = versionFrom(catalog, minorVersion);
    const ids = version.documents[current.locale].toSorted(compareDocumentId);
    const byId = new Map(ids.map((id) => {
      const document = documentIndex.get(descriptorKey({
        repository: repository.slug, minorVersion, locale: current.locale, id,
      }));
      if (!document) fail('NAVIGATION_CONTENT_MISSING', `${repository.slug}@${minorVersion}:${current.locale}:${id}`);
      return [id, document];
    }));
    if (!byId.has('index')) fail('NAVIGATION_HOME_MISSING', `${repository.slug}@${minorVersion}:${current.locale}`);
    const entries = repository.slug === current.repository
      ? currentRepositoryEntries({ ids, byId, locale: current.locale, repository, minorVersion, currentId: current.documentId })
      : [link({
          label: current.locale === 'ko' ? '매뉴얼 홈' : 'Manual Home',
          href: manualRouteFor(current.locale, repository, minorVersion, 'index.md'),
          documentId: 'index',
        })];
    return {
      type: 'group',
      label: repository.label[current.locale],
      entries,
      collapsed: repository.slug !== current.repository,
      badge: undefined,
    };
  });

  const currentGroup = sidebar[approvedRegistry.repositories.findIndex(({ slug }) => slug === current.repository)];
  const order = flatten(currentGroup.entries);
  const currentIndex = order.findIndex(({ documentId }) => documentId === current.documentId);
  if (currentIndex < 0 || order.filter(({ documentId }) => documentId === current.documentId).length !== 1) {
    fail('NAVIGATION_CURRENT_MISSING', `${current.repository}@${current.minorVersion}:${current.locale}:${current.documentId}`);
  }
  const home = order.find(({ documentId }) => documentId === 'index');
  const scopePrefix = manualRouteFor(current.locale, currentRepository, current.minorVersion, 'index.md');
  for (const destination of order) {
    if (!destination.href.startsWith(scopePrefix)) fail('NAVIGATION_SCOPE_CROSSING', destination.href);
  }
  return {
    sidebar,
    order,
    home,
    pagination: { prev: order[currentIndex - 1], next: order[currentIndex + 1] },
  };
}
```

- [ ] **Step 2: Run the focused test and fix only contract-level defects**

Run:

```bash
node --test tests/manual/navigation.test.mjs
```

Expected: all navigation model tests PASS. If a failure exposes a typo in the
planned fixture or implementation, keep the approved behavior unchanged and
correct the narrow mismatch.

- [ ] **Step 3: Commit the pure model**

```bash
git add scripts/manual/lib/navigation.mjs tests/manual/navigation.test.mjs
git commit -m "Derive manual navigation from published catalogs" \
  -m "Constraint: Sidebar and pagination must share one repository-version-locale order.\nRejected: Markdown frontmatter navigation | it duplicates publication state.\nConfidence: high\nScope-risk: moderate\nTested: node --test tests/manual/navigation.test.mjs."
```

## Task 3: Integrate navigation into Starlight route data

**Files:**
- Modify: `src/starlightRouteData.ts`
- Modify: `tests/manual/version-ui.test.mjs`

- [ ] **Step 1: Add a source-contract test before changing middleware**

Add this test to `tests/manual/version-ui.test.mjs`:

```js
test('manual route middleware derives sidebar and pagination from one navigation model', async () => {
  const middleware = await read('src/starlightRouteData.ts');
  assert.match(middleware, /getCollection\(['"]docs['"]\)/);
  assert.match(middleware, /buildManualNavigation\(/);
  assert.match(middleware, /route\.sidebar\s*=\s*navigation\.sidebar/);
  assert.match(middleware, /route\.pagination\s*=\s*navigation\.pagination/);
  assert.match(middleware, /route\.manualNavigation\s*=/);
});
```

- [ ] **Step 2: Run the source-contract test and verify it fails**

Run:

```bash
node --test --test-name-pattern="manual route middleware derives" tests/manual/version-ui.test.mjs
```

Expected: FAIL because `src/starlightRouteData.ts` does not use
`buildManualNavigation`.

- [ ] **Step 3: Replace repeated catalog lookup with validated module-level data and apply only to manual routes**

Modify `src/starlightRouteData.ts` so its complete data-loading and manual-route
branch follows this shape while preserving the existing blog social-preview
branch:

```ts
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getCollection } from 'astro:content';
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { validateVersionCatalog } from '../scripts/manual/lib/catalog.mjs';
import { buildManualNavigation } from '../scripts/manual/lib/navigation.mjs';
import { manualRouteFor } from '../scripts/manual/lib/paths.mjs';
import { loadRepositoryRegistry, repositoryBySlug } from '../scripts/manual/lib/repositories.mjs';
import { withBlogSocialPreview } from './lib/socialPreview';

const root = process.cwd();
const manualRepositories = loadRepositoryRegistry(pathToFileURL(path.join(root, 'src/data/manual/repositories.json')));
function loadManualCatalog(repository: (typeof manualRepositories.repositories)[number]) {
  const catalogPath = path.join(root, `src/data/manual/${repository.slug}.versions.json`);
  try {
    return validateVersionCatalog(JSON.parse(readFileSync(catalogPath, 'utf8')), repository);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`NAVIGATION_CATALOG_MISSING: ${repository.slug}`);
    }
    throw error;
  }
}
const manualCatalogs = Object.fromEntries(manualRepositories.repositories.map((repository) => {
  return [repository.slug, loadManualCatalog(repository)];
}));
const manualDocuments = (await getCollection('docs')).flatMap((entry) => {
  const manual = entry.data.manual;
  if (!manual) return [];
  return [{
    id: manual.id,
    locale: entry.id.startsWith('ko/') ? 'ko' : 'en',
    repository: manual.repository,
    minorVersion: manual.minorVersion,
    title: entry.data.title,
  }];
});

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const blog = route.entry.data.blog as { image: string; imageAlt: string } | undefined;
  if (blog) {
    route.head = withBlogSocialPreview(route.head, blog, context.site ?? new URL('https://bluetape4k.github.io'));
  }

  const manual = route.entry.data.manual;
  if (!manual) return;
  const repository = repositoryBySlug(manualRepositories, manual.repository);
  const catalog = manualCatalogs[repository.slug];
  const locale = route.locale === 'ko' ? 'ko' : 'en';
  const expectedSlug = manualRouteFor(locale, repository, manual.minorVersion, `${manual.id}.md`)
    .replace(/^\//, '')
    .replace(/\/$/, '');
  if (route.entry.data.slug !== expectedSlug) {
    throw new Error(`NAVIGATION_ROUTE_MISMATCH: ${String(route.entry.data.slug)} != ${expectedSlug}`);
  }
  if (manual.minorVersion !== catalog.latest) route.entry.data.pagefind = false;

  const navigation = buildManualNavigation({
    registry: manualRepositories,
    catalogs: manualCatalogs,
    documents: manualDocuments,
    current: {
      locale,
      repository: repository.slug,
      minorVersion: manual.minorVersion,
      documentId: manual.id,
    },
  });
  route.sidebar = navigation.sidebar;
  route.hasSidebar = true;
  route.pagination = navigation.pagination;
  route.manualNavigation = { home: navigation.home };
});
```

Add a local declaration or narrow cast only if TypeScript requires it for the
custom `manualNavigation` route-data property. Do not weaken unrelated route
types with `any`.

- [ ] **Step 4: Run the model and middleware source-contract tests**

Run:

```bash
node --test tests/manual/navigation.test.mjs
node --test --test-name-pattern="manual route middleware derives" tests/manual/version-ui.test.mjs
```

Expected: both commands PASS.

- [ ] **Step 5: Commit route integration**

```bash
git add src/starlightRouteData.ts tests/manual/version-ui.test.mjs
git commit -m "Scope manual navigation to validated routes" \
  -m "Constraint: Blog and ecosystem route data must remain untouched.\nConfidence: high\nScope-risk: moderate\nDirective: Keep catalog loading centralized and fail builds on invalid published manual data.\nTested: navigation unit tests and route middleware source-contract test."
```

## Task 4: Add localized three-region manual pagination

**Files:**
- Create: `src/components/ManualPagination.astro`
- Modify: `astro.config.mjs`
- Modify: `src/styles/manual.css`
- Modify: `tests/manual/version-ui.test.mjs`

- [ ] **Step 1: Add failing source and style contract tests**

Add this test to `tests/manual/version-ui.test.mjs`:

```js
test('manual pagination provides previous, Home, and next while preserving defaults', async () => {
  const config = await read('astro.config.mjs');
  const component = await read('src/components/ManualPagination.astro');
  const styles = await read('src/styles/manual.css');
  assert.match(config, /Pagination:\s*['"]\.\/src\/components\/ManualPagination\.astro['"]/);
  assert.match(component, /DefaultPagination/);
  assert.match(component, /manualNavigation\?\.home/);
  for (const copy of ['Previous', 'Next', 'Manual Home', '이전 문서', '다음 문서', '매뉴얼 홈']) {
    assert.ok(component.includes(copy), `missing pagination copy: ${copy}`);
  }
  assert.match(styles, /\.bt4k-manual-pagination/);
  assert.match(styles, /grid-template-areas/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /overflow-wrap:\s*anywhere/);
  assert.match(styles, /@media\s*\(forced-colors:\s*active\)/);
  assert.match(styles, /@media print/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
node --test --test-name-pattern="manual pagination provides" tests/manual/version-ui.test.mjs
```

Expected: FAIL because `ManualPagination.astro` does not exist.

- [ ] **Step 3: Create the narrow Pagination override**

Create `src/components/ManualPagination.astro`:

```astro
---
import DefaultPagination from '@astrojs/starlight/components/Pagination.astro';
import { Icon } from '@astrojs/starlight/components';

type NavigationLink = { label: string; href: string };
type ManualRouteNavigation = { home?: NavigationLink };

const route = Astro.locals.starlightRoute as typeof Astro.locals.starlightRoute & {
  manualNavigation?: ManualRouteNavigation;
};
const home = route.manualNavigation?.home;
const { prev, next } = route.pagination;
const korean = route.locale === 'ko';
const labels = korean
  ? { previous: '이전 문서', home: '매뉴얼 홈', next: '다음 문서' }
  : { previous: 'Previous', home: 'Manual Home', next: 'Next' };
---

{
  home ? (
    <nav class="bt4k-manual-pagination print:hidden" aria-label={korean ? '매뉴얼 페이지 이동' : 'Manual page navigation'}>
      <div class="bt4k-manual-pagination__previous">
        {prev && <a href={prev.href} rel="prev"><Icon name="left-arrow" size="1.25rem" /><span><small>{labels.previous}</small><strong>{prev.label}</strong></span></a>}
      </div>
      <a class="bt4k-manual-pagination__home" href={home.href}><Icon name="document" size="1.1rem" /><span>{labels.home}</span></a>
      <div class="bt4k-manual-pagination__next">
        {next && <a href={next.href} rel="next"><span><small>{labels.next}</small><strong>{next.label}</strong></span><Icon name="right-arrow" size="1.25rem" /></a>}
      </div>
    </nav>
  ) : <DefaultPagination />
}
```

- [ ] **Step 4: Register the override and add responsive styles**

Add this entry to `astro.config.mjs` under `components`:

```js
Pagination: './src/components/ManualPagination.astro',
```

Append this focused block to `src/styles/manual.css`:

```css
.bt4k-manual-pagination {
  display: grid;
  grid-template-areas: 'previous home next';
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: stretch;
  gap: 0.75rem;
  margin-block-start: 2rem;
}

.bt4k-manual-pagination__previous { grid-area: previous; }
.bt4k-manual-pagination__home { grid-area: home; }
.bt4k-manual-pagination__next { grid-area: next; }

.bt4k-manual-pagination a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-block-size: 44px;
  block-size: 100%;
  border: 1px solid var(--sl-color-gray-5);
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: var(--sl-color-gray-2);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.bt4k-manual-pagination__next a { justify-content: flex-end; text-align: end; }
.bt4k-manual-pagination__home { justify-content: center; white-space: nowrap; }
.bt4k-manual-pagination small,
.bt4k-manual-pagination strong { display: block; }
.bt4k-manual-pagination strong { color: var(--sl-color-white); }
.bt4k-manual-pagination a:hover { border-color: var(--sl-color-gray-2); }
.bt4k-manual-pagination a:focus-visible { outline: 3px solid var(--sl-color-accent-high); outline-offset: 3px; }

@media (max-width: 40rem) {
  .bt4k-manual-pagination {
    grid-template-areas: 'previous' 'home' 'next';
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (forced-colors: active) {
  .bt4k-manual-pagination a { border-color: CanvasText; }
}

@media print {
  .bt4k-manual-pagination { display: none; }
}
```

- [ ] **Step 5: Run source/style contract tests and Astro type checking**

Run:

```bash
node --test --test-name-pattern="manual pagination provides" tests/manual/version-ui.test.mjs
npx astro check
```

Expected: test PASS and Astro reports `0 errors`.

- [ ] **Step 6: Commit the pagination UI**

```bash
git add astro.config.mjs src/components/ManualPagination.astro src/styles/manual.css tests/manual/version-ui.test.mjs
git commit -m "Make manual reading controls explicit" \
  -m "Constraint: Preserve Starlight pagination for non-manual routes.\nRejected: Client-side navigation state | normal links cover the required behavior.\nConfidence: high\nScope-risk: narrow\nTested: focused pagination contract test and astro check."
```

## Task 5: Prove behavior in real Astro fixture builds

**Files:**
- Modify: `tests/manual/version-ui.test.mjs`

- [ ] **Step 1: Extend fixture copying and component registration**

In `fixtureProject(t)`, add these files to the copied integration list:

```js
'src/components/ManualPagination.astro',
'scripts/manual/lib/navigation.mjs',
```

Update the fixture's `astro.config.mjs` string so its component map contains:

```js
Pagination: './src/components/ManualPagination.astro'
```

Update the fixture `manualPage(...)` helper so its `id` is the complete manual
document ID, matching production frontmatter and the version catalog:

```js
function manualPage({ locale = 'en', minor, title, id, repository = projects, body = `Static navigation fixture for ${minor}.` }) {
  const commit = minor === '1.12' ? 'b'.repeat(40) : 'a'.repeat(40);
  return [
    '---',
    `title: ${JSON.stringify(title)}`,
    `slug: ${locale === 'ko' ? 'ko/' : ''}manual/${repository.slug}/${minor}/${id}`,
    'manual:',
    `  id: ${JSON.stringify(id)}`,
    `  repository: ${repository.slug}`,
    '  group: fixture',
    '  kind: library',
    `  sourceCommit: ${commit}`,
    `  sourcePath: docs/manual/${locale}/${id}.md`,
    `  minorVersion: ${JSON.stringify(minor)}`,
    `  releaseRef: ${JSON.stringify(`${minor}.0`)}`,
    `  releaseCommit: ${commit}`,
    '  sourceDir: fixture',
    '  layer: build',
    '---', '', `# ${title}`, '', body, '',
  ].join('\n');
}
```

Change existing calls from `id: 'shared'` and `id: 'new'` to
`id: 'modules/shared'` and `id: 'modules/new'`. Add the section-boundary page
with `id: 'guides/learning-path'`. This removes the fixture-only mismatch where
the URL contained `modules/` but `manual.id` did not.

Write valid Projects and Exposed version catalogs before the first successful
fixture build. Change the previous “missing catalog keeps defaults” assertion
into an explicit failed-build assertion containing
`NAVIGATION_CATALOG_MISSING`; the approved design treats a registry entry
without a usable catalog as a publication error. Remove the malformed `1x11`
page from the successful fixture, then build it in a separate negative fixture
and assert `NAVIGATION_ROUTE_MISMATCH` so invalid content paths cannot borrow
valid `1.11` metadata.

- [ ] **Step 2: Add built-HTML assertions for tree, boundaries, localization, and default isolation**

After the fixture build, add assertions with explicit sentinels:

```js
assert.match(latest, />Projects docs<\/span>/);
assert.match(latest, />Exposed docs<\/span>/);
assert.match(latest, />Manual Home<\/span>/);
assert.match(latestNewKo, />매뉴얼 홈<\/span>/);
assert.match(latestNewKo, />이전 문서<\/small>/);
assert.match(latest, /aria-current="page"/);
assert.match(archived, /href="\/manual\/bluetape4k-projects\/1\.11\/"/);
assert.doesNotMatch(archived, /href="\/manual\/bluetape4k-projects\/1\.12\/modules\/new\/"/);
assert.match(exposedManual, /href="\/manual\/bluetape4k-exposed\/1\.11\/"/);
assert.doesNotMatch(nonManual, /bt4k-manual-pagination/);
```

Also assert one section-boundary pair in the fixture by adding
`guides/learning-path` before `modules/shared` to the catalog and checking that
the former page's `rel="next"` points to the latter. Assert the first page has no
`rel="prev"`, the last page has no `rel="next"`, and all emitted manual links
retain the same locale, repository, and minor version as the selected reading
scope. Define `nonManual` from `dist/index.html` after the successful build that
contains valid catalogs.

- [ ] **Step 3: Run the complete fixture suite**

Run:

```bash
node --test tests/manual/version-ui.test.mjs
```

Expected: all version UI tests PASS, including real Astro builds for English,
Korean, archived, latest, non-manual, and unavailable routes.

- [ ] **Step 4: Commit integration coverage**

```bash
git add tests/manual/version-ui.test.mjs
git commit -m "Prove manual navigation in production-shaped builds" \
  -m "Constraint: Archived, latest, Korean, English, and non-manual routes need independent evidence.\nConfidence: high\nScope-risk: narrow\nTested: node --test tests/manual/version-ui.test.mjs."
```

## Task 6: Run full verification and visual QA

**Files:**
- Modify only if verification finds a defect in the files already named above.

- [ ] **Step 1: Run the complete automated test suite**

Run:

```bash
npm test
```

Expected: all existing and new Node tests PASS with no skipped navigation tests.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: `astro check` reports zero errors, Astro builds all routes, and
Pagefind finishes successfully.

- [ ] **Step 3: Start the built site for visual verification**

Run:

```bash
npm run preview -- --host 127.0.0.1 --port 4326
```

Expected: preview listens on `http://127.0.0.1:4326/`.

- [ ] **Step 4: Inspect representative desktop and mobile routes**

Use the browser visual-verification workflow at 1440px and 390px widths for:

```text
http://127.0.0.1:4326/ko/manual/bluetape4k-text/0.2/guides/learning-path/
http://127.0.0.1:4326/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-cassandra/
http://127.0.0.1:4326/ko/ecosystem/atlas/
```

Verify and record:

- eight repository groups appear in registry order on manual routes;
- only the current repository and ancestors of the current page are open;
- long Projects module labels wrap without clipping or horizontal overflow;
- the footer shows previous, `매뉴얼 홈`, and next in three columns on desktop
  and stacks in reading order on mobile;
- first/last-page empty regions do not create misleading controls;
- the ecosystem atlas retains its original sidebar and default pagination;
- keyboard focus is visible on group controls and all three footer links.

- [ ] **Step 5: Stop preview and inspect the final diff**

Run:

```bash
git diff --check
git status --short --branch
git log --oneline develop..HEAD
```

Expected: no whitespace errors, no unexpected generated files, and only the
planned navigation commits appear above `develop`.

- [ ] **Step 6: Commit any verification-only correction, otherwise leave the verified commits unchanged**

If visual or full-build verification required a correction, commit only the
affected planned files:

```bash
git add astro.config.mjs scripts/manual/lib/navigation.mjs src/components/ManualPagination.astro src/starlightRouteData.ts src/styles/manual.css tests/manual/navigation.test.mjs tests/manual/version-ui.test.mjs
git commit -m "Resolve manual navigation verification gaps" \
  -m "Constraint: Corrections are limited to failures observed during full build or visual QA.\nConfidence: high\nScope-risk: narrow\nTested: npm test, npm run build, desktop and mobile manual route inspection."
```

If no correction is required, do not create an empty commit.

## Completion evidence

Before reporting implementation complete, collect:

- `node --test tests/manual/navigation.test.mjs` result;
- `node --test tests/manual/version-ui.test.mjs` result;
- full `npm test` pass count;
- `npm run build` success summary;
- desktop/mobile screenshots or explicit visual-verdict records for Text,
  Projects, and the non-manual ecosystem control route;
- clean `git diff --check` and expected branch status;
- the exact commit range above `develop`.

Do not push, open a PR, merge, or deploy as part of this implementation plan
unless the user separately authorizes those GitHub and production actions.
