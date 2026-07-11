---
manualId: bluetape4k-cache-hazelcast
title: "Module bluetape4k-cache-hazelcast"
description: "bluetape4k-cache-hazelcast provides a Hazelcast-based JCache provider, coroutine-friendly cache implementations, and a Caffeine + Hazelcast IMap 2-tier near cache."
kind: library
group: caching
manual:
  id: "bluetape4k-cache-hazelcast"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "0c14ff5fa62a236de94bed884cb4a7faa31df7c4"
  sourcePath: "docs/manual/en/modules/bluetape4k-cache-hazelcast.md"
  layer: "build"
---


## Problem

bluetape4k-cache-hazelcast provides a Hazelcast-based JCache provider, coroutine-friendly cache implementations, and a Caffeine + Hazelcast IMap 2-tier near cache. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-cache-hazelcast` when the application needs cache key design, consistency, invalidation, and backend ownership. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-cache-hazelcast")
}
```

Gradle project path: `:bluetape4k-cache-hazelcast`. Source directory: `cache/cache-hazelcast`.

## Concepts

The first source-level concepts to inspect are `HazelcastCaches`, `HazelcastJCaching`, `HazelcastSuspendJCache`, `HazelcastAsyncMemoizer`, `HazelcastMemoizer`, `HazelcastSuspendMemoizer`, `HazelcastEntryEventListener`, and `HazelcastLocalCache`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`HazelcastCaches`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/HazelcastCaches.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`HazelcastCaches`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/HazelcastCaches.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HazelcastJCaching`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/jcache/HazelcastJCaching.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HazelcastSuspendJCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/jcache/HazelcastSuspendJCache.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HazelcastAsyncMemoizer`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/memoizer/HazelcastAsyncMemoizer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HazelcastMemoizer`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/memoizer/HazelcastMemoizer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HazelcastSuspendMemoizer`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/memoizer/HazelcastSuspendMemoizer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HazelcastEntryEventListener`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/nearcache/HazelcastEntryEventListener.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HazelcastLocalCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/nearcache/HazelcastLocalCache.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HazelcastNearCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/nearcache/HazelcastNearCache.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HazelcastNearCacheConfig`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/nearcache/HazelcastNearCacheConfig.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

Choose one loading contract explicitly. With **cache-aside**, the caller handles a miss, loads the value, and writes it back. With **read-through**, the cache loader owns that miss path. With **write-through**, the cache API propagates the write to the backing store before reporting success; do not describe a plain `put` as write-through unless its implementation has that contract. For a two-level Near Cache, read L1 first, consult L2 on a miss, then fill L1. Write or invalidate L2 and L1 in the order required by the implementation, and test partial failure so stale L1 data cannot silently survive a failed backend update.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-cache-core"))
api(libs.hazelcast)
implementation(libs.resilience4j.retry)
implementation(libs.resilience4j.kotlin)
compileOnly(project(":bluetape4k-coroutines"))
compileOnly(libs.kotlinx.coroutines.core)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`javax.cache.spi.CachingProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/resources/META-INF/services/javax.cache.spi.CachingProvider)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track hit ratio, load latency, eviction, stale reads, backend errors, and reconnect behavior. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-cache-hazelcast:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractHazelcastTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/test/kotlin/io/bluetape4k/cache/AbstractHazelcastTest.kt)
- [`HazelcastCachesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/test/kotlin/io/bluetape4k/cache/HazelcastCachesTest.kt)
- [`HazelcastServers`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/test/kotlin/io/bluetape4k/cache/HazelcastServers.kt)
- [`HazelcastSuspendJCacheTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/test/kotlin/io/bluetape4k/cache/jcache/HazelcastSuspendJCacheTest.kt)
- [`HazelcastAsyncMemoizerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/test/kotlin/io/bluetape4k/cache/memoizer/HazelcastAsyncMemoizerTest.kt)
- [`HazelcastMemoizerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/test/kotlin/io/bluetape4k/cache/memoizer/HazelcastMemoizerTest.kt)
- [`HazelcastSuspendMemoizerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/test/kotlin/io/bluetape4k/cache/memoizer/HazelcastSuspendMemoizerTest.kt)
- [`AbstractHazelcastNearCacheTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/test/kotlin/io/bluetape4k/cache/nearcache/AbstractHazelcastNearCacheTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/build.gradle.kts)
- [`HazelcastCaches`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/HazelcastCaches.kt)
- [`HazelcastJCaching`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/jcache/HazelcastJCaching.kt)
- [`HazelcastSuspendJCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/jcache/HazelcastSuspendJCache.kt)
- [`HazelcastAsyncMemoizer`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/memoizer/HazelcastAsyncMemoizer.kt)
- [`HazelcastMemoizer`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/memoizer/HazelcastMemoizer.kt)
- [`HazelcastSuspendMemoizer`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/memoizer/HazelcastSuspendMemoizer.kt)
- [`HazelcastEntryEventListener`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/nearcache/HazelcastEntryEventListener.kt)
- [`HazelcastLocalCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/nearcache/HazelcastLocalCache.kt)
- [`HazelcastNearCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/nearcache/HazelcastNearCache.kt)
- [`HazelcastNearCacheConfig`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/nearcache/HazelcastNearCacheConfig.kt)
- [`AbstractHazelcastTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/test/kotlin/io/bluetape4k/cache/AbstractHazelcastTest.kt)
- [`HazelcastCachesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/0c14ff5fa62a236de94bed884cb4a7faa31df7c4/cache/cache-hazelcast/src/test/kotlin/io/bluetape4k/cache/HazelcastCachesTest.kt)
