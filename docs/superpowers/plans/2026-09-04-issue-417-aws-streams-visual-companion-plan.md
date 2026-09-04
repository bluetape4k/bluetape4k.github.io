# Issue #417 AWS Streams Visual Companion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kinesis와 DynamoDB Streams의 shard 소비·checkpoint 차이를 재생하고 비교하는 bilingual visual companion을 Issue #417 범위로 배포한다.

**Architecture:** locale별 문구와 공통 단계·시나리오를 하나의 구조화 모듈에 둔다. 두 생성기가 이 원본에서 대화형 HTML과 긴 SVG를 만들며, manual overlay와 Epic 2 목록이 생성 결과를 노출한다.

**Tech Stack:** Node.js ESM, HTML/CSS/JavaScript, SVG, CairoSVG, Astro/Starlight, Node test runner, Playwright

---

### Task 1: 구조화 계약과 실패 테스트

**Files:**
- Create: `tests/visual-companions/wave2-aws-streams.test.mjs`
- Create: `src/data/visual-companions/wave2-aws-streams.mjs`

- [ ] 테스트에서 issue `417`, 5개 시나리오, 9개 frame, 두 service lane, locale parity, 정확한 책임 경계 token을 요구한다.
- [ ] `node --test tests/visual-companions/wave2-aws-streams.test.mjs`를 실행해 source module 부재로 실패하는지 확인한다.
- [ ] locale copy, frame, scenario, source URL을 단일 ESM 객체로 구현한다.
- [ ] 같은 테스트를 다시 실행해 구조화 계약이 통과하는지 확인한다.

### Task 2: 대화형 페이지

**Files:**
- Create: `scripts/generate-2-0-wave2-interactive.mjs`
- Create: `public/visual-companions/bluetape4k-aws/aws-streams-shard-consumers/index.html`
- Create: `public/ko/visual-companions/bluetape4k-aws/aws-streams-shard-consumers/index.html`
- Test: `tests/visual-companions/wave2-aws-streams.test.mjs`

- [ ] 테스트에서 두 route, `Reset / Play / Next`, 5개 scenario button, 9개 frame, 단계별 `현재 동작 / 보장되는 계약 / 다음 전이`, theme와 provenance를 요구한다.
- [ ] 테스트를 실행해 생성기와 route 부재로 실패하는지 확인한다.
- [ ] 두 service lane을 동시에 갱신하고 failure state를 시각적으로 구분하는 generator를 구현한다.
- [ ] 생성 후 테스트를 실행해 HTML 계약을 통과시킨다.

### Task 3: semantic ledger와 정적 SVG·PNG

**Files:**
- Create: `docs/diagrams/visual-companions-wave2/aws-streams-shard-consumers-en.semantic.json`
- Create: `docs/diagrams/visual-companions-wave2/aws-streams-shard-consumers-ko.semantic.json`
- Create: `scripts/generate-2-0-wave2-visuals.mjs`
- Create: `public/assets/visual-companions/wave2/README.md`
- Create: `public/assets/visual-companions/wave2/aws-streams-shard-consumers-en.svg`
- Create: `public/assets/visual-companions/wave2/aws-streams-shard-consumers-ko.svg`
- Create: matching PNG files

- [ ] 테스트에서 locale별 ledger와 SVG/PNG pair, source revision, required identifiers를 요구한다.
- [ ] 테스트를 실행해 자산 부재로 실패하는지 확인한다.
- [ ] 1800px 폭의 긴 split-lane SVG 생성기와 locale별 ledger를 구현한다.
- [ ] semantic audit와 XML 검사를 실행한다.
- [ ] CairoSVG `-s 2`로 PNG를 만들고 시각·connector·arrowhead·geometry·asset-pair audit를 통과시킨다.

### Task 4: manual과 Epic 2 목록 노출

**Files:**
- Modify: `src/data/visual-companions/wave1-manual-links.mjs`
- Modify: `src/components/ManualPageTitle.astro`
- Modify: `src/styles/manual.css`
- Create: `src/content/docs/visual-companions/bluetape4k-2-0-wave2.mdx`
- Create: `src/content/docs/ko/visual-companions/bluetape4k-2-0-wave2.mdx`
- Modify: `src/content/docs/visual-companions/index.mdx`
- Modify: `src/content/docs/ko/visual-companions/index.mdx`
- Modify: `tests/visual-companions/wave1-manual-links.test.mjs`

- [ ] 테스트를 먼저 바꿔 같은 AWS manual entry가 SQS와 Streams 두 companion을 locale별 절대 URL로 반환하도록 요구한다.
- [ ] 테스트가 기존 단일 반환 계약 때문에 실패하는지 확인한다.
- [ ] resolver를 배열 반환으로 확장하고 component를 목록 렌더링으로 변경한다.
- [ ] Epic 2 페이지에는 #417만 등록하고 index에서 연결한다.
- [ ] 관련 테스트와 `npm run build`를 실행해 매뉴얼·목록 route를 확인한다.

### Task 5: 브라우저 QA와 전달

**Files:**
- Modify only files above when QA exposes a defect.

- [ ] local server에서 EN/KO, desktop/mobile, light/dark, keyboard, reduced-motion을 확인한다.
- [ ] `Reset / Play / Next`와 정상·resume·lease loss·checkpoint failure·cancellation 시나리오를 실행한다.
- [ ] 최종 PNG 두 개를 전체 크기로 열어 글자, lane, arrowhead, 여백을 확인한다.
- [ ] `git diff --check`, Korean terminology audit, Node tests, `npm run build`를 다시 실행한다.
- [ ] Lore 형식의 한국어 커밋을 만들고 branch를 push한 뒤 `develop <- docs/aws-streams-visual-companion` PR을 생성한다.
- [ ] exact-head checks와 PR metadata를 확인하고 merge 전 상태에서 정지한다.
