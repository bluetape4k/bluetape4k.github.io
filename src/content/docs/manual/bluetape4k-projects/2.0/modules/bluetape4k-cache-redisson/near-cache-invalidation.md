---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-cache-redisson/near-cache-invalidation"
title: RLocalCachedMap near-cache invalidation
description: Local and Redis tiers, Pub/Sub invalidation, clear scope, reconnect behavior, and metric limits.
manualId: bluetape4k-cache-redisson
chapterId: near-cache-invalidation
manual:
  id: "bluetape4k-cache-redisson"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-cache-redisson/near-cache-invalidation.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "cache/cache-redisson"
  layer: "build"
  learningOrder: 530
  chapterId: "near-cache-invalidation"
  chapterOrder: 3
---


## Redisson owns both tiers

`RedissonNearCache` and `RedissonSuspendNearCache` wrap `RLocalCachedMap<String, V>`. Redisson manages local entries, the Redis map, and Pub/Sub invalidation instead of asking the application to compose a separate Caffeine front and Redis back.

```text
application -> RLocalCachedMap -> local entry
                           \----> Redis map
other client update -> Pub/Sub invalidation -> remove local entry
```

The default `SyncStrategy.INVALIDATE` removes a local entry after another client changes it. The next read loads the current Redis value and repopulates the local tier.

## Clear scopes

`clearLocal()` clears only this wrapper's local entries. Redis values remain and can refill the cache. `clearAll()` clears both tiers. `close()` ends the wrapper lifecycle and calls `destroy()`; do not use it as a data-deletion command.

## Reconnect behavior

The default `ReconnectionStrategy.CLEAR` assumes invalidation events may have been missed while disconnected and clears local entries after reconnect. Choosing `LOAD` or another strategy requires explicit validation of event history, reconnect cost, and the stale-read budget.

## Native and legacy event models

The native path uses `fastRemove`/`fastRemoveAsync` for multiple keys. The legacy JCache near-cache path registers entry listeners and accounts for Redisson bulk operations that do not emit the same entry events. Do not describe these two models as identical.

## Metric limits

Redisson does not expose a separate local-versus-Redis hit result through this wrapper. In 2.0.0, local hit/miss/eviction fields are zero, while back hit/miss fields count the integrated `get` result. Combine them with Redisson and Redis network metrics before judging near-cache effectiveness.

## Source and tests

- [`RedissonNearCache.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/nearcache/RedissonNearCache.kt)
- [`RedissonSuspendNearCache.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/nearcache/RedissonSuspendNearCache.kt)
- [`RedissonNearCacheTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/nearcache/RedissonNearCacheTest.kt)
- [`RedissonSuspendNearCacheTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/nearcache/RedissonSuspendNearCacheTest.kt)
