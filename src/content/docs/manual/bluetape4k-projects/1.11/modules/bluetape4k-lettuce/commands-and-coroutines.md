---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/commands-and-coroutines"
title: Commands and coroutines
description: Choose sync, async, or coroutine commands and preserve RedisFuture failure and cancellation.
manualId: bluetape4k-lettuce
chapterId: commands-and-coroutines
manual:
  id: "bluetape4k-lettuce"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "222f640a5a8937d3000dc49b2e2f585726ed70e6"
  sourcePath: "docs/manual/en/modules/bluetape4k-lettuce/commands-and-coroutines.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/lettuce"
  layer: "build"
  learningOrder: 540
  chapterId: "commands-and-coroutines"
  chapterOrder: 2
---


## Keep one execution model per path

`commands` is blocking, `asyncCommands` returns `RedisFuture`, and `coroutinesCommands` exposes Lettuce's experimental coroutine API. Sync calls can fit a blocking service boundary; coroutine services should remain async or suspending end to end.

```kotlin
val async = LettuceClients.asyncCommands(client)
val value = async.get("account:1").awaitSuspending()
val values = listOf(async.get("a"), async.get("b")).awaitAll()
```

`awaitAll()` preserves input order, returns an empty list for empty input, and propagates a failed future instead of constructing partial results.

## Cancellation is not a cache miss

`awaitSuspending()` follows `kotlinx.coroutines.future.await` cancellation rules. Suspended loaded maps also rethrow `CancellationException`. Converting cancellation into a Redis miss would invoke a database loader after the caller has already abandoned the work.

## Command capability checks

`RedisCommandSupports` caches `COMMAND INFO` per client and command and closes its temporary connection. An inspection failure returns `false`, so permissions and true server incompatibility may need separate operational diagnosis.

## Source and tests

- [`RedisFutureSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/RedisFutureSupport.kt)
- [`RedisCommandSupports.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/RedisCommandSupports.kt)
- [`RedisFutureSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/test/kotlin/io/bluetape4k/redis/lettuce/RedisFutureSupportTest.kt)

Continue with [Codecs and serialization](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/codecs-and-serialization/).
