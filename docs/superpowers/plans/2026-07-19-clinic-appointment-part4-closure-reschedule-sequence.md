# Clinic Appointment Part 4 Closure Reschedule Sequence Diagram Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Part 4에 휴진 재배정의 빠른 후보 경로와 Timefold 전체 최적화 경로를 비교하는 한국어 시퀀스 다이어그램을 추가하고 로컬 사이트에서 검증한다.

**Architecture:** 하나의 SVG/PNG가 운영자, 두 서비스 진입점, 저장소, Timefold Solver 사이의 메시지를 시간 순서로 보여준다. 투명한 `alt` 프레임은 두 경로가 자동으로 연결되지 않는 현재 구현을 그대로 표현하며, 빠른 경로만 상태 전환과 후보 확정을 수행하고 Solver 경로는 검토할 배치안을 반환하는 데서 끝난다.

**Tech Stack:** Astro Starlight, MDX, SVG, CairoSVG, bluetape diagram audit scripts

---

### Task 1: 휴진 재배정 시퀀스 다이어그램 제작

**Files:**
- Create: `public/assets/clinic-appointment-part4-closure-reschedule-sequence-02.svg`
- Create: `public/assets/clinic-appointment-part4-closure-reschedule-sequence-02.png`

- [x] **Step 1: 참여자와 두 경로의 메시지를 SVG로 작성한다**

운영자, `ClosureRescheduleService`, `SlotCalculationService`, 예약·후보 저장소, `SolverService`, 일정 데이터 저장소, Timefold Solver를 배치한다. 빠른 후보 경로와 전체 최적화 경로를 `alt`/`else`로 구분하고, 현재 두 경로가 자동 연결되지 않는다는 주석을 프레임 밖에 둔다.

- [x] **Step 2: 텍스트와 XML을 검사한다**

Run: `xmllint --noout public/assets/clinic-appointment-part4-closure-reschedule-sequence-02.svg && python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py public/assets/clinic-appointment-part4-closure-reschedule-sequence-02.svg`

Expected: XML 오류 없음, `text_hazards=0`, `code_without_highlight=0`.

- [x] **Step 3: CairoSVG로 2배 PNG를 렌더링한다**

Run: `cairosvg public/assets/clinic-appointment-part4-closure-reschedule-sequence-02.svg -o public/assets/clinic-appointment-part4-closure-reschedule-sequence-02.png -s 2`

Expected: 2배 크기의 PNG 생성.

- [x] **Step 4: 공통 및 시퀀스 검사를 실행한다**

Run:

```bash
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py public/assets/clinic-appointment-part4-closure-reschedule-sequence-02.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal public/assets/clinic-appointment-part4-closure-reschedule-sequence-02.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py public/assets/clinic-appointment-part4-closure-reschedule-sequence-02.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py public/assets/clinic-appointment-part4-closure-reschedule-sequence-02.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-sequence-style-audit.py public/assets/clinic-appointment-part4-closure-reschedule-sequence-02.svg
```

Expected: 모든 검사 `PASS`, `failures=0`, 연결선·참여자·메시지 수가 0보다 큼.

- [x] **Step 5: 원본 크기 PNG를 확인한다**

라벨 잘림, 메시지 겹침, 화살표 방향과 색, `alt`/`else` 경계, 참여자 간격, 한글 폰트와 대비를 검사한다.

### Task 2: Part 4 본문에 다이어그램 추가

**Files:**
- Modify: `src/content/docs/ko/blog/clinic-appointment-part4-greedy-vs-global-optimization.mdx`

- [x] **Step 1: 기존 텍스트 흐름 요약을 확대 가능한 figure로 교체한다**

`bt4k-architecture`, `data-diagram-title="휴진 재배정의 두 실행 경로"`, 한국어 대체 텍스트와 캡션을 사용한다.

- [x] **Step 2: 본문 설명을 현재 구현 경계에 맞게 다듬는다**

`PENDING_RESCHEDULE` 전환과 후보 확정은 빠른 경로의 책임이며, Solver 경로는 전체 배치와 점수를 반환하지만 자동 저장·상태 변경·환자 알림까지 수행하지 않는다고 설명한다.

### Task 3: 사이트 검증

**Files:**
- Verify: `src/content/docs/ko/blog/clinic-appointment-part4-greedy-vs-global-optimization.mdx`
- Verify: `public/assets/clinic-appointment-part4-closure-reschedule-sequence-02.svg`
- Verify: `public/assets/clinic-appointment-part4-closure-reschedule-sequence-02.png`

- [x] **Step 1: 변경 형식과 빌드를 확인한다**

Run: `git diff --check && npm run build`

Expected: Astro 진단 0건, 전체 빌드 성공.

- [x] **Step 2: 로컬 경로와 자산을 확인한다**

Run: `curl` against the Part 4 page and sequence PNG on `http://127.0.0.1:4321`.

Expected: 페이지와 PNG 모두 HTTP 200, HTML에 한국어 확대 제목과 새 이미지 경로가 포함됨.
