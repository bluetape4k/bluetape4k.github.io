# N-Visit Purchase to Visit Plan Article Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a bilingual, source-backed Implementation 8 article that explains how an N-visit purchase becomes a visit plan without claiming that unimplemented interval enforcement already works.

**Architecture:** Add the article as the eighth entry in the shared Clinic Appointment implementation series. Keep the Korean patient journey and English localization structurally identical, generate two locale-specific technical diagrams from one script, and use one text-free hero shared by both locales. Every behavioral claim maps to current Clinic Appointment source or tests; the repeated-session interval materialization gap is stated explicitly.

**Tech Stack:** Astro/Starlight MDX, Node.js SVG generation, CairoSVG PNG rendering, Node test runner, Playwright browser QA, `bluetape-writer`, `bluetape-diagram`, `image_gen`

---

## File map

- Create `src/content/docs/ko/blog/clinic-appointment-n-visit-purchase-plan.mdx`: Korean source article.
- Create `src/content/docs/blog/clinic-appointment-n-visit-purchase-plan.mdx`: English localization with claim and asset parity.
- Modify `src/data/clinic-appointment-series.mjs`: insert Implementation 8 after Implementation 7.
- Modify `tests/ecosystem/clinic-appointment-series.test.mjs`: lock the new count, grouping, order, slug, and bilingual article presence.
- Create `scripts/generate-clinic-appointment-n-visit-plan-assets.mjs`: generate both diagram families for Korean and English, then render 2x PNGs.
- Create `public/assets/clinic-appointment-n-visit-plan-hero.png`: text-free shared hero.
- Create `public/assets/clinic-appointment-n-visit-plan-01-{ko,en}.{svg,png}`: wrong future reservations versus current visit-plan model, including no-gap and N-to-M-day variants.
- Create `public/assets/clinic-appointment-n-visit-plan-02-{ko,en}.{svg,png}`: purchase, plan expansion, completion, refund, and interval-enforcement boundary.
- Create `docs/superpowers/specs/2026-08-16-clinic-appointment-n-visit-plan-01.semantic.json`: semantic ledger for diagram 1.
- Create `docs/superpowers/specs/2026-08-16-clinic-appointment-n-visit-plan-02.semantic.json`: semantic ledger for diagram 2.

### Task 1: Lock the series order before adding the article

**Files:**
- Modify: `tests/ecosystem/clinic-appointment-series.test.mjs`
- Modify: `src/data/clinic-appointment-series.mjs`

- [ ] **Step 1: Change the series regression test first**

Update the expected total from 19 to 20, implementation group count from 7 to 8, unique slug count from 19 to 20, and insert `implementation-8` after `implementation-7` in the expected ID list. Keep both locale article-count assertions at 20 so the test remains red until the articles exist.

- [ ] **Step 2: Run the series test and confirm the expected failure**

Run:

```bash
node --test tests/ecosystem/clinic-appointment-series.test.mjs
```

Expected: FAIL because the data still contains 19 entries and the bilingual article files do not exist.

- [ ] **Step 3: Add the Implementation 8 series entry**

Insert this object immediately after `implementation-7`:

```javascript
{
  id: 'implementation-8',
  group: 'implementation',
  slug: 'clinic-appointment-n-visit-purchase-plan',
  ko: '[구현 8] N회 상품 구매를 방문 계획으로 펼치는 방법',
  en: '[Implementation 8] Expanding an N-Visit Purchase into a Visit Plan',
},
```

- [ ] **Step 4: Run the test and confirm only article-file assertions remain red**

Run the same Node test. Expected: series count/order assertions pass; article reads fail with `ENOENT` for the new locale files.

- [ ] **Step 5: Commit the series contract**

Commit only the test and series data with a Lore-format message that records why the new article belongs between Implementation 7 and Operations 1.1.

### Task 2: Generate the two technical diagram families

**Files:**
- Create: `scripts/generate-clinic-appointment-n-visit-plan-assets.mjs`
- Create: `docs/superpowers/specs/2026-08-16-clinic-appointment-n-visit-plan-01.semantic.json`
- Create: `docs/superpowers/specs/2026-08-16-clinic-appointment-n-visit-plan-02.semantic.json`
- Create: `public/assets/clinic-appointment-n-visit-plan-01-ko.svg`
- Create: `public/assets/clinic-appointment-n-visit-plan-01-ko.png`
- Create: `public/assets/clinic-appointment-n-visit-plan-01-en.svg`
- Create: `public/assets/clinic-appointment-n-visit-plan-01-en.png`
- Create: `public/assets/clinic-appointment-n-visit-plan-02-ko.svg`
- Create: `public/assets/clinic-appointment-n-visit-plan-02-ko.png`
- Create: `public/assets/clinic-appointment-n-visit-plan-02-en.svg`
- Create: `public/assets/clinic-appointment-n-visit-plan-02-en.png`

- [ ] **Step 1: Define diagram 1 semantics before drawing**

The ledger must declare these invariants:

- purchase is one source node;
- the wrong branch creates three future calendar reservations and is marked as rejected;
- the current branch creates three visit-plan occurrences without reservation time;
- no-gap means no clinical delay, not automatic same-visit grouping;
- N-to-M days is measured from actual predecessor completion;
- every arrow has one source, one destination, one meaning, and matching stroke/arrowhead color.

- [ ] **Step 2: Define diagram 2 semantics before drawing**

The ledger must declare these invariants:

- `PurchaseCompletedHandler` calls `AppointmentPlanFactory`;
- `repeatCount = 3` expands to `sequenceNo = 1..3` with null scheduling windows;
- visit completion creates a new immutable revision and preserves prior history;
- refund cancellation starts from an authoritative external fact;
- direct and `BLOCKING` successors are cancelled while independent obligations remain;
- item interval values are preserved, but repeated-session adjacency is not automatically materialized by the current factory;
- the implementation-gap note must not look like a successful runtime edge.

- [ ] **Step 3: Implement a deterministic SVG generator**

Use a 1440×960 viewBox, the established dark navy canvas, blue/green/orange/red semantic colors, rounded cards, explicit Korean/English labels, and orthogonal connectors. Route connectors before placing labels. Put labels in dedicated gaps and use matching arrowhead markers per stroke color. Diagram 1 uses two comparison panels; diagram 2 uses a top-to-bottom lifecycle with completion and refund branches separated vertically.

- [ ] **Step 4: Generate SVG and 2x PNG assets**

Run:

```bash
node scripts/generate-clinic-appointment-n-visit-plan-assets.mjs
```

Expected: eight assets created, with four SVGs at 1440×960 and four PNGs at 2880×1920.

- [ ] **Step 5: Normalize and audit each diagram separately**

Run the applicable `bluetape-diagram` tools against one SVG/ledger pair at a time:

```bash
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py public/assets/clinic-appointment-n-visit-plan-01-ko.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-semantic-audit.py docs/superpowers/specs/2026-08-16-clinic-appointment-n-visit-plan-01.semantic.json --repo-root .
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-arrowhead-audit.py public/assets/clinic-appointment-n-visit-plan-01-ko.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py public/assets/clinic-appointment-n-visit-plan-01-ko.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py public/assets/clinic-appointment-n-visit-plan-01-ko.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py public/assets/clinic-appointment-n-visit-plan-01-ko.svg
```

Repeat for `01-en`, `02-ko`, and `02-en`. Expected: zero semantic, connector, endpoint, arrowhead-color, mixed-corner, and label-overlap failures.

- [ ] **Step 6: Inspect each PNG at original size**

Use `view_image` for all four PNGs. Reject clipped text, thin labels, ambiguous branches, excessive bottom whitespace, and vertical compression before continuing.

- [ ] **Step 7: Commit the verified diagram sources and outputs**

Commit the generator, ledgers, SVGs, and PNGs together. Record the exact audit commands in the Lore `Tested:` trailer.

### Task 3: Create a distinct series hero

**Files:**
- Create: `public/assets/clinic-appointment-n-visit-plan-hero.png`

- [ ] **Step 1: Generate one text-free hero**

Use `image_gen` with this intent: a cinematic dark 3D miniature clinic operations desk; one small robot receives a single purchase token and deliberately places three unassigned visit-right cards into a plan tray while an untouched calendar remains in the background; no words, letters, numbers, logos, UI text, watermarks, or infographic connectors; blue and teal practical lighting with one warm accent; distinct composition from the existing N-visit rights, scheduling policy, waitlist, and Implementation 7 heroes; 16:9 editorial hero.

- [ ] **Step 2: Compare against nearby heroes**

Build a contact sheet or inspect the new hero beside:

```text
public/assets/clinic-appointment-n-visit-hero.png
public/assets/clinic-appointment-scheduling-policy-hero.png
public/assets/clinic-appointment-part7-hero.png
```

Expected: the subject, camera angle, major silhouette, and first-viewport composition are visibly distinct while retaining the series' robot diorama language.

- [ ] **Step 3: Commit the hero**

Commit only the approved hero asset with generation and visual-comparison evidence in the commit body.

### Task 4: Write the Korean source article from verified behavior

**Files:**
- Create: `src/content/docs/ko/blog/clinic-appointment-n-visit-purchase-plan.mdx`

- [ ] **Step 1: Create frontmatter and series shell**

Use the approved Korean title, date `2026-08-16T12:00:00+09:00`, sidebar order `-202608161200`, the new hero, standard Clinic Appointment tags, the shared `ClinicAppointmentSeries` import, and `current="clinic-appointment-n-visit-purchase-plan" locale="ko"`.

- [ ] **Step 2: Write the patient-led narrative**

Use these headings in this order:

```markdown
## 3회 상품을 샀다고 예약 세 건이 생기는 것은 아니다
## 구매 완료 이벤트가 방문 계획을 만드는 경계
## repeatCount는 회차별 PlannedTreatment로 펼쳐진다
## 회차 간격은 미래 예약 시간이 아니라 다음 예약 가능 구간이다
## 방문 완료는 잔여 횟수 숫자만 줄이는 일이 아니다
## 환불은 완료 이력을 지우지 않는다
## 같은 구매 이벤트가 다시 와도 계획은 하나다
## 현재 구현과 아직 연결되지 않은 경계
## 정리
## 근거 자료
## 시리즈 링크
```

The opening compares future reservation rows with visit-plan obligations. Code snippets must show only the minimal `repeatCount` expansion and null scheduling windows. The interval section must state that fields are copied and validated but adjacency enforcement is not automatically materialized in the current factory. The completion/refund section must describe immutable revisions and external authority without claiming that reservation owns clinical or refund decisions.

- [ ] **Step 3: Embed both Korean diagrams**

Place diagram 1 after the wrong-versus-current comparison and diagram 2 before completion/refund details. Use `bt4k-architecture`, absolute `/assets/...` paths, descriptive alt text, meaningful captions, and markup compatible with the existing click-to-enlarge behavior.

- [ ] **Step 4: Run Korean naturalness and terminology checks**

Apply the writer checklist. Preserve `빈시간`, `대기 목록`, `최종 상태 결정`, `스냅숏`, `방문 약속`, and `예약 서비스`. Remove translation-like subjects, vague demonstratives, unsupported certainty, and repeated “하나/한” where meaning remains clear.

- [ ] **Step 5: Run the series test**

Expected: the only remaining failure is the missing English article.

- [ ] **Step 6: Commit the Korean article**

Commit the Korean source article and its direct navigation change only after source links resolve.

### Task 5: Localize the article into English without claim drift

**Files:**
- Create: `src/content/docs/blog/clinic-appointment-n-visit-purchase-plan.mdx`

- [ ] **Step 1: Mirror the Korean structure**

Use title `[Implementation 8] Expanding an N-Visit Purchase into a Visit Plan`, the same date/order/tags/hero, matching section order, the English diagram assets, and the English series component path.

- [ ] **Step 2: Preserve the implementation boundary**

Translate claims, not Korean sentence structure. Keep these distinctions exact: purchase right versus confirmed visit; copied interval metadata versus enforced dependency; actual predecessor completion versus purchase time; immutable revision versus counter decrement; authoritative refund fact versus reservation-owned refund decision.

- [ ] **Step 3: Run the series regression test**

Run:

```bash
node --test tests/ecosystem/clinic-appointment-series.test.mjs
```

Expected: all tests pass with 20 bilingual articles and Implementation 8 in the approved order.

- [ ] **Step 4: Commit bilingual parity**

Commit the English article and any final Korean parity correction together. Record the locale comparison in `Tested:`.

### Task 6: Recheck live Clinic source before final claims

**Files:**
- Review only: sibling `clinic-appointment` source and tests
- Modify only if drift is found: the two article files and diagram labels

- [ ] **Step 1: Record the latest Clinic `develop` SHA and status**

Run:

```bash
git -C /Users/debop/work/bluetape4k/clinic-appointment rev-parse HEAD
git -C /Users/debop/work/bluetape4k/clinic-appointment status --short --branch
```

Preserve the existing untracked `.superpowers/` directory and do not modify Clinic source.

- [ ] **Step 2: Reopen every cited implementation path**

Recheck `PurchaseCompletedHandler`, `AppointmentPlanFactory`, `ProductCatalogDefinition`, `CatalogDefinitionValidator`, `AppointmentProposalService`, `TreatmentFulfillmentHandler`, and their targeted tests. Remove or qualify any article claim that no longer matches current source.

- [ ] **Step 3: Run targeted Clinic tests**

Run the factory, validator, proposal, fulfillment, and purchase-handler test classes. Expected: BUILD SUCCESSFUL. Treat a failing test as a content blocker, not an invitation to patch Clinic source in this docs plan.

### Task 7: Build, preview, and visually validate both routes

**Files:**
- Validate all files changed in Tasks 1–6

- [ ] **Step 1: Run static validation**

Run:

```bash
git diff --check
node --test tests/ecosystem/clinic-appointment-series.test.mjs
npm test
npm run build
```

Expected: zero errors. Existing unrelated hints may be reported but must not be presented as new failures.

- [ ] **Step 2: Start the local preview**

Run `npm run preview -- --host 127.0.0.1` in a persistent session and record the selected port.

- [ ] **Step 3: Verify both article routes and assets**

Open:

```text
/ko/blog/clinic-appointment-n-visit-purchase-plan/
/blog/clinic-appointment-n-visit-purchase-plan/
```

Check the hero, both diagrams, source links, series order, responsive layout, and image responses. Confirm all six new `/assets/...` URLs return HTTP 200.

- [ ] **Step 4: Verify click-to-enlarge in both locales**

Click each body diagram, confirm the enlarged image opens at readable size, then close it and repeat for the other diagram. Test once in light mode and once in dark mode.

- [ ] **Step 5: Perform a final Korean read-through**

Read the rendered Korean article from start to finish. Rewrite any sentence whose subject, cause, ownership, or time reference is ambiguous. Search for prohibited source-commit meta prose and for claims that turn the interval implementation gap into completed behavior.

- [ ] **Step 6: Inspect final scope and commit verification corrections**

Confirm the branch contains only the design, plan, series entry/test, two articles, one generator, two ledgers, one hero, and eight diagram assets. Commit any final corrections with exact validation evidence.

## Final completion evidence

- Implementation plan tasks checked off with commit SHAs.
- Clinic source SHA recorded and current claims revalidated.
- Diagram audits pass for all four SVGs; all PNGs inspected at original size.
- Series test, full test suite, `git diff --check`, and production build pass.
- Korean and English article routes render locally with working image enlargement.
- No article sentence presents an intended or missing interval constraint as implemented behavior.
