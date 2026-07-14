---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-lettuce"
manualId: bluetape4k-cache-lettuce
title: "Module bluetape4k-cache-lettuce"
description: "Configure Redis JCache, distributed memoizers, and Caffeine L1 plus Redis L2 near caches with explicit invalidation, TTL, and lifecycle contracts."
kind: library
group: caching
manual:
  id: "bluetape4k-cache-lettuce"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "dd05a2a56058bd08d503308a2eb98ac1cf73918d"
  sourcePath: "docs/manual/en/modules/bluetape4k-cache-lettuce.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "cache/cache-lettuce"
  layer: "build"
---


## Capabilities

`bluetape4k-cache-lettuce` implements the `bluetape4k-cache-core` contracts with Lettuce and Redis. It provides a Redis-hash JCache provider, synchronous and suspend JCache APIs, Redis-backed memoizers, and near caches that combine Caffeine L1 with Redis L2.

The near cache isolates Redis keys as `cacheName:key`, fills L1 after an L2 hit, and uses RESP3 CLIENT TRACKING pushes to invalidate keys changed by another connection. Reads and writes can continue when tracking is unavailable, but cross-process L1 consistency then needs another strategy.

## Decisions before adoption

- Choose between the standard JCache API and the statistics and L1/L2 controls of `NearCacheOperations`.
- Prefer the smaller Caffeine helpers in `bluetape4k-cache-core` for a single-JVM cache.
- JCache TTL applies to the Redis hash for the whole cache, not to individual entries.
- Native near-cache values use separate Redis keys, and `redisTtl` applies per key.
- Configure the client for RESP3 and monitor tracking startup when using CLIENT TRACKING.
- Treat the codec as a persisted wire format; migrate with a new cache name or a deliberate clear.
- Decide who closes the `RedisClient`, manager, and per-cache connection.

## Coordinates

Applications manage only the central BOM version, not separate Lettuce, Caffeine, or bluetape4k module versions.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-cache-lettuce")
}
```

The application environment supplies Redis. The Gradle project is `:bluetape4k-cache-lettuce`, backed by `cache/cache-lettuce`.

## First near cache

Start with an RESP3 client and explicit names, capacity, and expiry values.

```kotlin
val redisClient = RedisClient.create("redis://localhost:6379").also {
    it.options = ClientOptions.builder()
        .protocolVersion(ProtocolVersion.RESP3)
        .build()
}

val users = LettuceCaches.nearCache<User>(redisClient) {
    cacheName = "users"
    maxLocalSize = 10_000
    frontExpireAfterWrite = Duration.ofMinutes(10)
    redisTtl = Duration.ofHours(1)
    useRespProtocol3 = true
    recordStats = true
}

try {
    users.put("42", user)
    check(users.get("42") == user)
} finally {
    users.close()
    redisClient.shutdown()
}
```

`put` writes Redis first and updates L1 only after success. This is write-through between cache tiers, not a repository write-through to a database.

## API by task

| Task | Start with | Boundary |
| --- | --- | --- |
| JCache SPI | `LettuceCachingProvider`, `LettuceCacheManager` | A provider-created manager also owns its RedisClient. |
| Reuse an external client | `LettuceJCaching` | The manager does not close the external client. |
| Synchronous JCache | `LettuceJCache`, `LettuceCaches.jcache` | Values share one Redis hash and its whole-cache TTL. |
| Coroutine JCache | `LettuceSuspendJCache`, `LettuceSuspendCacheManager` | Blocking JCache calls run on `Dispatchers.IO`. |
| Shared function results | three Lettuce memoizers | Same-key coalescing is local to one JVM `inFlight` map. |
| Synchronous near cache | `LettuceNearCache` | Keys are strings; Redis succeeds before L1 changes. |
| Coroutine near cache | `LettuceSuspendNearCache` | Uses Lettuce coroutine commands and async batches. |
| JCache-based L1/L2 | `nearJCache`, `suspendNearJCache` | The composition contract comes from `cache-core`. |
| Retry and fallback | `withResilience` | This adds the common decorator, not another Lettuce implementation. |

## Learning path

These chapters follow the 1.11.0 release source and executable tests. They explain provider identity, Redis storage, concurrent computation, L1/L2 ordering, and invalidation failures with defaults, ownership, and post-failure state.

1. [JCache provider, manager, and configuration](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-lettuce/jcache-provider-manager/) — SPI lookup, `(ClassLoader, URI)` identity, Redis hashes, TTL, codecs, and ownership.
2. [Synchronous and suspend JCache](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-lettuce/sync-suspend-jcache/) — CRUD, listeners, EntryProcessor, IO dispatching, close, and destroy.
3. [Redis memoizers and concurrency](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-lettuce/memoizers-concurrency/) — sync, future, and suspend paths, JVM-local coalescing, failure, and cancellation recovery.
4. [Near-cache L1 and L2](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-lettuce/near-cache-l1-l2/) — read fill, write order, key isolation, TTL, statistics, and bulk operations.
5. [RESP3 invalidation and Lua CAS](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-lettuce/resp3-invalidation-lua/) — tracking registration, push payloads, `EVALSHA`, and `NOSCRIPT` fallback.
6. [Lifecycle, tests, and ecosystem](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-lettuce/operations-ecosystem/) — failures and operations, then Hibernate, Spring, Exposed, and workshop paths.

For JCache, start with chapters 1 and 2. For direct near-cache use, chapters 4, 5, and 6 are the shorter path.

## Patterns

Version the cache name, key encoding, value codec, and TTL as one data contract. Use a new name when the wire format changes. Populate the cache only after a source-of-truth read succeeds, and update or invalidate related keys after the data transaction completes.

RESP3 invalidation arrives asynchronously. Keep values that cannot tolerate even a short stale window out of L1. When adding fallback, limit retries, concurrent loads, and database pressure so a Redis incident does not amplify into a source-store incident.

## Integrations

[`bluetape4k-cache-core`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-core/) defines the common JCache, near-cache, and resilience contracts. [`bluetape4k-lettuce`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/) covers clients, codecs, maps, and Redis commands. Continue to [`bluetape4k-hibernate-cache-lettuce`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate-cache-lettuce/) for Hibernate L2 cache and [`bluetape4k-spring-boot-hibernate-lettuce`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-hibernate-lettuce/) for Boot configuration and observability.

For database repository strategies, use [bluetape4k-exposed](https://github.com/bluetape4k/bluetape4k-exposed), [Exposed Workshop](https://github.com/bluetape4k/exposed-workshop), and [bluetape4k-workshop](https://github.com/bluetape4k/bluetape4k-workshop). Verify a real loader/writer boundary before calling a cache operation database write-through.

## Configuration

`LettuceNearCacheConfig` defaults to name `lettuce-near-cache`, 10,000 L1 entries, 30-minute expire-after-write, no Redis TTL, RESP3 tracking enabled, and statistics disabled. Names cannot be blank, and sizes and durations must be positive.

`LettuceCacheConfig.ttlSeconds` applies to the whole Redis hash. The default key encoder is `toString()`, and the default value codec is LZ4 plus Fory. Supply a `keyDecoder` to iterate a cache with non-String keys.

## Failures

The JCache manager rejects duplicate names, operations after close, and typed lookups that do not match configured key and value types. Codec and Redis command failures propagate.

Near-cache writes update L1 only after Redis succeeds. A CLIENT TRACKING startup failure only logs a warning and leaves the cache running, so remote changes may leave stale L1 entries. Monitor tracking as a separate availability contract.

## Operations

Observe L1 hits, misses, evictions, size, Redis hits and misses, command latency, errors, and reconnects. Caffeine counters remain zero when `recordStats=false`. `backCacheSize` and `clearAll` scan `cacheName:*` and use `UNLINK`; measure their cost for large keyspaces.

Track memoizer evaluator latency and hot keys, tracking startup and invalidation delay, and database pressure after fallback. Test the load spike produced when Redis is temporarily unavailable.

## Testing

The module suite uses Redis Testcontainers, so run it sequentially with other heavy database suites.

```bash
./gradlew :bluetape4k-cache-lettuce:test --no-build-cache --no-configuration-cache
```

`LettuceJCacheTest` covers TTL, typed keys, and EntryProcessor. Memoizer tests cover races, failures, and cancellation. Near-cache tracking and isolation tests cover external writers, cross-instance invalidation, and scoped `clearAll`.

## Workshops

Use `LettuceJCachesTest` for the smallest factory examples, `LettuceNearCacheTrackingTest` for two-instance invalidation, and `LettuceNearCacheIsolationTest` for key namespaces. Continue to [Exposed Workshop](https://github.com/bluetape4k/exposed-workshop) and [bluetape4k-workshop](https://github.com/bluetape4k/bluetape4k-workshop) for cache-aside and database loader/writer exercises.

## 1.11.0 scope

This manual targets release commit `6187173b58e8b4c5c435c145e00e94708f31ef75`. JCache listeners receive operations performed by that cache instance; they are not a Redis-backed global JCache event bus.

Tracking startup is fail-open. With `NOLOOP`, the writing connection receives no push and the code updates its own L1 directly. `withResilience` uses a decorator from `cache-core`; there is no standalone `ResilientLettuceNearCache` implementation in this release.

## Sources and tests

- [`LettuceCaches.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/main/kotlin/io/bluetape4k/cache/LettuceCaches.kt)
- [`LettuceCachingProvider.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/main/kotlin/io/bluetape4k/cache/jcache/LettuceCachingProvider.kt)
- [`LettuceJCache.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/main/kotlin/io/bluetape4k/cache/jcache/LettuceJCache.kt)
- [`LettuceSuspendJCache.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/main/kotlin/io/bluetape4k/cache/jcache/LettuceSuspendJCache.kt)
- [`LettuceSuspendMemoizer.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/main/kotlin/io/bluetape4k/cache/memoizer/LettuceSuspendMemoizer.kt)
- [`LettuceNearCache.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/main/kotlin/io/bluetape4k/cache/nearcache/LettuceNearCache.kt)
- [`TrackingInvalidationListener.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/main/kotlin/io/bluetape4k/cache/nearcache/TrackingInvalidationListener.kt)
- [`LettuceJCacheTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/test/kotlin/io/bluetape4k/cache/jcache/LettuceJCacheTest.kt)
- [`LettuceNearCacheTrackingTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/test/kotlin/io/bluetape4k/cache/nearcache/LettuceNearCacheTrackingTest.kt)
