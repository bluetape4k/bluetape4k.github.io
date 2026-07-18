# Manual Top-Level Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Manuals a first-class global destination between Ecosystem and Blog, with one bilingual collection home that routes readers to all eight published repository manuals.

**Architecture:** A pure static-sidebar builder validates `src/data/manual/repositories.json` and derives the complete global sidebar, so the repository list has one source of truth and can be tested without booting Astro. A bilingual `ManualDirectory.astro` component reads the same validated registry and renders localized latest-stable links plus task-oriented repository guidance on `/manual/` and `/ko/manual/`. Existing repository-manual middleware remains the only authority for version-aware trees, selectors, and Home/previous/next navigation.

**Tech Stack:** Astro 6, Starlight 0.39, TypeScript/Astro components, Node.js ESM and `node:test`, MDX, existing CSS tokens and manual validators.

---

## File map

| File | Responsibility |
| --- | --- |
| `scripts/manual/lib/sidebar.mjs` | Validate the repository registry and build the complete static Start/Ecosystem/Manuals/Blog sidebar. |
| `tests/manual/directory.test.mjs` | Lock top-level order, localized labels, registry order, repository routes, component data use, and bilingual page wiring. |
| `astro.config.mjs` | Load the registry and install the generated static sidebar; remove the obsolete Projects-only Ecosystem entry. |
| `src/components/ManualDirectory.astro` | Render the eight localized manual choices with current minor versions and task-oriented descriptions. |
| `src/content/docs/manual/index.mdx` | Explain the English collection boundary and render the shared directory. |
| `src/content/docs/ko/manual/index.mdx` | Explain the same boundary in natural Korean and render the shared directory. |
| `src/styles/manual.css` | Add directory-only card, focus, contrast, and narrow-width rules without changing existing manual diagrams or repository trees. |

### Task 1: Lock the global sidebar contract with a pure failing test

**Files:**
- Create: `tests/manual/directory.test.mjs`
- Create: `scripts/manual/lib/sidebar.mjs`

- [ ] Add a test that loads and validates the production registry, then imports `buildStaticSidebar` from the not-yet-created module:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildStaticSidebar } from '../../scripts/manual/lib/sidebar.mjs';
import { validateRepositoryRegistry } from '../../scripts/manual/lib/repositories.mjs';

const registry = validateRepositoryRegistry(JSON.parse(
  await readFile(new URL('../../src/data/manual/repositories.json', import.meta.url), 'utf8'),
));

test('global sidebar promotes every repository manual between Ecosystem and Blog', () => {
  const sidebar = buildStaticSidebar(registry);
  assert.deepEqual(sidebar.map(({ label }) => label), ['Start', 'Ecosystem', 'Manuals', 'Blog']);
  assert.deepEqual(sidebar.map(({ translations }) => translations.ko), ['시작', '생태계', '매뉴얼', '블로그']);

  const ecosystem = sidebar.find(({ label }) => label === 'Ecosystem');
  assert.deepEqual(
    ecosystem.items.map(({ label }) => label),
    ['Repositories', 'Ecosystem Atlas', 'Examples', 'Version Governance'],
  );

  const manuals = sidebar.find(({ label }) => label === 'Manuals');
  assert.deepEqual(
    manuals.items.map(({ label }) => label),
    ['Manual Home', ...registry.repositories.map(({ label }) => label.en)],
  );
  assert.deepEqual(
    manuals.items.map(({ translations }) => translations.ko),
    ['매뉴얼 홈', ...registry.repositories.map(({ label }) => label.ko)],
  );
  assert.deepEqual(
    manuals.items.slice(1).map(({ link }) => link),
    registry.repositories.map(({ route }) => route.en),
  );
  assert.deepEqual(
    manuals.items.slice(1).map(({ link }) => `/ko${link}`),
    registry.repositories.map(({ route }) => route.ko),
  );
});
```

- [ ] Run `node --test tests/manual/directory.test.mjs` and confirm it fails with `ERR_MODULE_NOT_FOUND` for `sidebar.mjs`.
- [ ] Create `scripts/manual/lib/sidebar.mjs` with one validated builder:

```js
import { validateRepositoryRegistry } from './repositories.mjs';

export function buildStaticSidebar(registry) {
  const { repositories } = validateRepositoryRegistry(registry);
  return [
    {
      label: 'Start',
      translations: { ko: '시작' },
      items: [
        { label: 'Overview', translations: { ko: '개요' }, slug: '' },
        { label: 'Getting Started', translations: { ko: '시작하기' }, slug: 'getting-started' },
      ],
    },
    {
      label: 'Ecosystem',
      translations: { ko: '생태계' },
      items: [
        { label: 'Repositories', translations: { ko: '리포지토리' }, slug: 'ecosystem/repositories' },
        { label: 'Ecosystem Atlas', translations: { ko: '생태계 지도' }, slug: 'ecosystem/atlas' },
        { label: 'Examples', translations: { ko: '예제' }, slug: 'ecosystem/examples' },
        { label: 'Version Governance', translations: { ko: '버전 거버넌스' }, slug: 'ecosystem/version-governance' },
      ],
    },
    {
      label: 'Manuals',
      translations: { ko: '매뉴얼' },
      items: [
        { label: 'Manual Home', translations: { ko: '매뉴얼 홈' }, slug: 'manual' },
        ...repositories.map((repository) => ({
          label: repository.label.en,
          translations: { ko: repository.label.ko },
          link: repository.route.en,
        })),
      ],
    },
    {
      label: 'Blog',
      translations: { ko: '블로그' },
      items: [
        { label: 'Posts', translations: { ko: '글' }, slug: 'blog' },
        { autogenerate: { directory: 'blog' } },
      ],
    },
  ];
}
```

The repository entries deliberately use Starlight `link` items, not `slug` items. The unversioned latest-stable paths are Astro redirects rather than content-collection entries, and Starlight 0.39 automatically injects the active locale into relative `link` values.

- [ ] Run `node --test tests/manual/directory.test.mjs` and require the sidebar assertions to pass.
- [ ] Commit this contract and helper:

```text
Make every published manual a global navigation peer

Constraint: Repository labels and routes must remain registry-derived.
Rejected: Keep a Projects-only link under Ecosystem | It hides seven published manuals.
Confidence: high
Scope-risk: narrow
Directive: Add future repository manuals to repositories.json, not the sidebar builder.
Tested: node --test tests/manual/directory.test.mjs
```

### Task 2: Install the generated sidebar in Starlight

**Files:**
- Modify: `astro.config.mjs`
- Modify: `tests/manual/directory.test.mjs`

- [ ] Extend the test to read `astro.config.mjs` and prove the configuration imports `buildStaticSidebar`, constructs `staticSidebar` from `manualRepositories`, and passes `sidebar: staticSidebar` to Starlight. Also assert the obsolete literal `Bluetape4k Manual` is absent.
- [ ] Run `node --test tests/manual/directory.test.mjs` and confirm the new assertions fail.
- [ ] Add the import and derived value immediately after registry loading:

```js
import { buildStaticSidebar } from './scripts/manual/lib/sidebar.mjs';

const manualRepositories = loadRepositoryRegistry(new URL('./src/data/manual/repositories.json', import.meta.url));
const staticSidebar = buildStaticSidebar(manualRepositories);
```

- [ ] Replace the inline `sidebar: [...]` block with `sidebar: staticSidebar`; do not change redirects, locale configuration, components, or route middleware.
- [ ] Run `node --test tests/manual/directory.test.mjs tests/manual/navigation.test.mjs tests/manual/version-ui.test.mjs` and require both the new static contract and the existing dynamic manual contract to pass.

### Task 3: Build the shared bilingual manual directory

**Files:**
- Create: `src/components/ManualDirectory.astro`
- Modify: `src/styles/manual.css`
- Modify: `tests/manual/directory.test.mjs`

- [ ] Extend the test to prove the component loads the validated registry, reads `repository.label[locale]`, `repository.latestMinor`, and `repository.route[locale]`, and supplies one task description for every production registry slug.
- [ ] Run `node --test tests/manual/directory.test.mjs` and confirm it fails because the component is absent.
- [ ] Create `ManualDirectory.astro` using the same loader pattern as `ManualVersionSelector.astro` and `ManualPageTitle.astro`:

```astro
---
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadRepositoryRegistry } from '../../scripts/manual/lib/repositories.mjs';

type Locale = 'en' | 'ko';
type Copy = {
  label: string;
  version: string;
  open: string;
  purpose: Record<string, string>;
};
const { locale = 'en' } = Astro.props as { locale?: Locale };
const { repositories } = loadRepositoryRegistry(
  pathToFileURL(path.join(process.cwd(), 'src/data/manual/repositories.json')),
);

const copy: Copy = locale === 'ko'
  ? {
      label: '저장소별 Bluetape4k 매뉴얼',
      version: '최신 안정판',
      open: '매뉴얼 열기',
      purpose: {
        'bluetape4k-projects': 'Kotlin 기반 기능, 코루틴, 데이터 접근, 인프라, 웹 통합, 테스트 도구를 찾을 때',
        'bluetape4k-exposed': 'Exposed JDBC/R2DBC 저장소 패턴과 데이터베이스 어댑터를 적용할 때',
        'bluetape4k-aws': 'AWS SDK를 Kotlin답게 사용하고 서비스별 통합 방법을 익힐 때',
        'bluetape4k-leader': '분산 리더 선출, lease, scheduler의 동작과 운영 방식을 설계할 때',
        'bluetape4k-image': '이미지 처리, codec, 분석, OCR, framework 통합이 필요할 때',
        'bluetape4k-graph': '그래프 모델, backend, traversal, graph I/O를 선택하고 구현할 때',
        'bluetape4k-javers': '변경 이력, diff, snapshot, projection을 구성할 때',
        'bluetape4k-text': '형태소 분석, 언어 감지, 사전, 문자열 검색 기능을 적용할 때',
      },
    }
  : {
      label: 'Bluetape4k manuals by repository',
      version: 'Latest stable',
      open: 'Open manual',
      purpose: {
        'bluetape4k-projects': 'For Kotlin foundations, coroutines, data access, infrastructure, web integration, and testing',
        'bluetape4k-exposed': 'For Exposed JDBC/R2DBC repository patterns and database adapters',
        'bluetape4k-aws': 'For Kotlin-friendly AWS SDK ergonomics and service integration',
        'bluetape4k-leader': 'For distributed leader election, leases, schedulers, and operations',
        'bluetape4k-image': 'For image processing, codecs, analysis, OCR, and framework integration',
        'bluetape4k-graph': 'For graph models, backends, traversal, and graph I/O',
        'bluetape4k-javers': 'For audit history, diffs, snapshots, and projections',
        'bluetape4k-text': 'For tokenization, language detection, dictionaries, and text search',
      },
    };

for (const repository of repositories) {
  if (!copy.purpose[repository.slug]) throw new Error(`MANUAL_DIRECTORY_PURPOSE: ${repository.slug}`);
}
---

<nav class="bt4k-manual-directory" aria-label={copy.label}>
  <ul>
    {repositories.map((repository) => (
      <li>
        <a href={repository.route[locale]}>
          <span class="bt4k-manual-directory__version">{copy.version} {repository.latestMinor}</span>
          <strong>{repository.label[locale]}</strong>
          <span>{copy.purpose[repository.slug]}</span>
          <small>{copy.open}<span aria-hidden="true"> →</span></small>
        </a>
      </li>
    ))}
  </ul>
</nav>
```

- [ ] Add these `.bt4k-manual-directory` rules to `src/styles/manual.css`; keep the current card shape with a 1px border and no decorative left rail or extra divider lines:

```css
.bt4k-manual-directory > ul {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin: 1rem 0 2rem;
  padding: 0;
  list-style: none;
}

.bt4k-manual-directory a {
  display: flex;
  min-block-size: 100%;
  flex-direction: column;
  gap: .7rem;
  padding: 1rem;
  border: 1px solid var(--bt4k-card-border);
  border-radius: 8px;
  color: var(--bt4k-card-title);
  text-decoration: none;
  overflow-wrap: anywhere;
  background: var(--bt4k-card-bg);
}

.bt4k-manual-directory a:hover { border-color: var(--sl-color-accent); }
.bt4k-manual-directory a:focus-visible {
  outline: 3px solid var(--sl-color-text-accent);
  outline-offset: 3px;
}
.bt4k-manual-directory strong { color: var(--bt4k-card-title); font-size: 1.05rem; }
.bt4k-manual-directory a > span:not(.bt4k-manual-directory__version) {
  color: var(--bt4k-card-text);
  line-height: 1.55;
}
.bt4k-manual-directory__version {
  inline-size: fit-content;
  padding: .22rem .48rem;
  border-radius: 999px;
  color: #fff;
  font-size: .78rem;
  font-weight: 800;
  line-height: 1;
  background: #2563eb;
}
.bt4k-manual-directory small { margin-block-start: auto; color: var(--sl-color-text-accent); }
:root[data-theme='dark'] .bt4k-manual-directory__version {
  color: #0f172a;
  background: #93c5fd;
}

@media (forced-colors: active) {
  .bt4k-manual-directory a { border-color: CanvasText; }
}

@media (max-width: 42rem) {
  .bt4k-manual-directory > ul { grid-template-columns: 1fr; }
}
```
- [ ] Add forced-colors support for the card border and reduced-motion handling only if a hover transition is introduced.
- [ ] Run `node --test tests/manual/directory.test.mjs` and require the component contract to pass.

### Task 4: Add the English and Korean collection homes

**Files:**
- Create: `src/content/docs/manual/index.mdx`
- Create: `src/content/docs/ko/manual/index.mdx`
- Modify: `tests/manual/directory.test.mjs`

- [ ] Extend the test to prove both pages import `ManualDirectory.astro`, render it with the correct locale, and contain the three distinct reader paths: Ecosystem, Manuals, and Blog.
- [ ] Run `node --test tests/manual/directory.test.mjs` and confirm the bilingual page assertions fail.
- [ ] Create the English page with this content shape:

```mdx
---
title: Manuals
description: Task-oriented, versioned manuals for the published Bluetape4k libraries.
---

import ManualDirectory from '../../../components/ManualDirectory.astro';

Use the **Ecosystem** map to understand how repositories, workshops, and examples connect. Use these **Manuals** when you are ready to install a library, choose a module, follow an implementation path, or diagnose production behavior. Use the **Blog** for focused explanations, comparisons, and stories that complement the canonical manuals.

Every link below opens the repository's latest stable minor line. Inside a repository manual, the version selector can return to an archived minor, while the sidebar and Home/previous/next controls follow that selected version.

## Choose a manual by task

<ManualDirectory locale="en" />
```

- [ ] Create the Korean page as native technical prose rather than a literal translation:

```mdx
---
title: 매뉴얼
description: 배포된 Bluetape4k 라이브러리를 작업 중심으로 설명하는 버전별 매뉴얼입니다.
---

import ManualDirectory from '../../../../components/ManualDirectory.astro';

저장소와 workshop, 예제가 어떻게 이어지는지 큰 그림부터 보고 싶다면 **생태계** 지도를 이용하세요. 라이브러리를 설치하거나 모듈을 고르고, 구현 순서를 따라가거나 운영 중 문제를 해결하려면 **매뉴얼**에서 시작하면 됩니다. **블로그**에는 매뉴얼을 보완하는 주제별 해설과 비교, 개발 경험을 담습니다.

아래 링크는 각 저장소의 최신 안정 minor 버전을 엽니다. 저장소 매뉴얼 안에서는 버전 선택기로 이전 minor 버전을 볼 수 있고, 왼쪽 목차와 홈·이전·다음 링크도 선택한 버전에 맞춰 바뀝니다.

## 하려는 일에 맞는 매뉴얼 고르기

<ManualDirectory locale="ko" />
```

- [ ] Run `node --test tests/manual/directory.test.mjs` and require all bilingual source assertions to pass.
- [ ] Commit the visible site feature:

```text
Give the manual collection its own bilingual entry point

Constraint: Repository manuals remain versioned snapshots of their source repositories.
Rejected: Duplicate module trees on the collection home | Repository manuals already own those details.
Confidence: high
Scope-risk: narrow
Directive: Keep Korean copy native and keep versions and routes registry-derived.
Tested: node --test tests/manual/directory.test.mjs tests/manual/navigation.test.mjs tests/manual/version-ui.test.mjs
```

### Task 5: Prove build output, dynamic navigation preservation, and visual quality

**Files:**
- Review: `astro.config.mjs`
- Review: `scripts/manual/lib/sidebar.mjs`
- Review: `src/components/ManualDirectory.astro`
- Review: `src/content/docs/manual/index.mdx`
- Review: `src/content/docs/ko/manual/index.mdx`
- Review: `src/styles/manual.css`
- Review: `tests/manual/directory.test.mjs`

- [ ] Run `git diff --check`.
- [ ] Run `node --test tests/manual/directory.test.mjs tests/manual/navigation.test.mjs tests/manual/version-ui.test.mjs`.
- [ ] Run `npm test` and require the complete manual/ecosystem Node suite to pass.
- [ ] Run `npm run check:manual` and require all eight repository snapshots to validate without mutation.
- [ ] Run `npm run build` and require Astro check plus production build to pass.
- [ ] Inspect `dist/manual/index.html` and `dist/ko/manual/index.html` with a small Node assertion script. For every registry entry, require the localized label, latest minor, and localized unversioned route to appear in the corresponding page.
- [ ] Inspect a representative non-manual page in `dist/` and prove the sidebar label order is Start, Ecosystem, Manuals, Blog in English and 시작, 생태계, 매뉴얼, 블로그 in Korean.
- [ ] Inspect representative Projects and Leader versioned pages and prove the current dynamic tree, version selector, and Home/previous/next controls are still present.
- [ ] Start the local preview and perform visual QA at desktop and narrow widths on `/manual/` and `/ko/manual/`: check sidebar hierarchy, two-to-one-column wrapping, long Korean descriptions, latest-version badges, hover/focus states, light/dark contrast, and absence of the old Projects-only Ecosystem link.
- [ ] Review the final diff for duplicated repository arrays, hard-coded release numbers outside the registry, translation-style Korean, changes to manual snapshot bodies, and changes to diagram assets. All five must remain absent.
- [ ] If Task 5 requires a corrective edit, rerun the smallest affected test first and then repeat `npm test`, `npm run check:manual`, and `npm run build` before reporting completion.

## Completion evidence

Report these items together:

- changed files and the new `/manual/` and `/ko/manual/` routes;
- exact test, snapshot-validation, and production-build results;
- visual QA coverage for English/Korean, desktop/narrow, and light/dark;
- proof that all eight registry repositories appear and the obsolete Ecosystem manual item is gone;
- proof that repository-manual version trees and Home/previous/next navigation remain unchanged;
- commit SHAs and the remaining PR/merge boundary, without creating or merging a PR unless separately authorized.
