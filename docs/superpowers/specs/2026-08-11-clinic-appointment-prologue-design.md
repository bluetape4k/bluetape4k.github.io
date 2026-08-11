# 병원 예약 서비스 프롤로그 설계

- **Issue**: [#276 시리즈 프롤로그: 상품 정보가 고객의 방문 약속이 되기까지](https://github.com/bluetape4k/clinic-appointment/issues/276)
- **Parent Epic**: [#275 진료 예약 서비스 전체 흐름을 읽는 블로그 시리즈](https://github.com/bluetape4k/clinic-appointment/issues/275)
- **상태**: 사용자 승인 완료
- **작업 유형**: Type E — 기술 블로그 문서 유지보수
- **대상 저장소**: `bluetape4k/bluetape4k.github.io`
- **근거 저장소**: `bluetape4k/clinic-appointment`
- **관찰한 원본 기준**: `develop` at `3dfcf2acc32dfca4cbd8bf1a47226be1eee63bbe`
- **승인된 범위**: 한국어 글, 영어 현지화 글, 기존 시리즈 내비게이션, 기존 visual companion 연결, 새 hero 이미지

## 1. 결정 요약

프롤로그는 한 환자의 구매·예약·내원 여정을 글의 뼈대로 삼고, 각 단계에서 **어떤 서비스가 어떤 사실을
소유하며 다음 서비스에 무엇을 넘기는지**를 함께 보여준다. 제품 목록을 먼저 설명한 뒤 환자 사례를 붙이는
방식이나 이벤트 스트림만 나열하는 방식은 채택하지 않는다. 독자가 비즈니스 흐름을 놓치지 않으면서도
`AppointmentPlan`, `Appointment`, CRM 상담, 알림, 통계의 경계를 확인해야 하기 때문이다.

이 글은 새로운 예약 기능을 구현하거나 병원 운영 정책을 공개하는 글이 아니다. 이미 병합된 구현, 승인된
설계, 운영 rollout 대기, 로드맵을 분리해 서비스 전체를 읽는 기준을 제공한다.

## 2. 독자와 성공 기준

### 2.1 독자

- 상품개발 또는 상품관리 담당자: 상품 BOM과 예약 규칙이 어떻게 실행되는지 알고 싶은 독자
- 예약서비스 개발자: 구매 계약과 방문 약속의 경계를 설계해야 하는 독자
- 고객상담서비스/CRM 담당자: 예약서비스가 제공하는 객관적 사실과 상담·보상 책임을 구분해야 하는 독자
- 운영·기획 담당자: 이벤트, N회, 패키지 상품이 고객의 여러 방문으로 이어지는 과정을 파악해야 하는 독자

### 2.2 성공 기준

독자는 글을 읽은 뒤 다음 질문에 답할 수 있어야 한다.

1. 상품을 구매한 사실과 예약 가능한 방문 약속이 왜 다른가?
2. 구매 시점의 상품 버전과 혜택을 왜 snapshot으로 고정하는가?
3. `AppointmentPlan`과 실제 방문 `Appointment`는 어떤 책임을 나누는가?
4. 내원·임상 완료·상담·환불·알림·통계는 어느 서비스의 사실인가?
5. 현재 구현과 설계·운영 대기·로드맵을 어떻게 구별할 수 있는가?

## 3. 공통 환자 사례

모든 상품명·병원명·금액·개인 식별 정보는 일반화한다. 글에서는 한 명의 환자를 **환자 A**로 부른다.

| 순서 | 환자 A의 행위 또는 이벤트 | 예약서비스가 보존하거나 만드는 것 | 소유하지 않는 것 |
|---|---|---|---|
| 1 | 당일 이벤트 상품을 구매한다 | 구매 event를 받아 상품 버전과 예약 계약을 참조할 준비 | 상품 원본 정의, 결제 승인 |
| 2 | N회 방문 상품을 추가 구매한다 | 여러 `PlannedTreatment`로 이어질 `AppointmentPlan` | 실제 시술 완료, 잔액 정산 |
| 3 | 여러 치료 항목의 패키지를 구매한다 | BOM에서 항목·의존성·자원 요구를 읽을 수 있는 실행 계획 | 패키지 원본의 상업적 의미와 가격 |
| 4 | 원하는 날짜를 요청한다 | `PROPOSED` 또는 `HELD` 제안, 정책 snapshot, 자원 후보 | 고객의 최종 동의 자체 |
| 5 | 제안에 동의한다 | `CONFIRMED` 방문 약속, `AppointmentItem`, 자원 점유 | 임상 처치 결과 |
| 6 | 병원에 내원하고 일부 또는 전부 처치받는다 | 객관적 내원·예약 상태 event와 미완료 항목의 후속 단서 | 임상 기록의 원본, 상담 판단 |
| 7 | 일정 지연·변경을 상담한다 | 중단·지연·재예약 제안 같은 objective fact | 사과·보상·환불 결정 |
| 8 | 리마인더와 결과를 받는다 | durable notification outbox 및 외부 통계 event | 연락처·동의 원본, 외부 projection의 최종 상태 |

이 사례는 서로 다른 상품이 한 환자에게 누적되는 상황을 보여주지만, 여러 구매를 하나의 상품이나 하나의
예약으로 합치지 않는다. 각 구매는 자신의 `AppointmentPlan`을 만들고, 실제로 같은 방문에 묶을 수 있는
항목만 `AppointmentItem`으로 합의한다.

## 4. 권한과 데이터 흐름

### 4.1 서비스 경계

| 업무 영역 | 권위 데이터 | 예약서비스로 넘기는 사실 | 예약서비스의 책임 |
|---|---|---|---|
| 상품관리/상품개발 | 상품 정의, BOM, 예약 규칙, 상품 버전 | catalog projection 또는 동기화 event | 구매 시점 버전의 예약 해석에 사용할 projection 보존 |
| 구매/커머스 | 구매 계약, 추가 구매, 환불 | authority-qualified purchase event, refund event | 구매 하나당 계획 생성, 미래 예약 의무 반영 |
| 예약서비스 | 계획, 방문 약속, 자원, 정책 snapshot | `AppointmentPlan`, `PlannedTreatment`, `Appointment`, objective facts | 일정·수용량·동의·상태·이력의 권위 보존 |
| 임상/시술 | 실제 시술 시작·완료·부분 완료 | completion event | 완료된 항목과 미래 계획의 영향 반영 |
| 고객상담/CRM | 고객 프로필, assessment, 상담, 민원, 보상 | 최소 profile outcome 또는 예약 objective fact | 예약 변경 제안과 상담 handoff의 사실 제공 |
| 알림 | 연락처, 언어, 동의, 발송 이력 | 예약 event와 outbox 처리 결과 | 예약 트랜잭션과 알림 전달을 직접 결합하지 않음 |
| 통계/외부 consumer | projection, 최신 상태, SLA 지표 | 예약 event와 schema 계약 | 원본 예약 상태를 외부 projection에 직접 양도하지 않음 |

상품관리·구매·환불·상담·보상의 소유권을 예약서비스에 편입하지 않는다. 예약서비스는 `AppointmentInterrupted`,
`AppointmentDelayExceeded`, `RescheduleOffered`, `AppointmentServiceLevelBreached`, `CustomerConsentRequired`
같은 객관적 사실을 발행하고, CRM과 커머스가 각자의 판단을 수행하도록 한다.

### 4.2 계획과 방문의 두 축

```text
구매 event
  └─> AppointmentPlan
        └─> PlannedTreatment 1..N ── dependency/DAG
                              ▲
                              │ fulfills / attempts
Appointment ──> AppointmentItem 1..N ──> ResourceAllocation 1..N
```

- `AppointmentPlan`: 구매 한 건이 앞으로 이행해야 할 진료 의무와 상품 버전을 보존한다.
- `PlannedTreatment`: 반복 회차, 패키지 항목, 선행 조건과 아직 수행하지 않은 의무를 표현한다.
- `Appointment`: 실제 방문 단위다. 한 방문에 여러 계획에서 온 `AppointmentItem`이 들어갈 수 있다.
- `AppointmentItem`: 그 방문에서 어떤 계획 항목을 이행하려는지 연결한다.
- `AppointmentCommitment`: 고객 요청·hold·확정이라는 일정 합의 축을 방문/임상 상태와 분리한다.

따라서 구매 직후 곧바로 빈 슬롯이나 자원을 확정했다고 쓰지 않는다. Foundation 설계의 현재 실행 범위와
방문 약속 설계의 후속 범위를 같은 문단에서 분리한다.

## 5. 글의 구조

### 5.1 제목과 route

- 한국어 route: `src/content/docs/ko/blog/clinic-appointment-prologue-product-to-appointment.mdx`
- 영어 route: `src/content/docs/blog/clinic-appointment-prologue-product-to-appointment.mdx`
- 한국어 제목: `병원 예약 SaaS 개발기 프롤로그: 상품 정보가 고객의 방문 약속이 되기까지`
- 영어 제목: `Clinic Appointment SaaS Prologue: From Product Information to a Patient's Visit Commitment`

기존 Part 1~7의 hero·메타·하단 시리즈 링크 구조를 유지한다. 프롤로그는 시리즈 내비게이션에서 Part 1보다
앞에 놓고, 블로그 전체 sidebar에서는 실제 게시 순서를 따른다. 기존 Part 1~7에는 프롤로그 링크를 추가해
어느 글에서 시작해도 전체 읽기 순서를 확인할 수 있게 한다.

### 5.2 섹션 순서

1. **상품을 샀는데 왜 아직 방문 약속이 아닌가** — 환자 A의 세 구매를 짧게 제시한다.
2. **상품 정보가 예약서비스에 들어오는 경로** — catalog, 구매 event, immutable snapshot을 설명한다.
3. **상품이 진료 계획이 되는 순간** — `AppointmentPlan`과 `PlannedTreatment`를 N회·패키지 사례에 대입한다.
4. **계획이 고객과 병원의 방문 약속이 되는 순간** — proposal, hold, consent, `CONFIRMED`를 구분한다.
5. **한 번의 방문 뒤에 남는 여러 사실** — attendance, clinical completion, 상담, 환불, 알림, 통계의 경계를 설명한다.
6. **같은 사실을 여러 서비스가 읽을 때 지켜야 할 것** — snapshot, objective event, outbox, projection을 연결한다.
7. **현재 구현·설계·운영 대기·로드맵 구분표** — 독자가 source drift를 오해하지 않도록 상태를 표시한다.
8. **다음 글 예고** — #277에서 상품 버전과 구매 snapshot을 깊게 다룬다.

각 섹션은 `비즈니스 문제 → 최소 데이터/흐름 → 책임 해석 → 경계와 예외` 순서로 작성한다. 기능 목록을
나열하거나 구현 완료를 과장하는 결론은 사용하지 않는다.

## 6. 사실성 분류

글에 표시할 상태는 다음 네 가지다.

| 표지 | 의미 | 프롤로그에서 사용할 근거 |
|---|---|---|
| 현재 구현 | 현재 `develop` 소스와 병합된 기능 또는 현재 계약 | #181/PR #181, #184/PR #197, #200/PR #200, 현재 `docs/requirements/data-flow.md` |
| 승인된 설계 | 설계가 승인됐지만 글의 시점에서 후속 구현 범위일 수 있음 | Appointment Plan 전체 설계의 Foundation 제외 범위, visit commitment 후속 범위 |
| 운영 대기 | 코드 또는 설계는 있으나 canary·backfill·production 검증이 끝나지 않음 | notification outbox #203/#205 및 운영 canary #204, stats production readiness |
| 로드맵 | 열린 Epic/Issue에 남아 있고 현재 구현으로 취급하지 않음 | 환자 포털 #13, 모바일 #15 |

특히 다음 표현을 금지한다.

- 구매 event 수신을 곧바로 방문 자원 점유 완료로 표현하지 않는다.
- `CONFIRMED` 약속을 CRM 프로필 재평가나 VIP 정책으로 조용히 바꿀 수 있다고 쓰지 않는다.
- 노쇼 제한을 영구 블랙리스트나 기존 확정 예약 취소로 표현하지 않는다.
- notification canary와 stats backfill 대기를 production 완료로 표현하지 않는다.
- 포털·모바일 Issue를 이미 제공되는 환자 채널로 표현하지 않는다.

## 7. 시각 자료와 hero

### 7.1 기존 companion 연결

새 companion route는 이 Issue 범위에 추가하지 않는다. 다만 프롤로그의 핵심 질문인 “환자 A의 행위와 이벤트가 어떤
행위와 이벤트로 바뀌는가”와 “서비스별 권한이 어디서 책임으로 끝나는가”를 한눈에 보여 주기 위해 글에
locale별 정적 diagram asset 두 장을 추가한다. 원본 Markdown 설계가 권위이고, 웹 companion은 설명 보조라는
기존 계약을 따른다.

- [상품 예약 운영 특성 분류](https://bluetape4k.github.io/ko/visual-companions/clinic-appointment/product-scheduling-classification/)
- [상품 실행 BOM의 예약 전개 흐름](https://bluetape4k.github.io/ko/visual-companions/clinic-appointment/product-bom-to-appointment-flow/)
- [예약 계획과 수용량](https://bluetape4k.github.io/ko/visual-companions/clinic-appointment/appointment-plan-and-capacity/)
- [시각 자료 원본 목록](https://bluetape4k.github.io/ko/visual-companions/clinic-appointment/)

영어 글에는 각 링크의 `/ko` 없는 route를 사용한다. companion snapshot 기준은
`e9743337cdc1bf499af68e4e94a9f06b2833d838`이며, 게시된 companion과 현재 source Markdown의 차이를 확인한다.

### 7.2 hero

- 목표 asset: `public/assets/clinic-appointment-prologue-hero.png`
- 기존 Part 1~7의 어두운 미니어처 작업대와 로봇 작업자 시각 언어를 유지한다.
- 상품 카드, 구매 문서, 계획 그래프, 예약 달력, 상담·알림 신호를 하나의 작업대에 배치한다.
- 이미지 안에 한국어 또는 영어 문장을 넣지 않아 두 locale에서 asset을 공유한다.
- locale별 `imageAlt`와 `figcaption`은 별도로 작성한다.
- 생성 성공만으로 완료하지 않고, article first viewport와 동급 크기로 렌더링해 가독성과 초점 배치를 확인한다.

### 7.3 프롤로그 diagram

두 diagram은 같은 환자 A 사례를 공유하지만 독자의 질문이 다르므로 분리한다. 둘 다 SVG를 구조적 원본으로
삼고 CairoSVG로 PNG를 만든다. 한국어와 영어는 reader-facing text가 있으므로 각각 별도 SVG/PNG를 만든다.

| diagram | 독자의 질문 | 핵심 시각 계약 | 대상 섹션 |
|---|---|---|---|
| `clinic-appointment-prologue-patient-a-flow-01-{ko,en}.svg/png` | 환자 A의 행위와 이벤트가 어떤 예약 처리와 객관적 이벤트로 이어지는가? | 상단 `행위`, 중앙 `예약서비스 처리`, 하단 `이벤트` 3개 lane과 시간 순서, action/event 범례 | 상품 구매부터 내원·후속 handoff까지 |
| `clinic-appointment-prologue-service-boundaries-01-{ko,en}.svg/png` | 상품·구매·예약·임상·CRM·알림·통계가 무엇을 권한으로 소유하고 어디까지 책임지는가? | 중앙 예약서비스 source-of-truth 경계, 좌측 입력 authority, 우측 consumer/adapter, 실선 입력·점선 objective event, `책임 밖` 표지 | 서비스 ownership 표와 사실 분리 |

첫 diagram의 event 이름은 현재 source가 제공하는 `PurchaseCompleted`, `AppointmentPlanCreated`,
`AppointmentCreated`, `AppointmentRescheduled`, `TreatmentFulfillmentEvent`를 사용하고, 제안·hold·동의 bound
확정은 승인된 설계로 표시한다. 두 번째 diagram은 상품·커머스·임상·CRM을 예약서비스의 원천으로 합치지 않고,
예약서비스가 plan·commitment·schedule·capacity·history·outbox를 소유하는 경계를 중앙에 둔다. 가격·환불 승인,
임상 판단·원본 기록, 상담·보상, 채널 발송, 통계 projection은 예약서비스의 책임 밖으로 표시한다.

각 SVG의 semantic ledger는 `docs/review/2026-08-11-clinic-appointment-prologue-*.semantic.json`에 둔다.
ledger의 source revision은 `clinic-appointment` `develop` `3dfcf2a`와 프롤로그의 pinned visual snapshot을
기준으로 하며, 실제 환자 식별자·가격·내부 노쇼 임계값·VIP 순위 규칙은 diagram에 넣지 않는다.

## 8. locale·시리즈 parity

한국어를 원문으로 먼저 작성한 뒤 영어를 직역하지 않고 기술 의미와 근거를 보존해 현지화한다.

| 항목 | 한국어 | 영어 |
|---|---|---|
| route | `/ko/blog/clinic-appointment-prologue-product-to-appointment/` | `/blog/clinic-appointment-prologue-product-to-appointment/` |
| title/description | 비즈니스 사례 중심의 자연스러운 한국어 | 같은 주장과 기술 용어의 자연스러운 영어 |
| 사례·숫자 | 환자 A, 상품 3종, 상태·event 이름 동일 | 동일 |
| source links | 한국어 문맥의 링크 label | 영어 문맥의 링크 label, URL 동일 |
| visual links | `/ko/visual-companions/...` | `/visual-companions/...` |
| series navigation | 프롤로그 → Part 1~7 → 다음 시즌 Issue | 같은 순서와 route 대응 |

영어 글을 별도의 새로운 주장이나 최신 상태로 확장하지 않는다. 두 locale의 explicit tags도 동일하게 유지한다.

## 9. 근거 ledger

| 주장 | 근거 | 글에서의 사용 |
|---|---|---|
| 구매 event가 `AppointmentPlan`과 `PlannedTreatment`를 만든다 | [Appointment Plan Foundation #181](https://github.com/bluetape4k/clinic-appointment/issues/181), [설계 문서](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-07-26-appointment-plan-and-capacity-design.md) | 상품→계획 전환 |
| 상품·구매·예약·임상·CRM의 소유권이 분리된다 | [Appointment Plan 설계의 서비스 경계](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-07-26-appointment-plan-and-capacity-design.md) | 책임 경계 표 |
| 한 방문에 여러 `AppointmentItem`과 자원을 묶을 수 있다 | [방문 약속 #184](https://github.com/bluetape4k/clinic-appointment/issues/184), [PR #197](https://github.com/bluetape4k/clinic-appointment/pull/197) | 계획→방문 |
| proposal·hold·confirmed와 consent를 분리한다 | [방문 약속 설계](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-07-29-issue-184-visit-commitment-design.md) | 고객 희망일→확정 약속 |
| 예약 생성·알림·재배정은 서로 다른 전달 경계를 가진다 | [데이터 흐름](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/requirements/data-flow.md) | event/outbox/projection |
| CRM 원본 프로필과 예약 재평가 결과를 분리한다 | [프로필 변경 재평가 #200](https://github.com/bluetape4k/clinic-appointment/issues/200), [설계 문서](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-07-30-profile-change-reservation-reevaluation-design.md) | 상담·개인정보 경계 |
| 알림은 발송 시점의 연락처·동의와 durable outbox를 사용한다 | [알림 outbox #172](https://github.com/bluetape4k/clinic-appointment/issues/172), [운영 canary #204](https://github.com/bluetape4k/clinic-appointment/issues/204) | rollout 표지 |
| 외부 consumer와 통계 projection은 예약 사실을 전달받는다 | [이벤트 epic #17](https://github.com/bluetape4k/clinic-appointment/issues/17), [consumer PR #229](https://github.com/bluetape4k/clinic-appointment/pull/229), [stats PR #242](https://github.com/bluetape4k/clinic-appointment/pull/242) | 통계·production 경계 |
| 포털·모바일은 아직 로드맵이다 | [환자 포털 #13](https://github.com/bluetape4k/clinic-appointment/issues/13), [모바일 #15](https://github.com/bluetape4k/clinic-appointment/issues/15) | 로드맵 표지 |

작성 시 위 ledger의 각 주장과 현재 `develop` 소스를 다시 대조한다. `latest`, `현재`, `완료` 같은 시점 의존
표현은 관찰한 commit과 실제 상태가 일치할 때만 사용한다.

## 10. 비범위와 보호선

- 상품 가격, 병원명, 실제 환자 개인정보, 내부 노쇼 임계값, 직원별 점수는 공개하지 않는다.
- 상품 BOM을 예약서비스가 소유하거나 다시 해석한다고 쓰지 않는다.
- 환불·민원·보상을 예약서비스 기능으로 구현하거나 설명하지 않는다.
- 새 visual companion route, visualization catalog, 원본 서비스 코드 변경은 이 Issue에서 수행하지 않는다. 프롤로그에
  필요한 locale별 정적 diagram asset과 MDX embed만 추가한다.
- 포털·모바일 채널 구현은 #294로 분리한다.
- 기존 Part 1~7의 기술 내용을 반복 복사하지 않고 프롤로그가 제공하는 전체 지도를 우선한다.

## 11. 검증과 DoD

### 11.1 설계 문서 검토

- [ ] 미완성 표지나 임시 문구, 모순된 용어가 없다.
- [ ] 상품·구매·예약·임상·CRM·알림·통계 소유권이 모든 섹션에서 일관된다.
- [ ] 현재 구현·승인 설계·운영 대기·로드맵 표지가 근거 ledger와 일치한다.
- [ ] 한국어/영어 route와 visual companion 대응이 결정돼 있다.

### 11.2 글 작성 후 검증

- [ ] 한국어 원고와 영어 현지화 원고가 동일한 사례·주장·숫자·source link를 가진다.
- [ ] `clinic-appointment-prologue-hero.png`가 기존 hero 언어와 first viewport 기준을 만족한다.
- [ ] 환자 A 행위·이벤트 흐름과 서비스 권한 경계의 locale별 SVG/PNG가 semantic·geometry·arrowhead·raster QA를 통과한다.
- [ ] 두 diagram이 한국어·영어 프롤로그의 동일한 섹션과 source-backed event/authority를 가리킨다.
- [ ] 기존 Part 1~7에 프롤로그 링크를 추가하고 양 locale의 순서가 일치한다.
- [ ] `git diff --check`를 통과한다.
- [ ] `npm run build`를 실행하고 변경된 한국어·영어 route를 확인한다.
- [ ] `npm test`의 기존 baseline 실패와 새 변경으로 생긴 실패를 구분한다.
- [ ] visual companion 링크·asset·source Markdown snapshot이 유효하다.

## 12. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 상품·구매·예약 용어가 독자에게 같은 것으로 읽힘 | 각 섹션에서 소유자와 불변 snapshot을 반복하고 계획/방문을 별도 표로 유지 |
| 설계 문서가 현재 구현처럼 읽힘 | 네 가지 사실성 표지를 붙이고 Foundation의 제외 범위를 명시 |
| 공개 visual snapshot이 최신 source와 어긋남 | pinned snapshot과 원본 Markdown 링크를 함께 제공하고 build/검증에서 확인 |
| 영어 현지화가 한국어 사례를 새 주장으로 확장함 | locale parity matrix와 claim ledger로 수치·상태·URL을 비교 |
| hero 생성이 본문보다 커져 작업이 지연됨 | 새 companion을 만들지 않고 text-free hero 하나만 생성하며, 렌더 QA 실패 시 기존 series asset 재사용을 대안으로 둠 |
| baseline Pagefind 산출물 검증 실패가 새 글 실패로 오인됨 | 설계·원고 변경 전후 동일 명령의 결과를 비교하고, 실패 원인을 별도 보고 |
