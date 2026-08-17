# [운영 확장 5] 내원 확인과 시술 완료는 다른 사실이다 — 글 설계

## 문서 정보

- 시리즈: Clinic Appointment 운영 확장
- 시리즈 순서: 운영 확장 5
- 관련 글: [구현 2](/ko/blog/clinic-appointment-part2-state-machine-and-history/), [구현 9](/ko/blog/clinic-appointment-package-execution-plan/), [운영 확장 3](/ko/blog/clinic-appointment-disruption-recovery/)
- 작업 저장소: `bluetape4k/bluetape4k.github.io`
- 한국어 글: `src/content/docs/ko/blog/clinic-appointment-attendance-fulfillment.mdx`
- 영어 글: `src/content/docs/blog/clinic-appointment-attendance-fulfillment.mdx`
- 새 시리즈 식별자: `operations-5`
- 작업 슬러그: `clinic-appointment-attendance-fulfillment`
- 작업 제목(한국어): `[운영 확장 5] 내원 확인과 시술 완료는 다른 사실이다`
- 작업 제목(영어): `[Operations 5] Attendance and Treatment Completion Are Different Facts`
- 검토 기준일: 2026-08-17

## 한 문장 결론

STAFF가 환자의 내원을 확인했다는 사실과 예약 흐름이 끝났다는 사실, 실제 시술이 완료되었다는 임상 사실은 서로 다른 시스템 상태다. 예약 서비스는 내원·예약 상태를 기록하고, 임상·시술 서비스가 보낸 검증된 이행 사실을 받아 상품 구성의 후속 작업을 계산한다. 부분 시술, 장비 장애, 환불도 각각 별도의 사실과 다음 작업으로 남겨야 한다.

## 독자와 읽기 목표

주 독자는 STAFF다. 화면에서 어떤 버튼을 누르고 어떤 작업 큐를 확인해야 하는지 먼저 보여 준다. 개발자는 상태와 이벤트의 소유권을 확인하고, PO와 병원 관계자는 내원·시술·환불을 하나의 `완료` 숫자로 합치면 안 되는 이유를 이해할 수 있어야 한다.

글을 읽은 뒤 독자는 다음 질문에 답할 수 있어야 한다.

1. `CHECKED_IN`은 무엇을 확정하고 무엇을 확정하지 않는가?
2. 예약의 `COMPLETED`와 임상·시술 완료 사실은 어느 서비스가 소유하는가?
3. 부분 시술·장비 장애·환불이 발생하면 원래 항목과 남은 작업은 어떻게 기록되는가?
4. STAFF 화면에서 지금 처리할 작업과 기다려야 할 외부 사실을 어떻게 구분하는가?

## 본문 흐름

### 1. 화면 첫 장면: 오늘의 예약과 처리 큐를 분리한다

첫 화면은 실제 환자 정보가 아닌 합성 데이터로 만든 STAFF 운영 화면 시안이다. 상단 요약 카드와 작업 큐를 다음처럼 구성한다.

| 영역 | 표시할 의미 | 구현 근거와 표현 제한 |
| --- | --- | --- |
| 오늘 예약 | 오늘 `CONFIRMED`인 예약 수 | `AppointmentStateMachine`의 예약 상태를 집계한 시안이다. 운영 대시보드 API가 구현되어 있다고 주장하지 않는다. |
| 내원 확인 | `CHECKED_IN`으로 전환된 예약 수 | `CheckIn` 이벤트와 `내원확인` 상태를 보여 준다. 시술 완료 수와 합치지 않는다. |
| 진행 중 | `IN_PROGRESS`인 예약 수 | `StartTreatment` 이벤트에 대응한다. |
| 예약 종료 | 예약 흐름에서 `COMPLETED`로 끝난 수 | 예약 워크플로의 종료이며 임상 서비스의 완료 판정과 같지 않다. |
| 외부 사실 대기 | 검증된 `TreatmentFulfillmentEvent`를 기다리는 항목 | 예약 서비스가 임상 완료를 추정하지 않는 경계를 화면에 드러낸다. |
| 후속 작업 큐 | 부분 이행·자원 장애·환불로 새로 생긴 작업 | 원래 항목, 새 남은 항목, 운영 예외를 분리해 보여 준다. |

카드의 숫자는 설명을 위한 시안 값이다. 화면 상단에 `설계 시안 · 실제 환자 정보 없음`을 표시하고, 각 행에는 `내원 확인`, `시술 완료 확인 대기`, `부분 이행 검토`, `환불 후속 확인`처럼 다음 작업을 직접 적는다. `완료`라는 단일 숫자나 색상만으로 내원과 시술을 표현하지 않는다.

### 2. 같은 예약에서 서로 다른 사실이 발생하는 순서

레이저·진정 치료·패키지 상품처럼 한 예약에 여러 치료 항목이 묶일 수 있는 합성 시나리오를 사용한다. 실제 의료 기록이나 환자 식별자는 넣지 않는다.

1. STAFF가 예약을 확인하고 `CheckIn`을 실행한다. 이 순간 기록되는 사실은 환자가 내원했다는 사실이다.
2. STAFF가 치료 시작을 실행하면 예약 상태가 `IN_PROGRESS`가 된다.
3. 예약 서비스의 `Complete` 이벤트가 처리되면 예약 워크플로는 `COMPLETED`가 된다. 이것은 예약 흐름의 종료이지, 임상 완료의 증거가 아니다.
4. 임상·시술 서비스가 실제 결과를 `TreatmentFulfillmentEvent`로 발행한다. 예약 서비스는 이벤트를 검증하고 Plan의 새 불변 revision에 결과를 투영한다.
5. 전체 완료라면 해당 치료 항목을 `COMPLETED`로 표시한다. 부분 이행이나 자원 장애라면 완료된 원래 항목은 보존하고, 생산자가 제공한 남은 작업을 새 treatment key로 만든다.
6. 환불이면 금액·승인·정산은 결제/커머스 서비스가 담당한다. 예약 서비스는 외부 사실을 투영하고, `BLOCKING` 후속 작업만 취소 대상으로 계산한다.

이 순서를 통해 “예약 종료 = 시술 완료 = 환불 완료”라는 잘못된 등식을 깨뜨린다.

### 3. 상태를 한 표에 겹쳐 쓰지 않는다

본문에는 다음 비교 표를 넣는다. 표의 목적은 상태 이름을 늘리는 것이 아니라 상태의 소유자와 STAFF의 다음 행동을 분리하는 것이다.

| 상태·사실 | 누가 기록하는가 | 무엇을 의미하는가 | STAFF의 다음 작업 |
| --- | --- | --- | --- |
| `CHECKED_IN` | 예약 서비스 | 환자가 내원해 접수되었다 | 치료 시작 여부를 확인한다. 임상 완료로 표시하지 않는다. |
| `IN_PROGRESS` | 예약 서비스 | 예약 흐름상 치료가 진행 중이다 | 실제 치료 결과를 임상·시술 서비스에 남긴다. |
| 예약 `COMPLETED` | 예약 서비스 | 예약 워크플로가 종료되었다 | 외부 이행 사실을 기다리거나 불일치를 검토한다. |
| `TreatmentFulfillmentFactType.COMPLETED` | 임상·시술 서비스가 발행, 예약 서비스가 검증·투영 | 특정 치료 의무가 실제로 완료되었다 | Plan과 후속 작업 큐를 다시 확인한다. |
| `PARTIALLY_FULFILLED` | 임상·시술 서비스가 발행 | 일부만 완료되었고 남은 작업 정의가 함께 제공되었다 | 완료된 원래 항목은 보존하고 새 남은 항목의 예약 후보를 검토한다. |
| `RESOURCE_DISRUPTED` | 임상·시술 서비스가 발행 | 장비·자원 문제로 남은 작업이 생겼다 | 운영 예외와 새 작업을 확인하고 환자 안내를 담당 조직에 넘긴다. |
| `REFUNDED` | 결제/커머스 서비스가 발행 | 환불 사실이 확인되었다 | 금액을 재판정하지 않고, 취소된 `BLOCKING` 후속 작업만 확인한다. |

`TreatmentFulfillmentFactType`의 이름과 현재 처리 규칙은 코드에 맞추고, 화면의 한국어 문장은 독자가 바로 이해할 수 있게 풀어 쓴다. `COMPLETED`라는 같은 단어가 예약 상태와 치료 항목 상태에 각각 나타날 때는 반드시 주어를 붙인다.

### 4. 이벤트 순서: 검증된 외부 사실만 Plan을 바꾼다

상태 비교 표 다음에 한·영 동일 의미의 시퀀스 diagram을 배치한다.

```text
STAFF
  └─ CheckIn / StartTreatment / Complete
       ↓
Appointment API ── 예약 상태와 이력 저장 ──→ 예약 화면
       ↑
Clinical/Treatment Service
  └─ TreatmentFulfillmentEvent
       ↓
ExternalFactEventIngress
  └─ payload·schema·signature·source version 검증
       ↓
TreatmentFulfillmentHandler
  └─ active revision 복사 → 결과 투영 → 새 revision 활성화
       ↓
STAFF 후속 작업 큐
  └─ 전체 완료 / 부분 이행 / 자원 장애 / 환불 검토
       ↓
최종 상태 결정
```

diagram 계약은 다음을 지킨다.

- `scope`와 `version` 카드는 diagram 본문을 가리지 않는 위쪽 여백에 둔다.
- 선의 시작점과 끝점을 실제 노드 경계에 맞춘다. 설명 없는 수평 점선이나 중간에서 끊기는 연결선은 사용하지 않는다.
- 직각 연결선은 둥근 모서리로 통일하고, 화살촉은 연결선과 같은 색을 사용한다.
- call line과 label 사이에 충분한 세로 간격을 확보한다. 라벨이 선이나 다른 노드와 겹치지 않아야 한다.
- 전체 완료·부분 이행·자원 장애·환불의 네 갈래는 `최종 상태 결정` 노드로 명시한다. 독자가 암묵적으로 추론해야 하는 terminal outcome은 만들지 않는다.
- diagram 아래쪽에는 충분한 bottom 여백을 두고, 본문에서는 클릭하면 크게 볼 수 있게 배치한다.
- 점선은 “외부 사실을 기다리는 경계”처럼 범례에 정의한 경우에만 사용하고, 연결 관계를 나타내는 실선과 혼용하지 않는다.

### 5. 부분 이행과 자원 장애는 원래 항목을 다시 쓰지 않는다

`TreatmentFulfillmentHandler`의 현재 규칙을 사례로 풀어 쓴다.

- 완료된 원래 treatment item은 완료 사실과 provenance를 가진 채 보존한다.
- 남은 작업은 이벤트 생산자가 제공한 정의와 새 treatment key로 추가한다. 예약 서비스가 남은 시술을 추측해 만들지 않는다.
- 자원 장애는 남은 항목과 `RESOURCE_DISRUPTION` 운영 예외를 함께 남긴다.
- 원래 Plan revision을 수정하지 않고 새 불변 revision을 만들어 활성화한다.
- 이벤트가 중복되거나 순서가 바뀌어도 source version과 idempotency 규칙으로 같은 결과에 수렴한다.

이 절에서는 “빈시간”이나 예약 후보를 새로 계산하는 것과 실제 완료 판정을 섞지 않는다. 새 남은 항목의 예약은 별도의 운영 작업이며, 임상 사실의 소유권은 바뀌지 않는다.

### 6. 환불·추가 구매·상담/보상은 다른 작업 큐다

환불은 예외라서 생략하지 않되, 예약 서비스가 환불 금액을 계산하는 것처럼 쓰지 않는다.

- 결제/커머스 서비스가 환불 금액·승인·정산을 소유한다.
- 예약 서비스는 `REFUNDED` 외부 사실과 사유 코드를 투영하고, `BLOCKING` 후속 작업의 취소 여부만 계산한다.
- 독립적인 `NON_BLOCKING` 후속 작업은 계속 예약할 수 있다.
- 추가 구매는 기존 Plan을 덮어쓰지 않고 새 상품 계약·Plan으로 시작한다.
- 고객 상담과 보상은 CRM/고객 서비스의 작업 큐이며, 예약 상태와 임상 완료 상태를 바꾸는 근거가 아니다.

### 7. 실패한 이벤트도 운영 화면에 남긴다

신뢰할 수 없는 외부 사실은 조용히 버리지 않는다. ingress가 payload 크기·깊이·schema·metadata·hash·signature·source version을 검증하고, 실패한 이벤트는 quarantine 또는 재처리 대기 상태로 남긴다. 유효하지 않은 이벤트는 active revision을 바꾸지 않는다. STAFF 화면에는 `검증 실패 — 원본 Plan 유지`, `source version 대기`, `중복 이벤트 — 결과 동일`처럼 운영자가 다음에 할 일을 표시한다.

### 8. 현재 구현·승인된 설계·운영 시안을 구분한다

본문 후반에 다음 경계 표를 둔다.

| 구분 | 이번 글에서 말하는 범위 |
| --- | --- |
| 현재 `clinic-appointment` 구현 | `AppointmentStateMachine`의 `CHECKED_IN → IN_PROGRESS → COMPLETED`, `TreatmentFulfillmentEvent`, ingress 검증, immutable Plan revision 투영, partial/resource disruption/refund fact 처리, replay·quarantine 테스트 |
| 승인된 설계 문서 | 예약·Plan·치료 항목·자원 할당의 소유권 분리, 외부 완료 사실 계약, 새 남은 항목과 후속 예약의 경계 |
| 운영 시안 | STAFF 화면 카드·작업 큐·상태 비교 표·최종 상태 결정 흐름. 실제 환자 데이터나 운영 대시보드 API를 의미하지 않는다. |
| 후속 범위 | 병원별 임상 기록 연동, 실제 환자 안내·보상 정책, 상품·결제 시스템의 정산 화면, 운영 지표의 실데이터 집계 |

## 구현 근거 원장

| 주장 | 확인할 현재 근거 | 글에서의 표현 |
| --- | --- | --- |
| 예약 상태의 내원·진행·종료 흐름 | `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/statemachine/AppointmentState.kt`, `AppointmentEvent.kt`, `AppointmentStateMachine.kt` | 현재 구현 |
| 치료 완료의 외부 소유권 | `appointment-event/src/main/kotlin/io/bluetape4k/clinic/appointment/event/integration/TreatmentFulfillmentEvent.kt` | 현재 계약·현재 구현 |
| immutable revision과 부분 이행 투영 | `appointment-event/src/main/kotlin/io/bluetape4k/clinic/appointment/event/integration/TreatmentFulfillmentHandler.kt`, `appointment-event/src/test/kotlin/io/bluetape4k/clinic/appointment/event/integration/TreatmentFulfillmentHandlerTest.kt` | 현재 구현과 테스트 |
| 외부 fact 검증·quarantine | `appointment-event/src/main/kotlin/io/bluetape4k/clinic/appointment/event/integration/ExternalFactEventIngress.kt` | 현재 구현 |
| 예약·임상·결제·CRM의 소유권 경계 | `docs/api/visit-commitment.md`, `docs/superpowers/specs/2026-07-26-appointment-plan-and-capacity-design.md`, `docs/superpowers/specs/2026-07-29-issue-184-visit-commitment-design.md` | 계약·승인된 설계 |
| 이 글의 운영 화면과 상태 비교 | 새 PNG/SVG 시각자료 | 설계 시안, 합성 데이터 |

글 작성 단계에서는 위 경로를 실제 `clinic-appointment` 저장소의 GitHub permalink로 연결한다. 글에는 소스 기반으로 작성했다는 메타 설명을 넣지 않고, 독자가 확인할 수 있는 코드·문서 링크만 제공한다.

## 시각자료 계획

### 공통 원칙

- 한국어·영어의 상태, 숫자, 화살표 의미, 범례, 작업명은 동일하게 맞춘다.
- 영웅 이미지는 기존 운영 확장 글과 겹치지 않는 추상적인 접수·완료·후속 작업 보드로 만든다. 텍스트와 환자 이미지는 넣지 않는다.
- 운영 화면은 실제 제품 화면의 복제가 아니라 STAFF가 확인해야 할 경계를 보여 주는 UI 시안이다.
- 모든 PNG는 본문에서 크게 보기로 연결하고, SVG와 semantic ledger를 함께 보관한다.

### 산출물

| 용도 | 산출물 경로(예정) | 설명 |
| --- | --- | --- |
| hero | `public/assets/clinic-appointment-attendance-fulfillment-hero.png` | 텍스트 없는 고유 hero |
| STAFF 화면 | `public/assets/clinic-appointment-attendance-fulfillment-operations-screen-ko.png`, `public/assets/clinic-appointment-attendance-fulfillment-operations-screen-en.png` | 상단 카드·상태 비교·후속 작업 큐를 보여 주는 합성 운영 화면 |
| 이벤트 diagram | `public/assets/clinic-appointment-attendance-fulfillment-flow-01-ko.svg`, `public/assets/clinic-appointment-attendance-fulfillment-flow-01-ko.png`, `public/assets/clinic-appointment-attendance-fulfillment-flow-01-en.svg`, `public/assets/clinic-appointment-attendance-fulfillment-flow-01-en.png` | 외부 fact 검증부터 최종 상태 결정까지의 sequence/flow |
| 의미 원장 | `docs/diagrams/clinic-appointment-attendance-fulfillment/flow-01-ko.semantic.json`, `docs/diagrams/clinic-appointment-attendance-fulfillment/flow-01-en.semantic.json` | 노드·연결선·범례·상태 의미 검증용 |
| 재현 스크립트 | `scripts/generate-clinic-appointment-attendance-fulfillment-assets.mjs` | 동일 입력에서 화면과 diagram을 다시 생성하는 도구 |

운영 화면은 카드와 행이 많아도 경계가 흐려지지 않게 여백을 확보한다. diagram과 UI 모두 실제 렌더링 크기에서 글자가 읽히는지 검수한다.

## 시리즈·링크 계획

- `src/data/clinic-appointment-series.mjs`에 `operations-5`를 `operations-4` 다음에 추가한다.
- 한국어·영어 글 모두 `<ClinicAppointmentSeries current="clinic-appointment-attendance-fulfillment" />`를 사용한다.
- 이전 글과 다음 글의 링크가 한·영에서 같은 순서를 가리키는지 검증한다.
- 본문 근거 링크에는 관련 블로그 글, visit commitment API 계약, 관련 설계 문서, 현재 구현 파일과 테스트를 포함한다. 이슈나 PR 링크는 근거 자료로 사용하지 않는다.
- 기존 visual companion index는 직접 route를 확인한 뒤 링크한다. 확인되지 않은 오래된 direct route를 새 글에 임의로 넣지 않는다.

## 한국어 용어 계약

- `예약`: 환자에게 보여 주는 booking과 예약 서비스의 예약 record를 설명할 때 사용한다.
- `내원 확인`: `CHECKED_IN`의 한국어 설명으로 사용한다.
- `예약 종료`: 예약 워크플로의 `COMPLETED`를 설명할 때 사용한다.
- `시술 완료` 또는 `임상 완료 사실`: `TreatmentFulfillmentEvent`가 전달하는 외부 사실을 설명할 때 사용한다.
- `부분 이행`: `PARTIALLY_FULFILLED`의 독자용 표현으로 사용한다.
- `자원 장애`: `RESOURCE_DISRUPTED`와 장비·자원 문제를 설명할 때 사용한다.
- `환불`: 금액·승인·정산은 결제/커머스 서비스의 소유로 쓴다.
- `빈시간`: 공간이 아니라 예약 가능한 시간 구간을 뜻할 때만 사용한다.
- `스냅숏`: source/catalog/version의 고정 복사본을 설명할 때 사용한다.
- `최종 상태 결정`: terminal outcome decision을 번역할 때 사용한다.

`방문 약속`, `확정 방문 약속`처럼 예약과 내원을 한 문장에 합치는 표현은 사용하지 않는다. 실제 상태의 차이를 설명해야 할 때만 “예약”, “내원 확인”, “시술 완료 사실”을 각각 쓴다.

## 구현 단계의 검증·완료 기준

설계 승인 뒤 다음 순서로 구현한다.

1. 정확한 현재 소스 경로와 permalink를 다시 확인하고, 본문의 구현 근거 원장을 확정한다.
2. 새 hero, STAFF 운영 화면, 한·영 diagram, semantic ledger를 생성한다.
3. 한·영 글과 `operations-5` 시리즈 registry를 작성한다.
4. writer 검토: 자연스러운 한국어, 용어 일관성, 현재 구현/승인 설계/시안 경계, 링크와 series navigation.
5. diagram 검토: endpoint, rounded orthogonal connector, 화살촉 색상, label 간격, vertical/bottom 여백, 명시적 `최종 상태 결정`, 크게 보기.
6. `git diff --check`, `npm test`, `npm run build`를 실행하고, 한·영 route와 모든 새 자산의 HTTP 200을 확인한다.
7. 로컬 preview에서 본문·UI·diagram을 실제 크기와 크게 보기로 확인한 뒤, 사용자 승인 후에만 PR·배포 범위를 진행한다.

## 범위 밖

- 실제 환자 식별 정보, 진료 기록, 의료 판단을 생성하거나 예시로 노출하지 않는다.
- 예약 서비스에 임상 완료 판정을 새로 넣지 않는다.
- 결제 금액·환불 승인·고객 보상 정책을 구현하거나 결정하지 않는다.
- 병원별 운영 지표 API와 실제 대시보드 집계를 이번 글에서 구현했다고 주장하지 않는다.
- 기존 글의 hero나 direct visual route를 확인 없이 재사용하지 않는다.
