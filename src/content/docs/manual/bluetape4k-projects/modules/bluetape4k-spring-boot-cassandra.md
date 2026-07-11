---
manualId: bluetape4k-spring-boot-cassandra
title: "Module bluetape4k-spring-boot-cassandra"
description: "Provides coroutine extensions, convenience DSLs, and schema utilities for Spring Data Cassandra development (Spring Boot 4.x)."
kind: library
group: spring
manual:
  id: "bluetape4k-spring-boot-cassandra"
  repository: "bluetape4k-projects"
  group: "spring"
  kind: "library"
  sourceCommit: "0c14ff5fa62a236de94bed884cb4a7faa31df7c4"
  sourcePath: "docs/manual/en/modules/bluetape4k-spring-boot-cassandra.md"
  layer: "build"
---

# Module bluetape4k-spring-boot-cassandra

## Problem {#problem}

Provides coroutine extensions, convenience DSLs, and schema utilities for Spring Data Cassandra development (Spring Boot 4.x). This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use {#when-to-use}

Use `bluetape4k-spring-boot-cassandra` when the application needs auto-configuration conditions, bean ownership, property binding, and application lifecycle. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates {#coordinates}

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-spring-boot-cassandra")
}
```

Gradle project path: `:bluetape4k-spring-boot-cassandra`. Source directory: `spring-boot/cassandra`.

## Concepts {#concepts}

The first source-level concepts to inspect are `AsyncCassandraOperationsCoroutines`, `ReactiveCassandraBatchOperationsCoroutines`, `ReactiveCassandraOperationsCoroutines`, `ReactiveSelectOperationSupport`, `ReactiveSessionCoroutines`, `AsyncCqlOperationsCoroutines`, `OptionsSupport`, and `ReactiveCqlOperationsSupport`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start {#quick-start}

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`AsyncCassandraOperationsCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/AsyncCassandraOperationsCoroutines.kt) first; it is a concrete source entry point for the module.

## API by task {#api-by-task}

| Entry point | What to verify |
| --- | --- |
| [`AsyncCassandraOperationsCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/AsyncCassandraOperationsCoroutines.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ReactiveCassandraBatchOperationsCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/ReactiveCassandraBatchOperationsCoroutines.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ReactiveCassandraOperationsCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/ReactiveCassandraOperationsCoroutines.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ReactiveSelectOperationSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/ReactiveSelectOperationSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ReactiveSessionCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/ReactiveSessionCoroutines.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AsyncCqlOperationsCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/cql/AsyncCqlOperationsCoroutines.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`OptionsSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/cql/OptionsSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ReactiveCqlOperationsSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/cql/ReactiveCqlOperationsSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AbstractCassandraAuditable`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/model/AbstractCassandraAuditable.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AbstractCassandraPersistable`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/model/AbstractCassandraPersistable.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns {#patterns}

The README evidence is organized around **Key Features**, **Architecture Diagrams**, **Core Extension and Class Structure**, **Cassandra Data Access Layer**, **Coroutine Conversion Sequence**, **Installation**, **Usage Examples**, **Coroutine Extensions**, **WriteOptions DSL**, and **Entity Definition**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations {#integrations}

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
api(project(":bluetape4k-cassandra"))
api(project(":bluetape4k-spring-boot-core"))
api(libs.cassandra.java.driver.core)
api(libs.cassandra.java.driver.query.builder)
compileOnly(libs.cassandra.java.driver.mapper.runtime)
compileOnly(libs.cassandra.java.driver.metrics.micrometer)
compileOnly("org.springframework.boot:spring-boot-autoconfigure")
compileOnly("org.springframework.boot:spring-boot-configuration-processor")
implementation("org.springframework.boot:spring-boot-starter-data-cassandra")
api(project(":bluetape4k-coroutines"))
api(libs.kotlinx.coroutines.core)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration {#configuration}

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures {#failures}

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations {#operations}

Track condition reports, startup failures, pool/client health, request latency, and graceful shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing {#testing}

Run the module test task:

```bash
./gradlew :bluetape4k-spring-boot-cassandra:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractCassandraCoroutineTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/test/kotlin/io/bluetape4k/spring/cassandra/AbstractCassandraCoroutineTest.kt)
- [`AbstractCassandraTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/test/kotlin/io/bluetape4k/spring/cassandra/AbstractCassandraTest.kt)
- [`AbstractCassandraTestConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/test/kotlin/io/bluetape4k/spring/cassandra/AbstractCassandraTestConfiguration.kt)
- [`AbstractReactiveCassandraTestConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/test/kotlin/io/bluetape4k/spring/cassandra/AbstractReactiveCassandraTestConfiguration.kt)
- [`AsyncCassandraOperationsCoroutinesUnitTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/test/kotlin/io/bluetape4k/spring/cassandra/AsyncCassandraOperationsCoroutinesUnitTest.kt)
- [`ReactiveCassandraBatchOperationsCoroutinesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/test/kotlin/io/bluetape4k/spring/cassandra/ReactiveCassandraBatchOperationsCoroutinesTest.kt)
- [`ReactiveCassandraOperationsCoroutinesUnitTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/test/kotlin/io/bluetape4k/spring/cassandra/ReactiveCassandraOperationsCoroutinesUnitTest.kt)
- [`ReactiveSelectOperationSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/test/kotlin/io/bluetape4k/spring/cassandra/ReactiveSelectOperationSupportTest.kt)

## Workshops {#workshops}

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations {#limitations}

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources {#sources}

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/build.gradle.kts)
- [`AsyncCassandraOperationsCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/AsyncCassandraOperationsCoroutines.kt)
- [`ReactiveCassandraBatchOperationsCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/ReactiveCassandraBatchOperationsCoroutines.kt)
- [`ReactiveCassandraOperationsCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/ReactiveCassandraOperationsCoroutines.kt)
- [`ReactiveSelectOperationSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/ReactiveSelectOperationSupport.kt)
- [`ReactiveSessionCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/ReactiveSessionCoroutines.kt)
- [`AsyncCqlOperationsCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/cql/AsyncCqlOperationsCoroutines.kt)
- [`OptionsSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/cql/OptionsSupport.kt)
- [`ReactiveCqlOperationsSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/cql/ReactiveCqlOperationsSupport.kt)
- [`AbstractCassandraAuditable`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/model/AbstractCassandraAuditable.kt)
- [`AbstractCassandraPersistable`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/model/AbstractCassandraPersistable.kt)
- [`AbstractCassandraCoroutineTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/test/kotlin/io/bluetape4k/spring/cassandra/AbstractCassandraCoroutineTest.kt)
- [`AbstractCassandraTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/spring-boot/cassandra/src/test/kotlin/io/bluetape4k/spring/cassandra/AbstractCassandraTest.kt)
