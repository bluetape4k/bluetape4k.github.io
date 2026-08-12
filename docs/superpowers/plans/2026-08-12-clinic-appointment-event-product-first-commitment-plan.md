# 이벤트 상품 최초 예약 약속 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** 환자 A의 이벤트 상품 구매가 상품 기준정보와 구매 기준정보를 거쳐 후보 시간, 제안·보류, 고객 동의, 확정 방문 약속으로 이어지는 업무 흐름을 한국어·영어 기술 글과 A+C 정적 diagram으로 공개한다.

**Architecture:** 한국어 원고를 사실의 기준으로 먼저 작성하고, 승인된 설계 문서와 현재 \`clinic-appointment\` \`develop\` source를 claim ledger로 대조한다. 영어 원고와 diagram은 같은 node·edge·상태·source link를 유지하면서 자연스럽게 현지화한다. 새 static SVG/PNG 한 세트를 본문에 삽입하고 기존 visual companion은 보조 링크로만 재사용한다. \`authority\`는 독자-facing 문장에서 기준정보 또는 기준정보 원천으로 표기하며, \`sourceAuthority\` 계열 식별자는 보존한다.

**Tech Stack:** Astro/Starlight MDX, Korean-first bilingual blog routes, static SVG/PNG workflow diagram, semantic ledgers, \`python3\` audit scripts, CairoSVG, Node ecosystem tests, \`npm run build\`, \`git diff --check\`.

---

## 변경 파일과 책임

- Create: \`src/content/docs/ko/blog/clinic-appointment-event-product-first-commitment.mdx\` — 환자 A의 이벤트 상품 구매부터 첫 확정 방문 약속까지의 한국어 원고.
- Create: \`src/content/docs/blog/clinic-appointment-event-product-first-commitment.mdx\` — 같은 사실·상태·근거를 보존하는 영어 현지화 원고.
- Create: \`public/assets/clinic-appointment-event-product-first-commitment-01-ko.svg\` 및 \`.png\` — 한국어 A+C 시간축 diagram.
- Create: \`public/assets/clinic-appointment-event-product-first-commitment-01-en.svg\` 및 \`.png\` — 영어 A+C 시간축 diagram.
- Create: \`docs/review/2026-08-12-clinic-appointment-event-product-first-commitment-ko.semantic.json\` — 한국어 node·edge·근거 ledger.
- Create: \`docs/review/2026-08-12-clinic-appointment-event-product-first-commitment-en.semantic.json\` — 영어 locale parity ledger.
- Modify: \`src/content/docs/ko/blog/clinic-appointment-prologue-product-to-appointment.mdx\` — 새 글의 “다음 글” 링크와 시리즈 순서.
- Modify: \`src/content/docs/blog/clinic-appointment-prologue-product-to-appointment.mdx\` — 영어 다음 글 링크와 시리즈 순서.
- Modify: \`src/content/docs/ko/blog/clinic-appointment-part1-not-just-crud.mdx\` through \`clinic-appointment-part7-review-and-operational-evolution.mdx\` — 한국어 시리즈 링크에 새 글 추가.
- Modify: \`src/content/docs/blog/clinic-appointment-part1-not-just-crud.mdx\` through \`clinic-appointment-part7-review-and-operational-evolution.mdx\` — 영어 시리즈 링크에 새 글 추가.
- Modify: \`tests/ecosystem/blog-taxonomy.test.mjs\` — bilingual blog file count \`96 → 97\`.
- Modify: \`tests/ecosystem/blog-diagram-locales.test.mjs\` — unique technical diagram stem count \`184 → 185\`.
- Reference only: \`docs/superpowers/specs/2026-08-12-clinic-appointment-event-product-first-commitment-design.md\`와 \`/Users/debop/work/bluetape4k/clinic-appointment\`의 현재 \`develop\` source.

영웅 이미지는 기존 \`/assets/clinic-appointment-prologue-hero.png\`를 재사용한다. 새 interactive companion route, visualization catalog, \`clinic-appointment\` 원본 코드, 가격·환자 식별정보·내부 threshold는 변경하지 않는다.

## Task 1: 실행 직전 근거와 로컬 형식 재확인

**Files:**

- Read: \`docs/superpowers/specs/2026-08-12-clinic-appointment-event-product-first-commitment-design.md\`
- Read: \`/Users/debop/work/bluetape4k/clinic-appointment/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/catalog/ProductCatalogDefinition.kt\`
- Read: \`/Users/debop/work/bluetape4k/clinic-appointment/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/plan/AppointmentPlanModel.kt\`
- Read: \`/Users/debop/work/bluetape4k/clinic-appointment/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/plan/BookingPreferenceSnapshot.kt\`
- Read: \`/Users/debop/work/bluetape4k/clinic-appointment/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/policy/BookingCommitmentPolicy.kt\`
- Read: \`/Users/debop/work/bluetape4k/clinic-appointment/docs/superpowers/specs/2026-07-29-issue-184-visit-commitment-design.md\`
- Read: \`src/content/docs/ko/blog/clinic-appointment-product-version-purchase-snapshot.mdx\`
- Read: \`src/content/docs/blog/clinic-appointment-product-version-purchase-snapshot.mdx\`
- Read: \`src/content/docs/ko/blog/clinic-appointment-part1-not-just-crud.mdx\`
- Read: \`src/content/docs/blog/clinic-appointment-part1-not-just-crud.mdx\`

- [ ] **Step 1: Pin the source revision and clean working tree.**

Run:

\`\`\`bash
git -C /Users/debop/work/bluetape4k/clinic-appointment rev-parse develop
git -C /Users/debop/work/bluetape4k/clinic-appointment status --short --branch
git status --short --branch
\`\`\`

Expected: source revision is \`fe772eb4504a6770ba6386efd0e0397060caf1f8\), both working trees are free of unrelated edits, and the site branch remains \`develop\`.

- [ ] **Step 2: Recheck every article claim anchor.**

Run:

\`\`\`bash
rg -n "sourceAuthority|sourcePurchaseAuthority|catalogSourceAuthority|initialBookingRule|WithinDaysAfterPurchase|BookingPreferenceSnapshot|AppointmentPlan|PlannedTreatment" \
  /Users/debop/work/bluetape4k/clinic-appointment/appointment-core/src/main/kotlin \
  /Users/debop/work/bluetape4k/clinic-appointment/docs/superpowers/specs/2026-07-29-issue-184-visit-commitment-design.md
rg -n "PROPOSED|HELD|CONFIRMED|customer consent|candidate|expiry|reschedule" \
  /Users/debop/work/bluetape4k/clinic-appointment/appointment-core/src/main/kotlin \
  /Users/debop/work/bluetape4k/clinic-appointment/docs/superpowers/specs/2026-07-29-issue-184-visit-commitment-design.md
\`\`\`

Expected: each identifier in the article has a source hit; proposal/hold/confirmed claims are labeled as approved design when the current source does not implement the complete workflow; \`WithinDaysAfterPurchase\` is not described as a product benefit expiration.

- [ ] **Step 3: Capture the local article shape.**

Compare the two existing articles and record in the working notes: frontmatter keys, hero figure markup, \`bt4k-architecture\` figure markup, heading rhythm, table/code density, evidence-link section, and bottom series navigation. Preserve the existing shared hero and do not introduce a new component.

## Task 2: 한국어 원고 작성

**Files:**

- Create: \`src/content/docs/ko/blog/clinic-appointment-event-product-first-commitment.mdx\`

- [ ] **Step 1: Add the established frontmatter and shared hero.**

Use this metadata shape:

\`\`\`yaml
---
title: "이벤트 상품은 어떤 예약 약속을 만드는가"
description: 이벤트 상품 구매가 상품 기준정보와 구매 기준정보를 거쳐 후보 시간, 고객 동의, 확정 방문 약속으로 이어지는 과정을 환자 A의 사례로 설명합니다.
sidebar:
  order: -202608121100
blog:
  date: 2026-08-12T11:00:00+09:00
  image: /assets/clinic-appointment-prologue-hero.png
  imageAlt: 상품 기준정보, 구매 문서, 예약 계획, 후보 시간, 확정 약속을 한 작업대에서 연결하는 작은 로봇 작업자들
  cardDescription: "이벤트 상품을 산 사실이 어떻게 후보 시간과 고객 동의를 거쳐 확정 방문 약속이 되는지 설명합니다."
  tags: ["architecture", "domain-modeling", "event-driven", "resilience"]
---
\`\`\`

Immediately after frontmatter, use the established \`bt4k-blog-hero\` figure with the shared absolute image path and a localized \`2026-08-12 · 병원 예약 서비스 개발기 · 상품과 예약 약속\` meta line.

- [ ] **Step 2: Write the patient A business narrative before implementation details.**

Write these sections in order:

1. \*\*이벤트 상품을 샀는데 왜 아직 방문 약속이 아닌가\*\* — one-visit event product, N-visit product, and package product are contrasted only to show that a purchase is not automatically one appointment.
2. \*\*상품 기준정보가 예약서비스에 들어오는 최소 계약\*\* — version, BOM item, duration, required practitioner/equipment/room types, and the purchase-time snapshot. Use “기준정보” and “기준정보 원천”; do not render \`authority\` as “권한”.
3. \*\*구매 사실에서 \`AppointmentPlan\`으로\*\* — explain one plan per purchase, \`PlannedTreatment\`, dependency, and why purchase completion does not immediately hold a slot.
4. \*\*희망 일정과 최초 제안 fallback을 분리하기\*\* — explain \`BookingPreferenceSnapshot\`, \`NotProvided\`, and \`initialBookingRule\`/\`WithinDaysAfterPurchase\`; explicitly separate the first proposal horizon from product benefit expiration.
5. \*\*후보 시간에서 확정 약속까지\*\* — walk T1–T6 through candidate calculation, \`PROPOSED\`, policy-specific \`HELD\`, customer consent, \`CONFIRMED\`, and visit/completion facts. Mark current implementation versus approved design.
6. \*\*예외는 같은 예약의 실패가 아니다\*\* — show no candidate, proposal/hold expiry, patient cancel/decline, and hospital-side change with distinct next actions.
7. \*\*서비스별 기준정보와 책임 경계\*\* — include rows for product management/development, commerce, reservation, clinical care, CRM/counseling, notification, and statistics/external consumers.
8. \*\*현재 구현·승인 설계·운영 대기·로드맵\*\* — restrict claims to source-backed status.

Use “행위 또는 이벤트” or “이벤트”, never “사건”. Do not disclose prices, real names, patient identifiers, hidden no-show thresholds, VIP ranking rules, or internal issue numbers in the reader-facing article.

- [ ] **Step 3: Add the source-backed relationship block and figure.**

Include this exact relationship block:

\`\`\`text
PurchaseCompleted
  └─> AppointmentPlan
        └─> PlannedTreatment 1..N ── dependency/DAG
                              ▲
                              │ fulfills / attempts
Appointment ──> AppointmentItem 1..N ──> ResourceAllocation 1..N
\`\`\`

Embed the Korean PNG with a \`<figure class="bt4k-architecture">\` and a concise caption answering “구매가 어떻게 확정 약속이 되는가”. Use the absolute asset URL \`/assets/clinic-appointment-event-product-first-commitment-01-ko.png\`.

- [ ] **Step 4: Close with evidence links and series navigation.**

Link the repository source files, the visit commitment design, the product BOM-to-plan companion, and the existing prologue. End with a Korean series list in this order: prologue, product version article, this article, Part 1–7, without exposing internal issue numbers.

## Task 3: \`$bluetape-writer\` 기술문서 교정과 사실성 게이트

**Files:**

- Read: \`/Users/debop/.codex/skills/bluetape-writer/references/blog-style-checklist.md\`
- Read: \`/Users/debop/.codex/skills/bluetape-writer/references/korean-naturalness-checklist.md\`
- Check: \`src/content/docs/ko/blog/clinic-appointment-event-product-first-commitment.mdx\`
- Check: \`docs/superpowers/specs/2026-08-12-clinic-appointment-event-product-first-commitment-design.md\`
- Check: \`/Users/debop/work/bluetape4k/clinic-appointment\` source paths listed in Task 1

- [ ] **Step 1: Run the technical-document structure review.**

Review the Korean article against the writer checklist and record the result in the working notes:

- reader problem appears before capability inventory;
- each technical claim links to current source, approved design, or an explicit state label;
- section order follows \`업무 질문 → 최소 데이터/상태 → 책임 해석 → 예외/선택 규칙\`;
- tables, code blocks, figure captions, alt text, source links, and series navigation follow nearby article conventions;
- no internal issue number, price, patient identity, hidden threshold, or unsupported production claim appears;
- \`authority\` reader-facing prose uses 기준정보/기준정보 원천, while code identifiers remain exact.

Expected: every failed row is repaired in the Korean MDX before localization; no English-only prose is added to solve a Korean structure problem.

- [ ] **Step 2: Run the Korean naturalness and terminology review.**

Apply the Korean naturalness checklist after factual claims are locked. Replace translationese, generic importance claims, noun-heavy sentences, and ambiguous ownership wording with concrete technical-register Korean. Preserve all identifiers, state names, numbers, URLs, commands, and the user-approved wording “기준정보”. Search the repaired article:

\`\`\`bash
rg -n "사건|권한|authority|Issue #[0-9]+|TODO|TBD|FIXME" \
  src/content/docs/ko/blog/clinic-appointment-event-product-first-commitment.mdx
\`\`\`

Expected: \`사건\` and internal issue references are absent; \`authority\` is absent from reader-facing prose except exact code identifiers or a terminology table; “권한” appears only in an explicit authentication/authorization context, not as the translation of source ownership.

- [ ] **Step 3: Re-run the claim ledger after prose repair.**

For each paragraph containing \`PurchaseCompleted\`, \`AppointmentPlan\`, \`BookingPreferenceSnapshot\`, \`initialBookingRule\`, \`PROPOSED\`, \`HELD\`, or \`CONFIRMED\`, compare the sentence with the source revision pinned in Task 1. Mark current implementation, approved design, awaiting operations, or roadmap in the article where needed. Do not proceed to English localization until every claim has a source or a visible state caveat.

## Task 4: Create semantic ledgers and the Korean diagram

**Files:**

- Create: \`docs/review/2026-08-12-clinic-appointment-event-product-first-commitment-ko.semantic.json\`
- Create: \`public/assets/clinic-appointment-event-product-first-commitment-01-ko.svg\`
- Create: \`public/assets/clinic-appointment-event-product-first-commitment-01-ko.png\`

- [ ] **Step 1: Define the one-asset semantic model before drawing.**

Use \`kind: "workflow"\`, source revision \`clinic-appointment@fe772eb4504a6770ba6386efd0e0397060caf1f8; visual-site@local\`, and these source paths:

\`\`\`text
docs/superpowers/specs/2026-08-12-clinic-appointment-event-product-first-commitment-design.md
appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/catalog/ProductCatalogDefinition.kt
appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/plan/AppointmentPlanModel.kt
appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/plan/BookingPreferenceSnapshot.kt
appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/policy/BookingCommitmentPolicy.kt
docs/superpowers/specs/2026-07-29-issue-184-visit-commitment-design.md
\`\`\`

Use these unique node IDs and meanings:

- \`purchase-completed\`: 구매 완료와 구매 기준정보 원천 검증
- \`catalog-snapshot\`: 상품 기준정보 version/BOM snapshot
- \`plan-created\`: \`AppointmentPlan\`과 \`PlannedTreatment\`
- \`candidate-calculated\`: 상품 조건·병원 수용량을 만족하는 후보
- \`proposal-or-hold\`: \`PROPOSED\` 또는 정책상 \`HELD\`
- \`confirmed-commitment\`: 고객 동의 뒤 \`CONFIRMED\`
- \`visit-handoff\`: 내원·완료 및 downstream 객관적 event
- \`no-candidate\`: 후보 없음과 대체/상담 handoff
- \`proposal-expired\`: 제안·hold 만료와 새 제안 필요
- \`patient-change\`: 환자 취소·거부와 상품/상담 판단 handoff
- \`hospital-change\`: 병원 사정 변경과 새 제안·동의 필요

Use these directed edges:

- \`purchase-completed → catalog-snapshot\`
- \`catalog-snapshot → plan-created\`
- \`plan-created → candidate-calculated\`
- \`candidate-calculated → proposal-or-hold\`
- \`proposal-or-hold → confirmed-commitment\`
- \`confirmed-commitment → visit-handoff\`
- \`candidate-calculated → no-candidate\`
- \`proposal-or-hold → proposal-expired\`
- \`proposal-or-hold → patient-change\`
- \`confirmed-commitment → hospital-change\`

Record \`branches: 4\`, \`loops: 0\`, \`nodes: 11\`, and \`edges: 10\` in the ledger budget. Record that product benefit expiration, VIP ordering, and no-show penalty amounts are intentionally outside the diagram.

- [ ] **Step 2: Draw the Korean A+C workflow in a wide landscape SVG.**

Use a \`2000×1200\` opaque dark canvas with:

- top statement: “구매 사실 ≠ 예약 가능 조건 ≠ 확정 약속”;
- six main timeline cards from left to right (T1–T6);
- one lower exception rail for the four branch cards;
- distinct service labels: 기준정보 원천, 상품 기준정보, 예약서비스, 고객/병원, downstream;
- explicit \`marker-end\` primary flow arrows sized \`14x14\`, rounded orthogonal paths, and no connector crossings or label intrusions;
- balanced left/right margins and enough space between cards so arrowheads remain visible;
- unchanged technical identifiers \`PurchaseCompleted\`, \`AppointmentPlan\`, \`PlannedTreatment\`, \`PROPOSED\`, \`HELD\`, \`CONFIRMED\`.

The SVG is the structural source. Do not embed English labels or internal issue numbers in the Korean asset.

- [ ] **Step 3: Normalize and render the Korean asset.**

Run:

\`\`\`bash
xmllint --noout public/assets/clinic-appointment-event-product-first-commitment-01-ko.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py \
  public/assets/clinic-appointment-event-product-first-commitment-01-ko.svg
cairosvg public/assets/clinic-appointment-event-product-first-commitment-01-ko.svg \
  -o public/assets/clinic-appointment-event-product-first-commitment-01-ko.png -s 2
\`\`\`

Expected: XML parse succeeds, text normalization reports no hazards, and CairoSVG writes an opaque PNG at the same aspect ratio.

## Task 5: Audit the Korean diagram and repair geometry

**Files:**

- Check/modify: Korean SVG, Korean PNG, Korean semantic ledger

- [ ] **Step 1: Run semantic and connector audits.**

Run:

\`\`\`bash
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-semantic-audit.py \
  --repo-root . docs/review/2026-08-12-clinic-appointment-event-product-first-commitment-ko.semantic.json
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py \
  public/assets/clinic-appointment-event-product-first-commitment-01-ko.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-arrowhead-audit.py \
  public/assets/clinic-appointment-event-product-first-commitment-01-ko.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py \
  --fail-diagonal public/assets/clinic-appointment-event-product-first-commitment-01-ko.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py \
  public/assets/clinic-appointment-event-product-first-commitment-01-ko.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py \
  public/assets/clinic-appointment-event-product-first-commitment-01-ko.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-visual-audit.py \
  --require-opaque public/assets/clinic-appointment-event-product-first-commitment-01-ko.png
\`\`\`

Expected: semantic counts are \`nodes=11\`, \`edges=10\`, \`branches=4\`, \`loops=0\`; marker usage is nonzero; connector, endpoint, geometry, mixed-corner, and visual audits report zero failures and no weak/unavailable evidence.

- [ ] **Step 2: Inspect the full-size PNG and record the visual result.**

Open the PNG at full size with \`view_image\`. Confirm T1–T6 read left to right, all four exception branches terminate at their intended cards, arrowheads are visible, rounded corners follow flow direction, no labels or connectors overlap, and left/right whitespace is balanced. If any check fails, edit only the Korean SVG, rerender, and rerun the full audit set.

## Task 6: English diagram and article localization

**Files:**

- Create: \`docs/review/2026-08-12-clinic-appointment-event-product-first-commitment-en.semantic.json\`
- Create: \`public/assets/clinic-appointment-event-product-first-commitment-01-en.svg\`
- Create: \`public/assets/clinic-appointment-event-product-first-commitment-01-en.png\`
- Create: \`src/content/docs/blog/clinic-appointment-event-product-first-commitment.mdx\`

- [ ] **Step 1: Clone topology and ledger structure for English.**

Keep the same 11 node IDs, 10 edge IDs, dimensions, path geometry, marker roles, and source revision. Translate only reader-facing labels and descriptions. Use \`source of truth\`, \`catalog source\`, and \`purchase source\` in prose; preserve code identifiers and state names.

- [ ] **Step 2: Render and audit the English asset.**

Run the same XML, normalization, CairoSVG, semantic, connector, arrowhead, geometry, endpoint, mixed-corner, and visual audit commands with the \`-en\` paths. Expected output is identical topology and zero failures.

- [ ] **Step 3: Localize the English article after Korean facts are locked.**

Use:

\`\`\`yaml
---
title: "What Appointment Promise Does an Event Product Create?"
description: Follow one patient's event product purchase from source-of-truth catalog data to candidate times, consent, and a confirmed visit commitment.
sidebar:
  order: -202608121100
blog:
  date: 2026-08-12T11:00:00+09:00
  image: /assets/clinic-appointment-prologue-hero.png
  imageAlt: Small robotic builders connect catalog data, a purchase document, an appointment plan, candidate times, and a confirmed visit promise on one workbench
  cardDescription: "Follow how an event product becomes a visit promise through candidate times and customer consent."
  tags: ["architecture", "domain-modeling", "event-driven", "resilience"]
---
\`\`\`

Preserve section count, identifiers, state names, source URLs, caveats, and the distinction between first-proposal horizon and product benefit expiration. Use \`/assets/clinic-appointment-event-product-first-commitment-01-en.png\` in the English figure and English visual companion routes without \`/ko\`.

## Task 7: Update navigation and repository count contracts

**Files:**

- Modify: both prologue MDX files
- Modify: all seven Korean and seven English Part 1–7 MDX files
- Modify: \`tests/ecosystem/blog-taxonomy.test.mjs\`
- Modify: \`tests/ecosystem/blog-diagram-locales.test.mjs\`

- [ ] **Step 1: Update prologue next-article wording and series lists.**

In Korean, replace the prologue’s current next-article promise with a link to \`/ko/blog/clinic-appointment-event-product-first-commitment/\` and describe the event-product first commitment. In English, use the matching \`/blog/clinic-appointment-event-product-first-commitment/\` link. In both prologues, list the order: prologue, product version article, event product article, Part 1–7.

- [ ] **Step 2: Add the event-product link to every Part 1–7 series list.**

Insert exactly one link after the product-version article and before Part 1:

\`\`\`md
- [이벤트 상품은 어떤 예약 약속을 만드는가](/ko/blog/clinic-appointment-event-product-first-commitment/)
\`\`\`

and the English equivalent:

\`\`\`md
- [What Appointment Promise Does an Event Product Create?](/blog/clinic-appointment-event-product-first-commitment/)
\`\`\`

Preserve every existing title, route, date, and source link.

- [ ] **Step 3: Update and mechanically verify intentional counts.**

Change only the expected constants:

\`\`\`text
tests/ecosystem/blog-taxonomy.test.mjs: 96 → 97
tests/ecosystem/blog-diagram-locales.test.mjs: 184 → 185
\`\`\`

Run:

\`\`\`bash
node - <<'NODE'
const fs = require('fs');
for (const root of ['src/content/docs/blog', 'src/content/docs/ko/blog']) {
  const count = fs.readdirSync(root).filter((name) => name.endsWith('.mdx') && name !== 'index.mdx').length;
  console.log(root, count);
}
NODE
for f in src/content/docs/ko/blog/clinic-appointment-{prologue-product-to-appointment,part1-not-just-crud,part2-state-machine-and-history,part3-clinic-specific-availability,part4-greedy-vs-global-optimization,part5-timefold-constraints,part6-closure-equipment-rescheduling,part7-review-and-operational-evolution}.mdx; do test "$(rg -c 'clinic-appointment-event-product-first-commitment' "$f")" -eq 1; done
for f in src/content/docs/blog/clinic-appointment-{prologue-product-to-appointment,part1-not-just-crud,part2-state-machine-and-history,part3-clinic-specific-availability,part4-greedy-vs-global-optimization,part5-timefold-constraints,part6-closure-equipment-rescheduling,part7-review-and-operational-evolution}.mdx; do test "$(rg -c 'clinic-appointment-event-product-first-commitment' "$f")" -eq 1; done
\`\`\`

Expected: both locale directories contain 97 posts and each listed article contains exactly one new event-product series link.

## Task 8: Run final writer, parity, and site validation

**Files:**

- Check: two new articles, two SVG/PNG pairs, two semantic ledgers, two prologue articles, fourteen Part 1–7 articles, and two test files.

- [ ] **Step 1: Run factual and Korean naturalness checks.**

Search the changed Korean article for forbidden or unstable wording:

\`\`\`bash
rg -n "사건|권한|Issue #[0-9]+|상품 이용 만료일|VIP|노쇼|TODO|TBD|FIXME" \
  src/content/docs/ko/blog/clinic-appointment-event-product-first-commitment.mdx
\`\`\`

Expected: no internal issue number or “사건” appears; “권한” appears only if the sentence explicitly discusses authentication/authorization, and \`authority\` reader-facing translations are 기준정보/기준정보 원천. Review tables, captions, alt text, code identifiers, URLs, and status labels with \`bluetape-writer\` naturalness rules.

- [ ] **Step 2: Verify bilingual parity.**

Compare both new MDX files section by section. Confirm equal section order, equal state/identifier lists, equal source-link count and URLs, equal diagram stem, equal tag list, and equal series navigation. Confirm Korean/English semantic ledgers have the same node and edge IDs.

- [ ] **Step 3: Run focused tests and the site build.**

Run:

\`\`\`bash
git diff --check
node --test tests/ecosystem/blog-taxonomy.test.mjs tests/ecosystem/blog-diagram-locales.test.mjs
npm run build
\`\`\`

Expected: whitespace check is clean, focused tests pass with 97 bilingual posts and 185 technical diagram stems, and Astro check/build succeeds for both new routes.

- [ ] **Step 4: Verify route, asset, and link exposure.**

Run:

\`\`\`bash
test -f public/assets/clinic-appointment-event-product-first-commitment-01-ko.png
test -f public/assets/clinic-appointment-event-product-first-commitment-01-en.png
test -f public/assets/clinic-appointment-event-product-first-commitment-01-ko.svg
test -f public/assets/clinic-appointment-event-product-first-commitment-01-en.svg
rg -n "clinic-appointment-event-product-first-commitment-(01-(ko|en)\\.png|/)" src/content/docs/ko/blog/clinic-appointment-event-product-first-commitment.mdx src/content/docs/blog/clinic-appointment-event-product-first-commitment.mdx
git status --short
\`\`\`

Expected: all four asset files exist, both article embeds use the correct locale PNG, generated routes are present in build output, and no unrelated files are modified.

## Task 9: Final review and handoff

- [ ] Compare the final diff with the approved design and this plan. Confirm no source-code, interactive companion, publication, PR, merge, or deployment side effect occurred.
- [ ] Confirm the reader-facing term contract: \`authority → 기준정보/기준정보 원천\`; \`sourceAuthority\` and related code identifiers unchanged; “행위 또는 이벤트”/“이벤트” used instead of “사건”.
- [ ] Confirm the article distinguishes current implementation, approved design, awaiting operations, and roadmap, and does not present product benefit expiration as \`WithinDaysAfterPurchase\`.
- [ ] Confirm every visual gate has falsifiable evidence: semantic counts, XML, text normalization, CairoSVG dimensions, connector/arrowhead/endpoint/geometry/mixed-corner audits, opaque visual audit, and full-size PNG inspection.
- [ ] Confirm final report includes changed files, plan-item statuses, focused test/build output, visual evidence, known gaps, and \`DONE\`/ \`PENDING\` state. Deployment remains pending until separately requested.

## Self-review before execution

- [x] Every approved design section is mapped: patient A timeline, minimum catalog contract, Plan materialization, preference/fallback, proposal/hold/consent, four exceptions, service responsibility table, fact-state labels, A+C diagram, bilingual parity, and validation.
- [x] The plan contains a dedicated \`$bluetape-writer\` technical-document review before English localization, including blog style, Korean naturalness, terminology, claim-source, and issue-number checks.
- [x] Existing repository counts were rechecked as 96 posts and 184 diagram stems; the plan updates them to 97 and 185.
- [x] Every new or modified path is listed with one responsibility.
- [x] Diagram node/edge counts, branch count, source revision, render command, audit commands, and full-size inspection are concrete.
- [x] No placeholder, speculative production claim, internal threshold, or deployment action is hidden in an execution step.
