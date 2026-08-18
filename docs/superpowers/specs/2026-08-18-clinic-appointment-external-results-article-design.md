# 운영 확장 7 — 예약 결과가 외부 시스템과 통계로 전달되는 과정

## 상태

- 산출물: 한국어 원문과 영어 현지화 블로그 글
- 분류: Type E — 공개 기술문서 유지보수
- 독자: 예약 서비스를 운영하거나 구현하는 STAFF, 개발자, PO, 병원 관계자
- 기준 소스: `clinic-appointment` develop `f0c7614beed766efc4b88a1a59aa5c370f8fccf7`
- 공개 경로:
  - `/ko/blog/clinic-appointment-external-results/`
  - `/blog/clinic-appointment-external-results/`

## 독자가 가져가야 할 한 문장

예약 서비스가 커밋한 사실과 외부 시스템·통계가 비동기로 재구성한 결과는 같은 저장 행이 아니다. 따라서 아웃박스, consumer inbox, 통계 projection, 현재 예약 집계를 각각 확인하고, 운영 화면에는 상태와 다음 작업을 함께 보여 줘야 한다.

## 사실·설계·운영 경계

### 현재 구현으로 확인할 내용

- `appointment-messaging`의 `AppointmentOutboxWriter`와 `SchedulingOutboxEvents`가 예약 변경과 메시지 의도를 같은 Exposed 트랜잭션에서 기록한다.
- relay는 DB lease와 fencing token으로 행을 선점하고, Kafka I/O는 DB 트랜잭션 밖에서 실행한다. 모델은 at-least-once이며 같은 `eventId`가 재전송될 수 있다.
- `AppointmentEventEnvelope`는 schema version 1 JSON 계약을 사용하고, strict codec과 허용된 event/payload만 통과시킨다.
- `AppointmentConsumerRuntime`은 `(logicalConsumerId, logicalStreamId, eventId)` inbox로 중복을 제거하고, scope/schema 오류는 metadata-only quarantine으로 보낸다.
- 알림 consumer와 통계 consumer는 서로 다른 group과 inbox identity를 사용한다.
- `AppointmentStatsProjectionConsumer`와 `AppointmentStatsProjectionRepository`는 aggregate lock을 먼저 확보하고 최신 event version만 projection bucket에 반영한다. 날짜 또는 상태가 바뀌면 이전 bucket을 감소시키고 새 bucket을 증가시킨다.
- `DashboardStatsService`는 projection 행이 의미를 충족하는 기간에만 projection을 사용하고, 그 밖의 기간은 현재 `Appointments` 집계를 fallback으로 사용한다.

### 승인된 설계로 설명할 내용

- local JSON Schema와 운영 Schema Registry의 `BACKWARD_TRANSITIVE` compatibility를 readiness에서 확인한다.
- malformed/schema/scope 오류는 원문을 재시도하지 않고 bounded reason code와 payload hash만 남기는 quarantine 경로로 보낸다.
- replay는 운영 consumer group offset을 되감지 않고, 승인·dry-run·감사 기록을 거친 별도 group에서 같은 event identity를 재사용한다.
- projection backfill은 현재 예약 집계를 대체하는 작업이 아니다. `appointmentDate`와 completeness를 증명하는 별도 read model이 준비될 때까지 현재 예약 테이블이 dashboard의 기준 데이터 원본이다.

### 운영 rollout이 아직 증명하지 못한 내용

- 실제 production Kafka broker crash/rebalance, Schema Registry endpoint·TLS·인증, production MySQL migration과 배포 SLO는 저장소 테스트만으로 증명하지 않는다.
- local PostgreSQL consumer benchmark 값은 deployment SLO가 아니다. 글에서는 수치를 새로 제시하지 않고, benchmark와 production evidence를 분리한다.
- 보상·환불 판단은 예약 서비스가 추론하지 않는다. CRM/commerce 또는 임상·결제 소유 서비스가 별도 fact와 정책을 책임진다.

## 본문 흐름

1. 예약 확정과 외부 전달을 같은 결과로 오해하는 문제를 제시한다.
2. 예약 transaction → transactional outbox → Kafka relay의 내구성 경계를 설명한다.
3. JSON Schema, consumer inbox, 알림/통계 consumer의 독립성을 설명한다.
4. 통계 projection의 최신 version·날짜/상태 bucket 이동·aggregate lock을 예로 든다.
5. dashboard가 projection을 무조건 기준으로 삼지 않고 현재 예약 집계로 fallback하는 이유를 설명한다.
6. `RETRY`, `QUARANTINE`, 승인된 replay와 backfill을 운영자가 구분하는 조치 큐를 제시한다.
7. 현재 구현·승인된 설계·운영 rollout 대기를 표로 구분하고, 예약을 다시 쓰지 않는 원칙으로 마무리한다.

## 시각자료

### 영웅 이미지

- `public/assets/clinic-appointment-external-results-hero.png`
- 기존 운영 확장 영웅 이미지의 어두운 3D miniature workbench 톤을 유지한다.
- 텍스트·로고·환자 식별정보 없이, 예약 아웃박스에서 Kafka를 거쳐 알림·통계 projection과 운영 대시보드로 갈라지는 장면을 보여 준다.

### 데이터 흐름도

- `public/assets/clinic-appointment-external-results-flow-01-{ko,en}.svg`
- 같은 이름의 PNG를 본문에 삽입한다.
- 카드 순서: `Appointment transaction` → `Scheduling outbox` → `Kafka relay` → `Notification consumer` / `Statistics consumer` → `Inbox + handler transaction` → `Projection / notification outcome`.
- 모든 연결선은 카드 경계에서 시작하고 끝나는 수평·수직 rounded orthogonal path로 직접 작성한다. 대각선, 허공 시작, 수평 점선과 의미 없는 수직선은 사용하지 않는다.
- 분기 앞에는 `최종 상태 결정`/`Final State Decision` 카드를 둔다. `PROCESSED`, `RETRY`, `QUARANTINED`, `REPLAY_PENDING` 결과를 서로 다른 색과 같은 색의 화살촉으로 연결한다.
- `SCOPE`, `VERSION`, `DATA` 배지를 상단에 둔다. 버전은 기준 commit의 앞 7자리만 표시한다.

### 운영 화면 시안

- `public/assets/clinic-appointment-external-results-operations-screen-{ko,en}.svg`
- 같은 이름의 PNG를 본문에 삽입한다.
- 상단 카드: `이벤트 대기`, `처리 중`, `재시도 대기`, `격리·검토 필요`.
- 중앙 왼쪽: `조치 큐` 표. 열은 `항목 참조`, `consumer`, `상태`, `사유 코드`, `다음 작업`이며 제목이 잘리지 않게 충분한 열 너비를 둔다.
- 중앙 오른쪽: 선택한 항목의 scope, schema version, event version, projection 상태, 다음 작업만 표시한다. raw payload·환자 정보·credential은 표시하지 않는다.
- 하단: 통계 projection의 최신 상태, 현재 예약 집계 fallback, 승인된 replay/backfill의 `dry-run` 결과를 별도 카드로 보여 준다.
- 합성 데이터임을 캡션과 화면 하단에 명시한다.

## 용어 계약

- `예약 서비스`, `아웃박스(outbox)`, `consumer inbox`, `통계 projection`, `기준 데이터 원본`, `최종 상태 결정`, `조치 큐`를 글 전체에서 동일하게 사용한다.
- `appointment`는 문맥상 `예약`으로 옮기고, 식별자·class·API 이름은 그대로 둔다.
- `at-least-once`, `eventId`, `schemaVersion`, `tenantGroupId`, `clinicId`, `eventVersion`은 코드 토큰으로 보존한다.
- `backfill`은 `백필(backfill)`, `replay`는 `재처리(replay)`, `quarantine`은 `격리(quarantine)`로 첫 등장에 풀어 쓴다.

## 근거 링크 원칙

공개 글의 관련 자료에는 GitHub Issue·PR 링크를 넣지 않는다. 같은 시리즈 글과 현재 commit에 고정한 설계 문서·런북·소스코드만 연결한다. 기준 자료:

- `/ko/blog/clinic-appointment-notification-reminder/`
- `/ko/blog/clinic-appointment-attendance-fulfillment/`
- `docs/superpowers/specs/2026-08-05-issue-41-transactional-outbox-messaging-design.md`
- `docs/superpowers/specs/2026-08-06-issue-42-external-consumers-schema-design.md`
- `docs/lessons/2026-08-08-stats-projection-current-state.md`
- `appointment-messaging` README, outbox·consumer·schema registry·replay source
- `AppointmentStatsProjectionConsumer`, `AppointmentStatsProjectionRepository`, `DashboardStatsService`

## 완료 조건

- 한·영 frontmatter, 제목, 날짜, tags, asset 경로, source links, bottom series navigation이 일치한다.
- 시리즈 registry에 `operations-7`을 추가하고, 기존 운영 확장 글의 다음 링크와 현재 글의 이전/다음 navigation이 맞는다.
- diagram과 운영 화면은 SVG 원본과 PNG를 모두 보존하고, PNG를 실제 MDX 본문에 삽입한다.
- `git diff --check`, 관련 ecosystem tests, `npm run build`가 통과한다.
- 한국어 제목·section·표·alt text·캡션을 `bluetape-writer` 자연스러운 한국어 기준으로 다시 읽는다.
- 실제 production rollout이 증명되지 않은 항목을 현재 구현처럼 쓰지 않는다.
