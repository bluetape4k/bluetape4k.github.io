---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce"
manualId: bluetape4k-lettuce
title: "Lettuce Coroutine Client"
description: "Operate the Lettuce Redis client from Kotlin with connection, coroutine, codec, map, and script utilities."
kind: library
group: caching
learningOrder: 540
manual:
  id: "bluetape4k-lettuce"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "d6eb7f6e617535286959f850024052ad0ca96738"
  sourcePath: "docs/manual/en/modules/bluetape4k-lettuce.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/lettuce"
  layer: "build"
  learningOrder: 540
---


## Capabilities

`bluetape4k-lettuce` adds Kotlin-oriented client and connection factories, sync/async/coroutine command entry points, `RedisFuture` adapters, object codecs, and distributed data structures to Lettuce. It also includes loaded maps, Lua script execution, and probabilistic filters.

It is not a framework that owns the Redis lifecycle. The application must decide who closes clients, connections, and write-behind workers.

## Decisions before adoption

- Decide whether raw Lettuce is enough or wrappers and coroutine adapters are needed.
- Assign ownership of `RedisClient`, cached connections, and shared `ClientResources`.
- Choose one sync, async-future, or coroutine path per call chain.
- Freeze the Redis wire format and plan codec migrations.
- Define cache-miss, write-through, and write-behind failure policy.
- Use Lua only when a single Redis command cannot provide the required atomicity.

## Dependencies

Consumers manage only the central `bluetape4k-dependencies` BOM version.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-lettuce")
}
```

Coroutine, cache-core, Kryo/Fory, and compression capabilities are optional and require the corresponding runtime dependencies when used.

## First connection

```kotlin
val client = LettuceClients.clientOf("redis://localhost:6379")
try {
    val commands = LettuceClients.commands(client)
    commands.set("greeting", "hello")
    check(commands.get("greeting") == "hello")
} finally {
    LettuceClients.shutdown(client)
}
```

`commands(client)` reuses a client-scoped cached connection. Direct connections and loaded-map connections remain owned by their creators.

## API map

| Task | Start with | Boundary |
| --- | --- | --- |
| Client and cached connection | `LettuceClients` | Distinguish `shutdown(client)` from process-wide `shutdown()`. |
| Sync/async/coroutine commands | `commands`, `asyncCommands`, `coroutinesCommands` | Lettuce marks its coroutine API experimental. |
| Await futures | `awaitSuspending`, `awaitAll` | Preserve failures and cancellation. |
| Store objects | `LettuceBinaryCodecs`, `LettuceJsonCodecs` | A codec defines the persisted wire format. |
| Maps with loaders and writers | `LettuceMap`, `LettuceLoadedMap` | Write-through and write-behind fail at different times. |
| Atomic scripts | `RedisScriptRunner` | It falls back from `EVALSHA` to `EVAL` only on `NOSCRIPT`. |
| Probabilistic structures | `LettuceBloomFilter`, `LettuceCuckooFilter` | Include false positives and initialization parameters in the contract. |

## Learning path

These chapters go beyond a feature list. They follow the 1.11.0 release source and representative tests, with runnable examples for ownership, cancellation, wire compatibility, and write-behind failures.

1. [Clients and connections](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/clients-and-connections/)
2. [Commands and coroutines](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/commands-and-coroutines/)
3. [Codecs and serialization](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/codecs-and-serialization/)
4. [Maps and cache loading](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/maps-and-cache-loading/)
5. [Filters, scripts, and primitives](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/filters-scripts-and-primitives/)
6. [Operations and ecosystem](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/operations-and-ecosystem/)

## Recommended patterns

Reuse a client per application and close it from the shutdown lifecycle. Issue all pipelined commands inside `withPipeline`, then await the futures outside the block. Migrate codecs with a new key prefix or a full cache reset. Treat write-behind capacity, flush failures, dead letters, and shutdown draining as operational state.

## Integrations

Lettuce core is an API dependency; coroutine, cache-core, serializers, and compression libraries are optional. Use [`bluetape4k-cache-lettuce`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-lettuce/) for memoization and [`bluetape4k-hibernate-cache-lettuce`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate-cache-lettuce/) for Hibernate second-level caching.

## Configuration

Default clients share NCPU-sized `ClientResources` and enable keep-alive and TCP_NODELAY. Override the connection timeout with `-Dbluetape4k.lettuce.connectTimeoutMs`. `LettuceCacheConfig` validates TTL, key prefix, write mode, queue capacity, and shutdown timeout inputs.

## Failure behavior

`awaitAll()` propagates a failed future instead of returning a partial list. Write-through does not update Redis when the writer fails. A full write-behind queue raises `IllegalStateException`; repeated flush failures are sent to dead-letter keys on a best-effort basis. Coroutine maps rethrow `CancellationException`.

## Operations

Observe connection and reconnect state, command latency, pipeline batch size, write-behind queues and dead letters, and cache hit/miss rates. `shutdown(client)` closes that client's cached connections; parameterless `shutdown()` closes shared resources and belongs only at process termination.

## Testing

```bash
./gradlew :bluetape4k-lettuce:test --no-build-cache --no-configuration-cache
```

The release tests cover cached connection reuse, future ordering and failure propagation, codec incompatibility, loader/writer modes, cancellation, and script fallback. Redis tests use Testcontainers and should not run in parallel with other heavy database suites.

## Workshops

Start with `LettuceClientsTest`, `RedisFutureSupportTest`, `LettuceLoadedMapTest`, and `RedisScriptTest`. Continue to [bluetape4k-workshop](https://github.com/bluetape4k/bluetape4k-workshop) and [Exposed Workshop](https://github.com/bluetape4k/exposed-workshop) for cache and database boundaries.

## 1.11.0 scope

`LettuceCacheConfig` exposes near-cache fields, but the 1.11.0 loaded maps do not consume them and provide neither a Caffeine store nor RESP3 client-tracking invalidation. Do not treat the `*_WITH_NEAR_CACHE` presets as a working local-cache guarantee. RESP3 appears only in a rejected benchmark configuration.

## Source and tests

- [`LettuceClients.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/LettuceClients.kt)
- [`RedisFutureSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/RedisFutureSupport.kt)
- [`LettuceBinaryCodecs.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/codec/LettuceBinaryCodecs.kt)
- [`LettuceLoadedMap.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/map/LettuceLoadedMap.kt)
- [`RedisScript.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/script/RedisScript.kt)
- [`LettuceClientsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/test/kotlin/io/bluetape4k/redis/lettuce/LettuceClientsTest.kt)
- [`LettuceSuspendedLoadedMapTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/test/kotlin/io/bluetape4k/redis/lettuce/map/LettuceSuspendedLoadedMapTest.kt)

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `1.11.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### Distributed Primitive API Families diagram

[![Distributed Primitive API Families diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-projects/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/infra-lettuce-diagram-01.png)](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/infra-lettuce-diagram-01.svg)

_Release README: [`infra/lettuce/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/infra/lettuce/README.md)_

### Lettuce Codec API Structure diagram

[![Lettuce Codec API Structure diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-projects/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/infra-lettuce-diagram-02.png)](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/infra-lettuce-diagram-02.svg)

_Release README: [`infra/lettuce/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/infra/lettuce/README.md)_

### LettuceLoadedMap Read-Through / Write-Through Flow diagram

[![LettuceLoadedMap Read-Through / Write-Through Flow diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-projects/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/infra-lettuce-sequence-01.png)](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/infra-lettuce-sequence-01.svg)

_Release README: [`infra/lettuce/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/infra/lettuce/README.md)_

<!-- release-readme-diagrams:end -->
