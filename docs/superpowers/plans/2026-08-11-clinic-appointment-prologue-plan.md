# 병원 예약 서비스 프롤로그 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** 환자 A의 이벤트·N회·패키지 상품 구매가 \`AppointmentPlan\`, 방문 약속, 내원·상담·알림·통계 사실로 이어지는 전체 흐름을 한국어/영어 프롤로그 글과 기존 시리즈 내비게이션으로 공개한다.

**Architecture:** 한국어 원고를 사실의 기준으로 먼저 작성하고, 승인된 설계 문서의 claim ledger와 상태 표지를 사용해 영어 글을 의미 보존형으로 현지화한다. 두 locale은 text-free 하나의 hero asset과 locale별 정적 SVG/PNG 두 쌍, 대응하는 route/link 구조를 공유하며, 상품·구매·예약·임상·CRM·알림·통계의 소유권을 글의 표와 사례에서 일관되게 유지한다. 새 visual companion route나 서비스 소스 코드는 추가하지 않는다.

**Tech Stack:** Astro/Starlight MDX, Markdown frontmatter, 기존 \`/assets\` PNG hero, \`imagegen\`/ \`view_image\` visual QA, Node.js npm scripts (\`npm run build\`, \`npm test\`), \`rg\`, \`git diff --check\`.

---

## 변경 파일과 책임

- Create: \`src/content/docs/ko/blog/clinic-appointment-prologue-product-to-appointment.mdx\` — 승인된 환자 A 사례와 상품→구매→계획→방문→내원/상담/알림/통계 흐름의 한국어 공개 원고.
- Create: \`src/content/docs/blog/clinic-appointment-prologue-product-to-appointment.mdx\` — 같은 주장·사례·수치·근거를 보존하는 영어 현지화 원고.
- Create: \`public/assets/clinic-appointment-prologue-hero.png\` — 두 locale이 공유하는 텍스트 없는 시리즈 스타일 hero.
- Create: \`public/assets/clinic-appointment-prologue-patient-a-flow-01-{ko,en}.svg\` and \`.png\` — 환자 A의 행위·예약 처리·객관적 이벤트 타임라인.
- Create: \`public/assets/clinic-appointment-prologue-service-boundaries-01-{ko,en}.svg\` and \`.png\` — 서비스별 권한·책임 경계와 입력/출력 사실.
- Create: \`docs/review/2026-08-11-clinic-appointment-prologue-patient-a-flow.semantic.json\` and \`docs/review/2026-08-11-clinic-appointment-prologue-service-boundaries.semantic.json\` — source-backed semantic ledgers.
- Modify: \`tests/ecosystem/blog-taxonomy.test.mjs\` — 새 bilingual post pair를 포함하도록 explicit blog post 수 계약을 갱신한다.
- Modify: \`src/content/docs/ko/blog/clinic-appointment-part1-not-just-crud.mdx\` through \`clinic-appointment-part7-review-and-operational-evolution.mdx\` — 하단 시리즈 링크 맨 앞에 프롤로그 링크를 추가하고 기존 순서를 보존한다.
- Modify: \`src/content/docs/blog/clinic-appointment-part1-not-just-crud.mdx\` through \`clinic-appointment-part7-review-and-operational-evolution.mdx\` — 영어 프롤로그 링크를 같은 위치와 순서로 추가한다.
- Reference only: \`docs/superpowers/specs/2026-08-11-clinic-appointment-prologue-design.md\` — 사실 경계, claim ledger, route, visual companion, DoD의 권위 문서.

새 catalog 항목, visual companion Markdown/HTML, 원본 \`clinic-appointment\` 코드, 테스트 fixture는 수정하지 않는다.

### Task 1: 원고용 근거와 상태 표지 재확인

**Files:**

- Read: \`docs/superpowers/specs/2026-08-11-clinic-appointment-prologue-design.md\`
- Read: \`../clinic-appointment/docs/requirements/data-flow.md\`
- Read: \`../clinic-appointment/docs/superpowers/specs/2026-07-26-appointment-plan-and-capacity-design.md\`
- Read: \`../clinic-appointment/docs/superpowers/specs/2026-07-29-issue-184-visit-commitment-design.md\`
- Read: \`../clinic-appointment/docs/superpowers/specs/2026-07-30-profile-change-reservation-reevaluation-design.md\`
- Read: current Korean/English Part 1 and Part 7 articles for frontmatter, hero, and series-link conventions.

- [x] **Step 1: Verify the source boundary at the pinned source revision.**

Run:

\`\`\`bash
git -C ../clinic-appointment rev-parse develop
git -C ../clinic-appointment status --short --branch
rg -n "AppointmentPlan|PlannedTreatment|AppointmentCommitment|PROPOSED|HELD|CONFIRMED|outbox|projection|profile" \
  ../clinic-appointment/docs/requirements/data-flow.md \
  ../clinic-appointment/docs/superpowers/specs/2026-07-26-appointment-plan-and-capacity-design.md \
  ../clinic-appointment/docs/superpowers/specs/2026-07-29-issue-184-visit-commitment-design.md \
  ../clinic-appointment/docs/superpowers/specs/2026-07-30-profile-change-reservation-reevaluation-design.md
\`\`\`

Expected: the source checkout is at \`3dfcf2acc32dfca4cbd8bf1a47226be1eee63bbe\` or the spec is refreshed first; every domain term has a source hit; no unverified VIP/no-show or production-complete claim is introduced.

- [x] **Step 2: Fix the four fact states in the outline.**

Use these exact labels in Korean and English:

\`\`\`text
현재 구현 / Current implementation
승인된 설계 / Approved design
운영 대기 / Awaiting operations
로드맵 / Roadmap
\`\`\`

Map merged \`AppointmentPlan\` foundation and merged visit/profile work to current implementation only where source evidence supports it. Map unfinished visit-commitment portions to approved design, notification canary/stats backfill to awaiting operations, and portal/mobile to roadmap.

### Task 2: 한국어 프롤로그 원고 작성

**Files:**

- Create: \`src/content/docs/ko/blog/clinic-appointment-prologue-product-to-appointment.mdx\`

- [x] **Step 1: Add frontmatter and shared hero markup.**

Use this exact metadata shape:

\`\`\`yaml
---
title: "병원 예약 SaaS 개발기 프롤로그: 상품 정보가 고객의 방문 약속이 되기까지"
description: 상품 구매가 반복·복합 예약과 실제 내원, 상담, 알림, 통계로 이어지는 과정을 한 환자의 사례와 서비스 경계로 설명합니다.
sidebar:
  order: -202608111000
blog:
  date: 2026-08-11T10:00:00+09:00
  image: /assets/clinic-appointment-prologue-hero.png
  imageAlt: 상품 카드와 구매 문서, 진료 계획 그래프, 예약 달력, 상담·알림 신호를 한 작업대에서 연결하는 작은 로봇 작업자들
  cardDescription: "이벤트·N회·패키지 상품이 고객의 방문 약속이 되고, 내원과 상담의 객관적 사실로 이어지는 전체 흐름을 그립니다."
  tags: ["architecture", "domain-modeling", "event-driven", "resilience"]
---
\`\`\`

Immediately after frontmatter, use the established hero/meta structure with \`bt4k-blog-hero\`, the shared absolute image path, localized alt text, and \`2026-08-11 · 병원 예약 서비스 개발기 · 프롤로그\`.

- [x] **Step 2: Write sections 1–3 around one patient A.**

Write these sections in Korean: “상품을 샀는데 왜 아직 방문 약속이 아닌가” (same-day event, N-visit, and multi-treatment package purchases); “상품 정보가 예약서비스에 들어오는 경로” (catalog/BOM, authority-qualified purchase event, immutable version/benefit snapshot, projection/inbox/outbox); “상품이 진료 계획이 되는 순간” (one \`AppointmentPlan\` per purchase, \`PlannedTreatment 1..N\`, dependencies, remaining obligation, no immediate slot/resource occupancy). Do not include real names, prices, internal thresholds, medical identifiers, or a claim that three purchases become one appointment.

Include this exact relationship block:

\`\`\`text
구매 event
  └─> AppointmentPlan
        └─> PlannedTreatment 1..N ── dependency/DAG
                              ▲
                              │ fulfills / attempts
Appointment ──> AppointmentItem 1..N ──> ResourceAllocation 1..N
\`\`\`

- [x] **Step 3: Write sections 4–6 around the visit commitment and ownership.**

Explain \`PROPOSED\`, \`HELD\`, consent-bound \`CONFIRMED\`, policy snapshot, plan revision/catalog hash, and capacity ceiling; distinguish one visit containing agreed \`AppointmentItem\` records from clinical completion. Add a responsibility table with exactly these rows: 상품관리/상품개발, 구매/커머스, 예약서비스, 임상/시술, 고객상담/CRM, 알림, 통계/외부 consumer. Explain attendance/check-in, clinical completion/partial completion, counseling, refund/compensation, notification delivery, and external statistics as separate facts and owners. Reservation emits objective facts and does not own CRM judgment, refund policy, or clinical source records.

### Task 3: Generate and inspect the shared hero

**Files:**

- Create: \`public/assets/clinic-appointment-prologue-hero.png\`

- [x] **Step 1: Load visual instructions and generate one text-free image.**

Read \`/Users/debop/.codex/skills/bluetape-diagram/SKILL.md\` completely before touching the asset. Use the \`imagegen\` skill/tool with the dark miniature workbench/robot-builder language used by Part 1–7: product card, purchase document, plan graph, appointment calendar, counseling and notification signals, wide 16:9 composition, no readable language, logos, or patient data.

- [x] **Step 2: Save and inspect the generated result.**

Save it at the exact public path. Use \`view_image\` at high detail and confirm no text artifacts, a legible left-to-right product-to-appointment path, an uncluttered center crop, and dimensions/file format compatible with \`clinic-appointment-part1-hero.png\` and \`clinic-appointment-part7-hero.png\`.

- [x] **Step 3: Run visual invariant checks.**

Run the asset/diagram audit helpers documented by \`bluetape-diagram\`, plus \`file\` and the documented image-dimension command. If language artifacts or a broken visual hierarchy remain, regenerate once with a tighter text-free prompt; do not create a new companion route.

### Task 4: 영어 프롤로그 현지화

**Files:**

- Create: \`src/content/docs/blog/clinic-appointment-prologue-product-to-appointment.mdx\`

- [x] **Step 1: Translate the Korean structure without changing the domain contract.**

Use this exact English metadata:

\`\`\`yaml
---
title: "Clinic Appointment SaaS Prologue: From Product Information to a Patient's Visit Commitment"
description: Follow one patient's event, multi-visit, and package purchases into an appointment plan, a visit commitment, attendance, counseling, notifications, and statistics.
sidebar:
  order: -202608111000
blog:
  date: 2026-08-11T10:00:00+09:00
  image: /assets/clinic-appointment-prologue-hero.png
  imageAlt: Small robotic builders connect product cards, a purchase document, a treatment plan graph, an appointment calendar, and counseling and notification signals on one workbench
  cardDescription: "Map how event, multi-visit, and package products become visit commitments and objective attendance and counseling facts."
  tags: ["architecture", "domain-modeling", "event-driven", "resilience"]
---
\`\`\`

Use English \`## Series\` links with \`/blog/...\` routes and English visual companion routes without \`/ko\`. Preserve every identifier, state, number, source URL, and fact-status distinction from Korean; do not add an English-only product, policy, or rollout claim.

- [x] **Step 2: Preserve the same diagram and table.**

Translate labels around the exact identifiers \`AppointmentPlan\`, \`PlannedTreatment\`, \`Appointment\`, \`AppointmentItem\`, \`ResourceAllocation\`, and \`AppointmentCommitment\`. Use “Current implementation”, “Approved design”, “Awaiting operations”, and “Roadmap” consistently.

### Task 5: 기존 시리즈 내비게이션 양국어 갱신

**Files:**

- Modify: \`src/content/docs/ko/blog/clinic-appointment-part1-not-just-crud.mdx\` through \`clinic-appointment-part7-review-and-operational-evolution.mdx\`
- Modify: \`src/content/docs/blog/clinic-appointment-part1-not-just-crud.mdx\` through \`clinic-appointment-part7-review-and-operational-evolution.mdx\`

- [x] **Step 1: Add the prologue before Part 1 in every existing series list.**

Insert immediately before the current Part 1 entry:

\`\`\`md
- [프롤로그: 상품 정보가 고객의 방문 약속이 되기까지](/ko/blog/clinic-appointment-prologue-product-to-appointment/)
\`\`\`

and in English:

\`\`\`md
- [Prologue: From Product Information to a Patient's Visit Commitment](/blog/clinic-appointment-prologue-product-to-appointment/)
\`\`\`

Do not alter existing Part 1–7 titles, routes, source links, prose, or dates.

- [x] **Step 2: Check locale navigation parity mechanically.**

Run:

\`\`\`bash
for f in src/content/docs/ko/blog/clinic-appointment-part{1,2,3,4,5,6,7}-*.mdx; do
  rg -n "prologue-product-to-appointment|Part [1-7]|프롤로그|시리즈" "$f" | tail -n 12
done
for f in src/content/docs/blog/clinic-appointment-part{1,2,3,4,5,6,7}-*.mdx; do
  rg -n "prologue-product-to-appointment|Part [1-7]|Prologue|Series" "$f" | tail -n 12
done
\`\`\`

Expected: every existing article has exactly one prologue link before Part 1 and still lists all seven original parts once.

### Task 6: Editorial, parity, and route validation

**Files:**

- Check: both new MDX articles, shared hero, and all 14 modified series articles.

- [x] **Step 1: Run Markdown and content checks.**

Run:

\`\`\`bash
git diff --check
npm run build
\`\`\`

Expected: \`git diff --check\` has no output; Astro check/build completes and emits both routes \`/ko/blog/clinic-appointment-prologue-product-to-appointment/\` and \`/blog/clinic-appointment-prologue-product-to-appointment/\`.

- [x] **Step 2: Verify built routes and asset references.**

Run:

\`\`\`bash
test -f public/assets/clinic-appointment-prologue-hero.png
test -f dist/ko/blog/clinic-appointment-prologue-product-to-appointment/index.html
test -f dist/blog/clinic-appointment-prologue-product-to-appointment/index.html
rg -n "clinic-appointment-prologue-hero|상품 정보가 고객의 방문 약속|From Product Information to a Patient's Visit Commitment" \
  dist/ko/blog/clinic-appointment-prologue-product-to-appointment/index.html \
  dist/blog/clinic-appointment-prologue-product-to-appointment/index.html
\`\`\`

Expected: both HTML routes exist, reference the shared absolute asset, and contain their locale’s title.

- [x] **Step 3: Run the repository tests and classify baseline failures.**

Run:

\`\`\`bash
npm test
\`\`\`

Expected: all bilingual post-pair checks include the new 95th pair. If the known baseline manual failure \`fixture/dist/pagefind/pagefind-entry.json\` with zero length remains, report it separately; no new article/route failure may be silently folded into that baseline.

- [x] **Step 4: Perform a final human editorial pass.**

Check Korean prose for natural business-first flow, then compare English section-by-section. Confirm no real patient data, prices, no-show thresholds, VIP ranking rules, or staff scores are disclosed; \`CONFIRMED\` is not clinical completion; source links and companion routes are locale-correct; and current-implementation claims do not exceed pinned evidence.

### Task 7: Commit the implementation boundary

**Files:**

- Add all article, navigation, and hero files produced by Tasks 2–6.

- [x] **Step 1: Review final scope.**

Run:

\`\`\`bash
git status --short
git diff --stat
git diff --check
\`\`\`

Expected: only the two new blog routes, one hero asset, fourteen existing blog navigation files, and the bilingual post-count assertion are changed in addition to plan/spec history. No \`src/data/visual-companions/catalog.json\`, companion page, service source, or test fixture is modified.

- [x] **Step 2: Commit using the Lore protocol.**

Use this Korean commit-message shape, filling only the actual implementation/test evidence:

\`\`\`text
상품에서 방문 약속까지의 예약 서비스 전체 흐름을 독자가 추적할 수 있게 프롤로그를 추가한다

상품·구매·예약·임상·CRM의 권위 경계를 공개 사례에 맞춰 고정하고, 기존 시리즈가 새 프롤로그에서 시작되도록 연결한다.

Constraint: 승인된 #276 설계와 원본 저장소의 관찰 기준을 넘지 않는 공개 문서여야 한다.
Rejected: 새 visual companion과 실제 운영 정책 공개 | 프롤로그 범위를 넓히고 민감한 내부 규칙을 노출하므로 제외
Confidence: high
Scope-risk: moderate
Directive: 후속 글도 현재 구현·승인 설계·운영 대기·로드맵을 분리하고 상품 소유권을 예약서비스로 옮겨 쓰지 않는다.
Tested: git diff --check, npm run build, npm test 및 양 locale route/asset 확인
Not-tested: Pagefind fixture의 기존 zero-length 산출물이 유지되면 해당 manual test는 별도 baseline gap으로 남긴다.
\`\`\`

- [x] **Step 3: Report the issue handoff without creating a PR.**

Final report includes the implementation commit SHA, changed routes/assets, build/test evidence, the known Pagefind baseline gap if still present, and next issue \`#277\`. PR creation, push, and merge are outside this approved implementation boundary.

## Self-review checklist

- Spec sections 1–4 are covered by Tasks 1–2 (patient case, ownership table, plan/visit distinction).
- Spec sections 5–6 are covered by Tasks 2 and 4 (eight-section structure and four fact states).
- Spec section 7 is covered by Task 3 (shared text-free hero and visual QA; no new companion).
- Spec section 8 is covered by Tasks 4–5 (route, metadata, source-link, and navigation parity).
- Spec sections 9–12 are covered by Tasks 1, 2, 4, and 6–7 (claim ledger, privacy boundary, DoD, risks, and evidence report).
- No step uses a temporary-status marker or an unspecified instruction; every mutation names an exact path and every validation names a command and expected result.

## Addendum: 환자 A 사건과 서비스 권한 경계 diagram

이번 후속 요청은 새 companion route가 아니라 프롤로그 본문에 삽입하는 정적 diagram 두 장으로 한정한다.

### Diagram Task 1: semantic ledger와 source-backed layout 고정

- [ ] `clinic-appointment` `develop` `3dfcf2a`의 `data-flow.md`, Appointment Plan Foundation, visit commitment,
  fulfillment, notification 문서를 다시 대조한다.
- [ ] 환자 A의 `행위 → 예약서비스 처리 → 객관적 이벤트` 3-lane 흐름과 서비스별 `권한 → 책임 → 책임 밖` 경계를
  두 semantic ledger에 기록한다.
- [ ] `diagram-semantic-audit.py --repo-root . --json`가 두 ledger에서 unique node/edge와 source path를 통과하는지 확인한다.

### Diagram Task 2: bilingual SVG/PNG 생성

- [ ] 한국어·영어 각각 `patient-a-flow-01`과 `service-boundaries-01` SVG를 작성한다.
- [ ] 모든 connector는 `data-connector`, marker `data-role`/`data-size`, rounded orthogonal geometry를 사용한다.
- [ ] `xmllint`, `diagram-svg-text-normalize.py`, CairoSVG scale 2 렌더를 실행해 대응 PNG를 만든다.
- [ ] 모든 PNG를 `diagram-visual-audit.py --require-opaque`와 full-size image inspection으로 확인한다.

### Diagram Task 3: MDX 노출과 parity 검증

- [ ] 한국어/영어 프롤로그의 “상품이 진료 계획이 되는 순간”과 “서비스 ownership” 섹션에 locale별 PNG를 삽입한다.
- [ ] 각 이미지 alt/caption이 action/event와 authority/responsibility를 설명하고, source/visual snapshot 경계를
  과장하지 않는지 확인한다.
- [ ] `git diff --check`, `npm run build`, 두 route HTTP 200, asset reference, locale structural parity를 검증한다.
