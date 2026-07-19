# Clinic Appointment Part 3 Sequence Diagram Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Part 3에 예약 가능 시간 조회의 호출 순서와 Timefold Solver 책임 경계를 보여주는 한국어 시퀀스 다이어그램을 추가하고 로컬 사이트에서 검증한다.

**Architecture:** 하나의 SVG/PNG가 사용자, API, 계산 서비스, 저장소 사이의 요청 흐름을 보여준다. 하루 전체 차단은 조기 종료 분기, 후보별 환자 수·장비 확인은 반복 구간으로 표현하고 전체 일정 최적화는 Part 4로 이어지는 주석으로만 남긴다.

**Tech Stack:** Astro Starlight, MDX, SVG, CairoSVG, bluetape diagram audit scripts

---

### Task 1: 시퀀스 다이어그램 제작

**Files:**
- Create: `public/assets/clinic-appointment-part3-availability-sequence-02.svg`
- Create: `public/assets/clinic-appointment-part3-availability-sequence-02.png`

- [x] **Step 1: 참여자와 메시지 흐름을 SVG로 작성한다**

사용자, 예약 API, 예약 가능 시간 계산 서비스, 병원·의사·진료·예약·장비 저장소를 배치한다. 정상 호출, 하루 전체 차단 분기, 후보별 자원 검사 반복, 최종 후보 반환을 서로 다른 색으로 구분한다.

- [x] **Step 2: 텍스트와 XML을 검사한다**

Run: `xmllint --noout public/assets/clinic-appointment-part3-availability-sequence-02.svg && python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py public/assets/clinic-appointment-part3-availability-sequence-02.svg`

Expected: XML 오류 없음, `text_hazards=0`, `code_without_highlight=0`.

- [x] **Step 3: CairoSVG로 2배 PNG를 렌더링한다**

Run: `cairosvg public/assets/clinic-appointment-part3-availability-sequence-02.svg -o public/assets/clinic-appointment-part3-availability-sequence-02.png -s 2`

Expected: 2배 크기의 PNG 생성.

- [x] **Step 4: 공통 및 시퀀스 검사를 실행한다**

Run:

```bash
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py public/assets/clinic-appointment-part3-availability-sequence-02.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py public/assets/clinic-appointment-part3-availability-sequence-02.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py public/assets/clinic-appointment-part3-availability-sequence-02.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py public/assets/clinic-appointment-part3-availability-sequence-02.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-sequence-style-audit.py public/assets/clinic-appointment-part3-availability-sequence-02.svg
```

Expected: 모든 검사 `PASS`, `failures=0`, 연결선과 참여자 수가 0보다 큼.

- [x] **Step 5: 원본 크기 PNG를 확인한다**

라벨 잘림, 메시지 겹침, 화살표 방향, 분기 영역, 참여자 간격, 한글 폰트와 대비를 검사한다.

### Task 2: Part 3 본문에 다이어그램 추가

**Files:**
- Modify: `src/content/docs/ko/blog/clinic-appointment-part3-clinic-specific-availability.mdx`

- [x] **Step 1: 파이프라인 설명 뒤에 확대 가능한 figure를 추가한다**

`bt4k-architecture`, `data-diagram-title="예약 가능 시간 조회 시퀀스"`, 한국어 대체 텍스트와 캡션을 사용한다.

- [x] **Step 2: 본문에서 파이프라인과 시퀀스의 역할을 구분한다**

파이프라인은 계산 단계, 시퀀스는 실행 중 참여자 사이의 호출 순서를 보여준다고 설명한다. Timefold Solver는 전체 배치를 담당하는 다음 편의 경계로만 언급한다.

### Task 3: 사이트 검증

**Files:**
- Verify: `src/content/docs/ko/blog/clinic-appointment-part3-clinic-specific-availability.mdx`
- Verify: `public/assets/clinic-appointment-part3-availability-sequence-02.svg`
- Verify: `public/assets/clinic-appointment-part3-availability-sequence-02.png`

- [x] **Step 1: 변경 형식과 빌드를 확인한다**

Run: `git diff --check && npm run build`

Expected: Astro 진단 0건, 전체 빌드 성공.

- [x] **Step 2: 로컬 경로와 자산을 확인한다**

Run: `curl` against the Part 3 page and sequence PNG on `http://127.0.0.1:4321`.

Expected: 페이지와 PNG 모두 HTTP 200, HTML에 한국어 확대 제목과 새 이미지 경로가 포함됨.
