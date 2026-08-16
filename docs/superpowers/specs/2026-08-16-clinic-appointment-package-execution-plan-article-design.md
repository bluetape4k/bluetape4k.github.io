# 패키지 상품의 실행 순서와 선택 조건을 방문 계획으로 고정하는 글 설계

## 목적

패키지 상품을 구성 항목 목록으로만 저장하면 구매 당시 선택 결과, 구성 상품 버전,
실행 순서와 방문 묶음 조건을 복원할 수 없다. 이 글은 피부과 패키지 사례를 따라가며
상품·구매 서비스가 확정한 `PackageExecutionSnapshot`을 예약 서비스가 어떻게
검증하고, 기존 `AppointmentPlan`의 새 불변 리비전으로 추가하는지 설명한다.

현재 구현과 승인된 설계는 문장 수준에서 구분한다. `PackageExecutionPlanner`가
검증하는 범위, `VisitPlanningEventHandler`가 리비전을 저장하는 범위, 후속 방문
후보와 확정 예약을 만드는 범위를 하나의 완료된 기능처럼 합쳐 쓰지 않는다.

## 독자와 서술 순서

- 병원 관계자: 선택형 피부관리 패키지를 구매했을 때 무엇이 계약으로 고정되고,
  무엇이 아직 예약되지 않았는지 이해한다.
- PO: 상품·구매 서비스와 예약 서비스가 선택 결과, 구성 상품 버전, 방문 조건을
  나누어 책임지는 경계를 확인한다.
- 개발자: `PackageExecutionSnapshot`, `PackageExecutionPlanner`,
  `PackageExecutionEvent`, `VisitPlanningEventHandler`와 관련 테스트를 근거로
  검증 순서와 저장 경계를 확인한다.

본문은 환자 A가 피부 진단 뒤 세 관리 항목 중 두 항목을 고르는 장면으로 시작한다.
`레이저 토닝`과 `진정 마스크 관리`를 선택한 실행 계약을 예로 들어 선택 수, 구성
상품 버전 근거, 항목 참조, 의존 관계, 순환 검증을 차례로 설명한다. 그다음
`사전 진단 → 리프팅 시술 + 진정 관리 → 사후 점검` 사례를 비교해 실행 간격과
방문 묶음 제약이 별도 축임을 보여 준다. 마지막에는 이벤트 재생, 버전 누락,
충돌과 원자적 리비전 저장을 현재 처리 흐름에 맞춰 설명한다.

## 핵심 주장

1. `PackageExecutionSnapshot`은 예약 서비스가 상품 의미를 다시 계산하기 위한
   재료가 아니다. 구매 시점에 선택과 반복을 전개하고 정확한 구성 상품 버전을
   고정한 실행 계약이다.
2. `PackageExecutionPlanner`는 수량과 전체 크기, 구성 상품 버전의 유일성,
   진료 항목의 근거 이력, 선택군의 정확한 선택 수, 관계의 참조 유효성과 실행
   의존성 순환을 검증한다.
3. 검증이 끝나면 planner는 항목과 실행 의존성, 방문 묶음 제약을
   `AppointmentPlanRevisionDraft`로 복사한다. 방문 날짜나 확정 예약을 만들지
   않는다.
4. `PurchaseCompletedHandler`는 구매 완료 사실로 `AppointmentPlan`을 만든다.
   패키지 실행 계획은 별도의 `PackageExecutionEvent`가 도착했을 때
   `VisitPlanningEventHandler`가 기존 Plan에 새 리비전으로 추가한다.
5. 같은 원본 버전과 같은 페이로드 해시는 중복으로 수렴한다. 같은 버전의 다른
   해시, 순서가 앞선 이벤트, Plan 또는 상품 버전 불일치는 정상 처리로 위장하지
   않고 충돌·격리·`WAITING_GAP` 경계에 남긴다.
6. 리비전, 하위 항목과 관계, 인박스 처리 결과, 아웃박스(outbox)는 한 트랜잭션
   경계에서 함께 저장한다.

## 시나리오

### 본문 흐름: 맞춤 피부관리 2종 선택권

승인된 상품 구성 보조 자료의 선택형 사례를 사용한다.

| 구성 항목 | 구성 방식 | 환자 A의 선택 | 실행 조건 |
| --- | --- | --- | --- |
| 피부 진단 v2 | 필수 | 포함 | 첫 방문에서 수행 |
| 레이저 토닝 v8 | 3개 중 2개 선택 | 선택 | 피부 진단 완료 후 진행 |
| 수분 집중관리 v5 | 3개 중 2개 선택 | 미선택 | 같은 방문 가능 |
| 진정 마스크 관리 v4 | 3개 중 2개 선택 | 선택 | 레이저 시술과 같은 방문 가능 |

이 사례는 선택군이 요구한 개수를 정확히 골랐는지, 선택된 구성 상품 버전과 각
진료 항목의 근거 이력이 일치하는지 설명하는 본문 축으로 사용한다. 실제 구현
테스트의 미백·필링 fixture와 이름이 다르다는 점을 숨기지 않는다. 업무 사례는
승인된 설계 보조 자료에서 가져오고, 검증 동작은 현재 모델과 테스트에서 확인한다.

### 비교표: 리프팅 집중관리 패키지

| 항목 | 실행 의존성 | 방문 묶음 조건 |
| --- | --- | --- |
| 사전 진단 v3 | 없음 | 별도 방문 |
| 리프팅 시술 v5 | 진단 완료 후 3~14일 | 진정 관리와 같은 방문 가능 |
| 진정 관리 v4 | 리프팅 시술과 자원 양립 필요 | `MAY_SAME_VISIT` |
| 사후 점검 v2 | 시술 완료 후 7일 | `MUST_SEPARATE_VISIT` |

이 표는 실행 순서와 방문 묶음이 다른 판단 축이라는 사실만 설명한다. 현재
`PackageExecutionPlanner`가 위 사례를 세 방문으로 확정한다고 쓰지 않는다.
Planner는 관계를 Plan 리비전에 보존하고, 실제 방문 후보 계산과 확정 예약은
후속 단계가 담당한다.

## 글의 구성

1. 피부과 패키지에서 선택 결과를 나중에 다시 계산하면 생기는 문제
2. 구매 서비스가 고정해 보내는 `PackageExecutionSnapshot`
3. 예약 서비스가 수행하는 다섯 검증: 수량, 선택, 근거 이력, 관계, 순환
4. 실행 의존성과 방문 묶음 조건을 분리해야 하는 이유
5. `AppointmentPlanRevisionDraft`로 복사하는 경계
6. 구매 완료 이벤트와 패키지 실행 이벤트가 나뉘는 이유
7. 중복, 충돌, 버전 누락과 트랜잭션 저장
8. 현재 구현, 승인된 설계, 운영 검증 대기 범위
9. 다음 운영 확장 글로 이어지는 시리즈 연결

짧은 Kotlin 코드는 `PackageExecutionPlanner.plan()`의 검증 순서와 draft 생성
부분을 중심으로 사용한다. 전체 handler 코드를 복사하지 않고, 이벤트 처리 결과는
표와 도표로 설명한 뒤 원본 소스 링크를 제공한다.

## 시각 자료

### Hero

기존 병원 예약 시리즈의 밝은 3D 미니어처 작업대와 흰색·파란색 로봇 스타일을
유지한다. 레이저 장비, 피부 진단 카드, 선택된 두 관리 항목, 검증 체크와 Plan
리비전 카드를 한 장면에 배치한다. 설계 4·5의 상품 그래프 및 BOM 번역 hero와
구도가 겹치지 않도록, 이번 hero는 왼쪽의 치료 선택 카드와 오른쪽의 리비전 기록
작업을 중심으로 구성한다. Hero에는 읽어야 하는 작은 글자를 넣지 않는다.

### 도표 1: 선택 결과가 Plan 리비전이 되는 과정

- 입력: 피부 진단, 레이저 토닝, 진정 마스크 관리가 선택된 실행 계약
- 중앙: 수량, 선택, 근거 이력, 관계, 순환의 다섯 검증
- 출력: `PlannedTreatment`, `ExecutionDependency`,
  `VisitGroupingConstraint`가 포함된 새 Plan 리비전
- 하단 비교: 리프팅 시술과 진정 관리의 `MAY_SAME_VISIT`, 사후 점검의
  `MUST_SEPARATE_VISIT`
- 구현 경계: 방문 후보나 확정 예약을 출력하지 않는다는 주석

### 도표 2: 별도 이벤트와 원자적 저장

- `PurchaseCompletedHandler`는 기존 `AppointmentPlan`을 만든다.
- `PackageExecutionEvent`는 `VisitPlanningEventHandler`로 들어온다.
- handler는 Plan·상품 버전, 원본 버전과 페이로드 해시를 확인한다.
- planner 검증을 통과하면 리비전과 하위 그래프, 인박스, 아웃박스(outbox)를
  같은 트랜잭션으로 저장한다.
- 중복은 `DUPLICATE`, 버전 누락은 `WAITING_GAP`, 충돌은 격리 결과로 끝난다.

두 도표는 SVG 원본과 2배 PNG를 함께 만들고 한국어·영어 자산을 분리한다. 모든
연결선은 카드 경계에 수직으로 닿고, 굽은 선은 충분한 길이의 둥근 직각 경로를
사용한다. 화살촉은 연결선과 같은 색을 쓰며, sequence call line과 label은 겹치지
않게 별도 세로 공간을 확보한다. 도표 위·아래 여백과 카드 사이 간격을 시리즈의
최근 도표 수준으로 맞춘다.

## 공개 경계

- 본문에 특정 소스 커밋을 대조해 작성했다는 메타 설명을 넣지 않는다.
- 환자·병원 식별 정보와 실제 내부 운영 임계값을 공개하지 않는다.
- 코드에 정의된 기본 안전 상한을 설명할 때는 의미와 실패 방식을 중심으로 쓰고,
  공개할 필요가 없는 운영 설정값은 나열하지 않는다.
- 업무 사례와 현재 테스트 fixture가 다르면 각각의 출처를 구분한다.
- `MAY_SAME_VISIT`를 같은 방문 확정으로, Plan 리비전 생성을 예약 확정으로
  표현하지 않는다.
- 한국어 원문을 먼저 작성하고 영어 글은 같은 주장, 표, 도표, 링크와 시리즈 순서를
  유지한다.

## 근거표

| 주장 | 현재 근거 | 공개 방식 |
| --- | --- | --- |
| 실행 계약의 모델 | `PackageExecutionSnapshot.kt` | 구성 표와 필드 설명 |
| 다섯 검증과 draft 복사 | `PackageExecutionPlanner.kt`, `PackageExecutionPlannerTest.kt` | 짧은 코드와 실패 표 |
| 패키지 실행 이벤트 | `PackageExecutionEvent.kt` | 이벤트 입력 도표 |
| 기존 Plan 조회와 새 리비전 추가 | `VisitPlanningEventHandler.kt`, handler 테스트 | 처리 흐름 도표 |
| 중복·충돌·버전 누락 | handler의 원본 버전·해시 분기와 테스트 | 결과 표 |
| 피부관리·리프팅 업무 사례 | Issue #184의 승인된 설계와 시각 보조 자료 | 본문 사례와 비교표 |
| 구매 완료와 실행 계획의 분리 | `PurchaseCompletedHandler.kt`와 `VisitPlanningEventHandler.kt` | 두 이벤트 경계 설명 |

기준 소스는 `clinic-appointment` `develop`의
`d1718331f1d418baf455d8046ad6cfc2e1567460`이며, 본문 작성과 최종 교정 전에
최신 `develop`과 다시 대조한다.

## 대상 파일과 경로

- 한국어 글: `src/content/docs/ko/blog/clinic-appointment-package-execution-plan.mdx`
- 영어 글: `src/content/docs/blog/clinic-appointment-package-execution-plan.mdx`
- series registry: `src/data/clinic-appointment-series.mjs`
- series test: `tests/ecosystem/clinic-appointment-series.test.mjs`
- 공통 hero: `public/assets/clinic-appointment-package-execution-plan-hero.png`
- 도표 1: `public/assets/clinic-appointment-package-execution-plan-01-{ko,en}.{svg,png}`
- 도표 2: `public/assets/clinic-appointment-package-execution-plan-02-{ko,en}.{svg,png}`
- 도표 생성기: `scripts/generate-clinic-appointment-package-execution-plan-diagrams.mjs`

시리즈 탐색에서는 구현 8 다음, 운영 확장 1.1 앞에 구현 9를 추가한다. 두 언어 제목은
각각 `[구현 9] 패키지 상품의 실행 순서와 선택 조건을 방문 계획으로 고정하는 방법`,
`[Implementation 9] Freezing Package Choices and Execution Order into a Visit Plan`으로
한다.

## 검증

- 설계의 모든 현재 동작 주장에 소스 또는 테스트 근거 연결
- 한국어·영어 제목, slug, 섹션, 표, 링크, 그림과 시리즈 순서 대조
- 설계 사례와 현재 구현 fixture를 섞어 쓴 문장 검색
- `MAY_SAME_VISIT`, Plan 리비전, 방문 후보, 확정 예약의 경계 검색
- `git diff --check`
- series registry 대상 테스트
- `npm run build`
- 두 언어 route와 모든 `/assets/...` 응답 확인
- SVG semantic ledger, connector·arrowhead·label geometry, PNG 원본 크기 검사
- 다크·라이트 모드와 본문 크게 보기 확인
- 로컬 preview에서 두 글을 처음부터 끝까지 읽고 한국어 기술문서 최종 교정

## 완료 기준

- [ ] 한국어와 영어 글이 같은 기술 사실과 순서로 발행 준비 상태다.
- [ ] 피부과 선택형 사례가 선택 수와 구성 상품 버전 검증을 자연스럽게 설명한다.
- [ ] `PurchaseCompletedHandler`와 `VisitPlanningEventHandler`의 책임을 정확히 구분한다.
- [ ] planner가 방문 일정이나 확정 예약을 만든다고 오해할 문장이 없다.
- [ ] hero와 두 도표가 기존 시리즈 스타일을 따르며 다른 글의 시각 자료와 겹치지 않는다.
- [ ] 모든 다이어그램의 연결선, 화살촉, label, 간격과 확대 보기가 검증된다.
- [ ] build, 두 언어 경로, 자산, 시리즈 링크 검증이 통과한다.
- [ ] PR 생성과 배포는 별도 승인을 받기 전에는 수행하지 않는다.

## 관련 작업

- [Clinic Appointment Epic #275](https://github.com/bluetape4k/clinic-appointment/issues/275)
- [구현 9 Issue #343](https://github.com/bluetape4k/clinic-appointment/issues/343)
- [설계 4: 패키지 상품은 왜 실행 그래프가 필요한가](https://bluetape4k.github.io/ko/blog/clinic-appointment-package-product-execution-graph/)
- [설계 5: 상품 BOM은 어떻게 AppointmentPlan과 방문으로 번역되는가](https://bluetape4k.github.io/ko/blog/clinic-appointment-execution-bom-to-appointment-plan/)
- [구현 8: N회 상품 구매를 방문 계획으로 펼치는 방법](https://bluetape4k.github.io/ko/blog/clinic-appointment-n-visit-purchase-plan/)
