# Bluetape4k JaVers Part 4 감사 비용 글 설계

## 1. 배경

GitHub Issue [#193](https://github.com/bluetape4k/bluetape4k.github.io/issues/193)은 JaVers와 Exposed를 이용한 감사 이력의 저장 비용, 조회 비용, 인덱스 선택 기준을 독자에게 설명하는 글을 요구한다.

기존 JaVers 시리즈는 다음 순서로 독자의 이해를 넓혀 왔다.

1. Part 1: JaVers의 commit, snapshot, diff 기본 모델
2. Part 2: Exposed, Redis, Kafka persistence의 역할과 선택 기준
3. Part 3: DDD command, aggregate 저장, audit commit, event, read model의 적용 흐름

Part 4는 이 구조를 운영하는 데 드는 비용을 다룬다. 핵심 질문은 “JaVers가 빠른가?”가 아니라 “어떤 변경을 어느 수준까지 감사하고, 어떤 조회를 위해 인덱스를 추가할 것인가?”이다.

## 2. 목표와 독자

### 목표

- 감사 로그가 쓰기 경로, 저장 공간, 조회 경로에 비용을 추가하는 이유를 설명한다.
- JaVers + Exposed와 Hibernate Envers의 제한된 비교 결과를 올바른 측정 범위 안에서 해석한다.
- `author`, `commit_date` 보조 인덱스가 항상 이득이라는 결론을 경계한다.
- 전체 aggregate 감사, 선택적 감사, domain event 분리를 판단할 실무 기준을 제공한다.
- 기존 JaVers Part 1~3과 자연스럽게 연결되는 Part 4를 한글과 영문으로 제공한다.

### 주요 독자

- Kotlin/JVM 서비스에 감사 이력을 도입하려는 백엔드 개발자
- 감사 대상과 보존 정책을 설계하는 아키텍트와 기술 리더
- 규정 준수와 운영 추적성을 요구하지만 저장·조회 비용도 함께 판단해야 하는 기획자

## 3. 제목과 경로

### 한글

- 제목: `Bluetape4k JaVers Part 4: 감사 로그는 공짜가 아니다`
- 설명: `JaVers와 Exposed로 감사 이력을 저장할 때 생기는 쓰기·조회 비용을 벤치마크로 읽고, 감사 범위와 commit metadata 인덱스를 선택하는 기준을 정리한다.`
- 경로: `/ko/blog/bluetape4k-javers-part4-audit-cost/`

### 영문

- 제목: `Bluetape4k JaVers Part 4: Audit Logs Are Not Free`
- 설명: `Read bounded JaVers and Exposed benchmark evidence to decide audit scope, write cost, query paths, and commit metadata indexes.`
- 경로: `/blog/bluetape4k-javers-part4-audit-cost/`

## 4. 글의 관점

글은 의사결정 중심으로 구성한다. 벤치마크 구현을 먼저 나열하지 않고, 감사 대상이 늘어날 때 독자가 실제로 겪는 문제에서 시작한다.

본문의 반복 구조는 다음과 같다.

1. 독자의 문제
2. 가장 작은 근거 또는 측정 결과
3. 결과 해석
4. 결과가 증명하지 못하는 것
5. 선택 기준

“JaVers가 Envers보다 느리다” 또는 “인덱스를 추가하면 빨라진다”처럼 측정 범위를 지운 문장은 사용하지 않는다.

## 5. 근거와 수치 사용 원칙

### 현재 소스

- `benchmark/javers-exposed-benchmark/README.ko.md`
- `benchmark/javers-exposed-benchmark/build.gradle.kts`
- `benchmark/javers-exposed-benchmark/src/main/kotlin/io/bluetape4k/javers/benchmark/exposed/EnversComparisonBenchmark.kt`
- `benchmark/javers-exposed-benchmark/src/main/kotlin/io/bluetape4k/javers/benchmark/exposed/ExposedCommitMetadataIndexBenchmark.kt`
- `javers-exposed`의 commit/snapshot table과 repository 구현
- `examples/javers-exposed-ddd`의 aggregate repository와 command 흐름

### 커밋된 결과

1. `docs/benchmark/2026-06-08-javers-exposed-ddd-envers-comparison.json`
   - 단위: `ms/op`
   - 방향: 낮을수록 좋음
   - 환경: JDK 21.0.11, macOS aarch64, PostgreSQL 18-alpine Testcontainers, HikariCP
   - warmup 5회, 측정 40회
   - 비교 경로: Hibernate Envers, JaVers in-memory, JaVers + Exposed repository, JaVers + Exposed DDD path

2. `docs/benchmark/2026-06-08-javers-exposed-commit-metadata-indexes.json`
   - 단위: `ops/s`
   - 방향: 높을수록 좋음
   - 환경: JDK 21.0.11, PostgreSQL Testcontainers, HikariCP
   - warmup 1회, 측정 1회인 짧은 smoke snapshot
   - 비교 대상: baseline, `author`, `commit_date`, 두 인덱스 조합

### 해석 제한

- 두 결과는 단위, workload, harness 세대가 다르므로 서로 직접 비교하지 않는다.
- Envers 비교는 특정 예제 경로의 제한된 문서용 결과다. 라이브러리 전체 성능이나 운영 용량을 대표하지 않는다.
- metadata 인덱스 결과는 측정 1회의 smoke evidence다. 오차 범위와 신뢰 구간을 산출할 수 없으므로 production DDL 변경 근거로 사용하지 않는다.
- metadata 인덱스 결과에서 combined index는 `author` 조회 점수가 가장 높지만 date-range 조회 점수는 baseline보다 낮다. “인덱스가 많을수록 좋다”는 결론을 내리지 않는다.
- 기존 Part 3에 남아 있는 초기 H2 결과는 역사적 문제 제기로만 언급한다. Part 4의 판단은 현재 커밋된 PostgreSQL 결과와 현재 소스를 기준으로 한다.

## 6. 본문 구성

### 6.1 감사 로그를 무조건 남기면 생기는 일

- 모든 필드 변경을 감사 대상으로 삼을 때 write amplification과 snapshot 증가가 생긴다.
- 감사 데이터는 현재 상태를 저장하는 table과 목적이 다르다.
- 규정 준수, 고객 문의, 장애 조사처럼 이력이 필요한 변경부터 선택해야 한다.

### 6.2 한 번의 변경에서 무엇이 저장되는가

- aggregate의 현재 상태
- JaVers commit과 commit metadata
- CDO snapshot과 변경 속성
- 필요한 경우 domain event와 read model

각 항목이 별도 책임이며, 모두를 audit history라고 부르지 않는다.

### 6.3 비교 전에 측정 경로부터 나눈다

- Envers entity revision
- JaVers in-memory diff/query
- JaVers + Exposed repository
- JaVers + Exposed DDD path

수치보다 먼저 각 경로가 포함하는 작업을 설명한다. DDD path에는 source-of-truth 저장과 repository orchestration이 포함되므로 단순 persistence adapter와 같은 경로가 아니다.

### 6.4 커밋된 비교 결과를 읽는 법

- insert, update, audit-query의 대표 수치를 표와 차트로 제시한다.
- 숫자를 승자 선정에 사용하지 않고 비용이 발생하는 경계를 찾는 데 사용한다.
- 좁은 결과를 운영 용량이나 p95/p99 latency로 확대 해석하지 않는다.

### 6.5 조회가 느리다고 인덱스부터 추가하지 않는다

- `author`와 `commit_date` SQL pushdown 조회를 설명한다.
- baseline과 세 가지 benchmark-only index variant를 비교한다.
- 측정 1회 결과에서 나타난 혼합 신호를 그대로 보여 준다.
- 실제 workload, selectivity, table size, write rate, query frequency를 추가 검증 조건으로 둔다.

### 6.6 감사 범위를 결정하는 세 가지 선택지

| 선택 | 적합한 경우 | 주요 비용 | 보호 장치 |
|---|---|---|---|
| 전체 aggregate 감사 | 모든 상태 변경의 객체 diff가 필요함 | snapshot 증가, 쓰기와 보존 비용 | 보존 기간, archive, 용량 경보 |
| 선택적 aggregate 감사 | 규정·분쟁·운영 추적에 중요한 대상이 명확함 | 누락 기준을 관리해야 함 | 감사 대상 명세와 회귀 테스트 |
| domain event 분리 | 상태 전체보다 업무 사건과 downstream 처리가 중요함 | event schema와 재처리 운영 | outbox, idempotency, schema 호환성 |

세 선택지는 상호 배타적이지 않다. 현재 상태, 감사 history, domain event의 책임을 분리한 뒤 필요한 조합을 선택한다.

### 6.7 운영 체크리스트

- 어떤 aggregate와 변경 속성이 감사 대상인가?
- 누가, 언제, 왜 변경했는지 어떤 metadata가 필요한가?
- 감사 이력의 보존 기간과 삭제 권한은 무엇인가?
- 실제로 자주 사용하는 조회 조건은 무엇인가?
- 인덱스가 없는 현재 기준선에서 병목을 재현했는가?
- 인덱스 추가 전후 쓰기와 조회를 같은 workload로 반복 측정했는가?
- 감사 실패가 본 업무 transaction에 어떤 영향을 주는가?
- snapshot history와 domain event/read model을 구분했는가?

## 7. 시각 자료

### 7.1 대표 이미지

- 파일: `public/assets/bluetape4k-javers-part4-hero.png`
- 기존 Part 1~3과 같은 밝은 3D 미니어처 작업대 스타일
- 로봇 작업자가 aggregate 기록을 commit, snapshot, metadata 보관함으로 분류하고, 옆에서 비용 계기판을 확인하는 장면
- 기술 다이어그램이나 평면 아이콘 조합으로 대체하지 않는다.

### 7.2 감사 비용 지도

- 파일:
  - `public/assets/bluetape4k-javers-part4-audit-cost-map-01.svg`
  - `public/assets/bluetape4k-javers-part4-audit-cost-map-01.png`
- 형식: card와 connector를 사용한 architecture/flow diagram
- 질문: 한 번의 aggregate 변경에서 비용과 책임이 어디로 나뉘는가?
- 핵심 흐름: `Command → Aggregate → Source Table / JaVers Commit → Commit Metadata / Snapshot → Audit Query`
- domain event와 read model은 audit history와 다른 보조 분기로 표현한다.

### 7.3 감사 경로 비교 차트

- 파일:
  - `public/assets/bluetape4k-javers-part4-path-cost-01.svg`
  - `public/assets/bluetape4k-javers-part4-path-cost-01.png`
- 데이터: `2026-06-08-javers-exposed-ddd-envers-comparison.json`
- 단위: `ms/op`, 낮을수록 좋음
- insert, update, audit-query를 경로별로 비교하되 각 경로의 포함 범위를 캡션에 명시한다.

### 7.4 commit metadata 인덱스 차트

- 파일:
  - `public/assets/bluetape4k-javers-part4-metadata-index-01.svg`
  - `public/assets/bluetape4k-javers-part4-metadata-index-01.png`
- 데이터: `2026-06-08-javers-exposed-commit-metadata-indexes.json`
- 단위: `ops/s`, 높을수록 좋음
- insert, author query, date-range query의 혼합 신호를 보여 준다.
- 측정 1회의 smoke result라는 경고를 차트 안과 캡션에 모두 둔다.

모든 기술 다이어그램과 차트는 dark style로 만들며 SVG와 PNG를 함께 관리한다. MDX에는 PNG를 삽입하고 PNG를 최종 판정 기준으로 삼는다.

## 8. 시리즈와 언어 일치

- Part 1~3의 한글·영문 하단 시리즈 링크에 Part 4를 추가한다.
- Part 4의 한글·영문 글에는 Part 1~4 링크를 제공한다.
- 한글 승인 후 영문을 자연스럽게 현지화한다.
- 제목, 수치, 표의 행, source URL, 이미지 경로, 시리즈 링크를 두 언어에서 일치시킨다.
- 다이어그램 label은 English를 기본으로 하고, 본문 alt와 figcaption은 각 언어로 제공한다.

## 9. 리소스 구성

독자에게 도움이 되는 자료만 제공한다.

- benchmark module README
- `EnversComparisonBenchmark.kt`
- `ExposedCommitMetadataIndexBenchmark.kt`
- `ExposedCdoSnapshotRepository.kt`
- DDD example의 `AggregateRepository.kt`
- 두 커밋된 raw benchmark artifact

내부 review 문서와 lessons는 글의 사실 확인에 사용하되, 독자가 직접 읽어야 할 대표 자료가 아니면 리소스 목록에 노출하지 않는다.

## 10. 검증과 전달 범위

### 검증

- 현재 커밋된 JSON에서 본문과 차트 수치를 자동 대조한다.
- 모든 SVG를 XML parse하고 CairoSVG로 2배 PNG를 생성한다.
- diagram/chart별 정적 audit와 full-size PNG 육안 검사를 수행한다.
- `git diff --check`를 실행한다.
- `npm run build`로 Astro 진단과 모든 route 생성을 검증한다.
- 한글·영문 route, 이미지 embed, source URL, 제목, 수치, 시리즈 링크 parity를 확인한다.

### 전달 범위

- GitHub Issue #193을 참조하는 별도 PR을 생성한다.
- PR assignee는 `debop`으로 지정한다.
- Issue #193의 `documentation`, `enhancement` label과 milestone 상태를 PR에 반영한다.
- PR 본문의 마지막 `##` 절은 `## DoD Status`로 둔다.
- exact-head CI와 current review 상태를 확인하고 merge-ready까지만 보고한다.
- merge, branch 삭제, 배포는 이 작업 범위에서 제외한다.

## 11. 완료 조건

- 한글·영문 Part 4가 동일한 근거와 수치를 전달한다.
- Part 1~3의 시리즈 링크가 Part 4까지 연결된다.
- 두 benchmark 계열이 단위와 방향을 섞지 않고 설명된다.
- smoke benchmark의 한계가 본문, 차트, 캡션에 일관되게 표시된다.
- 대표 이미지와 세 기술 시각 자료가 기존 시리즈와 site UI에 맞게 렌더링된다.
- 로컬 build, route, asset, locale parity 검증이 통과한다.
- Issue #193에 연결된 PR이 생성되고 CI와 review evidence가 준비된다.
