# Ecosystem Atlas Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 GitHub Pages 사이트를 Build/Learn/Apply 생태계 지도, `bluetape4k-projects` 저장소 지도, 고밀도 bilingual manual UI를 갖춘 공식 문서 허브로 개선한다.

**Architecture:** Starlight의 기본 접근성·검색·문서 레이아웃은 유지하고 atlas와 manual metadata UI만 작은 Astro component로 추가한다. 생태계 catalog는 정적 JSON으로 검증하며, 동기화된 manual content는 thin Starlight component override를 통해 source SHA와 관련 학습 경로를 표시한다.

**Tech Stack:** Astro 6, Starlight 0.39, TypeScript, Astro components, CSS, Node.js built-in tests, Pagefind, GitHub Pages

---

## 실행 전제

`2026-07-11-projects-manual-sync-plan.md`의 Task 1-5가 완료돼 대표 manual route와 metadata가 존재해야 한다. 기존 `develop`의 세 untracked `.worktrees/**` 경로는 사용자 상태이므로 수정하거나 삭제하지 않는다.

## 파일 구조

```text
src/
├── components/
│   ├── EcosystemAtlas.astro
│   ├── RepositoryModuleMap.astro
│   ├── ManualPageTitle.astro
│   ├── ManualPageSidebar.astro
│   ├── ManualEditLink.astro
│   ├── ManualSourceMeta.astro
│   └── ManualRelatedLinks.astro
├── data/ecosystem/catalog.json
├── styles/{atlas,manual}.css
└── content/docs/
    ├── index.mdx
    ├── ecosystem/{index,repositories,examples}.mdx
    ├── manual/bluetape4k-projects/index.md
    └── ko/...
tests/ecosystem/{catalog,routes}.test.mjs
```

### Task 1: Ecosystem catalog contract

**Files:**
- Create: `src/data/ecosystem/catalog.json`
- Create: `tests/ecosystem/catalog.test.mjs`
- Create: `scripts/ecosystem/validate-catalog.mjs`
- Modify: `package.json`

- [ ] **Step 1: catalog validation tests를 작성한다**.

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog } from '../../scripts/ecosystem/validate-catalog.mjs';

test('requires unique ids and valid reciprocal relations', () => {
  const errors = validateCatalog({
    nodes: [
      { id: 'projects', type: 'repository', layer: 'build', relations: ['missing'] },
      { id: 'projects', type: 'workshop', layer: 'learn', relations: [] },
    ],
  });
  assert(errors.some((error) => error.includes('duplicate id')));
  assert(errors.some((error) => error.includes('missing relation target')));
});
```

- [ ] **Step 2: test가 missing validator로 실패하는지 확인한다**.
- [ ] **Step 3: 허용 type과 layer를 구현한다**.

```js
const TYPES = new Set(['repository', 'workshop', 'application', 'guide']);
const LAYERS = new Set(['build', 'learn', 'apply']);
```

Validator는 unique ID, locale labels/descriptions, valid URL/route, relation target, group, layer를 검사한다.

- [ ] **Step 4: catalog에 현재 ecosystem을 등록한다**.

최소 등록 대상:

- Build: `bluetape4k-projects`, `bluetape4k-exposed`, `bluetape4k-aws`, `bluetape4k-graph`, `bluetape4k-leader`, `bluetape4k-text`, `bluetape4k-image`, `bluetape4k-javers`, `bluetape4k-dependencies`, `bluetape-go`, `bluetape-rs`, `bluetape-py`
- Learn: `bluetape4k-workshop`, `exposed-workshop`, `exposed-r2dbc-workshop`, `timefold-workshop`, `bluetape-go-workshop`, `bluetape-rs-workshop`
- Apply: `clinic-appointment`와 manifest가 등록한 production recipe/benchmark

- [ ] **Step 5: package script를 추가한다**.

```json
"check:ecosystem": "node scripts/ecosystem/validate-catalog.mjs src/data/ecosystem/catalog.json"
```

- [ ] **Step 6: tests와 validator를 실행하고 커밋한다**.

### Task 2: Accessible Build/Learn/Apply atlas

**Files:**
- Create: `src/components/EcosystemAtlas.astro`
- Create: `src/styles/atlas.css`
- Modify: `astro.config.mjs`
- Modify: `src/content/docs/index.mdx`
- Modify: `src/content/docs/ko/index.mdx`

- [ ] **Step 1: component render 계약을 test fixture로 작성한다**.

검사할 DOM 계약:

- `<nav aria-label="Ecosystem atlas">`
- Build/Learn/Apply filter buttons with `aria-pressed`
- 각 node에 label, layer, type text
- SVG 없이 CSS layout과 semantic link 사용
- `<noscript>`가 아니라 항상 존재하는 hierarchical list fallback

- [ ] **Step 2: `EcosystemAtlas.astro`를 구현한다**.

```astro
---
import catalog from '../data/ecosystem/catalog.json';
const { locale = 'en' } = Astro.props;
const label = (node) => node.label[locale] ?? node.label.en;
---
<nav class="bt4k-atlas" aria-label={locale === 'ko' ? '생태계 지도' : 'Ecosystem atlas'}>
  <div class="bt4k-atlas__filters" role="group" aria-label="Content layer">
    {['build', 'learn', 'apply'].map((layer) => (
      <button type="button" data-atlas-filter={layer} aria-pressed="true">{layer}</button>
    ))}
  </div>
  <ul class="bt4k-atlas__nodes">
    {catalog.nodes.map((node) => <li data-layer={node.layer}><a href={node.route ?? node.url}>{label(node)}</a></li>)}
  </ul>
</nav>
```

- [ ] **Step 3: progressive enhancement script를 추가한다** — filter는 `hidden`과 `aria-pressed`만 변경하고 JavaScript가 없어도 전체 목록을 사용할 수 있어야 한다.
- [ ] **Step 4: `atlas.css`에 dark technical map, focus-visible, high-contrast, reduced-motion, mobile list layout을 구현한다**.
- [ ] **Step 5: `astro.config.mjs`의 `customCss`에 `atlas.css`를 추가한다**.
- [ ] **Step 6: EN/KO home hero 아래에 component를 배치한다**.
- [ ] **Step 7: `npm run build`와 representative output DOM 검사를 실행한다**.
- [ ] **Step 8: 커밋한다**.

### Task 3: Repository module map

**Files:**
- Create: `src/components/RepositoryModuleMap.astro`
- Create: `src/content/docs/ecosystem/bluetape4k-projects.mdx`
- Create: `src/content/docs/ko/ecosystem/bluetape4k-projects.mdx`
- Modify: `src/content/docs/ecosystem/repositories.mdx`
- Modify: `src/content/docs/ko/ecosystem/repositories.mdx`

- [ ] **Step 1: normalized manual manifest에서 group과 module을 읽는 render test를 작성한다**.
- [ ] **Step 2: group → module → manual route를 semantic nested list로 구현한다**.
- [ ] **Step 3: wide screen에서는 관계 지도, narrow screen에서는 grouped cards로 표현한다**.
- [ ] **Step 4: Projects hub에 repository role, recommended guide paths, related workshops, full module catalog를 작성한다**.
- [ ] **Step 5: 기존 repository cards의 `bluetape4k-projects` link를 내부 hub route로 변경한다**.
- [ ] **Step 6: EN/KO route build와 link를 검증한다**.
- [ ] **Step 7: 커밋한다**.

### Task 4: Manual metadata component overrides

**Files:**
- Create: `src/components/ManualPageTitle.astro`
- Create: `src/components/ManualPageSidebar.astro`
- Create: `src/components/ManualEditLink.astro`
- Create: `src/components/ManualSourceMeta.astro`
- Create: `src/components/ManualRelatedLinks.astro`
- Create: `src/styles/manual.css`
- Modify: `astro.config.mjs`

- [ ] **Step 1: non-manual page가 기존 Starlight component output을 유지하는 test를 작성한다**.
- [ ] **Step 2: manual page가 source SHA, repository, group, related guide/workshop을 출력하는 test를 작성한다**.
- [ ] **Step 3: override는 package component를 직접 import해 recursion을 피한다**.

```astro
---
import DefaultPageTitle from '@astrojs/starlight/components/PageTitle.astro';
import ManualSourceMeta from './ManualSourceMeta.astro';
const manual = Astro.locals.starlightRoute.entry.data.manual;
---
<DefaultPageTitle />
{manual && <ManualSourceMeta manual={manual} />}
```

- [ ] **Step 4: `ManualEditLink`는 site snapshot이 아니라 source SHA의 GitHub 문서를 가리킨다**.

```text
https://github.com/bluetape4k/bluetape4k-projects/blob/<sourceCommit>/<sourcePath>
```

- [ ] **Step 5: `ManualPageSidebar`는 기본 TOC를 보존하고 related links를 뒤에 추가한다**.
- [ ] **Step 6: `manual.css`에 source badge, related cards, code/table mobile overflow, print styles를 구현한다**.
- [ ] **Step 7: `astro.config.mjs`에 `PageTitle`, `PageSidebar`, `EditLink` override와 CSS를 등록한다**.
- [ ] **Step 8: `npm test`, `npm run check:manual`, `npm run build`를 실행한다**.
- [ ] **Step 9: 커밋한다**.

### Task 5: Navigation and Pagefind metadata

**Files:**
- Modify: `astro.config.mjs`
- Modify: `src/content.config.ts`
- Modify: `src/components/ManualSourceMeta.astro`
- Create: `tests/ecosystem/routes.test.mjs`

- [ ] **Step 1: expected EN/KO hub/manual route 목록 test를 작성한다**.
- [ ] **Step 2: sidebar에 `Ecosystem`, `Projects Manual`, `Guides`, `Modules`, `Workshops`, `Journal` group을 추가한다**.
- [ ] **Step 3: manual metadata를 Pagefind filter/metadata attribute로 출력한다**.

```html
<span data-pagefind-filter="layer:build" hidden></span>
<span data-pagefind-filter="repository:bluetape4k-projects" hidden></span>
<span data-pagefind-meta="module:bluetape4k-core" hidden></span>
```

- [ ] **Step 4: production build의 Pagefind output이 manual route를 포함하는지 검사한다**.
- [ ] **Step 5: EN/KO navigation label과 route parity를 검사한다**.
- [ ] **Step 6: 커밋한다**.

### Task 6: Examples and engineering journal integration

**Files:**
- Modify: `src/content/docs/ecosystem/examples.mdx`
- Modify: `src/content/docs/ko/ecosystem/examples.mdx`
- Modify: `src/components/BlogPostList.astro`
- Modify: `src/styles/custom.css`

- [ ] **Step 1: Examples page를 workshop과 reference application으로 분리한다**.
- [ ] **Step 2: 현재 누락된 `bluetape-go-workshop`과 `bluetape-rs-workshop`을 catalog 기반으로 노출한다**.
- [ ] **Step 3: 관심 분야 표를 Build → Learn → Apply 경로 카드로 교체한다**.
- [ ] **Step 4: blog card에 관련 layer/repository metadata가 있을 때만 badge를 표시한다**.
- [ ] **Step 5: 기존 blog frontmatter가 없는 badge 때문에 깨지지 않는지 build로 확인한다**.
- [ ] **Step 6: 커밋한다**.

### Task 7: Social preview alignment

**Files:**
- Create or replace: `public/og-image.png`
- Modify: `astro.config.mjs`

- [ ] **Step 1: 완성된 home의 headline, palette, atlas motif를 고정한 social-card brief를 작성한다**.
- [ ] **Step 2: Sites capability path에 따라 imagegen을 정확히 한 번 호출해 1200×630 landscape card를 만든다**.
- [ ] **Step 3: 생성 이미지의 텍스트가 정확한지 검사하고, unusable한 경우에만 한 번 재시도한다**.
- [ ] **Step 4: 기존 absolute Open Graph/Twitter metadata가 새 asset을 가리키는지 확인한다**.
- [ ] **Step 5: build 후 `/og-image.png` 존재와 dimensions를 확인한다**.
- [ ] **Step 6: 커밋한다**.

### Task 8: Accessibility and responsive browser verification

**Files:**
- Modify only files with proven defects from this verification

- [ ] **Step 1: `npm run dev`를 시작하고 exact Local URL을 in-app browser로 연다**.
- [ ] **Step 2: browser-control skill로 `/`와 `/ko/`의 Build/Learn/Apply filter를 keyboard-only로 확인한다**.
- [ ] **Step 3: desktop과 mobile viewport에서 Projects map의 grouped-list fallback과 manual navigation을 확인한다**.
- [ ] **Step 4: representative EN/KO manual에서 breadcrumb, source SHA, original edit link, related workshop을 확인한다**.
- [ ] **Step 5: 실제 defect만 수정하고 `npm test`, manual/ecosystem checks, build를 다시 실행한다**.
- [ ] **Step 6: visual direction이 승인된 atlas와 다른 경우 수정 후 다시 검증한다**.
- [ ] **Step 7: 커밋한다**.

### Task 9: GitHub Pages deployment proof

**Files:**
- No planned source changes

- [ ] **Step 1: 최종 검증을 실행한다**.

```bash
npm test
npm run check:ecosystem
npm run check:manual
npm run build
git diff --check
```

- [ ] **Step 2: issue/PR assignee, milestone, labels, body parity를 live GitHub에서 확인한다**.
- [ ] **Step 3: PR checks가 green이 될 때까지 실제 failure를 수정한다**.
- [ ] **Step 4: 승인된 workflow에 따라 merge하고 `Deploy Website` 성공을 확인한다**.
- [ ] **Step 5: cache-busted request로 `/`, `/ko/`, Projects hub, 대표 EN/KO manual, Pagefind bundle, `og-image.png`를 확인한다**.
- [ ] **Step 6: PR body의 마지막 Markdown section `## DoD Status`에 실제 배포 결과를 기록한다**.
