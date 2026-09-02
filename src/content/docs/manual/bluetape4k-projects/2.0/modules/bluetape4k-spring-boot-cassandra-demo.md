---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-spring-boot-cassandra-demo"
manualId: bluetape4k-spring-boot-cassandra-demo
title: "Spring Data Cassandra Example"
description: "A comprehensive set of examples for Apache Cassandra and Spring Data Cassandra (Spring Boot 4.x)."
kind: library
group: examples
learningOrder: 1450
manual:
  id: "bluetape4k-spring-boot-cassandra-demo"
  repository: "bluetape4k-projects"
  group: "examples"
  kind: "library"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-spring-boot-cassandra-demo.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "spring-boot/cassandra-demo"
  layer: "build"
  learningOrder: 1450
---


## Problem

A comprehensive set of examples for Apache Cassandra and Spring Data Cassandra (Spring Boot 4.x). This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-spring-boot-cassandra-demo` when the application needs auto-configuration conditions, bean ownership, property binding, and application lifecycle. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-spring-boot-cassandra-demo")
}
```

Gradle project path: `:bluetape4k-spring-boot-cassandra-demo`. Source directory: `spring-boot/cassandra-demo`.

## Concepts

The module is configuration or platform metadata and has no Kotlin/Java source type to index.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. The module has no Kotlin/Java source entry point; inspect its Gradle model and README.

## API by task

No Kotlin/Java source file is registered for this module. Use the build model and README as its public surface.

## Patterns

The README evidence is organized around **Example Architecture**, **Example List**, **Basic (basic/)**, **Kotlin DSL (kotlin/)**, **Reactive (reactive/)**, **Auditing (auditing/)**, **Entity Definition**, **Repository**, **Coroutines Support**, and **Running the Examples**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
implementation(project(":bluetape4k-cassandra"))
implementation(project(":bluetape4k-spring-boot-cassandra"))
implementation(libs.cassandra.java.driver.core)
implementation(libs.cassandra.java.driver.query.builder)
implementation(libs.cassandra.java.driver.mapper.runtime)
implementation(libs.cassandra.java.driver.metrics.micrometer)
implementation("org.springframework.boot:spring-boot-starter-aspectj")
implementation("org.springframework.boot:spring-boot-starter-data-cassandra")
implementation(project(":bluetape4k-coroutines"))
implementation(libs.kotlinx.coroutines.core)
implementation(libs.kotlinx.coroutines.reactive)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track condition reports, startup failures, pool/client health, request latency, and graceful shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-spring-boot-cassandra-demo:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractCassandraCoroutineTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/AbstractCassandraCoroutineTest.kt)
- [`AbstractCassandraTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/AbstractCassandraTest.kt)
- [`AbstractReactiveCassandraTestConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/AbstractReactiveCassandraTestConfiguration.kt)
- [`ReadmeCoroutineRepositoryContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/ReadmeCoroutineRepositoryContractTest.kt)
- [`AuditedPerson`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/auditing/AuditedPerson.kt)
- [`AuditedPersonRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/auditing/AuditedPersonRepository.kt)
- [`AuditingTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/auditing/AuditingTest.kt)
- [`AuditingTestConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/auditing/AuditingTestConfiguration.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `2.0.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### Spring Boot Cassandra demo example architecture diagram

[![Spring Boot Cassandra demo example architecture diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-projects/8165a8989e0075e7c17c489bf3000bf41fef8232/docs/images/readme-diagrams/spring-boot-cassandra-demo-diagram-01.png)](https://github.com/bluetape4k/bluetape4k-projects/blob/8165a8989e0075e7c17c489bf3000bf41fef8232/docs/images/readme-diagrams/spring-boot-cassandra-demo-diagram-01.svg)

_Release README: [`spring-boot/cassandra-demo/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/8165a8989e0075e7c17c489bf3000bf41fef8232/spring-boot/cassandra-demo/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/build.gradle.kts)
- [`AbstractCassandraCoroutineTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/AbstractCassandraCoroutineTest.kt)
- [`AbstractCassandraTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/AbstractCassandraTest.kt)
- [`AbstractReactiveCassandraTestConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/AbstractReactiveCassandraTestConfiguration.kt)
- [`ReadmeCoroutineRepositoryContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/ReadmeCoroutineRepositoryContractTest.kt)
- [`AuditedPerson`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/auditing/AuditedPerson.kt)
- [`AuditedPersonRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/auditing/AuditedPersonRepository.kt)
- [`AuditingTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/auditing/AuditingTest.kt)
- [`AuditingTestConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/cassandra-demo/src/test/kotlin/io/bluetape4k/examples/cassandra/auditing/AuditingTestConfiguration.kt)
