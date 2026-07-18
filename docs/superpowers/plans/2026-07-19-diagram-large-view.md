# Diagram Large View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 블로그와 버전별 매뉴얼의 기술 다이어그램만 동일한 전체 화면 UI로 확대하고, 제목·설명·대체 텍스트와 키보드 접근성을 보존한다.

**Architecture:** 블로그와 매뉴얼은 각자의 선택 함수로 확대 대상을 판별하고, 하나의 네이티브 <code>&lt;dialog&gt;</code> UI 초기화기에 대상 정보를 전달한다. Starlight Footer 오버라이드가 현재 문서 종류에 맞춰 컴포넌트를 한 번만 마운트하며, 전역 스타일은 기존 Starlight 테마 변수와 독립적인 어두운 확대 화면을 제공한다.

**Tech Stack:** Astro 6, Starlight 0.39, JavaScript ES modules, native HTML <code>&lt;dialog&gt;</code>, CSS, Node.js test runner

---

## 2026-07-19 전체 범위 결함 수정 보완안

초기 구현의 블로그 선택자는 의미 클래스가 빠진 기술 그림을 놓쳤고, 매뉴얼 선택자는 `/manual-assets/`만 보아 릴리스 README와 공유하는 immutable GitHub 다이어그램을 제외했다. 아래 보완안은 뒤에 남아 있는 초기 구현 단계의 selector·링크 처리 설명보다 우선한다.

- 블로그 전체를 감사해 `post-figure`, class 없는 기술 그림, Markdown chart를 `.bt4k-architecture` 또는 `.bt4k-chart`로 명시한다.
- 대표 이미지와 benchmark 입력 사진은 각각 기존 Hero 클래스와 `.bt4k-screenshot`으로 명시해 확대 대상에서 제외한다.
- 수정한 한국어·영어 기술 그림에는 짧은 현지화 `data-diagram-title`을 함께 둔다.
- 매뉴얼은 `/manual-assets/`와 `bluetape4k` 조직의 immutable README 공유 후보를 찾되, 저장소·40자리 커밋·안전한 `docs/images/readme-diagrams/` 상대 경로·파일 stem이 일치하는 PNG/SVG 쌍만 향상한다.
- 검증된 README 다이어그램의 GitHub 링크는 DOM에서 제거하고, 이미지와 아이콘은 같은 배포 커밋의 SVG를 크게 보기로 연다.
- 저장소 전체 콘텐츠 계약 테스트로 모든 README 공유형 다이어그램과 모든 로컬 블로그 이미지의 명시적 분류를 검증한다.
- 타깃 테스트 후 `npm test`, `npm run build`, 한국어·영어 블로그와 매뉴얼의 실제 브라우저 검증을 수행한다.

중단 조건은 일반 원격 이미지 또는 대표 이미지·스크린샷이 확대 대상으로 들어오거나, README PNG와 다른 저장소·커밋·경로의 SVG가 열리거나, 기존 `/manual-assets/` 확대 기능이 퇴행하는 경우다.

---

## 파일 구조

### 생성

- <code>src/lib/diagramLightbox.mjs</code> — 블로그·매뉴얼별 대상 선택, 제목 결정, DOM 향상과 대화상자 열기·닫기
- <code>src/components/DiagramLightbox.astro</code> — 현지화된 대화상자 마크업과 브라우저 초기화 진입점
- <code>src/styles/diagram-lightbox.css</code> — 확대 버튼, 전체 화면 대화상자, 반응형·접근성·인쇄 스타일
- <code>tests/ecosystem/diagram-lightbox.test.mjs</code> — 선택자, 제목 규칙, 컴포넌트 연결, 스타일과 대표 콘텐츠 계약 검증
- <code>docs/lessons/2026-07-19-diagram-large-view.md</code> — 구현 중 확인한 클릭 표면과 콘텐츠 metadata 경계

### 수정

- <code>src/components/StarlightFooter.astro</code> — 블로그 글과 매뉴얼에서만 확대 컴포넌트 마운트
- <code>astro.config.mjs</code> — 확대 UI 전역 스타일 등록
- <code>src/content/docs/ko/blog/clinic-appointment-part1-not-just-crud.mdx</code> — 한국어 대표 다이어그램 제목 metadata 추가
- <code>src/content/docs/blog/clinic-appointment-part1-not-just-crud.mdx</code> — 영어 대표 다이어그램 제목 metadata 추가

### 책임 경계

- 블로그 선택 함수는 <code>.bt4k-architecture</code>, <code>.bt4k-chart</code>, <code>.bt4k-sequence</code>만 안다.
- 매뉴얼 선택 함수는 <code>/manual-assets/</code> 경로만 안다.
- 확대 UI 초기화기는 콘텐츠 경로를 추측하지 않고 전달된 범위와 metadata만 사용한다.
- Astro 컴포넌트는 현지화와 마운트만 담당하고 대상 판별 규칙을 복제하지 않는다.
- CSS는 표시만 담당하며 JavaScript 상태는 <code>data-*</code>와 <code>html.bt4k-diagram-lightbox-open</code>으로 받는다.

## 실행 전 위험 판정

- 서버, 데이터베이스, 캐시, 동시성, coroutine, 외부 API, 인증·인가, hot path를 변경하지 않으므로 별도 성능·안정성 scan은 N/A다.
- 브라우저 DOM 수명주기는 페이지 로드당 한 번이며 observer와 polling을 사용하지 않는다.
- 가장 큰 사용자 위험은 대표 이미지의 오선택과 빈 배경 클릭 실패다. 선택자 자동 테스트와 실제 브라우저 검증을 각각 rollback 지점으로 둔다.
- 기능 rollback은 <code>StarlightFooter.astro</code>의 마운트와 <code>astro.config.mjs</code>의 stylesheet 등록을 제거하는 것으로 끝난다. 콘텐츠 또는 데이터 migration은 없다.

## 공개 표면 영향

- README, KDoc, changelog, 라이브러리 API, 모듈 등록, BOM, CI/Nightly 범위는 변경하지 않는다.
- 사이트의 한국어·영어 블로그/매뉴얼 UI만 변경하며 대표 clinic 글의 현지화 제목 metadata 두 곳을 함께 갱신한다.

### Task 0: 승인 문서 고정

**Complexity:** Low

**Depends on:** 격리 worktree와 기준 <code>npm test</code> 통과

**Write scope:** 승인된 spec과 plan 두 파일

**Rollback/Rerun:** 문서 리뷰에서 P0/P1이 나오면 문서를 수정하고 영향 관점만 다시 검토한다. 코드 작업은 문서 커밋 전 시작하지 않는다.

**Files:**
- Create: <code>docs/superpowers/specs/2026-07-19-diagram-large-view-design.md</code>
- Create: <code>docs/superpowers/plans/2026-07-19-diagram-large-view.md</code>

- [ ] **Step 1: spec과 plan의 형식 및 리뷰 결과 확인**

Run:

~~~~bash
git diff --no-index --check /dev/null \
  docs/superpowers/specs/2026-07-19-diagram-large-view-design.md
git diff --no-index --check /dev/null \
  docs/superpowers/plans/2026-07-19-diagram-large-view.md
rg -n "최신 통합 결과는 P0 0건, P1 0건|최신 통합 결과: P0 0건, P1 0건" \
  docs/superpowers/specs/2026-07-19-diagram-large-view-design.md \
  docs/superpowers/plans/2026-07-19-diagram-large-view.md
~~~~

Expected: 공백 오류가 없고 spec과 plan의 최신 통합 리뷰가 P0 0건, P1 0건이다. <code>git diff --no-index</code>는 새 파일 차이 때문에 종료 코드 1을 반환할 수 있다.

- [ ] **Step 2: 승인 문서를 기능 브랜치에 커밋**

~~~~bash
git add docs/superpowers/specs/2026-07-19-diagram-large-view-design.md \
  docs/superpowers/plans/2026-07-19-diagram-large-view.md
git commit -m "Fix the diagram enlargement contract before implementation" \
  -m "Constraint: The blog and manual need separate targeting with one user-facing interaction.
Rejected: Broad article-image enhancement | It would enlarge heroes and screenshots.
Confidence: high
Scope-risk: moderate
Directive: Keep title, caption, and alt text as separate contracts.
Tested: artifact whitespace checks; spec and plan perspective review"
~~~~

### Task 1: 대상 선택과 제목 결정 계약

**Complexity:** Low

**Depends on:** Task 0

**Write scope:** selector/title module and its isolated Node tests

**Rollback/Rerun:** selector or title RED/GREEN failure returns only to this task; no Astro component exists yet.

**Files:**
- Create: <code>tests/ecosystem/diagram-lightbox.test.mjs</code>
- Create: <code>src/lib/diagramLightbox.mjs</code>

- [ ] **Step 1: 대상과 제목 규칙의 실패 테스트 작성**

<code>tests/ecosystem/diagram-lightbox.test.mjs</code>을 다음 내용으로 생성한다.

~~~~javascript
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  BLOG_DIAGRAM_SELECTOR,
  MANUAL_DIAGRAM_SELECTOR,
  claimDiagramImage,
  resolveDiagramTitle,
  selectBlogDiagramImages,
  selectManualDiagramImages,
} from '../../src/lib/diagramLightbox.mjs';

const root = new URL('../../', import.meta.url);
const read = (relative) => readFile(new URL(relative, root), 'utf8');

function selectorRoot(expectedSelector, values) {
  return {
    querySelectorAll(selector) {
      assert.equal(selector, expectedSelector);
      return values;
    },
  };
}

test('blog and manual selectors stay inside the approved diagram boundaries', () => {
  assert.equal(
    BLOG_DIAGRAM_SELECTOR,
    'figure:is(.bt4k-architecture, .bt4k-chart, .bt4k-sequence) > img',
  );
  assert.doesNotMatch(BLOG_DIAGRAM_SELECTOR, /blog-hero|post-hero|post-figure/);
  assert.equal(
    MANUAL_DIAGRAM_SELECTOR,
    '.sl-markdown-content img[src^="/manual-assets/"]',
  );
});

test('blog and manual target selection use separate selectors', () => {
  const blogImages = [{ id: 'architecture' }, { id: 'chart' }];
  const manualImages = [{ id: 'manual' }];

  assert.deepEqual(
    selectBlogDiagramImages(selectorRoot(BLOG_DIAGRAM_SELECTOR, blogImages)),
    blogImages,
  );
  assert.deepEqual(
    selectManualDiagramImages(selectorRoot(MANUAL_DIAGRAM_SELECTOR, manualImages)),
    manualImages,
  );
});

test('explicit titles win while only manuals fall back to alt text', () => {
  assert.equal(
    resolveDiagramTitle({
      scope: 'blog',
      explicitTitle: ' 병원 예약 SaaS의 업무 영역 ',
      alt: '긴 접근성 설명',
    }),
    '병원 예약 SaaS의 업무 영역',
  );
  assert.equal(
    resolveDiagramTitle({
      scope: 'manual',
      explicitTitle: '',
      alt: ' 리더 선출의 리스 수명 주기 ',
    }),
    '리더 선출의 리스 수명 주기',
  );
  assert.equal(
    resolveDiagramTitle({
      scope: 'blog',
      explicitTitle: '',
      alt: '파일명을 대신하면 안 되는 긴 설명',
    }),
    '',
  );
});

test('an image can be claimed for enhancement only once', () => {
  const image = {
    dataset: {},
    closest(selector) {
      assert.equal(selector, 'a');
      return null;
    },
  };

  assert.equal(claimDiagramImage(image), true);
  assert.equal(claimDiagramImage(image), false);
});
~~~~

- [ ] **Step 2: 테스트를 실행해 모듈 부재로 실패하는지 확인**

Run:

~~~~bash
node --test tests/ecosystem/diagram-lightbox.test.mjs
~~~~

Expected: FAIL with <code>ERR_MODULE_NOT_FOUND</code> for <code>src/lib/diagramLightbox.mjs</code>.

- [ ] **Step 3: 별도의 대상 선택 함수와 제목 결정 함수 구현**

<code>src/lib/diagramLightbox.mjs</code>을 다음 최소 내용으로 생성한다.

~~~~javascript
export const BLOG_DIAGRAM_SELECTOR =
  'figure:is(.bt4k-architecture, .bt4k-chart, .bt4k-sequence) > img';

export const MANUAL_DIAGRAM_SELECTOR =
  '.sl-markdown-content img[src^="/manual-assets/"]';

export function selectBlogDiagramImages(root = document) {
  return [...root.querySelectorAll(BLOG_DIAGRAM_SELECTOR)];
}

export function selectManualDiagramImages(root = document) {
  return [...root.querySelectorAll(MANUAL_DIAGRAM_SELECTOR)];
}

export function claimDiagramImage(image) {
  if (image.dataset.bt4kDiagramEnhanced === 'true') return false;
  if (image.closest('a')) return false;
  image.dataset.bt4kDiagramEnhanced = 'true';
  return true;
}

export function resolveDiagramTitle({ scope, explicitTitle = '', alt = '' }) {
  const title = explicitTitle.trim();
  if (title) return title;
  return scope === 'manual' ? alt.trim() : '';
}
~~~~

- [ ] **Step 4: 대상과 제목 테스트 통과 확인**

Run:

~~~~bash
node --test tests/ecosystem/diagram-lightbox.test.mjs
~~~~

Expected: 4 tests PASS.

- [ ] **Step 5: 첫 계약 커밋**

~~~~bash
git add tests/ecosystem/diagram-lightbox.test.mjs src/lib/diagramLightbox.mjs
git commit -m "Keep diagram enlargement inside explicit content boundaries" \
  -m "Constraint: Blog and manual content expose different stable targeting signals.
Rejected: One broad article-image selector | It would include heroes and screenshots.
Confidence: high
Scope-risk: narrow
Tested: node --test tests/ecosystem/diagram-lightbox.test.mjs"
~~~~

### Task 2: 네이티브 대화상자와 페이지별 마운트

**Complexity:** Medium

**Depends on:** Task 1

**Write scope:** dialog component, Footer mount, DOM behavior module, component contract tests

**Rollback/Rerun:** Astro check or browser lifecycle failure returns to the dialog component/module without changing selectors or content metadata.

**Files:**
- Modify: <code>tests/ecosystem/diagram-lightbox.test.mjs</code>
- Modify: <code>src/lib/diagramLightbox.mjs</code>
- Create: <code>src/components/DiagramLightbox.astro</code>
- Modify: <code>src/components/StarlightFooter.astro</code>

- [ ] **Step 1: 컴포넌트와 마운트 계약의 실패 테스트 추가**

<code>tests/ecosystem/diagram-lightbox.test.mjs</code> 끝에 다음 테스트를 추가한다.

~~~~javascript
test('Starlight mounts one localized dialog only for blog posts and manuals', async () => {
  const footer = await read('src/components/StarlightFooter.astro');
  const component = await read('src/components/DiagramLightbox.astro');

  assert.match(footer, /import DiagramLightbox from '.\/DiagramLightbox\.astro'/);
  assert.match(footer, /starlightRoute\.entry\.data\.manual/);
  assert.match(footer, /entryId\.startsWith\('blog\/'\)/);
  assert.match(footer, /entryId\.startsWith\('ko\/blog\/'\)/);
  assert.match(footer, /<DiagramLightbox scope=\{diagramScope\} locale=\{locale\}/);

  assert.match(component, /<dialog/);
  assert.match(component, /data-bt4k-diagram-lightbox/);
  assert.match(component, /data-diagram-backdrop/);
  assert.match(component, /aria-label=\{viewLarger\}/);
  assert.match(component, /크게 보기/);
  assert.match(component, /View larger/);
  assert.match(component, /닫기/);
  assert.match(component, /Close/);
  assert.match(component, /initializeDiagramLightbox/);
});
~~~~

- [ ] **Step 2: 테스트를 실행해 컴포넌트 부재로 실패하는지 확인**

Run:

~~~~bash
node --test tests/ecosystem/diagram-lightbox.test.mjs
~~~~

Expected: the new test FAILS with <code>ENOENT</code> for <code>DiagramLightbox.astro</code>.

- [ ] **Step 3: 확대 대화상자 Astro 컴포넌트 생성**

<code>src/components/DiagramLightbox.astro</code>을 다음 내용으로 생성한다.

~~~~astro
---
interface Props {
  scope: 'blog' | 'manual';
  locale: 'en' | 'ko';
}

const { scope, locale } = Astro.props;
const viewLarger = locale === 'ko' ? '크게 보기' : 'View larger';
const close = locale === 'ko' ? '닫기' : 'Close';
---

<dialog
  class="bt4k-diagram-lightbox"
  data-bt4k-diagram-lightbox
  data-scope={scope}
  data-view-larger={viewLarger}
  aria-label={viewLarger}
>
  <section class="bt4k-diagram-lightbox__panel" data-diagram-backdrop>
    <header class="bt4k-diagram-lightbox__header">
      <h2 class="bt4k-diagram-lightbox__title" data-diagram-title hidden></h2>
      <button
        class="bt4k-diagram-lightbox__close"
        type="button"
        data-diagram-close
        aria-label={close}
        title={close}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18"></path>
        </svg>
      </button>
    </header>
    <div class="bt4k-diagram-lightbox__viewport" data-diagram-backdrop>
      <img data-diagram-image alt="" />
    </div>
    <p class="bt4k-diagram-lightbox__caption" data-diagram-caption hidden></p>
  </section>
</dialog>

<script>
  import { initializeDiagramLightbox } from '../lib/diagramLightbox.mjs';

  const dialog = document.querySelector('[data-bt4k-diagram-lightbox]');
  if (dialog instanceof HTMLDialogElement) {
    initializeDiagramLightbox({ dialog, root: document });
  }
</script>
~~~~

- [ ] **Step 4: DOM 향상과 열기·닫기 구현**

<code>src/lib/diagramLightbox.mjs</code>의 기존 export 아래에 다음 구현을 추가한다.

~~~~javascript
function setOptionalText(element, text) {
  element.textContent = text;
  element.hidden = !text;
}

function createOpenButton(label) {
  const button = document.createElement('button');
  button.className = 'bt4k-diagram-open';
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.title = label;
  button.innerHTML = [
    '<svg viewBox="0 0 24 24" aria-hidden="true">',
    '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"></path>',
    '</svg>',
  ].join('');
  return button;
}

function diagramMetadata(image, scope) {
  const figure = image.closest('figure');
  const explicitTitle = figure?.dataset.diagramTitle ?? '';
  const alt = image.getAttribute('alt')?.trim() ?? '';
  const caption =
    scope === 'blog'
      ? figure?.querySelector('figcaption')?.textContent?.trim() ?? ''
      : '';
  return {
    source: image.currentSrc || image.getAttribute('src') || '',
    alt,
    title: resolveDiagramTitle({ scope, explicitTitle, alt }),
    caption,
  };
}

function enhanceImage({ image, scope, label, open }) {
  if (!claimDiagramImage(image)) return;

  const wrapper = document.createElement('span');
  wrapper.className = 'bt4k-diagram-trigger';
  image.before(wrapper);
  wrapper.append(image);

  const button = createOpenButton(label);
  wrapper.append(button);

  const openCurrent = () => {
    const metadata = diagramMetadata(image, scope);
    if (metadata.source && !button.disabled) open(metadata, button);
  };
  image.addEventListener('click', openCurrent);
  button.addEventListener('click', openCurrent);

  const disable = () => {
    button.disabled = true;
    image.classList.remove('bt4k-diagram-trigger__image');
  };
  image.classList.add('bt4k-diagram-trigger__image');
  if (image.complete && image.naturalWidth === 0) disable();
  else image.addEventListener('error', disable, { once: true });
}

export function initializeDiagramLightbox({ dialog, root = document }) {
  if (dialog.dataset.initialized === 'true') return;
  dialog.dataset.initialized = 'true';

  const scope = dialog.dataset.scope;
  if (scope !== 'blog' && scope !== 'manual') return;

  const modalImage = dialog.querySelector('[data-diagram-image]');
  const title = dialog.querySelector('[data-diagram-title]');
  const caption = dialog.querySelector('[data-diagram-caption]');
  const closeButton = dialog.querySelector('[data-diagram-close]');
  const backdropSurfaces = dialog.querySelectorAll('[data-diagram-backdrop]');
  if (!modalImage || !title || !caption || !closeButton || !backdropSurfaces.length) return;

  let restoreFocus = null;
  const close = () => {
    if (dialog.open) dialog.close();
  };
  const open = (metadata, focusTarget) => {
    restoreFocus = focusTarget;
    modalImage.src = metadata.source;
    modalImage.alt = metadata.alt;
    setOptionalText(title, metadata.title);
    setOptionalText(caption, metadata.caption);
    document.documentElement.classList.add('bt4k-diagram-lightbox-open');
    dialog.showModal();
    closeButton.focus();
  };

  const images =
    scope === 'blog'
      ? selectBlogDiagramImages(root)
      : selectManualDiagramImages(root);
  for (const image of images) {
    try {
      enhanceImage({
        image,
        scope,
        label: dialog.dataset.viewLarger || 'View larger',
        open,
      });
    } catch (error) {
      console.warn('Diagram enlargement could not initialize one image.', error);
    }
  }

  closeButton.addEventListener('click', close);
  dialog.addEventListener('click', (event) => {
    if (
      event.target === dialog
      || [...backdropSurfaces].includes(event.target)
    ) close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('bt4k-diagram-lightbox-open');
    modalImage.removeAttribute('src');
    modalImage.alt = '';
    restoreFocus?.focus();
    restoreFocus = null;
  });
}
~~~~

- [ ] **Step 5: Footer에서 블로그와 매뉴얼을 구분해 한 번만 마운트**

<code>src/components/StarlightFooter.astro</code>을 다음 내용으로 교체한다.

~~~~astro
---
import DefaultFooter from '@astrojs/starlight/components/Footer.astro';
import DiagramLightbox from './DiagramLightbox.astro';
import GiscusComments from './GiscusComments.astro';

const { starlightRoute } = Astro.locals;
const entryId = starlightRoute.entry.id;
const isBlogPost =
  (entryId.startsWith('blog/') || entryId.startsWith('ko/blog/')) &&
  entryId !== 'blog/index' &&
  entryId !== 'ko/blog/index';
const isManual = Boolean(starlightRoute.entry.data.manual);
const diagramScope = isManual ? 'manual' : isBlogPost ? 'blog' : undefined;
const locale = starlightRoute.lang === 'ko' ? 'ko' : 'en';
---

{isBlogPost && <GiscusComments />}
{diagramScope && <DiagramLightbox scope={diagramScope} locale={locale} />}
<DefaultFooter />
~~~~

- [ ] **Step 6: 컴포넌트 연결 테스트와 Astro 타입 검사 실행**

Run:

~~~~bash
node --test tests/ecosystem/diagram-lightbox.test.mjs
npx astro check
~~~~

Expected: all diagram-lightbox tests PASS and Astro reports 0 errors.

- [ ] **Step 7: 대화상자 동작 커밋**

~~~~bash
git add src/components/DiagramLightbox.astro src/components/StarlightFooter.astro \
  src/lib/diagramLightbox.mjs tests/ecosystem/diagram-lightbox.test.mjs
git commit -m "Let technical diagrams open without changing content structure" \
  -m "Constraint: Blog and manual routes need separate target detection but identical interaction.
Rejected: Editing every Markdown image | Existing route metadata and asset paths already identify the target set.
Confidence: high
Scope-risk: moderate
Tested: node --test tests/ecosystem/diagram-lightbox.test.mjs; npx astro check"
~~~~

### Task 3: 동일한 확대 UI와 접근성 스타일

**Complexity:** Low

**Depends on:** Task 2

**Write scope:** dedicated stylesheet, Starlight CSS registration, style contract test

**Rollback/Rerun:** style contract or responsive browser failure returns to this stylesheet; dialog behavior and target selection remain unchanged.

**Files:**
- Modify: <code>tests/ecosystem/diagram-lightbox.test.mjs</code>
- Create: <code>src/styles/diagram-lightbox.css</code>
- Modify: <code>astro.config.mjs</code>

- [ ] **Step 1: 스타일 계약의 실패 테스트 추가**

<code>tests/ecosystem/diagram-lightbox.test.mjs</code> 끝에 다음 테스트를 추가한다.

~~~~javascript
test('diagram styles provide visible controls, modal sizing, accessibility modes, and print exclusion', async () => {
  const config = await read('astro.config.mjs');
  const styles = await read('src/styles/diagram-lightbox.css');

  assert.match(config, /['"]\.\/src\/styles\/diagram-lightbox\.css['"]/);
  assert.match(styles, /\.bt4k-diagram-open/);
  assert.match(styles, /cursor:\s*zoom-in/);
  assert.match(styles, /\.bt4k-diagram-lightbox::backdrop/);
  assert.match(styles, /max-inline-size:\s*100%/);
  assert.match(styles, /max-block-size:\s*100%/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /@media\s*\(forced-colors:\s*active\)/);
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(styles, /@media print/);
});
~~~~

- [ ] **Step 2: 테스트를 실행해 stylesheet 부재로 실패하는지 확인**

Run:

~~~~bash
node --test tests/ecosystem/diagram-lightbox.test.mjs
~~~~

Expected: the new style test FAILS with <code>ENOENT</code>.

- [ ] **Step 3: 확대 UI stylesheet 생성**

<code>src/styles/diagram-lightbox.css</code>을 다음 내용으로 생성한다.

~~~~css
.bt4k-diagram-trigger {
  position: relative;
  display: block;
  max-inline-size: 100%;
}

.bt4k-diagram-trigger__image {
  cursor: zoom-in;
}

.bt4k-diagram-open,
.bt4k-diagram-lightbox__close {
  display: inline-grid;
  place-items: center;
  inline-size: 2.75rem;
  block-size: 2.75rem;
  padding: 0;
  cursor: pointer;
  border: 1px solid rgb(255 255 255 / 35%);
  border-radius: 0.65rem;
  color: #fff;
  background: rgb(10 15 28 / 86%);
  box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 35%);
}

.bt4k-diagram-open {
  position: absolute;
  z-index: 2;
  inset-block-start: 0.75rem;
  inset-inline-end: 0.75rem;
}

.bt4k-diagram-open svg,
.bt4k-diagram-lightbox__close svg {
  inline-size: 1.3rem;
  block-size: 1.3rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.bt4k-diagram-open:hover,
.bt4k-diagram-lightbox__close:hover {
  border-color: #fff;
  background: rgb(24 35 58 / 96%);
}

.bt4k-diagram-open:focus-visible,
.bt4k-diagram-lightbox__close:focus-visible {
  outline: 3px solid #7dd3fc;
  outline-offset: 3px;
}

.bt4k-diagram-open:disabled {
  display: none;
}

html.bt4k-diagram-lightbox-open {
  overflow: hidden;
}

.bt4k-diagram-lightbox {
  inset: 0;
  inline-size: 100vw;
  block-size: 100dvh;
  max-inline-size: none;
  max-block-size: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  color: #f8fafc;
  background: transparent;
}

.bt4k-diagram-lightbox::backdrop {
  background: rgb(2 6 23 / 94%);
}

.bt4k-diagram-lightbox__panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 1rem;
  inline-size: 100%;
  block-size: 100%;
  padding: clamp(1rem, 2vw, 2rem);
  background: rgb(2 6 23 / 94%);
}

.bt4k-diagram-lightbox__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.bt4k-diagram-lightbox__title {
  margin: 0;
  color: #f8fafc;
  font-size: clamp(1.1rem, 2vw, 1.55rem);
  line-height: 1.35;
}

.bt4k-diagram-lightbox__title[hidden],
.bt4k-diagram-lightbox__caption[hidden] {
  display: none;
}

.bt4k-diagram-lightbox__header:has(.bt4k-diagram-lightbox__title[hidden]) {
  justify-content: flex-end;
}

.bt4k-diagram-lightbox__viewport {
  display: grid;
  place-items: center;
  min-block-size: 0;
  overflow: auto;
  overscroll-behavior: contain;
  touch-action: pinch-zoom;
}

.bt4k-diagram-lightbox__viewport img {
  display: block;
  inline-size: auto;
  block-size: auto;
  max-inline-size: 100%;
  max-block-size: 100%;
  object-fit: contain;
}

.bt4k-diagram-lightbox__caption {
  max-inline-size: 80rem;
  margin: 0 auto;
  color: #cbd5e1;
  font-size: 0.95rem;
  line-height: 1.55;
  text-align: center;
}

@media (max-width: 42rem) {
  .bt4k-diagram-open {
    inset-block-start: 0.5rem;
    inset-inline-end: 0.5rem;
  }

  .bt4k-diagram-lightbox__panel {
    gap: 0.75rem;
    padding: 0.75rem;
  }
}

@media (forced-colors: active) {
  .bt4k-diagram-open,
  .bt4k-diagram-lightbox__close,
  .bt4k-diagram-lightbox {
    border: 1px solid CanvasText;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bt4k-diagram-open,
  .bt4k-diagram-lightbox__close {
    transition: none;
  }
}

@media print {
  .bt4k-diagram-open,
  .bt4k-diagram-lightbox {
    display: none;
  }
}
~~~~

- [ ] **Step 4: Starlight custom CSS 목록에 stylesheet 등록**

<code>astro.config.mjs</code>의 <code>customCss</code> 값을 다음처럼 바꾼다.

~~~~javascript
customCss: [
  './src/styles/custom.css',
  './src/styles/atlas.css',
  './src/styles/manual.css',
  './src/styles/diagram-lightbox.css',
],
~~~~

- [ ] **Step 5: 스타일 계약과 Astro 타입 검사 통과 확인**

Run:

~~~~bash
node --test tests/ecosystem/diagram-lightbox.test.mjs
npx astro check
~~~~

Expected: all diagram-lightbox tests PASS and Astro reports 0 errors.

- [ ] **Step 6: UI 스타일 커밋**

~~~~bash
git add astro.config.mjs src/styles/diagram-lightbox.css \
  tests/ecosystem/diagram-lightbox.test.mjs
git commit -m "Keep diagram enlargement readable across themes and input modes" \
  -m "Constraint: Controls must stay discoverable for pointer, touch, keyboard, and forced-color users.
Rejected: Hover-only controls | They hide the feature from touch and keyboard users.
Confidence: high
Scope-risk: narrow
Tested: node --test tests/ecosystem/diagram-lightbox.test.mjs; npx astro check"
~~~~

### Task 4: 대표 블로그 제목과 현지화 계약

**Complexity:** Low

**Depends on:** Task 2

**Write scope:** exactly one technical figure in each clinic Part 1 locale plus content contract test

**Rollback/Rerun:** locale mismatch returns to the two paired MDX tags; Hero markup remains untouched.

**Files:**
- Modify: <code>tests/ecosystem/diagram-lightbox.test.mjs</code>
- Modify: <code>src/content/docs/ko/blog/clinic-appointment-part1-not-just-crud.mdx</code>
- Modify: <code>src/content/docs/blog/clinic-appointment-part1-not-just-crud.mdx</code>

- [ ] **Step 1: 대표 블로그 제목 metadata 실패 테스트 추가**

<code>tests/ecosystem/diagram-lightbox.test.mjs</code> 끝에 다음 테스트를 추가한다.

~~~~javascript
test('the clinic article provides localized diagram titles without making the Hero zoomable', async () => {
  const ko = await read('src/content/docs/ko/blog/clinic-appointment-part1-not-just-crud.mdx');
  const en = await read('src/content/docs/blog/clinic-appointment-part1-not-just-crud.mdx');

  assert.match(
    ko,
    /class="bt4k-architecture"\s+data-diagram-title="병원 예약 SaaS의 업무 영역"/,
  );
  assert.match(
    en,
    /class="bt4k-architecture"\s+data-diagram-title="Clinic appointment SaaS domain boundaries"/,
  );
  assert.doesNotMatch(ko, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
  assert.doesNotMatch(en, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
});
~~~~

- [ ] **Step 2: 테스트를 실행해 제목 metadata 부재로 실패하는지 확인**

Run:

~~~~bash
node --test tests/ecosystem/diagram-lightbox.test.mjs
~~~~

Expected: the localized title test FAILS for both articles.

- [ ] **Step 3: 한국어 블로그 다이어그램에 명시적 제목 추가**

<code>src/content/docs/ko/blog/clinic-appointment-part1-not-just-crud.mdx</code>의 기술 다이어그램 시작 태그를 다음처럼 바꾼다.

~~~~mdx
<figure
  class="bt4k-architecture"
  data-diagram-title="병원 예약 SaaS의 업무 영역"
>
~~~~

- [ ] **Step 4: 영어 블로그 다이어그램에 명시적 제목 추가**

<code>src/content/docs/blog/clinic-appointment-part1-not-just-crud.mdx</code>의 대응 기술 다이어그램 시작 태그를 다음처럼 바꾼다.

~~~~mdx
<figure
  class="bt4k-architecture"
  data-diagram-title="Clinic appointment SaaS domain boundaries"
>
~~~~

- [ ] **Step 5: 제목 계약과 양 언어 빌드 확인**

Run:

~~~~bash
node --test tests/ecosystem/diagram-lightbox.test.mjs
npm run build
~~~~

Expected: all diagram-lightbox tests PASS; Astro check and build complete successfully.

- [ ] **Step 6: 현지화 제목 커밋**

~~~~bash
git add src/content/docs/blog/clinic-appointment-part1-not-just-crud.mdx \
  src/content/docs/ko/blog/clinic-appointment-part1-not-just-crud.mdx \
  tests/ecosystem/diagram-lightbox.test.mjs
git commit -m "Give enlarged clinic diagrams concise localized context" \
  -m "Constraint: Alt text remains an accessibility description and captions remain explanatory prose.
Rejected: Reusing long alt text as the blog title | It mixes visible labeling with image description.
Confidence: high
Scope-risk: narrow
Tested: node --test tests/ecosystem/diagram-lightbox.test.mjs; npm run build"
~~~~

### Task 5: 전체 회귀와 실제 브라우저 검증

**Complexity:** Medium

**Depends on:** Tasks 1-4

**Write scope:** verification-driven repairs stay inside Tasks 1-4; final durable lesson is the only new file

**Rollback/Rerun:** any targeted or browser failure returns to its owning task, then Tasks 5.1-5.8 rerun from the beginning.

**Files:**
- Create: <code>docs/lessons/2026-07-19-diagram-large-view.md</code>
- Verify: <code>dist/</code> output and representative routes

- [ ] **Step 1: 저장소 전체 테스트 실행**

Run:

~~~~bash
npm test
~~~~

Expected: all manual and ecosystem tests PASS with 0 failures.

- [ ] **Step 2: 프로덕션 빌드 실행**

Run:

~~~~bash
npm run build
~~~~

Expected: Astro check reports 0 errors and production build completes successfully.

- [ ] **Step 3: 정적 산출물에서 마운트 범위 검증**

Run:

~~~~bash
rg -n "data-bt4k-diagram-lightbox" \
  dist/ko/blog/clinic-appointment-part1-not-just-crud/index.html \
  dist/blog/clinic-appointment-part1-not-just-crud/index.html \
  dist/ko/manual/bluetape4k-leader/0.4/architecture/runtime-model/index.html
test "$(rg -l "data-bt4k-diagram-lightbox" dist/ko/blog/index.html dist/blog/index.html | wc -l | tr -d ' ')" = "0"
~~~~

Expected: the three article/manual pages contain the dialog; both blog index pages contain none.

- [ ] **Step 4: 로컬 preview 시작**

Run:

~~~~bash
npm run preview -- --host 127.0.0.1
~~~~

Expected: Astro preview listens on a local URL, normally <code>http://127.0.0.1:4321/</code>. Keep this process running only for the browser checks.

- [ ] **Step 5: 한국어 블로그에서 대상과 제외 범위 검증**

Open:

<code>http://127.0.0.1:4321/ko/blog/clinic-appointment-part1-not-just-crud/</code>

Verify:

1. Hero에는 확대 아이콘과 <code>zoom-in</code> 커서가 없다.
2. 기술 다이어그램 우측 상단에는 항상 보이는 <code>크게 보기</code> 버튼이 있다.
3. 이미지 클릭과 버튼 클릭이 모두 대화상자를 연다.
4. 제목은 <code>병원 예약 SaaS의 업무 영역</code>이고 기존 <code>figcaption</code>은 하단 설명이다.
5. 닫기 버튼, <code>Escape</code>, backdrop 클릭이 각각 닫는다.
6. 닫힌 뒤 확대 버튼으로 포커스가 돌아온다.

- [ ] **Step 6: 영어 블로그와 한국어 매뉴얼 제목 검증**

Open:

- <code>http://127.0.0.1:4321/blog/clinic-appointment-part1-not-just-crud/</code>
- <code>http://127.0.0.1:4321/ko/manual/bluetape4k-leader/0.4/architecture/runtime-model/</code>

Verify:

1. 영어 버튼과 닫기 접근성 문구가 <code>View larger</code>, <code>Close</code>다.
2. 영어 블로그 제목은 <code>Clinic appointment SaaS domain boundaries</code>다.
3. 매뉴얼 제목은 이미지 <code>alt</code>인 <code>리더 선출의 리스 수명 주기</code>다.
4. 매뉴얼의 다른 장식 이미지와 내비게이션에는 확대 버튼이 없다.

- [ ] **Step 7: 반응형·테마·접근성 모드 검증**

같은 세 페이지에서 다음을 확인한다.

1. 데스크톱과 390px 모바일 viewport에서 제목, 이미지, 닫기 버튼이 화면 밖으로 벗어나지 않는다.
2. 라이트·다크 테마에서 확대 버튼과 닫기 버튼의 대비가 유지된다.
3. 키보드 <code>Tab</code>, <code>Enter</code>, <code>Escape</code>만으로 열고 닫을 수 있다.
4. 브라우저의 reduced-motion emulation에서 필수적이지 않은 애니메이션이 없다.
5. forced-colors emulation 또는 접근성 검사에서 버튼 경계와 포커스 표시가 식별된다.
6. JavaScript를 비활성화한 새 로드에서 기존 이미지와 대체 텍스트가 그대로 표시된다.

- [ ] **Step 8: 최종 diff와 공백 오류 확인**

Run:

~~~~bash
git diff --check
repo-status
git log -5 --oneline
~~~~

Expected: no whitespace errors, no unrelated changed paths, Tasks 0-4의 커밋이 최근 이력에 있으며 작업 트리가 깨끗하다.

- [ ] **Step 9: 재사용 가능한 구현 교훈 기록**

<code>docs/lessons/2026-07-19-diagram-large-view.md</code>을 다음 내용으로 생성한다.

~~~~markdown
# 기술 다이어그램 확대 UI에서 콘텐츠 의미와 클릭 표면을 분리하기

## 맥락

블로그와 매뉴얼은 기술 다이어그램을 표시하는 방식이 다르다. 블로그는 의미가 있는 `figure` 클래스를 사용하고, 매뉴얼은 관리되는 `/manual-assets/` 경로를 사용한다. 모든 본문 이미지를 하나의 선택자로 확대하면 대표 이미지와 일반 스크린샷까지 기능 대상이 된다.

## 결정

대상 감지는 블로그와 매뉴얼별로 분리하고, 확대 대화상자의 UI와 접근성 동작만 통일했다. 블로그 제목, 캡션과 대체 텍스트는 각각 `data-diagram-title`, `figcaption`, `alt`로 역할을 분리했다. 전체 화면 패널에서는 `<dialog>` 자체뿐 아니라 패널 여백과 이미지 viewport의 빈 영역도 명시적인 닫기 표면으로 취급했다.

## 구현 중 확인한 점

전체 화면 자식 패널이 dialog 영역을 모두 덮으면 `event.target === dialog`만으로는 사용자가 보는 어두운 빈 영역 클릭을 감지하지 못한다. 보이는 클릭 표면과 이벤트 대상이 같은지 브라우저에서 확인해야 한다.

## 결과

기존 Markdown과 MDX 이미지 문법을 대량 변경하지 않고 기술 다이어그램만 확대한다. 대표 이미지와 일반 스크린샷은 제외하며, JavaScript가 없어도 기존 콘텐츠는 유지된다.

## 검증

- 대상과 제목 규칙 Node 테스트
- 전체 `npm test`
- 프로덕션 `npm run build`
- 한국어·영어 블로그와 매뉴얼의 데스크톱·모바일 브라우저 확인

## 향후 가드

새 블로그 다이어그램은 짧은 현지화 제목을 `data-diagram-title`에 작성한다. 확대 UI를 수정할 때는 버튼뿐 아니라 이미지 클릭, `Escape`, 닫기 버튼, 패널과 viewport의 빈 영역 클릭, 포커스 복원을 함께 검증한다.
~~~~

- [ ] **Step 10: lesson과 최종 검증 증거 커밋**

~~~~bash
git add docs/lessons/2026-07-19-diagram-large-view.md
git commit -m "Preserve the visible-surface lesson from diagram enlargement" \
  -m "Constraint: Future dialog changes must align visible empty areas with actual click targets.
Confidence: high
Scope-risk: narrow
Tested: npm test; npm run build; representative Korean and English browser checks"
~~~~

## 계획 자체 검토

- 설계의 대상·비대상, 별도 감지, 동일 UI, 제목·설명·대체 텍스트, 접근성, 점진적 향상, 오류 처리, 반응형, 테마, 인쇄와 검증 요구를 Tasks 1-5에 연결했다.
- 외부 Lightbox 의존성, 갤러리 이동, 회전, 다운로드, 기존 모든 블로그 제목 metadata 일괄 수정은 포함하지 않았다.
- 함수명과 DOM hook은 <code>selectBlogDiagramImages</code>, <code>selectManualDiagramImages</code>, <code>resolveDiagramTitle</code>, <code>initializeDiagramLightbox</code>, <code>data-bt4k-diagram-lightbox</code>로 일관되게 사용했다.
- 계획에는 미결정 표식, 구현 없는 포괄 지시, 정의되지 않은 후속 함수가 없다.

## 계획 검토 결과

사용자가 선택한 Inline Execution 경계 안에서 여섯 관점을 분리해 순차 검토하고 현재 저장소 구조와 대조했다.

| 우선순위 | 관점 | 발견 | 조치 |
| --- | --- | --- | --- |
| P1 | 안정성·사용자 | 전체 화면 panel이 dialog를 덮으므로 `event.target === dialog`만으로 빈 영역 닫기를 보장하지 못함 | panel과 viewport를 명시적 backdrop surface로 표시하고 이벤트 대상을 함께 검사하도록 Task 2 수정 |
| P1 | 개발자·증거 | Type A 절차에서는 코드 전에 승인 spec/plan 커밋과 최종 lesson이 필요함 | Task 0과 Task 5 lesson/commit 단계 추가 |
| P2 | 운영 | rollback과 공개 문서/모듈 영향의 N/A 근거가 분산됨 | 실행 전 위험 판정과 공개 표면 영향 절 추가 |

위 조치를 반영한 최신 통합 결과: P0 0건, P1 0건. P2는 문서 안에서 해결했다.
