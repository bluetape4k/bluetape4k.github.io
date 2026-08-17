# 예약 알림과 리마인더 운영 글 설계

## 상태

- 설계 승인: 2026-08-17, 사용자 승인
- 글 범위: 한국어·영어 기술 블로그 1편씩
- 시리즈 위치: `[운영 확장 6]`
- 기준 저장소: `bluetape4k/clinic-appointment` `develop`
- 기준 커밋: `f0c7614beed766efc4b88a1a59aa5c370f8fccf7`
- 사이트 저장소: `bluetape4k/bluetape4k.github.io`

## 독자와 질문

주 독자는 예약 서비스 개발자와 병원 운영을 이해해야 하는 PO·STAFF다. 이 글이 답할
질문은 다음과 같다.

> 예약 서비스가 연락처를 저장하지 않아도 알림과 리마인더를 신뢰성 있게 전달하고,
> 실패했을 때 STAFF에게 다음 작업을 보여 주려면 책임을 어떻게 나눠야 하는가?

화면은 기술 요소의 목록이 아니라 운영자가 지금 확인하거나 처리할 대상을 보여 주는
것을 목표로 한다. 결론은 `운영 화면은 더 많은 정보보다 더 명확한 정보를 제공해야
한다`로 고정한다.

## 근거와 사실 경계

### 현재 구현에서 확인할 사실

다음 구현과 테스트를 기준으로 현재 동작을 설명한다.

| 영역 | 근거 | 글에서 설명할 사실 |
| --- | --- | --- |
| 최소 알림 기록 | `docs/requirements/notification.md`, `appointment-event` notification contracts | 예약 변경 트랜잭션은 최소 알림 의도와 멱등성 정보를 아웃박스(outbox)에 기록한다. |
| 발송 시점 프로필 | `MemberNotificationProfileResolver.kt` | 연락처·언어·동의는 회원 시스템에서 발송 직전에 조회하고 영속화하지 않는다. |
| 선점과 결과 | `NotificationOutboxDispatcher.kt`, `NotificationOutboxWorker.kt` | lease·fencing·제한된 재시도로 한 번의 발송 경로와 durable outcome을 관리한다. |
| 상태 조회 | `NotificationStatusQueryService.kt` | STAFF 조회는 상태·reason code·다음 시각·권장 조치만 반환하고 개인정보와 provider payload를 노출하지 않는다. |
| 리마인더 복구 | `NotificationReminderRecoveryScanner.kt`, `AppointmentReminderScheduler.kt` | 미래 발송, catch-up 범위 안의 enqueue, 시간이 지난 리마인더 억제를 구분하고 동일 멱등성 키를 재사용한다. |
| 전달 경로 | `NotificationDeliveryRouteGate.kt`, `NotificationProperties.kt` | `SHADOW`, `CANARY`, `ACTIVE`, `PAUSED`가 현재 운영 범위의 단일 provider 경로를 결정한다. |
| 운영 계약 | `docs/runbooks/notification-outbox-operations.md`, `appointment-notification/README.ko.md` | backlog, oldest age, retry·suppression·exhaustion·lease recovery를 관측하고, 전환 단계와 중단 절차를 분리한다. |

### 글에서 구현으로 단정하지 않을 내용

- 실제 provider 연동과 운영 수치는 합성 시안으로 만들지 않는다.
- `CANARY`와 `ACTIVE` 전환이 모든 병원에서 끝났다고 쓰지 않는다. 코드의 route gate와
  운영 런북의 전환 조건만 설명한다.
- 전체 병원을 한 화면에서 비교하는 rollout 보드는 만들지 않는다.
- 환자 이름·전화번호·이메일·예약번호와 실제 운영 metric을 화면과 이미지에 넣지 않는다.
- 알림 서비스가 회원 정보를 기준 데이터 원본으로 소유한다고 쓰지 않는다. 회원 시스템이
  연락처·언어·동의의 기준 데이터 원본이다.

## 본문 구조

한국어를 먼저 작성하고 영어 글은 같은 사실·섹션·수치·링크·시각자료를 자연스럽게
현지화한다.

1. **문제 제기** — 예약 확정과 알림 전달은 같은 성공이 아니다. 예약 트랜잭션 안에서
   provider 호출을 기다리거나 연락처 스냅숏을 저장하면 장애 복구와 개인정보 경계가
   흐려진다.
2. **책임 분리** — 예약 서비스는 알림 의도와 최소 아웃박스 행을 기록하고, 알림 서비스는
   선점·프로필 조회·템플릿·provider 호출·결과 저장을 담당한다.
3. **발송 시점의 최신 프로필** — 연락처가 없거나 동의가 철회된 경우 억제하며, 이름·연락처·본문·원본 오류를 아웃박스와 시도 이력에 저장하지 않는다.
4. **STAFF 운영 화면** — 상단 카드와 조치 큐를 사용해 상태와 다음 작업을 분리한다.
   `CONSENT_DENIED`, `DESTINATION_UNAVAILABLE`, `REMINDER_WINDOW_MISSED`,
   `EXHAUSTED`를 각각 운영자가 이해할 수 있는 조치로 풀어 쓴다.
5. **리마인더 복구** — startup/hourly bounded scan, keyset cursor, checkpoint, future
   scheduling, catch-up window, missed suppression, already-exists 수렴을 설명한다.
6. **재시도와 중복 방지** — durable retry와 provider 호출 제한, lease·fencing·멱등성
   키의 역할을 분리해 설명한다. “정확히 한 번”이라는 표현 대신 중복 호출을 줄이고
   상태를 한 번만 수렴시키는 계약이라고 쓴다.
7. **운영 범위의 전달 경로** — 선택한 clinic scope에서 `SHADOW`·`CANARY`·`ACTIVE`·`PAUSED`가
   어떤 경로를 허용하는지 설명한다. 전체 병원 rollout 보드는 제외한다.
8. **구현·설계·운영 시안 구분** — 현재 코드, 운영 런북의 전환 조건, 합성 UI를 표로 분리한다.
9. **마무리** — STAFF가 확인해야 할 상태, reason code, 다음 작업, 개인정보 경계를 짧게 정리한다.

## 시각자료 설계

### 운영 화면: A 중심 + B 보조

파일 기준 이름:

- `clinic-appointment-notification-reminder-operations-screen-ko.svg/.png`
- `clinic-appointment-notification-reminder-operations-screen-en.svg/.png`

화면 구성은 다음과 같다.

- 상단 카드: 발송 가능 대기, 재시도 대기, 억제, 소진
- 중앙 조치 큐: 상태, reason code, 권장 조치, 다음 시도 시각
- 선택한 범위의 상세 패널: tenant·clinic 범위를 고정하되 member·destination·payload는 표시하지 않음
- 하단 보조 패널: 리마인더 복구 실행의 `notYetDue`, `enqueued`, `suppressed`,
  `alreadyExists`, cursor/checkpoint
- rollout은 전체 병원 목록이 아니라 현재 선택한 운영 범위의 route 배지 하나로만 표현

운영 화면은 정적 합성 자료이므로 기존 시리즈와 동일한 SVG → CairoSVG PNG 방식을
사용한다. 카드와 표의 글자를 줄여서 맞추지 않고, 가장 긴 조치 문구에 맞춰 캔버스와
행 높이를 넉넉하게 잡는다.

### 연결 흐름 diagram

파일 기준 이름:

- `clinic-appointment-notification-reminder-flow-01-ko.svg/.png`
- `clinic-appointment-notification-reminder-flow-01-en.svg/.png`

독자 질문은 “예약 변경이 실제 알림 발송과 운영 조치로 어떻게 이어지는가?”다. 노드와
관계는 다음으로 제한한다.

1. Appointment command transaction
2. Notification outbox
3. Route gate
4. Lease/fencing claim
5. Member profile resolver
6. Typed template renderer
7. Provider channel
8. Durable outcome / STAFF status query
9. Reminder recovery scanner (보조 branch)
10. 최종 상태 결정

연결선은 모두 수평·수직 구간과 rounded orthogonal corner로 그린다. 카드 경계에는
수직으로 진입하고, 시작·종료 포트를 분리하며, 서로 다른 관계가 선분이나 corridor를
공유하지 않도록 한다. 성공·억제·재시도·소진·복구 결과는 각기 다른 색을 사용하고
화살촉도 연결선과 같은 색으로 만든다. 리마인더 branch는 `future`, `due`, `missed`,
`already exists`를 명시적인 최종 상태 결정 노드에서 분기한다. 수평 점선에 의미를
맡기지 않는다.

### Hero

기존 Operations 5 hero를 복제하지 않는다. 알림 outbox 카드, 운영자 조치 큐, 리마인더
복구 패널을 중심으로 한 새로운 3D miniature workbench 장면을 만든다. 이미지 안에는
환자 식별 정보·실제 수치·읽어야 하는 긴 문장을 넣지 않는다.

## 관련 자료와 링크 규칙

본문의 `근거 자료`와 `시리즈 링크`에는 같은 예약서비스 시리즈의 다른 글을 우선
연결한다.

- 운영 확장 3: 예약 복구는 영향 범위 확인부터 시작한다
- 운영 확장 4: CRM 프로필이 바뀌어도 확정 예약은 자동으로 변경하지 않는다
- 운영 확장 5: 내원 확인과 시술 완료는 다른 사실이다
- 설계 1 또는 프롤로그의 책임 경계 설명

본문의 관련 자료에는 GitHub Issue·PR URL을 넣지 않는다. 구현 근거가 필요한 경우에는
현재 기준 커밋의 source/docs 링크만 별도 `구현 근거` 항목으로 둔다. 링크 대상은
`f0c7614beed766efc4b88a1a59aa5c370f8fccf7`에 고정한다.

## 용어 계약

- `아웃박스(outbox)`, `스냅숏`, `빈시간`, `예약 서비스`, `최종 상태 결정`을 기존
  시리즈와 동일하게 쓴다.
- `provider`는 본문에서 `제공자(provider)`로 처음 풀어 쓴 뒤 `provider`를 유지한다.
- `worker`는 `워커`, `scheduler`는 `스케줄러`로 쓴다.
- `suppressed`는 `억제`, `exhausted`는 `소진`, `retry wait`는 `재시도 대기`로 통일한다.
- 연락처를 저장한다는 표현 대신 “발송 직전에 읽고 메모리에서 사용한다”고 쓴다.

## 수용 기준과 검증

### 글·사이트

- [ ] 한국어·영어 글의 frontmatter, 제목, 날짜, 시리즈 순서, hero, alt text, 카드 설명이 대응한다.
- [ ] 두 글 모두 운영 화면과 flow diagram의 해당 locale PNG를 직접 삽입한다.
- [ ] 시리즈 footer는 `ClinicAppointmentSeries`로 연결하고, 관련 자료에는 Issue·PR 링크가 없다.
- [ ] 현재 구현·승인된 설계·운영 시안을 서로 다른 표와 문단으로 구분한다.
- [ ] `git diff --check`, `npm test`, `npm run check:manual`, `npm run check:visual-companions`, `npm run build:publish`를 실행한다.

### 시각자료

- [ ] semantic ledger가 source revision과 모든 node/edge 출처를 가진다.
- [ ] SVG XML, text hazard, semantic, connector, endpoint, mixed-corner, arrowhead, geometry, visual PNG 감사를 통과한다.
- [ ] 한·영 PNG를 각각 full-size로 확인하고 글자 잘림·연결선 침범·화살촉 색상 불일치가 없다.
- [ ] 운영 화면은 카드 제목과 조치 큐 열 제목이 잘리지 않고, 복구 패널이 A 화면의 보조 정보로 읽힌다.

### Writer 체크리스트

- SPW-01: 독자·목적·기준 커밋·출처·미지원 주장을 이 설계 문서에 고정한다.
- SPW-02: 문제, 책임, 운영 화면, 복구, 실패, 경계, 검증 구조를 포함한다.
- SPW-03: 한국어 자연스러움 체크리스트와 용어집을 적용한다.
- SPW-04: 글의 모든 기술 주장을 source/docs와 대조한다.
- SPW-05: 렌더링된 MDX와 시각자료를 마지막으로 다시 읽는다.

## 범위 밖

- 실제 SMS·email provider 연동
- 병원 전체 rollout 현황판과 실제 canary 수치
- 환자별 연락처·동의 이력 조회 화면
- 알림 정책이나 예약 상태의 신규 구현
- 기존 글의 전체 재작성
