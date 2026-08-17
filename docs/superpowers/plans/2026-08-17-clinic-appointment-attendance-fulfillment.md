# Clinic Appointment Attendance and Fulfillment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox ( - [ ] ) syntax for tracking.

**Goal:** 승인된 설계에 따라 운영 확장 5 글을 한·영으로 발행하고, STAFF 운영 화면 시안과 상태·이벤트 diagram을 본문에 연결한다.

**Architecture:** 기존 Clinic Appointment 시리즈의 MDX·registry·재현 가능한 SVG/PNG 생성기 패턴을 따른다. 운영 화면은 합성 데이터 기반의 정적 시안으로 만들고, 기술 diagram은 한·영 SVG를 정식 소스로 보관한 뒤 PNG로 렌더링한다. 글은 예약 서비스의 CHECKED_IN·예약 COMPLETED와 외부 TreatmentFulfillmentEvent를 분리해 설명하며, 현재 구현·승인된 설계·운영 시안을 명시적으로 구분한다.

**Tech Stack:** Astro/Starlight, MDX, Node.js ESM asset generator, SVG, CairoSVG, Node test runner, Astro check/build, bluetape-writer, bluetape-diagram.

---

## 파일 구조와 책임

| 파일 | 책임 |
| --- | --- |
| src/data/clinic-appointment-series.mjs | operations-5의 한·영 제목·slug·순서를 등록한다. |
| src/content/docs/ko/blog/clinic-appointment-attendance-fulfillment.mdx | STAFF 중심 한국어 본문, 운영 화면, 상태 비교, diagram, 근거 링크를 제공한다. |
| src/content/docs/blog/clinic-appointment-attendance-fulfillment.mdx | 한국어와 동일한 사실·상태·시각자료를 영어로 현지화한다. |
| scripts/generate-clinic-appointment-attendance-fulfillment-assets.mjs | 합성 운영 화면과 한·영 sequence diagram의 SVG/PNG를 결정적으로 생성한다. |
| docs/diagrams/clinic-appointment-attendance-fulfillment/flow-01-ko.semantic.json | 한국어 diagram 노드·연결선·범례·최종 상태 결정의 의미 원장이다. |
| docs/diagrams/clinic-appointment-attendance-fulfillment/flow-01-en.semantic.json | 영어 diagram의 의미 원장이다. |
| public/assets/clinic-appointment-attendance-fulfillment-hero.png | 기존 글과 중복되지 않는 텍스트 없는 hero다. |
| public/assets/clinic-appointment-attendance-fulfillment-operations-screen-{ko,en}.svg/.png | STAFF 운영 화면 시안의 원본과 본문용 렌더링이다. |
| public/assets/clinic-appointment-attendance-fulfillment-flow-01-{ko,en}.svg/.png | 외부 사실 검증부터 최종 상태 결정까지의 diagram 원본과 렌더링이다. |
| tests/ecosystem/clinic-appointment-series.test.mjs | 시리즈 수·순서·한·영 글과 공통 navigation의 회귀 계약을 갱신한다. |
| tests/ecosystem/blog-diagram-locales.test.mjs | 한·영 diagram asset pair 수와 locale parity를 갱신한다. |

## Task 1: 현재 근거와 기존 visual generator 계약을 다시 고정한다

**Files:**

- Read: /Users/debop/work/bluetape4k/clinic-appointment/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/statemachine/AppointmentState.kt
- Read: /Users/debop/work/bluetape4k/clinic-appointment/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/statemachine/AppointmentEvent.kt
- Read: /Users/debop/work/bluetape4k/clinic-appointment/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/statemachine/AppointmentStateMachine.kt
- Read: /Users/debop/work/bluetape4k/clinic-appointment/appointment-event/src/main/kotlin/io/bluetape4k/clinic/appointment/event/integration/TreatmentFulfillmentEvent.kt
- Read: /Users/debop/work/bluetape4k/clinic-appointment/appointment-event/src/main/kotlin/io/bluetape4k/clinic/appointment/event/integration/TreatmentFulfillmentHandler.kt
- Read: /Users/debop/work/bluetape4k/clinic-appointment/appointment-event/src/main/kotlin/io/bluetape4k/clinic/appointment/event/integration/ExternalFactEventIngress.kt
- Read: /Users/debop/work/bluetape4k/clinic-appointment/appointment-event/src/test/kotlin/io/bluetape4k/clinic/appointment/event/integration/TreatmentFulfillmentHandlerTest.kt
- Read: scripts/generate-clinic-appointment-disruption-recovery-assets.mjs
- Read: scripts/generate-clinic-appointment-profile-reevaluation-visuals.mjs

- [x] Step 1: Confirm the state and fact names before editing content

Run:

    SRC=/Users/debop/work/bluetape4k/clinic-appointment
    rg -n "CHECKED_IN|IN_PROGRESS|COMPLETED|PARTIALLY_FULFILLED|RESOURCE_DISRUPTED|REFUNDED" \
      "$SRC/appointment-core/src/main/kotlin" \
      "$SRC/appointment-event/src/main/kotlin" \
      "$SRC/appointment-event/src/test/kotlin"

Expected: CHECKED_IN → IN_PROGRESS → COMPLETED, the four fulfillment fact types, and tests for immutable revision, replay, quarantine, partial fulfillment, resource disruption, and refund are present.

- [x] Step 2: Confirm the repository is clean before adding the article

Run:

    git status --short --branch
    git diff --check

Expected: the article branch starts from the already synced develop checkout; only the approved design document is present as the intentional local change.

## Task 2: Add source-backed semantic ledgers for the diagram

**Files:**

- Create: docs/diagrams/clinic-appointment-attendance-fulfillment/flow-01-ko.semantic.json
- Create: docs/diagrams/clinic-appointment-attendance-fulfillment/flow-01-en.semantic.json

- [x] Step 1: Define identical topology in both locale ledgers

Each JSON file must contain schemaVersion, locale, title, scope, version, legend, nodes, edges, decision, and outcomes. The nodes must include staff, appointmentApi, clinicalService, ingress, handler, operationsQueue, and finalDecision. Edges must name their source and target node IDs and their tone. The final decision must list exactly COMPLETED, PARTIALLY_FULFILLED, RESOURCE_DISRUPTED, and REFUNDED outcomes.

- [x] Step 2: Encode the geometry invariants the renderer will audit

The ledgers must state that connectors are endpoint-aligned, orthogonal with rounded turns, arrowheads use the same tone as their lines, labels do not overlap call lines, the scope/version cards sit above the main frame, and the diagram has explicit bottom padding and a visible 최종 상태 결정 / Final State Decision node.

- [x] Step 3: Validate the JSON before rendering

Run:

    node -e "for (const file of ['docs/diagrams/clinic-appointment-attendance-fulfillment/flow-01-ko.semantic.json','docs/diagrams/clinic-appointment-attendance-fulfillment/flow-01-en.semantic.json']) JSON.parse(require('fs').readFileSync(file)); console.log('semantic ledgers: OK')"

Expected: semantic ledgers: OK.

## Task 3: Build the deterministic STAFF screen and diagram generator

**Files:**

- Create: scripts/generate-clinic-appointment-attendance-fulfillment-assets.mjs
- Generate: public/assets/clinic-appointment-attendance-fulfillment-operations-screen-ko.svg
- Generate: public/assets/clinic-appointment-attendance-fulfillment-operations-screen-en.svg
- Generate: public/assets/clinic-appointment-attendance-fulfillment-flow-01-ko.svg
- Generate: public/assets/clinic-appointment-attendance-fulfillment-flow-01-en.svg
- Generate: corresponding PNG files under public/assets/

- [x] Step 1: Implement locale copy and common renderer helpers

Follow the existing clinic generator convention: keep all Korean and English labels in a copy object, escape XML text, use a stable dark palette, render the same geometry for both locales, write SVG with a final newline, validate with xmllint, and convert with cairosvg -s 2.

- [x] Step 2: Render the STAFF screen with synthetic values and explicit boundaries

The screen must show cards for 오늘 예약, 내원 확인, 진행 중, 예약 종료, 외부 사실 대기, and 후속 작업 큐; rows must distinguish 시술 완료 확인 대기, 부분 이행 검토, 자원 장애 후속, and 환불 후속 확인. It must visibly state 설계 시안 · 실제 환자 정보 없음 (and the English equivalent), and must not show patient identifiers or claim a production dashboard API.

- [x] Step 3: Render the event diagram with the approved geometry contract

The diagram must show STAFF → Appointment API, Clinical/Treatment Service → TreatmentFulfillmentEvent, ExternalFactEventIngress, TreatmentFulfillmentHandler, STAFF 후속 작업 큐, and an explicit 최종 상태 결정 / Final State Decision node. Use only endpoint-aligned rounded orthogonal connectors; keep labels above or below call lines; use same-color arrows; use a legend for any dashed boundary; provide large top and bottom margins.

- [x] Step 4: Generate and inspect all assets

Run:

    node scripts/generate-clinic-appointment-attendance-fulfillment-assets.mjs
    file public/assets/clinic-appointment-attendance-fulfillment-*.{svg,png}

Expected: all eight locale-specific SVG/PNG files exist, XML validation succeeds, and PNG dimensions are at least twice the SVG viewBox for readable large-view rendering.

## Task 4: Add a unique hero and update the series registry

**Files:**

- Create: public/assets/clinic-appointment-attendance-fulfillment-hero.png
- Modify: src/data/clinic-appointment-series.mjs
- Modify: tests/ecosystem/clinic-appointment-series.test.mjs

- [x] Step 1: Create a non-duplicated, text-free hero

Generate a new abstract operations-board image that visually separates arrival, treatment evidence, and follow-up work. Compare its rendered appearance with the existing operations 1–4 heroes; reject any duplicate or hero containing patient data, readable UI copy, or a misleading medical result.

- [x] Step 2: Append operations-5 after operations-4

Add exactly this registry entry:

    {
      id: 'operations-5',
      group: 'operations',
      slug: 'clinic-appointment-attendance-fulfillment',
      ko: '[운영 확장 5] 내원 확인과 시술 완료는 다른 사실이다',
      en: '[Operations 5] Attendance and Treatment Completion Are Different Facts',
    },

- [x] Step 3: Update the registry regression expectations

Change the expected article count from 23 to 24, the operations group count from 6 to 7, append operations-5 to the expected ID list, and keep the uniqueness assertion. Do not change earlier group order or earlier entry IDs.

## Task 5: Write the Korean article around STAFF actions and C-state comparison

**Files:**

- Create: src/content/docs/ko/blog/clinic-appointment-attendance-fulfillment.mdx

- [x] Step 1: Add frontmatter and shared series import

Use the existing operations article shape with a new date, the new hero path, a clear Korean description, operations/architecture/resilience/appointment-service tags, and this import:

    import ClinicAppointmentSeries from '../../../../components/ClinicAppointmentSeries.astro';

- [x] Step 2: Open with the STAFF operating question

Start with the distinction: CHECKED_IN records arrival, appointment COMPLETED closes the reservation workflow, and a trusted TreatmentFulfillmentEvent records clinical/treatment completion. Put the synthetic STAFF screen immediately after this explanation and label it as a design mockup.

- [x] Step 3: Add the A-centered operations flow

Explain the six screen regions, the next task per queue row, and why one generic 완료 metric is unsafe. Include the composite laser/sedation/package scenario without patient data.

- [x] Step 4: Add the C state comparison and event sequence

Include the approved comparison table for CHECKED_IN, IN_PROGRESS, appointment COMPLETED, TreatmentFulfillmentFactType.COMPLETED, PARTIALLY_FULFILLED, RESOURCE_DISRUPTED, and REFUNDED. Follow it with the localized flow figure using /assets/clinic-appointment-attendance-fulfillment-flow-01-ko.png, a useful alt text, and a caption that names 최종 상태 결정.

- [x] Step 5: Explain partial fulfillment, resource disruption, refund, replay, and quarantine

State that the original completed item and revision remain immutable, remaining work comes from the producer with a new treatment key, refund amount/approval/settlement stay with commerce/payment, BLOCKING follow-ups can be canceled while independent NON_BLOCKING work remains schedulable, and invalid or duplicate events do not corrupt the active revision.

- [x] Step 6: Add evidence links and the series footer

Link the related series posts for appointment state, package execution, and disruption recovery, then link visit-commitment.md, the three state-machine files, TreatmentFulfillmentEvent.kt, TreatmentFulfillmentHandler.kt, ExternalFactEventIngress.kt, the handler test, and the approved design documents. Do not use issue or PR links as article evidence. End with:

    ## 시리즈 링크

    <ClinicAppointmentSeries current="clinic-appointment-attendance-fulfillment" locale="ko" />

Do not add source-commit meta commentary, stale direct visual-companion routes, or the deprecated 확정 방문 약속 wording.

## Task 6: Write the English parity article

**Files:**

- Create: src/content/docs/blog/clinic-appointment-attendance-fulfillment.mdx

- [x] Step 1: Mirror the Korean structure without literal translation

Keep the same frontmatter fields, section order, state names, synthetic numbers, image stems, source links, and implementation/design/operations boundaries. Use reader-friendly English rather than translating Korean sentence order mechanically.

- [x] Step 2: Add the English operations screen and sequence figure

Use the -en screen and -en flow PNG, with the same figure classes (bt4k-operations-screen and bt4k-sequence) and lightbox-compatible image markup as the Korean article.

- [x] Step 3: Add the English series footer and verify parity

End with <ClinicAppointmentSeries current="clinic-appointment-attendance-fulfillment" locale="en" />. Compare the Korean and English article for the same states, outcomes, counts, diagrams, sources, and next actions.

## Task 7: Add article and visual regression contracts

**Files:**

- Modify: tests/ecosystem/clinic-appointment-series.test.mjs
- Modify: tests/ecosystem/blog-diagram-locales.test.mjs

- [x] Step 1: Make the series test assert the new bilingual article

The existing generic loop must discover 24 files and require the new Korean/English title and current footer automatically. Add one targeted assertion that operations-5 is the last operations entry and its slug is clinic-appointment-attendance-fulfillment.

- [x] Step 2: Make diagram locale expectations include the new pair

Update the expected technical diagram stem count by one new stem, and assert both new SVGs contain the localized final decision label and the same number of outcome nodes. Keep the existing pair and lightbox checks unchanged.

- [x] Step 3: Run targeted tests before the full build

Run:

    node --test tests/ecosystem/clinic-appointment-series.test.mjs tests/ecosystem/blog-diagram-locales.test.mjs

Expected: all tests pass, 24 bilingual clinic articles are found, and the new diagram stem has both locale SVG/PNG pairs.

## Task 8: Run writer, diagram, and Astro verification

**Files:**

- Verify all changed files; no additional source mutation unless a failed check identifies a concrete defect.

- [x] Step 1: Run deterministic asset regeneration and diff check

    node scripts/generate-clinic-appointment-attendance-fulfillment-assets.mjs
    git diff --check
    git status --short

Expected: regeneration is idempotent, there is no whitespace error, and only the approved spec/plan/article/registry/generator/asset/test files are changed.

- [x] Step 2: Run the full repository tests

    npm test

Expected: all manual, ecosystem, and visual-companion tests pass.

- [x] Step 3: Run Astro validation and build

    npm run build

Expected: astro check reports 0 errors, the site builds successfully, and the new routes are included.

- [x] Step 4: Validate local routes and assets

With the local preview running, check:

    for route in \
      /ko/blog/clinic-appointment-attendance-fulfillment/ \
      /blog/clinic-appointment-attendance-fulfillment/; do
      curl -fsS -o /dev/null -w "%{http_code} $route\n" "http://127.0.0.1:4328$route"
    done

    for asset in \
      clinic-appointment-attendance-fulfillment-hero.png \
      clinic-appointment-attendance-fulfillment-operations-screen-ko.png \
      clinic-appointment-attendance-fulfillment-operations-screen-en.png \
      clinic-appointment-attendance-fulfillment-flow-01-ko.png \
      clinic-appointment-attendance-fulfillment-flow-01-en.png; do
      curl -fsS -o /dev/null -w "%{http_code} /assets/$asset\n" "http://127.0.0.1:4328/assets/$asset"
    done

Expected: every route and asset returns HTTP 200.

- [x] Step 5: Perform visual large-view inspection

Open both locale article routes in the local preview and inspect the hero, STAFF screen, and flow diagram at normal and large-view sizes. Confirm that the scope/version cards do not cover the diagram, labels do not touch call lines, arrows match line colors, the final decision node is explicit, and the UI bottom warning/footer is not clipped.

## Task 9: Finish the implementation lane with evidence

**Files:**

- Verify: all changed files from Tasks 1–8.

- [x] Step 1: Record implementation evidence in the workflow receipt

Record the approved spec path, plan path, generated asset paths, test output, build output, two article routes, and the visual inspection result. Do not mark deployment, PR merge, or issue closure complete in this plan; those are separate explicitly requested delivery actions.

- [x] Step 2: Re-read the final diff against the design spec

Check every design requirement: STAFF-first opening, A+C visuals, separate completion facts, partial/resource/refund boundaries, bilingual parity, unique hero, lightbox figures, series navigation, natural Korean terms, and no real patient data.

- [x] Step 3: Report the implementation DoD

Report changed files, test/build/route evidence, visual checks, known gaps, and whether the lane is DONE or PENDING. If PR/deployment is not requested in the current turn, leave those actions explicitly pending.
