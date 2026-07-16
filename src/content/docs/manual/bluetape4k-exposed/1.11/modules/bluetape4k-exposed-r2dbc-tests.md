---
slug: "manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-r2dbc-tests"
manualId: "bluetape4k-exposed-r2dbc-tests"
id: "bluetape4k-exposed-r2dbc-tests"
title: "Exposed R2DBC Test Support"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-r2dbc-tests"
sourceDir: "exposed/r2dbc-tests"
releaseRef: "1.11.0"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-r2dbc-tests
manual:
  id: "bluetape4k-exposed-r2dbc-tests"
  repository: "bluetape4k-exposed"
  group: "r2dbc"
  kind: "library"
  sourceCommit: "06bf8ce472aefbe925117901a971399cbee68a53"
  sourcePath: "docs/manual/en/modules/bluetape4k-exposed-r2dbc-tests.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "0b494a5fd1e083006046764757342b68a397e4c5"
  sourceDir: "exposed/r2dbc-tests"
  layer: "build"
---


> Suspending transaction, schema/table lifecycle, R2DBC driver, assertion, and Testcontainers fixtures.

## Problem

R2DBC tests must prove coroutine transaction propagation, driver behavior, cleanup after suspension/failure, and real dialect behavior. Reusing JDBC-only fixtures leaves the most important R2DBC boundaries untested.

## When to use it

Use it for R2DBC repository, query, driver, cancellation, and framework integration tests. It is a test dependency, not an application runtime module.

## Coordinates

`testImplementation("io.github.bluetape4k.exposed:bluetape4k-exposed-r2dbc-tests")`, managed by the central BOM.

## Core concepts

`withDb` acquires the per-database semaphore without blocking a coroutine worker, opens a `maxAttempts = 1` `suspendTransaction`, and restores temporary configuration. `withTables` and `withSchemas` create, commit, and clean up fixtures; schema cleanup preserves the primary failure and suppresses a secondary drop failure.

## Quick start

```kotlin
withTables(TestDB.POSTGRESQL, Actors) {
    Actors.insert { it[name] = "Ada" }
    Actors.selectAll().count() shouldBeEqualTo 1L
}
```

## API by task

| Task | API |
|---|---|
| Suspending transaction fixture | `withDb` |
| Table/schema lifecycle | `withTables`, `withSchemas` |
| Auto-commit probe | `withAutoCommit` |
| R2DBC database matrix | `TestDB`, configs and container helpers |
| Shared assertions/schema | assertion and `shared` packages |

## Recommended patterns

Collect database flows inside the fixture transaction. Test the deployed R2DBC driver with its matching Testcontainer. Add bounded cancellation tests and assert cleanup before the next test uses the same database.

## Integrations

The module exposes R2DBC SPI/pool, H2/MariaDB/MySQL/PostgreSQL R2DBC drivers, JUnit 5, and Testcontainers support for tests.

## Configuration

Choose `TestDB`, driver options, and optional `DatabaseConfig` per fixture. Temporary database references are restored after execution.

## Failure modes

Collecting after the fixture closes loses transaction context. Blocking semaphore acquisition on a coroutine worker reduces test concurrency; the fixture moves that acquisition to `Dispatchers.IO`. Cleanup failures must not replace the original assertion failure.

## Operations

Capture driver/container logs, coroutine timeout, and pool state on failure. Bound every test so a driver cancellation defect cannot hang the suite indefinitely.

## Testing

The module tests transaction fixtures, DDL cleanup, assertions, shared schemas, and SQL behavior. Consumer tests should add rollback, cancellation, partial-flow collection, and dialect-specific cases.

## Workshops and learning path

Apply it after [Coroutine transactions](/manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-r2dbc/coroutine-transactions/), then follow [Cancellation and testing](/manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-r2dbc/cancellation-and-testing/).

## Limitations

The fixture cannot guarantee that a particular driver cancels server-side work. It does not model production pool load or replace long-running resilience tests.

## Sources

- [Test module build](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/r2dbc-tests/build.gradle.kts)
- [`withDb`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/r2dbc-tests/src/main/kotlin/io/bluetape4k/exposed/r2dbc/tests/withDb.kt)
- [`withTables`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/r2dbc-tests/src/main/kotlin/io/bluetape4k/exposed/r2dbc/tests/withTables.kt)
