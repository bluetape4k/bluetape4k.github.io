# Clinic Appointment Part 3 Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 병원별 운영시간과 의사·진료·장비 제약을 겹쳐 실제 예약 가능 시간을 계산하는 과정을 설명하는 한국어 Part 3 글을 작성하고 로컬 사이트에서 검증한다.

**Architecture:** 승인된 7편 시리즈 설계를 그대로 따르며, 현재 `clinic-appointment`의 `SlotCalculationService`, `TimeRange`, 슬롯 테스트, 장비 사용불가 설계를 사실의 최종 근거로 사용한다. 글은 전체 날짜 차단 → 유효 시간 범위 계산 → 시작 시각 후보 생성 → 후보별 수용 인원·장비 검사 순서로 설명하고, 어두운 파이프라인 다이어그램과 미니어처 작업대 대표 이미지를 제공한다.

**Tech Stack:** Astro Starlight, MDX, SVG/PNG, Kotlin/Exposed 소스 링크, GitHub Pages 로컬 개발 서버

---

### Task 1: Part 3 한국어 원고 작성

**Files:**
- Create: `src/content/docs/ko/blog/clinic-appointment-part3-clinic-specific-availability.mdx`

- [x] **Step 1: 독자 문제와 요구사항을 작성한다**

환자가 보는 “빈 시간”과 병원이 실제로 받을 수 있는 시간을 구분한다. 병원 운영시간, 공휴일 운영 여부, 전일·부분 휴진, 의사 근무와 부재, 진료 자격과 소요시간, 동시 수용 인원, 장비 수량과 사용불가 시간을 요구사항으로 설명한다.

- [x] **Step 2: 계산 파이프라인을 현재 구현 순서대로 설명한다**

전체 날짜를 막는 조건은 즉시 빈 목록을 반환하고, 병원과 의사의 시간 범위를 교차한 뒤 휴식시간·부분 휴진·의사 부재를 뺀다. 예약 시작 간격과 진료 소요시간을 구분해 후보를 만들고, 각 후보에서 기존 예약과 장비 충돌을 검사한다.

- [x] **Step 3: 구현과 테스트 근거를 짧게 연결한다**

`computeEffectiveRanges`, `SlotCalculationService`, `SlotQuery`, `AvailableSlot`의 핵심 코드만 인용한다. 23개 테스트 시나리오 중 대표적으로 점심시간, 부분 휴진, 의사 부재, 60분 진료, 공휴일 운영, 동시 수용 인원, 장비 수량·사용불가 사례를 업무 언어로 설명한다.

- [x] **Step 4: 추가 요구사항의 확장 과정을 작성한다**

초기 병원·의사 시간 계산에 장비 사용불가 요구가 들어오면서 데이터 모델, 슬롯 계산, 테스트, Solver 제약이 함께 확장됐음을 설명한다. Part 4의 실시간 단건 조회와 전체 일정 최적화의 차이로 연결한다.

- [x] **Step 5: 독자용 자료와 시리즈 링크를 추가한다**

내부 이슈·회고 목록은 제외하고 `appointment-core`, `SlotCalculationService`, `TimeRange`, `SlotController`, 장비 사용불가 서비스처럼 독자가 직접 탐색할 구현 진입점만 한국어 설명과 함께 제공한다.

### Task 2: Part 3 대표 이미지와 기술 다이어그램 제작

**Files:**
- Create: `public/assets/clinic-appointment-part3-hero.png`
- Create: `public/assets/clinic-appointment-part3-availability-pipeline-01.svg`
- Create: `public/assets/clinic-appointment-part3-availability-pipeline-01.png`

- [x] **Step 1: 대표 이미지를 생성한다**

Part 1·2와 같은 어두운 3D 미니어처 작업대에서 병원 운영시간, 의사, 장비, 예약 슬롯 레이어를 겹쳐 유효 슬롯을 골라내는 장면을 만든다. 이미지 안에 읽어야 하는 긴 문장은 넣지 않는다.

- [x] **Step 2: 어두운 기술 다이어그램을 작성한다**

왼쪽에는 전체 날짜 차단 조건, 가운데에는 시간 범위 교집합과 차감, 오른쪽에는 후보 슬롯과 수용 인원·장비 검사를 배치한다. `예약 시작 간격 30분`과 `진료 소요시간 60분`을 분리해 표시하고, 최종 예약 가능 슬롯만 초록색으로 강조한다.

- [x] **Step 3: 크게 보기 계약을 적용한다**

MDX에서 기술 다이어그램에만 `bt4k-architecture`와 한국어 `data-diagram-title`을 적용한다. 대표 이미지는 확대 대상에서 제외한다.

- [x] **Step 4: SVG와 PNG를 시각 검증한다**

Run: `xmllint --noout public/assets/clinic-appointment-part3-availability-pipeline-01.svg`

Expected: XML 오류 없음.

PNG를 원본 크기로 열어 글자 잘림, 카드·라벨 겹침, 연결선 침범, 낮은 대비가 없는지 확인한다.

### Task 3: 한국어 교정과 사이트 검증

**Files:**
- Modify: `src/content/docs/ko/blog/clinic-appointment-part3-clinic-specific-availability.mdx`

- [x] **Step 1: 자연스러운 한국어로 교정한다**

`slotDurationMinutes`는 “예약을 받는 시간 간격”, `defaultDurationMinutes`는 “진료 소요시간”, `maxConcurrentPatients`는 “최대 동시 진료 환자 수”, `openOnHolidays`는 “공휴일 운영 여부”로 구분한다. `slot`, `effective range`, `early return`은 처음 등장할 때 한국어 업무 의미를 먼저 설명한다.

- [x] **Step 2: 링크와 시리즈 연결을 확인한다**

Part 1·2 링크, Part 4 예고, GitHub 소스 링크, 이미지 경로가 실제 대상과 일치하는지 확인한다.

- [x] **Step 3: 사이트를 빌드한다**

Run: `git diff --check && npm run build`

Expected: Astro diagnostics 0 errors, 0 warnings, 0 hints; Part 3 정적 경로와 이미지 생성.

- [x] **Step 4: 로컬 개발 서버를 실행한다**

Run: `npm run dev -- --host 127.0.0.1`

Expected: `http://127.0.0.1:4321/ko/blog/clinic-appointment-part3-clinic-specific-availability/`에서 Part 3 글과 대표 이미지, 크게 보기 다이어그램이 표시된다.

### Task 4: 최종 확인

**Files:**
- Verify: `src/content/docs/ko/blog/clinic-appointment-part3-clinic-specific-availability.mdx`
- Verify: `public/assets/clinic-appointment-part3-hero.png`
- Verify: `public/assets/clinic-appointment-part3-availability-pipeline-01.svg`
- Verify: `public/assets/clinic-appointment-part3-availability-pipeline-01.png`

- [x] **Step 1: 작업 범위를 확인한다**

Run: `git status --short && git diff --check`

Expected: 계획 문서, Part 3 원고, Part 3 전용 이미지 외의 변경 없음.

- [x] **Step 2: 로컬 URL을 사용자에게 전달한다**

배포·커밋·영문 번역은 수행하지 않고, 한국어 Part 3 로컬 검토 주소와 변경 파일을 보고한다.
