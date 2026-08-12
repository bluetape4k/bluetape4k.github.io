# 이벤트 상품은 어떤 예약 약속을 만드는가

- **Issue**: [#278 이벤트 상품은 어떤 예약 약속을 만드는가](https://github.com/bluetape4k/clinic-appointment/issues/278)
- **Parent Epic**: [#275 진료 예약 서비스 전체 흐름을 읽는 블로그 시리즈](https://github.com/bluetape4k/clinic-appointment/issues/275)
- **상태**: 사용자 승인 완료
- **작업 유형**: Type E — 기술 블로그 문서 유지보수
- **대상 저장소**: bluetape4k/bluetape4k.github.io
- **근거 저장소**: bluetape4k/clinic-appointment
- **관찰한 원본 기준**: develop at fe772eb4504a6770ba6386efd0e0397060caf1f8
- **승인된 범위**: 한국어 원고, 영어 현지화 원고, 시리즈 내비게이션, locale별 정적 diagram asset과 semantic ledger

## 1. 결정 요약

이 글은 이벤트 상품을 구매한 환자 A가 어떻게 첫 번째 방문 약속을 만들게 되는지를
업무 흐름으로 설명한다. 구매 완료를 곧바로 확정 예약으로 표현하지 않고,
상품 기준정보와 구매 기준정보를 바탕으로 AppointmentPlan을 만든 뒤 후보 시간,
제안 또는 보류, 고객 동의를 거쳐 CONFIRMED 약속이 되는 단계를 분리한다.

본문의 중심 문장은 다음과 같다.

> 구매 사실 ≠ 예약 가능 조건 ≠ 확정 약속

authority라는 내부 개념은 독자-facing 문장에서 **기준정보** 또는
**기준정보 원천**으로 쓴다. sourceAuthority, sourcePurchaseAuthority,
catalogSourceAuthority 같은 코드 식별자와 API 이름은 그대로 유지하고,
첫 등장 때만 해당 필드가 어떤 기준정보 원천을 가리키는지 설명한다.
인증·인가를 뜻하지 않는 문맥에서는 “권한”이라는 번역을 사용하지 않는다.

이 글은 이벤트 상품의 첫 예약 약속에 집중한다. N회 상품과 패키지 상품은
같은 AppointmentPlan 경계를 이해하기 위한 짧은 비교로만 사용하며,
반복 회차의 전체 계산, 패키지 전환, 노쇼·지각 취소, VIP 우선 예약은 다음
글이나 별도 범위로 넘긴다.

## 2. 독자와 성공 기준

### 2.1 독자

- 상품개발·상품관리 담당자: 상품 기준정보와 예약 규칙이 실제 방문 후보로 어떻게
  해석되는지 확인하고 싶은 독자
- 예약서비스 개발자: 구매 event, 계획, 방문 약속, 동의의 경계를 설계하는 독자
- 고객상담·CRM 담당자: 예약서비스가 제공하는 객관적 사실과 상담 판단을 구분해야
  하는 독자
- 병원 운영·기획 담당자: 이벤트 상품의 짧은 유효 운영 조건과 자원 제약이
  고객 경험에 어떤 약속을 만드는지 이해해야 하는 독자

### 2.2 성공 기준

독자는 글을 읽은 뒤 다음 질문에 답할 수 있어야 한다.

1. 이벤트 상품을 구매한 순간에 왜 확정 예약이 생기지 않는가?
2. 상품 기준정보와 구매 기준정보는 예약서비스에 무엇을 제공하는가?
3. 고객이 입력한 희망 일정과 상품의 최초 제안 fallback은 어떻게 다른가?
4. PROPOSED, HELD, CONFIRMED는 어떤 업무 약속의 차이를 표현하는가?
5. 후보 없음, 제안 만료, 환자 취소, 병원 사정 변경이 왜 서로 다른 처리인가?
6. 예약서비스가 보존하는 사실과 상품관리·상담·알림·통계 서비스의 책임은 어디서
   갈라지는가?

## 3. 공통 환자 사례

상품명·병원명·가격·환자 식별 정보는 일반화하고, 한 명의 환자를 환자 A로
표현한다. 이벤트 상품은 한 번의 방문으로 이행되는 예시로 삼되, 실제 상품이
항상 단일 BOM 항목이라는 뜻으로 확대하지 않는다.

| 시점 | 환자 A의 행위 또는 이벤트 | 기준정보와 예약서비스의 처리 | 다음 업무 의미 |
|---|---|---|---|
| T1 | 이벤트 상품을 구매한다 | 구매 기준정보 원천이 검증한 PurchaseCompleted를 받는다. 구매 ID와 구매 당시 상품 버전을 보존할 준비를 한다. | 결제가 끝났지만 방문 시간이 확정된 것은 아니다. |
| T2 | 희망 날짜를 함께 제출하거나 제출하지 않는다 | BookingPreferenceSnapshot을 불변 입력으로 저장한다. NotProvided일 때만 상품의 initialBookingRule을 fallback으로 검토한다. | 고객 희망과 상품 fallback을 섞지 않는다. |
| T3 | 예약 가능한 시간을 계산한다 | 상품 BOM의 소요 시간·필요 자원·예약 규칙과 병원 수용량을 함께 검증해 후보를 만든다. | “상품을 사용할 수 있음”과 “특정 시간에 방문할 수 있음”이 분리된다. |
| T4 | 후보를 제안받거나 잠시 보류한다 | 승인된 예약 약속 설계에 따라 PROPOSED 또는 정책상 HELD를 만든다. | 아직 고객과 병원의 확정 약속은 아니다. |
| T5 | 후보에 동의한다 | 고객 동의와 정책 snapshot을 확인한 뒤 CONFIRMED 약속으로 전환한다. | 이제 시간·진료 항목·필요 자원에 대한 방문 약속이 생긴다. |
| T6 | 내원하고 처치를 받는다 | 내원·완료 사실은 예약서비스가 받아 계획 항목의 상태와 후속 event에 반영한다. | 임상 기록 원본과 상담 판단은 각 소유 서비스에 남는다. |

T3의 후보 계산과 T4~T5의 약속 전환은 현재 develop 소스와 승인된 설계를
구분해 서술한다. 구매 event 수신만으로 자원 점유나 고객 동의를 완료했다고
쓰지 않는다.

## 4. 글의 구성

### 4.1 제목과 route

- 한국어 제목: 이벤트 상품은 어떤 예약 약속을 만드는가
- 영어 제목: What Appointment Promise Does an Event Product Create?
- 한국어 route: src/content/docs/ko/blog/clinic-appointment-event-product-first-commitment.mdx
- 영어 route: src/content/docs/blog/clinic-appointment-event-product-first-commitment.mdx
- hero: 기존 /assets/clinic-appointment-prologue-hero.png 재사용

본문과 시리즈 내비게이션에는 내부 관리 항목인 Issue #278을 독자-facing
제목이나 문장으로 노출하지 않는다. 근거 링크는 설계 문서·소스 파일·시각
companion으로 연결하고, 내부 issue 링크는 설계 문서의 근거 ledger에만 둔다.

### 4.2 섹션 순서

1. **이벤트 상품을 샀는데 왜 아직 방문 약속이 아닌가** — 환자 A의 구매
   직후 기대와 실제 시스템 경계를 제시한다.
2. **상품 기준정보가 예약서비스에 들어오는 최소 계약** — 상품 버전, BOM,
   예상 시간, 자원 요구, 예약 규칙을 설명한다.
3. **구매 사실에서 AppointmentPlan으로** — 구매 하나가 계획과
   PlannedTreatment로 전개되는 이유를 보여 준다.
4. **희망 일정과 최초 제안 fallback을 분리하기** — 고객 입력과
   WithinDaysAfterPurchase를 같은 예약일로 취급하지 않는다.
5. **후보 시간에서 확정 약속까지** — PROPOSED·HELD·고객 동의·
   CONFIRMED의 업무 의미를 환자 A의 시간축으로 설명한다.
6. **예외는 같은 예약의 실패가 아니다** — 후보 없음, 제안 만료, 환자 취소,
   병원 사정 변경의 다음 행동과 책임을 비교한다.
7. **서비스별 기준정보와 책임 경계** — 상품·구매·예약·임상·CRM·알림·
   통계가 어떤 사실을 원천으로 보유하고 무엇을 넘기는지 표로 정리한다.
8. **현재 구현·승인 설계·운영 대기·로드맵** — 관찰한 source와 공개 가능한
   약속을 분리한다.
9. **다음 글 예고** — N회 상품에서 여러 회차의 계획과 방문 약속을
   연결하는 문제로 이어 간다.

각 섹션은 비즈니스 질문 → 최소 데이터와 상태 → 소유 서비스 → 예외와
다음 행동 순서를 따른다. 기능 목록이나 내부 threshold를 먼저 나열하지 않는다.

## 5. 기준정보와 책임의 계약

### 5.1 독자-facing 용어

| 내부 식별자 또는 개념 | 글에서 사용할 표현 | 사용 규칙 |
|---|---|---|
| authority | 기준정보 | source-of-truth 의미로만 사용 |
| sourceAuthority | 기준정보 원천 | 상품 카탈로그 원본을 가리킬 때 사용 |
| sourcePurchaseAuthority | 구매 기준정보 원천 | 구매 사실의 원천 서비스를 설명할 때 사용 |
| catalogSourceAuthority | 상품 기준정보 원천 | 계획에 보존된 상품 snapshot의 원천을 설명할 때 사용 |
| authority-qualified purchase event | 기준정보 원천이 검증한 구매 이벤트 | 원본 구매 식별자와 검증 경계를 함께 설명 |
| product catalog | 상품 기준정보 | 가격표 전체가 아니라 예약 해석에 필요한 versioned 계약 |
| ownership boundary | 기준정보와 책임의 경계 | 인증·인가의 권한 경계와 혼동하지 않음 |
| WithinDaysAfterPurchase | 구매 후 최초 제안 기한 | 자동 확정이나 상품 이용 만료일로 번역하지 않음 |
| product benefit expiration | 상품 이용 만료일 | 상품관리부 계약에 명시된 경우에만 사용 |

영문 원고에서는 문맥에 따라 source of truth, catalog source,
purchase source를 사용한다. 코드 식별자와 상태명은 두 locale에서
변경하지 않는다.

### 5.2 서비스별 책임

| 업무 영역 | 기준정보 원천 | 예약서비스에 넘기는 사실 | 예약서비스가 책임지는 범위 |
|---|---|---|---|
| 상품관리·상품개발 | 상품 version, BOM, 예상 시간, 자원 요구, 초기 예약 규칙 | catalog projection 또는 동기화 event | 구매 당시 상품 정의를 검증·snapshot하고 예약 입력으로 사용 |
| 구매·커머스 | 구매 계약과 원본 구매 ID | PurchaseCompleted | 구매 하나당 계획을 만들고 구매 provenance를 보존 |
| 예약서비스 | AppointmentPlan, 방문 약속, 자원 후보, 정책 snapshot, 상태 이력 | objective event와 outbox | 예약 가능 조건, 제안·보류·확정 상태, 방문 이력 보존 |
| 임상·시술 | 실제 시작·완료·부분 완료 | completion/fulfillment fact | 계획 항목 상태와 후속 예약 영향 반영 |
| 고객상담·CRM | 고객 프로필, 상담, 민원, 보상 판단 | 예약 objective fact와 handoff | 상담이 판단할 수 있는 예약 사실 제공 |
| 알림 | 연락처, 언어, 동의, 발송 이력 | 예약 event와 outbox 결과 | 예약 트랜잭션과 채널 발송을 직접 결합하지 않음 |
| 통계·외부 consumer | projection과 지표 | 예약 event와 schema 계약 | 원본 예약 상태를 projection에 양도하지 않음 |

예약서비스는 상품 가격·환불 결정·임상 판단·상담 보상·채널 발송의 원천이
아니다. 이 글에서는 해당 영역을 “예약서비스가 책임지지 않는 업무”로
표시하고, 객관적인 예약 사실을 다음 서비스로 전달하는 역할만 설명한다.

## 6. 현재 사실과 설계 상태를 구분하는 규칙

| 표지 | 글에서 주장할 수 있는 범위 | 적용 예 |
|---|---|---|
| **현재 구현** | clinic-appointment develop의 source와 테스트에서 계약을 확인한 동작 | versioned ProductCatalogDefinition, 구매 snapshot, AppointmentPlan과 PlannedTreatment, BookingPreferenceSnapshot |
| **승인된 설계** | 설계 문서가 정의했으나 현재 구현 전체와 동일하다고 단정하지 않는 동작 | 후보 제안, PROPOSED·HELD·CONFIRMED, 확정 약속 변경 시 새 제안과 고객 동의 |
| **운영 대기** | 코드나 설계는 있으나 broker 전달·canary·backfill·production 확인이 끝나지 않은 범위 | 외부 알림·통계 projection의 실제 운영 상태 |
| **로드맵** | 후속 issue나 운영 정책으로 남아 있는 기능 | 포털·모바일 직접 동의, 노쇼 제한과 VIP 우선순위의 구체적인 정책 |

현재 ProductCatalogDefinition에는 구매 후 최초 제안 fallback을 나타내는
initialBookingRule이 있지만, 이 필드를 상품 이용 만료일로 해석하지 않는다.
상품 이용 만료는 상품관리부의 별도 기준정보 계약으로 다루며, 이번 글에서는
현재 source가 보장하는 범위와 업무 정책의 빈칸을 분리한다.

## 7. 예외 처리의 업무 의미

| 상황 | 예약서비스가 보존하는 사실 | 다음 업무 |
|---|---|---|
| 후보 시간이 없음 | 조건과 계산 시점, 실패 사유, 재검토 가능 여부 | 다른 조건·대체 시간 제안 또는 상담 handoff |
| PROPOSED/HELD 만료 | 만료된 제안과 hold를 확정 약속으로 승격하지 않음 | 새 후보를 계산해 새 제안을 만들거나 운영 검토 |
| 환자 취소·거부 | 고객의 의사와 기존 상태 이력을 보존 | 상품·환불·상담 판단을 해당 기준정보 원천으로 전달 |
| 병원 사정 변경 | 자원·운영 변경으로 영향을 받은 예약과 계획 항목을 식별 | 새 제안과 고객 동의, 운영·상담 handoff |
| 이미 CONFIRMED인 약속 변경 | 기존 확정 약속을 조용히 이동하거나 삭제하지 않음 | 새 제안과 고객의 새 동의 후 변경 |

노쇼 페널티, VIP 우선 예약, 자동 블랙리스트는 이 글의 현재 기능으로
서술하지 않는다. 그런 정책은 환자 A의 다음 예약을 재평가하는 별도 글에서
기준정보, 설명 가능성, 기존 확정 약속 보호를 함께 다룬다.

## 8. 다이어그램 설계

### 8.1 독자의 질문과 화면 구성

정적 diagram 한 세트로 다음 질문에 답한다.

> 이벤트 상품 구매가 어떤 단계를 거쳐 고객과 병원의 확정 방문 약속이 되는가?

가로 시간축과 아래 예외 rail을 사용한다.

- T1 구매 완료
- T2 계획 생성과 기준정보 snapshot
- T3 후보 시간 계산
- T4 PROPOSED 또는 정책에 따른 HELD
- T5 고객 동의와 CONFIRMED
- T6 내원·완료 event 및 downstream handoff
- 예외 rail: 후보 없음, 제안 만료, 환자 취소, 병원 사정 변경

상단에는 “구매 사실 ≠ 예약 가능 조건 ≠ 확정 약속”을 배치한다. 단계별
서비스 이름을 표시하되 authority는 **기준정보 원천**으로 라벨링한다.
가격·실명·내부 임계값은 넣지 않는다.

### 8.2 Asset과 visual companion

| asset | 용도 |
|---|---|
| public/assets/clinic-appointment-event-product-first-commitment-01-ko.svg | 한국어 구조 원본 |
| public/assets/clinic-appointment-event-product-first-commitment-01-ko.png | 한국어 article embed |
| public/assets/clinic-appointment-event-product-first-commitment-01-en.svg | 영어 구조 원본 |
| public/assets/clinic-appointment-event-product-first-commitment-01-en.png | 영어 article embed |

한국어·영어 diagram은 라벨을 별도 관리하되 상태명·필드명·API 식별자는
동일하게 유지한다. 기존 /assets/clinic-appointment-prologue-hero.png는
재사용하며 hero를 새로 만들지 않는다.

기존 interactive companion인
/visual-companions/clinic-appointment/product-bom-to-appointment-flow/와
/visual-companions/clinic-appointment/product-scheduling-classification/는
보조 링크로만 연결한다. 새 interactive route나 catalog 항목은 이 범위에
추가하지 않는다.

### 8.3 도형과 연결선 계약

- workflow diagram으로 분류하고 하나의 읽기 방향을 유지한다.
- 직교 연결선과 명시적인 화살촉을 사용한다.
- 연결선은 충분한 좌우 여백을 두고, 노드·라벨과 교차하지 않는다.
- 둥근 모서리의 방향을 선행·후행 노드의 흐름과 일치시킨다.
- 메인 흐름과 예외 rail의 색·선 종류를 다르게 하되 색만으로 의미를
  전달하지 않는다.
- 최종 PNG는 원본 크기로 확인하고, 축소 thumbnail에서도 T1~T6 순서가
  읽히는지 확인한다.

Semantic ledger는 다음 위치에 둔다.

- docs/review/2026-08-12-clinic-appointment-event-product-first-commitment-ko.semantic.json
- docs/review/2026-08-12-clinic-appointment-event-product-first-commitment-en.semantic.json

ledger에는 각 node·edge의 의미, 근거 source path, 현재/설계 상태, 의도적인
비범위를 기록한다.

## 9. 근거 ledger

| 주장 | 근거 | 원고에서의 사용 |
|---|---|---|
| 상품 정의는 상품관리 서비스에서 전달받아 예약서비스가 불변 snapshot으로 보존한다 | [ProductCatalogDefinition.kt](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/catalog/ProductCatalogDefinition.kt) | 상품 기준정보와 구매 시점 계약 |
| BOM 항목은 반복 횟수·예상 시간·간격·담당자·장비·room 요구를 가진다 | [ProductCatalogDefinition.kt](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/catalog/ProductCatalogDefinition.kt) | 이벤트 상품의 예약 가능 조건 |
| 구매 계획은 상품 version과 source purchase를 보존한다 | [AppointmentPlanModel.kt](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/plan/AppointmentPlanModel.kt), [Appointment Plan Foundation #181](https://github.com/bluetape4k/clinic-appointment/issues/181) | AppointmentPlan과 provenance |
| 고객 희망 일정은 확정 예약이나 변경 동의가 아니다 | [BookingPreferenceSnapshot.kt](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/plan/BookingPreferenceSnapshot.kt) | 선호 입력과 약속 분리 |
| NotProvided일 때만 상품 최초 예약 규칙을 fallback으로 적용한다 | [ProductCatalogDefinition.kt](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/catalog/ProductCatalogDefinition.kt) | WithinDaysAfterPurchase 설명 |
| 고객 요청은 provisional로 시작하고 확정 변경에는 새 제안과 동의가 필요하다 | [BookingCommitmentPolicy.kt](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/policy/BookingCommitmentPolicy.kt), [방문 약속 설계](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-07-29-issue-184-visit-commitment-design.md), [방문 약속 #184](https://github.com/bluetape4k/clinic-appointment/issues/184) | PROPOSED·HELD·CONFIRMED 상태 해석 |
| 상품 가격·환불·상담·임상 원본은 예약서비스의 책임이 아니다 | [Appointment Plan 설계의 서비스 경계](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-07-26-appointment-plan-and-capacity-design.md), [데이터 흐름](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/requirements/data-flow.md) | 기준정보와 책임 표 |
| 노쇼 책임과 제한은 기존 확정 약속을 조용히 바꾸지 않는 별도 운영 정책이다 | [예약 신뢰성 설계](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-08-01-issue-176-booking-reliability-design.md) | 이번 글의 비범위와 다음 글 연결 |

작성 단계에서 위 ledger를 develop source와 다시 대조한다. latest,
완료, 운영 중 같은 시점 의존 표현은 관찰한 revision과 실제 상태가
일치할 때만 사용한다.

## 10. Locale과 시리즈 parity

한국어 원고를 먼저 작성한 뒤 영어를 직역하지 않고 같은 사실과 업무 의미를
자연스러운 영어로 현지화한다.

| 항목 | 한국어 | 영어 |
|---|---|---|
| route | /ko/blog/clinic-appointment-event-product-first-commitment/ | /blog/clinic-appointment-event-product-first-commitment/ |
| 상태 표지 | 현재 구현 / 승인된 설계 / 운영 대기 / 로드맵 | Current implementation / Approved design / Awaiting operations / Roadmap |
| 기준정보 용어 | 기준정보 / 기준정보 원천 | source of truth / catalog source / purchase source |
| diagram | ...-ko.svg/png | ...-en.svg/png |
| series navigation | 프롤로그 → 상품 version → 이벤트 상품 → N회·패키지 | Prologue → product version → event product → N-visit/package |

프롤로그와 상품 version 글의 “다음 글” 링크를 현재 글로 연결하고,
시리즈 내비게이션은 양 locale에서 같은 순서와 대응 route를 사용한다.
새 글에는 아직 route가 없는 후속 글의 가짜 링크를 만들지 않는다.

## 11. 범위와 보호선

- 상품 가격·할인·환불 금액, 실제 병원·환자 정보, 직원 점수와 내부 threshold를
  공개하지 않는다.
- authority를 “권한”으로 번역하지 않고 기준정보 원천으로 설명한다.
- 상품 기준정보를 예약서비스가 소유하거나 임의로 다시 정의한다고 쓰지 않는다.
- 구매 event 수신을 자원 hold 또는 확정 예약 완료로 표현하지 않는다.
- WithinDaysAfterPurchase를 상품 이용 만료일로 표현하지 않는다.
- 노쇼 페널티와 VIP 우선 예약의 구체적인 규칙을 현재 기능처럼 약속하지 않는다.
- “중복 이벤트”를 “중복 구매”로 표현하지 않는다. 전달 재시도와 실제 추가 구매는
  별도 개념으로 다음 범위에서 필요한 만큼만 언급한다.
- 새 interactive companion route, visualization catalog, clinic-appointment
  원본 코드 변경은 수행하지 않는다.

## 12. 구현·검증 DoD

### 12.1 설계 문서

- [x] 사용자 승인으로 원고 구조·기준정보 용어·다이어그램 계약을 확정했다.
- [ ] source claim과 범위 표지가 현재 develop과 일치하는지 집필 직전에 재확인한다.
- [x] 설계 문서의 자체 검토에서 placeholder, 모순된 상태명, “기준정보/권한”
  용어 혼용이 없는지 확인했다.

### 12.2 원고와 시리즈

- [ ] 한국어 글을 src/content/docs/ko/blog/에 추가한다.
- [ ] 영어 글을 src/content/docs/blog/에 추가한다.
- [ ] 양 locale에서 hero, meta, figure, source-link, 하단 series navigation을
  기존 시리즈 형식과 맞춘다.
- [ ] 프롤로그와 상품 version 글의 다음 글 링크를 현재 route로 연결한다.
- [ ] 내부 issue 번호 없이 독자-facing 제목·본문을 작성한다.
- [ ] authority 독자-facing 표현이 기준정보·기준정보 원천으로 통일됐는지 확인한다.

### 12.3 Diagram

- [ ] 한국어·영어 SVG와 PNG를 생성한다.
- [ ] semantic ledger 두 개를 생성하고 node·edge·근거를 대조한다.
- [ ] SVG XML 파싱, 정규화, 화살촉·끝점·직교선·둥근 모서리 검사를 통과한다.
- [ ] 연결선 교차와 라벨 충돌이 없는지 확인한다.
- [ ] 원본 크기 PNG를 시각 점검한다.

### 12.4 저장소 검증

- [ ] git diff --check
- [ ] npm run build
- [ ] 한국어 route와 영어 route가 모두 생성되는지 확인한다.
- [ ] 양 locale의 series navigation과 asset 경로가 유효한지 확인한다.

## 13. 실행 순서

1. 이 설계 문서를 자체 검토하고 승인된 용어와 범위를 고정한다.
2. 한국어 원고를 작성하고 근거 ledger와 대조한다.
3. A+C 시간축 diagram을 한국어로 만들고 geometry·visual 검사를 수행한다.
4. 한국어 원고·diagram을 기준으로 영어 원고와 영어 diagram을 현지화한다.
5. 시리즈 navigation과 source link를 갱신한다.
6. git diff --check, diagram audit, npm run build, route 확인을 수행한다.
7. 검토 가능한 PR을 만들고, 별도 승인 없이는 merge·배포하지 않는다.
