---
slug: "manual/bluetape4k-javers/0.2"
title: "bluetape4k-javers 0.2 manual"
manual:
  id: "index"
  repository: "bluetape4k-javers"
  group: "overview"
  kind: "guide"
  sourceCommit: "dd5a341e436b63fb47575e17fed761d007314202"
  sourcePath: "docs/manual/en/index.md"
  minorVersion: "0.2"
  releaseRef: "0.2.1"
  releaseCommit: "bffe19439ca891fa5301a76421bdef7ba75252a0"
  sourceDir: "docs/manual"
  layer: "build"
---


Object auditing becomes difficult when application state, audit history, and query projections are treated as one store. `bluetape4k-javers` 0.2.1 gives Kotlin services a JaVers audit layer with Exposed, Redis, and Kafka adapters, but each adapter has a different responsibility. This manual starts with those boundaries so that a service does not accidentally use a cache or stream as its only recoverable record.

The manual is pinned to release `0.2.1` (`bffe19439ca891fa5301a76421bdef7ba75252a0`). Ktor integration, Spring Boot 4 auto-configuration and examples, and the dedicated Gradle benchmark module were added after that release. They are not 0.2 features.

[![Repository learning map](/manual-assets/bluetape4k-javers/0.2/overview/repository-learning-map.png)](../assets/overview/repository-learning-map.svg)

## Start here

- [Getting started](/manual/bluetape4k-javers/0.2/getting-started/) installs a coherent ecosystem dependency set and creates a small Exposed-backed JaVers instance.
- [Repository map](/manual/bluetape4k-javers/0.2/architecture/repository-map/) shows which module owns audit semantics, persistence, and event publication.
- [Persistence selection](/manual/bluetape4k-javers/0.2/persistence/selection-guide/) compares Exposed, Redis, and Kafka by recovery and query needs.
- [Learning path](/manual/bluetape4k-javers/0.2/guides/learning-path/) orders the material for application developers, library integrators, and operators.

## Use the manual by question

If you need to understand JaVers data, read [the audit model](/manual/bluetape4k-javers/0.2/architecture/audit-model/). If you are composing storage, cache, or publication paths, read [repository composition](/manual/bluetape4k-javers/0.2/architecture/repository-composition/) and [failure contracts](/manual/bluetape4k-javers/0.2/operations/failure-contracts/). For a command-to-projection example, follow [DDD and CQRS](/manual/bluetape4k-javers/0.2/guides/ddd-and-cqrs/). For production proof, use [testing](/manual/bluetape4k-javers/0.2/guides/testing/) and [observability](/manual/bluetape4k-javers/0.2/operations/observability/).

## Architecture, persistence, and operations

- [Audit model](/manual/bluetape4k-javers/0.2/architecture/audit-model/) separates commits, snapshots, changes, and shadows.
- [Repository composition](/manual/bluetape4k-javers/0.2/architecture/repository-composition/) explains the source-of-truth and adapter boundaries.
- [Persistence selection](/manual/bluetape4k-javers/0.2/persistence/selection-guide/) compares the recovery contract of Exposed, Redis, and Kafka.
- [Exposed](/manual/bluetape4k-javers/0.2/persistence/exposed/), [Redis](/manual/bluetape4k-javers/0.2/persistence/redis/), and [Kafka](/manual/bluetape4k-javers/0.2/persistence/kafka/) document each adapter in depth.
- [Failure contracts](/manual/bluetape4k-javers/0.2/operations/failure-contracts/) and [observability](/manual/bluetape4k-javers/0.2/operations/observability/) turn those boundaries into operational checks.

## Modules and runnable material

- Foundation: [Javers BOM](/manual/bluetape4k-javers/0.2/modules/bluetape4k-javers-bom/), [javers-core](/manual/bluetape4k-javers/0.2/modules/javers-core/), and [javers-ddd](/manual/bluetape4k-javers/0.2/modules/javers-ddd/)
- Persistence: [javers-exposed](/manual/bluetape4k-javers/0.2/modules/javers-exposed/), [javers-persistence-redis](/manual/bluetape4k-javers/0.2/modules/javers-persistence-redis/), and [javers-persistence-kafka](/manual/bluetape4k-javers/0.2/modules/javers-persistence-kafka/)
- Example: [JaVers + Exposed DDD order flow](/manual/bluetape4k-javers/0.2/examples/javers-exposed-ddd/)
- Benchmarks: [how to read the evidence](/manual/bluetape4k-javers/0.2/benchmarks/overview/) and the [JaVers, Exposed DDD, and Envers comparison](/manual/bluetape4k-javers/0.2/benchmarks/exposed-ddd-envers/)
- Ecosystem path: [where this repository connects to Exposed and application architecture](/manual/bluetape4k-javers/0.2/guides/cross-repository-paths/)

The release source is the behavior authority. The most important starting points are [`CdoSnapshotRepository`](https://github.com/bluetape4k/bluetape4k-javers/blob/bffe19439ca891fa5301a76421bdef7ba75252a0/javers-core/src/main/kotlin/io/bluetape4k/javers/repository/CdoSnapshotRepository.kt), [`AggregateRepository`](https://github.com/bluetape4k/bluetape4k-javers/blob/bffe19439ca891fa5301a76421bdef7ba75252a0/javers-ddd/src/main/kotlin/io/bluetape4k/javers/ddd/AggregateRepository.kt), and the [`javers-exposed-ddd` example](https://github.com/bluetape4k/bluetape4k-javers/tree/0.2.1/examples/javers-exposed-ddd).
