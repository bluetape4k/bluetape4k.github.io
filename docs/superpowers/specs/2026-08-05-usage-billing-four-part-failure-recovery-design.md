# 사용량 과금 4부작과 장애 복구 서술 설계

## 상태

- 작성일: 2026-08-05
- 게시 저장소: `bluetape4k/bluetape4k.github.io`
- 구현 근거: `bluetape4k/bluetape4k-workshop`
- 언어: 한국어·영문
- 공개 간격: Part 1부터 하루 간격
- 현재 공개일: Part 1 — 2026-08-05
- 예정 표시일: Part 2 — 2026-08-06, Part 3 — 2026-08-07, Part 4 — 2026-08-08

## 목적

사용량 과금 시리즈를 원장형, Event Sourcing, 마이크로서비스, 장애 복구 운영의 네 편으로 구성한다. 각 편은
정상 흐름뿐 아니라 해당 설계에서 발생하는 장애, 자동 보호 범위, 운영자 조치와 복구 완료 조건을 함께 설명한다.

앞선 글의 핵심 설명은 필요한 만큼 반복한다. 독자가 이전 글을 읽었다고 가정해 전제를 생략하지 않는다. 반복한
내용에는 이전 글, Workshop README, 대표 구현과 테스트 링크를 제공해 더 자세한 설명으로 이동할 수 있게 한다.

## 근거 범위

| Part | 구현 근거 | 주된 독자 질문 |
| --- | --- | --- |
| Part 1 | `usage-metering-billing-ledger` | 하나의 PostgreSQL에서 중복·시간·마감·보정을 어떻게 안전하게 처리하는가 |
| Part 2 | `usage-metering-billing-event-sourcing` | Event Store, Replay와 Projection을 도입하면 무엇을 더 운영해야 하는가 |
| Part 3 | 다섯 서비스와 `usage-billing-microservices-composition-tests` | 서비스별 데이터 소유권과 at-least-once 전달의 실패를 어떻게 격리하는가 |
| Part 4 | 세 구현과 각 운영·복구 테스트 | 장애 탐지부터 복구 완료 판정까지 공통 Runbook을 어떻게 만드는가 |

Part 4는 새로운 범용 과금 Framework를 주장하지 않는다. 앞선 세 구현에서 실제로 검증한 실패 경로를 공통
운영 절차로 재구성한다.

## 공통 장애 대응 서술 계약

각 편의 장애 대응 절은 다음 질문에 답한다.

1. 어떤 장애가 발생하는가.
2. 어떤 상태와 지표로 탐지하는가.
3. 시스템이 자동으로 어디까지 보호하는가.
4. 운영자가 어떤 순서로 복구하는가.
5. 무엇을 검증해야 복구 완료로 판단하는가.
6. 어떤 조치를 금지하는가.

장애 대응을 예외 목록으로만 나열하지 않는다. `정상 처리 → 실패 지점 → 남은 기준 데이터 → 허용된 복구 →
정합성 검증 → 트래픽 재개` 순서로 설명한다.

## Part별 구성

### Part 1 — 원장형 과금과 재시작 가능한 마감

기존 설명에 통합 장애 대응 절을 추가한다.

- HTTP 응답 유실과 Command Receipt takeover
- 동일 생산자 Event의 중복과 Digest 충돌
- 가격 구간 누락에 따른 `FAILED_VALIDATION`
- Batch Commit 직후 Worker 중단과 Checkpoint 재개
- 청구서 확정 이후 발견된 오류와 append-only 보정
- Reconciliation Finding이 남아 있는 동안 복구 완료를 선언하지 않는 기준

### Part 2 — Event Sourcing과 Projection 운영

기존 Poison Event 표를 복구 절차와 완료 조건까지 확장한다.

- Snapshot 검증 실패와 전체 Replay 전환
- Event Hash 불일치와 이력 처리 중단
- Upcast 경로 단절
- Projection Lag 증가와 bounded read-your-write 실패
- Poison Event 격리와 `FAILED` Generation
- ACTIVE Generation 부재와 RETIRED 복구 또는 새 Generation 재구축
- Replay 결과와 Projection 합계의 Reconciliation 완료 조건

### Part 3 — 다섯 서비스와 Outbox·Inbox

다음 흐름으로 새 글을 작성한다.

1. 단일 트랜잭션을 서비스별 로컬 트랜잭션과 메시지 계약으로 분리한다.
2. Meter, Usage, Billing, Invoice, Query의 데이터 소유권을 설명한다.
3. Local Effect와 Outbox를 함께 Commit하고, Consumer가 Inbox를 먼저 판정하는 절차를 설명한다.
4. 중복 전달과 동일 ID·다른 Digest를 구분한다.
5. Aggregate Version Gap과 순서 역전을 설명한다.
6. 일시적 DB·Broker 장애와 영구 계약 오류를 서로 다른 경로로 처리한다.
7. Poison Event 격리, Redrive Audit과 외부 Retained Source 책임을 설명한다.
8. 단계적 서비스 추출과 Rollback 조건을 설명한다.

Part 3는 기존 통합 Visualization의 `#microservices` 화면과 연결한다. 전체 MSA 구조는 Workshop의
`usage-billing-service-boundaries-01`을 기준 자료로 삼아 다크 스타일의 한국어·영문 자산으로 다시 제작한다.
이 다이어그램은 다섯 독립 서비스, 서비스별 PostgreSQL, Kafka Topic과 운영 보호선을 한 화면에서 설명한다.
서비스 소유권 표 뒤에는 기존 Outbox·Inbox 상세 다이어그램을 유지해 로컬 기준 데이터와 전달 판정 구조를
확대해서 보여 준다. 두 그림은 각각 `전체 실행·저장·메시징 경계`와 `서비스 내부 전달 계약`을 담당한다.
대표 이미지는 글자가 없는 동일 자산을 공유한다.

### Part 4 — 장애 복구와 운영 검증

제목은 다음과 같이 정한다.

- 한국어: `사용량 과금 장애 복구: 탐지, 격리, 재처리와 정합성 검증`
- 영어: `Recovering Usage Billing: Detection, Isolation, Reprocessing, and Reconciliation`

Part 4는 다음 공통 절차를 중심으로 구성한다.

1. 장애 신호를 수집하고 영향을 받은 과금 경계를 식별한다.
2. 일시적 장애, 영구 계약 오류, 정합성 오류를 분류한다.
3. 건강한 경로를 유지하면서 실패 작업이나 Event를 격리한다.
4. 기존 기준 데이터를 사용해 재시도, Replay, Rebuild 또는 보정을 선택한다.
5. 원장·Event Store·Projection·서비스별 Read Model을 Reconciliation한다.
6. 불변식, Cursor, Lag, Quarantine, 금액 합계가 모두 통과한 뒤 트래픽을 재개한다.

Part 4의 다크 다이어그램은 이 여섯 단계를 수직 흐름으로 표현한다. 분기점에서는 `일시적 장애`, `영구 계약
오류`, `정합성 오류`가 각각 재시도, 격리·수정·Redrive, Replay·Rebuild·Adjustment로 이어지고 마지막에 하나의
복구 완료 Gate로 합류한다. 한국어·영문 SVG 원본과 PNG를 각각 제공한다.

## 참고 자료 계약

각 글의 마지막에는 독자가 실제로 읽을 가치가 있는 자료만 제공한다.

- 같은 시리즈의 선행·후속 글
- 통합 대화형 시각 자료의 해당 Fragment
- Workshop의 대표 README
- 핵심 Service·Repository·Worker 소스
- 장애 경계를 증명하는 대표 통합 테스트
- 본문의 선택 기준을 보강하는 외부 개념 자료

내부 작업 문서나 원시 Issue·PR 자료는 독자가 구현 의사결정을 이해하는 데 직접 필요할 때만 링크한다.

## 공개와 전달 경계

각 Part는 독립 커밋과 브랜치로 준비한다.

1. `docs/usage-billing-part2` — Part 1 장애 대응 보강과 Part 2
2. `docs/usage-billing-part3` — Part 3, Part 2를 기준 Branch로 사용
3. `docs/usage-billing-part4` — Part 4, Part 3를 기준 Branch로 사용

이를 통해 Part 2, Part 3, Part 4를 하루 간격으로 병합·배포할 수 있다. 표시 날짜만 미래로 설정해 자동 공개된다고
가정하지 않는다. 실제 공개는 각 Branch의 CI·리뷰·명시적 병합 승인과 배포 성공을 확인한 시점에 완료된다.

## 검증 기준

- 네 편 모두 앞선 글을 읽지 않아도 중심 시나리오와 기준 데이터를 이해할 수 있다.
- 각 편의 장애 대응 절이 공통 여섯 질문에 답한다.
- 한국어·영문 제목, 절, 숫자, 링크, 다이어그램과 시리즈 탐색이 일치한다.
- 독자용 링크는 불변 Workshop Commit을 가리키며 실제 경로가 존재한다.
- 다이어그램은 `bluetape-diagram`의 공통·종류별 검사를 통과하고 최종 PNG를 원본 크기로 검토한다.
- `npm test`, `npm run build`, `git diff --check`가 각 전달 단위에서 통과한다.
- PR, 병합과 배포는 해당 단계의 별도 권한 없이는 수행하지 않는다.
