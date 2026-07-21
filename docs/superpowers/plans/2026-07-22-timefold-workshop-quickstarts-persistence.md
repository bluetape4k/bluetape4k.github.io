# Timefold Workshop Quickstarts와 Exposed 영속화 블로그 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Issue #191의 병상 배정·학교 시간표 quickstart와 Exposed Score 영속화 경계를 설명하는 한국어 블로그 글을 작성하고, 검증된 PR까지 만든다.

**Architecture:** 현재 `timefold-workshop`의 planning model, constraints, `SolverManager`, JDBC/R2DBC Score 저장 테스트를 사실 근거로 사용한다. 글은 quickstart가 구현한 범위와 실제 서비스에서 추가해야 할 작업 상태·해답 승인·업무 데이터 저장 경계를 분리하며, 대표 이미지와 두 개의 어두운 기술 다이어그램으로 비교와 실행 순서를 보여 준다.

**Tech Stack:** Astro/Starlight MDX, Kotlin/Spring Boot source links, Timefold Solver, JetBrains Exposed JDBC/R2DBC, SVG/PNG diagrams, GitHub Actions

---

### Task 1: 현재 소스 근거와 글 골격 고정

**Files:**
- Create: `src/content/docs/ko/blog/timefold-workshop-quickstarts-exposed-persistence.mdx`
- Reference: `/Users/debop/work/bluetape4k/timefold-workshop/README.md`
- Reference: `/Users/debop/work/bluetape4k/timefold-workshop/01-quickstarts/bed-allocation/src/main/kotlin/timefold/workshop/bed/allocation/`
- Reference: `/Users/debop/work/bluetape4k/timefold-workshop/01-quickstarts/school-timetabling/src/main/kotlin/timefold/workshop/school/timetabling/`
- Reference: `/Users/debop/work/bluetape4k/timefold-workshop/exposed/{jdbc-examples,r2dbc-examples}/src/test/kotlin/timefold/workshop/persistence/exposed/`

- [ ] **Step 1: 원격 source ref 확인**

Run:

```bash
git -C /Users/debop/work/bluetape4k/timefold-workshop fetch origin develop
git -C /Users/debop/work/bluetape4k/timefold-workshop rev-parse origin/develop
```

Expected: 원격 `develop` SHA가 출력되고 이후 소스 링크가 같은 브랜치를 가리킨다.

- [ ] **Step 2: planning model과 constraint 이름 수집**

Run:

```bash
rg -n '@Planning|fun [a-zA-Z].*ConstraintFactory|SolverManager|ConcurrentHashMap' \
  /Users/debop/work/bluetape4k/timefold-workshop/01-quickstarts
```

Expected: `Stay.bed`, `Lesson.timeslot`, `Lesson.room`, 두 `PlanningSolution`, 제약 함수, 비동기 job 저장 경계가 확인된다.

- [ ] **Step 3: Exposed 저장 범위 확인**

Run:

```bash
rg -n 'Score|withTables|transaction|suspendTransaction|selectAll' \
  /Users/debop/work/bluetape4k/timefold-workshop/exposed
```

Expected: JDBC/R2DBC 예제가 Score 컬럼의 저장·조회 round-trip을 검증하며 전체 `PlanningSolution` 저장소는 없다는 사실이 확인된다.

- [ ] **Step 4: frontmatter와 본문 골격 작성**

Create the MDX file with this exact heading order:

```markdown
## quickstart가 끝난 자리에서 애플리케이션 설계가 시작된다
## 병상 배정: 입원 기간 전체에 하나의 병상을 고른다
## 학교 시간표: 수업마다 시간과 교실을 함께 고른다
## 같은 Timefold라도 점수 구조가 다른 이유
## Solver 실행을 API 요청과 분리한다
## Exposed 예제가 실제로 저장하는 것은 Score다
## 실제 서비스에서는 무엇을 더 저장해야 할까
## 테스트와 리뷰: 제약 하나와 경계 하나를 따로 검증한다
## 데모를 애플리케이션 기능으로 옮기는 체크리스트
## 구현 코드와 자료 살펴보기
```

Expected: 독립 글의 문제 → 모델 비교 → 실행 → 저장 → 테스트 → 선택 기준 흐름이 고정된다.

### Task 2: 대표 이미지 제작

**Files:**
- Create: `public/assets/timefold-workshop-persistence-hero.png`

- [ ] **Step 1: 주변 대표 이미지와 시각 언어 비교**

Run:

```bash
file public/assets/clinic-appointment-part4-hero.png \
  public/assets/bluetape4k-exposed-part6-ecosystem-integrations-hero.png
```

Expected: 기존 16:9 계열 bitmap 대표 이미지의 크기와 형식이 확인된다.

- [ ] **Step 2: 3D 미니어처 대표 이미지 생성**

Use the image generation skill with a prompt containing:

```text
dark cinematic 3D miniature engineering workbench, left board represents hospital bed allocation,
right board represents school timetabling, small blue and white robotic workers, central optimization
machine, result cards moving toward a database vault, no readable text, no logos, 16:9 composition
```

Expected: 병상·시간표·Solver·저장 경계가 한 장면에 보이고 텍스트가 없는 PNG가 생성된다.

- [ ] **Step 3: 이미지 크기와 본문 크롭 확인**

Run:

```bash
file public/assets/timefold-workshop-persistence-hero.png
```

Expected: 가로형 PNG이며 첫 화면에서 좌우 주제가 잘리지 않는다.

### Task 3: 두 계획 문제 비교 다이어그램 제작

**Files:**
- Create: `public/assets/timefold-workshop-planning-model-comparison-01.svg`
- Create: `public/assets/timefold-workshop-planning-model-comparison-01.png`

- [ ] **Step 1: 어두운 비교 다이어그램 작성**

The SVG must show two columns with these exact source-backed mappings:

```text
병상 배정: Stay -> bed -> departments/rooms/beds -> HardMediumSoftScore
학교 시간표: Lesson -> timeslot + room -> timeslots/rooms -> HardSoftScore
```

Include representative hard and preference constraints without claiming that every listed preference has the same score level.

Expected: 독자가 두 모델의 계획 대상·변수·문제 정보·점수 차이를 한 화면에서 비교한다.

- [ ] **Step 2: SVG를 PNG로 렌더링**

Run the repository diagram renderer selected by `bluetape-diagram`.

Expected: PNG가 생성되고 SVG와 같은 텍스트·카드·연결선을 포함한다.

- [ ] **Step 3: geometry와 텍스트 감사**

Run the `bluetape-diagram` validation commands for text hazards, connector endpoints, overlaps, and raster inspection.

Expected: text hazard 0, geometry failure 0, 카드와 연결선 겹침 0.

### Task 4: Solver 실행과 영속화 경계 Sequence Diagram 제작

**Files:**
- Create: `public/assets/timefold-workshop-solver-persistence-sequence-02.svg`
- Create: `public/assets/timefold-workshop-solver-persistence-sequence-02.png`

- [ ] **Step 1: sequence participants와 메시지 작성**

Use these participants:

```text
Client, API, Job Store, SolverManager, Solver, Result Store, Business Data
```

Show validation, job snapshot save, asynchronous solve, best-solution update, result query, explicit approval, and business-data apply. Visually label current quickstart behavior, current Score persistence proof, and proposed production responsibility.

Expected: Solver 결과가 자동으로 업무 데이터가 되지 않는다는 경계가 분명하다.

- [ ] **Step 2: SVG를 PNG로 렌더링하고 sequence audit 실행**

Run the renderer and sequence-specific validation from `bluetape-diagram`.

Expected: participant spacing, activation bars, messages, frames, labels, and arrowheads pass without overlap.

### Task 5: 한국어 본문 완성

**Files:**
- Modify: `src/content/docs/ko/blog/timefold-workshop-quickstarts-exposed-persistence.mdx`

- [ ] **Step 1: 대표 이미지와 두 다이어그램 삽입**

Use absolute asset URLs and diagram titles:

```mdx
<figure class="bt4k-architecture" data-diagram-title="병상 배정과 학교 시간표의 계획 모델 비교">
```

```mdx
<figure class="bt4k-sequence" data-diagram-title="Solver 실행과 영속화 책임의 경계">
```

Expected: 대표 이미지는 확대 대상에서 제외되고 두 기술 다이어그램만 크게 보기 UI를 사용한다.

- [ ] **Step 2: 소스 링크와 짧은 Kotlin 코드 추가**

Use `develop` branch URLs for `Stay`, `BedPlan`, `BedAllocationConstraintProvider`, `Lesson`, `Timetable`, `TimetableController`, `TimetableConstraintProvider`, and representative JDBC/R2DBC `HardSoftScoreTest` files.

Expected: 코드 블록은 `PlanningVariable`, `SolverManager`, Score 컬럼 round-trip 세 경계만 보여 주고 전체 파일은 링크로 연결한다.

- [ ] **Step 3: 현재 구현과 제안 경계를 명시**

The article must state all of the following:

```text
- quickstart controller keeps jobs in an in-memory ConcurrentHashMap.
- current Exposed examples prove Score column persistence, not full PlanningSolution persistence.
- problem snapshots, job state, best solutions, approval, and business-data updates require an application-specific design.
- Solver output is a candidate result and must not silently overwrite operational data.
```

Expected: workshop의 현재 기능을 과장하지 않는다.

- [ ] **Step 4: 독자용 자료만 남기기**

Expected: 대표 모듈과 클래스, Timefold 공식 문서, Issue #191만 링크하며 내부 raw review 자료는 제외한다.

### Task 6: 한국어 교정과 사이트 검증

**Files:**
- Modify: `src/content/docs/ko/blog/timefold-workshop-quickstarts-exposed-persistence.mdx`

- [ ] **Step 1: 사실 고정 후 한국어 자연스러움 검토**

Run targeted searches for mechanical transitions and generic claims:

```bash
rg -n '또한|따라서|나아가|중요합니다|효율적|강력한|포괄적|~를 통해' \
  src/content/docs/ko/blog/timefold-workshop-quickstarts-exposed-persistence.mdx
```

Expected: 식별자·Score 계층·링크·제한 사항을 보존하면서 번역투와 홍보 문장을 제거한다.

- [ ] **Step 2: diff와 참조 검증**

Run:

```bash
git diff --check
rg -n 'timefold-workshop|HardMediumSoftScore|HardSoftScore|ConcurrentHashMap|Score' \
  src/content/docs/ko/blog/timefold-workshop-quickstarts-exposed-persistence.mdx
```

Expected: whitespace 오류 0, 필수 사실과 소스 링크 존재.

- [ ] **Step 3: 사이트 빌드**

Run:

```bash
npm run build
```

Expected: Astro diagnostics 0 errors and the new route is generated.

- [ ] **Step 4: 로컬 route와 asset 확인**

Run the local preview server and request:

```text
/ko/blog/timefold-workshop-quickstarts-exposed-persistence/
/assets/timefold-workshop-persistence-hero.png
/assets/timefold-workshop-planning-model-comparison-01.png
/assets/timefold-workshop-solver-persistence-sequence-02.png
```

Expected: all responses are HTTP 200 and the built article contains two diagram titles and three asset references.

### Task 7: 검토·커밋·PR 생성

**Files:**
- Modify: `docs/superpowers/specs/2026-07-22-timefold-workshop-quickstarts-persistence-design.md`
- Modify: `docs/superpowers/plans/2026-07-22-timefold-workshop-quickstarts-persistence.md`
- Create/Modify: article and visual files from Tasks 1-6

- [ ] **Step 1: 최종 범위와 P0/P1 검토**

Run:

```bash
git diff --stat origin/develop...HEAD
git diff --check
```

Expected: 글·설계·계획·대표 이미지·두 SVG/PNG 쌍만 포함되고 P0/P1이 0이다.

- [ ] **Step 2: Lore protocol commit 작성**

Stage only the scoped files and commit with `Constraint`, `Rejected`, `Confidence`, `Scope-risk`, `Directive`, `Tested`, and `Not-tested` trailers.

Expected: commit message가 글의 사실 경계와 PR-only 배포 제한을 기록한다.

- [ ] **Step 3: 브랜치 push와 PR 생성**

Push `docs/timefold-workshop-persistence` and create a PR targeting `develop`. Assign `debop`, copy `documentation` and `enhancement` labels from Issue #191, use `Refs #191`, and ensure the final `##` section is `## DoD Status`.

Expected: PR은 OPEN 상태이며 merge 또는 auto-merge가 설정되지 않는다.

- [ ] **Step 4: live PR과 CI 검증**

Run:

```bash
gh pr view --json number,url,state,isDraft,headRefOid,baseRefName,assignees,labels,body,statusCheckRollup
```

Expected: exact head SHA, metadata, final DoD heading, CI status가 확인되고 merge·deploy는 수행하지 않는다.
