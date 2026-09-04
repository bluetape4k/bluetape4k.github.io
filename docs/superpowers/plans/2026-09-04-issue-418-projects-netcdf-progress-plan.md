# Issue #418 Projects NetCDF Progress Visual Companion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `bluetape4k-projects` 2.0.0의 NetCDF 2D CF import와 progress/recovery 계약을 단계별로 재생하고, 긴 정적 그림으로도 읽을 수 있는 영문·국문 시각화 자료를 제공한다.

**Architecture:** 하나의 불변 데이터 모델이 interactive HTML, semantic ledger, SVG/PNG 생성기의 source of truth가 된다. 좌표 의미론, bounded import, progress/recovery를 독립 lane으로 유지하면서 같은 frame index로 동기화하며, 기존 repository Card와 science manual 링크에만 노출한다.

**Tech Stack:** Node.js ESM, `node:test`, HTML/CSS/vanilla JavaScript, SVG, CairoSVG, Astro/Starlight

---

## Task 1: 불변 시나리오 모델과 계약 테스트

**Files:**
- Create: `tests/visual-companions/wave2-projects-netcdf-progress.test.mjs`
- Create: `src/data/visual-companions/wave2-projects-netcdf-progress.mjs`

- [x] 지원하는 7개 시나리오, 11개 frame, 3개 lane, exact release source revision, progress 상태, resource limit, ownership 경계를 검증하는 실패 테스트를 작성한다.
- [x] `node --test tests/visual-companions/wave2-projects-netcdf-progress.test.mjs`를 실행해 module-not-found RED를 확인한다.
- [x] `projectsNetCdfProgressCompanion` 불변 모델을 작성한다. 각 frame은 `action`, `guard`, `next`, `budget` 또는 `state` 설명을 영문·국문으로 포함한다.
- [x] 같은 테스트를 다시 실행해 GREEN을 확인한다.

## Task 2: 단계별 Play 시각화 생성기

**Files:**
- Modify: `tests/visual-companions/wave2-projects-netcdf-progress.test.mjs`
- Create: `scripts/generate-2-0-wave2-projects-netcdf-interactive.mjs`
- Create: `public/visual-companions/bluetape4k-projects/projects-netcdf-cf-progress/index.html`
- Create: `public/ko/visual-companions/bluetape4k-projects/projects-netcdf-cf-progress/index.html`

- [x] 생성된 양쪽 HTML route가 11단계 설명, scenario selector, `Play/Pause`, `Next`, `Reset`, theme control, keyboard focus, reduced-motion 처리를 포함해야 한다는 실패 테스트를 추가한다.
- [x] targeted test를 실행해 generator/output 부재 RED를 확인한다.
- [x] 데이터 모델에서만 내용을 읽는 deterministic generator를 구현한다. 좌표, bounded import, progress/recovery lane은 같은 frame을 강조하되 서로 다른 card로 렌더링한다.
- [x] 영문·국문 HTML을 생성하고 `--check` drift 검사를 지원한다.
- [x] targeted test를 실행해 GREEN을 확인한다.

## Task 3: semantic ledger와 긴 정적 SVG/PNG

**Files:**
- Modify: `tests/visual-companions/wave2-projects-netcdf-progress.test.mjs`
- Create: `docs/diagrams/visual-companions-wave2/projects-netcdf-cf-progress-en.semantic.json`
- Create: `docs/diagrams/visual-companions-wave2/projects-netcdf-cf-progress-ko.semantic.json`
- Create: `scripts/generate-2-0-wave2-projects-netcdf-visuals.mjs`
- Create: `public/assets/visual-companions/wave2/projects-netcdf-cf-progress-en.svg`
- Create: `public/assets/visual-companions/wave2/projects-netcdf-cf-progress-en.png`
- Create: `public/assets/visual-companions/wave2/projects-netcdf-cf-progress-ko.svg`
- Create: `public/assets/visual-companions/wave2/projects-netcdf-cf-progress-ko.png`
- Modify: `public/assets/visual-companions/wave2/README.md`
- Modify: `scripts/generate-2-0-wave2-visuals.mjs`

- [x] ledger의 노드·edge·lane·source metadata와 SVG generator drift를 검증하는 실패 테스트를 추가한다.
- [x] 10개 이하의 semantic node와 명시적 edge를 먼저 작성하고 semantic ledger audit를 통과시킨다.
- [x] 1800×4400 opaque dark SVG를 생성한다. 좌표 해석, 두 번의 slice pass, 순차 tile/batch write, checkpoint, timeout worker 판정, retry/resume, caller/library ownership 경계를 연결선으로 표현한다.
- [x] CairoSVG `-s 2`로 3600×8800 PNG를 생성한다.
- [x] 기존 wave2 README generator가 #417과 #418을 함께 소유하도록 갱신하고 양쪽 generator의 `--check`를 통과시킨다.
- [x] schema, semantic ledger, asset, overlap, connector, edge-contract audit를 실행하고 실패가 있으면 수정한다.
- [x] 원본 크기로 EN/KO PNG를 확인해 clipping, overlap, 잘못된 hierarchy가 없음을 검증한다.

## Task 4: 기존 Card와 science manual에 등록

**Files:**
- Modify: `tests/visual-companions/navigation.test.mjs`
- Modify: `tests/visual-companions/wave1-manual-links.test.mjs`
- Modify: `src/data/visual-companions/catalog.json`
- Modify: `src/data/visual-companions/wave1-manual-links.mjs`

- [x] `bluetape4k-projects` Card가 NearJCache 뒤에 #418 route를 표시하고 science manual이 locale별 interactive route와 PNG를 가리켜야 한다는 실패 테스트를 먼저 추가한다.
- [x] 두 테스트를 실행해 RED를 확인한다.
- [x] catalog에 기존 Card 형식으로 항목을 추가하고 `bluetape4k-science` manual mapping을 등록한다. 별도 Epic/Wave hub는 만들지 않는다.
- [x] 두 테스트와 전체 visual companion test suite를 실행해 GREEN을 확인한다.

## Task 5: 전체 검증과 로컬 검수 서버

**Files:**
- Verify only: all changed files

- [x] 모든 generator의 `--check`, `git diff --check`, 전체 `npm test`, `npm run build`를 실행한다.
- [x] build output에서 영문·국문 Card, manual 링크, interactive route와 PNG route가 모두 해석되는지 확인한다.
- [x] loopback preview server를 띄우고 두 interactive route와 repository Card route의 HTTP 200을 확인한다.
- [x] Play/Pause/Next/Reset, scenario 전환, locale 링크, mobile/desktop layout을 실제 브라우저에서 점검하고 screenshot을 원본 크기로 검토한다.
- [x] 검증 증거와 남은 제약을 workflow checklist에 기록한다. PR 생성·merge·배포는 별도 gate로 남긴다.

검증 메모: 전체 test는 244/244, Astro build는 0 errors/0 warnings로 통과했다. Playwright에서 8개 route/asset의 HTTP 200, timeout worker-alive 차단 분기, 자동 재생, theme, 영문·국문 desktop 및 390px mobile의 가로 overflow 0을 확인했다. 로컬 preview에서 Cloudflare analytics CORS 오류 2건이 발생하지만 companion 기능과 asset 해석에는 영향을 주지 않는다. 설치된 catalog에 `$visual-verdict`가 없어 semantic/connector/arrowhead/geometry audit와 원본 PNG·Playwright screenshot 검토를 대체 증거로 사용했다.
