---
manualId: bluetape4k-r2dbc
title: "Module bluetape4k-r2dbc"
description: "A library that supports reactive data access using Coroutines and Flow in an R2DBC (Reactive Relational Database Connectivity) environment."
kind: library
group: data
manual:
  id: "bluetape4k-r2dbc"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6"
  sourcePath: "docs/manual/en/modules/bluetape4k-r2dbc.md"
  layer: "build"
---


## Problem

A library that supports reactive data access using Coroutines and Flow in an R2DBC (Reactive Relational Database Connectivity) environment. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-r2dbc` when the application needs transaction boundaries, connection ownership, query behavior, and serialization. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-r2dbc")
}
```

Gradle project path: `:bluetape4k-r2dbc`. Source directory: `data/r2dbc`.

## Concepts

The first source-level concepts to inspect are `R2dbcClient`, `R2dbcClientAutoConfiguration`, `ConnectionFactoryUtils`, `R2dbcTransactionManager`, `CompositeDatabasePopulator`, `ConnectionFactoryInitializer`, `ResourceDatabasePopulator`, and `MappingR2dbcConverter`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`R2dbcClient`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/R2dbcClient.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`R2dbcClient`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/R2dbcClient.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`R2dbcClientAutoConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/config/R2dbcClientAutoConfiguration.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ConnectionFactoryUtils`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/connection/ConnectionFactoryUtils.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`R2dbcTransactionManager`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/connection/R2dbcTransactionManager.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CompositeDatabasePopulator`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/connection/init/CompositeDatabasePopulator.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ConnectionFactoryInitializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/connection/init/ConnectionFactoryInitializer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ResourceDatabasePopulator`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/connection/init/ResourceDatabasePopulator.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MappingR2dbcConverter`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/convert/MappingR2dbcConverter.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JsonToMapConverter`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/convert/postgresql/JsonToMapConverter.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MapToJsonConverter`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/convert/postgresql/MapToJsonConverter.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Features**, **Architecture Diagrams**, **Extension Function API Overview**, **Core API Class Structure**, **R2DBC Query Execution Flow**, **JDBC vs R2DBC Comparison**, **Dependency**, **Core Features**, **1. R2DBC Connection Pool Tuning**, and **Tuning guide from the measurement**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
api(project(":bluetape4k-core"))
compileOnly(project(":bluetape4k-jackson3"))
compileOnly(libs.jackson3.module.kotlin)
api(project(":bluetape4k-coroutines"))
api(libs.kotlinx.coroutines.core)
api(libs.kotlinx.coroutines.reactive)
api(libs.kotlinx.coroutines.reactor)
compileOnly(libs.reactor.core)
compileOnly(libs.reactor.kotlin.extensions)
api(libs.r2dbc.pool)
compileOnly("org.springframework.boot:spring-boot-starter-data-r2dbc")
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`spring.factories`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/resources/META-INF/spring.factories)
- [`org.springframework.boot.autoconfigure.AutoConfiguration.imports`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track pool saturation, query latency, retries, transaction rollbacks, and schema compatibility. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-r2dbc:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractR2dbcTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/AbstractR2dbcTest.kt)
- [`R2dbcTestApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/R2dbcTestApplication.kt)
- [`R2dbcClientAutoConfigurationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/config/R2dbcClientAutoConfigurationTest.kt)
- [`R2dbcConfigurationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/config/R2dbcConfigurationTest.kt)
- [`ConnectionInitTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/connection/init/ConnectionInitTest.kt)
- [`PostgresJsonConvertersTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/convert/postgresql/PostgresJsonConvertersTest.kt)
- [`DatabaseClientBuilderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/core/DatabaseClientBuilderTest.kt)
- [`DeleteTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/core/DeleteTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/build.gradle.kts)
- [`R2dbcClient`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/R2dbcClient.kt)
- [`R2dbcClientAutoConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/config/R2dbcClientAutoConfiguration.kt)
- [`ConnectionFactoryUtils`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/connection/ConnectionFactoryUtils.kt)
- [`R2dbcTransactionManager`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/connection/R2dbcTransactionManager.kt)
- [`CompositeDatabasePopulator`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/connection/init/CompositeDatabasePopulator.kt)
- [`ConnectionFactoryInitializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/connection/init/ConnectionFactoryInitializer.kt)
- [`ResourceDatabasePopulator`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/connection/init/ResourceDatabasePopulator.kt)
- [`MappingR2dbcConverter`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/convert/MappingR2dbcConverter.kt)
- [`JsonToMapConverter`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/convert/postgresql/JsonToMapConverter.kt)
- [`MapToJsonConverter`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/convert/postgresql/MapToJsonConverter.kt)
- [`AbstractR2dbcTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/AbstractR2dbcTest.kt)
- [`R2dbcTestApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/R2dbcTestApplication.kt)
