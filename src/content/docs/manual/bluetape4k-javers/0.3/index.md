---
slug: "manual/bluetape4k-javers/0.3"
title: "bluetape4k-javers 0.2 manual"
manual:
  id: "index"
  repository: "bluetape4k-javers"
  group: "overview"
  kind: "guide"
  sourceCommit: "fb279cdba663bde80d9b146049aca146433a9b36"
  sourcePath: "docs/manual/en/index.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "978d0490fc438570e7520643aed50e20614772d1"
  sourceDir: "docs/manual"
  layer: "build"
---


Object auditing becomes difficult when application state, audit history, and query projections are treated as one store. `bluetape4k-javers` 0.3.0 gives Kotlin services a JaVers audit layer with Exposed, Redis, and Kafka adapters, but each adapter has a different responsibility. This manual starts with those boundaries so that a service does not accidentally use a cache or stream as its only recoverable record.

## Core capabilities

- **Audit snapshots and diffs:** The [audit model](/manual/bluetape4k-javers/0.3/architecture/audit-model/) explains JaVers commits, snapshots, changes, shadows, and the query semantics built on them.
- **DDD aggregate history:** [javers-ddd](/manual/bluetape4k-javers/0.3/modules/javers-ddd/) and the [DDD/CQRS guide](/manual/bluetape4k-javers/0.3/guides/ddd-and-cqrs/) connect aggregate commands and domain events to explicit JaVers commits.
- **Relational persistence:** [Exposed persistence](/manual/bluetape4k-javers/0.3/persistence/exposed/) stores recoverable CDO snapshots in a JDBC database without replacing the application's own Exposed repositories.
- **Redis and Kafka adapters:** [Redis](/manual/bluetape4k-javers/0.3/persistence/redis/) supports cache/read-model paths, while [Kafka](/manual/bluetape4k-javers/0.3/persistence/kafka/) publishes audit records for downstream consumers; neither silently becomes the business source of truth.
- **Failure and observability contracts:** [Failure contracts](/manual/bluetape4k-javers/0.3/operations/failure-contracts/) and [observability](/manual/bluetape4k-javers/0.3/operations/observability/) define partial-write, retry, lag, and recovery signals.
- **Runnable learning and comparison:** The [Exposed DDD example](/manual/bluetape4k-javers/0.3/examples/javers-exposed-ddd/) and [JaVers/Exposed DDD/Envers comparison](/manual/bluetape4k-javers/0.3/benchmarks/exposed-ddd-envers/) connect the abstractions to code and measured evidence.

The manual is pinned to release `0.3.0` (`978d0490fc438570e7520643aed50e20614772d1`). Ktor integration, Spring Boot 4 auto-configuration and examples, and the dedicated Gradle benchmark module were added after that release. They are not 0.2 features.

## Release overview

This repository overview is loaded directly from the immutable `0.3.0` release commit. It shows only the structure available to users of this manual; newer Snapshot modules and relationships are intentionally excluded. Select the preview to open the SVG at the same release commit.

[![bluetape4k-javers 0.3.0 repository overview](https://raw.githubusercontent.com/bluetape4k/bluetape4k-javers/978d0490fc438570e7520643aed50e20614772d1/docs/images/readme-diagrams/root-readme-overview-01.png)](https://github.com/bluetape4k/bluetape4k-javers/blob/978d0490fc438570e7520643aed50e20614772d1/docs/images/readme-diagrams/root-readme-overview-01.svg)

## Learning map

[![Repository learning map](/manual-assets/bluetape4k-javers/0.3/overview/repository-learning-map.png)](../assets/overview/repository-learning-map.svg)

## Start here

- [Getting started](/manual/bluetape4k-javers/0.3/getting-started/) installs a coherent ecosystem dependency set and creates a small Exposed-backed JaVers instance.
- [Repository map](/manual/bluetape4k-javers/0.3/architecture/repository-map/) shows which module owns audit semantics, persistence, and event publication.
- [Persistence selection](/manual/bluetape4k-javers/0.3/persistence/selection-guide/) compares Exposed, Redis, and Kafka by recovery and query needs.
- [Learning path](/manual/bluetape4k-javers/0.3/guides/learning-path/) orders the material for application developers, library integrators, and operators.

## Use the manual by question

If you need to understand JaVers data, read [the audit model](/manual/bluetape4k-javers/0.3/architecture/audit-model/). If you are composing storage, cache, or publication paths, read [repository composition](/manual/bluetape4k-javers/0.3/architecture/repository-composition/) and [failure contracts](/manual/bluetape4k-javers/0.3/operations/failure-contracts/). For a command-to-projection example, follow [DDD and CQRS](/manual/bluetape4k-javers/0.3/guides/ddd-and-cqrs/). For production proof, use [testing](/manual/bluetape4k-javers/0.3/guides/testing/) and [observability](/manual/bluetape4k-javers/0.3/operations/observability/).

## Architecture, persistence, and operations

- [Audit model](/manual/bluetape4k-javers/0.3/architecture/audit-model/) separates commits, snapshots, changes, and shadows.
- [Repository composition](/manual/bluetape4k-javers/0.3/architecture/repository-composition/) explains the source-of-truth and adapter boundaries.
- [Persistence selection](/manual/bluetape4k-javers/0.3/persistence/selection-guide/) compares the recovery contract of Exposed, Redis, and Kafka.
- [Exposed](/manual/bluetape4k-javers/0.3/persistence/exposed/), [Redis](/manual/bluetape4k-javers/0.3/persistence/redis/), and [Kafka](/manual/bluetape4k-javers/0.3/persistence/kafka/) document each adapter in depth.
- [Failure contracts](/manual/bluetape4k-javers/0.3/operations/failure-contracts/) and [observability](/manual/bluetape4k-javers/0.3/operations/observability/) turn those boundaries into operational checks.

## Modules and runnable material

- Foundation: [Javers BOM](/manual/bluetape4k-javers/0.3/modules/bluetape4k-javers-bom/), [javers-core](/manual/bluetape4k-javers/0.3/modules/javers-core/), and [javers-ddd](/manual/bluetape4k-javers/0.3/modules/javers-ddd/)
- Persistence: [javers-exposed](/manual/bluetape4k-javers/0.3/modules/javers-exposed/), [javers-persistence-redis](/manual/bluetape4k-javers/0.3/modules/javers-persistence-redis/), and [javers-persistence-kafka](/manual/bluetape4k-javers/0.3/modules/javers-persistence-kafka/)
- Example: [JaVers + Exposed DDD order flow](/manual/bluetape4k-javers/0.3/examples/javers-exposed-ddd/)
- Benchmarks: [how to read the evidence](/manual/bluetape4k-javers/0.3/benchmarks/overview/) and the [JaVers, Exposed DDD, and Envers comparison](/manual/bluetape4k-javers/0.3/benchmarks/exposed-ddd-envers/)
- Ecosystem path: [where this repository connects to Exposed and application architecture](/manual/bluetape4k-javers/0.3/guides/cross-repository-paths/)

The release source is the behavior authority. The most important starting points are [`CdoSnapshotRepository`](https://github.com/bluetape4k/bluetape4k-javers/blob/978d0490fc438570e7520643aed50e20614772d1/javers-core/src/main/kotlin/io/bluetape4k/javers/repository/CdoSnapshotRepository.kt), [`AggregateRepository`](https://github.com/bluetape4k/bluetape4k-javers/blob/978d0490fc438570e7520643aed50e20614772d1/javers-ddd/src/main/kotlin/io/bluetape4k/javers/ddd/AggregateRepository.kt), and the [`javers-exposed-ddd` example](https://github.com/bluetape4k/bluetape4k-javers/tree/0.3.0/examples/javers-exposed-ddd).
