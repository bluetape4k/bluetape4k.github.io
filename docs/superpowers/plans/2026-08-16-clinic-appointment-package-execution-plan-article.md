# Clinic Appointment Package Execution Plan Article Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a bilingual, source-backed Implementation 9 article that explains how a purchased package execution contract becomes an immutable `AppointmentPlan` revision without implying that the planner already creates visit candidates or confirmed appointments.

**Architecture:** Insert Implementation 9 between Implementation 8 and Operations 1.1 in the shared Clinic Appointment series. Lead with the approved dermatology choice scenario, distinguish it from the current test fixture, and map every implementation claim to the current Clinic Appointment models, planner, handler, or tests. Generate one localized workflow diagram and one localized sequence diagram from deterministic SVG sources, plus one text-free hero shared by both locales.

**Tech Stack:** Astro/Starlight MDX, Node.js ESM, SVG, CairoSVG, Node test runner, Playwright browser QA, `bluetape-writer`, `bluetape-diagram`, `image_gen`

---

## File map

- Create `src/content/docs/ko/blog/clinic-appointment-package-execution-plan.mdx`: Korean source article.
- Create `src/content/docs/blog/clinic-appointment-package-execution-plan.mdx`: English localization with claim, table, link, and asset parity.
- Modify `src/data/clinic-appointment-series.mjs`: add Implementation 9 after Implementation 8.
- Modify `tests/ecosystem/clinic-appointment-series.test.mjs`: lock the new count, group count, order, slug, and bilingual file presence.
- Create `scripts/generate-clinic-appointment-package-execution-plan-diagrams.mjs`: generate both localized diagram families and render 2x PNGs.
- Create `public/assets/clinic-appointment-package-execution-plan-hero.png`: text-free hero shared by both locales.
- Create `public/assets/clinic-appointment-package-execution-plan-01-{ko,en}.{svg,png}`: execution contract, five validations, revision output, and scheduling boundary.
- Create `public/assets/clinic-appointment-package-execution-plan-02-{ko,en}.{svg,png}`: separate event path, ordered handler calls, and explicit terminal outcomes.
- Create `docs/superpowers/specs/2026-08-16-clinic-appointment-package-execution-plan-01.semantic.json`: semantic ledger for diagram 1.
- Create `docs/superpowers/specs/2026-08-16-clinic-appointment-package-execution-plan-02.semantic.json`: semantic ledger for diagram 2.

## Source anchors

All implementation claims must be rechecked against the current `clinic-appointment` `develop` branch before drafting and once again before final review:

- `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/service/PackageExecutionPlanner.kt`
- `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/plan/PackageExecutionSnapshot.kt`
- `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/plan/AppointmentPlanRevisionModel.kt`
- `appointment-event/src/main/kotlin/io/bluetape4k/clinic/appointment/event/integration/PackageExecutionEvent.kt`
- `appointment-event/src/main/kotlin/io/bluetape4k/clinic/appointment/event/integration/VisitPlanningEventHandler.kt`
- the matching planner and event-handler tests
- Issue #184 approved design companion for the reader-facing dermatology scenarios

### Task 1: Lock the series contract before adding the articles

**Files:**
- Modify: `tests/ecosystem/clinic-appointment-series.test.mjs`
- Modify: `src/data/clinic-appointment-series.mjs`

- [ ] **Step 1: Change the regression test first**

Update the total and unique slug count from 20 to 21, the implementation group count from 8 to 9, both locale article counts from 20 to 21, and insert `implementation-9` immediately after `implementation-8` in the expected ID list.

- [ ] **Step 2: Run the series test and confirm the expected failure**

Run:

```bash
node --test tests/ecosystem/clinic-appointment-series.test.mjs
```

Expected: FAIL because the registry still contains 20 entries.

- [ ] **Step 3: Add the Implementation 9 registry entry**

Insert:

```javascript
{
  id: 'implementation-9',
  group: 'implementation',
  slug: 'clinic-appointment-package-execution-plan',
  ko: '[구현 9] 패키지 상품의 실행 순서와 선택 조건을 방문 계획으로 고정하는 방법',
  en: '[Implementation 9] Freezing Package Choices and Execution Order into a Visit Plan',
},
```

- [ ] **Step 4: Confirm that only missing-article assertions remain red**

Run the same test. Expected: registry count and order pass; the new locale article reads fail with `ENOENT`.

- [ ] **Step 5: Commit the series contract**

Commit only the registry and test with a Korean Lore-format message explaining why Implementation 9 belongs between Implementation 8 and Operations 1.1.

### Task 2: Define and generate diagram 1, the package contract workflow

**Files:**
- Create: `docs/superpowers/specs/2026-08-16-clinic-appointment-package-execution-plan-01.semantic.json`
- Create: `scripts/generate-clinic-appointment-package-execution-plan-diagrams.mjs`
- Create: `public/assets/clinic-appointment-package-execution-plan-01-ko.svg`
- Create: `public/assets/clinic-appointment-package-execution-plan-01-ko.png`
- Create: `public/assets/clinic-appointment-package-execution-plan-01-en.svg`
- Create: `public/assets/clinic-appointment-package-execution-plan-01-en.png`

- [ ] **Step 1: Write the semantic ledger before drawing**

The ledger must map these source-backed nodes and relationships:

- input contract: required skin diagnosis v2 plus Patient A's selected laser toning v8 and soothing mask management v4;
- validation corridor: quantity/size, exact selection count, treatment provenance, relationship references, DAG acyclicity;
- output revision: `PlannedTreatment`, `ExecutionDependency`, and `VisitGroupingConstraint`;
- comparison note: `MAY_SAME_VISIT` and `MUST_SEPARATE_VISIT` remain grouping constraints rather than fixed visit counts;
- explicit terminal boundary: no visit candidate and no confirmed appointment are created here.

Record that the dermatology labels come from the approved design companion while planner behavior comes from current source and tests.

- [ ] **Step 2: Pass the semantic audit before rendering**

```bash
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-semantic-audit.py \
  --repo-root . --json docs/superpowers/specs/2026-08-16-clinic-appointment-package-execution-plan-01.semantic.json
```

Expected: unique nodes, closed endpoints, and workflow complexity within budget.

- [ ] **Step 3: Implement diagram 1 in the deterministic generator**

Use a 1440px-wide canvas with enough height for five validation rows, generous vertical card spacing, a real bottom margin, explicit per-color 14×14 arrow markers, and rounded orthogonal connectors. Keep every connector in its own corridor, make endpoint segments perpendicular to card edges, and put labels in reserved gaps rather than over lines. Korean uses `goorm Sans`/`goorm Sans Code`; English uses `Architects Daughter`/`Comic Mono`.

- [ ] **Step 4: Render and audit one locale asset at a time**

Run the generator, then for `01-ko` and `01-en` separately run:

```bash
xmllint --noout public/assets/<asset>.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py public/assets/<asset>.svg
cairosvg public/assets/<asset>.svg -o public/assets/<asset>.png -s 2
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py public/assets/<asset>.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-arrowhead-audit.py public/assets/<asset>.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal public/assets/<asset>.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py public/assets/<asset>.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py public/assets/<asset>.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-visual-audit.py --require-opaque public/assets/<asset>.png
```

Expected: zero connector, marker-color, direction, diagonal, endpoint, mixed-corner, and canvas failures.

- [ ] **Step 5: Inspect both PNGs at original size**

Reject clipped or small text, ambiguous boundaries, compressed vertical spacing, unexplained dashed lines, connector/card overlap, and insufficient bottom padding. Record every repair in the semantic ledger and rerun the complete audit loop.

### Task 3: Define and generate diagram 2, the event-handling sequence

**Files:**
- Create: `docs/superpowers/specs/2026-08-16-clinic-appointment-package-execution-plan-02.semantic.json`
- Modify: `scripts/generate-clinic-appointment-package-execution-plan-diagrams.mjs`
- Create: `public/assets/clinic-appointment-package-execution-plan-02-ko.svg`
- Create: `public/assets/clinic-appointment-package-execution-plan-02-ko.png`
- Create: `public/assets/clinic-appointment-package-execution-plan-02-en.svg`
- Create: `public/assets/clinic-appointment-package-execution-plan-02-en.png`

- [ ] **Step 1: Open and record two sequence references**

Inspect one current best-practices sequence PNG and the nearest approved Clinic Appointment sequence PNG at original size. Record their paths and the selected palette/spacing authority in diagram 2's ledger before drawing.

- [ ] **Step 2: Define the sequence semantics**

Declare separate participants and ordered messages for:

1. `PurchaseCompletedHandler` creates the existing `AppointmentPlan` from the purchase event;
2. a separate `PackageExecutionEvent` enters `VisitPlanningEventHandler`;
3. the handler reads the Plan and validates product/version/hash/order;
4. `PackageExecutionPlanner` validates and returns a revision draft;
5. revision, child graph, inbox result, and outbox event are stored transactionally;
6. an explicit **최종 결과 결정** frame leads to `DUPLICATE`, `WAITING_GAP`, quarantine/conflict, or appended revision.

Do not draw a direct call from `PurchaseCompletedHandler` to the package planner. Do not draw `MAY_SAME_VISIT` as an actual visit grouping or an appended revision as a confirmed appointment.

- [ ] **Step 3: Implement proper sequence geometry**

Use participant headers, lifelines, activation bars, transparent chronological branch frames, and visible numbered message pills. Each pill sits above its own continuous message line with 6–12px clearance. Increase row height and canvas height whenever labels approach call lines; never shrink or hide labels. Arrowhead, message line, pill border, and number badge must use the same muted semantic color.

- [ ] **Step 4: Render and audit each locale separately**

Run the common diagram audits from Task 2 plus:

```bash
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-sequence-style-audit.py public/assets/<asset>.svg
```

Expected: visible numbered label count matches the ledger, branch frames are transparent, call lines remain continuous, all terminal outcomes are explicit, and marker colors match message lines.

- [ ] **Step 5: Inspect both full-size PNGs and repair before moving on**

Reject any label/call-line overlap, hard or backward corner, lifeline collision, opaque branch frame, cramped bottom outcome card, or unclear return direction. Add repair receipts to the ledger and rerun every affected audit.

- [ ] **Step 6: Commit both verified diagram families**

Commit the generator, ledgers, SVGs, and PNGs together with exact audit evidence in the Lore `Tested:` trailer.

### Task 4: Generate a distinct series hero

**Files:**
- Create: `public/assets/clinic-appointment-package-execution-plan-hero.png`

- [ ] **Step 1: Inspect nearby hero references**

Compare at least the Design 4, Design 5, and Implementation 8 heroes. Record the established miniature clinic/robot language and the compositions that must not be repeated.

- [ ] **Step 2: Generate one text-free 16:9 hero with `image_gen`**

Show a bright 3D miniature clinic workbench. On the left, a white-and-blue robot chooses two treatment cards beside a laser device and a skin-diagnosis card. On the right, another robot records the verified choice into a plan-revision tray. Use small check symbols only as shapes; include no readable words, letters, numbers, logos, watermarks, UI labels, or infographic connector lines.

- [ ] **Step 3: Compare the output at full size and in a contact sheet**

Expected: the camera angle, dominant silhouette, treatment-selection action, and first-viewport composition differ clearly from Design 4, Design 5, and Implementation 8 while remaining recognizable as the same series.

- [ ] **Step 4: Commit the accepted hero**

Commit only the hero asset with the generation and comparison evidence recorded in the Korean Lore-format commit.

### Task 5: Write the Korean source article from current behavior

**Files:**
- Create: `src/content/docs/ko/blog/clinic-appointment-package-execution-plan.mdx`

- [ ] **Step 1: Create the local article shell**

Match the frontmatter, hero markup, post meta, tag family, source-link style, `bt4k-architecture` embeds, and shared series navigation used by Design 4, Design 5, and Implementation 8. Use the approved Korean title, the new hero, and `current="clinic-appointment-package-execution-plan" locale="ko"`.

- [ ] **Step 2: Draft the patient-led narrative in this order**

1. Patient A selects laser toning and soothing mask management after skin diagnosis.
2. Explain why a component list cannot preserve a purchase-time choice contract.
3. Show what `PackageExecutionSnapshot` fixes at purchase time.
4. Walk through the five planner validations.
5. Compare execution dependencies with visit-grouping constraints.
6. Explain copying into `AppointmentPlanRevisionDraft` and the no-scheduling boundary.
7. Separate purchase completion from the later package execution event.
8. Explain duplicate, version gap, conflict/quarantine, and transactional revision append.
9. State the current implementation, approved-design example, and operational-validation boundary.

Use one short Kotlin snippet from the planner validation/draft path. Explain what it proves immediately before or after the snippet; do not paste the whole handler.

- [ ] **Step 3: Embed both Korean diagrams**

Use absolute `/assets/...` paths, descriptive alt text, captions that explain the boundary rather than restate the title, and markup compatible with the existing click-to-enlarge behavior.

- [ ] **Step 4: Apply Korean technical-writing and terminology review**

Use natural Korean sentence order and expand explanations where the reader needs domain context. Preserve the shared glossary: `예약 서비스`, `스냅숏`, `방문 계획`, `방문 약속`, `대기 목록`, `최종 결과 결정`, and `아웃박스(outbox)`. Remove literal translation, vague subjects, generic conclusions, unnecessary “한/하나”, and unsupported implementation certainty.

- [ ] **Step 5: Run the series test**

Expected: the only remaining failure is the missing English article.

- [ ] **Step 6: Commit the Korean article**

Commit after every code/source link resolves and the dermatology scenario is clearly labeled as the approved example rather than the literal current test fixture.

### Task 6: Localize the article into English without claim drift

**Files:**
- Create: `src/content/docs/blog/clinic-appointment-package-execution-plan.mdx`

- [ ] **Step 1: Mirror structure and evidence**

Use the approved English title, the same date/order/tags/hero, matching section order, tables, code, source links, English diagrams, and the English shared-series import.

- [ ] **Step 2: Preserve the implementation boundaries**

Keep these distinctions exact in English:

- approved dermatology scenario versus current test fixture;
- purchase-created Plan versus separate package execution event;
- exact selection count versus component-list inference;
- `MAY_SAME_VISIT` permission versus actual grouping;
- appended revision versus visit candidate or confirmed appointment;
- `DUPLICATE`, `WAITING_GAP`, and quarantine/conflict outcomes.

- [ ] **Step 3: Run the series regression test**

```bash
node --test tests/ecosystem/clinic-appointment-series.test.mjs
```

Expected: all tests pass with 21 bilingual articles and Implementation 9 in the approved order.

- [ ] **Step 4: Commit bilingual parity**

Commit the English article and any final Korean parity correction together, recording the locale comparison in `Tested:`.

### Task 7: Perform factual and editorial review

**Files:**
- Modify as needed: both locale articles, diagram generator, ledgers, and generated assets

- [ ] **Step 1: Recheck the live Clinic source and tests**

Confirm the current `develop` head, then reread the model, planner, event, handler, and matching tests. Search both articles for claims that incorrectly connect `PurchaseCompletedHandler` directly to `PackageExecutionPlanner`, turn grouping permission into a visit, or turn a Plan revision into an appointment.

- [ ] **Step 2: Compare the articles with nearby series posts**

Check title, opening problem, table density, code length, diagram placement, source links, summary, and bottom navigation against Design 4, Design 5, and Implementation 8.

- [ ] **Step 3: Run terminology and placeholder scans**

Search for stale terms, untranslated scaffolding, placeholder text, source-commit narration, `정책 스냅숏`, mismatched “terminal outcome” translations, and generic LLM-like conclusions. Recheck all titles and labels against the series registry.

- [ ] **Step 4: Regenerate and reinspect any changed diagrams**

Any label or geometry change returns the affected locale asset to the complete one-asset audit and original-size PNG inspection loop.

- [ ] **Step 5: Commit review repairs**

Keep the correction commit narrow and record which factual or Korean-language ambiguity was removed.

### Task 8: Build and verify both local routes

**Files:**
- Verify all changed files and generated assets

- [ ] **Step 1: Run static checks**

```bash
git diff --check
node --test tests/ecosystem/clinic-appointment-series.test.mjs
npm run build
```

Expected: zero diff errors, all series tests pass, and Astro build completes without new errors.

- [ ] **Step 2: Start the local preview**

Run the repository preview command on the available local port and verify:

- `/ko/blog/clinic-appointment-package-execution-plan/`
- `/blog/clinic-appointment-package-execution-plan/`
- all nine new `/assets/...` URLs

- [ ] **Step 3: Perform browser QA in both themes**

Check Korean and English pages from the hero through series navigation in dark and light themes. Verify no horizontal overflow, broken links, clipped code/tables, missing assets, or locale drift. Click both body diagrams and confirm the large-view interaction opens and closes correctly.

- [ ] **Step 4: Capture fresh route evidence**

Save route screenshots or browser snapshots for both locales and inspect the rendered hero and diagrams. Treat the browser rendering and full-size PNGs as authoritative over mechanical audits.

- [ ] **Step 5: Run final repository checks and commit**

```bash
git status --short
git diff --check
node --test tests/ecosystem/clinic-appointment-series.test.mjs
npm run build
```

Commit any final verified repair with a Korean Lore-format message. Do not create a PR, merge, deploy, close Issue #343, or clean the worktree without separate user authority.

## Completion criteria

- [ ] The Korean and English articles contain the same technical claims, sequence, tables, code, links, diagrams, and series position.
- [ ] The approved dermatology example naturally explains exact choice count and component-version provenance without being presented as the literal test fixture.
- [ ] `PurchaseCompletedHandler` and `VisitPlanningEventHandler` responsibilities are clearly separated.
- [ ] No sentence or diagram implies that `PackageExecutionPlanner` creates visit candidates or confirmed appointments.
- [ ] The hero is unique within the series and both diagram families pass semantic, geometry, arrowhead-color, endpoint, sequence-style, and full-size visual checks.
- [ ] Sequence call labels never overlap their message lines, all bends are visibly rounded, and the terminal outcome decision is explicit.
- [ ] The Astro build, series test, both locale routes, asset routes, themes, and diagram large-view interaction pass locally.
- [ ] Final report includes changed files, plan status, fresh verification evidence, known gaps, unchecked external actions, and `DONE`/`PENDING`/`BLOCKED` state.
