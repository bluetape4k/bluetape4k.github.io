---
slug: "manual/bluetape4k-exposed/1.12/modules/bluetape4k-exposed-jdbc-tests"
manualId: "bluetape4k-exposed-jdbc-tests"
id: "bluetape4k-exposed-jdbc-tests"
title: "Exposed JDBC Test Support"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-jdbc-tests"
sourceDir: "exposed/jdbc-tests"
releaseRef: "1.12.1"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-jdbc-tests
manual:
  id: "bluetape4k-exposed-jdbc-tests"
  repository: "bluetape4k-exposed"
  group: "jdbc"
  kind: "library"
  sourceCommit: "6bff7d9939243d166e212ce840ee90261e7239c7"
  sourcePath: "docs/manual/en/modules/bluetape4k-exposed-jdbc-tests.md"
  minorVersion: "1.12"
  releaseRef: "1.12.1"
  releaseCommit: "4cc2cce07087241ec24a597d8464615434ea2b81"
  sourceDir: "exposed/jdbc-tests"
  layer: "build"
---


> Reusable JDBC database, transaction, schema, table, assertion, and Testcontainers fixtures.

## Problem

Database tests need deterministic connection reuse, per-database serialization, transaction setup, schema/table cleanup, and real dialects. Reimplementing that harness in every module makes failures harder to compare.

## When to use it

Use it in tests for Exposed JDBC code and shared table/mapping contracts. Keep it out of production runtime dependencies.

## Coordinates

`testImplementation("io.github.bluetape4k.exposed:bluetape4k-exposed-jdbc-tests")`, managed by the central BOM.

## Core concepts

`withDb` serializes access per `TestDB`, caches the connection, opens a `maxAttempts = 1` transaction, and restores temporary configuration. `withTables` creates fixtures and attempts deterministic cleanup, including a top-level fallback. `withSchemas` commits before cascade cleanup.

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
| Transaction fixture | `withDb` |
| Table lifecycle | `withTables` |
| Schema lifecycle | `withSchemas` |
| Auto-commit probe | `withAutoCommit` |
| Database matrix | `TestDB`, `TestDBConfig`, container helpers |
| Assertions/shared schemas | assertion and `shared` packages |

## Recommended patterns

Use H2 for fast DSL checks only when dialect behavior is irrelevant. Run the deployed database through Testcontainers for SQL, type, isolation, and migration behavior. Let the fixture own cleanup rather than sharing mutable tables between tests.

## Integrations

The module exposes JUnit 5, bluetape4k Testcontainers, and MariaDB/MySQL/PostgreSQL container support as test APIs. Drivers remain compile-time test dependencies.

## Configuration

Select a `TestDB` and optional `DatabaseConfig` override per call. Temporary configuration is restored after the fixture.

## Failure modes

Parallel tests against the same database without the fixture can race on DDL. Assuming cleanup always succeeds hides dialect/connection failures. A container test without a bounded startup policy can make the suite flaky.

## Operations

These are test-only operations. Capture container logs and database identity on failure; do not expose fixture credentials outside the test process.

## Testing

The support module tests its own serialization, transaction, configuration restoration, schema/table cleanup, assertions, and DDL behavior.

## Workshops and learning path

Use it with [JDBC operations and testing](/manual/bluetape4k-exposed/1.12/modules/bluetape4k-exposed-jdbc/operations-testing/) after learning [transaction ownership](/manual/bluetape4k-exposed/1.12/modules/bluetape4k-exposed-jdbc/transaction-ownership/).

## Limitations

The harness does not reproduce production pool load or replace migration/chaos tests. The per-database semaphore intentionally serializes conflicting fixture work.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `1.12.1` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### JDBC test dialect coverage

[![JDBC test dialect coverage](https://raw.githubusercontent.com/bluetape4k/bluetape4k-exposed/4cc2cce07087241ec24a597d8464615434ea2b81/docs/images/readme-diagrams/exposed-jdbc-tests-diagram-01.png)](https://github.com/bluetape4k/bluetape4k-exposed/blob/4cc2cce07087241ec24a597d8464615434ea2b81/docs/images/readme-diagrams/exposed-jdbc-tests-diagram-01.svg)

_Release README: [`exposed/jdbc-tests/README.md`](https://github.com/bluetape4k/bluetape4k-exposed/blob/4cc2cce07087241ec24a597d8464615434ea2b81/exposed/jdbc-tests/README.md)_

### JDBC test lifecycle

[![JDBC test lifecycle](https://raw.githubusercontent.com/bluetape4k/bluetape4k-exposed/4cc2cce07087241ec24a597d8464615434ea2b81/docs/images/readme-diagrams/exposed-jdbc-tests-sequence-01.png)](https://github.com/bluetape4k/bluetape4k-exposed/blob/4cc2cce07087241ec24a597d8464615434ea2b81/docs/images/readme-diagrams/exposed-jdbc-tests-sequence-01.svg)

_Release README: [`exposed/jdbc-tests/README.md`](https://github.com/bluetape4k/bluetape4k-exposed/blob/4cc2cce07087241ec24a597d8464615434ea2b81/exposed/jdbc-tests/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Test module build](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.12.1/exposed/jdbc-tests/build.gradle.kts)
- [`withDb`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.12.1/exposed/jdbc-tests/src/main/kotlin/io/bluetape4k/exposed/tests/WithDB.kt)
- [`withTables`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.12.1/exposed/jdbc-tests/src/main/kotlin/io/bluetape4k/exposed/tests/WithTables.kt)
