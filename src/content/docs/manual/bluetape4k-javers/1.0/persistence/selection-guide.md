---
slug: "manual/bluetape4k-javers/1.0/persistence/selection-guide"
title: "Persistence selection guide"
manual:
  id: "persistence/selection-guide"
  repository: "bluetape4k-javers"
  group: "overview"
  kind: "guide"
  sourceCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourcePath: "docs/manual/bluetape4k-javers/en/persistence/selection-guide.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourceDir: "docs/manual/bluetape4k-javers"
  layer: "build"
---


Pick a repository by the question it must answer after a failure, not by latency alone.

[![Persistence decision map](/manual-assets/bluetape4k-javers/1.0/persistence/persistence-decision-map.png)](../../assets/persistence/persistence-decision-map.svg)

| Concern | Exposed | Redis | Kafka repository |
| --- | --- | --- | --- |
| Primary role | durable SQL audit history | Redis-backed snapshot history | snapshot publication stream |
| Query shape | JaVers queries, implemented partly by in-memory filtering | JaVers queries after scanning Redis keys/lists | no reads; methods return empty/default |
| Ordering | snapshot version plus stored commit sequence | list order plus stored commit sequence | producer/partition ordering only; no repository reads |
| Replay | database restore/query, not an event replay engine | restore from Redis persistence or rebuild externally | consumers may replay retained records if configured |
| Cache behavior | none in the adapter | Redis is the repository, not a near-cache | none |
| Recovery owner | database/schema operator | Redis persistence/backup owner | Kafka producer, topic, consumer, and projection owners |

Use [Exposed](/manual/bluetape4k-javers/1.0/persistence/exposed/) when audit history must survive process restart and fit database operations. Use [Redis](/manual/bluetape4k-javers/1.0/persistence/redis/) when Redis is an accepted snapshot store and the team owns its durability configuration. Use [Kafka](/manual/bluetape4k-javers/1.0/persistence/kafka/) only when publishing encoded snapshots is the goal and another system owns consumption and query state.

None of these adapters promises exactly-once end-to-end behavior. Exposed operations use separate transactions, Redis updates cover several structures, and Kafka waits up to 30 seconds for a send result. Plan retry and reconciliation around identifiers such as GlobalId, snapshot version, commit ID, aggregate ID, and consumer offset.

For mixed designs, read [repository composition](/manual/bluetape4k-javers/1.0/architecture/repository-composition/) and [failure contracts](/manual/bluetape4k-javers/1.0/operations/failure-contracts/).
