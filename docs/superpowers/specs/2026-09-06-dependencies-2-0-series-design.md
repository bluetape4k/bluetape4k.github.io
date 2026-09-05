# bluetape4k-dependencies 2.0.0 활용기 시리즈 설계

## 상태

- 작성일: 2026-09-06
- 대상 저장소: `bluetape4k/bluetape4k.github.io`
- 기준 release: `io.github.bluetape4k:bluetape4k-dependencies:2.0.0`
- 시리즈 길이: 4편
- locale: 한국어 원문 우선, 사실과 구조를 확정한 뒤 영어판 작성
- 작업선: `docs/dependencies-2-0-series`
- 승인 범위: 설계, article delivery issue, 한·영 원고, 공용 hero, 로컬 검증
- 범위 밖: PR 생성, merge, GitHub Pages 배포, source repository 변경

## 목표

`bluetape4k-dependencies 2.0.0`이 모은 여덟 library release를 저장소별 변경 목록으로 반복하지 않고, 애플리케이션 개발자가 실제로 마주치는 네 가지 문제로 설명한다.

1. Java 25와 Kotlin 2.4.10으로 이동할 때 무엇이 호환성 경계가 되는가.
2. tenant, Query by Example, batch restart, graph streaming에서 데이터 수명주기를 어떻게 닫는가.
3. NATS와 AWS 메시징·스트림 adapter가 어디까지 소유하고 무엇을 호출자에게 남기는가.
4. backend 상태가 불확실하거나 입력·저장 상태가 손상됐을 때 어떻게 안전하게 실패하는가.

각 글은 BOM을 기능 자체로 과장하지 않는다. BOM은 검증된 release 조합으로 들어가는 진입점이며, 기능과 동작의 근거는 각 source repository의 release tag, 구현, 테스트다.

## 독자와 선행 지식

주 독자는 다음과 같다.

- `bluetape4k-dependencies 1.4.0` 또는 개별 Bluetape4k module에서 `2.0.0`으로 이동하려는 Kotlin/JVM 개발자
- Spring Boot, Ktor, Exposed, coroutine `Flow`, AWS messaging을 조합하는 백엔드 개발자
- cancellation, checkpoint, fencing, resource ownership 같은 운영 경계를 코드 선택 기준으로 이해하려는 개발자

독자는 Gradle 또는 Maven dependency 선언을 이해한다고 가정한다. BOM 사용법 자체는 기존 [`bluetape4k-dependencies로 여러 라이브러리 같이 쓰기`](/ko/blog/bluetape4k-dependencies-usage-guide/)에 맡기고, 이번 시리즈에서는 필요한 최소 import 예시만 반복한다.

각 편은 독립적으로 읽을 수 있어야 한다. 앞선 편의 개념을 전제로 삼지 않고, 현재 편에 필요한 정의와 선택 규칙을 짧게 다시 제시한다.

## 기준 release와 사실 원본

### 중앙 release

| 대상 | version | exact commit | 역할 |
| --- | --- | --- | --- |
| `bluetape4k-dependencies` | `2.0.0` | `3c203aa9f8ba80685aac766c5fb8f24e23d0058e` | 소비자가 선택하는 stable BOM과 catalog 기준값 |
| `bluetape4k-projects` | `2.0.0` | `8165a8989e0075e7c17c489bf3000bf41fef8232` | Java 25, virtual-thread API, NATS, cache·I/O 경계 |
| `bluetape4k-exposed` | `2.0.0` | `d632a0bc0662ae616b786f552150a7fabd1cee3e` | tenant adapter, JDBC/R2DBC QBE, batch lifecycle |
| `bluetape4k-aws` | `1.0.0` | `632e0f346b807c4d50e3195f7b2b72082def9460` | streams, SQS/SNS, AppConfig, S3, Spring integration |
| `bluetape4k-image` | `1.0.0` | `b38d4891b66dff8bc63db0018b5e41810d1da9bc` | privacy 영속 데이터와 bounded decode |
| `bluetape4k-text` | `1.0.0` | `59256aea7011d3f9073d74470459a13363150153` | Lingua detector 재사용과 model-loading 선택 |
| `bluetape4k-graph` | `1.0.0` | `a405300799b36d4d6edb7267ad07ff34d4ad3afe` | streaming import, progress, checkpoint, bounded I/O |
| `bluetape4k-javers` | `1.0.0` | `6648b73333cb665ecba0340588dbc3556c308a52` | schema ownership, audit head, codec lifecycle |
| `bluetape4k-leader` | `1.0.0` | `e70146330302758f563a46b7286e3ce25f1bac49` | backend diagnostics와 bounded `UNKNOWN` reason |

원고 작성 직전에 각 tag와 commit을 소유 저장소에서 다시 확인한다. GitHub Release, issue, PR, CI 상태처럼 변할 수 있는 정보는 `gh`로 읽고, article의 동작 설명은 immutable release source를 기준으로 한다.

### 사실 판정 순서

1. release tag의 구현과 테스트
2. 같은 tag의 `CHANGELOG.md`와 README/manual
3. release에 포함된 issue와 merged PR의 acceptance evidence
4. 중앙 site의 stable manual과 기존 visual companion

`develop`에만 존재하는 후속 변경은 2.0.0 기능으로 설명하지 않는다. roadmap, deferred backend, 실제 AWS 통합으로 검증하지 않은 Floci test는 현재 release 보장과 분리한다.

## 시리즈 구성

### Part 1. Java 25와 호환성 경계

- 한국어 제목: `bluetape4k-dependencies 2.0.0 활용기 Part 1: Java 25와 호환성 경계`
- 영어 제목: `bluetape4k-dependencies 2.0.0 in Practice Part 1: Java 25 and Compatibility Boundaries`
- slug: `bluetape4k-dependencies-2-0-part1-compatibility-boundaries`
- 중심 질문: BOM version 하나를 올리기 전에 어떤 runtime, package, configuration 경계를 확인해야 하는가.

핵심 내용:

- `1.4.0`과 `2.0.0`의 internal BOM matrix 차이
- 일반 artifact의 Java 25 바닥선과 Java 21 compatibility island
- `bluetape4k-virtualthread-api` package 이동과 consumer 재컴파일
- QueryDSL Kotlin codegen 제외와 Java APT 유지
- Spring Boot MongoDB의 `spring.data.mongodb.uri`에서 `spring.mongodb.uri`로의 이동
- tag 없는 custom Ignite2 image를 즉시 거부하는 이유
- Kotlin `2.4.10`, Spring Boot `4.1.0`, Exposed `1.4.0` 같은 중앙 호환 line은 기능 목록이 아니라 검증된 조합이라는 점

독자가 가져갈 선택 규칙:

- Java 21–24를 유지해야 하면 `2.0.0`으로 무조건 올리지 않는다.
- virtual-thread API의 binary owner를 직접 참조했다면 source 수정 없이 끝나지 않으며 재컴파일이 필요하다.
- 삭제·이동된 기본 경로를 fallback으로 숨기지 말고 build와 startup에서 드러낸다.

### Part 2. 데이터 접근과 처리 수명주기

- 한국어 제목: `bluetape4k-dependencies 2.0.0 활용기 Part 2: 데이터 접근과 처리 수명주기`
- 영어 제목: `bluetape4k-dependencies 2.0.0 in Practice Part 2: Data Access and Processing Lifecycles`
- slug: `bluetape4k-dependencies-2-0-part2-data-lifecycles`
- 중심 질문: query 실행, chunk commit, checkpoint, stream cancellation의 경계를 어떻게 분리해야 재시작 가능한 데이터 처리가 되는가.

핵심 내용:

- Exposed Ktor tenant JDBC/R2DBC adapter의 exact-match resolver와 fallback 금지
- JDBC/R2DBC Query by Example의 closed projection, SQL pushdown, paging·slice·cold `Flow`
- caller-owned transaction과 cursor-backed `stream()`의 수명
- batch execution의 owner/version lease, fencing, terminal state, 성공한 chunk 뒤 checkpoint 보존
- Graph format reader의 순차 `GraphRecordFlowReader`, bounded edge staging, source ownership
- graph-io checkpoint claim, atomic state update, retry·cleanup·progress contract
- API chunking과 backend source-bounded execution capability의 차이

독자가 가져갈 선택 규칙:

- tenant를 찾지 못한 요청을 기본 database로 보내지 않는다.
- query 표현력보다 먼저 projection과 cardinality를 닫힌 계약으로 제한한다.
- `Flow`를 제공한다는 사실만으로 source memory가 bounded라고 추정하지 않는다.
- checkpoint는 읽은 위치가 아니라 성공적으로 commit한 작업 경계에 맞춘다.

### Part 3. 메시징과 스트림의 소유권

- 한국어 제목: `bluetape4k-dependencies 2.0.0 활용기 Part 3: 메시징과 스트림의 소유권`
- 영어 제목: `bluetape4k-dependencies 2.0.0 in Practice Part 3: Ownership in Messaging and Streams`
- slug: `bluetape4k-dependencies-2-0-part3-messaging-stream-ownership`
- 중심 질문: adapter가 message를 방출한 뒤 acknowledgement, checkpoint, retry, cleanup은 누가 소유하는가.

핵심 내용:

- NATS JetStream pull/push cold `Flow<Message>`와 수집별 handle lifecycle
- manual `ack()`/`nak()`/`term()`과 business success의 순서
- DynamoDB Streams parent-before-child traversal과 inclusive checkpoint replay
- Kinesis shard graph, bounded concurrency, lease/fencing, `emit` 이후 checkpoint
- 두 stream adapter가 보장하는 at-least-once와 caller-owned idempotency
- SQS visibility heartbeat, partial acknowledgement, Extended Client payload offload, FIFO/backpressure
- SNS signature verification, `TopicArn` allowlist, explicit confirmation
- Spring Modulith producer externalization과 consumer ingress를 같은 방향으로 오해하지 않는 법

기존 visual companion 연결:

- AWS Kinesis와 DynamoDB Streams 비교
- NATS JetStream pull/push lifecycle
- AWS Spring Modulith SNS/SQS 방향
- SNS signature verification gate
- SQS Extended Client payload ownership

독자가 가져갈 선택 규칙:

- 수신 성공과 업무 처리 성공을 같은 시점으로 취급하지 않는다.
- at-least-once adapter 위에 exactly-once 문구를 덧붙이지 않는다.
- adapter가 만든 handle만 adapter가 닫고, client와 durable store의 수명은 호출자가 결정한다.

### Part 4. 운영 진단과 안전한 실패

- 한국어 제목: `bluetape4k-dependencies 2.0.0 활용기 Part 4: 운영 진단과 안전한 실패`
- 영어 제목: `bluetape4k-dependencies 2.0.0 in Practice Part 4: Operational Diagnostics and Fail-Closed Boundaries`
- slug: `bluetape4k-dependencies-2-0-part4-operational-safety`
- 중심 질문: backend 상태를 확정할 수 없거나 직렬화 데이터·audit chain을 신뢰할 수 없을 때 무엇을 노출하고 무엇을 중단해야 하는가.

핵심 내용:

- Leader `LeaderBackendDiagnosticsProbe`와 bounded `UNKNOWN` reason
- Spring health, Ktor route, Micrometer counter, Prometheus alert/runbook의 같은 상태 의미
- Javers Spring Boot schema ownership 충돌의 fail-fast 검증
- Redis audit repository head 손상·rewind를 조용한 history 축소로 처리하지 않는 이유
- Image privacy runtime object의 허위 `Serializable` 제거와 `schemaVersion=1` 영속 데이터 codec
- bounded stream decode와 방어적 byte/collection copy
- PaddleOCR·ONNX backend를 provenance와 offline receipt 없이 활성화하지 않는 `DEFER` 경계
- Text Lingua detector를 pipeline 밖에서 재사용하고 preload와 lazy loading을 선택하는 기준

독자가 가져갈 선택 규칙:

- `UNKNOWN`을 `DOWN`이나 `UP`으로 임의 변환하지 않고 제한된 원인을 함께 노출한다.
- 저장 상태가 불완전할 때 이전 정상값처럼 보이게 축소하지 않는다.
- runtime collaborator와 durable 직렬화 데이터의 계약을 분리한다.
- 비싼 model initialization은 요청마다 반복하지 않되, preload 비용과 lazy 첫 요청 지연을 명시적으로 선택한다.

## 공통 article 구조

각 글은 다음 독자 흐름을 사용한다.

1. 실제 upgrade 또는 운영 시나리오
2. 2.0.0에서 드러난 실패 경계
3. 가장 작은 dependency 또는 code 예시
4. source-backed 동작 설명
5. 선택 기준과 호출자 책임
6. migration 또는 운영 caveat
7. exact release source와 관련 manual·visual companion
8. 네 편의 series navigation

모든 글이 같은 소제목을 기계적으로 반복할 필요는 없다. 다만 독자는 각 글에서 문제, 보장, 비보장, 적용 조건을 재구성할 수 있어야 한다.

## 예제와 source link 원칙

- 코드 블록은 한 가지 경계만 보여 주고 30줄 안팎으로 제한한다.
- full implementation은 exact release tag의 GitHub source link로 연결한다.
- article의 모든 API 이름은 tag source에서 검색해 정확한 package와 signature를 다시 확인한다.
- issue와 PR은 결정 배경을 보강하는 자료이며 구현 동작의 단독 근거로 사용하지 않는다.
- benchmark 수치를 새로 실행하거나 환경을 고정하지 않았다면 성능 우열을 주장하지 않는다.
- Floci test는 protocol·lifecycle 회귀 근거로만 설명하고 실제 AWS 서비스 검증으로 확대하지 않는다.

## Locale 계약

한국어판을 먼저 작성하고 아래 항목을 확정한 뒤 영어판을 작성한다.

- part 번호와 section 순서
- API·configuration key·exception message
- version, commit, 숫자와 보장 수준
- source, manual, visual companion link
- caveat와 caller-owned 범위
- 공용 hero와 series navigation

영어판은 한국어 문장을 직역하지 않고 같은 기술 계약을 자연스러운 영어 기술 문장으로 다시 쓴다. 한 locale에만 기능, 주의사항, 링크를 추가하지 않는다.

## 시각 자료

### 공용 hero

네 글은 text-free 공용 hero `/assets/bluetape4k-dependencies-2-0-hero.png`를 사용한다.

- 기존 1.3.0 hero와 가까운 3D miniature workbench 계열을 유지한다.
- 중앙 BOM 보드에서 네 작업대로 경로가 갈라지는 구성을 사용한다.
- 네 작업대는 compatibility, data, messaging, operations를 색과 object로 구분한다.
- 이미지 안에 title, version, repository name 같은 생성형 text를 넣지 않는다.
- article card 크기에서도 중앙 BOM과 네 작업 영역이 식별돼야 한다.

생성 전 같은 series와 최근 blog hero를 equal-size contact sheet로 비교하고, 생성 후 원본 크기와 article card 크기에서 잘림·초점·artifact를 확인한다.

### 본문 visual

새 diagram은 기본 범위에 넣지 않는다. 이미 공개된 2.0 visual companion이 같은 lifecycle을 더 자세히 설명하면 locale에 맞는 route를 연결한다. source와 visual 사이에 설명 공백이 확인될 때만 별도 설계와 `bluetape-diagram` checklist를 거쳐 새 diagram을 추가한다.

## GitHub delivery issue

설계 문서 승인 뒤 article마다 하나의 site delivery issue를 만든다. 작성 전 동일 title 또는 slug를 다시 검색한다.

| Part | issue title | labels | milestone | assignee |
| --- | --- | --- | --- | --- |
| 1 | `docs(blog): explain dependencies 2.0 compatibility boundaries` | `documentation`, `enhancement` | `Backlog` | `debop` |
| 2 | `docs(blog): explain dependencies 2.0 data lifecycles` | `documentation`, `enhancement` | `Backlog` | `debop` |
| 3 | `docs(blog): explain dependencies 2.0 messaging ownership` | `documentation`, `enhancement` | `Backlog` | `debop` |
| 4 | `docs(blog): explain dependencies 2.0 operational safety` | `documentation`, `enhancement` | `Backlog` | `debop` |

각 issue는 중앙 `2.0.0` release와 해당 source repository issue/PR, article slug, locale 범위, 공용 hero, acceptance criteria를 연결한다. 네 issue는 같은 series임을 서로 링크한다. PR은 별도 승인 전에는 생성하지 않는다.

## 변경 경계

예상 변경은 다음으로 제한한다.

- 이 설계 문서와 후속 구현 계획
- 한국어 article 4개
- 영어 article 4개
- 공용 hero PNG 1개
- 필요한 series navigation 또는 article inventory test
- 검증 결과를 기록하는 기존 형식의 최소 문서

다음은 변경하지 않는다.

- source repository 구현, README, release tag와 release note
- `bluetape4k-dependencies` BOM/catalog
- 기존 1.3.0 article의 기술 내용
- 이미 공개된 visual companion의 동작과 자산
- site global navigation 또는 디자인 시스템

## 실패 처리와 사실 drift

| 상황 | 처리 |
| --- | --- |
| tag source와 CHANGELOG가 다름 | 구현·테스트를 우선하고 article claim을 축소하거나 source repository issue로 분리한다. |
| public API가 tag에 없음 | `develop` API를 2.0.0 기능으로 쓰지 않는다. |
| 기존 1.3.0 article과 설명이 겹침 | 2.0.0에서 달라진 계약만 남기고 기존 글을 배경 링크로 연결한다. |
| locale 사이 claim이 다름 | 영어판을 수정하고 한국어판에서 확정한 source ledger에 다시 맞춘다. |
| hero가 기존 series와 시각적으로 불일치 | 생성 prompt를 고치고 contact sheet와 card-size 검사를 반복한다. |
| site build 또는 route 검증 실패 | PR 범위로 진행하지 않고 원고·link·frontmatter를 수정한 뒤 전체 build를 다시 실행한다. |

## 검증

### 사실 검증

- 각 repository tag와 exact commit 재확인
- 중앙 catalog의 internal BOM version matrix 확인
- article에 사용한 API·configuration key·exception message의 tag source 검색
- source link가 immutable tag 또는 의도한 exact commit을 가리키는지 확인
- at-least-once, checkpoint, lease/fencing, cancellation, ownership claim의 테스트 근거 확인

### 콘텐츠 검증

- `bluetape-writer`의 `SPW-*`, `BLOG-*`, 한국어 자연스러움 checklist
- 변경된 한국어 파일의 contextual terminology audit
- 네 part의 한국어·영어 title, slug, section, claim, source, navigation parity
- 기존 1.3.0 series와 중복·모순 검사
- article delivery issue와 route의 일대일 대응

### 사이트 검증

- `git diff --check`
- article 및 series 관련 targeted test
- `npm test`
- `npm run build`
- 생성된 한·영 route 8개 확인
- hero asset 존재, frontmatter와 본문 reference 확인
- local preview에서 desktop/mobile article route와 card crop 확인

## Acceptance Criteria

1. 네 article이 각각 하나의 독자 질문과 선택 규칙을 가진다.
2. 모든 기능 claim이 소유 repository의 immutable release source와 연결된다.
3. Part 1은 Java 25 migration과 Java 21 compatibility island를 혼동하지 않는다.
4. Part 2는 API chunking과 source-bounded execution, read와 committed checkpoint를 구분한다.
5. Part 3은 at-least-once를 exactly-once로 설명하지 않고 acknowledgement·checkpoint·idempotency 소유자를 명시한다.
6. Part 4는 `UNKNOWN`, corrupted audit head, runtime object, durable 직렬화 데이터를 서로 다른 상태로 설명한다.
7. 한국어·영어 8개 route가 같은 part 구조, 사실, link, hero, navigation을 갖는다.
8. 공용 hero가 text-free이며 기존 dependencies series의 3D miniature workbench 계열과 시각적으로 이어진다.
9. `git diff --check`, terminology audit, targeted test, `npm test`, `npm run build`, route 검증이 모두 통과한다.
10. PR·merge·배포는 별도 승인 전까지 실행하지 않는다.

## 설계 DoD

- 독자, 목적, locale, release source와 비보장 범위를 고정했다.
- 단일 장문과 저장소별 8부작 대신 주제별 4부작을 선택했다.
- 각 part의 질문, 기능 범위, 선택 규칙, slug를 정의했다.
- 공용 hero와 기존 visual companion 재사용 경계를 정의했다.
- article별 delivery issue, 검증, 실패 처리, 범위 밖 작업을 명시했다.
- 구현 계획은 이 설계가 사용자 검토를 통과한 뒤 작성한다.
