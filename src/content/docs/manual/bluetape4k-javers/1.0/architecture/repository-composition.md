---
slug: "manual/bluetape4k-javers/1.0/architecture/repository-composition"
title: "Repository composition"
manual:
  id: "architecture/repository-composition"
  repository: "bluetape4k-javers"
  group: "overview"
  kind: "guide"
  sourceCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourcePath: "docs/manual/bluetape4k-javers/en/architecture/repository-composition.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourceDir: "docs/manual/bluetape4k-javers"
  layer: "build"
---


Applications often want durable SQL history, fast reads, and event publication at once. Release 1.0.0 does not provide a composite snapshot repository that makes those three writes atomic. JaVers registers one `JaversRepository`; any second destination introduces an application-level consistency boundary.

The cache-backed repositories in `javers-core`—Caffeine, Cache2k, and JCache—are complete in-memory `CdoSnapshotRepository` implementations. They insert snapshots newest first and keep commit ordering in a separate cache. They are useful for tests and process-local history, but eviction or restart can remove data. See [`CaffeineCdoSnapshotRepository.kt`](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/javers-core/src/main/kotlin/io/bluetape4k/javers/repository/caffeine/CaffeineCdoSnapshotRepository.kt).

`CompositeDomainEventPublisher` is different: it forwards one domain event to publishers in list order. It stops on the first exception and does not roll back earlier publishers. Its contract is in [`DomainEventPublisher.kt`](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/javers-ddd/src/main/kotlin/io/bluetape4k/javers/ddd/DomainEventPublisher.kt). Do not infer a composite persistence guarantee from this publisher.

## Safe composition rule

Choose one audit source that can answer required history queries. Add Kafka as publication, not as a query replacement. Build Redis projections from durable events only when the system also owns replay, deduplication, offset handling, and drift repair. If SQL and Redis are both written directly, define which one wins after partial failure and provide a reconciliation job.

The 1.0.0 DDD example deliberately demonstrates order, not atomicity: application persistence, JaVers commit, event publication, then consumer-side Redis projection. The [DDD/CQRS guide](/manual/bluetape4k-javers/1.0/guides/ddd-and-cqrs/) explains where an outbox and idempotent consumer belong in production.
