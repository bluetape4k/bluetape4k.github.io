# clinic-appointment 개발 과정 블로그 시리즈 설계

## 상태

- 작성일: 2026-07-18
- 대상 저장소: `bluetape4k/clinic-appointment`와 `bluetape4k/bluetape4k.github.io`
- 시리즈 길이: 7편
- 언어: 한국어 원문 우선, 한국어 승인 후 대응 영문 작성
- 승인된 방향: 개발 과정 중심 구성
- 현재 단계: dark diagram 재제작 조건을 포함한 설계 승인, Part 1 작성 진행 중

## 목표

`clinic-appointment`의 완성된 기능을 나열하는 데서 끝나지 않고, 병원 예약 SaaS의 요구사항이 설계, 계획, 구현, 리뷰를 거쳐 다시 다음 요구사항으로 발전하는 과정을 설명한다.

시리즈 전체의 독자는 특정 프레임워크 사용법만 찾는 개발자로 한정하지 않는다. 요구사항을 코드로 옮기고, 리뷰 결과를 다음 설계 입력으로 되돌리는 개발 과정을 학습하려는 개발자 전반을 대상으로 한다. 각 편은 상태 관리, 예약 가능 시간 계산, Timefold Constraint Solver, 재배정처럼 해당 주제에 관심 있는 독자가 독립적으로 읽을 수 있어야 한다.

## 핵심 관점

병원 예약 SaaS는 단순한 일정 CRUD가 아니다. 예약 한 건은 아래 계층과 규칙에 묶인다.

```text
TenantGroup
└─ Clinic
   ├─ OperatingHours / BreakTime / Closure / Holiday
   ├─ Doctor / Schedule / Absence
   ├─ TreatmentType
   ├─ Equipment / Unavailability
   └─ Appointment / StateHistory / RescheduleCandidate
```

이 계층은 시리즈에서 세 가지 서로 다른 질문으로 나누어 다룬다.

1. **업무 모델:** 병원마다 다른 업무시간, 의사, 진료 유형, 장비를 어떻게 표현하는가.
2. **스케줄링:** 한 병원의 자원과 제약으로 예약 가능한 시간과 전체 배치를 어떻게 계산하는가.
3. **SaaS 격리:** 다른 tenant의 병원과 자원을 보거나 변경하지 못하게 어떻게 막는가.

업무 모델과 tenant 보안을 같은 문제로 섞지 않는다. Part 3과 Part 5는 올바른 일정 계산을, Part 7은 데이터 격리와 운영 경계를 다룬다.

## 독자 계약

### 시리즈 전체 독자

- 요구사항에서 구현까지 이어지는 개발 과정을 배우려는 초·중급 개발자
- 코드 리뷰와 후속 요구사항이 설계를 어떻게 바꾸는지 알고 싶은 개발자
- Kotlin/Spring/Exposed 기반 서비스의 모듈 경계를 보고 싶은 백엔드 개발자
- 업무 규칙을 상태 머신이나 제약 최적화 모델로 바꾸는 방법을 배우려는 개발자

### 편별 독립성

각 글은 앞선 편을 읽지 않아도 중심 질문과 용어를 이해할 수 있어야 한다. 앞선 편은 맥락을 보강하는 링크로만 사용한다. 시리즈 전체 목차를 매번 반복하지 않고, 현재 편에 필요한 이전 결정과 다음 질문만 연결한다.

### 업무 용어와 코드 식별자

한국어 본문에서 업무 개념을 설명할 때는 코드 식별자를 그대로 노출하지 않는다. 예를 들어 `slotDurationMinutes`, `timezone`, `maxConcurrentPatients`, `openOnHolidays`는 각각 “예약을 받는 시간 간격”, “운영 기준 시간대”, “최대 동시 진료 환자 수”, “공휴일 운영 여부”로 쓴다. 실제 구현과 연결하는 코드 블록이나 소스 코드 설명에서만 식별자를 병기한다. 특히 예약을 받는 시간 간격과 진료 한 건의 소요 시간을 혼동하지 않는다.

## 공통 서술 구조

모든 편은 다음 흐름을 기본 골격으로 사용한다.

1. **업무 시나리오:** 병원 직원, 환자, 관리자에게 어떤 문제가 생겼는가.
2. **요구사항:** 처음 요구한 동작과 성공 조건은 무엇인가.
3. **설계와 선택지:** 어떤 대안을 비교했고 왜 현재 경계를 선택했는가.
4. **계획:** 구현을 어떤 순서와 모듈 경계로 나눴는가.
5. **구현:** 현재 소스에서 결정을 가장 잘 보여 주는 짧은 코드와 데이터 흐름.
6. **테스트와 리뷰:** 어떤 실패를 막았고 리뷰가 무엇을 새로 발견했는가.
7. **다음 요구사항:** 구현 뒤에 생긴 새 업무 또는 운영 요구가 다음 편으로 어떻게 이어지는가.

이 골격을 기계적으로 같은 제목으로 반복하지 않는다. 각 편은 자연스러운 기술 글로 읽혀야 하지만, 독자는 글을 다 읽은 뒤 위 개발 흐름을 재구성할 수 있어야 한다.

## 근거와 사실 판정

### 자료별 역할

| 자료 | 시리즈에서의 역할 |
| --- | --- |
| 루트와 모듈 `README` | 저장소의 현재 진입점, 대표 기능, 모듈 책임 |
| `docs/requirements` | 사용자 시나리오, 업무 규칙, 상태와 데이터 흐름 |
| `docs/superpowers/specs` | 선택지, 설계 결정, 범위와 비목표 |
| `docs/superpowers/plans` | 구현 순서, 검증 단계, 작업 분해 |
| Kotlin 구현과 테스트 | 현재 동작의 최종 근거 |
| `docs/lessons` | 구현과 리뷰에서 발견한 결함, 복구, 후속 요구사항 |
| GitHub issue/PR | 공개된 요구사항과 리뷰의 시점·맥락을 보강하는 근거 |

### 충돌 시 우선순위

현재 동작을 설명할 때는 구현과 테스트를 최종 근거로 삼는다. requirements와 spec은 당시의 요구와 설계 의도를 설명하는 데 사용한다. 과거 문서와 현재 구현이 다르면 차이를 숨기지 않고 “초기 설계 → 리뷰/추가 요구 → 현재 구현”의 변화로 설명한다.

현재 확인된 주의 지점은 다음과 같다.

| 지점 | 처리 원칙 |
| --- | --- |
| 일부 데이터 흐름 문서의 `Hard 11 + Soft 2` 표기 | 현재 `AppointmentConstraintProvider`의 12개 Hard stream과 6개 Soft constraint를 사용한다. H4가 `H4a`와 `H4b`로 나뉘어 번호는 H1~H11로 보인다는 점을 설명한다. |
| requirements index의 멀티테넌시 backlog | 현재 tenant 관련 소스와 테스트가 있으므로 Part 7에서 “backlog였던 요구가 구현으로 들어온 과정”으로 다룬다. |
| README와 requirements의 프런트엔드 버전 차이 | 글 작성 시 `package.json`을 다시 확인하고, 기술적으로 필요하지 않으면 버전 숫자를 전면에 내세우지 않는다. |
| 엔티티 개수 표기의 차이 | 고정 개수를 홍보 문구로 사용하지 않고, 주제에 필요한 대표 엔티티와 관계를 설명한다. |
| benchmark 결과 | 실행일, 환경, time limit, score 방향, 적용 범위를 함께 적고 일반적인 운영 성능으로 확대 해석하지 않는다. |

## 시리즈 구성

### Part 1. 병원 예약은 CRUD로 끝나지 않는다

**중심 질문:** 예약 생성·조회·수정·삭제만으로 병원 업무를 표현할 수 없는 이유는 무엇인가.

**주요 독자:** 서비스 개발자 전반, 도메인 설계 입문자.

**핵심 내용:**

- 환자 예약, 직원의 체크인과 진료 완료, 관리자의 휴진·장비 관리라는 대표 사용자 시나리오
- `TenantGroup → Clinic → Doctor/TreatmentType/Equipment → Appointment` 계층
- `appointment-core`, `event`, `solver`, `notification`, `api`, frontend의 역할 분리
- 실시간 슬롯 조회, 상태 전이, 재배정, 최적화, 알림이 한 서비스 안에서 만나는 이유
- README는 진입점, requirements는 업무 계약, spec/plan은 결정 기록, 구현/테스트는 현재 사실이라는 문서 체계

**개발 과정 초점:** 초기 독립 저장소 요구와 living documentation 설계가 이후 기능 개발의 기준이 된 과정.

**대표 근거:**

- `README.md`, `README.ko.md`
- `docs/requirements/README.md`
- `docs/requirements/architecture.md`
- `docs/requirements/user-scenarios.md`
- `docs/superpowers/specs/2026-03-30-living-docs-design.md`

**다음 편 연결:** 여러 기능 중 가장 먼저 계약으로 고정해야 하는 예약 상태로 내려간다.

### Part 2. 예약 상태는 enum이 아니다

**중심 질문:** 예약의 현재 상태뿐 아니라 허용된 변화와 그 이유를 어떻게 관리할 것인가.

**주요 독자:** 도메인 모델링, API, 감사 이력에 관심 있는 개발자.

**핵심 내용:**

- `PENDING`부터 `COMPLETED`, `NO_SHOW`, `PENDING_RESCHEDULE`, `RESCHEDULED`, `CANCELLED`까지의 업무 의미
- 상태와 이벤트를 분리한 `AppointmentStateMachine`
- 허용되지 않은 전이를 409로 거부하는 API 계약
- `AppointmentStateHistory`로 변경 전후 상태, 사유, 변경자를 남기는 이유
- 취소 사유가 controller, state event, history, domain event를 같은 값으로 통과해야 하는 이유
- `CONFIRMED` 이후 일부 상태를 Solver에서 pinned로 고정하는 연결점

**개발 과정 초점:** 상태 변경 API 구현 뒤 리뷰에서 상태 이력 endpoint와 취소 사유 누락이 발견되어 요구사항이 확장된 과정.

**대표 근거:**

- `docs/requirements/domain-model.md`
- `AppointmentState.kt`, `AppointmentStateMachine.kt`
- `AppointmentService`, `AppointmentStateHistoryRepository`
- `docs/lessons/2026-05-18-issue-95-state-history-endpoint.md`
- `docs/lessons/2026-05-18-issue-96-cancel-reason.md`
- GitHub Issue #95와 #96의 요구사항·결함 기록

**다음 편 연결:** 유효한 상태 전이만으로는 예약을 만들 수 없으므로, 실제로 가능한 시간을 계산하는 문제로 이동한다.

### Part 3. 병원마다 다른 업무시간과 자원으로 예약 가능 시간을 계산하기

**중심 질문:** 비어 있는 시간이 아니라 실제로 예약 가능한 시간을 어떻게 계산할 것인가.

**주요 독자:** 예약, 캘린더, 자원 스케줄링 기능을 만드는 개발자.

**핵심 내용:**

- 병원별 영업시간, 휴식시간, 공휴일 운영 여부, 전일·부분 휴진
- 의사별 진료 자격, 근무 스케줄, 전일·부분 부재, 동시 환자 수
- 진료 유형별 소요시간, 필요한 provider type, 장비 요구
- 장비별 수량, 사용 중인 예약, 유지보수·고장으로 인한 사용불가 시간
- `TimeRange` 교집합과 차감으로 effective range를 만든 뒤 slot 간격으로 후보를 생성하는 흐름
- 값싼 전역 차단을 먼저 적용하고, 후보별 충돌 검사를 뒤에서 수행하는 early-return 파이프라인
- 예약 한 건을 빠르게 응답하기 위한 Greedy 계산의 장점과 한계

**개발 과정 초점:** 초기 의사·병원 시간 제약에 장비 사용불가 요구가 추가되면서 데이터 모델, 슬롯 계산, API, Solver가 함께 바뀐 과정.

**대표 근거:**

- `SlotCalculationService.kt`
- `TimeRange`, `SlotQuery`, `AvailableSlot`
- `docs/requirements/data-flow.md`
- `docs/superpowers/specs/2026-03-30-equipment-schedule-design.md`
- `SlotCalculationServiceTest`, `EquipmentUnavailabilityServiceTest`

**다음 편 연결:** 한 건의 가능한 슬롯을 찾는 것과 여러 예약을 동시에 더 좋은 배치로 옮기는 것은 다른 문제임을 제시한다.

### Part 4. 한 건의 슬롯 조회와 전체 일정 최적화는 다르다

**중심 질문:** Greedy 계산과 Constraint Solver의 경계를 어디에 둘 것인가.

**주요 독자:** 스케줄링 아키텍처와 최적화 도입 여부를 판단하는 개발자.

**핵심 내용:**

- 환자 화면의 실시간 응답과 관리자의 일괄 재배치가 요구하는 latency·품질 차이
- `SlotCalculationService`와 `SolverService`를 공존시킨 ADR-4
- Greedy는 한 요청의 첫 번째 가능한 답을 빠르게 찾고, Solver는 여러 예약을 한 번에 비교한다는 차이
- 임시휴진 재배정에서 Greedy 후보 생성과 전역 최적화가 각각 맡을 수 있는 역할
- 모든 스케줄링 문제에 Solver를 넣지 않는 선택 기준

**개발 과정 초점:** 비슷해 보이는 두 기능을 하나의 서비스로 합치지 않고 호출 시점과 최적화 범위로 분리한 설계 결정.

**대표 근거:**

- `docs/requirements/architecture.md` ADR-4
- `SlotCalculationService.kt`
- `SolverService.kt`
- `ClosureRescheduleService.kt`
- `docs/requirements/solver.md`

**다음 편 연결:** Solver를 선택한 뒤 업무 문장을 planning model과 constraint로 번역하는 실제 작업으로 들어간다.

### Part 5. 병원 업무 규칙을 Timefold Constraint로 번역하기

**중심 질문:** 무엇을 절대 위반할 수 없는 Hard Constraint로 두고, 무엇을 더 좋은 일정의 Soft Constraint로 둘 것인가.

**주요 독자:** Timefold, Constraint Streams, 조합 최적화에 관심 있는 개발자.

**핵심 내용:**

- `AppointmentPlanning`의 `doctorId`, `appointmentDate`, `startTime` Planning Variable
- 병원, 의사, 진료, 영업시간, 부재, 휴진, 장비를 Problem Fact로 변환하는 방법
- 병원 영업시간, 의사 스케줄, 소속, provider type, 동시 환자, 장비 수량·사용불가를 Hard로 두는 이유
- 담당의 유지, 요청일 근접, 이른 슬롯, 부하 분산, gap 최소화, 장비 활용을 Soft로 두는 이유
- 이미 확정·진행된 예약을 `@PlanningPin`으로 보호하는 이유
- Hard feasibility를 먼저 확인하고 Soft score를 업무 우선순위로 읽는 방법
- Constraint Verifier와 benchmark를 함께 사용하되 benchmark를 운영 성능으로 과장하지 않는 법

**개발 과정 초점:** 요구사항 표를 그대로 코드로 옮기지 않고 Planning Entity, Fact, Hard/Soft 경계, 가중치, 테스트로 나누어 검증한 과정.

**대표 근거:**

- `AppointmentPlanning.kt`, `ScheduleSolution`
- `AppointmentConstraintProvider.kt`
- `HardConstraints.kt`, `SoftConstraints.kt`
- `ConstraintVerifierTest.kt`
- `docs/solver-benchmark-report.md`
- `docs/lessons/2026-05-20-timefold-solver-2-consumer.md`

**다음 편 연결:** 정상 예약을 잘 배치하는 것보다 휴진과 장비 고장 뒤에 기존 예약을 안전하게 옮기는 일이 더 복합적임을 보여 준다.

### Part 6. 휴진과 장비 고장은 예약 설계를 어떻게 바꾸는가

**중심 질문:** 운영 중 새 제약이 발생했을 때 기존 예약을 어떤 상태와 절차로 재배정할 것인가.

**주요 독자:** 변경 요구사항, 배치 처리, 보상 흐름을 설계하는 개발자.

**핵심 내용:**

- 휴진 날짜의 `REQUESTED`·`CONFIRMED` 예약을 `PENDING_RESCHEDULE`로 전환하는 이유
- 상태 이력을 먼저 남기고 후보를 탐색하는 흐름
- 원본 예약과 새 예약을 구분하고 `RESCHEDULED`로 종결하는 모델
- 장비 사용불가 요구의 Phase 1 충돌 감지, Phase 2 후보 생성, Phase 3 자동 재배정 확장 방향
- 한 예약씩 transaction을 끝낸 뒤 SSE progress callback을 호출해 DB connection을 오래 잡지 않는 이유
- Greedy 후보 목록과 Solver의 전역 배치를 조합할 때 필요한 저장·승인 경계

**개발 과정 초점:** “장비 점검 시간을 등록한다”는 작은 요구가 데이터 모델, 반복 규칙, 슬롯 계산, Solver constraint, API, 재배정으로 확장된 과정.

**대표 근거:**

- `ClosureRescheduleService.kt`
- `EquipmentUnavailabilityService.kt`
- `docs/superpowers/specs/2026-03-30-equipment-schedule-design.md`
- `docs/requirements/user-scenarios.md`
- `docs/lessons/2026-05-19-sse-batch-stream-transaction-pattern.md`

**다음 편 연결:** 기능이 동작한 뒤에도 tenant 격리, 알림 중복, DB 호환성, dependency migration 같은 운영 요구가 남는다는 점으로 이어진다.

### Part 7. 완성 뒤가 진짜 시작이다

**중심 질문:** 코드 리뷰와 운영 요구사항을 어떻게 다음 개발 주기의 입력으로 바꿀 것인가.

**주요 독자:** 서비스 운영, 보안 경계, 진화 가능한 설계에 관심 있는 개발자와 팀 리드.

**핵심 내용:**

- 상태 이력 endpoint, 취소 사유, pagination·validation·OpenAPI 보강처럼 리뷰가 만든 작은 후속 요구
- `tenantCode`와 JWT `allowedTenants`, `findByIdAndTenant()`가 병원별 설정과 별개로 지키는 SaaS 격리
- `TenantGroup → Clinic` 직접 소유와 자식 자원의 clinic 경유 소유 모델
- 이벤트를 발행하는 API와 이를 구독하는 알림 모듈을 분리한 이유
- Redis leader election으로 다중 인스턴스 리마인더 중복을 막고 Resilience4j로 외부 채널 실패를 격리하는 방법
- H2, PostgreSQL, MySQL에서 Flyway와 repository 동작을 확인하게 된 배경
- Timefold 2 migration과 benchmark baseline처럼 dependency 변경과 성능 회귀를 지속적으로 확인하는 작업
- requirements, spec, plan, lessons를 살아 있는 개발 기록으로 유지하는 방법

**개발 과정 초점:** 완료를 종점으로 보지 않고 리뷰, 운영, dependency 변화에서 새 요구를 수집해 다시 요구사항과 설계로 돌리는 순환.

**대표 근거:**

- `docs/superpowers/specs/2026-05-19-multitenancy-design.md`
- GitHub EPIC #16의 병원 그룹 데이터 격리 요구사항
- tenant filter, authorization manager, tenant-scoped repository tests
- `docs/requirements/notification.md`
- `AppointmentReminderScheduler`, `ResilientNotificationChannel`
- Multi-DB/Virtual Threads spec과 관련 테스트
- state history, cancel reason, multitenancy, Timefold migration lessons

**시리즈 결론:** 좋은 예약 서비스는 제약을 많이 가진 서비스가 아니라, 새 제약이 들어왔을 때 어느 경계를 바꾸고 무엇을 다시 검증해야 하는지 설명할 수 있는 서비스다.

## SaaS 관점의 편별 반복

| 관점 | Part 1 | Part 3 | Part 5 | Part 7 |
| --- | --- | --- | --- | --- |
| 병원별 업무시간 | 도메인 계층 소개 | effective range 계산 | 운영시간 Hard Constraint | tenant별 설정 접근 격리 |
| 병원별 의사 | Clinic 소속 자원 | 자격·근무·부재 확인 | provider type·소속·부하 Constraint | 다른 tenant 의사 ID enumeration 차단 |
| 병원별 장비 | Clinic 소속 자원 | 수량·예약 점유·사용불가 확인 | 가용성·사용불가 Hard Constraint | 다른 tenant 장비 접근 차단 |
| 여러 병원의 SaaS 운영 | TenantGroup과 Clinic 구분 | clinic 단위 실시간 계산 | clinic 단위 planning facts | JWT, tenant path, repository JOIN guard |

같은 사실을 반복 설명하지 않는다. Part 1은 지도를, Part 3은 실시간 계산을, Part 5는 최적화 모델을, Part 7은 보안과 운영 경계를 책임진다.

## 경로와 제목 계약

한글과 영문은 동일 slug를 사용한다.

| Part | 파일 slug | 한국어 제목 | 영어 제목 방향 |
| --- | --- | --- | --- |
| 1 | `clinic-appointment-part1-not-just-crud` | 병원 예약은 CRUD로 끝나지 않는다 | Clinic Appointments Are More Than CRUD |
| 2 | `clinic-appointment-part2-state-machine-and-history` | 예약 상태는 enum이 아니다 | Appointment State Is More Than an Enum |
| 3 | `clinic-appointment-part3-clinic-specific-availability` | 병원마다 다른 업무시간과 자원으로 예약 가능 시간을 계산하기 | Computing Availability from Clinic-Specific Hours and Resources |
| 4 | `clinic-appointment-part4-greedy-vs-global-optimization` | 한 건의 슬롯 조회와 전체 일정 최적화는 다르다 | Real-Time Slot Search and Global Optimization Solve Different Problems |
| 5 | `clinic-appointment-part5-timefold-constraints` | 병원 업무 규칙을 Timefold Constraint로 번역하기 | Translating Clinic Rules into Timefold Constraints |
| 6 | `clinic-appointment-part6-closure-equipment-rescheduling` | 휴진과 장비 고장은 예약 설계를 어떻게 바꾸는가 | Rescheduling after Clinic Closures and Equipment Downtime |
| 7 | `clinic-appointment-part7-review-and-operational-evolution` | 완성 뒤가 진짜 시작이다 | Reviews and Operations Start the Next Development Cycle |

예상 route는 `/ko/blog/{slug}/`와 `/blog/{slug}/`이다. 실제 작성 단계에서 기존 route와 충돌하지 않는지 다시 확인한다.

## 시각 자료 설계

각 편은 같은 시리즈로 인식되는 hero를 사용하되, 본문 도식은 이해 비용을 실제로 줄일 때만 사용한다.

| Part | Hero 장면 | 본문 시각 자료 |
| --- | --- | --- |
| 1 | 병원 예약 작업대를 조립하는 작은 로봇 작업자 | SaaS 도메인 계층과 모듈 지도 |
| 2 | 상태 보드와 이력 장부를 연결하는 작업대 | 상태 머신과 history write 흐름 |
| 3 | 병원 시간표, 의사, 장비를 대조하는 작업대 | 가용 슬롯 constraint pipeline |
| 4 | 빠른 단건 경로와 전역 최적화 경로를 나눈 작업대 | Greedy와 Solver 선택 지도 |
| 5 | Constraint 카드를 Hard와 Soft로 분류하는 작업대 | Planning Entity/Fact/Constraint 구조와 benchmark chart |
| 6 | 휴진 표지와 점검 중 장비에서 예약을 옮기는 작업대 | 재배정 상태·데이터 흐름 |
| 7 | 리뷰 카드가 다음 요구사항 보드로 돌아가는 작업대 | 요구사항 순환과 tenant/알림 운영 경계 |

Hero는 기존 사이트의 polished 3D miniature workbench 언어를 따른다. 평면 diagram이나 icon sheet를 hero로 대체하지 않는다. Dark diagram은 본문에서 구조, 흐름, 상태 전이, 제약 관계를 설명하는 역할에 집중한다.

### README와 requirements diagram 재사용 계약

`clinic-appointment`의 README와 requirements 문서에 사용된 Mermaid, SVG, PNG diagram은 **의미와 구조를 확인하는 reference**이지, 블로그에 그대로 삽입할 최종 asset이 아니다. 같은 diagram을 블로그에서 사용하더라도 다음 계약에 따라 별도의 dark style SVG와 PNG로 다시 만든다.

- 현재 README·requirements 문서와 실제 구현 source를 함께 읽고 node, edge, cardinality, 상태 전이, 분기, label의 의미를 보존한다. 오래된 rendered image만 보고 구조를 복제하지 않는다.
- 단순 색상 반전이 아니라 deep navy 또는 charcoal canvas, 충분한 text contrast, 역할별 accent color를 적용한 블로그 전용 dark composition으로 다시 설계한다.
- font는 diagram guideline에 맞춰 `Architects Daughter`와 `Comic Mono`를 사용하고, 한 시리즈 안에서는 같은 개념에 같은 색과 도형 문법을 사용한다.
- 기존 README asset은 덮어쓰거나 이동하지 않는다. 블로그용 SVG와 PNG는 `bluetape4k.github.io/public/assets/` 아래에 `clinic-appointment-part{N}-{topic}-{NN}` 형식으로 별도 관리한다.
- 한국어와 영문이 같은 기술 label을 자연스럽게 공유할 수 있으면 동일 asset을 사용한다. 번역이 이해에 실질적으로 도움이 되면 locale별 asset을 만들고 양쪽 article의 의미와 revision을 맞춘다.
- 각 asset은 한 번에 하나씩 제작한다. SVG XML 검증, CairoSVG PNG 변환, diagram audit, full-size PNG 육안 검사를 통과한 뒤 다음 asset으로 이동한다.
- 기존 README diagram과의 semantic parity를 검토하되, blog page의 폭과 dark theme에서 label이 읽히도록 grouping과 여백은 다시 조정할 수 있다.

따라서 기존 README·requirements의 SVG나 PNG를 블로그 본문에 직접 embed하지 않는다. 기존 asset은 related-set reference로만 활용하고, 실제 article에는 source 사실을 다시 검증해 만든 blog-owned dark asset을 사용한다.

## 작성 순서

1. Part 1 한국어 초안을 작성해 시리즈의 목소리와 정보 밀도를 확정한다.
2. Part 1의 사실·자연스러움·시각 자료를 검토하고 한국어 승인을 받는다.
3. Part 1 영문을 작성하고 route·claim·asset parity를 확인한다.
4. Part 2부터 Part 7까지 같은 방식으로 한 편씩 한국어 근거 확정, 초안, 승인, 영문 현지화를 진행한다.
5. 각 편은 이전 편과 다음 편 link를 현재 공개 상태에 맞게 관리한다. 아직 공개하지 않은 편은 깨진 route 대신 제목과 예정 주제만 안내한다.
6. 7편 완료 후 index, 전체 series navigation, 제목·part count·source link·asset parity를 다시 검증한다.

## 편별 완료 기준

각 편은 다음 조건을 만족해야 한다.

- 중심 질문이 도입부에서 명확하다.
- requirements, spec/plan, 현재 구현, test/lesson을 최소 한 번씩 연결한다.
- 코드 snippet은 한 결정을 설명하며 전체 구현은 source link로 넘긴다.
- 오래된 문서 표기를 현재 사실처럼 반복하지 않는다.
- 상태·constraint·benchmark 용어와 숫자를 현재 소스에서 다시 검증한다.
- “AI 최적화”를 홍보 문구로 쓰지 않고 탐색 공간, Hard feasibility, Soft trade-off를 설명한다.
- 한국어 글은 번역투 없이 실무 개발자 간 설명으로 읽힌다.
- 영문은 문장별 직역이 아니라 같은 기술 주장과 근거를 자연스럽게 전달한다.
- 한·영 title, part number, source link, hero, 본문 asset, series navigation이 일치한다.
- README·requirements에서 가져온 diagram 개념은 원본 이미지를 직접 삽입하지 않고, semantic parity를 확인한 blog-owned dark SVG/PNG로 제공한다.
- 새 diagram은 XML·render·audit 검증과 full-size PNG 육안 검사를 통과한다.
- `npm run build`와 변경 route 검증이 통과한다.

## 범위 제외

- `clinic-appointment` production code 변경
- requirements와 현재 소스의 차이를 이 시리즈 작업 안에서 일괄 수정하는 일
- 실제 병원 운영에 바로 적용할 수 있다는 제품·의료 규제 주장
- benchmark를 일반적인 운영 성능 또는 비용 절감 수치로 확대하는 일
- 환자 포털 전체 구현 안내
- 모든 API와 entity를 빠짐없이 나열하는 reference manual
- `clinic-appointment` README의 기존 diagram 자체를 dark style로 교체하는 일. 이 시리즈에서는 blog-owned 사본만 새로 만든다.
- 시리즈 설계 승인 전에 7편을 한 번에 작성하거나 영문부터 작성하는 일
- PR 생성, merge, site deploy. 이는 별도의 승인된 작성·배포 계획에서 다룬다.

## 성공 기준

- 개발자는 7편을 통해 요구사항이 설계, 계획, 구현, 리뷰, 추가 요구사항으로 순환하는 모습을 추적할 수 있다.
- 상태 관리 독자는 상태 머신, history, cancel reason, pinned 예약의 연결을 이해할 수 있다.
- 스케줄링 독자는 병원별 업무시간·의사·장비가 실시간 슬롯 계산과 Timefold constraint에 각각 어떻게 반영되는지 구분할 수 있다.
- SaaS 독자는 병원별 설정과 tenant 데이터 격리가 서로 다른 책임임을 이해할 수 있다.
- 각 편은 독립적으로 읽히면서도 이전 결정이 다음 요구를 만든다는 시리즈 흐름을 유지한다.
- 모든 기술 주장은 현재 source/test 또는 명시된 historical spec/lesson에 근거한다.
