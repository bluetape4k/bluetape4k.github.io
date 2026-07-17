---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/maps-and-cache-loading"
title: Maps and cache loading
description: Define read-through, write-through, write-behind, invalidation, and shutdown behavior.
manualId: bluetape4k-lettuce
chapterId: maps-and-cache-loading
manual:
  id: "bluetape4k-lettuce"
  repository: "bluetape4k-projects"
  group: "infrastructure"
  kind: "library"
  sourceCommit: "e89bf724fd018af8c2ab4564a5c9a007fe27b46a"
  sourcePath: "docs/manual/en/modules/bluetape4k-lettuce/maps-and-cache-loading.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/lettuce"
  layer: "build"
  chapterId: "maps-and-cache-loading"
---


## Simple and loaded maps

`LettuceMap` wraps Redis Hash commands with sync and async APIs; `LettuceSuspendMap` provides suspending calls. `LettuceLoadedMap` stores one Redis value per key with a TTL and invokes `MapLoader` on a miss.

```kotlin
LettuceLoadedMap(
    client = client,
    loader = object : MapLoader<Long, Account> {
        override fun load(key: Long): Account? = repository.find(key)
        override fun loadAllKeys(): Iterable<Long> = repository.findAllIds()
    },
    writer = accountWriter,
    config = LettuceCacheConfig.READ_WRITE_THROUGH,
).use { cache ->
    val account = cache[42L]
}
```

Write-through calls the writer before Redis, so writer failure leaves Redis unchanged. Write-behind enqueues a bounded item and updates Redis immediately; database failure appears later. A full queue fails immediately.

## Invalidation and shutdown

`delete` changes the writer and Redis; `evict` removes only Redis state. Pattern invalidation uses `SCAN` plus `UNLINK`. Closing a write-behind map drains up to its shutdown timeout and warns about remaining entries. The suspended implementation cancels its owned job, not the caller's whole scope.

## The 1.11.0 near-cache boundary

The `nearCache*` fields and presets are validated but not consumed by loaded maps. There is no Caffeine store or RESP3 tracking invalidation in this release. Implement a local layer separately or verify the concrete contract in `bluetape4k-cache-lettuce`.

## Source and tests

- [`LettuceLoadedMap.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/map/LettuceLoadedMap.kt)
- [`LettuceSuspendedLoadedMap.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/map/LettuceSuspendedLoadedMap.kt)
- [`LettuceLoadedMapTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/test/kotlin/io/bluetape4k/redis/lettuce/map/LettuceLoadedMapTest.kt)

Continue with [Filters, scripts, and primitives](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/filters-scripts-and-primitives/).
