---
slug: "manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-batch-core"
manualId: "bluetape4k-exposed-batch-core"
id: "bluetape4k-exposed-batch-core"
title: "Exposed Batch Core"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-batch-core"
sourceDir: "utils/batch/core"
releaseRef: "2.0.0"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-batch-core
manual:
  id: "bluetape4k-exposed-batch-core"
  repository: "bluetape4k-exposed"
  group: "integration"
  kind: "library"
  sourceCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourcePath: "docs/manual/bluetape4k-exposed/en/modules/bluetape4k-exposed-batch-core.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourceDir: "utils/batch/core"
  layer: "build"
---


> The dependency-light batch API, coroutine runner, DSL, in-memory repository, and checkpoint contract.

## Problem

The compatibility aggregator historically owned every batch class. This artifact
isolates the runner and public contracts so applications that do not need a
database adapter can depend on a smaller surface.

## When to use it

Use `batch-core` for in-memory execution, custom repositories, or shared API
types. Choose `batch-jdbc` or `batch-r2dbc` only when durable Exposed persistence
is required.

## Coordinates

Declare the ecosystem BOM and omit individual versions:

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-batch-core")
}
```

## Core concepts

`BatchJobRepository`, `BatchReader`, `BatchWriter`, execution models, DSL
builders, `BatchStepRunner`, and the public `CheckpointJson` interface live here.
Owner-aware checkpoint updates use compare-and-set versions; the runner replaces
its local execution with the returned version.

## Quick start

Use `InMemoryBatchJobRepository` for a disposable process or test:

```kotlin
val repository = InMemoryBatchJobRepository()
val json = CheckpointJson.jackson3()
```

The Jackson 3 factory is optional at runtime; a custom `CheckpointJson` can be
provided when the application owns serialization.

## API by task

- Define jobs and steps with `BatchJob`, `BatchStep`, or the DSL builders.
- Implement `BatchReader` and `BatchWriter` boundaries.
- Use `BatchStepRunner` for chunk, retry, skip, timeout, and cancellation flow.
- Implement `BatchJobRepository` for a custom durable store.

## Recommended patterns

Keep repository callbacks outside in-memory lock sections, make writer effects
idempotent, and retain owner/version fields when implementing a repository.
Validate names at construction and direct repository entry points.

## Integrations

`batch-core` is Spring-neutral and adapter-neutral. Add `batch-jdbc` or
`batch-r2dbc` for Exposed persistence, or provide an application-owned repository.

## Configuration

Configure chunk size, retry policy, skip policy, commit timeout, and lease
duration on the runner. A repository must implement owner-aware CAS or explicitly
reject that operation; the core never silently falls back to an ID-only update.

## Migration from the aggregator

Move new imports from `io.bluetape4k.batch.internal.CheckpointJson` to
`io.bluetape4k.batch.CheckpointJson`. The old internal interface remains as a
deprecated JVM bridge for existing binaries, but new code should use the public
core type. `CheckpointJson.jackson3()` requires the optional
`bluetape4k-jackson3` runtime; otherwise provide an application-owned serializer
and explicitly register non-scalar checkpoint classes.

Custom `BatchJobRepository` implementations must implement
`saveCheckpointAndReturn(execution, checkpoint)`. The default implementation
fails closed with `UnsupportedOperationException`; the runner does not silently
fall back to the legacy ID-only update. Validate an upgrade with the five Gradle
consumer fixtures and the Maven fixture:

```bash
for fixture in aggregator-runtime core-custom-json jdbc-runtime r2dbc-jackson3-runtime legacy-binary-runtime; do
  ./gradlew -p "utils/batch/consumer-fixtures/$fixture" verifyProvenance compileKotlin
done
bash scripts/batch/validate_consumer_fixtures.sh
```

## Failure modes

Unclaimed, wrong-owner, stale-version, and zero-row checkpoint updates fail
closed. Cancellation remains a `CancellationException`; cleanup failures are
suppressed onto the primary cancellation instead of being swallowed.
When a step fails after a successful chunk, the runner carries that checkpoint
into the FAILED report. If failure handling cannot obtain a replacement, a
repository must preserve the last stored checkpoint instead of clearing it.
If checkpoint lookup itself is cancelled, the runner first attempts to persist
`STOPPED` with the stored checkpoint preserved, then propagates the
`CancellationException` with the original failure attached rather than
converting it to FAILED.
Owner-aware checkpoint commits also complete through receipt of the updated
version before cancellation is observed, so a commit followed by cancellation
cannot leave a stale owner lease behind.

## Operations

Observe execution status, owner, lease expiry, version, counters, and checkpoint
redaction at the adapter boundary. The core does not create database resources or
own application shutdown.

## Testing

Run `./gradlew :bluetape4k-exposed-batch-core:test`. The suite covers runner
cancellation, close ordering, name validation, in-memory ownership CAS, and
checkpoint lifecycle.

## Workshops and learning path

Start with the compatibility [batch manual](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-batch/), then
select the [JDBC adapter](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-batch-jdbc/) or
[R2DBC adapter](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-batch-r2dbc/).

## Limitations

In-memory execution is not restart-durable or multi-process coordinated. The
core does not provide a scheduler, schema migration, or database transaction.

## Sources

- [`BatchJobRepository.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/utils/batch/core/src/main/kotlin/io/bluetape4k/batch/api/BatchJobRepository.kt)
- [`BatchStepRunner.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/utils/batch/core/src/main/kotlin/io/bluetape4k/batch/core/BatchStepRunner.kt)
- [`CheckpointJson.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/utils/batch/core/src/main/kotlin/io/bluetape4k/batch/CheckpointJson.kt)
