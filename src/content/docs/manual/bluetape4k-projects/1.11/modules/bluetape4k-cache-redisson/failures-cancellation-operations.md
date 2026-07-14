---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-redisson/failures-cancellation-operations"
title: Failures, cancellation, lifecycle, and operations
description: Handle Redis failures, partial success, coroutine cancellation, close behavior, and operating signals.
manualId: bluetape4k-cache-redisson
chapterId: failures-cancellation-operations
manual:
  id: "bluetape4k-cache-redisson"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "46993c010f5bef45fef0943bbc93728d16119bd5"
  sourcePath: "docs/manual/en/modules/bluetape4k-cache-redisson/failures-cancellation-operations.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "cache/cache-redisson"
  layer: "build"
  chapterId: "failures-cancellation-operations"
---


## Failure contracts by path

| Failure point | 1.11.0 behavior | Operational decision |
| --- | --- | --- |
| JCache CRUD | `await()` propagates the Redisson future failure | Keep timeout and retry ownership in one layer. |
| Sync evaluator | Fails the promise and removes in-flight state | A later request can evaluate again. |
| Async Redis put | Can log a warning and still return the evaluated result | Observe calculation success separately from cache storage. |
| Suspend cancellation | Fails/removes the deferred and rethrows cancellation | Never convert cancellation into a cached fallback. |
| Sync near-cache close | Suppresses destroy failure | Do not report it as successful data deletion. |
| Suspend close | Logs ordinary errors and rethrows cancellation | Separate shutdown timeout from close errors. |

## Failure amplification

In cache-aside, Redis misses or failures shift reads to the source database. A broad miss wave can saturate the source pool. More retries can pressure both Redis and the database, turning the cache into a failure amplifier. Set timeout, retry budget, stale fallback, and source bulkheads together. Never hide write failure behind a read fallback.

## Cancellation and owner scope

A cancelled suspend evaluator is not stored. Its in-flight entry is removed, so a later call can recover. Cancelling one waiter differs from cancelling the owner evaluation; structured concurrency should make that owner scope explicit.

## Shutdown order

1. Stop accepting new cache work.
2. Await or cancel in-flight evaluators according to policy.
3. Close wrappers.
4. Let the final owner close the Redisson client and JCache provider.

Run `clear()` or `clearAll()` separately when data must be removed. Normal shutdown should not erase shared Redis state.

## Signals to monitor

Track Redis latency, timeout and reconnect; invalidation lag; evaluator count/latency/failure/cancellation; local size and Redis map size; eviction and decode failures; and source-database pool pressure during cache failure. Native `stats()` alone cannot prove network savings.

The test task uses Redis Testcontainers and should run sequentially with other heavyweight backend suites:

```bash
./gradlew :bluetape4k-cache-redisson:test --no-build-cache --no-configuration-cache
```

## Source and tests

- [`RedissonSuspendMemoizerTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/memoizer/RedissonSuspendMemoizerTest.kt)
- [`ResilientRedissonNearCacheTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/nearcache/ResilientRedissonNearCacheTest.kt)
- [`ResilientRedissonSuspendNearCacheTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/nearcache/ResilientRedissonSuspendNearCacheTest.kt)
- [`RedisServers.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/RedisServers.kt)
