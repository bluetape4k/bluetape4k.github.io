---
slug: "manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-batch-r2dbc"
manualId: "bluetape4k-exposed-batch-r2dbc"
id: "bluetape4k-exposed-batch-r2dbc"
title: "Exposed Batch R2DBC Adapter"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-batch-r2dbc"
sourceDir: "utils/batch/r2dbc"
releaseRef: "2.0.0"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-batch-r2dbc
manual:
  id: "bluetape4k-exposed-batch-r2dbc"
  repository: "bluetape4k-exposed"
  group: "integration"
  kind: "library"
  sourceCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourcePath: "docs/manual/bluetape4k-exposed/en/modules/bluetape4k-exposed-batch-r2dbc.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourceDir: "utils/batch/r2dbc"
  layer: "build"
---


> A suspendable R2DBC repository, keyset reader, and batch writer for `batch-core`.

## Problem

Reactive applications need durable batch state without importing JDBC classes.
This artifact owns its R2DBC table and mapping definitions.

## When to use it

Choose it when the application owns an `R2dbcDatabase`, pool, and suspend
transaction lifecycle. Use the JDBC artifact for blocking Exposed transactions.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-batch-r2dbc")
    runtimeOnly("io.github.bluetape4k:bluetape4k-jackson3")
}
```

## Core concepts

`ExposedR2dbcBatchJobRepository` applies owner/version CAS inside one
`suspendTransaction`. The R2DBC tables and mappers intentionally do not reuse a
JDBC package.

## Quick start

Create the application-owned `R2dbcDatabase`, create the batch tables, choose
`CheckpointJson.jackson3()` or a custom serializer, and run the core runner in a
suspend scope.

## API by task

- Use `ExposedR2dbcBatchJobRepository` for durable suspendable state.
- Use `ExposedR2dbcBatchReader` for keyset pages and checkpoint restore.
- Use `ExposedR2dbcBatchWriter` for suspendable batch writes.

## Recommended patterns

Keep suspend database work outside non-suspending memory locks, preserve stable
reader ordering, and make writer effects idempotent.

## Integrations

The adapter depends on `batch-core`, Exposed R2DBC, and Bluetape coroutine/R2DBC
utilities. It has no production dependency on the JDBC adapter.

## Configuration

Configure the R2DBC pool, dialect, page size, and dispatcher. The application
owns database creation, transaction composition, metrics, and shutdown.

## Migration and compatibility

Replace the former aggregator dependency with `batch-core` plus this adapter and
keep versions supplied by the ecosystem BOM. New code imports the public
`io.bluetape4k.batch.CheckpointJson`; the deprecated
`io.bluetape4k.batch.internal.CheckpointJson` constructor and mapper overloads
remain only as JVM compatibility bridges. Custom repositories must implement
`saveCheckpointAndReturn` so owner/version CAS is retained. Add the optional
`bluetape4k-jackson3` runtime for `CheckpointJson.jackson3()`, or inject a custom
serializer with an explicit allowlist.

Run the compatibility fixtures from the repository root:

```bash
bash scripts/batch/validate_consumer_fixtures.sh
```

The gate covers `aggregator-runtime`, `core-custom-json`, `jdbc-runtime`,
`r2dbc-jackson3-runtime`, `legacy-binary-runtime`, and the Maven JDBC consumer.

## Failure modes

Wrong owner, stale version, unclaimed execution, and zero-row CAS updates fail
closed. Cancellation is not converted into a normal failure.
After a committed chunk, a later FAILED step keeps the last checkpoint. A null
failure report checkpoint is treated as no replacement, so the R2DBC completion
update does not erase the stored value and restart can resume after that key.

## Operations

Observe suspend transaction latency, lease expiry, CAS conflicts, checkpoint
size, and driver errors. Keep schema creation and migration outside the adapter.

## Testing

Run `./gradlew :bluetape4k-exposed-batch-r2dbc:test` sequentially for H2,
PostgreSQL, and MySQL_V8. The suite covers repository CAS, reader/writer
round-trips, restart, and R2DBC mapping.

## Workshops and learning path

Read the [core manual](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-batch-core/), then compare the
[JDBC adapter](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-batch-jdbc/) before selecting a transaction model.

## Limitations

The adapter does not own pools, schema migration, or exactly-once external
effects. Checkpoint persistence remains at-least-once.

## Sources

- [`ExposedR2dbcBatchJobRepository.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/utils/batch/r2dbc/src/main/kotlin/io/bluetape4k/batch/r2dbc/ExposedR2dbcBatchJobRepository.kt)
- [`BatchJobExecutionTable.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/utils/batch/r2dbc/src/main/kotlin/io/bluetape4k/batch/r2dbc/tables/BatchJobExecutionTable.kt)
- [`ExposedR2dbcBatchReader.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/utils/batch/r2dbc/src/main/kotlin/io/bluetape4k/batch/r2dbc/ExposedR2dbcBatchReader.kt)
