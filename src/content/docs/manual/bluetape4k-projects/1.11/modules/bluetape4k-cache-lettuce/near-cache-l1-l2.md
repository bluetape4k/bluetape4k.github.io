---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-lettuce/near-cache-l1-l2"
title: Near-cache L1 and L2
description: Follow Caffeine L1 and Redis L2 read fill, write order, key isolation, TTL, bulk operations, and statistics.
manualId: bluetape4k-cache-lettuce
chapterId: near-cache-l1-l2
manual:
  id: "bluetape4k-cache-lettuce"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "3a97a3fc2f3525c3a3384d511a9adb8571b0b680"
  sourcePath: "docs/manual/en/modules/bluetape4k-cache-lettuce/near-cache-l1-l2.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "cache/cache-lettuce"
  layer: "build"
  learningOrder: 520
  chapterId: "near-cache-l1-l2"
  chapterOrder: 4
---


## Tier responsibilities

`LettuceNearCache` and `LettuceSuspendNearCache` use Caffeine as L1 and Redis as L2. Keys are strings and become `${cacheName}:${key}` in Redis.

```text
get("42")
  -> L1 hit: return
  -> L1 miss: GET users:42
       -> L2 hit: fill L1 and return
       -> L2 miss: null
```

The prefix isolates identical logical keys across cache names. `clearAll()` scans only `cacheName:*` and never calls `FLUSHDB`.

## Defaults and TTL

```kotlin
val config = lettuceNearCacheConfig<String, User> {
    cacheName = "users"
    maxLocalSize = 10_000
    frontExpireAfterWrite = Duration.ofMinutes(10)
    redisTtl = Duration.ofHours(1)
    useRespProtocol3 = true
    recordStats = true
}
```

L1 defaults to 10,000 entries and 30-minute expire-after-write. L2 has no default TTL. A configured TTL applies independently to each `${cacheName}:${key}`, unlike the whole-hash JCache TTL.

Keep L1 expiry no longer than L2 expiry unless serving an L1 value after its Redis copy expires is intentional.

## Write order

`put` completes Redis `SET`, then updates L1 and registers a tracking read. A Redis failure cannot leave the new value only in L1.

```kotlin
users.put("42", user)
users.replace("42", updated)
users.remove("42")
```

This is write-through between cache tiers, not to a database. Remove operations use `UNLINK`, so command completion and background memory reclamation are separate events.

## Conditional writes

`putIfAbsent` reads first and then attempts `SET NX`. If another client wins, it reads and returns that value. `replace(key, value)` uses a separate existence check and `SET XX`. Only `replace(key, oldValue, newValue)` uses one atomic Lua comparison and replacement.

## Bulk and clear operations

`getAll` gathers L1 hits and issues async Redis GET commands only for misses. `putAll` uses `MSET` without TTL or per-key `SET PX` operations inside a Redis transaction block with TTL.

`clearLocal()` leaves Redis intact. `clearAll()` clears L1 and scans L2 in batches of 100, deleting matches with `UNLINK`. Keep this linear keyspace operation away from request hot paths.

## Statistics

```kotlin
val snapshot = users.stats()
```

Caffeine hit, miss, and eviction counters are meaningful only with `recordStats=true`. Redis counters are updated by the single-key `get` path after an L1 miss; 1.11.0 `getAll` results do not update the same counters. Use them as directional metrics and compare them with Redis telemetry.

## Sources and tests

- [`LettuceNearCacheConfig.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/main/kotlin/io/bluetape4k/cache/nearcache/LettuceNearCacheConfig.kt)
- [`LettuceCaffeineLocalCache.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/main/kotlin/io/bluetape4k/cache/nearcache/LettuceCaffeineLocalCache.kt)
- [`LettuceNearCache.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/main/kotlin/io/bluetape4k/cache/nearcache/LettuceNearCache.kt)
- [`LettuceSuspendNearCache.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/main/kotlin/io/bluetape4k/cache/nearcache/LettuceSuspendNearCache.kt)
- [`LettuceNearCacheIsolationTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/src/test/kotlin/io/bluetape4k/cache/nearcache/LettuceNearCacheIsolationTest.kt)
