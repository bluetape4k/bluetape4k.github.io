---
slug: "manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-jdbc-redisson"
manualId: "bluetape4k-exposed-jdbc-redisson"
id: "bluetape4k-exposed-jdbc-redisson"
title: "Exposed JDBC Redisson Cache"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-jdbc-redisson"
sourceDir: "exposed/jdbc-redisson"
releaseRef: "1.11.0"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-jdbc-redisson
manual:
  id: "bluetape4k-exposed-jdbc-redisson"
  repository: "bluetape4k-exposed"
  group: "jdbc"
  kind: "library"
  sourceCommit: "eea10abd857fdb806319f93bddf30f92542d787a"
  sourcePath: "docs/manual/en/modules/bluetape4k-exposed-jdbc-redisson.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "0b494a5fd1e083006046764757342b68a397e4c5"
  sourceDir: "exposed/jdbc-redisson"
  layer: "build"
---


This adapter combines blocking JDBC or suspended JDBC with Redis through Redisson. It implements the common cache repository contract without hiding lifecycle or durability choices.

## Problem

Cache and database state can diverge when a miss, write, invalidation, timeout, cancellation, or shutdown completes only partly. The adapter supplies the integration; the application still defines acceptable staleness and failure behavior.

## When to use it

Use this module when Redis through Redisson is the chosen backend and the persistence path is blocking JDBC or suspended JDBC. Compare all six adapters in the [cache selection guide](/manual/bluetape4k-exposed/1.11/guides/cache-selection/) before adding infrastructure.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-jdbc-redisson")
}
```

Users select the central BOM version; this page records the stable `1.11` source line.

## Core concepts

`get` and `getAll` are read-through operations. Cache-aside is an application-owned DB update followed by invalidation. True write-through requires the configured writer to finish DB persistence before returning. Write-behind accepts a delayed durability window. Ordinary `put` must not be called write-through without that writer policy. This adapter is the config can choose an `RMapCache` or `RLocalCachedMap`; near-cache synchronization is part of correctness.

## Quick start

Extend `AbstractJdbcRedissonRepository` and provide `table`, `extractId`, `ResultRow.toEntity`, and the update/insert DSL hooks. Construct it with a reviewed `RedissonCacheConfig`.

```kotlin
repository.use { repo ->
    val current = repo.get(id)          // miss -> DB loader -> cache
    current?.let { repo.put(id, it) }   // durability follows write mode
    repo.invalidate(id)                 // cache-only by default
}
```

## API by task

| Task | API |
| --- | --- |
| Cache-backed read | `containsKey`, `get`, `getAll` |
| DB bypass | `findByIdFromDb`, `findAllFromDb`, `countFromDb` |
| Policy-controlled write | `put`, `putAll` |
| Eviction | `invalidate`, `invalidateAll`, `clear` |
| Entity mapping | `ResultRow.toEntity`, `extractId`, update/insert hooks |
| Lifecycle | `close` |

## Recommended patterns

Keep one repository per cache namespace and close it with the application. For cache-aside, commit the DB transaction before invalidating. Treat write-through failure as an incomplete write. Before write-behind, expose queue/dead-letter state and define the shutdown drain budget. Keep key prefixes and serialized value formats stable.

## Integrations

The module joins Exposed JDBC, the shared cache foundation, and Redis through Redisson. Loader/writer adapters own the cache-to-table bridge; the application owns the surrounding service transaction and client lifecycle.

## Configuration

`RedissonCacheConfig` controls namespace, TTL/expiry, cache/write mode, and backend limits. Fory/Kryo/JDK-family codecs require `trustedBinaryCache=true`; otherwise provide a reviewed codec. Validate positive durations and bounded batch/queue sizes at startup.

## Failure modes

Invalidation is cache-only by default. `deleteFromDBOnInvalidate=true` changes eviction into database deletion and needs a separate destructive-policy review. A cache hit can be stale, a backend success can be followed by DB failure, and DB commit can be followed by failed invalidation. Record these as distinct states.

## Operations

The application owns `RedissonClient`; do not shut down a client shared by other components from a repository. Monitor hit/miss, backend latency, retries/timeouts, queue depth, rejected or dead-letter writes, invalidation lag, and shutdown drain. Set separate SLOs for cache and database paths.

## Testing

Use isolated cache and database fixtures with unique namespaces. Prove miss loading, partial `getAll` misses, each enabled write mode, cache-only invalidation, TTL, partial failure, and lifecycle cleanup.

```bash
./gradlew :bluetape4k-exposed-jdbc-redisson:test
```

## Workshops and learning path

1. Read [Exposed cache foundation](/manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-cache/).
2. Choose a backend in [cache selection](/manual/bluetape4k-exposed/1.11/guides/cache-selection/).
3. Implement read-through plus cache-only invalidation first.
4. Add partial-failure and shutdown tests before near cache or write-behind.
5. Continue with [exposed-workshop](https://github.com/bluetape4k/exposed-workshop).

## Limitations

The adapter does not create a distributed transaction, provision the backend, migrate stored cache values, or decide whether stale data is safe. It is the config can choose an `RMapCache` or `RLocalCachedMap`; near-cache synchronization is part of correctness.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/jdbc-redisson/README.md)
- [Abstract repository](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/jdbc-redisson/src/main/kotlin/io/bluetape4k/exposed/redisson/repository/AbstractJdbcRedissonRepository.kt)
- [Module build](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/jdbc-redisson/build.gradle.kts)
