# 병원 예약 서비스 블로그 시리즈 분류 체계 설계

## 목적

병원 예약 서비스 블로그를 발행 순서가 아니라 독자가 이해하기 좋은 순서로 다시
정리한다. 시리즈의 큰 흐름은 `프롤로그 → 설계 → 구현 → 운영 확장`으로 고정하고,
각 글의 제목과 시리즈 탐색 영역에서 현재 위치를 바로 알 수 있게 한다.

이 문서는 분류 체계와 제목 규칙을 확정하는 설계 문서다. 이 단계에서는 블로그
콘텐츠, 공개 경로, 그림 자산, Clinic Appointment GitHub Issue를 변경하지 않는다.
실제 구현 단계에서도 이번 요청은 Epic과 Issue의 제목 및 Epic 본문 작업 목록까지로
한정한다. GitHub sub-issue 관계를 새로 만들거나 바꾸는 작업은 포함하지 않는다.

## 독자와 읽기 순서

- 병원 관계자는 상품이 방문 약속이 되는 과정과 운영자가 개입하는 지점을 읽는다.
- PO는 상품·구매·예약의 책임 경계와 구현 범위, 운영 확장 순서를 확인한다.
- 개발자는 설계가 코드와 운영 계약으로 이어지는 순서와 근거 구현을 확인한다.

글을 작성한 날짜와 독자가 읽어야 할 순서는 다를 수 있다. 예를 들어 예약 정책
설계 글은 기존 구현 글보다 늦게 작성했지만, 개념상 구현에 앞서 읽어야 한다.
따라서 발행 날짜는 유지하고, 시리즈 분류와 탐색 순서만 독자의 이해 순서에 맞춘다.

## 현재 문제

1. 기존 `Part 1~7`만 번호가 있고, 뒤에 추가한 상품·대기 목록·운영 글에는 같은
   수준의 위치 표시가 없다.
2. 글을 작성한 순서대로 링크가 늘어나면서 설계 글이 구현 글보다 뒤에 보이는 등
   개념 순서가 흐려졌다.
3. Clinic Appointment Issue #284 하나에서 대기 목록 글 세 편이 나왔다. Issue와
   글을 무조건 1:1 번호로 맞추면 실제 관계를 숨기거나 이후 번호를 모두 밀어야 한다.
4. N회 상품과 패키지 상품은 설계 글만 있고, 실제 구현을 설명하는 글이 빠져 있다.

## 분류 체계

### 프롤로그

시리즈 전체의 환자 여정과 서비스 경계를 소개한다. 번호는 붙이지 않고
`[프롤로그]`만 표시한다.

### 설계 1~7

상품과 구매 정보가 방문 계획과 확정 약속으로 바뀌기 전에 필요한 모델과 정책을
설명한다. 이 분류는 “코드가 없는 구상”을 뜻하지 않는다. 구현 근거가 있더라도 글의
주된 질문이 책임 경계와 모델 선택이라면 설계에 둔다.

### 구현 1~9

기존 `Part 1~7`을 `구현 1~7`로 바꾼다. N회 상품과 패키지 상품의 실제 코드 흐름을
설명하는 두 편을 `구현 8`, `구현 9`로 계획한다.

### 운영 확장 1~11

대기 목록, 예약 우선순위, 복구, 알림, 외부 연동, 멀티테넌시, 재처리처럼 운영 중
필요해지는 기능과 신뢰성 경계를 다룬다. 대기 목록은 하나의 상위 주제에서 세 편이
나왔으므로 `운영 확장 1.1~1.3`으로 표시한다. 이후 주제는 `운영 확장 2`부터 잇는다.

## 블로그 글 분류와 제목

한국어 제목은 `[분류 번호] 설명` 형식을 사용한다. 영어 제목도 같은 위치를 알 수
있도록 `[Prologue]`, `[Design N]`, `[Implementation N]`,
`[Operations N]`을 사용한다. 글의 의미를 전달하는 문장은 각 언어에서
자연스럽게 쓰되 번호와 글의 대응 관계는 같아야 한다.

| 순서 | 한국어 제목 | 영어 제목 | 현재 경로 | 연계 Issue |
| --- | --- | --- | --- | --- |
| 프롤로그 | `[프롤로그] 상품 정보가 고객의 방문 약속이 되기까지` | `[Prologue] From Product Information to a Patient's Visit Commitment` | `clinic-appointment-prologue-product-to-appointment` | #276 |
| 설계 1 | `[설계 1] 상품이 바뀌어도 고객의 약속은 변경하지 않는다: 상품 버전과 구매 스냅숏` | `[Design 1] When a Product Changes, Preserve the Patient's Promise: Product Versions and Purchase Snapshots` | `clinic-appointment-product-version-purchase-snapshot` | #277 |
| 설계 2 | `[설계 2] 이벤트 상품은 어떤 방문 약속을 만드는가` | `[Design 2] What Visit Commitment Does an Event Product Create?` | `clinic-appointment-event-product-first-commitment` | #278 |
| 설계 3 | `[설계 3] N회 상품은 왜 예약 한 건이 아닌가` | `[Design 3] Why an N-Visit Product Is Not One Appointment` | `clinic-appointment-n-visit-remaining-rights` | #279 |
| 설계 4 | `[설계 4] 패키지 상품은 왜 실행 그래프가 되는가` | `[Design 4] Why a Package Product Becomes an Execution Graph` | `clinic-appointment-package-product-execution-graph` | #280 |
| 설계 5 | `[설계 5] 상품 BOM은 어떻게 AppointmentPlan과 방문으로 번역되는가` | `[Design 5] How a Product BOM Becomes an AppointmentPlan and a Visit` | `clinic-appointment-execution-bom-to-appointment-plan` | #281 |
| 설계 6 | `[설계 6] 고객 희망 내원 날짜는 예약 확정이 아니다` | `[Design 6] A Preferred Visit Date Is Not an Appointment Confirmation` | `clinic-appointment-desired-visit-date-and-confirmed-commitment` | #282 |
| 설계 7 | `[설계 7] 병원마다 예약 규칙이 다른 이유` | `[Design 7] Why Every Clinic Has Different Booking Rules` | `clinic-appointment-scheduling-policy` | #283 |
| 구현 1 | `[구현 1] 병원 예약은 CRUD로 끝나지 않는다` | `[Implementation 1] Clinic Appointments Are More Than CRUD` | `clinic-appointment-part1-not-just-crud` | 기존 글 |
| 구현 2 | `[구현 2] 예약 상태는 열거형이 아니다` | `[Implementation 2] Appointment State Is More Than an Enum` | `clinic-appointment-part2-state-machine-and-history` | 기존 글 |
| 구현 3 | `[구현 3] 병원마다 다른 업무시간과 자원으로 예약 가능 시간을 계산하기` | `[Implementation 3] Computing Availability from Clinic-Specific Hours and Resources` | `clinic-appointment-part3-clinic-specific-availability` | 기존 글 |
| 구현 4 | `[구현 4] 한 건의 예약 가능 시간 조회와 전체 일정 최적화는 다르다` | `[Implementation 4] Real-Time Slot Search and Global Optimization Solve Different Problems` | `clinic-appointment-part4-greedy-vs-global-optimization` | 기존 글 |
| 구현 5 | `[구현 5] 병원 업무 규칙을 Timefold 제약 조건으로 옮기기` | `[Implementation 5] Translating Clinic Rules into Timefold Constraints` | `clinic-appointment-part5-timefold-constraints` | 기존 글 |
| 구현 6 | `[구현 6] 휴진과 장비 고장은 예약 설계를 어떻게 바꾸는가` | `[Implementation 6] Rescheduling after Closures and Equipment Downtime` | `clinic-appointment-part6-closure-equipment-rescheduling` | 기존 글 |
| 구현 7 | `[구현 7] 완성 뒤가 진짜 시작이다` | `[Implementation 7] Reviews and Operations Start the Next Development Cycle` | `clinic-appointment-part7-review-and-operational-evolution` | 기존 글 |
| 구현 8 | `[구현 8] N회 상품 구매를 방문 계획으로 펼치는 방법` | `[Implementation 8] Expanding an N-Visit Purchase into a Visit Plan` | 발행 전 | 신규 Issue |
| 구현 9 | `[구현 9] 패키지 상품의 실행 순서와 선택 조건을 방문 계획으로 고정하는 방법` | `[Implementation 9] Turning Package Execution Order and Selection Rules into a Visit Plan` | 발행 전 | 신규 Issue |
| 운영 확장 1.1 | `[운영 확장 1.1] 대기 목록은 이름표가 아니라 상태 머신이다` | `[Operations 1.1] A Waitlist Is Not a Queue of Names` | `clinic-appointment-waitlist-core` | #284 |
| 운영 확장 1.2 | `[운영 확장 1.2] 대기 목록 운영 화면은 상태판이 아니라 조치판이다` | `[Operations 1.2] A Waitlist Dashboard Should Tell Staff What to Do Next` | `clinic-appointment-waitlist-operations-dashboard` | #284 |
| 운영 확장 1.3 | `[운영 확장 1.3] 대기 목록 운영 명령은 API 요청과 재조회로 완성된다` | `[Operations 1.3] A Waitlist Operations Command Is Complete Only After the API Request and Re-read` | `clinic-appointment-waitlist-operations-command` | #284 |
| 운영 확장 2 | `[운영 확장 2] 예약 우선순위는 누구의 규칙인가` | `[Operations 2] Who Owns Booking Priority?` | `clinic-appointment-booking-reliability` | #285 |
| 운영 확장 3~11 | 아래 Issue 순서에 따라 작성 | 같은 번호를 유지해 현지화 | 발행 전 | #286~#294 |

## Clinic Appointment Epic과 Issue 제목

Epic #275의 제목은 다음과 같이 바꾼다.

> `Epic: 병원 예약 서비스 — 프롤로그·설계·구현·운영 확장`

기존 Issue는 글 제목과 같은 분류를 앞에 표시한다. Issue #284는 글 세 편을 묶은
상위 주제이므로 소수 번호를 붙이지 않고 `[운영 확장 1]`을 사용한다. 세부 번호는
블로그 글에만 쓴다.

| Issue | 변경할 제목 |
| --- | --- |
| #276 | `[프롤로그] 상품 정보가 고객의 방문 약속이 되기까지` |
| #277 | `[설계 1] 상품 버전과 구매 스냅숏으로 고객의 약속을 고정하는 이유` |
| #278 | `[설계 2] 이벤트 상품은 어떤 방문 약속을 만드는가` |
| #279 | `[설계 3] N회 상품은 왜 예약 한 건이 아닌가` |
| #280 | `[설계 4] 패키지 상품은 왜 실행 그래프가 되는가` |
| #281 | `[설계 5] 상품 BOM이 AppointmentPlan과 방문으로 번역되는 과정` |
| #282 | `[설계 6] 고객 희망 내원 날짜는 예약 확정이 아니다` |
| #283 | `[설계 7] 병원마다 예약 규칙이 다른 이유` |
| 신규 | `[구현 8] N회 상품 구매를 방문 계획으로 펼치는 방법` |
| 신규 | `[구현 9] 패키지 상품의 실행 순서와 선택 조건을 방문 계획으로 고정하는 방법` |
| #284 | `[운영 확장 1] 빈시간 제안과 대기 목록 운영` |
| #285 | `[운영 확장 2] 예약 우선순위는 누구의 규칙인가` |
| #286 | `[운영 확장 3] 병원 사정으로 바뀐 예약을 복구하는 법` |
| #287 | `[운영 확장 4] CRM 프로필과 예약 재평가의 경계` |
| #288 | `[운영 확장 5] 내원 실적과 실제 시술 완료는 같은 데이터가 아니다` |
| #289 | `[운영 확장 6] 알림과 리마인더는 왜 별도 서비스인가` |
| #290 | `[운영 확장 7] 예약 결과가 외부 시스템과 통계로 전달되는 과정` |
| #291 | `[운영 확장 8] 여러 병원을 하나의 서비스로 운영하는 데이터 경계` |
| #292 | `[운영 확장 9] 재시도·replay·quarantine에도 예약을 한 번만 바꾸는 방법` |
| #293 | `[운영 확장 10] 최신 계산 결과만 예약에 적용하는 운영 신뢰성` |
| #294 | `[운영 확장 11·부록] 환자 포털·모바일 채널에서 만나는 예약 약속` |

Epic 본문의 등록 순서도 같은 분류 순서로 고친다. 기존 `구현 1~7`은 이미 발행된
글의 링크로 표시하고, 새 `구현 8·9` Issue를 `설계 7` 다음, `운영 확장 1` 앞에
배치한다. 새 Issue에는 Epic의 목적, 사실성 규칙, 한국어·영어 글의 동일한 번호,
검증 기준을 이어받는다고 명시한다.

## 구현 8: N회 상품 구현 글

이 글은 N회 상품을 “예약을 여러 번 복사하는 기능”으로 설명하지 않는다. 구매 시점의
상품 구성에서 `repeatCount`를 읽고, 각 순번을 가진 `PlannedTreatment`로 펼쳐 앞으로
사용할 방문 권리를 고정하는 과정을 보여 준다.

주요 근거는 다음과 같다.

- `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/service/AppointmentPlanFactory.kt`
- `appointment-event/src/main/kotlin/io/bluetape4k/clinic/appointment/event/integration/PurchaseCompletedHandler.kt`
- `appointment-core/src/test/kotlin/io/bluetape4k/clinic/appointment/service/AppointmentPlanFactoryTest.kt`
- Clinic Appointment commit `f8dea826`

글에서는 구매 이벤트 수신, 신뢰할 수 있는 구매 정보 확인, 순번별 치료 계획 생성,
멱등한 재처리 경계를 순서대로 설명한다. 설계 3의 “남은 방문 권리”가 코드에서 어떤
객체와 테스트로 보장되는지 연결한다.

## 구현 9: 패키지 상품 구현 글

이 글은 패키지 상품의 구성 요소를 단순 목록으로 다루지 않는다. 구성 요소 사이의
선행 조건, 선택 그룹, 수량을 검증하고 실행 가능한 방문 계획으로 고정하는 과정을
설명한다.

주요 근거는 다음과 같다.

- `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/service/PackageExecutionPlanner.kt`
- `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/plan/PackageExecutionSnapshot.kt`
- `appointment-core/src/test/kotlin/io/bluetape4k/clinic/appointment/service/PackageExecutionPlannerTest.kt`
- `appointment-event/src/main/kotlin/io/bluetape4k/clinic/appointment/event/integration/PurchaseCompletedHandler.kt`
- Clinic Appointment commit `e5fe7d11`

글에서는 구매 정보의 신뢰성, 의존 관계와 선택 조건 검증, 실행 순서 결정, 불변 실행
정보 저장을 차례로 다룬다. 설계 4의 “실행 그래프”와 설계 5의 `AppointmentPlan`이
실제 구현에서 만나는 지점을 보여 준다.

## 선택 근거와 제외한 대안

`프롤로그 → 설계 → 구현 → 운영 확장`의 계층형 번호를 선택한 이유는 독자의 질문이
바뀌는 지점을 제목에서 바로 보여 주기 위해서다. Issue #284처럼 하나의 기획 주제가
여러 글로 나뉘는 경우에는 소수 번호를 사용해 관계를 보존한다.

다음 대안은 사용하지 않는다.

- 모든 글에 하나의 연속 번호를 붙이는 방식: 글을 중간에 추가할 때 뒤 번호가 모두
  바뀌고, 설계와 구현의 차이를 제목만으로 알 수 없다.
- `D1`, `I1`, `O1.1` 같은 코드형 접두사: 짧지만 개발자가 아닌 독자에게 의미가
  바로 드러나지 않는다.
- Issue와 글을 억지로 1:1로 맞추는 방식: 대기 목록처럼 하나의 Issue에서 여러 글이
  나온 실제 작업 관계를 숨긴다.

## 호환성과 실패 방지

- 제목을 바꿔도 기존 경로와 발행 날짜를 유지하므로 외부에 공유된 링크는 그대로
  동작한다.
- 닫힌 Issue의 상태, 댓글, 연결된 PR은 제목 변경만으로 바꾸지 않는다.
- 시리즈 탐색을 한 번에 생성하거나 검증하지 못하면 글마다 순서가 달라질 수 있다.
  구현 계획에서는 공통 데이터나 기존 반복 패턴을 먼저 확인하고, 모든 발행 글의
  순서를 비교하는 검증을 둔다.
- 발행 전 경로를 미리 연결하면 독자가 404 응답을 받는다. 실제 파일과 빌드 결과에
  존재하는 경로만 탐색 링크에 넣는다.
- 한국어와 영어 중 한쪽 제목만 바뀌면 번호가 어긋난다. 두 언어의 제목과 탐색 순서를
  한 작업 단위로 변경하고 대응 관계를 검사한다.
- GitHub Issue 제목과 Epic 본문이 다르면 다음 글의 작업 순서를 잘못 이해할 수 있다.
  변경 후 Issue와 Epic을 다시 읽어 제목, 순서, 링크를 확인한다.

## 시리즈 탐색 규칙

1. 모든 글의 하단 탐색 영역은 `프롤로그 → 설계 1~7 → 구현 1~9 → 운영 확장
   1.1~1.3, 2~11` 순서를 기준으로 만든다.
2. 현재 읽는 글의 분류와 번호를 표시하고, 이전 글과 다음 글은 이 순서에서 찾는다.
3. 아직 발행하지 않은 `구현 8·9`와 `운영 확장 3~11`은 링크를 만들지 않는다.
   발행 전 글 때문에 기존 글 사이의 이동이 끊기면 안 된다.
4. 새 글이 발행되면 해당 위치에 링크를 추가하고, 그 앞뒤 글의 탐색 링크만 함께
   갱신한다.
5. 한국어와 영어 글은 같은 분류, 번호, 순서를 사용한다.
6. 기존 경로, 발행 날짜, 본문 설명, hero와 본문 그림은 제목 분류 작업만으로
   변경하지 않는다.

## 변경 범위와 실행 순서

이 설계가 승인되면 별도의 구현 계획에서 다음 작업을 순서대로 수행한다.

1. 한국어·영어 글의 frontmatter 제목을 변경한다.
2. 발행된 글의 하단 시리즈 탐색을 새 순서로 통일한다.
3. Clinic Appointment Epic #275의 제목과 본문 등록 순서를 변경한다.
4. Issue #276~#294의 제목을 표에 맞게 변경한다.
5. `구현 8`, `구현 9` Issue를 만들고 Epic의 작업 목록에 추가한다.
6. 한국어·영어 경로와 변경된 탐색 링크를 검증한다.

Issue 생성과 원격 제목 변경은 외부 상태를 바꾸는 작업이다. 구현 단계에서 현재 Issue
상태와 중복 여부를 다시 확인하고, 승인된 제목과 메타데이터를 적용한 뒤 실제 값을
다시 읽어 검증한다.

## 완료 기준

- [ ] 프롤로그, 설계, 구현, 운영 확장의 순서가 모든 발행 글에서 같다.
- [ ] 한국어·영어 제목의 분류와 번호가 서로 대응한다.
- [ ] 기존 `Part 1~7`이 `구현 1~7`로 표시된다.
- [ ] 대기 목록 세 편이 `운영 확장 1.1~1.3`으로 표시되고 Issue #284는
  `[운영 확장 1]` 상위 주제로 남는다.
- [ ] `구현 8·9` Issue가 Epic에서 설계와 운영 확장 사이에 배치된다.
- [ ] 발행하지 않은 글의 링크가 공개 글에 노출되지 않는다.
- [ ] 기존 글의 경로, 발행 날짜, 본문, 그림 자산이 의도치 않게 바뀌지 않는다.
- [ ] `git diff --check`와 `npm run build`가 통과한다.
- [ ] 한국어·영어 변경 경로와 시리즈 탐색 링크를 로컬 미리보기에서 확인한다.
- [ ] Epic과 Issue의 제목, Epic 본문 작업 목록을 GitHub에서 다시 읽어 적용 결과를
  확인한다.

## 근거

- [Clinic Appointment Epic #275](https://github.com/bluetape4k/clinic-appointment/issues/275)
- [AppointmentPlan 기반 구현 PR #181](https://github.com/bluetape4k/clinic-appointment/pull/181)
- [방문 약속 수명주기 Issue #184](https://github.com/bluetape4k/clinic-appointment/issues/184)
- Clinic Appointment `docs/superpowers/specs/2026-07-26-appointment-plan-and-capacity-design.md`
- Clinic Appointment `docs/superpowers/specs/2026-07-29-issue-184-visit-commitment-design.md`
