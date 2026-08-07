---
slug: "manual/bluetape4k-projects/1.12/modules/bluetape4k-lettuce/filters-scripts-and-primitives"
title: Filters, scripts, and primitives
description: Select probabilistic structures, Lua fallback, and Redis-backed atomic wrappers.
manualId: bluetape4k-lettuce
chapterId: filters-scripts-and-primitives
manual:
  id: "bluetape4k-lettuce"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "ffde7b8be16124b1c538bb318a7d482927f738ad"
  sourcePath: "docs/manual/en/modules/bluetape4k-lettuce/filters-scripts-and-primitives.md"
  minorVersion: "1.12"
  releaseRef: "1.12.1"
  releaseCommit: "7cf0b73646af05c0f8872cc4f6a16983949c4e3e"
  sourceDir: "infra/lettuce"
  layer: "build"
  learningOrder: 540
  chapterId: "filters-scripts-and-primitives"
  chapterOrder: 5
---


## Read probabilistic results correctly

For a Bloom filter, `contains=false` proves absence while `true` may be a false positive. A Cuckoo filter supports deletion, but insertion can fail in a constrained bucket layout. Reinitializing an existing filter with different parameters raises an exception.

```kotlin
val filter = LettuceBloomFilter(
    connection,
    "blocked-email",
    BloomFilterOptions(expectedInsertions = 100_000, falseProbability = 0.01),
)
filter.tryInit()
filter.add("spam@example.com")
```

HyperLogLog provides approximate cardinality, not an exact set size, and is unsuitable for billing or hard quota decisions.

## Lua fallback

`RedisScript` precomputes the source SHA1. Every `RedisScriptRunner` mode tries `EVALSHA` first and sends the source with `EVAL` only after `NOSCRIPT`. Other script failures propagate.

AtomicLong, semaphore, and lock wrappers combine Redis commands with Lua. Release locks and permits in `finally`, and do not equate a Redis mutex with business atomicity under network partitions.

## Source and tests

- [`RedisScript.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/script/RedisScript.kt)
- [`LettuceBloomFilter.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/filter/LettuceBloomFilter.kt)
- [`LettuceCuckooFilter.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/filter/LettuceCuckooFilter.kt)
- [`RedisScriptTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/infra/lettuce/src/test/kotlin/io/bluetape4k/redis/lettuce/script/RedisScriptTest.kt)

Continue with [Operations and ecosystem](/manual/bluetape4k-projects/1.12/modules/bluetape4k-lettuce/operations-and-ecosystem/).
