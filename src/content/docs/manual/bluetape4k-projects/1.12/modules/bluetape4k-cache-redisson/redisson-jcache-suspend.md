---
slug: "manual/bluetape4k-projects/1.12/modules/bluetape4k-cache-redisson/redisson-jcache-suspend"
title: Redisson JCache and suspend wrappers
description: Provider creation, named-cache reuse, coroutine bridges, and atomicity boundaries.
manualId: bluetape4k-cache-redisson
chapterId: redisson-jcache-suspend
manual:
  id: "bluetape4k-cache-redisson"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "ffde7b8be16124b1c538bb318a7d482927f738ad"
  sourcePath: "docs/manual/en/modules/bluetape4k-cache-redisson/redisson-jcache-suspend.md"
  minorVersion: "1.12"
  releaseRef: "1.12.1"
  releaseCommit: "7cf0b73646af05c0f8872cc4f6a16983949c4e3e"
  sourceDir: "cache/cache-redisson"
  layer: "build"
  learningOrder: 530
  chapterId: "redisson-jcache-suspend"
  chapterOrder: 1
---


## Two entry points

`RedissonJCaching` uses Redisson's `JCachingProvider` to create standard `javax.cache.Cache` instances. `RedissonSuspendJCache` wraps the same cache with `SuspendJCache`. `RedissonCaches` exposes both choices through one factory.

```kotlin
val cache = RedissonCaches.suspendJCache<String, User>(
    redisson = redissonClient,
    cacheName = "users",
    configuration = MutableConfiguration<String, User>().apply {
        setTypes(String::class.java, User::class.java)
    },
)
cache.put("u:1", User("u:1", "debop"))
```

Passing a `RedissonClient` keeps ownership in the application. A `Config` overload allows the provider to participate in client creation, so document manager and client shutdown separately.

## Named-cache reuse

`RedissonJCaching.cacheManager` is a lazy singleton. `getOrCreate` reuses an existing named cache. Do not assume a new configuration replaces the type, expiry, loader, or writer of an existing cache. Tests should use unique names and clean up their entries or wrappers.

## Awaiting async operations

Most CRUD methods call Redisson JCache `*Async()` methods and `await()` them. `putAllFlow` starts individual puts and waits for all of them. `entries()` iterates the cache directly, so a large scan is not automatically a cheap non-blocking stream. `removeAll()` explicitly runs the blocking provider call on `Dispatchers.IO`.

## `getAndPut` is not atomic

Redisson JCache has no `getAndPutAsync()` in this path. The 1.12.1 wrapper performs `get` followed by `put`, allowing another writer to interleave. Use an atomic `RMap` operation when strict read-modify-write semantics matter.

## Close is not deletion

`close()` closes the wrapped JCache but does not delete stored entries. Use `clear()` or `removeAll()` for data removal. Ordinary close failures are logged; `CancellationException` is rethrown.

## Source and tests

- [`RedissonJCaching.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/jcache/RedissonJCaching.kt)
- [`RedissonSuspendJCache.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/jcache/RedissonSuspendJCache.kt)
- [`RedissonSuspendJCacheTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/jcache/RedissonSuspendJCacheTest.kt)
