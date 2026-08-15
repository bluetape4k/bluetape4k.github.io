# N회 상품 구매를 방문 계획으로 펼치는 방법 글 설계

## 목적

N회 상품 구매를 미래 예약 N건으로 복사하지 않고, 구매 당시 상품 정의를 회차별
방문 계획으로 펼치는 현재 구현을 설명한다. 환자 여정을 중심으로 읽되, 각 주장은
`clinic-appointment`의 현재 소스와 테스트로 확인한다. 구현되지 않았거나 연결되지
않은 동작은 현재 기능처럼 서술하지 않고 구현 공백 또는 후속 범위로 분리한다.

## 독자와 서술 순서

- 환자·병원 관계자: 3회 상품을 구매해도 미래 시간 세 개를 곧바로 점유하지 않는
  이유를 먼저 이해한다.
- PO: 구매 권리, 방문 계획, 확정 방문 약속, 완료, 환불의 책임 경계를 확인한다.
- 개발자: `PurchaseCompletedHandler`, `AppointmentPlanFactory`, `repeatCount`,
  `sequenceNo`, 의존 관계, 중복 처리 테스트를 근거로 구현을 확인한다.

본문은 환자 A가 3회 상품을 구매하는 장면으로 시작한다. 잘못된 모델과 현재 모델을
비교한 뒤 구매 이벤트 수신, 회차 전개, 방문 선택, 실제 완료, 잔여 회차, 환불 예외,
회차 간격, 중복 이벤트 처리 순서로 전개한다. 업무 결과를 먼저 설명하고 짧은 코드와
테스트 근거를 뒤에 둔다.

## 핵심 주장

1. `repeatCount = 3`은 미래 예약 세 건이 아니라, 계획 안의
   `PlannedTreatment(sequenceNo = 1..3)`을 만든다.
2. 구매 시점에는 `earliestStartAt`과 `latestStartAt`을 채우지 않는다. 고객이 회차를
   선택하고 예약 조건을 만족할 때 해당 회차만 예약 절차로 이동한다.
3. 구매 완료 이벤트는 상품의 정확한 버전과 구매 소유 사실을 확인한 뒤 계획을 만든다.
   같은 이벤트나 같은 구매를 다시 처리해도 계획을 중복 생성하지 않는다.
4. 방문 완료는 단순 카운터 감소가 아니다. 완료된 회차를 `COMPLETED`로 남기고 나머지
   회차를 `PENDING` 또는 계획 상태로 보존한 새 불변 revision을 만든다.
5. 환불 가능 여부와 환불 금액은 예약 서비스가 판단하지 않는다. 권위 있는 외부
   환불 사실을 받은 뒤 직접 대상과 `BLOCKING` 후속 의무를 취소하고, 완료 이력과
   독립적인 의무는 보존한다.
6. 회차 간격이 없는 일반 상품과 간격이 필요한 시술을 같은 방식으로 취급하지 않는다.
   간격이 필요한 시술은 이전 회차의 실제 완료 시각을 기준으로 다음 예약 가능 구간
   `N일 이상 M일 이하`를 계산해야 한다. 구매 시점에 미래 날짜를 미리 만들지 않는다.

## 회차 간격과 현재 구현의 경계

- `CatalogBomItem`에는 `minimumIntervalDays`, `preferredIntervalDays`,
  `maximumIntervalDays`가 있으며 `AppointmentPlanFactory`가 각 회차에 복사한다.
- `CatalogDefinitionValidator`는 반복 회차의 인접 관계를 순환 검증용 그래프에는
  추가한다.
- 현재 `AppointmentPlanFactory`는 반복 회차 사이의 인접 의존 관계를 aggregate의
  `TreatmentDependencyRecord`로 자동 생성하지 않는다. 명시적인 catalog dependency만
  저장한다.
- 실제 예약 제안의 최소·최대 간격 검사는 plan revision의 명시적인 dependency와
  선행 회차의 실제 완료 시각을 기준으로 수행한다.
- 따라서 “N회 자동 전개만으로 회차 간격이 강제된다”고 쓰지 않는다. 간격 필드는
  모델·검증·저장 경계에 존재하지만, 반복 회차의 자동 의존 관계 연결은 현재 구현
  공백으로 명시한다.
- 간격 없음과 같은 방문 허용은 같은 의미가 아니다. 시간 간격과 방문 묶음·분리
  제약은 서로 다른 축이며, 방문 그룹 제약과 패키지 실행 그래프는 구현 9의 범위로
  연결한다.

## 시각자료

두 도표를 분리한다.

1. **구매 직후 무엇을 만드는가**
   - 잘못된 모델: 달력에 미래 예약 세 건을 생성한다.
   - 현재 모델: 시간 없는 방문 권리 세 회를 계획에 만든다.
   - 보조 비교: 일반 상품은 회차 간격이 없고, 간격이 필요한 시술은 이전 완료 뒤
     `N~M일`의 예약 가능 구간을 계산한다.
2. **계획이 완료와 환불을 반영하는 과정**
   - `PurchaseCompletedHandler → AppointmentPlanFactory → PlannedTreatment 1..N`
   - 방문 완료는 새 revision에서 한 회차를 `COMPLETED`로 바꾼다.
   - 환불 확정은 직접 대상과 `BLOCKING` 후속만 `CANCELLED`로 바꾼다.
   - 기존 revision과 완료 이력은 보존한다.
   - 회차 간격 값의 보존과 실제 dependency 강제 경계를 별도 주석으로 구분한다.

Hero는 같은 병원 예약 시리즈의 로봇 운영 장면을 따르되, 이미 사용한 상품·정책 hero와
구도가 겹치지 않게 한다. 본문 도표는 SVG 원본과 2배 PNG를 함께 만들고 한국어·영어
자산을 분리한다. 연결선, 화살촉, label 간격, 상하 여백, 다크·라이트 대비를
`bluetape-diagram` checklist로 검증한다.

## 글의 공개 경계

- 현재 구현, 테스트로 확인한 동작, 구현 공백, 후속 구현을 문장 수준에서 구분한다.
- 소스 커밋을 대조해 작성했다는 메타 설명은 본문에 넣지 않는다.
- 환자·병원 식별 정보와 내부 운영 임계값은 공개하지 않는다.
- 코드 토큰과 상태 이름은 그대로 보존하되, 본문 설명은 자연스러운 한국어로 풀어쓴다.
- 한국어 원문을 먼저 작성하고 영어 글은 같은 주장, 표, 도표, 링크, 시리즈 순서를
  유지한다.

## 근거표

| 주장 | 현재 근거 | 공개 방식 |
| --- | --- | --- |
| 구매 이벤트의 신뢰·중복 경계 | `PurchaseCompletedHandler`와 관련 테스트 | 흐름 설명과 짧은 코드 |
| `repeatCount`의 회차 전개 | `AppointmentPlanFactory.create()`와 factory 테스트 | 3회 예시와 코드 |
| 구매 시 예약 시각을 만들지 않음 | factory의 `earliestStartAt/latestStartAt = null` | 잘못된 모델 비교 |
| 회차 간격 필드의 존재와 검증 | `ProductCatalogDefinition`, `CatalogDefinitionValidator` | 일반/간격 시술 비교 |
| 반복 회차 자동 dependency 누락 | factory의 dependency 생성 경로와 repository-wide 사용처 검색 | 구현 공백으로 명시 |
| 실제 완료 뒤 간격 검사 | `AppointmentProposalService.acceptsPredecessorWindows()` 테스트 | 완료 시각 기준 예시 |
| 완료·환불의 불변 revision | `TreatmentFulfillmentHandler`와 테스트 | 상태 전이 도표 |

기준 소스는 `clinic-appointment` `develop`의
`d1718331f1d418baf455d8046ad6cfc2e1567460`이며, 본문 작성과 최종 교정 전에 최신
`develop`과 다시 대조한다.

## 검증

- 한국어·영어 글의 제목, slug, 섹션, 표, 링크, 그림, 시리즈 순서 대조
- 모든 현재 동작 주장에 소스 또는 테스트 근거 연결
- 구현 공백을 완료된 기능으로 오해하게 만드는 문장 검색
- `git diff --check`
- `npm run build`
- 두 언어 route와 모든 `/assets/...` 응답 확인
- SVG semantic ledger, connector·arrowhead·label geometry, PNG 원본 크기 검사
- 다크·라이트 모드와 본문 확대 보기 확인
- 로컬 preview에서 두 글을 처음부터 끝까지 읽고 자연스러운 한국어 최종 교정

## 관련 작업

- [Clinic Appointment Epic #275](https://github.com/bluetape4k/clinic-appointment/issues/275)
- [구현 8 Issue #342](https://github.com/bluetape4k/clinic-appointment/issues/342)
- [구현 9 Issue #343](https://github.com/bluetape4k/clinic-appointment/issues/343)
- [설계 3: N회 상품은 왜 예약 한 건이 아닌가](https://bluetape4k.github.io/ko/blog/clinic-appointment-n-visit-remaining-rights/)
