---
slug: "ko/manual/bluetape4k-projects/1.11/architecture/repository-map"
title: 저장소 지도
description: 등록 모듈을 Build, Learn, Apply 탐색에 맞게 분류한 지도입니다.
manual:
  id: "architecture/repository-map"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "a9051bd77bf5870d3787f15c1d32088412f2bdbb"
  sourcePath: "docs/manual/ko/architecture/repository-map.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "docs/manual"
  layer: "build"
---


매뉴얼 inventory는 Gradle `subprojects`에서 생성합니다. 디렉터리 이름은 탐색을 위한 metadata이며 복사된 진실 원천이 아닙니다.

| 경로 | 매뉴얼 그룹 | 주요 용도 |
| --- | --- | --- |
| `bluetape4k/` | Foundation | core type, annotation, logging, coroutine, BOM |
| `cache/` | Caching | cache 계약과 backend |
| `data/` | Data | JDBC, R2DBC, Hibernate, MongoDB, Cassandra |
| `infra/` | Infrastructure | Redis, messaging, resilience, metric, tracing, search |
| `io/` | I/O | codec, serialization, HTTP, gRPC, Protobuf, Vert.x |
| `ktor/` | Web | Ktor server 기반과 테스트 |
| `spring-boot/` | Spring | Spring Boot 통합 모듈과 demo |
| `testing/` | Testing | assertion, JUnit 지원, container, mock server |
| `utils/` | Utilities | domain 및 algorithm utility |
| `virtualthread/` | Concurrency | virtual thread API와 JDK 구현 |
| `examples/` | Learning | 실행 예제, 비게시 |
| `benchmark/` | Experiments | 재현 가능한 성능 실험, 비게시 |
