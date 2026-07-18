# Clinic Appointment Blog Series Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `clinic-appointment`의 요구사항, 설계, 구현, 리뷰, 추가 요구사항의 순환을 병원 예약 SaaS·상태 관리·Timefold 최적화라는 7편의 한·영 블로그 시리즈로 발행 가능한 형태까지 만든다.

**Architecture:** `clinic-appointment`의 README와 `docs/requirements`, 승인된 spec/plan, 현재 Kotlin source/test, lessons를 사실 근거로 사용한다. 각 편은 한국어 글을 먼저 완성하고 검토한 뒤 같은 slug의 영문 글을 현지화하며, README 유래 diagram은 원본을 직접 삽입하지 않고 blog-owned dark SVG/PNG로 다시 제작한다.

**Tech Stack:** Astro 6, Starlight, MDX, SVG, CairoSVG, `bluetape-writer`, `bluetape-diagram`, image generation, Kotlin/Spring Boot/Timefold source references

---

## File Structure

### Articles

- Create: `src/content/docs/ko/blog/clinic-appointment-part1-not-just-crud.mdx`
- Create: `src/content/docs/blog/clinic-appointment-part1-not-just-crud.mdx`
- Create: `src/content/docs/ko/blog/clinic-appointment-part2-state-machine-and-history.mdx`
- Create: `src/content/docs/blog/clinic-appointment-part2-state-machine-and-history.mdx`
- Create: `src/content/docs/ko/blog/clinic-appointment-part3-clinic-specific-availability.mdx`
- Create: `src/content/docs/blog/clinic-appointment-part3-clinic-specific-availability.mdx`
- Create: `src/content/docs/ko/blog/clinic-appointment-part4-greedy-vs-global-optimization.mdx`
- Create: `src/content/docs/blog/clinic-appointment-part4-greedy-vs-global-optimization.mdx`
- Create: `src/content/docs/ko/blog/clinic-appointment-part5-timefold-constraints.mdx`
- Create: `src/content/docs/blog/clinic-appointment-part5-timefold-constraints.mdx`
- Create: `src/content/docs/ko/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx`
- Create: `src/content/docs/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx`
- Create: `src/content/docs/ko/blog/clinic-appointment-part7-review-and-operational-evolution.mdx`
- Create: `src/content/docs/blog/clinic-appointment-part7-review-and-operational-evolution.mdx`

각 MDX는 frontmatter, hero figure, `bt4k-post-meta`, 본문 figure, source link, 앞·뒤 시리즈 navigation만 책임진다. Blog index는 `BlogPostList`가 content collection을 자동 탐색하므로 별도 수동 목록을 추가하지 않는다.

### Hero Assets

- Create: `public/assets/clinic-appointment-part1-hero.png`
- Create: `public/assets/clinic-appointment-part2-hero.png`
- Create: `public/assets/clinic-appointment-part3-hero.png`
- Create: `public/assets/clinic-appointment-part4-hero.png`
- Create: `public/assets/clinic-appointment-part5-hero.png`
- Create: `public/assets/clinic-appointment-part6-hero.png`
- Create: `public/assets/clinic-appointment-part7-hero.png`

Hero는 polished 3D miniature workbench 계열의 raster illustration이며 diagram을 대신하지 않는다. 7개 hero는 병원 작업대, 작은 로봇 작업자, navy/teal/purple 조명, 같은 camera angle을 공유하고 Part별 핵심 object만 바꾼다.

### Dark Diagram Assets

- Create: `public/assets/clinic-appointment-part1-saas-domain-map-01.svg`
- Create: `public/assets/clinic-appointment-part1-saas-domain-map-01.png`
- Create: `public/assets/clinic-appointment-part2-state-history-01.svg`
- Create: `public/assets/clinic-appointment-part2-state-history-01.png`
- Create: `public/assets/clinic-appointment-part3-availability-pipeline-01.svg`
- Create: `public/assets/clinic-appointment-part3-availability-pipeline-01.png`
- Create: `public/assets/clinic-appointment-part4-scheduling-choice-map-01.svg`
- Create: `public/assets/clinic-appointment-part4-scheduling-choice-map-01.png`
- Create: `public/assets/clinic-appointment-part5-timefold-model-01.svg`
- Create: `public/assets/clinic-appointment-part5-timefold-model-01.png`
- Create: `public/assets/clinic-appointment-part5-benchmark-scale-02.svg`
- Create: `public/assets/clinic-appointment-part5-benchmark-scale-02.png`
- Create: `public/assets/clinic-appointment-part6-rescheduling-flow-01.svg`
- Create: `public/assets/clinic-appointment-part6-rescheduling-flow-01.png`
- Create: `public/assets/clinic-appointment-part7-development-loop-01.svg`
- Create: `public/assets/clinic-appointment-part7-development-loop-01.png`

SVG는 editable source이자 published fallback이고 PNG는 렌더링 검토의 authoritative output이다. 기존 `clinic-appointment/docs/**` asset을 복사하지 않으며 현재 source에서 의미를 다시 확인한 뒤 dark composition으로 그린다.

## 공통 Asset 검증 명령

각 diagram은 아래 명령을 **한 asset씩** 실행한 뒤 full-size PNG를 열어 text clipping, connector crossing, arrowhead, contrast를 검사한다.

```bash
asset=public/assets/clinic-appointment-part1-saas-domain-map-01
xmllint --noout "${asset}.svg"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py --check "${asset}.svg"
cairosvg "${asset}.svg" -o "${asset}.png" -s 2
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py "${asset}.svg"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal "${asset}.svg"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py "${asset}.svg"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py "${asset}.svg"
```

Expected: 모든 command exit code 0, audit `PASS` 또는 해당 diagram kind에서 connector가 없어 명시적으로 설명 가능한 `N/A`, PNG는 SVG viewBox의 2배 pixel dimensions.

## Task 1: Part 1 한국어 — 병원 예약은 CRUD로 끝나지 않는다

**Files:**
- Create: `public/assets/clinic-appointment-part1-hero.png`
- Create: `public/assets/clinic-appointment-part1-saas-domain-map-01.svg`
- Create: `public/assets/clinic-appointment-part1-saas-domain-map-01.png`
- Create: `src/content/docs/ko/blog/clinic-appointment-part1-not-just-crud.mdx`

- [x] **Step 1: Part 1 사실을 현재 source에서 고정한다**

Run:

```bash
cd /Users/debop/work/bluetape4k/clinic-appointment
rg -n "Key Features|Architecture|Module Overview|Representative Requirement Flow" README.md README.ko.md
rg -n "TenantGroup|Clinic|Doctor|Equipment|TreatmentType|Appointment" docs/requirements/{architecture,domain-model,erd,data-flow}.md
rg -n "object (TenantGroups|Clinics|Doctors|Equipments|TreatmentTypes|Appointments)" appointment-core/src/main/kotlin
```

Expected: SaaS 계층과 대표 entity가 README 설명뿐 아니라 현재 Exposed table/source에도 존재한다.

- [x] **Step 2: Part 1 hero를 생성하고 시리즈 visual language를 고정한다**

Prompt contract: miniature hospital scheduling workbench, tenant group board feeding several clinic boards, doctors/equipment/time slots as physical tokens, small robotic engineers assembling the model, polished dark navy scene, teal and purple accents, isometric camera, no text, no logo, 16:9.

Expected: `public/assets/clinic-appointment-part1-hero.png`가 article card와 본문 hero에서 자르지 않아도 핵심 object를 보여준다.

- [x] **Step 3: SaaS domain map dark diagram을 만든다**

Diagram content: `TenantGroup → Clinic → Operating Hours / Breaks / Closures / Holidays`, `Clinic → Doctors / Doctor Schedules / Absences`, `Clinic → Treatment Types / Equipment / Unavailability`, 모두 `Appointment`의 유효성에 합류한다. `appointment-core`, `appointment-api`, `appointment-solver`, `appointment-event`, `appointment-notification`은 하단 implementation lane에 배치한다.

Expected: README architecture/module diagram의 사실을 보존하지만 deep navy canvas와 blog typography를 사용하는 별도 SVG/PNG다.

- [x] **Step 4: Part 1 한국어 MDX를 작성한다**

Section order:

```text
도입: 예약 한 건이 단순 row insert가 아닌 이유
요구사항: 환자·직원·병원이 보는 같은 예약의 다른 의미
도메인 지도: TenantGroup에서 Appointment까지
설계와 계획: 모듈 경계를 왜 나눴는가
구현: core/api/solver/event/notification의 책임
리뷰: 문서와 현재 구현이 어긋날 수 있는 지점
다음 요구사항: 상태 전이를 별도 모델로 다뤄야 하는 이유
```

Use: `/assets/clinic-appointment-part1-hero.png`, `/assets/clinic-appointment-part1-saas-domain-map-01.png`, GitHub source links pinned to the `main` branch paths that exist at writing time.

- [x] **Step 5: Part 1 route와 build를 검증한다**

Run:

```bash
git diff --check
npm run build
test -f dist/ko/blog/clinic-appointment-part1-not-just-crud/index.html
```

Expected: exit code 0 and generated Korean route exists.

- [x] **Step 6: Part 1 한국어 checkpoint를 커밋한다**

Commit intent: `Explain why clinic appointments outgrow CRUD`

## Task 2: Part 1 영문 현지화

**Files:**
- Create: `src/content/docs/blog/clinic-appointment-part1-not-just-crud.mdx`

- [x] **Step 1: 한국어 주장과 asset contract를 영문에 대응시킨다**

Keep the same title direction, date, part number, source links, hero, domain-map asset, section order, and next-part preview. Translate the argument, not each sentence; retain Kotlin identifiers and domain names unchanged.

- [x] **Step 2: 한·영 parity와 route를 검증한다**

Run:

```bash
rg -n "clinic-appointment-part1-(hero|saas-domain-map-01)" src/content/docs/{blog,ko/blog}/clinic-appointment-part1-not-just-crud.mdx
npm run build
test -f dist/blog/clinic-appointment-part1-not-just-crud/index.html
test -f dist/ko/blog/clinic-appointment-part1-not-just-crud/index.html
```

Expected: 두 글이 동일 asset과 유효한 route를 가진다.

- [ ] **Step 3: Part 1 bilingual checkpoint를 커밋한다**

Commit intent: `Give the clinic series a bilingual entry point`

## Task 3: Part 2 — 예약 상태는 enum이 아니다

**Files:**
- Create: `public/assets/clinic-appointment-part2-hero.png`
- Create: `public/assets/clinic-appointment-part2-state-history-01.svg`
- Create: `public/assets/clinic-appointment-part2-state-history-01.png`
- Create: `src/content/docs/ko/blog/clinic-appointment-part2-state-machine-and-history.mdx`
- Create: `src/content/docs/blog/clinic-appointment-part2-state-machine-and-history.mdx`

- [ ] **Step 1: 상태 전이와 history source를 고정한다**

Run:

```bash
cd /Users/debop/work/bluetape4k/clinic-appointment
rg -n "enum class AppointmentStatus|canTransitionTo|transition|AppointmentStatusHist" appointment-core appointment-api
rg -n "cancelReason|reschedule|CONFIRMED|CHECKED_IN|IN_PROGRESS|COMPLETED" appointment-core/src/test appointment-api/src/test docs/lessons
```

Expected: 허용 전이, cancel reason, history write, pinned status가 source/test에서 확인된다.

- [ ] **Step 2: 상태 보드 hero와 state-history dark diagram을 한 asset씩 만든다**

Diagram content: 정상 lifecycle, cancellation/rescheduling branches, command validation, transactional history write, pinned boundary. 상태 node 색과 history/event 색을 구분한다.

- [ ] **Step 3: 한국어 글을 요구사항 → 상태 머신 설계 → service 구현 → 리뷰 결함 → 추가 history/cancel 요구 순서로 작성한다**

Code excerpts: transition validation과 status-history 기록을 설명하는 데 필요한 8–18줄만 사용한다.

- [ ] **Step 4: 한국어 build 뒤 영문을 현지화하고 양 route를 검증한다**

Run: `git diff --check && npm run build`

Expected routes: `/ko/blog/clinic-appointment-part2-state-machine-and-history/`, `/blog/clinic-appointment-part2-state-machine-and-history/`.

- [ ] **Step 5: Part 2를 커밋한다**

Commit intent: `Make appointment state changes auditable`

## Task 4: Part 3 — 병원마다 다른 업무시간과 자원

**Files:**
- Create: `public/assets/clinic-appointment-part3-hero.png`
- Create: `public/assets/clinic-appointment-part3-availability-pipeline-01.svg`
- Create: `public/assets/clinic-appointment-part3-availability-pipeline-01.png`
- Create: `src/content/docs/ko/blog/clinic-appointment-part3-clinic-specific-availability.mdx`
- Create: `src/content/docs/blog/clinic-appointment-part3-clinic-specific-availability.mdx`

- [ ] **Step 1: `SlotCalculationService`와 병원별 problem facts를 고정한다**

Run:

```bash
cd /Users/debop/work/bluetape4k/clinic-appointment
rg -n "class SlotCalculationService|ClinicOperating|BreakTime|Closure|Holiday|DoctorSchedule|DoctorAbsence|EquipmentUnavailability" appointment-core/src/main appointment-core/src/test
```

Expected: clinic timezone/business hours, doctor schedules/absences, equipment availability가 실시간 슬롯 계산에 들어가는 실제 순서가 확인된다.

- [ ] **Step 2: 의사·장비·시간표 hero와 availability pipeline dark diagram을 만든다**

Diagram content: request `(clinic, treatment, date)` → clinic calendar → doctor capability/schedule → equipment requirement/unavailability → existing appointment overlap → available slots. Tenant isolation은 작은 boundary annotation으로만 표시하고 주제로 확장하지 않는다.

- [ ] **Step 3: 한국어와 영문 글을 작성한다**

핵심 구분: 병원별 설정은 “같은 SaaS의 다른 problem facts”이며, tenant authorization은 별도의 보안 경계다. 실시간 slot query는 빠른 feasibility 계산이지 전체 일정 최적화가 아니다.

- [ ] **Step 4: diagram audit, bilingual parity, build, route를 검증하고 커밋한다**

Run: 공통 asset 검증 명령, `git diff --check`, `npm run build`.

Commit intent: `Derive availability from each clinic's real constraints`

## Task 5: Part 4 — Greedy 조회와 전역 최적화

**Files:**
- Create: `public/assets/clinic-appointment-part4-hero.png`
- Create: `public/assets/clinic-appointment-part4-scheduling-choice-map-01.svg`
- Create: `public/assets/clinic-appointment-part4-scheduling-choice-map-01.png`
- Create: `src/content/docs/ko/blog/clinic-appointment-part4-greedy-vs-global-optimization.mdx`
- Create: `src/content/docs/blog/clinic-appointment-part4-greedy-vs-global-optimization.mdx`

- [ ] **Step 1: 단건 슬롯 계산과 solver 호출 경계를 고정한다**

Run:

```bash
cd /Users/debop/work/bluetape4k/clinic-appointment
rg -n "SlotCalculationService|SolverManager|solve|ScheduleSolution|AppointmentPlanningEntity" appointment-core appointment-solver appointment-api
```

Expected: request-time availability path와 bulk/global optimization path가 서로 다른 service boundary로 확인된다.

- [ ] **Step 2: 두 scheduling path를 비교하는 hero와 decision-map dark diagram을 만든다**

Diagram content: 왼쪽 `Low latency + one request + feasible slots`, 오른쪽 `many appointments + shared resources + score improvement`; 중앙 decision questions는 scope, latency budget, reassignment 허용 여부다.

- [ ] **Step 3: 한국어와 영문 글을 작성한다**

Greedy를 열등한 알고리즘으로 표현하지 않는다. 실시간 응답에는 bounded filtering이 적합하고, 상호 의존성이 큰 재배치에는 solver가 적합하다는 선택 기준을 설명한다.

- [ ] **Step 4: asset/build/route를 검증하고 커밋한다**

Commit intent: `Separate slot lookup from global schedule optimization`

## Task 6: Part 5 — 병원 규칙을 Timefold Constraint로 번역하기

**Files:**
- Create: `public/assets/clinic-appointment-part5-hero.png`
- Create: `public/assets/clinic-appointment-part5-timefold-model-01.svg`
- Create: `public/assets/clinic-appointment-part5-timefold-model-01.png`
- Create: `public/assets/clinic-appointment-part5-benchmark-scale-02.svg`
- Create: `public/assets/clinic-appointment-part5-benchmark-scale-02.png`
- Create: `src/content/docs/ko/blog/clinic-appointment-part5-timefold-constraints.mdx`
- Create: `src/content/docs/blog/clinic-appointment-part5-timefold-constraints.mdx`

- [ ] **Step 1: Planning Entity/Fact와 constraint count를 현재 source에서 다시 계산한다**

Run:

```bash
cd /Users/debop/work/bluetape4k/clinic-appointment
rg -n "@PlanningEntity|@PlanningVariable|@ProblemFact|@PlanningSolution|ConstraintProvider" appointment-solver/src/main
rg -n "private fun|fun .*Constraint|Hard|Soft" appointment-solver/src/main/kotlin
sed -n '1,220p' docs/solver-benchmark-report.md
```

Expected: `AppointmentPlanningEntity`, problem facts, Hard/Soft constraint definitions, benchmark problem sizes와 실행 환경이 확인된다. 숫자는 함수 호출 수를 직접 세고 문서 숫자와 불일치하면 source를 우선한다.

- [ ] **Step 2: Timefold model dark diagram을 만들고 검증한다**

Diagram content: Planning Entity의 assigned doctor/start time, immutable Problem Facts, Hard feasibility group, Soft preference group, score, Solver output. H4a/H4b처럼 문서 번호와 실제 constraint 함수 수가 다른 이유를 caption에서 설명한다.

- [ ] **Step 3: benchmark chart dark asset을 별도 asset loop로 만든다**

Chart source: `docs/solver-benchmark-report.md`의 problem size와 측정값만 사용한다. 실행 환경과 날짜를 caption에 표시하고, 비용 절감이나 production SLA로 확대 해석하지 않는다.

- [ ] **Step 4: 한국어와 영문 글을 작성한다**

Section order: 업무 문장 → Planning model → Hard/Soft 분류 → 대표 constraint 코드 → score 해석 → benchmark 읽기 → 새 업무 규칙을 constraint로 추가하는 리뷰 과정.

- [ ] **Step 5: 두 asset을 각각 검증하고 build/route를 확인한 뒤 커밋한다**

Run: 두 asset에 공통 검증 명령을 따로 실행하고 `git diff --check && npm run build`.

Commit intent: `Translate clinic policy into explainable Timefold constraints`

## Task 7: Part 6 — 휴진과 장비 고장 뒤 재배정

**Files:**
- Create: `public/assets/clinic-appointment-part6-hero.png`
- Create: `public/assets/clinic-appointment-part6-rescheduling-flow-01.svg`
- Create: `public/assets/clinic-appointment-part6-rescheduling-flow-01.png`
- Create: `src/content/docs/ko/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx`
- Create: `src/content/docs/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx`

- [ ] **Step 1: closure/equipment spec, plan, implementation, tests의 연결을 고정한다**

Run:

```bash
cd /Users/debop/work/bluetape4k/clinic-appointment
rg -n "EquipmentUnavailability|ClinicClosure|reschedul|pinned" docs/superpowers docs/requirements appointment-core appointment-solver appointment-api
```

Expected: 추가 요구사항이 data model, slot calculation, solver fact/constraint, API, test로 전파된 근거가 확보된다.

- [ ] **Step 2: 장애 작업대 hero와 rescheduling dark flow를 만든다**

Diagram content: closure/unavailability event → impacted appointment selection → pinned filter → Timefold re-solve → updated schedule/history → notification handoff. 자동 변경이 허용되지 않는 상태는 명확히 분리한다.

- [ ] **Step 3: 한국어와 영문 글을 작성한다**

핵심은 “처음 예약”보다 “운영 중 변경”이 모델을 더 엄격하게 만든다는 점이다. spec에서 구현까지 추가된 entity/fact/constraint/test를 하나의 trace로 설명한다.

- [ ] **Step 4: asset/build/route를 검증하고 커밋한다**

Commit intent: `Show how disruptions reshape the scheduling model`

## Task 8: Part 7 — 리뷰에서 다음 요구사항으로

**Files:**
- Create: `public/assets/clinic-appointment-part7-hero.png`
- Create: `public/assets/clinic-appointment-part7-development-loop-01.svg`
- Create: `public/assets/clinic-appointment-part7-development-loop-01.png`
- Create: `src/content/docs/ko/blog/clinic-appointment-part7-review-and-operational-evolution.mdx`
- Create: `src/content/docs/blog/clinic-appointment-part7-review-and-operational-evolution.mdx`

- [ ] **Step 1: lessons와 multitenancy implementation 근거를 고정한다**

Run:

```bash
cd /Users/debop/work/bluetape4k/clinic-appointment
rg -n "근본 원인|설계 결정|교훈|검증" docs/lessons
rg -n "TenantContext|TenantClinicAccessChecker|tenantGroupId|X-Tenant" appointment-core appointment-api
rg -n "notification|outbox|reminder|SSE" appointment-event appointment-notification docs/requirements
```

Expected: review가 cancel reason, history, authorization, notification 같은 추가 요구로 이어진 구체 사례가 확인된다.

- [ ] **Step 2: review board hero와 development-loop dark diagram을 만든다**

Diagram content: Requirements → Design/Plan → Implementation → Tests/Review → Lessons → New Requirements. 바깥 ring에 tenant isolation, notification delivery, observability, performance를 운영 경계로 배치한다.

- [ ] **Step 3: 한국어와 영문 글을 작성한다**

Part 1의 CRUD 질문으로 돌아와 시리즈를 닫는다. 병원별 업무시간/자원 설정과 tenant 격리를 같은 개념으로 합치지 않고, domain correctness와 authorization correctness가 모두 필요하다고 정리한다.

- [ ] **Step 4: asset/build/route를 검증하고 커밋한다**

Commit intent: `Close the clinic series with an iterative delivery loop`

## Task 9: 전체 시리즈 교차 검증

**Files:**
- Verify: `src/content/docs/ko/blog/clinic-appointment-part*.mdx`
- Verify: `src/content/docs/blog/clinic-appointment-part*.mdx`
- Verify: `public/assets/clinic-appointment-part*`

- [ ] **Step 1: 7편의 frontmatter와 navigation parity를 검사한다**

Run:

```bash
for locale in src/content/docs/ko/blog src/content/docs/blog; do
  rg -l "clinic-appointment series" "$locale"/clinic-appointment-part*.mdx | wc -l
done
rg -n "Part [1-7]|시리즈 링크|Series Navigation" src/content/docs/{blog,ko/blog}/clinic-appointment-part*.mdx
```

Expected: 각 locale 7편, part number와 앞·뒤 link가 유효하다.

- [ ] **Step 2: 모든 본문 diagram이 blog-owned dark asset인지 확인한다**

Run:

```bash
rg -n "clinic-appointment/(docs|README)|docs/(images|requirements/assets)" src/content/docs/{blog,ko/blog}/clinic-appointment-part*.mdx
find public/assets -maxdepth 1 -type f -name 'clinic-appointment-part*.svg' | wc -l
find public/assets -maxdepth 1 -type f -name 'clinic-appointment-part*.png' | wc -l
```

Expected: article에 source-repo 상대 asset 경로가 없고, 8개 dark SVG와 대응 PNG 및 7개 hero PNG가 있다.

- [ ] **Step 3: source claim과 숫자를 최종 재검증한다**

Recheck: pinned statuses, Hard/Soft constraint count, module names, Timefold version, benchmark date/environment, tenant hierarchy. 문서와 source가 다르면 현재 source/test를 우선하고 historical 문서는 당시 설계라는 문맥을 붙인다.

- [ ] **Step 4: 전체 build와 14개 route를 검증한다**

Run:

```bash
git diff --check
npm run build
for slug in \
  clinic-appointment-part1-not-just-crud \
  clinic-appointment-part2-state-machine-and-history \
  clinic-appointment-part3-clinic-specific-availability \
  clinic-appointment-part4-greedy-vs-global-optimization \
  clinic-appointment-part5-timefold-constraints \
  clinic-appointment-part6-closure-equipment-rescheduling \
  clinic-appointment-part7-review-and-operational-evolution; do
  test -f "dist/blog/${slug}/index.html"
  test -f "dist/ko/blog/${slug}/index.html"
done
```

Expected: exit code 0, Astro check/build 성공, 14개 route 존재.

- [ ] **Step 5: 최종 교차 검증을 커밋한다**

Commit intent: `Keep the clinic series consistent across languages and assets`

## Self-Review Result

- Spec coverage: 7편의 독자·주제·개발 프로세스, 병원별 업무시간/의사/장비, 상태 관리, Greedy와 Timefold 역할 분리, 운영 중 재배정, tenant isolation, 한·영 parity, dark diagram 계약을 모두 Task 1–9에 연결했다.
- Placeholder scan: 실행할 command, 생성할 path, article section order, diagram content, expected evidence를 명시했다.
- Type and naming consistency: spec의 7개 slug와 plan의 MDX/route가 일치하며 asset은 `clinic-appointment-part{N}-{topic}-{NN}` 계약을 따른다.
- Execution mode: bluetape4k docs 작업 선호에 따라 현재 세션에서 inline으로 수행하고, 각 한국어 편과 bilingual pair를 review checkpoint로 사용한다.
