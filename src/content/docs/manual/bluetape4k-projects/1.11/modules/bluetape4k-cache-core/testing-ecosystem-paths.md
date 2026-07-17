---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-core/testing-ecosystem-paths"
title: Testing and ecosystem paths
description: Run fast cache-core and provider conformance tests, then continue to Lettuce, Redisson, Exposed, and workshop examples.
manualId: bluetape4k-cache-core
chapterId: testing-ecosystem-paths
manual:
  id: "bluetape4k-cache-core"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "e89bf724fd018af8c2ab4564a5c9a007fe27b46a"
  sourcePath: "docs/manual/en/modules/bluetape4k-cache-core/testing-ecosystem-paths.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "cache/cache-core"
  layer: "build"
  chapterId: "testing-ecosystem-paths"
---


## Lock contracts without an external server

The cache-core tests use local providers, mocked delegates, and in-memory fixtures.

```bash
./gradlew :bluetape4k-cache-core:test --no-build-cache --no-configuration-cache
```

Add four tests to adoption code first:

1. Repeated calls for one key do not rerun the evaluator.
2. Concurrent same-key misses merge when the chosen contract promises it.
3. The next call recomputes after failure or cancellation.
4. The system recovers within the accepted stale window when invalidation fails after a source write.

## Published fixtures

The module publishes `AbstractSuspendJCacheTest`, blocking and suspend Near Cache fixtures, and memoizer fixtures. Provider implementations can inherit them to cover `clearLocal`, `clearAll`, conditional replacement, statistics, and close as well as CRUD.

```kotlin
class MyNearCacheTest : AbstractNearCacheOperationsTest<String>() {
    override fun createCache(): NearCacheOperations<String> = myNearCache()
    override fun sampleValue(): String = "hello"
    override fun anotherValue(): String = "world"
}
```

Remote-provider tests use real servers. Keep them separate from cache-core unit tests and run Testcontainers sequentially.

## Lettuce and Redisson

[bluetape4k-cache-lettuce](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-lettuce/) covers Redis hash JCache, Lettuce Near Cache, and RESP3 CLIENT TRACKING. Verify local-entry lifetime when invalidation disconnects.

[bluetape4k-cache-redisson](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-redisson/) continues with Redisson JCache and `RLocalCachedMap`. Its provider tests cover Pub/Sub invalidation, reconnection, and local-cache options.

Both implement cache-core contracts, but wire protocols, event delivery, and recovery behavior differ.

## Continue to JDBC and Exposed

Cache-core `getOrPut` and Near Cache `put` do not own persistence. Learn connection and transaction boundaries in [bluetape4k-jdbc](/manual/bluetape4k-projects/1.11/modules/bluetape4k-jdbc/), then continue to [bluetape4k-exposed](https://github.com/bluetape4k/bluetape4k-exposed).

The cache chapter in [exposed-workshop](https://github.com/bluetape4k/exposed-workshop) shows the complete repository boundary:

- `JdbcCacheRepository` owns database and cache calls;
- `EntityMapLoader` loads a miss from the database;
- `EntityMapWriter` provides persistence write-through or write-behind;
- `RMap` and `RLocalCachedMap` provide remote and local cache tiers.

This is where a cache writer actually reaches an Exposed database and table.

## Workshop sequence

1. Run cache-core tests for local cache and memoizer concurrency.
2. Verify invalidation through the selected Redis provider manual and tests.
3. Compare cache-aside, read-through, and write-through in exposed-workshop.
4. Add expiry and failure metrics to a [bluetape4k-workshop](https://github.com/bluetape4k/bluetape4k-workshop) service example.

Do not claim a speedup without benchmark evidence. Measure hit rate, throughput, latency, and source-store load for the real workload.

## Sources and tests

- [`AbstractSuspendJCacheTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/testFixtures/kotlin/io/bluetape4k/cache/jcache/AbstractSuspendJCacheTest.kt)
- [`AbstractNearCacheOperationsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/testFixtures/kotlin/io/bluetape4k/cache/nearcache/AbstractNearCacheOperationsTest.kt)
- [`AbstractSuspendNearCacheOperationsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/testFixtures/kotlin/io/bluetape4k/cache/nearcache/AbstractSuspendNearCacheOperationsTest.kt)
- [`AbstractMemoizerTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/testFixtures/kotlin/io/bluetape4k/cache/memoizer/AbstractMemoizerTest.kt)
- [Near Cache backend capability matrix](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/docs/cache/near-cache-capability-matrix.md)
