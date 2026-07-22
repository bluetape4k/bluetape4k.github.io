# JaVers Part 4 선택 기준과 Kafka 경계 보강 설계

## 1. 목적

Part 4의 PostgreSQL benchmark와 DB 쓰기 경로 설명 뒤에, 독자가 다음 두 질문에 답할 수 있는 짧은 의사결정 섹션을 추가한다.

1. 쓰기 비용이 더 들 수 있는데도 언제 JaVers를 선택할 만한가?
2. Kafka를 붙이면 감사 이력을 비동기로 처리할 수 있는가? 그렇다면 무엇을 보장하고 무엇을 포기하는가?

목표는 JaVers를 옹호하거나 Kafka를 만능 대안으로 제시하는 것이 아니라, 감사 이력·이벤트 전달·조회 모델의 책임을 분리해 선택 근거를 제공하는 것이다.

## 2. 현재 시리즈의 출발점

- Part 2는 Exposed, Redis, Kafka의 책임을 구분하고, Kafka repository가 조회를 제공하지 않는 write-only stream임을 설명한다.
- Part 3는 JaVers가 객체 diff, commit metadata, DDD command/event 흐름과 함께 필요할 때 선택할 수 있음을 설명한다. 또 command side의 JaVers commit과 Kafka 기반 Redis projection을 구분한다.
- Part 4는 benchmark와 snapshot 저장 경로를 설명하지만, 성능 비용과 선택 이유, Kafka 대안의 경계를 하나의 판단 흐름으로 연결하지 않는다.

따라서 이번 보강은 기존 내용을 반복하지 않고 Part 4를 그 판단의 종착점으로 만든다.

## 3. 독자와 범위

### 독자

- 객체 단위 변경 이력과 감사 조회가 필요한 서비스 개발자
- DDD command 흐름에 JaVers를 붙일지, DB audit이나 이벤트 스트림을 쓸지 판단하는 설계자
- Kafka를 도입해 쓰기 응답 시간을 분리하려는 운영 담당자

### 포함

- Korean Part 4와 English Part 4의 같은 위치·같은 사실 보강
- JaVers의 선택 근거를 성능 외 요구사항으로 설명
- 동기 저장, Kafka downstream projection, Kafka snapshot stream의 역할·조회 가능성·실패 경계 비교
- 현재 `KafkaCdoSnapshotRepository`가 acknowledgement를 기다리는 동기 publish 계약이라는 사실
- outbox, 재시도, 실패 정책은 별도 설계가 필요한 미래 선택지라는 사실

### 제외

- Kafka repository, outbox, composite repository의 구현 변경
- 새 benchmark, 수치, diagram, hero asset 추가
- Kafka-only 구조를 일반적인 감사 저장소 대체안으로 권장
- 기존 Part 2·3의 구조나 series navigation 변경

## 4. 배치와 글의 흐름

새 Korean 섹션 `성능만으로 감사 방식을 고르지 않는 이유`와 자연스러운 English 대응 섹션을 다음 위치에 둔다.

```text
benchmark 결과 해석
  -> DB에 저장할 때 JaVers 경로가 더 무거워질 수 있는 이유
  -> 새 선택 기준과 Kafka 경계
  -> 감사 범위와 인덱스 선택
```

쓰기 비용의 원인을 설명한 직후이므로, 독자는 숫자를 본 다음 "그럼에도 언제 선택하는가"를 바로 판단할 수 있다. 이후 감사 범위·인덱스 선택은 선택한 audit store를 운영하는 방법으로 자연스럽게 이어진다.

## 5. 섹션 구성

### 5.1 JaVers를 선택할 근거

JaVers의 가치가 단순한 history table 생성이 아니라는 점을 명시한다.

- 한 aggregate의 객체 단위 diff를 사람이 읽을 수 있게 남겨야 할 때
- author, command/event type, aggregate id 같은 commit metadata를 이력과 함께 추적해야 할 때
- 현재 상태 저장, audit commit, domain event의 순서와 책임을 command 흐름에서 드러내야 할 때

반대로 entity revision만 필요하고 JPA 중심 모델이라면 Envers가 더 직접적인 선택일 수 있으며, DB 변경을 다른 시스템에 빠짐없이 전달하는 것이 주목적이면 CDC가 더 알맞을 수 있음을 함께 적는다. 이는 성능 결과를 도구의 절대 순위로 오해하지 않게 한다.

### 5.2 세 가지 운영 경로 비교

다음 표로 독자가 저장소와 스트림의 역할을 분리해 비교하게 한다.

| 경로 | command 완료 시 보장 | Kafka/조회 역할 | 적합한 경우 |
|---|---|---|---|
| 원본 상태 + JaVers audit | 현재 상태와 query 가능한 audit를 command 경계에서 남긴다 | Kafka는 선택적 downstream event | 즉시 감사 조회와 객체 diff가 모두 필요하다 |
| 원본 상태 + JaVers audit + Kafka projection | audit 보존 후 consumer가 read model을 갱신한다 | Kafka는 화면·검색·외부 소비를 분리한다 | 빠른 조회 모델이나 다른 시스템 전달이 필요하다 |
| Kafka snapshot stream + projection 저장소 | Kafka publish acknowledgement까지 성공해야 한다 | Kafka repository 자체는 write-only이며, 조회는 projector의 대상 저장소가 맡는다 | replay 가능한 이벤트 흐름을 별도로 운영할 수 있다 |

첫 번째와 두 번째 경로가 기존 코드의 책임 분리에 맞는 기본 선택임을 분명히 한다. 세 번째는 Kafka-only audit-query가 아니라, projection 저장소를 추가해야 조회할 수 있는 경로로 설명한다.

### 5.3 "Kafka를 쓰면 비동기"라는 오해 교정

현재 `KafkaCdoSnapshotRepository`의 contract를 직접 근거로 삼는다.

- `saveSnapshot()`은 snapshot event를 만들고 publisher에 전달한다.
- publish는 기본 최대 30초 동안 broker acknowledgement를 기다린다.
- timeout 또는 publish 실패는 `RuntimeException`으로 전파되어 audit-log head가 진행하지 않는다.
- Kafka consumer와 그 consumer가 만드는 projection은 비동기로 동작하지만, 현재 command path의 Kafka publish 자체를 fire-and-forget 비동기 처리라고 부를 수는 없다.

진짜 응답 경로 분리가 필요하면 DB transaction과 Kafka publish 사이의 유실·중복·재처리 문제를 다뤄야 한다. 이 글에서는 outbox, retry queue, best-effort/fail-fast 정책을 구현 완료 기능처럼 소개하지 않고, 시스템별로 합의해야 하는 후속 설계로만 적는다.

## 6. 문체와 링크

- Korean 원고는 "JaVers가 느려도 써야 한다" 같은 단정 대신, 필요한 audit semantics가 있을 때 비용을 감수하는 선택이라고 쓴다.
- 영어 원고는 한국어의 논지를 자연스럽게 재구성하며 숫자·현재 구현 계약·선택표를 동일하게 유지한다.
- 독자가 더 깊이 확인할 수 있도록 Part 2, Part 3, `KafkaCdoSnapshotRepository.kt`, `KafkaCdoSnapshotProjector.kt`의 source link를 남긴다.
- 외부 문헌은 새로 추가하지 않는다. 이번 판단은 현재 series와 repository source로 충분히 근거를 댈 수 있다.

## 7. 검증

1. Korean과 English Part 4에서 같은 사실, 표의 행, source link가 유지되는지 대조한다.
2. `KafkaCdoSnapshotRepository`의 write-only 및 acknowledgement 대기 계약을 source와 다시 대조한다.
3. Part 2·3 링크와 새 source link의 대상이 유효한지 확인한다.
4. `npm run build`, `npm test`, `git diff --check`를 실행하고 두 locale route를 HTTP로 확인한다.
5. 기존 PR #252를 새 정확한 head로 갱신하되, 사용자의 별도 요청 없이 merge 또는 deploy는 하지 않는다.

## 8. 위험과 대응

| 위험 | 대응 |
|---|---|
| Kafka를 durable query store로 오해 | write-only repository와 projection 저장소의 책임을 표와 본문에서 분리 |
| broker acknowledgement 대기를 비동기 처리로 오해 | 현재 code contract와 downstream consumer의 비동기를 명확히 구분 |
| JaVers와 Envers를 단순 성능 순위로 해석 | 각 도구가 보장하는 audit semantics와 경계를 먼저 제시 |
| outbox가 이미 구현되었다고 오해 | 미래 설계 과제로만 언급하고 현재 구현과 분리 |

## 9. 마무리와 자료 편집 보강

### 목적

Part 4의 자료 목록에서 독자가 바로 활용하기 어려운 raw benchmark JSON 두 건을 제거한다. 마무리는 비용을 다시
요약하는 문단 대신, 서비스가 audit path를 결정할 때 따를 수 있는 네 단계 판단표로 바꾼다.

### 자료 목록

다음 raw artifact 링크를 Korean과 English에서 모두 제거한다.

- `2026-06-08-javers-exposed-ddd-envers-comparison.json`
- `2026-06-08-javers-exposed-commit-metadata-indexes.json`

benchmark module, benchmark source, Exposed repository, DDD boundary, Kafka repository, Kafka projector 링크는 유지한다.
이들은 독자가 구현·측정 방법 또는 repository contract를 이해할 때 직접 읽을 수 있는 자료다.

### 마무리 표

Korean `## 마무리`과 English `## Closing`은 같은 네 행의 결정표로 구성한다.

| 순서 | 결정 | 확인할 근거 |
|---|---|---|
| 1 | 설명 책임이 있는 aggregate와 상태 전이를 고른다 | 장애·분쟁·규제 상황에서 누가 어떤 결정을 설명해야 하는가 |
| 2 | 감사 조회와 화면 조회를 나눈다 | object diff가 필요한지, 별도 read model이 필요한지 |
| 3 | 전달 경계를 정한다 | 동기 audit, Kafka projection, acknowledgement 대기, outbox/retry 설계 여부 |
| 4 | 운영 조건으로 다시 측정한다 | p95·p99, 저장량, 보존 기간, query predicate, index 크기 |

표 뒤에는 다음 한 문단만 둔다. benchmark는 정답표가 아니라 위 선택지를 실제 workload로 검증하는 출발점이며,
Kafka를 붙여도 audit query와 delivery guarantee의 책임이 저절로 해결되지는 않는다.

### 검증

1. 두 article의 raw JSON 링크가 모두 사라졌는지 검색한다.
2. Korean과 English closing table의 행 수와 의미가 같은지 대조한다.
3. `npm run build`, `npm test`, `git diff --check`와 두 locale route를 확인한다.
4. 기존 PR #252만 갱신한다. merge와 deploy는 새 요청 전까지 하지 않는다.
