---
slug: "ko/manual/bluetape4k-graph/1.0"
title: "Bluetape4k Graph 0.5 매뉴얼"
manual:
  id: "index"
  repository: "bluetape4k-graph"
  group: "overview"
  kind: "guide"
  sourceCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourcePath: "docs/manual/bluetape4k-graph/ko/index.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourceDir: "docs/manual/bluetape4k-graph"
  layer: "build"
---


이 매뉴얼은 커밋 `a405300799b36d4d6edb7267ad07ff34d4ad3afe`에서 출시한 안정 버전 `1.0.0`을 설명한다. 공통 모델, 동기·코루틴 API, 지원 백엔드 다섯 개, graph-io, 프레임워크 연동이 범위다. Amazon Neptune은 1.0.0에서 **지원하지 않는다**. 백로그 이슈도 현재 기능으로 다루지 않는다.

## 핵심 기능

- **백엔드 독립 그래프 모델:** [핵심 모델](/ko/manual/bluetape4k-graph/1.0/architecture/core-model/)에서 모든 백엔드가 같은 vertex, edge, path, element ID 규칙을 사용합니다.
- **동기·코루틴 API:** [대응 API](/ko/manual/bluetape4k-graph/1.0/architecture/paired-apis/)가 저장소, 순회, 배치, merge, 트랜잭션 연산을 블로킹 실행과 일시 중단 실행에서 같은 구조로 제공합니다.
- **다섯 가지 데이터베이스 백엔드:** [백엔드 선택 가이드](/ko/manual/bluetape4k-graph/1.0/backends/selection-guide/)에서 Neo4j, Memgraph, Apache AGE, TinkerPop/TinkerGraph, FalkorDB를 쿼리 언어, 트랜잭션 동작, 운영 조건으로 비교합니다.
- **스키마·순회·트랜잭션:** [스키마와 트랜잭션](/ko/manual/bluetape4k-graph/1.0/architecture/schema-and-transactions/)에서 label, index, constraint, merge, path, 소유권 경계를 설명합니다.
- **그래프 가져오기와 내보내기:** [graph-io 형식](/ko/manual/bluetape4k-graph/1.0/graph-io/formats/), [실행 모델](/ko/manual/bluetape4k-graph/1.0/graph-io/execution-model/), [OkIO 보안](/ko/manual/bluetape4k-graph/1.0/graph-io/okio-security/)으로 CSV, NDJSON, GraphML, 압축, 인증 암호화를 다룹니다.
- **애플리케이션 연동과 예제:** [Spring Boot](/ko/manual/bluetape4k-graph/1.0/frameworks/spring-boot/), [Ktor](/ko/manual/bluetape4k-graph/1.0/frameworks/ktor/), [학습 경로](/ko/manual/bluetape4k-graph/1.0/guides/learning-path/)가 공통 API를 실행 가능한 도메인 예제와 운영 검증으로 연결합니다.

## 무엇부터 결정할까

1. [시작하기](/ko/manual/bluetape4k-graph/1.0/getting-started/)에서 생태계 BOM을 불러오고 첫 연산을 실행한다.
2. 드라이버를 고르기 전에 [백엔드 선택 가이드](/ko/manual/bluetape4k-graph/1.0/backends/selection-guide/)를 읽는다.
3. [핵심 모델](/ko/manual/bluetape4k-graph/1.0/architecture/core-model/), [동기·코루틴 API](/ko/manual/bluetape4k-graph/1.0/architecture/paired-apis/), [트랜잭션 경계](/ko/manual/bluetape4k-graph/1.0/architecture/schema-and-transactions/)를 익힌다.
4. [학습 경로](/ko/manual/bluetape4k-graph/1.0/guides/learning-path/)를 따라가고, 운영 전에 테스트와 운영 가이드를 적용한다.

![저장소 학습 지도](/manual-assets/bluetape4k-graph/1.0/overview/repository-learning-map.png)

API의 중심은 [`GraphOperations`](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/graph/graph-core/src/main/kotlin/io/bluetape4k/graph/repository/GraphOperations.kt)와 [`GraphSuspendOperations`](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/graph/graph-core/src/main/kotlin/io/bluetape4k/graph/repository/GraphSuspendOperations.kt)다. 두 API 모두 [`graph-core`의 공통 모델](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/graph/graph-core/src/main/kotlin/io/bluetape4k/graph/model/GraphVertex.kt)을 반환한다.

## 매뉴얼 지도

- 아키텍처: 저장소 구성, 모델, API 조합, 스키마, merge·batch, 순회, 트랜잭션
- 백엔드: Neo4j, Memgraph, Apache AGE, TinkerPop/TinkerGraph, FalkorDB
- graph-io: 파일 경계, 실행 모델, OkIO 압축과 인증 암호화
- 프레임워크: Ktor 플러그인과 Spring Boot 자동 설정의 생명주기
- 가이드: 단계별 학습, 테스트, 운영, 취소, benchmark 해석

소비자가 선택할 버전은 개별 graph 라이브러리나 graph BOM 버전이 아니라 `bluetape4k-dependencies` 버전 하나다. 이 매뉴얼의 의존성 예제는 생태계 BOM을 불러오고 모듈 좌표에는 버전을 쓰지 않는다.

## 가이드와 핵심 개념

- 시작: [시작하기](/ko/manual/bluetape4k-graph/1.0/getting-started/), [학습 경로](/ko/manual/bluetape4k-graph/1.0/guides/learning-path/)
- 아키텍처: [저장소 지도](/ko/manual/bluetape4k-graph/1.0/architecture/repository-map/), [핵심 모델](/ko/manual/bluetape4k-graph/1.0/architecture/core-model/), [동기·코루틴 API](/ko/manual/bluetape4k-graph/1.0/architecture/paired-apis/), [스키마와 트랜잭션](/ko/manual/bluetape4k-graph/1.0/architecture/schema-and-transactions/)
- 백엔드: [선택 가이드](/ko/manual/bluetape4k-graph/1.0/backends/selection-guide/), [Neo4j와 Memgraph](/ko/manual/bluetape4k-graph/1.0/backends/neo4j-and-memgraph/), [Apache AGE](/ko/manual/bluetape4k-graph/1.0/backends/apache-age/), [TinkerPop](/ko/manual/bluetape4k-graph/1.0/backends/tinkerpop/), [FalkorDB](/ko/manual/bluetape4k-graph/1.0/backends/falkordb/)
- graph-io: [파일 형식](/ko/manual/bluetape4k-graph/1.0/graph-io/formats/), [실행 모델](/ko/manual/bluetape4k-graph/1.0/graph-io/execution-model/), [OkIO 보안](/ko/manual/bluetape4k-graph/1.0/graph-io/okio-security/)
- 프레임워크: [Spring Boot](/ko/manual/bluetape4k-graph/1.0/frameworks/spring-boot/), [Ktor](/ko/manual/bluetape4k-graph/1.0/frameworks/ktor/)
- 운영 가이드: [테스트](/ko/manual/bluetape4k-graph/1.0/guides/testing/), [운영](/ko/manual/bluetape4k-graph/1.0/guides/operations/), [실패와 취소](/ko/manual/bluetape4k-graph/1.0/guides/failure-and-cancellation/), [벤치마크 기반 선택](/ko/manual/bluetape4k-graph/1.0/guides/benchmark-based-selection/)

## 배포 라이브러리

- 플랫폼과 핵심: [graph BOM](/ko/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-bom/), [graph core](/ko/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-core/)
- 백엔드: [Neo4j](/ko/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-neo4j/), [Memgraph](/ko/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-memgraph/), [Apache AGE](/ko/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-age/), [TinkerPop](/ko/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-tinkerpop/), [FalkorDB](/ko/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-falkordb/)
- graph-io: [core](/ko/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-io-core/), [CSV](/ko/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-io-csv/), [Jackson 2](/ko/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-io-jackson2/), [Jackson 3](/ko/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-io-jackson3/), [GraphML](/ko/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-io-graphml/), [OkIO](/ko/manual/bluetape4k-graph/1.0/modules/graph-okio/)
- 프레임워크: [Spring Boot](/ko/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-spring-boot/), [Ktor](/ko/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-ktor/)

## 예제

- 모델링: [코드 그래프](/ko/manual/bluetape4k-graph/1.0/examples/code-graph/), [지식 그래프](/ko/manual/bluetape4k-graph/1.0/examples/knowledge-graph/), [LinkedIn 그래프](/ko/manual/bluetape4k-graph/1.0/examples/linkedin-graph/), [추천](/ko/manual/bluetape4k-graph/1.0/examples/recommendation/)
- 위험과 운영: [사기 탐지](/ko/manual/bluetape4k-graph/1.0/examples/fraud-detection/), [IAM 접근 그래프](/ko/manual/bluetape4k-graph/1.0/examples/iam-access-graph/), [관찰 가능성 그래프](/ko/manual/bluetape4k-graph/1.0/examples/observability-graph/), [보안 공격 경로](/ko/manual/bluetape4k-graph/1.0/examples/security-attack-path/)
- 시스템: [공급망](/ko/manual/bluetape4k-graph/1.0/examples/supply-chain-graph/), [데이터 계보](/ko/manual/bluetape4k-graph/1.0/examples/data-lineage/), [네트워크 토폴로지](/ko/manual/bluetape4k-graph/1.0/examples/network-topology/), [Ktor 그래프](/ko/manual/bluetape4k-graph/1.0/examples/ktor-graph/)

## 벤치마크

- [벤치마크 전체 보기](/ko/manual/bluetape4k-graph/1.0/benchmarks/overview/)
- [그래프 연산](/ko/manual/bluetape4k-graph/1.0/benchmarks/graph-operations/)
- [graph-io](/ko/manual/bluetape4k-graph/1.0/benchmarks/graph-io/)
- [AGE와 Neo4j](/ko/manual/bluetape4k-graph/1.0/benchmarks/age-and-neo4j/)
