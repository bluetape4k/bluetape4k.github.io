---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-cache-redisson/ecosystem-paths"
title: Cache strategies and ecosystem paths
description: Distinguish cache-aside from read/write-through/behind and continue into persistence modules and workshops.
manualId: bluetape4k-cache-redisson
chapterId: ecosystem-paths
manual:
  id: "bluetape4k-cache-redisson"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-cache-redisson/ecosystem-paths.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "cache/cache-redisson"
  layer: "build"
  learningOrder: 530
  chapterId: "ecosystem-paths"
  chapterOrder: 6
---


## Follow the data path

| Strategy | Miss/write owner | Source-store call |
| --- | --- | --- |
| Cache-aside | Caller | Caller reads and writes the source directly |
| Read-through | `CacheLoader`/`MapLoader` | A cache miss invokes the loader |
| Write-through | `CacheWriter`/`MapWriter` | A cache write invokes the writer before success |
| Write-behind | Writer queue | The source is updated asynchronously after the cache |

`RedissonNearCache.put()` and memoizer `RMap.putIfAbsent()` update Redis cache state. Without a writer that calls the database, neither is persistence write-through.

## Cache-aside baseline

```kotlin
suspend fun findProduct(id: String): Product {
    products.get(id)?.let { return it }
    return repository.findById(id).also { loaded ->
        products.put(id, loaded)
    }
}
```

The first request reads the database and fills the cache. Updates still need a documented commit-versus-invalidation order and a stale-window policy.

## Real loader and writer examples

`examples/redisson-demo` uses `MapLoader`, `MapWriter`, and async variants for read-through, write-through, and write-behind. These examples call an actual repository and therefore differ from cache-aside.

Write-behind can reduce response latency but introduces crash, queue overflow, ordering, and retry risks. Verify durability before making it the only path to the source of truth.

## Continue through the ecosystem

- [cache-core](/manual/bluetape4k-projects/2.0/modules/bluetape4k-cache-core/): local providers, JCache, memoizers, and common near-cache contracts.
- [redisson](/manual/bluetape4k-projects/2.0/modules/bluetape4k-redisson/): codecs, distributed maps, locks, topics, and coroutine bridges.
- [Hibernate](/manual/bluetape4k-projects/2.0/modules/bluetape4k-hibernate/): entity lifecycle and second-level-cache boundaries.
- [Spring Boot Hibernate Lettuce](/manual/bluetape4k-projects/2.0/modules/bluetape4k-spring-boot-hibernate-lettuce/): Spring/Hibernate cache wiring.
- [redisson-demo](/manual/bluetape4k-projects/2.0/modules/bluetape4k-examples-redisson-demo/): runnable loader/writer strategies.

The [exposed-workshop](https://github.com/bluetape4k/exposed-workshop) cache chapter connects `JdbcCacheRepository`, `EntityMapLoader`, and `EntityMapWriter`. [bluetape4k-workshop](https://github.com/bluetape4k/bluetape4k-workshop) continues with service-level examples. Judge strategy names by the actual loader/writer path when examples differ.

## Source and tests

- [`CacheReadThroughExample.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/redisson-demo/src/test/kotlin/io/bluetape4k/examples/redisson/coroutines/cachestrategy/CacheReadThroughExample.kt)
- [`CacheWriteThroughExample.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/redisson-demo/src/test/kotlin/io/bluetape4k/examples/redisson/coroutines/cachestrategy/CacheWriteThroughExample.kt)
- [`CacheWriteBehindExample.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/redisson-demo/src/test/kotlin/io/bluetape4k/examples/redisson/coroutines/cachestrategy/CacheWriteBehindExample.kt)
- [`MapReadWriteThroughTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/redisson-demo/src/test/kotlin/io/bluetape4k/examples/redisson/coroutines/readwritethrough/MapReadWriteThroughTest.kt)
