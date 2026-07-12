---
manualId: bluetape4k-cassandra
title: "Module bluetape4k-cassandra"
description: "Apache Cassandra Java Driver를 Kotlin에서 더욱 편리하게 사용할 수 있도록 하는 확장 라이브러리입니다."
kind: library
group: data
manual:
  id: "bluetape4k-cassandra"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "dda876503926aa16302b4416e3f3a3e2bff26526"
  sourcePath: "docs/manual/ko/modules/bluetape4k-cassandra.md"
  layer: "build"
---


## 해결하는 문제

Apache Cassandra Java Driver를 Kotlin에서 더욱 편리하게 사용할 수 있도록 하는 확장 라이브러리입니다. 이 매뉴얼은 README의 기능 목록을 반복하지 않고 현재 build, source entry point, test, 설정 resource, lifecycle 근거를 연결합니다.

## 사용 시점

애플리케이션에 transaction boundary, connection ownership, query 동작, serialization이 필요할 때 `bluetape4k-cassandra`를 선택합니다. 아래 source entry point에서 시작해 ownership과 failure 계약이 caller lifecycle에 맞는지 확인합니다. 표준 API나 이미 도입한 더 작은 모듈이 같은 계약을 만족한다면 그쪽을 우선합니다.

## 의존성 좌표

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-cassandra")
}
```

Gradle project path는 `:bluetape4k-cassandra`, source directory는 `data/cassandra`입니다.

## 핵심 개념

먼저 확인할 source 개념은 `CassandraAdmin`, `CqlIdentifierSupport`, `CqlQuerySupport`, `CqlSessionProvider`, `CqlSessionSupport`, `AsyncCqlSessionSupport`, `AsyncResultSetSupport`, `DataTypeSupport`입니다. 파일 이름은 탐색 anchor일 뿐이므로 public 계약으로 사용하기 전에 선언과 test를 함께 읽습니다.

## 빠른 시작

위 좌표를 추가하고 Gradle을 refresh한 뒤 필요한 작업을 소유한 가장 작은 entry point에서 시작합니다. 먼저 [`CassandraAdmin`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CassandraAdmin.kt)를 확인합니다. 이 파일이 모듈의 구체적인 source entry point입니다.

## 작업별 API

| Entry point | 확인할 내용 |
| --- | --- |
| [`CassandraAdmin`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CassandraAdmin.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`CqlIdentifierSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CqlIdentifierSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`CqlQuerySupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CqlQuerySupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`CqlSessionProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CqlSessionProvider.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`CqlSessionSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CqlSessionSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`AsyncCqlSessionSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/AsyncCqlSessionSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`AsyncResultSetSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/AsyncResultSetSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`DataTypeSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/DataTypeSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`RowSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/RowSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`StatementSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/StatementSupport.kt) | constructor, function, ownership 계약을 확인합니다. |

## 권장 패턴

README 근거는 **특징**, **아키텍처 다이어그램**, **확장 함수 API 개요**, **주요 API 구조**, **비동기 쿼리 실행 흐름**, **의존성 추가**, **주요 기능**, **1. CqlSession 생성**, **명시적 identity로 Session 캐싱**, **2. 비동기 쿼리 (Coroutines)** 순서로 탐색할 수 있습니다. 이 항목으로 방향을 잡고 source와 test에서 동작을 확인합니다. 도입 범위는 좁게 유지하고 소유한 resource를 caller lifecycle에 연결합니다.

## 연동

현재 build에 선언된 integration edge는 다음과 같습니다.

```kotlin
api(project(":bluetape4k-io"))
api(project(":bluetape4k-coroutines"))
api(libs.cassandra.java.driver.core)
api(libs.cassandra.java.driver.query.builder)
api(libs.cassandra.java.driver.mapper.runtime)
compileOnly(libs.cassandra.java.driver.metrics.micrometer)
implementation(libs.kotlinx.coroutines.core)
implementation(libs.kotlinx.coroutines.reactor)
```

`compileOnly` edge는 caller가 제공해야 하는 capability이므로 API를 사용하기 전에 runtime에 실제 dependency가 있는지 확인합니다.

## 설정

`src/main/resources` 아래에서 모듈 수준 설정 resource를 찾지 못했습니다. constructor, builder, function argument, 연동 framework로 설정하며 default는 source에서 확인합니다.

## 실패 동작

failure 의미는 artifact 이름이 아니라 아래 entry point와 test가 결정합니다. cancellation과 timeout signal을 보존하고 소유한 resource를 닫습니다. backend exception은 안정된 domain 계약을 추가할 수 있는 boundary에서만 변환합니다. retry나 fallback을 넣기 전에 test anchor로 실제 동작을 확인합니다.

## 운영

pool 포화, query latency, retry, transaction rollback, schema 호환성을 관찰합니다. capacity, timeout, retry, shutdown 설정은 resource를 소유한 component 가까이에 둡니다. 누가 trade-off를 받아들였는지 알 수 없는 process-wide default는 피합니다.

## 테스트

모듈 test task는 다음과 같습니다.

```bash
./gradlew :bluetape4k-cassandra:test --no-configuration-cache
```

대표 test anchor는 다음과 같습니다.

- [`AbstractCassandraTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/AbstractCassandraTest.kt)
- [`CassandraAdminTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/CassandraAdminTest.kt)
- [`CqlIdentifierSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/CqlIdentifierSupportTest.kt)
- [`CqlQuerySupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/CqlQuerySupportTest.kt)
- [`CqlSessionProviderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/CqlSessionProviderTest.kt)
- [`CqlSessionSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/CqlSessionSupportTest.kt)
- [`AsyncCqlSessionSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/cql/AsyncCqlSessionSupportTest.kt)
- [`AsyncResultSetSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/cql/AsyncResultSetSupportTest.kt)

## 워크숍

manual manifest에 등록된 전용 workshop path가 없습니다. 모듈 README와 위 representative test를 실행 근거로 사용합니다.

## 제한 사항

이 페이지는 연결된 source와 test가 나타내는 현재 저장소 상태를 설명합니다. optional backend를 애플리케이션 기본값으로 만들거나 benchmark artifact 없이 성능을 단정하지 않습니다. 모듈 버전이 바뀌면 호환성과 lifecycle 설명을 다시 확인해야 합니다.

## 근거

- [모듈 README](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/README.ko.md)
- [모듈 build](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/build.gradle.kts)
- [`CassandraAdmin`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CassandraAdmin.kt)
- [`CqlIdentifierSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CqlIdentifierSupport.kt)
- [`CqlQuerySupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CqlQuerySupport.kt)
- [`CqlSessionProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CqlSessionProvider.kt)
- [`CqlSessionSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CqlSessionSupport.kt)
- [`AsyncCqlSessionSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/AsyncCqlSessionSupport.kt)
- [`AsyncResultSetSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/AsyncResultSetSupport.kt)
- [`DataTypeSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/DataTypeSupport.kt)
- [`RowSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/RowSupport.kt)
- [`StatementSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/StatementSupport.kt)
- [`AbstractCassandraTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/AbstractCassandraTest.kt)
- [`CassandraAdminTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/CassandraAdminTest.kt)
