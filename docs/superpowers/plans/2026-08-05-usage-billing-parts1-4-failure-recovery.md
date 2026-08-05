# 사용량 과금 4부작 장애 복구 서술 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사용량 과금 Part 1부터 Part 4까지 정상 흐름과 장애 대응을 함께 설명하고, Part 2·3·4를 하루 간격으로 공개할 수 있는 독립 전달 단위로 준비한다.

**Architecture:** Part 1·2는 현재 원고를 보강하고, Part 3은 서비스별 데이터 소유권과 Outbox·Inbox 전달 경계를, Part 4는 세 구현에 공통으로 적용할 운영 복구 절차를 설명한다. 한·영문 글과 로케일별 다크 다이어그램을 같은 정보 구조로 유지하며, Part 2·3·4를 누적 브랜치로 분리해 실제 병합 시점을 하루씩 나눌 수 있게 한다.

**Tech Stack:** Astro Starlight, MDX, Node.js 테스트, SVG, CairoSVG, Playwright 기반 로컬 프리뷰 검증

---

### Task 1: Part 1·2 장애 대응 계약 보강

**Files:**
- Modify: `src/content/docs/ko/blog/usage-billing-part1-ledger-and-resumable-close.mdx`
- Modify: `src/content/docs/blog/usage-billing-part1-ledger-and-resumable-close.mdx`
- Modify: `src/content/docs/ko/blog/usage-billing-part2-event-sourcing-and-projections.mdx`
- Modify: `src/content/docs/blog/usage-billing-part2-event-sourcing-and-projections.mdx`

- [ ] **Step 1: Part 1의 흩어진 실패 경로를 여섯 질문 구조로 점검한다**

  `장애`, `탐지 신호`, `자동 보호`, `운영자 복구`, `완료 조건`, `금지 조치`를 기준으로 Command Receipt takeover, Digest 충돌, 가격 누락, 마감 재개, 보정, Reconciliation을 대조한다.

- [ ] **Step 2: Part 1에 통합 장애 대응 절과 복구 완료 Gate를 추가한다**

  정상 처리와 실패 지점을 먼저 설명하고, 다음과 같은 판정 표를 추가한다.

  ```markdown
  | 실패 경계 | 자동 보호 | 복구 완료 조건 |
  | --- | --- | --- |
  | 마감 Worker 중단 | 고정된 Cutoff와 Checkpoint 보존 | 마지막 Batch 이후 원장 합계와 Finding 재검증 |
  ```

- [ ] **Step 3: Part 2의 Poison Event 설명을 운영 복구 절차로 확장한다**

  Snapshot 폐기와 전체 Replay, Hash 불일치 중단, Upcast 단절, Projection Lag, ACTIVE 세대 부재, Quarantine과 Redrive를 하나의 복구 흐름으로 연결한다.

- [ ] **Step 4: Part 1·2 영문 원고를 같은 의미 구조로 보강한다**

  상태명과 식별자는 그대로 두고 한국어의 `기준 데이터`, `복구 완료 조건`, `금지 조치`가 영어의 `system of record`, `recovery gate`, `prohibited action`과 대응하도록 맞춘다.

- [ ] **Step 5: Part 2 표시 날짜를 2026-08-06으로 고정한다**

  한국어·영문 frontmatter의 `blog.date`, `sidebar.order`, 본문 메타 날짜를 같은 날로 맞춘다.

- [ ] **Step 6: Part 2 단위 검증을 실행한다**

  Run: `node --test tests/visual-companions/usage-billing-blog-link.test.mjs tests/ecosystem/blog-diagram-locales.test.mjs tests/ecosystem/blog-taxonomy.test.mjs`

  Expected: 모든 사용량 과금 링크·로케일·분류 계약 PASS

- [ ] **Step 7: Part 2 전달 단위를 커밋한다**

  Part 1 보강, Part 2 글·자산·테스트·계획만 스테이징하고 Lore 형식으로 커밋한다.

### Task 2: Part 3 마이크로서비스 글의 근거와 구조 고정

**Files:**
- Create: `src/content/docs/ko/blog/usage-billing-part3-microservices-outbox-inbox.mdx`
- Create: `src/content/docs/blog/usage-billing-part3-microservices-outbox-inbox.mdx`
- Modify: `src/content/docs/ko/blog/usage-billing-part1-ledger-and-resumable-close.mdx`
- Modify: `src/content/docs/blog/usage-billing-part1-ledger-and-resumable-close.mdx`
- Modify: `src/content/docs/ko/blog/usage-billing-part2-event-sourcing-and-projections.mdx`
- Modify: `src/content/docs/blog/usage-billing-part2-event-sourcing-and-projections.mdx`

- [ ] **Step 1: Workshop의 서비스 소유권과 전달 계약을 근거 표로 정리한다**

  Meter, Usage, Billing, Invoice, Query의 로컬 데이터, 발행 Event, 소비 Event와 실패 경계를 README·대표 Service·통합 테스트에 대응시킨다.

- [ ] **Step 2: Part 3 한국어 원고를 작성한다**

  `로컬 처리와 Outbox 원자성 → Inbox 중복 판정 → Version Gap → 일시적 장애 재전달 → 영구 계약 오류 격리 → Redrive → 단계적 추출` 순서로 설명한다.

- [ ] **Step 3: Part 3 장애 대응 절을 독립적으로 이해할 수 있게 작성한다**

  같은 ID·같은 Digest, 같은 ID·다른 Digest, 일시적 DB 오류, 알 수 없는 Schema Version, Broker 단절, 재시작 복구의 처리 결과와 복구 Gate를 구분한다.

- [ ] **Step 4: Part 3 영문 원고를 같은 정보 구조로 작성한다**

  한국어 문장을 직역하지 않고, 표·절·링크·상태명·수치의 의미만 동일하게 유지한다.

- [ ] **Step 5: Part 1·2·3 시리즈 링크를 갱신한다**

  Part 3 브랜치에서는 Part 1과 Part 2에서 Part 3으로 이동할 수 있게 하고, Part 4는 아직 링크하지 않는다.

### Task 3: Part 3 시각 자료 구성

**Files:**
- Create: `public/assets/blog/usage-billing/part3/usage-billing-part3-hero.png`
- Create: `public/assets/blog/usage-billing/part3/usage-billing-microservices-01-ko.png`
- Create: `public/assets/blog/usage-billing/part3/usage-billing-microservices-01-en.png`

- [ ] **Step 1: 로케일별 기존 마이크로서비스 다크 자산을 독립 경로로 복사한다**

  한국어와 영문 PNG를 각각 배치하고 MDX의 `data-diagram-title`, `alt`, `figcaption`을 로케일에 맞게 작성한다.

- [ ] **Step 2: Part 3 대표 이미지를 글자 없는 다크 시각 언어로 생성한다**

  다섯 서비스, 메시지 전달, 격리된 실패 Event를 상징하되 본문 다이어그램을 복제하지 않는다.

- [ ] **Step 3: 대화형 시각 자료의 `#microservices` 화면으로 연결한다**

  한국어는 `/ko/visual-companions/.../#microservices`, 영어는 `/visual-companions/.../#microservices`를 사용한다.

- [ ] **Step 4: Part 3 전달 단위를 검증하고 커밋한다**

  대상 테스트, 전체 `npm test`, `npm run build`, `git diff --check`를 실행한 뒤 `docs/usage-billing-part3` 브랜치에 Lore 형식으로 커밋한다.

### Task 4: Part 4 장애 복구 종합 글 작성

**Files:**
- Create: `src/content/docs/ko/blog/usage-billing-part4-failure-recovery-and-reconciliation.mdx`
- Create: `src/content/docs/blog/usage-billing-part4-failure-recovery-and-reconciliation.mdx`
- Modify: `src/content/docs/ko/blog/usage-billing-part1-ledger-and-resumable-close.mdx`
- Modify: `src/content/docs/blog/usage-billing-part1-ledger-and-resumable-close.mdx`
- Modify: `src/content/docs/ko/blog/usage-billing-part2-event-sourcing-and-projections.mdx`
- Modify: `src/content/docs/blog/usage-billing-part2-event-sourcing-and-projections.mdx`
- Modify: `src/content/docs/ko/blog/usage-billing-part3-microservices-outbox-inbox.mdx`
- Modify: `src/content/docs/blog/usage-billing-part3-microservices-outbox-inbox.mdx`

- [ ] **Step 1: 세 구현의 장애를 공통 분류로 매핑한다**

  일시적 인프라 장애, 영구 계약 오류, 정합성 오류를 각각 재시도·takeover, quarantine·수정·redrive, replay·rebuild·adjustment로 연결한다.

- [ ] **Step 2: Part 4 한국어 원고를 여섯 단계 Runbook으로 작성한다**

  `탐지 → 영향 범위 식별 → 분류 → 격리 → 복구 → 정합성 검증 → 트래픽 재개`를 중심으로, 단계마다 입력·행동·판정 기준·금지 조치를 명시한다.

- [ ] **Step 3: 복구 완료 Gate를 체크리스트와 의사코드로 설명한다**

  ```text
  resumeTraffic only if
    cursorReachedHighWatermark
    and quarantineResolved
    and reconciliationMatched
    and fencingTokenIsCurrent
    and lagWithinSlo
  ```

- [ ] **Step 4: Part 4 영문 원고와 네 편의 전체 시리즈 링크를 완성한다**

  Part 4 표시 날짜는 2026-08-08로 지정하고, 모든 글에서 네 편을 탐색할 수 있게 한다.

### Task 5: Part 4 다크 운영 흐름 다이어그램 제작

**Files:**
- Create: `scripts/generate-usage-billing-part4-diagrams.mjs`
- Create: `public/assets/blog/usage-billing/part4/usage-billing-recovery-01-ko.svg`
- Create: `public/assets/blog/usage-billing/part4/usage-billing-recovery-01-ko.png`
- Create: `public/assets/blog/usage-billing/part4/usage-billing-recovery-01-en.svg`
- Create: `public/assets/blog/usage-billing/part4/usage-billing-recovery-01-en.png`
- Create: `public/assets/blog/usage-billing/part4/usage-billing-part4-hero.png`

- [ ] **Step 1: 수직 복구 흐름의 구조화된 로케일 데이터를 작성한다**

  여섯 단계와 세 장애 분기, 복구 완료 Gate를 하나의 데이터 구조에서 렌더링하고 기술 식별자는 두 언어에서 동일하게 유지한다.

- [ ] **Step 2: SVG를 생성하고 PNG로 렌더링한다**

  Run: `node scripts/generate-usage-billing-part4-diagrams.mjs`

  Expected: 한국어·영문 SVG와 2배율 PNG 생성

- [ ] **Step 3: SVG 구조와 연결선을 검사한다**

  Run: `xmllint --noout public/assets/blog/usage-billing/part4/*.svg`

  Run: `python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py public/assets/blog/usage-billing/part4/usage-billing-recovery-01-ko.svg`

  Run: `python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal public/assets/blog/usage-billing/part4/usage-billing-recovery-01-ko.svg`

  Run: `python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py public/assets/blog/usage-billing/part4/usage-billing-recovery-01-ko.svg`

  Run: `python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py public/assets/blog/usage-billing/part4/usage-billing-recovery-01-ko.svg`

  Expected: 대각선·공유 선분·카드 침범·라벨 충돌·방향 오류 0건

- [ ] **Step 4: 한국어·영문 PNG를 원본 크기로 각각 검토한다**

  글자 잘림, 지나치게 작은 글자, 화살촉 크기·방향, 카드·라벨·연결선 간격, 좌우·하단 여백을 확인한다.

- [ ] **Step 5: Part 4 대표 이미지를 글자 없는 다크 시각 언어로 생성한다**

  장애 신호가 격리·복구·검증 Gate를 거치는 운영 작업대를 표현한다.

### Task 6: 전체 콘텐츠 계약과 로컬 프리뷰 검증

**Files:**
- Modify: `tests/visual-companions/usage-billing-blog-link.test.mjs`
- Modify: `tests/ecosystem/blog-diagram-locales.test.mjs`
- Modify: `tests/ecosystem/blog-taxonomy.test.mjs`

- [ ] **Step 1: Part 3·4 링크와 자산의 실패 테스트를 추가한다**

  글 경로, 한·영문 다이어그램 분리, 대화형 시각 자료 Fragment, 대표 이미지, 시리즈 탐색과 표시 날짜를 검사한다.

- [ ] **Step 2: 대상 테스트를 실행한다**

  Run: `node --test tests/visual-companions/usage-billing-blog-link.test.mjs tests/ecosystem/blog-diagram-locales.test.mjs tests/ecosystem/blog-taxonomy.test.mjs`

  Expected: 모든 테스트 PASS

- [ ] **Step 3: 전체 정적 검증을 실행한다**

  Run: `npm test`

  Run: `npm run build`

  Run: `git diff --check`

  Expected: 테스트·빌드·공백 검사 PASS

- [ ] **Step 4: 로컬 프리뷰에서 네 편을 검토한다**

  한국어·영문 각 경로의 frontmatter, 본문, 표, 코드, 다이어그램 확대, 시리즈 링크와 외부 링크를 확인한다.

- [ ] **Step 5: 한국어 최종 교정과 한·영문 의미 일치 검사를 수행한다**

  번역체, 구어체, 직역 명사, 모호한 대명사, `권위 데이터` 같은 금지 표현을 제거하고 기술 식별자와 상태명은 보존한다.

- [ ] **Step 6: Part 4 전달 단위를 커밋하고 배포 대기 상태를 기록한다**

  `docs/usage-billing-part4`에 Lore 형식으로 커밋하되 PR 생성, 병합, 배포는 수행하지 않는다. Part 2·3·4의 권장 공개 순서와 최소 하루 간격을 DoD에 기록한다.

