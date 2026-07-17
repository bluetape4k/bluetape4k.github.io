---
slug: "manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-spring-boot-batch"
manualId: "bluetape4k-exposed-spring-boot-batch"
id: "bluetape4k-exposed-spring-boot-batch"
title: "Exposed Spring Boot Batch Integration"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-spring-boot-batch"
sourceDir: "spring-boot/batch-exposed"
releaseRef: "1.11.0"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-spring-boot-batch
manual:
  id: "bluetape4k-exposed-spring-boot-batch"
  repository: "bluetape4k-exposed"
  group: "integration"
  kind: "library"
  sourceCommit: "803227f0f6aa061ddad6cb66721c565dee38f53c"
  sourcePath: "docs/manual/en/modules/bluetape4k-exposed-spring-boot-batch.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "0b494a5fd1e083006046764757342b68a397e4c5"
  sourceDir: "spring-boot/batch-exposed"
  layer: "build"
---


> Exposed range partitioning, keyset restart, and chunk writers inside Spring Boot's Spring Batch runtime.

## Problem

This module adds Exposed-aware `Partitioner`, `ItemStreamReader`, and `ItemWriter` implementations plus an overridable partition executor to a Spring Batch application. It relies on Spring Boot's `BatchAutoConfiguration` for job infrastructure. Do **not** add `@EnableBatchProcessing`: in the supported Boot configuration it disables the Boot Batch auto-configuration this integration expects.

The adjacent lightweight runtime has a different ownership model:

![Lightweight BatchStepRunner flow for comparison](/manual-assets/bluetape4k-exposed/1.11/batch/runtime.png)

## When to use it

Use this module when the application already uses Spring Batch jobs, steps, chunk commits, `ExecutionContext`, restart metadata, and partition execution, but wants Exposed to read and write application tables. Use [Exposed Batch Utilities](/manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-batch/) instead when a small coroutine runner with its own execution repository is sufficient.

## Coordinates

Import the ecosystem BOM and omit the module version:

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-spring-boot-batch")
}
```

## Core concepts

`ExposedRangePartitioner` reads the minimum and maximum of a monotonic `Long` key and writes `minId` and `maxId` into each partition's `ExecutionContext`. `ExposedKeysetItemReader` restores those bounds plus `lastKey`, then reads `column > lastKey AND column <= maxId ORDER BY column ASC LIMIT pageSize`. Its `update` method saves `lastKey`, so Spring Batch persists progress at a committed chunk boundary.

The Exposed writers execute directly in the Spring Batch chunk transaction managed through `SpringTransactionManager`. They intentionally do not open a nested Exposed `transaction {}` block.

## Quick start

Keep Boot Batch auto-configuration enabled, define the job and chunk-oriented worker step, and attach an `ExposedRangePartitioner` to the manager step. Create a step-scoped `ExposedKeysetItemReader` for each partition and choose `ExposedItemWriter`, `ExposedUpdateItemWriter`, or `ExposedUpsertItemWriter` for the worker step.

```yaml
spring:
  batch:
    job:
      enabled: false # launch jobs explicitly when that matches the service lifecycle
```

Do not add `@EnableBatchProcessing` merely to make the job run; diagnose Boot Batch auto-configuration instead.

## API by task

- Partition a `Column<Long>` with `ExposedRangePartitioner`; use `forEntityId` for a `LongIdTable`.
- Read a partition with `ExposedKeysetItemReader`; use its `forEntityId` factory for DAO ID tables.
- Insert chunks with `ExposedItemWriter`, update each key with `ExposedUpdateItemWriter`, or use database-supported batch upsert through `ExposedUpsertItemWriter`.
- Inject the bean named `batchPartitionTaskExecutor` into a partition handler, or provide a bean with that name to replace the default.
- Configure jobs with the helpers in `BatchJobExtensions.kt` while leaving transaction ownership with Spring Batch.

## Recommended patterns

Partition only on a unique, monotonic key whose range remains reasonably stable during a run. Keep `gridSize`, executor concurrency, database pool size, and downstream write capacity aligned. Use keyset ordering without gaps in the comparison semantics. Prefer upsert or another idempotent write when an operator may restart a job after uncertain external effects.

## Integrations

`ExposedBatchAutoConfiguration` runs after `BatchAutoConfiguration` and is conditional on Spring Batch `Job`. It contributes only `ExposedBatchProperties` and, when enabled and missing, `batchPartitionTaskExecutor`. The default is `SimpleAsyncTaskExecutor` with virtual threads enabled; an application-defined bean of the same name takes precedence.

## Configuration

`bluetape4k.batch.executor.enabled=false` disables the default executor. `virtual-threads` defaults to `true`; `concurrency-limit` defaults to twice the available processors; `await-termination-seconds` defaults to 30. These are executor limits, not database capacity guarantees. Set the reader `pageSize`, partition `gridSize`, Spring Batch chunk size, and datasource pool together from measurements.

## Failure modes

- Boot Batch infrastructure is missing after adding `@EnableBatchProcessing`: remove the annotation and let Boot auto-configure it.
- A partition repeats or misses rows: verify a unique monotonic key, stable `minId`/`maxId`, and `lastKey` restoration.
- Restart begins before expected data: only a committed chunk advances durable Spring Batch `ExecutionContext`; inspect the last committed step state.
- Writer reports no Exposed transaction: verify the step uses the `SpringTransactionManager` connected to the same datasource and do not open an unrelated nested transaction.
- Virtual-thread concurrency overwhelms the pool: reduce `concurrency-limit`, partition count, or chunk pressure; virtual threads do not create database connections.

## Operations

Observe job and step status, partition name, `minId`, `maxId`, `lastKey`, read/write/skip counts, commit count, executor concurrency, pool acquisition, and chunk latency. On restart, compare the restored `lastKey` with the last committed business rows. An in-memory reader buffer is not durable; `ExecutionContext` is the restart authority.

## Testing

Run the exact module tests:

```bash
./gradlew :bluetape4k-exposed-spring-boot-batch:test
```

Verify Boot auto-configuration without `@EnableBatchProcessing`, default and overridden executor beans, empty and uneven ranges, stable partition bounds, keyset restart from `lastKey`, chunk rollback, restart after a committed chunk, and insert/update/upsert writers participating in the existing chunk transaction without a nested transaction.

## Workshops and learning path

Compare [Exposed Batch Utilities](/manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-batch/) before choosing a runtime, then read [transaction boundaries](/manual/bluetape4k-exposed/1.11/guides/transaction-boundaries/). Use the end-to-end and restart tests in this module as the executable Spring Batch contract.

## Limitations

Range partitioning assumes a `Long`-compatible, unique, monotonic key and is best when large inserts or deletes do not reshape the range during execution. `lastKey` records read progress at Spring Batch checkpoints; it does not make external side effects atomic. The default virtual-thread executor is optional and replaceable, and must still respect database pool limits.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `1.11.0` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### Spring Batch Exposed integration map

[![Spring Batch Exposed integration map](/manual-assets/bluetape4k-exposed/1.11/readme-diagrams/spring-boot-batch-exposed-diagram-01.png)](../../assets/readme-diagrams/spring-boot-batch-exposed-diagram-01.svg)

_Release README: [`spring-boot/batch-exposed/README.md`](https://github.com/bluetape4k/bluetape4k-exposed/blob/0b494a5fd1e083006046764757342b68a397e4c5/spring-boot/batch-exposed/README.md)_

### Partitioned keyset restart flow

[![Partitioned keyset restart flow](/manual-assets/bluetape4k-exposed/1.11/readme-diagrams/spring-boot-batch-exposed-sequence-01.png)](../../assets/readme-diagrams/spring-boot-batch-exposed-sequence-01.svg)

_Release README: [`spring-boot/batch-exposed/README.md`](https://github.com/bluetape4k/bluetape4k-exposed/blob/0b494a5fd1e083006046764757342b68a397e4c5/spring-boot/batch-exposed/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [`ExposedBatchAutoConfiguration.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/spring-boot/batch-exposed/src/main/kotlin/io/bluetape4k/spring/batch/exposed/config/ExposedBatchAutoConfiguration.kt)
- [`ExposedBatchProperties.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/spring-boot/batch-exposed/src/main/kotlin/io/bluetape4k/spring/batch/exposed/config/ExposedBatchProperties.kt)
- [`ExposedRangePartitioner.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/spring-boot/batch-exposed/src/main/kotlin/io/bluetape4k/spring/batch/exposed/partition/ExposedRangePartitioner.kt)
- [`ExposedKeysetItemReader.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/spring-boot/batch-exposed/src/main/kotlin/io/bluetape4k/spring/batch/exposed/reader/ExposedKeysetItemReader.kt)
- [`ExposedItemWriter.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/spring-boot/batch-exposed/src/main/kotlin/io/bluetape4k/spring/batch/exposed/writer/ExposedItemWriter.kt)
- [`ExposedUpdateItemWriter.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/spring-boot/batch-exposed/src/main/kotlin/io/bluetape4k/spring/batch/exposed/writer/ExposedUpdateItemWriter.kt)
- [`ExposedUpsertItemWriter.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/spring-boot/batch-exposed/src/main/kotlin/io/bluetape4k/spring/batch/exposed/writer/ExposedUpsertItemWriter.kt)
