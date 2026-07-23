---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-redis/testing-operations-ecosystem"
title: Testing, operations, and ecosystem paths
description: Connect real submodule tests to operational checks and learning paths without overstating the umbrella's empty test task.
manualId: bluetape4k-redis
chapterId: testing-operations-ecosystem
manual:
  id: "bluetape4k-redis"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "3a97a3fc2f3525c3a3384d511a9adb8571b0b680"
  sourcePath: "docs/manual/en/modules/bluetape4k-redis/testing-operations-ecosystem.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/redis"
  layer: "build"
  learningOrder: 550
  chapterId: "testing-operations-ecosystem"
  chapterOrder: 6
---


## Test the client that owns the behavior

`infra/redis` has no production or test source. A successful `:bluetape4k-redis:test` task therefore does not validate connections, coroutines, Codecs, or distributed objects. Run the selected submodule tests and application integration tests.

```bash
./gradlew :bluetape4k-lettuce:test --no-build-cache --no-configuration-cache
./gradlew :bluetape4k-redisson:test --no-build-cache --no-configuration-cache
```

Both suites start Redis with Testcontainers. Do not run them in parallel with other database or broker Testcontainers suites. Documentation-only changes use release-source link, locale-structure, and Markdown checks instead of heavy tests.

## Small executable examples

| Contract | Representative test |
| --- | --- |
| Lettuce client, cached connection, shutdown | [`LettuceClientsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/test/kotlin/io/bluetape4k/redis/lettuce/LettuceClientsTest.kt) |
| `RedisFuture` results and failure propagation | [`RedisFutureSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/test/kotlin/io/bluetape4k/redis/lettuce/RedisFutureSupportTest.kt) |
| Redisson configuration, batch, transaction | [`RedissonClientSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/redisson/src/test/kotlin/io/bluetape4k/redis/redisson/RedissonClientSupportTest.kt) |
| Stream groups and consumer helpers | [`RStreamSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/redisson/src/test/kotlin/io/bluetape4k/redis/redisson/RStreamSupportTest.kt) |

Read each example under the module that owns the API rather than presenting them as umbrella tests.

## Operational baseline

When both clients are active, keep metrics separated by client:

- connections, pool use, and reconnects;
- command latency, timeouts, and retries;
- pending asynchronous work and coroutine cancellation;
- Codec failures and schema versions per key prefix;
- Redisson Stream pending entries and Near Cache stale incidents;
- shutdown duration and undrained queues.

After replacing the umbrella with one dependency, verify that threads, connections, and metrics for the removed client disappear.

## Ecosystem learning path

1. Read the complete [Lettuce manual](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/) or [Redisson manual](/manual/bluetape4k-projects/1.11/modules/bluetape4k-redisson/) for the chosen client.
2. Use [Cache Core](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-core/) to learn cache-aside and failure contracts before choosing a provider.
3. Continue to [Lettuce Cache](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-lettuce/) or [Redisson Cache](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-redisson/).
4. For Hibernate second-level caching, inspect regions and transactions in [Hibernate Cache Lettuce](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate-cache-lettuce/).
5. Practice cache and repository boundaries in [Exposed Workshop](https://github.com/bluetape4k/exposed-workshop) and [bluetape4k-workshop](https://github.com/bluetape4k/bluetape4k-workshop).

The umbrella is a build convenience layer in this path, not another functional layer. Organize learning and operations around the selected client and provider.

## Release sources

- [`infra/redis/build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/redis/build.gradle.kts)
- [`LettuceClientsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/test/kotlin/io/bluetape4k/redis/lettuce/LettuceClientsTest.kt)
- [`RedisFutureSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/test/kotlin/io/bluetape4k/redis/lettuce/RedisFutureSupportTest.kt)
- [`RedissonClientSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/redisson/src/test/kotlin/io/bluetape4k/redis/redisson/RedissonClientSupportTest.kt)
- [`RStreamSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/redisson/src/test/kotlin/io/bluetape4k/redis/redisson/RStreamSupportTest.kt)
