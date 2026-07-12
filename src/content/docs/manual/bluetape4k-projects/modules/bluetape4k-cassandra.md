---
manualId: bluetape4k-cassandra
title: "Module bluetape4k-cassandra"
description: "A Kotlin extension library that makes it easier to use the Apache Cassandra Java Driver."
kind: library
group: data
manual:
  id: "bluetape4k-cassandra"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "dda876503926aa16302b4416e3f3a3e2bff26526"
  sourcePath: "docs/manual/en/modules/bluetape4k-cassandra.md"
  layer: "build"
---


## Problem

A Kotlin extension library that makes it easier to use the Apache Cassandra Java Driver. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-cassandra` when the application needs transaction boundaries, connection ownership, query behavior, and serialization. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-cassandra")
}
```

Gradle project path: `:bluetape4k-cassandra`. Source directory: `data/cassandra`.

## Concepts

The first source-level concepts to inspect are `CassandraAdmin`, `CqlIdentifierSupport`, `CqlQuerySupport`, `CqlSessionProvider`, `CqlSessionSupport`, `AsyncCqlSessionSupport`, `AsyncResultSetSupport`, and `DataTypeSupport`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`CassandraAdmin`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CassandraAdmin.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`CassandraAdmin`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CassandraAdmin.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CqlIdentifierSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CqlIdentifierSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CqlQuerySupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CqlQuerySupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CqlSessionProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CqlSessionProvider.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CqlSessionSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CqlSessionSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AsyncCqlSessionSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/AsyncCqlSessionSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AsyncResultSetSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/AsyncResultSetSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`DataTypeSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/DataTypeSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RowSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/RowSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`StatementSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/StatementSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Features**, **Architecture Diagrams**, **Extension Function API Overview**, **Core API Structure**, **Asynchronous Query Execution Flow**, **Dependency**, **Core Features**, **1. Creating a CqlSession**, **Cached sessions with explicit identity**, and **2. Asynchronous Queries (Coroutines)**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

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

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track pool saturation, query latency, retries, transaction rollbacks, and schema compatibility. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-cassandra:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractCassandraTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/AbstractCassandraTest.kt)
- [`CassandraAdminTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/CassandraAdminTest.kt)
- [`CqlIdentifierSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/CqlIdentifierSupportTest.kt)
- [`CqlQuerySupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/CqlQuerySupportTest.kt)
- [`CqlSessionProviderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/CqlSessionProviderTest.kt)
- [`CqlSessionSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/CqlSessionSupportTest.kt)
- [`AsyncCqlSessionSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/cql/AsyncCqlSessionSupportTest.kt)
- [`AsyncResultSetSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/cql/AsyncResultSetSupportTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/data/cassandra/build.gradle.kts)
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
