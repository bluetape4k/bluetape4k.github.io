# Clinic Appointment Disruption Recovery Article Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a bilingual Operations 3 article that explains how STAFF recovers appointments affected by clinic closures or equipment downtime, with a source-backed sequence diagram and an operations-screen mockup.

**Architecture:** Add one shared series entry after Operations 2, then publish Korean-first and English-parity MDX articles. Keep disruption detection, closure rescheduling, candidate confirmation, solver application, customer-consent evidence, and recovery credit as explicit boundaries. Generate the localized technical diagram and STAFF UI deterministically, and use one distinct text-free hero for both locales.

**Tech Stack:** Astro/Starlight MDX, Node.js ESM, SVG, CairoSVG, Node test runner, Playwright browser QA, `bluetape-writer`, `bluetape-diagram`, `image_gen`

---

## File map

- Create `src/content/docs/ko/blog/clinic-appointment-disruption-recovery.mdx`: Korean source article and terminology authority.
- Create `src/content/docs/blog/clinic-appointment-disruption-recovery.mdx`: English localization with matching claims, structure, links, and visuals.
- Modify `src/data/clinic-appointment-series.mjs`: add Operations 3 after Operations 2.
- Modify `tests/ecosystem/clinic-appointment-series.test.mjs`: lock count, group count, order, slug uniqueness, and bilingual article presence.
- Create `scripts/generate-clinic-appointment-disruption-recovery-assets.mjs`: generate the localized recovery sequence and STAFF operations screen as SVG and 2x PNG pairs.
- Create `docs/superpowers/specs/2026-08-16-clinic-appointment-disruption-recovery-sequence.semantic.json`: record sequence nodes, edges, terminal outcomes, source anchors, and repair receipts.
- Create `docs/superpowers/specs/2026-08-16-clinic-appointment-disruption-recovery-screen.semantic.json`: record UI regions, actions, privacy boundary, implementation boundary, and repair receipts.
- Create `public/assets/clinic-appointment-disruption-recovery-hero.png`: shared text-free 16:9 hero.
- Create `public/assets/clinic-appointment-disruption-recovery-sequence-{ko,en}.{svg,png}`: localized recovery sequence.
- Create `public/assets/clinic-appointment-disruption-recovery-operations-screen-{ko,en}.{svg,png}`: localized STAFF screen mockup.

## Source anchors

Recheck every implementation claim against the current `clinic-appointment` `develop` checkout:

- `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/service/ClosureRescheduleService.kt`
- `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/service/EquipmentUnavailabilityService.kt`
- `appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/reschedule/RescheduleController.kt`
- `appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/reschedule/RescheduleBatchStreamController.kt`
- `appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/equipment/EquipmentUnavailabilityController.kt`
- `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/service/SolverService.kt`
- `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/policy/OperationalSchedulingPolicies.kt`
- `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/policy/SchedulingPolicyValidator.kt`
- matching Angular reschedule and equipment-unavailability feature components
- booking-reliability responsibility enum/evaluator and waitlist recovery-credit API

### Task 1: Lock the Operations 3 series position

**Files:**
- Modify: `tests/ecosystem/clinic-appointment-series.test.mjs`
- Modify: `src/data/clinic-appointment-series.mjs`

- [x] **Step 1: Change the regression test first**

Change the total, unique slug, and per-locale article counts from `21` to `22`; change the operations group count from `4` to `5`; append `operations-3` after `operations-2`.

- [x] **Step 2: Run the test and confirm the registry failure**

Run `node --test tests/ecosystem/clinic-appointment-series.test.mjs`.

Expected: FAIL because the registry still contains 21 entries.

- [x] **Step 3: Add the registry entry**

Insert:

```javascript
{
  id: 'operations-3',
  group: 'operations',
  slug: 'clinic-appointment-disruption-recovery',
  ko: '[운영 확장 3] 병원 사정으로 바뀐 예약을 복구하는 법',
  en: '[Operations 3] Recovering Appointments Changed by Clinic Disruptions',
},
```

- [x] **Step 4: Re-run and confirm only missing-article assertions remain red**

Expected: registry count and order pass; locale reads fail with `ENOENT`.

### Task 2: Define and generate the recovery sequence

**Files:**
- Create: `docs/superpowers/specs/2026-08-16-clinic-appointment-disruption-recovery-sequence.semantic.json`
- Create: `scripts/generate-clinic-appointment-disruption-recovery-assets.mjs`
- Create: `public/assets/clinic-appointment-disruption-recovery-sequence-ko.svg`
- Create: `public/assets/clinic-appointment-disruption-recovery-sequence-ko.png`
- Create: `public/assets/clinic-appointment-disruption-recovery-sequence-en.svg`
- Create: `public/assets/clinic-appointment-disruption-recovery-sequence-en.png`

- [x] **Step 1: Write the semantic ledger before drawing**

Record participants `STAFF`, `UI/API`, `ClosureRescheduleService`, booking/candidate store, and outbox. Record the ordered flow: active-booking/version preflight; candidate calculation outside the transaction; state/version recheck; `PENDING_RESCHEDULE` plus history/status event/candidates; STAFF selection or auto selection; replacement `CONFIRMED`, original `RESCHEDULED`, selected candidate, and outbox in one transaction. Record the explicit Korean outcome heading `최종 상태 결정` and terminal outcomes for no candidate, stale state/version, confirmation completed, and per-item stream failure.

- [x] **Step 2: Pass the semantic audit**

Run:

```bash
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-semantic-audit.py --repo-root . --json docs/superpowers/specs/2026-08-16-clinic-appointment-disruption-recovery-sequence.semantic.json
```

Expected: unique nodes, closed edge endpoints, explicit terminal outcomes, and complexity within budget.

- [x] **Step 3: Implement sequence geometry**

Use a 1440px-wide dark canvas, title followed by an inline scope/version badge row, participant headers, lifelines, activation bars, transparent phase frames, 140px or greater message rows, and a generous bottom outcome area. Put every numbered label pill above its continuous call line with 8px or greater clearance. Use rounded orthogonal connectors; marker, line, pill border, and number badge share the same color. Do not use an unexplained horizontal dashed line.

- [x] **Step 4: Generate and audit each locale separately**

For each SVG/PNG pair run `xmllint`, text normalization, asset-pair, connector, arrowhead, geometry with `--fail-diagonal`, endpoint, mixed-corner, sequence-style, and opaque visual audits from `bluetape-diagram`.

Expected: zero audit failures and no label/call-line overlap at original size.

### Task 3: Define and generate the STAFF operations screen

**Files:**
- Create: `docs/superpowers/specs/2026-08-16-clinic-appointment-disruption-recovery-screen.semantic.json`
- Modify: `scripts/generate-clinic-appointment-disruption-recovery-assets.mjs`
- Create: `public/assets/clinic-appointment-disruption-recovery-operations-screen-ko.svg`
- Create: `public/assets/clinic-appointment-disruption-recovery-operations-screen-ko.png`
- Create: `public/assets/clinic-appointment-disruption-recovery-operations-screen-en.svg`
- Create: `public/assets/clinic-appointment-disruption-recovery-operations-screen-en.png`

- [x] **Step 1: Record UI semantics**

The ledger must include incident cause and affected range, `searchDays`, counts `영향 8 / 후보 있음 6 / 후보 없음 2`, an action queue, selected anonymous appointment reference, three candidate cards, candidate confirmation and automatic rescheduling actions, and a separate no-candidate task. It must state that the mockup contains illustrative values, no patient identifiers, and is not a production screenshot.

- [x] **Step 2: Implement the localized mockup**

Use the existing dark STAFF UI language: top bar, four summary cards, queue table, selected-item detail, candidate cards, and guarded buttons. Surface `expectedVersion`, search window, candidate priority, and the current implementation warning that confirmation immediately creates `CONFIRMED`; do not present patient-consent evidence or automatic compensation as implemented behavior.

- [x] **Step 3: Render and inspect at original size**

Generate 2x PNGs, run opaque visual and asset-pair audits, and inspect both locales. Reject clipped text, unreadable labels, patient-identifying data, missing action hierarchy, or insufficient bottom padding.

### Task 4: Generate a distinct shared hero

**Files:**
- Create: `public/assets/clinic-appointment-disruption-recovery-hero.png`

- [x] **Step 1: Compare nearby series heroes**

Inspect Operations 1.2, Operations 2, and Implementation 9 heroes at full size so the new composition does not repeat the queue dashboard or product graph.

- [x] **Step 2: Generate a text-free 16:9 hero with `image_gen`**

Show a bright 3D miniature clinic recovery scene: a white-and-blue STAFF robot beside a temporarily unavailable laser device, a small set of affected appointment cards, and a separate replacement timetable where another robot is moving one card. Include no readable text, letters, numbers, logos, watermarks, dashboard tables, or infographic connector lines.

- [x] **Step 3: Inspect full size and compare silhouettes**

Expected: the equipment incident and recovery action read immediately, the hero is distinct from recent series images, and the focal subjects survive blog-card cropping.

### Task 5: Write the Korean source article

**Files:**
- Create: `src/content/docs/ko/blog/clinic-appointment-disruption-recovery.mdx`

- [ ] **Step 1: Match the established article shell**

Use the approved title, shared hero, 2026-08-16 date, Operations tags, `ClinicAppointmentSeries`, absolute `/assets/...` URLs, and `current="clinic-appointment-disruption-recovery" locale="ko"`.

- [ ] **Step 2: Draft the source-backed narrative**

Write in this order: laser-device outage scenario; detection versus recovery; candidate calculation and write-time recheck; synchronous batch versus streaming commit boundary; STAFF candidate selection and automatic selection; confirmation transaction; equipment-conflict-only and solver-apply side paths; current implementation/policy model/operations readiness/follow-up matrix; customer-consent and recovery-credit boundaries; next Operations 4 article.

- [ ] **Step 3: Embed all three visuals with large-view markup**

Place the hero only in the hero block. Embed the Korean STAFF screen with `bt4k-screenshot`, the sequence with `bt4k-sequence`, descriptive alt text, and captions that explain the boundary. Ensure both body visuals activate the existing click-to-enlarge behavior.

- [ ] **Step 4: Apply Korean terminology and natural-language review**

Use `빈시간`, `확정 방문 약속`, `스냅숏`, `아웃박스(outbox)`, `최종 상태 결정`, and `다음 작업`. Avoid `빈자리`, `다음 행동`, literal translation, vague subjects, redundant `한/하나`, and any sentence saying the article was written from source code.

### Task 6: Localize the English article without claim drift

**Files:**
- Create: `src/content/docs/blog/clinic-appointment-disruption-recovery.mdx`

- [ ] **Step 1: Mirror structure and evidence**

Use matching frontmatter, section order, tables, code/endpoint examples, source links, English assets, and shared-series footer.

- [ ] **Step 2: Preserve implementation boundaries**

Keep these distinctions exact: conflict detection does not reschedule; sync batch is one transaction while streaming commits per appointment; candidate calculation occurs outside the transaction and is revalidated before writes; current confirmation directly creates `CONFIRMED`; `preserveConfirmedAppointment` exists in policy validation but is not consumed by the current confirmation path; recovery credit is a separate waitlist API.

- [ ] **Step 3: Run the series test**

Expected: all Clinic Appointment series assertions pass with 22 bilingual entries.

### Task 7: Validate visuals, routes, and publication readiness

**Files:**
- Modify only files found defective by the checks above.

- [ ] **Step 1: Run content and asset checks**

Run `git diff --check`, the Clinic Appointment series test, relevant navigation tests, and all diagram audits for both locales.

- [ ] **Step 2: Build the site**

Run `/Users/debop/work/bluetape4k/bluetape4k.github.io/node_modules/.bin/astro build` from the isolated worktree.

Expected: exit 0 with both `/ko/blog/clinic-appointment-disruption-recovery/` and `/blog/clinic-appointment-disruption-recovery/` generated.

- [ ] **Step 3: Start a local preview and inspect both routes**

Open both routes in a browser, verify the hero appears once, the body UI and sequence are visible, all assets return HTTP 200, series navigation highlights Operations 3, and both body visuals open in the large-view overlay.

- [ ] **Step 4: Run final source and prose review**

Recheck the source anchors, Korean terminology, English parity, unique hero composition, and the current/future boundary matrix. Record any unavoidable gap instead of implying unverified behavior.

- [ ] **Step 5: Mark workflow checks with fresh evidence**

Pass `bilingual_article`, `visual_audit`, `site_build`, `route_preview`, and `final_review` only after their corresponding commands and browser evidence succeed.
