---
manualId: bluetape4k-cache-redisson
title: "Module bluetape4k-cache-redisson"
description: "bluetape4k-cache-redisson provides Redisson-backed cache adapters for the bluetape4k cache APIs."
kind: library
group: caching
manual:
  id: "bluetape4k-cache-redisson"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "dda876503926aa16302b4416e3f3a3e2bff26526"
  sourcePath: "docs/manual/en/modules/bluetape4k-cache-redisson.md"
  layer: "build"
---


## Problem

bluetape4k-cache-redisson provides Redisson-backed cache adapters for the bluetape4k cache APIs. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-cache-redisson` when the application needs cache key design, consistency, invalidation, and backend ownership. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-cache-redisson")
}
```

Gradle project path: `:bluetape4k-cache-redisson`. Source directory: `cache/cache-redisson`.

## Concepts

The first source-level concepts to inspect are `RedissonCaches`, `RedissonJCaching`, `RedissonSuspendJCache`, `RedissonAsyncMemoizer`, `RedissonMemoizer`, `RedissonSuspendMemoizer`, `RedissonNearCache`, and `RedissonNearCacheConfig`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`RedissonCaches`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/RedissonCaches.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`RedissonCaches`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/RedissonCaches.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedissonJCaching`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/jcache/RedissonJCaching.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedissonSuspendJCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/jcache/RedissonSuspendJCache.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedissonAsyncMemoizer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/memoizer/RedissonAsyncMemoizer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedissonMemoizer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/memoizer/RedissonMemoizer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedissonSuspendMemoizer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/memoizer/RedissonSuspendMemoizer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedissonNearCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/nearcache/RedissonNearCache.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedissonNearCacheConfig`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/nearcache/RedissonNearCacheConfig.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedissonSuspendNearCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/nearcache/RedissonSuspendNearCache.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

Choose one loading contract explicitly. With **cache-aside**, the caller handles a miss, loads the value, and writes it back. With **read-through**, the cache loader owns that miss path. With **write-through**, the cache API propagates the write to the backing store before reporting success; do not describe a plain `put` as write-through unless its implementation has that contract. For a two-level Near Cache, read L1 first, consult L2 on a miss, then fill L1. Write or invalidate L2 and L1 in the order required by the implementation, and test partial failure so stale L1 data cannot silently survive a failed backend update.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
api(project(":bluetape4k-cache-core"))
api(libs.redisson)
api(project(":bluetape4k-redisson"))
implementation(libs.resilience4j.retry)
implementation(libs.resilience4j.kotlin)
implementation(project(":bluetape4k-coroutines"))
implementation(libs.kotlinx.coroutines.core)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`javax.cache.spi.CachingProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/resources/META-INF/services/javax.cache.spi.CachingProvider)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track hit ratio, load latency, eviction, stale reads, backend errors, and reconnect behavior. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-cache-redisson:test --no-configuration-cache
```

Representative test anchors:

- [`RedisServers`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/RedisServers.kt)
- [`RedissonCachesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/RedissonCachesTest.kt)
- [`RedissonSuspendJCacheTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/jcache/RedissonSuspendJCacheTest.kt)
- [`RedissonAsyncMemoizerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/memoizer/RedissonAsyncMemoizerTest.kt)
- [`RedissonMemoizerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/memoizer/RedissonMemoizerTest.kt)
- [`RedissonSuspendMemoizerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/memoizer/RedissonSuspendMemoizerTest.kt)
- [`RedissonNearCacheConfigTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/nearcache/RedissonNearCacheConfigTest.kt)
- [`RedissonNearCacheTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/nearcache/RedissonNearCacheTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/build.gradle.kts)
- [`RedissonCaches`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/RedissonCaches.kt)
- [`RedissonJCaching`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/jcache/RedissonJCaching.kt)
- [`RedissonSuspendJCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/jcache/RedissonSuspendJCache.kt)
- [`RedissonAsyncMemoizer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/memoizer/RedissonAsyncMemoizer.kt)
- [`RedissonMemoizer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/memoizer/RedissonMemoizer.kt)
- [`RedissonSuspendMemoizer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/memoizer/RedissonSuspendMemoizer.kt)
- [`RedissonNearCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/nearcache/RedissonNearCache.kt)
- [`RedissonNearCacheConfig`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/nearcache/RedissonNearCacheConfig.kt)
- [`RedissonSuspendNearCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/main/kotlin/io/bluetape4k/cache/nearcache/RedissonSuspendNearCache.kt)
- [`RedisServers`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/RedisServers.kt)
- [`RedissonCachesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/RedissonCachesTest.kt)
- [`RedissonSuspendJCacheTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/cache/cache-redisson/src/test/kotlin/io/bluetape4k/cache/jcache/RedissonSuspendJCacheTest.kt)
