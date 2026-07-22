# Spring Modulith publication과 Outbox 경계 글 설계

## 목적

이 글은 하나의 Spring Boot 애플리케이션 안에서 모듈 간 후속 작업을 신뢰성 있게 전달할 때, Spring Modulith의 event publication 저장소를 언제 쓰고 언제 Transactional Outbox로 경계를 넘어가야 하는지를 설명한다.

독자가 얻어야 할 결론은 단순하다. 둘은 같은 문제를 두 번 푸는 대체재가 아니다. 같은 프로세스 안의 모듈 간 전달 실패를 복구하는 문제와, 브로커·다른 서비스·다른 실행 환경으로 이벤트를 내보내는 문제는 전달 경계가 다르다.

## 독자와 문제 상황

- Spring Boot 기반 모듈러 모놀리스를 운영하는 개발자
- 주문 승인 뒤 재고 예약처럼 후속 작업이 실패해도 원래 업무 처리를 추적·재시도해야 하는 팀
- 이미 Outbox를 알고 있지만 애플리케이션 내부 이벤트까지 브로커로 보내야 하는지 판단하기 어려운 독자

글의 출발점은 `OrderApprovedEvent`를 발행한 뒤 `fulfillment.reserve-stock` 처리기가 재고 예약을 수행하는 주문 승인 흐름이다. 처리기가 실패했을 때도 주문과 실패 사실을 잃지 않고, 운영자가 재전송 가능한 상태를 어떻게 확인하는지 보여 준다.

## 중복 사전 조사

이 글을 작성하기 전에 사이트, GitHub 이슈와 PR, 워크숍 소스를 조사했다.

| 조사 대상 | 결과 | 글에서의 처리 |
| --- | --- | --- |
| `transactional-outbox-idempotency-spring-ktor` | Spring·Ktor의 Outbox, 중복 요청 키, `RETRYABLE_FAILED`, 알림·실시간 전달을 이미 다룬 게시글 | 본문을 반복하지 않고 비교 대상 링크로만 사용 |
| `transactional-outbox-kafka-first-fallback-part2` | Kafka 우선 전달과 폴백 전략을 다룬 게시글 | 외부 전달 경계의 예시로만 참조 |
| 사이트의 Modulith/application event publication 관련 글 | 전용 글 없음 | 이 글의 비중복 주제 |
| 열린 PR의 Modulith publication/outbox 주제 | 전용 PR 없음 | 이 글의 비중복 주제 |
| GitHub issue #198 | 위 Outbox 글과 겹치는 후보를 기록한 뒤 종료 | 후속 범위는 issue #253에서 관리 |

초안 직전과 PR 직전에도 같은 검색을 다시 수행한다. 기존 Outbox 글의 재시도·중복 제거 구현을 다시 설명하지 않는다.

## 근거가 되는 구현

주 근거는 `exposed-workshop`의 `13-ecosystem-integrations/06-spring-modulith-publications` 예제다.

- `OrderApplicationService.approve`는 주문을 승인 상태로 저장하는 트랜잭션 안에서 `OrderApprovedEvent`를 발행한다.
- `FulfillmentReservationHandler`는 `@ApplicationModuleListener(id = "fulfillment.reserve-stock")`로 이벤트를 받아 재고 예약을 별도 트랜잭션으로 기록한다.
- Exposed 기반 `EventPublicationRepository`는 처리기 식별자, 이벤트 타입, 직렬화한 데이터, 상태, 시도 횟수, 발행·완료 시각을 `EVENT_PUBLICATION`에 저장한다.
- 처리기가 성공해야 publication이 완료된다. 실패한 publication은 조회할 수 있으며 `IncompleteEventPublications.resubmitIncompletePublications(...)`로 다시 실행할 수 있다.
- 오래된 클래스 이름을 더 이상 읽지 못하는 publication은 운영자가 행을 확인할 수 있지만, 이벤트를 실제 객체로 꺼낼 때 `UnloadableEventPublicationException`이 발생한다.

글은 위 구현과 테스트의 관찰 가능한 결과를 설명한다. Spring Modulith의 내부 구현을 일반화하거나, 이 저장소가 외부 전달을 보장한다고 주장하지 않는다.

## 핵심 메시지와 선택 기준

### Spring Modulith publication이 맞는 경우

- 발행자와 처리기가 같은 Spring Boot 애플리케이션 안에 있다.
- 주문·재고처럼 모듈 경계는 분명하지만, 별도 브로커나 소비자 서비스를 둘 필요는 없다.
- 커밋 뒤 비동기 처리기가 실패한 사실, 대상 처리기, 재시도 상태를 애플리케이션 안에서 추적하고 복구하려 한다.

### Transactional Outbox가 맞는 경우

- 이벤트가 Kafka 같은 브로커, 다른 서비스, 다른 프로세스 또는 다른 실행 환경으로 나가야 한다.
- 네트워크 전달, 소비자 지연, 브로커 장애, 외부 소비자의 재처리 같은 통합 경계를 관리해야 한다.
- 애플리케이션 저장소의 변경과 외부 이벤트 발행을 원자성 있게 연결해야 한다.

### 둘을 섞어 말하지 않을 원칙

`EVENT_PUBLICATION`은 로컬 처리기의 완료·실패·재전송을 위한 기록이다. Outbox는 외부 전달을 위한 내보내기 대기열이다. 글의 선택 표와 다이어그램은 두 저장소의 이름이 비슷해도 전달 대상과 실패 모델이 다름을 드러낸다.

## 글 구성

1. **주문은 승인됐는데 재고 예약이 실패했다**: 커밋 뒤 후속 작업의 실패가 왜 보이지 않는 문제가 되는지 소개한다.
2. **트랜잭션 안에서 이벤트를 남기는 위치**: 주문 승인과 `OrderApprovedEvent` 발행, publication 저장의 역할을 짧은 코드와 함께 설명한다.
3. **처리기의 성공은 완료, 실패는 복구 대상**: `fulfillment.reserve-stock` 처리, 실패 상태 확인, 재전송, 과거 이벤트 클래스를 읽지 못하는 경우의 운영상 의미를 설명한다.
4. **같은 앱 안과 앱 밖은 다른 경계다**: Spring Modulith publication과 Transactional Outbox를 표로 비교한다. 독자가 기존 Outbox 시리즈로 이어갈 수 있게 링크한다.
5. **선택 절차**: 소비자가 같은 애플리케이션인지, 외부 전달 보장이 필요한지, 재전송을 누가 운영하는지 순서로 판단하는 짧은 절차를 제공한다.

## 시각 자료

시리즈의 어두운 스타일을 유지한다.

- **대표 이미지**: 주문, 재고, 내부 이벤트 저장소를 작은 운영 장면으로 표현한 다크 3D 미니어처. 텍스트가 없거나 최소여야 하며, 본문 다이어그램의 대체물이 아니다.
- **상호작용 다이어그램(한국어·영어 각 1개)**: 카드와 연결선으로 두 경로를 나란히 보인다.
  - 로컬 경로: `Orders` → `트랜잭션` → `OrderApprovedEvent` → `EVENT_PUBLICATION` → `fulfillment.reserve-stock` → `완료 또는 재전송`
  - 외부 경로: `Orders` → `Outbox` → `브로커` → `외부 소비자`
  - 두 경로 사이에는 대체·승격을 뜻하는 화살표를 두지 않는다. 각 경로의 전달 경계와 복구 책임을 제목·보조 문구로 분명하게 표시한다.
- 다이어그램은 SVG를 원본으로 관리하고, PNG 변환본도 생성·검수한다. 확대 보기 대상에는 기술 다이어그램만 포함한다.

실제 제작 전에 `bluetape-diagram`의 체크리스트를 다시 읽고, 카드 간 간격·화살촉 크기·라벨 대비·PNG 변환 결과를 함께 검수한다.

## 이중 언어와 경로

| 언어 | 제목 | 경로 |
| --- | --- | --- |
| 한국어 | 같은 애플리케이션 안의 이벤트 전달: Spring Modulith publication과 Outbox를 나누는 기준 | `/ko/blog/spring-modulith-publications-vs-outbox/` |
| English | Event Delivery Inside One Application: Choosing Between Spring Modulith Publications and an Outbox | `/blog/spring-modulith-publications-vs-outbox/` |

두 글은 구조, 주장, 표, 코드 예제, 다이어그램 정보량을 맞춘다. 한국어는 독자가 바로 이해할 수 있는 업무 언어를 우선하고, 영어 제품명·API명은 필요한 곳에만 쓴다.

## 자료와 링크 원칙

- 독자에게 필요한 자료만 본문 끝에 제공한다.
- 워크숍의 모듈 README와 `OrderApplicationService`, `FulfillmentReservationHandler`, `ExposedEventPublicationRepository`의 GitHub 소스 링크는 제공한다.
- 기존 Outbox Part 1·Part 2는 비교를 더 공부하려는 독자를 위한 연결 자료로 제공한다.
- 조사 과정의 raw 검색 결과, 이슈 번호 목록, 내부 검증 명령은 독자용 참고 자료에 싣지 않는다.

## 검증과 완료 조건

초안과 PR 전에는 다음을 확인한다.

1. 모든 구현 주장이 워크숍 소스와 테스트에 대응하는지 확인한다.
2. 기존 Outbox 글, 사이트, GitHub 이슈·PR을 다시 검색해 중복이 없는지 확인한다.
3. 한국어·영어 본문의 구조와 기술적 주장, 표의 정보가 대응하는지 비교한다.
4. 다이어그램 SVG와 PNG의 문구, 연결 방향, 화살촉, 카드 간격, 명암 대비를 실제 렌더링으로 검수한다.
5. 한국어 자연스러움 체크리스트로 교정하고, 링크·MDX·사이트 빌드를 검증한다.
6. issue #253을 연결한 PR만 만든다. 이번 작업에서는 병합과 배포를 수행하지 않는다.

## 범위 제외

- 기존 Transactional Outbox 글의 Spring/Ktor 구현과 Kafka 폴백 전략을 다시 쓰지 않는다.
- 실제 브로커 운영, 외부 소비자의 멱등성 구현, 분산 트랜잭션의 완전한 설계를 다루지 않는다.
- Spring Modulith를 모든 이벤트 통합의 기본 선택지로 권하지 않는다.
