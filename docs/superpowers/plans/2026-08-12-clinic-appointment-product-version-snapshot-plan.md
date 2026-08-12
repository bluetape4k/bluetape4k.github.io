# Product Version and Purchase Snapshot Blog Series Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 상품 버전이 변경되어도 기존 구매와 환자의 방문 약속을 다시 해석하지 않는 업무 흐름을 환자 A 사례로 설명하는 새 병원 예약 기술 블로그 글을 한국어·영어로 추가하고, 기존 시리즈·다이어그램·사이트 검증 계약을 모두 유지한다.

**Architecture:** 상품개발부와 커머스가 상품 정의와 구매 사실을 소유하고, 예약서비스가 구매 시점의 상품 버전과 해석 결과를 불변 purchase snapshot 및 AppointmentPlan revision으로 보존한다. 상품 v2 변경은 자동 재배포가 아니라 명시적인 migration mapping·동의·새 revision을 거치며, 완료·진행 중·확정 방문 사실은 보호한다. 동일 purchase identity의 중복 전달은 한 Plan으로 수렴시키는 짧은 기술 설명으로만 다루고, 핵심 서사는 상품 변경에 따른 업무 판단에 둔다.

**Tech Stack:** Astro/Starlight MDX, Korean-first bilingual blog routes, static SVG/PNG architecture diagram, semantic ledgers, Node ecosystem tests, npm build, bluetape-writer, bluetape-diagram.

---

## Scope and file ownership

- New Korean route: `src/content/docs/ko/blog/clinic-appointment-product-version-purchase-snapshot.mdx`
- New English route: `src/content/docs/blog/clinic-appointment-product-version-purchase-snapshot.mdx`
- Reused hero: `public/assets/clinic-appointment-prologue-hero.png`; no new hero generation.
- New diagram assets:
  - `public/assets/clinic-appointment-product-version-migration-01-ko.svg`
  - `public/assets/clinic-appointment-product-version-migration-01-ko.png`
  - `public/assets/clinic-appointment-product-version-migration-01-en.svg`
  - `public/assets/clinic-appointment-product-version-migration-01-en.png`
- New semantic ledgers:
  - `docs/review/2026-08-12-clinic-appointment-product-version-migration-01-ko.semantic.json`
  - `docs/review/2026-08-12-clinic-appointment-product-version-migration-01-en.semantic.json`
- Existing prologue routes:
  - `src/content/docs/ko/blog/clinic-appointment-prologue-product-to-appointment.mdx`
  - `src/content/docs/blog/clinic-appointment-prologue-product-to-appointment.mdx`
- Existing Part 1–7 routes: all seven Korean and seven English `clinic-appointment-part*.mdx` files.
- Count assertions:
  - `tests/ecosystem/blog-taxonomy.test.mjs`
  - `tests/ecosystem/blog-diagram-locales.test.mjs`
- Out of scope: clinic-appointment source code, source catalog files, existing interactive visual companions, GitHub issue/PR mutation, merge, Pages dispatch, or publication.

## Task 1: Reconfirm source facts and local writing shape

- [ ] Read the approved spec at `docs/superpowers/specs/2026-08-12-clinic-appointment-product-version-snapshot-design.md` and record its route, frontmatter, diagram, parity, and side-effect decisions as the execution checklist.
- [ ] Verify the clinic repository is read at the current `develop` revision and inspect the following source paths before drafting claims:
  - `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/catalog/ProductCatalogDefinition.kt`
  - `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/plan/ProductVersionMigration.kt`
  - `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/service/ProductVersionMigrationPlanner.kt`
  - `appointment-event/src/main/kotlin/io/bluetape4k/clinic/appointment/event/integration/ProductVersionMigrationHandler.kt`
  - `appointment-event/src/main/kotlin/io/bluetape4k/clinic/appointment/event/PurchaseCompletedEvent.kt`
- [ ] Verify the existing series shape by comparing `clinic-appointment-prologue-product-to-appointment.mdx`, Part 1, Part 6, and Part 7 in both locales: frontmatter, reused hero behavior, heading rhythm, tables, source links, figure classes, and bottom navigation.
- [ ] Build a claim-to-source checklist in the working notes: v1 immutable snapshot, v2 new-purchase behavior, explicit migration mapping, protected completed/confirmed facts, separate reschedule consent, and duplicate delivery versus a real additional purchase. Remove any claim that cannot be tied to the inspected source or approved spec.

Expected result: the article can state which behavior is current implementation, approved design, or future operational work without presenting internal issue numbers as reader-facing content.

## Task 2: Draft the Korean primary article

- [ ] Create `src/content/docs/ko/blog/clinic-appointment-product-version-purchase-snapshot.mdx` with the approved frontmatter:
  - title: `상품이 바뀌어도 고객의 약속은 다시 쓰지 않는다: 상품 버전과 구매 snapshot`
  - description describing product change, purchase snapshot, Plan revision, consent, and protected visit facts.
  - sidebar order `-202608121000`
  - blog date `2026-08-12T10:00:00+09:00`
  - reused prologue hero image and Korean alt/card text
  - tags `["architecture", "domain-modeling", "event-driven", "resilience"]`
- [ ] Open with one patient A timeline containing an event product, an N-visit product, and a package product. Use `행위` or `이벤트` consistently; do not translate the domain event as `사건`.
- [ ] Explain the first boundary as commercial truth versus scheduling truth: the product team/commerce owns product definitions and purchase authority, while the reservation service owns the plan needed to schedule and reproduce the purchase-time interpretation.
- [ ] Show the v1 invariant with a compact table: purchase ID, product version, catalog payload/hash, planned treatments, policy snapshot, consent/provenance. State that changing the current catalog does not rewrite an existing purchase or plan.
- [ ] Follow the v2 change through explicit business decisions: new purchases use v2; an existing purchase may migrate only after a ProductVersionMigrationApproved event, product-team mapping, and patient consent. Explain KEEP, REPLACE, SPLIT, MERGE, REMOVE, and ADD with a short patient A example.
- [ ] Separate protected facts from mutable future intent. Completed, in-progress, and already confirmed visits remain intact; only pending/future treatments can enter a new immutable AppointmentPlanRevision. A schedule change is a separate proposal and consent flow, and rejection preserves the confirmed visit while handing the objective result to CRM/commerce.
- [ ] Include a bounded technical callout explaining that repeated delivery of the same purchase event is not a second purchase: the same purchase identity converges to one Plan, while a new purchase ID creates a new Plan. Keep this as an implementation guardrail, not the article's main conflict.
- [ ] Use one `bt4k-architecture` figure for the bilingual time-axis diagram, with absolute `/assets/...` PNG URL, Korean alt text, and a caption that explains the business decision rather than listing internal work items.
- [ ] Link the existing prologue companion visuals where they clarify product-to-plan and patient A flow; do not add a new interactive route or duplicate an existing visual.
- [ ] Close with a concise checklist for product, reservation, and CRM/consultation responsibilities, a references section linking the clinic repository and approved design/source documents, and bottom series navigation. Do not mention internal management numbers.

Expected result: the Korean article tells one coherent business story, distinguishes “상품을 샀다” from “방문을 확정했다,” and makes the protected-fact rule visible before discussing implementation details.

## Task 3: Create bilingual migration diagrams and semantic ledgers

- [ ] Create Korean and English SVGs with the same topology, dimensions, and node IDs. Use a readable wide landscape canvas with balanced left/right margins and generous horizontal spacing.
- [ ] Keep exactly these ten node IDs and meanings:
  - `catalog-v1`: 상품 catalog v1
  - `purchase-a-v1`: 환자 A 구매와 v1 snapshot
  - `plan-v1`: v1 AppointmentPlan
  - `completed-protected`: 완료·진행 중 사실 보호
  - `confirmed-protected`: 확정 방문 약속 보호
  - `catalog-v2`: 상품 catalog v2 발행
  - `new-purchase-v2`: 신규 구매는 v2 해석
  - `migration-approved`: mapping·동의가 포함된 migration 승인
  - `plan-revision-v2`: 같은 Plan의 새 immutable revision
  - `crm-handoff`: 거절·재조정 결과를 CRM/상담으로 전달
- [ ] Keep exactly these nine directed edges:
  - `catalog-v1 -> purchase-a-v1`
  - `purchase-a-v1 -> plan-v1`
  - `plan-v1 -> completed-protected`
  - `plan-v1 -> confirmed-protected`
  - `catalog-v2 -> new-purchase-v2`
  - `catalog-v2 -> migration-approved`
  - `migration-approved -> plan-revision-v2`
  - `migration-approved -> confirmed-protected`
  - `migration-approved -> crm-handoff`
- [ ] Use locale-specific reader-facing labels while keeping identifiers and event names unchanged. Make the v1-to-v2 split visually obvious: new purchases branch directly to v2, existing purchases branch through explicit approval and consent.
- [ ] Write both semantic ledgers with `kind: workflow`, the ten nodes, the nine edges, zero loops, the current clinic source revision `b052a69`, and exact source paths from Task 1. Record that the ledgers describe business roles and protected facts rather than a claim of a new source-code module.
- [ ] Embed only the PNG output in MDX while retaining SVG as the inspectable source asset.

Expected result: both locales render the same business topology, semantic audit reports the expected node/edge counts, and the diagram does not imply that a catalog update silently reschedules a patient.

## Task 4: Render and audit the diagrams

- [ ] Validate both SVG files with `xmllint --noout`.
- [ ] Normalize SVG text with `diagram-svg-text-normalize.py`, then render both PNGs with CairoSVG at scale 2.
- [ ] Run the diagram audits from `/Users/debop/.codex/skills/bluetape-diagram/scripts`:
  - `diagram-semantic-audit.py` for each ledger
  - `diagram-connector-audit.py`
  - `diagram-arrowhead-audit.py`
  - `diagram-geometry-audit.py --fail-diagonal`
  - `diagram-endpoint-audit.py`
  - `diagram-mixed-corner-audit.py`
  - `diagram-visual-audit.py --require-opaque`
- [ ] Inspect the full-size Korean and English PNGs with the image viewer. Confirm labels are readable at article scale, arrow endpoints touch intended nodes, no connector crosses a label, the left and right margins are visually balanced, and the PNG background is opaque.
- [ ] Record the audit output and visual findings in the final DoD; repair any failing audit before proceeding to localization.

Expected result: all diagram audits pass with no weak or unavailable semantic source and the two locale images differ only in reader-facing language.

## Task 5: Localize the English article and prove parity

- [ ] Create `src/content/docs/blog/clinic-appointment-product-version-purchase-snapshot.mdx` with the English title `When a Product Changes, Don't Rewrite the Patient's Promise: Product Versions and Purchase Snapshots`, matching date/order/tags, reused hero, diagram asset, references, and navigation.
- [ ] Localize the Korean business narrative naturally; preserve product version names, event names, mapping types, statuses, IDs, source URLs, numbers, and the distinction between a repeated event delivery and an additional purchase.
- [ ] Compare both routes section by section. Confirm the patient A timeline, v1/v2 decision, migration consent, protected facts, CRM handoff, bounded idempotency callout, diagram path, and bottom series links are all present in both locales.
- [ ] Keep the English diagram ledger and asset labels in parity with the Korean topology and edge IDs.

Expected result: the required bilingual routes are aligned without literal translation of Korean idioms or loss of technical caveats.

## Task 6: Update series navigation and route-count contracts

- [ ] Add the new article link after the prologue and before Part 1 in both locale prologues. Replace the old idempotency-heavy next-article sentence with a product-change preview that matches the new article's focus.
- [ ] Add the new article link after the prologue and before Part 1 in all seven Korean and seven English Part 1–7 posts, preserving each file's existing local link style and bottom navigation.
- [ ] Update `tests/ecosystem/blog-taxonomy.test.mjs` bilingual file-count assertions from 95 to 96.
- [ ] Update `tests/ecosystem/blog-diagram-locales.test.mjs` unique diagram-stem assertion from 183 to 184 for the four new locale assets.
- [ ] Search the changed routes for stale next-article wording, broken relative links, internal issue references, and mismatched locale asset suffixes.

Expected result: the new article is discoverable from the entire series, and the repository's intentional count assertions describe the new 96-post/184-diagram state.

## Task 7: Run site, route, and content verification

- [ ] Run `git diff --check` and repair every whitespace or patch error.
- [ ] Run the focused ecosystem tests:
  `node --test tests/ecosystem/blog-taxonomy.test.mjs tests/ecosystem/blog-diagram-locales.test.mjs`.
- [ ] Run `npm run build` and capture the successful Astro/Starlight build output.
- [ ] Verify changed routes and assets with repository-native searches:
  - both new article routes exist in the generated route output;
  - both PNG diagrams resolve from the MDX embeds;
  - both SVG/PNG locale pairs exist;
  - every new source and design link resolves to the intended current `develop` path;
  - all 14 Part links and both prologue links resolve.
- [ ] Run the repository's full `npm test` command if available after the focused tests, and report any unrelated baseline failure separately rather than weakening the new assertions.

Expected result: whitespace, focused tests, build, route resolution, asset resolution, locale parity, and series navigation all have fresh evidence.

## Task 8: Final scope and DoD review

- [ ] Review the diff against the approved spec and confirm no clinic-appointment source code, catalog data, interactive companion, or publication surface changed.
- [ ] Confirm Korean technical prose follows bluetape-writer: reader problem first, concrete business evidence, stable terms, no marketing claims, and no translationese.
- [ ] Confirm the article uses “이벤트” or “행위” for domain events, never “사건,” and does not expose internal issue numbers.
- [ ] Confirm every changed visual has SVG source, PNG output, locale pair, semantic ledger, inspected render, and passing audits.
- [ ] Confirm final report includes plan-item status, changed files, exact verification commands/results, known gaps, and `DONE`/`PENDING` state. Publication, PR, merge, and Pages deployment remain explicitly out of scope.

## Self-review before execution handoff

- [ ] Every approved design decision is represented: v1 snapshot, v2 new-purchase path, explicit migration mapping and consent, protected facts, separate reschedule proposal, CRM handoff, and bounded duplicate-delivery callout.
- [ ] Every path named in the plan is either an existing file to modify or an explicitly listed new output.
- [ ] The diagram node/edge counts in the plan match both semantic ledgers and the intended audit commands.
- [ ] The plan contains concrete commands and expected results for writing, diagram, route, locale, and site verification.
- [ ] No task depends on an unrecorded internal issue, unpublished source code, or a future interactive visual route.
