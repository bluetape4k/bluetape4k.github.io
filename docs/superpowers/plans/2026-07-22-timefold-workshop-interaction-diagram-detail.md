# Timefold Workshop 상호작용 다이어그램 상세화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 카드와 연결선 기반 상호작용 다이어그램에서 작업 저장소와 후보 해답 저장소를 다시 분리하고, 작업 제출부터 승인·버전 충돌까지의 핵심 관계를 교차 없이 복원한다.

**Architecture:** 다이어그램은 시간 순서가 아닌 컴포넌트 책임 지도다. 상단에는 요청·Solver 실행 컴포넌트를 수평으로 두고, 중단에는 두 영속화 저장소를 나란히 두며, 하단에는 승인 서비스와 업무 데이터를 둔다. 모든 관계는 의미별 색상, 별도 포트, 둥근 직각 통로를 사용한다.

**Tech Stack:** SVG, CairoSVG, Astro/Starlight MDX, `bluetape-diagram` 감사 스크립트

---

### Task 1: 다이어그램 문구와 컴포넌트 배치 확정

**Files:**
- Modify: `public/assets/timefold-workshop-solver-persistence-sequence-02.svg`
- Reference: `docs/superpowers/specs/2026-07-22-timefold-workshop-quickstarts-persistence-design.md`

- [x] **Step 1: 상단 설명 문구를 승인된 표현으로 변경**

```xml
<text class="subtitle" x="1600" y="124" text-anchor="middle">
  컴포넌트를 연결하는 선은 책임 경계를 오가는 요청, 데이터, 콜백을 나타냅니다.
</text>
```

- [x] **Step 2: 9개 컴포넌트 카드를 세 영역에 배치**

다음 좌표를 기준으로 `viewBox="0 0 3200 1650"` 안에 카드를 배치한다.

| 영역 | 카드 | x | y | width | height |
| --- | --- | ---: | ---: | ---: | ---: |
| 요청·실행 | 운영자 | 100 | 260 | 390 | 180 |
| 요청·실행 | 최적화 API | 590 | 260 | 400 | 180 |
| 요청·실행 | `OptimizationJobService` | 1090 | 260 | 580 | 180 |
| 요청·실행 | `SolverManager` | 1840 | 260 | 500 | 180 |
| 요청·실행 | `Solver` | 2530 | 260 | 420 | 180 |
| 영속화 | 후보 해답 저장소 | 920 | 720 | 600 | 180 |
| 영속화 | 작업 저장소 | 1770 | 720 | 600 | 180 |
| 승인 | 승인 서비스 | 1360 | 1120 | 650 | 180 |
| 승인 | 업무 데이터 | 2420 | 1120 | 560 | 180 |

작업 저장소 본문은 `문제 스냅샷 · 작업 상태 · 기준 버전`, 후보 해답 저장소 본문은 `가장 좋은 해답 · Score · 생성 시각`으로 고정한다.

- [x] **Step 3: 네 역할의 확대 화살촉을 동일하게 유지**

```xml
<marker id="arrow-blue" markerWidth="28" markerHeight="28" refX="18" refY="9" orient="auto" markerUnits="userSpaceOnUse">
  <path d="M0 0 L18 9 L0 18 Z" fill="#66a8cf" stroke="none" stroke-dasharray="none"/>
</marker>
```

동일한 크기와 경로를 `arrow-green`, `arrow-amber`, `arrow-red`에도 적용하고 색상만 변경한다.

### Task 2: 핵심 상호작용과 저장 경계 복원

**Files:**
- Modify: `public/assets/timefold-workshop-solver-persistence-sequence-02.svg`

- [x] **Step 1: 관계 그룹을 감사 가능한 형식으로 작성**

모든 관계는 다음 구조를 사용한다.

```xml
<g data-from="job-service" data-to="job-store">
  <path data-connector="job-service-to-job-store" class="connector persist"
        d="M1260 440 V720" marker-end="url(#arrow-green)"/>
  <g class="relationshipLabel">
    <rect class="labelBg" x="1285" y="560" width="220" height="34" rx="17" stroke="#8db475"/>
    <text class="label" x="1395" y="583" text-anchor="middle" fill="#c9dda8">스냅샷 · 상태 저장</text>
  </g>
</g>
```

- [x] **Step 2: 14개 관계를 별도 포트와 통로로 배치**

| 관계 | 의미 | 스타일 |
| --- | --- | --- |
| 운영자 ↔ 최적화 API | 제출·조회·승인 / 작업 ID·상태·후보 | 요청·제어 |
| 최적화 API ↔ 작업 서비스 | 명령·조회 / 작업 결과 | 요청·제어 |
| 작업 서비스 → `SolverManager` | 실행·취소 | 요청·제어 |
| `SolverManager` → `Solver` | 문제 전달 | 요청·제어 |
| `Solver` → `SolverManager` | 더 나은 해답 이벤트 | 비동기 콜백 |
| `SolverManager` → 작업 서비스 | 해답 콜백 | 비동기 콜백 |
| 작업 서비스 → 후보 저장소 | 후보 해답·Score 저장 | 영속화 |
| `SolverManager` → 작업 저장소 | `problemFinder(jobId)` | 영속화 |
| 작업 서비스 → 작업 저장소 | 문제 스냅샷·상태 저장 | 영속화 |
| 최적화 API → 승인 서비스 | `approve(jobId)` | 요청·제어 |
| 작업 저장소 → 승인 서비스 | 기준 버전 | 영속화 |
| 후보 저장소 → 승인 서비스 | 후보 해답·Score | 영속화 |
| 승인 서비스 → 업무 데이터 | 버전 검증·반영 | 영속화·업무 반영 |
| 업무 데이터 → 승인 서비스 | 버전 충돌·재최적화 | 버전 충돌 |

양방향 관계는 PNG 렌더러의 시작 화살촉 반전에 의존하지 않는다. 요청은 위쪽 포트, 응답은 아래쪽 포트에 각각 독립된 단방향 `<path>`로 배치하고, 두 경로 모두 검증된 `marker-end`만 사용한다. 14개 관계는 총 16개 연결 경로로 표현하며, 다른 관계와 선분을 공유하지 않는다.

- [x] **Step 3: 범례와 결론 문장을 새 캔버스에 맞춰 이동**

범례는 `y=1430`, 결론 카드는 `y=1500`에 배치한다. 범례에는 요청·제어, 영속화·업무 반영, 비동기 콜백, 버전 충돌의 네 항목을 유지한다.

### Task 3: 다이어그램 체크리스트 검수와 PNG 생성

**Files:**
- Modify: `public/assets/timefold-workshop-solver-persistence-sequence-02.png`
- Verify: `public/assets/timefold-workshop-solver-persistence-sequence-02.svg`

- [x] **Step 1: 텍스트와 XML을 검사**

Run:

```bash
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py \
  public/assets/timefold-workshop-solver-persistence-sequence-02.svg
xmllint --noout public/assets/timefold-workshop-solver-persistence-sequence-02.svg
```

Expected: `text_hazards=0`, `code_without_highlight=0`, XML 오류 없음.

- [x] **Step 2: CairoSVG로 권위 PNG를 생성**

Run:

```bash
~/.local/bin/cairosvg \
  public/assets/timefold-workshop-solver-persistence-sequence-02.svg \
  -o public/assets/timefold-workshop-solver-persistence-sequence-02.png -s 2
```

Expected: `6400 × 3300` PNG.

- [x] **Step 3: 공통 연결선 감사를 실행**

Run:

```bash
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py \
  public/assets/timefold-workshop-solver-persistence-sequence-02.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal \
  public/assets/timefold-workshop-solver-persistence-sequence-02.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py \
  public/assets/timefold-workshop-solver-persistence-sequence-02.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py \
  public/assets/timefold-workshop-solver-persistence-sequence-02.svg
```

Expected: `markers=4`, `connectors=16`, `cards=9`, `labels=14`, `intrusions=0`, `crossings=0`, `shared_segments=0`, `label_cards=0`, `label_labels=0`, `label_connectors=0`, `geometry_failures=0`, endpoint PASS, mixed-corner `failures=0`.

- [x] **Step 4: 최종 PNG를 원본 크기로 열어 검수**

확인 항목은 텍스트 잘림, 화살촉 색상·크기·방향, 카드 경계의 수직 연결, 둥근 모서리, 선 교차, 라벨 간격, 영역 여백이다. 하나라도 실패하면 Task 2로 돌아간다.

### Task 4: 글 노출과 전체 사이트 검증

**Files:**
- Verify: `src/content/docs/ko/blog/timefold-workshop-quickstarts-exposed-persistence.mdx`
- Verify: `public/assets/timefold-workshop-solver-persistence-sequence-02.png`
- Verify: `public/assets/timefold-workshop-solver-persistence-sequence-02.svg`

- [x] **Step 1: 다이어그램 임베드와 제목을 확인**

```mdx
<figure
  class="bt4k-architecture"
  data-diagram-title="최적화 실행·영속화·승인 경계의 상호작용"
>
```

Expected: PNG 경로가 현재 asset을 가리키고, alt와 figcaption이 카드·연결선 상호작용을 설명한다.

- [x] **Step 2: 변경 파일의 diff 형식을 검사**

Run:

```bash
git diff --check -- \
  docs/superpowers/specs/2026-07-22-timefold-workshop-quickstarts-persistence-design.md \
  docs/superpowers/plans/2026-07-22-timefold-workshop-interaction-diagram-detail.md \
  public/assets/timefold-workshop-solver-persistence-sequence-02.svg \
  public/assets/timefold-workshop-solver-persistence-sequence-02.png \
  src/content/docs/ko/blog/timefold-workshop-quickstarts-exposed-persistence.mdx
```

Expected: 출력 없음.

- [x] **Step 3: 사이트 전체 빌드를 실행**

Run: `npm run build`

Expected: Astro diagnostics `0 errors`, `0 warnings`, Pagefind 인덱스 대상 `2384 HTML files`.

- [x] **Step 4: 로컬 글과 크게 보기 UI를 검증**

URL: `http://127.0.0.1:4321/ko/blog/timefold-workshop-quickstarts-exposed-persistence/`

Expected: 다이어그램 이미지 `naturalWidth=6400`, `naturalHeight=3300`, 크게 보기 버튼 1개, 제목이 있는 확대 dialog 1개, 확대 화면에서 모든 화살촉과 관계 라벨을 읽을 수 있음.

### Task 5: 로컬 변경 상태 보고

**Files:**
- Verify: repository worktree

- [x] **Step 1: 변경 파일 범위를 확인**

Run: `repo-status --short`

Expected: 승인된 설계 문서, 구현 계획, SVG, PNG, MDX만 변경되며 `.superpowers/brainstorm` 임시 자료는 Git 변경 대상에서 제외한다.

- [x] **Step 2: 커밋·푸시 없이 검수 결과를 보고**

보고에는 다이어그램 감사 수치, PNG 크기, 전체 빌드 결과, 로컬 확대 UI 결과와 남은 위험을 포함한다. 커밋이나 PR 갱신은 사용자의 별도 요청 전에는 실행하지 않는다.

### Task 6: 영문 글의 구조와 기술 근거 동기화

**Files:**
- Create: `src/content/docs/blog/timefold-workshop-quickstarts-exposed-persistence.mdx`
- Reference: `src/content/docs/ko/blog/timefold-workshop-quickstarts-exposed-persistence.mdx`

- [x] **Step 1: 같은 slug와 frontmatter로 영문 글 작성**

영문 글은 한국어판의 제목, 설명, 날짜, hero, 섹션 순서, 코드, 표, 수치, 소스 링크를 대응시킨다. 문장은
한국어 어순을 직역하지 않고 실무 개발자에게 자연스러운 영어로 쓴다.

- [x] **Step 2: 두 영문 다이어그램 경로와 제목 연결**

계획 모델 비교는 `/assets/timefold-workshop-planning-model-comparison-01-en.png`, 실행·영속화·승인 관계는
`/assets/timefold-workshop-solver-persistence-sequence-02-en.png`를 사용한다. 각 `data-diagram-title`, `alt`,
`figcaption`은 영문 다이어그램이 답하는 질문을 설명한다.

### Task 7: 영문 계획 모델 비교 다이어그램 제작

**Files:**
- Create: `public/assets/timefold-workshop-planning-model-comparison-01-en.svg`
- Create: `public/assets/timefold-workshop-planning-model-comparison-01-en.png`

- [x] **Step 1: 한국어판의 모델과 기하 구조를 유지해 영문 SVG 작성**

`Stay`와 `bed`, `Lesson`과 `timeslot + room`, 문제 정보, `HardMediumSoftScore`와 `HardSoftScore`의 대응을
그대로 유지한다. 영문 라벨은 카드 안에서 잘리지 않아야 한다.

- [x] **Step 2: XML·텍스트·연결선 검사 후 CairoSVG 렌더링**

`xmllint`, `diagram-svg-text-normalize.py`, 공통 연결선 감사와 CairoSVG `-s 2`를 실행한다. 예상 PNG 크기는
`3600 × 2240`이다.

- [x] **Step 3: 전체 크기 PNG 검수**

제목, 점수 설명, 화살촉, 카드 여백과 좌우 비교 구조가 읽히는지 확인한다.

### Task 8: 영문 상호작용 다이어그램 제작

**Files:**
- Create: `public/assets/timefold-workshop-solver-persistence-sequence-02-en.svg`
- Create: `public/assets/timefold-workshop-solver-persistence-sequence-02-en.png`

- [x] **Step 1: 9개 카드와 14개 관계를 영문으로 지역화**

한국어판의 9개 카드, 14개 의미 관계, 16개 `marker-end` 연결 경로를 유지한다. 작업 저장소와 후보 해답
저장소는 별도 카드로 유지하고, 양방향 관계도 독립 단방향 경로 두 개로 표현한다.

- [x] **Step 2: XML·텍스트·연결선·기하 감사 후 CairoSVG 렌더링**

예상 결과는 `markers=4`, `connectors=16`, `cards=9`, `labels=14`, 모든 충돌·침범·공유 선분·기하 실패 0건,
endpoint PASS, mixed-corner `failures=0`, PNG `6400 × 3300`이다.

- [x] **Step 3: 전체 크기 PNG 검수**

영문 라벨 잘림, 화살촉 크기·방향, 카드 사이 간격, 저장소 분리, 승인과 버전 충돌 경로를 확인한다.

### Task 9: 양 언어 동등성과 PR 검증

**Files:**
- Verify: Korean and English MDX routes
- Verify: four locale-specific technical diagram SVG/PNG pairs

- [x] **Step 1: 글과 자산의 동등성 검사**

두 글의 heading, 코드 블록, 표, 링크, figure 수를 비교한다. 영문 글에는 `-en.png`, 한국어 글에는 한국어
PNG만 연결되어야 하며 hero만 공유한다.

- [x] **Step 2: 전체 사이트 빌드와 두 route 확인**

`git diff --check`와 `npm run build`를 실행하고 `/ko/blog/timefold-workshop-quickstarts-exposed-persistence/`와
`/blog/timefold-workshop-quickstarts-exposed-persistence/`를 확인한다.

- [x] **Step 3: 커밋·푸시와 PR #251 갱신**

승인된 브랜치에 영문 동등성 변경을 커밋·푸시하고, PR 본문을 영문 route·자산·감사 수치로 갱신한다. 새
HEAD의 CI와 리뷰 상태를 다시 확인하며 머지와 배포는 실행하지 않는다.
