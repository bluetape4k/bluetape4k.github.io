# 예약 제어 플레인 독립 글 설계

## 목표

`bluetape4k-workshop/commerce/reservation-control-plane` 예제를 중심으로, 예약 요청이 동시에 몰리고 재시도가 반복되며 Redis가 일시적으로 실패하더라도 정원을 넘기지 않는 설계를 설명한다. 예제 기능을 나열하는 대신 현실에서 부딪히는 문제에서 출발해 코드와 테스트가 무엇을 보장하는지, 무엇까지는 보장하지 않는지를 구분한다.

이 글은 `clinic-appointment` 시리즈의 후속 Part가 아니라 독립 글로 발행한다. 다만 예약 최적화, 재배정, 멱등성, Transactional Outbox 글과 자연스럽게 연결해 독자가 관련 주제를 더 깊게 따라갈 수 있게 한다.

## 작업 유형과 범위

- 작업 유형: Type E - Maintenance
- 저장소: `bluetape4k.github.io`
- 근거 저장소: `bluetape4k-workshop`의 `develop` 브랜치
- 글 형태: 독립적인 실전 예제 글
- 로케일: 한국어 우선 작성, 한국어 검수 후 영어판을 자연스럽게 현지화
- 발행 범위: 로컬 작성과 검증까지. 배포와 병합은 별도 승인 없이는 수행하지 않는다.
- 시각 자료: hero 이미지 1개에 더해 dark style Architecture 1장과 Sequence Diagram 2장을 SVG/PNG 쌍으로 제작한다. 벤치마크 차트는 만들지 않는다.

## 제목과 경로

제목은 초안 단계에서 바꿀 수 있다. 첫 작업 제목은 문제를 바로 드러내는 다음 문장으로 둔다.

- 한국어 작업 제목: `예약 요청이 몰릴 때 정원을 넘기지 않는 방법`
- 영어 작업 제목: `Keeping Reservation Capacity Safe Under Concurrent Demand`
- 한국어 경로: `src/content/docs/ko/blog/reservation-control-plane-postgresql-authority.mdx`
- 영어 경로: `src/content/docs/blog/reservation-control-plane-postgresql-authority.mdx`

제목은 바뀌더라도 글의 중심 주장은 유지한다. 예약 수량의 최종 판단은 PostgreSQL 트랜잭션 안에서 내리고, Redis는 중복 억제와 만료 정리 조정 같은 보조 역할만 맡는다.

## 독자와 성공 기준

주 독자는 Spring Boot와 Kotlin으로 예약, 재고, 좌석, 쿠폰처럼 수량이 제한된 자원을 다루는 개발자다. 읽은 뒤 다음 질문에 답할 수 있어야 한다.

1. Redis 세마포어만으로 예약 정합성을 보장하면 왜 위험한가?
2. PostgreSQL 행 잠금, revision, 수량 검사가 어떤 경계 안에서 정원을 지키는가?
3. 같은 `Idempotency-Key`를 다시 보냈을 때 재실행과 응답 재생을 어떻게 구분하는가?
4. 만료된 hold와 waitlist offer를 어떤 소유권 규칙으로 처리하는가?
5. Redis 장애 시 무엇은 계속 안전하고 무엇은 느려지거나 중복 실행될 수 있는가?
6. 예제 테스트가 증명하는 범위와 아직 운영 환경에서 검증해야 할 범위는 무엇인가?

성공한 글은 README 요약에 머물지 않고, 각 핵심 주장에 실제 소스 또는 테스트 링크를 연결한다. 코드 조각은 한 번에 하나의 보장만 설명하며, 테스트 이름을 근거로 실패 시나리오를 구체화한다.

## 글의 전개

공통 전개는 다음 순서를 따른다.

`현실에서 부딪히는 문제 → 핵심 코드 경로 → 실패 시나리오와 테스트 → 구현이 보장하지 않는 것 → 기존 글과 함께 읽기`

### 1. 현실에서 부딪히는 문제

동일한 마지막 자리를 여러 사용자가 동시에 hold하려는 상황에서 시작한다. 여기에 클라이언트 타임아웃 후 재시도, hold 만료, waitlist offer, Redis 연결 실패가 겹치면 단순한 `available > 0` 조회나 Redis 락만으로는 정합성을 설명할 수 없음을 보여준다.

기능 목록부터 소개하지 않는다. 독자가 겪는 장애 장면을 먼저 제시하고, 글 전체에서 해결할 질문을 고정한다.

글 전체는 다음 하나의 예제 시나리오를 이어서 사용한다.

1. 정원이 1이고 resource revision이 42인 상태에서 Alice와 Bob이 같은 revision으로 hold를 요청한다.
2. Redis가 응답하지 않아 두 요청은 local fallback으로 PostgreSQL까지 진행한다.
3. Alice의 capacity CAS만 성공하고 Bob의 갱신은 0행으로 끝난다. Alice에게 보내던 HTTP 응답은 timeout으로 유실된다.
4. Alice가 같은 `Idempotency-Key`로 재시도하면 PostgreSQL에 저장된 응답을 재생한다. Bob은 FIFO waitlist에 들어간다.
5. Alice가 hold를 취소하면 `occupiedCount`를 0으로 내리지 않고 Bob을 위한 `ACTIVE` offer를 만든다.
6. Bob이 offer를 수락하면 점유 수량은 1로 유지되고 소유권만 Bob에게 넘어간다.

resource revision 42는 흐름을 이해하기 위한 예시 값이며, 구현의 고정 초기값처럼 설명하지 않는다.

### 2. 최종 판단은 PostgreSQL 트랜잭션에서 한다

예약 수량을 바꾸는 명령이 PostgreSQL 트랜잭션, 행 잠금, revision, 현재 수량 검사를 통과해야 한다는 점을 실제 서비스와 저장소 코드로 설명한다. PostgreSQL을 최종 권한으로 두는 이유는 특정 데이터베이스를 홍보하기 위해서가 아니라, 수량과 상태 전이를 하나의 원자적 경계에서 판단하기 위해서다.

Redis의 입장 제어가 허용한 요청도 PostgreSQL 검사를 통과하지 못하면 예약되지 않는다는 선택 규칙을 명시한다.

### 3. hold 수명 주기와 소유권을 분리한다

hold 생성, 확정, 연장, 취소, 만료를 하나의 상태 변경으로 뭉개지 않고 각각의 명령과 시간 정책으로 설명한다. `X-Reservation-Owner`가 다른 소유자의 hold나 offer 수락을 막는 경계를 보여준다.

waitlist는 단순 대기 목록이 아니라 빈 자리가 생겼을 때 제한된 시간 동안 특정 소유자에게 offer를 부여하는 흐름으로 설명한다. offer 만료와 다음 대기자 진행도 함께 다룬다.

### 4. 멱등성은 키뿐 아니라 요청 지문까지 비교한다

동일한 `Idempotency-Key`와 동일한 요청 지문은 저장된 응답을 재생하고, 같은 키에 다른 요청 지문을 사용하면 충돌로 처리하며, 같은 요청이 아직 처리 중이면 재시도 가능한 응답을 돌려주는 계약을 설명한다.

여기서는 멱등성을 중복 요청을 무시하는 장치로 축약하지 않는다. 어떤 응답이 재생되고 어떤 요청이 충돌하며 어떤 상태가 아직 미완료인지 구분하는 HTTP 계약으로 다룬다.

### 5. Redis는 보조 장치이며 장애 시 fail-open 한다

Redis가 담당하는 중복 억제, 만료 sweeper 조정, best-effort admission control을 분리해 설명한다. Redis 장애가 PostgreSQL의 예약 정합성을 무너뜨리지 않도록 로컬/PostgreSQL 경계로 계속 진행하는 설계를 보여준다.

`LettuceSemaphore` lease는 프로세스가 비정상 종료되면 permit이 Redis 재시작이나 키 초기화 전까지 남을 수 있다는 한계를 명시한다. 이 경우 처리량과 입장 제어는 나빠질 수 있지만 PostgreSQL의 최종 수량 검사는 유지된다는 점을 구분한다.

### 6. 실패 시나리오는 통합 테스트로 읽는다

다음 테스트를 중심으로 글의 주장을 검증한다.

- 실제 PostgreSQL과 HTTP server를 사용하는 통합 테스트
- Redis 없이 애플리케이션이 기동하고 요청을 처리하는 테스트
- 멱등성 응답 재생, 요청 지문 충돌, 처리 중 응답 테스트
- admission gate와 수량 초과 방지 테스트
- hold 만료와 sweeper leader 조정 테스트
- waitlist 등록, offer 생성, 소유자 범위 수락 테스트
- durable notification/outbox 테스트

테스트 이름만 나열하지 않고, 각 테스트가 어떤 실패를 재현하고 어떤 관찰 가능한 결과를 확인하는지 짧게 설명한다.

### 7. 이 예제가 아직 보장하지 않는 것

다음 항목은 구현 완료로 과장하지 않고 발전 과제로 명시한다.

- 다중 리전과 네트워크 분할 환경의 정합성
- 장시간 부하에서의 처리량과 대기 시간 수치
- Redis semaphore permit 누수의 자동 복구 정책
- sweeper가 장시간 중단된 경우의 운영 복구 절차
- PostgreSQL 장애 조치 중 진행 중인 멱등 요청의 처리 정책
- 운영 메트릭, 경보 임계값, SLO
- 개인정보와 소유자 헤더를 실제 인증 주체에 연결하는 보안 경계

이 절은 예제를 깎아내리는 결론이 아니라, 코드가 증명한 범위와 운영 환경에서 추가로 증명해야 할 범위를 분리하는 역할을 한다.

### 8. 기존 글과 함께 읽기

아래 주제와 직접 연결되는 기존 글을 선별한다.

- `clinic-appointment` Part 4: 한 건의 예약 가능 시간 조회와 전체 일정 최적화의 차이
- `clinic-appointment` Part 6: 휴진과 장비 고장 이후 재배정 흐름
- `clinic-appointment` Part 7: 구현 이후 검토해야 할 운영 계약
- Transactional Outbox: 예약 상태 변경 뒤 알림을 유실하지 않는 방법
- 멱등성 관련 글: 재시도와 중복 명령의 계약

관련 글 링크는 본문 논리를 대신하지 않으며, 현재 글의 결론 뒤에 다음 읽을거리로 제공한다.

## 시각 자료 설계

세 도식은 사용자 선택에 따라 본문 앞에 모으지 않고 관련 설명 바로 뒤에 나누어 배치한다.

| 자산 | 독자가 확인할 질문 | 본문 위치 |
| --- | --- | --- |
| `reservation-control-plane-architecture-01.svg/.png` | Redis와 PostgreSQL 중 누가 어떤 결정을 맡는가? | 예제 시나리오와 구성 요소 소개 직후 |
| `reservation-control-plane-last-seat-retry-sequence-02.svg/.png` | Redis 장애와 동시 요청, timeout 재시도가 겹칠 때 마지막 자리는 어떻게 한 번만 배정되는가? | `마지막 한 자리는 한 번의 조건부 갱신으로 지킨다` 절 |
| `reservation-control-plane-waitlist-handoff-sequence-03.svg/.png` | hold 취소 뒤 점유 수량을 풀지 않고 FIFO 첫 대기자에게 어떻게 넘기는가? | `hold를 취소할 때 자리를 바로 비우지 않을 수도 있다` 절 |

### Architecture

Architecture는 시간 순서가 아니라 정적 책임과 권한 경계를 보여준다.

- Request edge: Client와 Reservation HTTP API
- Execution guards: node-local bulkhead, Redis semaphore, Redis suppression lock
- PostgreSQL authority: idempotency record, capacity resource, hold, waitlist entry, offer, notification outbox
- Background work: expiry sweeper와 notification worker

Client에서 HTTP API, local bulkhead, PostgreSQL로 이어지는 필수 경로와 Redis advisory 경로를 구분한다. Redis 오류 시 PostgreSQL 경로가 유지됨을 dashed fallback 관계와 범례로 표현한다. PostgreSQL 카드군은 수량, 상태, 소유권, 재생 응답을 최종 결정하는 단일 authority boundary로 묶는다. Architecture에 메시지 번호나 `alt` frame을 넣지 않는다.

### Sequence 1: 마지막 자리 경쟁과 재시도

참여자는 Alice, Bob, Reservation API, Local/Redis Gate, PostgreSQL로 제한한다. 다음 흐름을 번호가 보이는 message pill로 표현한다.

1. Alice와 Bob이 같은 expected resource revision으로 hold를 요청한다.
2. local bulkhead는 두 요청의 DB 진입을 제한하되 허용한다.
3. Redis 오류 branch에서 두 요청은 `LOCAL_FALLBACK`으로 진행한다.
4. PostgreSQL idempotency record가 새 요청을 획득한다.
5. Alice의 capacity CAS와 hold insert가 같은 transaction에서 성공한다.
6. Bob의 capacity CAS는 stale revision 또는 exhausted capacity로 0행 갱신되어 실패한다.
7. Alice의 transaction이 idempotency 응답과 함께 commit되지만 HTTP 응답은 timeout으로 유실된다.
8. Alice가 같은 key와 fingerprint로 재시도한다.
9. PostgreSQL은 저장된 status/body를 `Replay`하고 capacity를 다시 올리지 않는다.

Redis 정상 경로를 별도 happy path로 길게 반복하지 않는다. 이 도식의 질문은 Redis가 없을 때도 PostgreSQL이 최종 결과를 어떻게 한 번만 확정하는지다.

### Sequence 2: FIFO 점유권 이전

참여자는 Alice, Bob, Reservation API, Reservation Command/Handoff Service, PostgreSQL로 제한한다. 다음 흐름을 표현한다.

1. Bob이 FIFO waitlist에 들어간다.
2. Alice가 자신의 hold를 취소한다.
3. service가 capacity resource row를 `FOR UPDATE`로 먼저 잠근다.
4. Alice의 hold를 `HELD → CANCELLED`로 전이한다.
5. 가장 오래 기다린 Bob의 entry를 `WAITING → OFFERED`로 전이하고 `ACTIVE` offer를 만든다.
6. notification delivery를 enqueue하고 transaction을 commit한다. 이때 `occupiedCount`는 1이다.
7. Bob이 offer를 수락한다.
8. 같은 resource lock 안에서 owner digest, offer state, revision, expiry를 확인한다.
9. offer와 waitlist entry를 `ACCEPTED`로 전이하고 confirmed hold를 만든다.
10. transaction commit 뒤에도 `occupiedCount`는 1이다.

`alt waiter missing` branch는 대기자가 없을 때만 capacity를 release한다는 한 줄로 보조한다. 주 흐름은 Bob에게 소유권을 넘기는 경로로 유지한다.

### Dark style 기준

- Architecture 기준: `public/assets/bluetape4k-rate-limit-workshop-architecture-02.png`
- Sequence 기준: `public/assets/clinic-appointment-part3-availability-sequence-02.png`, `public/assets/clinic-appointment-part4-closure-reschedule-sequence-02.png`
- 공통 배경: navy/charcoal gradient와 낮은 채도의 lane/card
- 글꼴: `Architects Daughter`, `Comic Mono`
- semantic color: call은 muted blue, 성공/상태는 olive green, 반환은 teal, lock/metadata는 amber, 실패는 muted red
- marker: 색상별 고정 크기 arrowhead를 정의하고 PNG에서 색과 크기를 확인한다.
- Sequence: participant header, lifeline, activation bar, numbered pill, 투명한 `alt`/`else` frame을 사용한다.
- 라벨: 도식 내부는 저장소 정책에 따라 English로 쓰고, 본문 caption과 설명은 Korean으로 쓴다.

각 도식은 SVG를 먼저 만들고 XML 검증, CairoSVG 2배 PNG 렌더링, 자동 audit, full-size PNG 육안 검사를 통과한 뒤 다음 도식으로 넘어간다.

## 사실 근거

초안 작성 전에 다음 근거를 현재 `develop` 기준으로 다시 읽고 정확한 클래스, 함수, 테스트 이름을 고정한다.

- `commerce/reservation-control-plane/README.ko.md`
- `commerce/reservation-control-plane/src/main/kotlin/**`
- `commerce/reservation-control-plane/src/test/kotlin/**`
- `commerce/reservation-control-plane/src/main/resources/**`
- `commerce/reservation-control-plane/src/test/resources/**`

각 주장은 다음 범주 중 하나로 분류한다.

| 주장 범주 | 필요한 근거 |
| --- | --- |
| 상태 전이와 수량 보장 | 서비스, 저장소, SQL 또는 통합 테스트 |
| HTTP 멱등 계약 | filter/controller, idempotency repository, HTTP 통합 테스트 |
| Redis 장애 처리 | 설정, adapter, 장애 기동 통합 테스트 |
| waitlist와 offer 소유권 | command service, 정책 코드, 단위/통합 테스트 |
| 알림 내구성 | outbox 저장·발행 코드와 테스트 |
| 운영상 한계 | README의 명시적 caveat 또는 코드에서 확인 가능한 제한 |

소스에서 확인되지 않는 동작은 삭제하거나 가능성으로 한정한다. README와 구현이 다르면 구현을 우선해 사실을 정리하고, 의미 있는 drift는 별도 이슈 후보로 남긴다.

## 문체와 편집 기준

- 제목과 소제목은 추상적인 선언보다 독자가 겪는 문제와 행동을 드러낸다.
- `운영 문제` 대신 사용자 표현인 `현실에서 부딪히는 문제`를 사용한다.
- PostgreSQL과 Redis를 대결 구도로 쓰지 않고 각각의 책임 경계를 설명한다.
- `강력하다`, `완벽하다`, `엔터프라이즈급` 같은 근거 없는 평가를 쓰지 않는다.
- 같은 개념에는 같은 용어를 반복한다. hold, offer, waitlist는 처음에 한국어 설명을 붙인 뒤 식별자와 일치하도록 표기한다.
- 결론은 기능을 다시 나열하지 않고, 최종 권한과 보조 장치의 선택 규칙을 한 문단으로 정리한다.

## 검증

1. 한국어 초안의 frontmatter, 제목, heading rhythm, 코드 밀도, 링크 방식이 인접한 실전 예제 글 2~3개와 맞는지 비교한다.
2. 모든 클래스, 함수, 헤더, 상태, 테스트 이름과 GitHub source URL을 현재 `develop`에서 확인한다.
3. 한국어 사실 검토 뒤 자연스러움 검토를 별도로 수행한다.
4. 한국어 검수 후 영어판을 직역하지 않고 동일한 주장과 보장 범위로 현지화한다.
5. `git diff --check`와 `npm run build`를 실행한다.
6. 한국어와 영어 경로, source link, 제목, 숫자, 표, 관련 글 링크의 로케일 parity를 확인한다.
7. hero를 인접 workshop 글과 같은 크기로 비교하고, 로컬 서버에서 두 경로를 열어 렌더링을 확인한다.
8. 세 SVG를 `xmllint`로 검사하고 CairoSVG로 2배 PNG를 렌더링한다.
9. Architecture에는 connector, geometry, endpoint, mixed-corner audit를 실행한다.
10. 두 Sequence에는 공통 audit와 sequence style audit를 각각 실행하고 번호 pill, marker, branch frame, activation bar를 full-size PNG에서 확인한다.
11. 한국어 로컬 경로에서 세 PNG가 본문 문맥에 맞는 크기와 순서로 보이는지 브라우저로 검수한다.

## 제외 범위

- `bluetape4k-workshop` 코드 변경
- 성능 벤치마크 실행 또는 수치 주장
- 벤치마크 차트 제작
- 한 장의 Sequence에 마지막 자리 경쟁과 FIFO handoff를 모두 밀어 넣는 구성
- 고정된 `실전 예제` 시리즈 번호나 별도 카테고리 체계 도입
- 배포, PR 병합, release workflow 실행
