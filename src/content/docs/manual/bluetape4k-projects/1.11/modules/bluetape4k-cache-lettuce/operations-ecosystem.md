---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-lettuce/operations-ecosystem"
title: Lifecycle, tests, and ecosystem
description: Operate Redis cache lifecycles and failures, then continue to cache-core, Hibernate, Spring, Exposed, and workshops.
manualId: bluetape4k-cache-lettuce
chapterId: operations-ecosystem
manual:
  id: "bluetape4k-cache-lettuce"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "3a97a3fc2f3525c3a3384d511a9adb8571b0b680"
  sourcePath: "docs/manual/en/modules/bluetape4k-cache-lettuce/operations-ecosystem.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "cache/cache-lettuce"
  layer: "build"
  learningOrder: 520
  chapterId: "operations-ecosystem"
  chapterOrder: 6
---


## Assign ownership

| Creation path | Cache connection | RedisClient | Owner |
| --- | --- | --- | --- |
| `LettuceCachingProvider` | manager-created | provider-created | provider or manager close |
| `LettuceJCaching` | manager-created | application-supplied | cache/manager and application |
| `LettuceNearCache` | cache-created | application-supplied | cache, then application |
| memoizer `LettuceMap` | caller-created | application-supplied | caller |

Near-cache close disables tracking and closes its connection and Caffeine L1, but not the client. JCache close preserves the Redis hash; manager `destroyCache` clears it.

## Interpret Redis failures

An L1 hit does not contact Redis. L1 misses, writes, and removes propagate Redis errors. Only tracking startup is fail-open.

The common `withResilience` extension wraps operations in the `cache-core` `ResilientNearCacheDecorator`.

```kotlin
val resilient = LettuceCaches.nearCache<User>(redisClient) {
    cacheName = "users"
}.withResilience(
    NearCacheResilienceConfig(
        getFailureStrategy = GetFailureStrategy.RETURN_FRONT_OR_NULL,
    )
)
```

Read the decorator retry and fallback contract. Returning null after a Redis GET failure can send every instance to the database. Bound retries, timeout, concurrent loads, and source-store pool pressure together.

## Codec and data lifetime

The default binary codec is LZ4 plus Fory. Redis bytes may outlive one application deployment, so account for class changes, serializer registration, and trust boundaries.

- Use a new cache name for incompatible formats.
- Avoid unsafe object deserialization across an untrusted Redis boundary.
- Do not share names between JCache hash data and native per-key near-cache data.
- Provide explicit eviction and migration for caches without TTL.

## Operational signals

- L1 hits, misses, evictions, current size, and capacity
- Redis hits, misses, command latency, timeout, reconnects, and connections
- CLIENT TRACKING startup failures and invalidation delay
- `SCAN` and `UNLINK` duration for clear and size operations
- memoizer evaluator latency, failures, cancellation, and hot keys
- database latency and pool saturation after fallback

Hit ratio alone cannot reveal stale values. Run a synthetic cross-instance update and verify that the other L1 is invalidated.

## Test sequence

1. Verify factory types with `LettuceJCachesTest`.
2. For JCache, test manager identity, TTL, typed lookup, close, and destroy.
3. For memoizers, test same-key races, evaluator failure, and cancellation.
4. For near cache, test L1/L2 CRUD and cache-name isolation.
5. In RESP3, test two cache instances and an external writer.
6. Stop and recover Redis while measuring fallback and source-store load.

```bash
./gradlew :bluetape4k-cache-lettuce:test --no-build-cache --no-configuration-cache
```

The task uses Redis Testcontainers. Run it sequentially with other heavy database suites.

## Ecosystem paths

### Base contracts and Redis APIs

- [`bluetape4k-cache-core`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-core/): JCache, memoizer, near-cache interfaces, and resilience decorator
- [`bluetape4k-lettuce`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/): clients, connections, codecs, maps, coroutine commands, and scripts

### ORM and Spring Boot

- [`bluetape4k-hibernate-cache-lettuce`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate-cache-lettuce/): Hibernate entity, collection, and query regions on L1/L2
- [`bluetape4k-spring-boot-hibernate-lettuce`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-hibernate-lettuce/): properties, auto-configuration, metrics, and actuator
- [`Hibernate Lettuce demo`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-hibernate-lettuce-demo/): runnable Spring Data entities and endpoints

Hibernate owns region lifecycle through its SessionFactory. Do not close or modify its region keys as if they were application-created `LettuceNearCache` instances.

### Exposed and workshops

[bluetape4k-exposed](https://github.com/bluetape4k/bluetape4k-exposed) and [Exposed Workshop](https://github.com/bluetape4k/exposed-workshop) continue into repository-level cache-aside and database loader/writer patterns. [bluetape4k-workshop](https://github.com/bluetape4k/bluetape4k-workshop) expands them into service examples.

A plain cache `put` changes cache tiers only. For database read-through, write-through, or write-behind, verify real boundaries such as `JdbcCacheRepository`, `EntityMapLoader`, and `EntityMapWriter`.

## Sources and tests

- [`LettuceCaches.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/main/kotlin/io/bluetape4k/cache/LettuceCaches.kt)
- [`LettuceNearCacheFactory.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/main/kotlin/io/bluetape4k/cache/nearcache/LettuceNearCacheFactory.kt)
- [`ResilientLettuceNearCacheOpsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/test/kotlin/io/bluetape4k/cache/nearcache/ResilientLettuceNearCacheOpsTest.kt)
- [`LettuceNearCacheIsolationTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/test/kotlin/io/bluetape4k/cache/nearcache/LettuceNearCacheIsolationTest.kt)
- [`LettuceNearCacheTrackingTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/test/kotlin/io/bluetape4k/cache/nearcache/LettuceNearCacheTrackingTest.kt)
