---
manualId: bluetape4k-redisson
title: "bluetape4k-redisson"
description: "A Kotlin extension module for the Redisson Redis client, providing DSL-based client creation, high-performance codecs, Kotlin Coroutines support, and NearCache functionality."
kind: library
group: infrastructure
manual:
  id: "bluetape4k-redisson"
  repository: "bluetape4k-projects"
  group: "infrastructure"
  kind: "library"
  sourceCommit: "dda876503926aa16302b4416e3f3a3e2bff26526"
  sourcePath: "docs/manual/en/modules/bluetape4k-redisson.md"
  layer: "build"
---


## Problem

A Kotlin extension module for the Redisson Redis client, providing DSL-based client creation, high-performance codecs, Kotlin Coroutines support, and NearCache functionality. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-redisson` when the application needs client lifecycle, reconnect policy, backpressure, retries, and observability. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-redisson")
}
```

Gradle project path: `:bluetape4k-redisson`. Source directory: `infra/redisson`.

## Concepts

The first source-level concepts to inspect are `RStreamSupport`, `RedissonClientExtensions`, `RedissonClientSupport`, `RedissonConst`, `CacheInvalidationStrategy`, `LocalCacheMapSupport`, `MapCacheSupport`, and `RedissonCacheConfig`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`RStreamSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/RStreamSupport.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`RStreamSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/RStreamSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedissonClientExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/RedissonClientExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedissonClientSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/RedissonClientSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedissonConst`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/RedissonConst.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CacheInvalidationStrategy`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/cache/CacheInvalidationStrategy.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`LocalCacheMapSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/cache/LocalCacheMapSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MapCacheSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/cache/MapCacheSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedissonCacheConfig`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/cache/RedissonCacheConfig.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`FastForyCodec`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/codec/FastForyCodec.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Fastjson2Codec`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/codec/Fastjson2Codec.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Features**, **Dependency**, **Architecture Diagrams**, **Codec Selection Map**, **NearCache 2-Tier Cache Flow**, **Batch / Transaction Processing Flow**, **Usage Examples**, **1. Creating a RedissonClient**, **DSL Style**, and **YAML Configuration File**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
api(project(":bluetape4k-core"))
api(project(":bluetape4k-io"))
api(project(":bluetape4k-netty"))
api(libs.redisson)
compileOnly(libs.redisson.spring.boot.starter)
compileOnly(project(":bluetape4k-cache-core"))
compileOnly(project(":bluetape4k-idgenerators"))
compileOnly(project(":bluetape4k-coroutines"))
compileOnly(libs.kotlinx.coroutines.core)
compileOnly(libs.kotlinx.coroutines.reactor)
compileOnly(libs.fory.kotlin)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track connection state, queue depth, retries, timeouts, remote errors, and graceful shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-redisson:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractRedissonTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/test/kotlin/io/bluetape4k/redis/redisson/AbstractRedissonTest.kt)
- [`RStreamSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/test/kotlin/io/bluetape4k/redis/redisson/RStreamSupportTest.kt)
- [`RedissonClientExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/test/kotlin/io/bluetape4k/redis/redisson/RedissonClientExtensionsTest.kt)
- [`RedissonClientSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/test/kotlin/io/bluetape4k/redis/redisson/RedissonClientSupportTest.kt)
- [`RedissonTestUtils`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/test/kotlin/io/bluetape4k/redis/redisson/RedissonTestUtils.kt)
- [`RedissonConcurrencyBenchmark`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/test/kotlin/io/bluetape4k/redis/redisson/benchmark/RedissonConcurrencyBenchmark.kt)
- [`CacheInvalidationStrategyTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/test/kotlin/io/bluetape4k/redis/redisson/cache/CacheInvalidationStrategyTest.kt)
- [`LocalCacheMapSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/test/kotlin/io/bluetape4k/redis/redisson/cache/LocalCacheMapSupportTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/build.gradle.kts)
- [`RStreamSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/RStreamSupport.kt)
- [`RedissonClientExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/RedissonClientExtensions.kt)
- [`RedissonClientSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/RedissonClientSupport.kt)
- [`RedissonConst`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/RedissonConst.kt)
- [`CacheInvalidationStrategy`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/cache/CacheInvalidationStrategy.kt)
- [`LocalCacheMapSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/cache/LocalCacheMapSupport.kt)
- [`MapCacheSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/cache/MapCacheSupport.kt)
- [`RedissonCacheConfig`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/cache/RedissonCacheConfig.kt)
- [`FastForyCodec`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/codec/FastForyCodec.kt)
- [`Fastjson2Codec`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/codec/Fastjson2Codec.kt)
- [`AbstractRedissonTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/test/kotlin/io/bluetape4k/redis/redisson/AbstractRedissonTest.kt)
- [`RStreamSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/redisson/src/test/kotlin/io/bluetape4k/redis/redisson/RStreamSupportTest.kt)
