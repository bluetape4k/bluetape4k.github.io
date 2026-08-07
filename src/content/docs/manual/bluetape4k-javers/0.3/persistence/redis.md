---
slug: "manual/bluetape4k-javers/0.3/persistence/redis"
title: "Redis persistence"
manual:
  id: "persistence/redis"
  repository: "bluetape4k-javers"
  group: "overview"
  kind: "guide"
  sourceCommit: "fb279cdba663bde80d9b146049aca146433a9b36"
  sourcePath: "docs/manual/en/persistence/redis.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "978d0490fc438570e7520643aed50e20614772d1"
  sourceDir: "docs/manual"
  layer: "build"
---


Redis is useful when JaVers snapshot access must use an existing Redis estate, but it is not automatically a durable event log. Retention, persistence mode, replication, backup, failover, and eviction policy determine whether Redis history survives an incident.

Release 0.3.0 provides two repositories:

- `LettuceCdoSnapshotRepository(name, RedisClient)` uses dedicated synchronous commands. A Redis `MULTI/EXEC` transaction updates the snapshot list and GlobalId index together; the commit-sequence `HSET` is separate. A dedicated write connection avoids shared-connection races.
- `RedissonCdoSnapshotRepository(name, RedissonClient)` uses Redisson list-multimap and map structures with configured codecs.

Both store encoded snapshots newest first per GlobalId, keep commit sequence data separately, and restore the latest head after repository reconstruction. They implement JaVers reads; unlike the Kafka adapter, they can load snapshot history and shadows. Their exact structures are in [`LettuceCdoSnapshotRepository.kt`](https://github.com/bluetape4k/bluetape4k-javers/blob/978d0490fc438570e7520643aed50e20614772d1/javers-persistence-redis/src/main/kotlin/io/bluetape4k/javers/persistence/redis/repository/LettuceCdoSnapshotRepository.kt) and [`RedissonCdoSnapshotRepository.kt`](https://github.com/bluetape4k/bluetape4k-javers/blob/978d0490fc438570e7520643aed50e20614772d1/javers-persistence-redis/src/main/kotlin/io/bluetape4k/javers/persistence/redis/repository/RedissonCdoSnapshotRepository.kt).

## Selection and recovery

Choose Lettuce when the service already manages Lettuce clients and wants explicit command-level behavior. Choose Redisson when Redisson distributed objects and lifecycle are the established operational path. Do not run both against the same namespace unless their wire structures have been proven compatible; 0.3.0 does not document cross-client migration.

Redis command failures propagate. A retry can encounter partially updated structures, so verify by commit ID and snapshot version rather than assuming the first attempt had no effect. Broad JQL queries enumerate keys and decode values in the process; large histories need memory and latency monitoring.

Use the [Projects Redis manual](https://bluetape4k.github.io/manual/bluetape4k-projects/1.11/modules/bluetape4k-redis/) for client lifecycle and topology. Use [observability](/manual/bluetape4k-javers/0.3/operations/observability/) for audit-specific signals.
