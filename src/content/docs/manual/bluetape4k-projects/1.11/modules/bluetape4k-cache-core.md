---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-core"
manualId: bluetape4k-cache-core
title: "Module bluetape4k-cache-core"
description: "bluetape4k-cache-core provides the shared cache API, core abstractions, and local cache implementations."
kind: library
group: caching
manual:
  id: "bluetape4k-cache-core"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "073ab365abcd91889ecd82d0077522cac2f13e15"
  sourcePath: "docs/manual/en/modules/bluetape4k-cache-core.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "cache/cache-core"
  layer: "build"
---


## Problem

bluetape4k-cache-core provides the shared cache API, core abstractions, and local cache implementations. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-cache-core` when the application needs cache key design, consistency, invalidation, and backend ownership. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-cache-core")
}
```

Gradle project path: `:bluetape4k-cache-core`. Source directory: `cache/cache-core`.

## Concepts

The first source-level concepts to inspect are `Cache2kSupport`, `CaffeineSupport`, `EhcacheSupport`, `CaffeineSuspendJCache`, `JCacheEntryEventListener`, `JCacheSupport`, `JCacheType`, and `JCaching`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`Cache2kSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/cache2k/Cache2kSupport.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`Cache2kSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/cache2k/Cache2kSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CaffeineSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/caffeine/CaffeineSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`EhcacheSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/ehcache/EhcacheSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CaffeineSuspendJCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/jcache/CaffeineSuspendJCache.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JCacheEntryEventListener`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/jcache/JCacheEntryEventListener.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JCacheSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/jcache/JCacheSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JCacheType`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/jcache/JCacheType.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JCaching`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/jcache/JCaching.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`SuspendJCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/jcache/SuspendJCache.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`SuspendJCacheEntry`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/jcache/SuspendJCacheEntry.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

Choose one loading contract explicitly. With **cache-aside**, the caller handles a miss, loads the value, and writes it back. With **read-through**, the cache loader owns that miss path. With **write-through**, the cache API propagates the write to the backing store before reporting success; do not describe a plain `put` as write-through unless its implementation has that contract. For a two-level Near Cache, read L1 first, consult L2 on a miss, then fill L1. Write or invalidate L2 and L1 in the order required by the implementation, and test partial failure so stale L1 data cannot silently survive a failed backend update.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-io"))
api(project(":bluetape4k-idgenerators"))
api(libs.javax.cache.api)
api(libs.caffeine)
api(libs.caffeine.jcache)
compileOnly(libs.cache2k.core)
compileOnly(libs.cache2k.jcache)
compileOnly(libs.ehcache)
compileOnly(libs.ehcache.clustered)
compileOnly(libs.ehcache.transactions)
implementation(libs.resilience4j.retry)
implementation(libs.resilience4j.kotlin)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track hit ratio, load latency, eviction, stale reads, backend errors, and reconnect behavior. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-cache-core:test --no-configuration-cache
```

Representative test anchors:

- [`Cache2kSupportExtTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/test/kotlin/io/bluetape4k/cache/cache2k/Cache2kSupportExtTest.kt)
- [`Cache2kSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/test/kotlin/io/bluetape4k/cache/cache2k/Cache2kSupportTest.kt)
- [`CaffeineSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/test/kotlin/io/bluetape4k/cache/caffeine/CaffeineSupportTest.kt)
- [`EhcacheSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/test/kotlin/io/bluetape4k/cache/ehcache/EhcacheSupportTest.kt)
- [`CaffeineSuspendJCacheTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/test/kotlin/io/bluetape4k/cache/jcache/CaffeineSuspendJCacheTest.kt)
- [`JCacheEntryEventListenerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/test/kotlin/io/bluetape4k/cache/jcache/JCacheEntryEventListenerTest.kt)
- [`JCacheReadWriteThroughExample`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/test/kotlin/io/bluetape4k/cache/jcache/JCacheReadWriteThroughExample.kt)
- [`JCacheSupportExtTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/test/kotlin/io/bluetape4k/cache/jcache/JCacheSupportExtTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/build.gradle.kts)
- [`Cache2kSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/cache2k/Cache2kSupport.kt)
- [`CaffeineSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/caffeine/CaffeineSupport.kt)
- [`EhcacheSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/ehcache/EhcacheSupport.kt)
- [`CaffeineSuspendJCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/jcache/CaffeineSuspendJCache.kt)
- [`JCacheEntryEventListener`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/jcache/JCacheEntryEventListener.kt)
- [`JCacheSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/jcache/JCacheSupport.kt)
- [`JCacheType`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/jcache/JCacheType.kt)
- [`JCaching`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/jcache/JCaching.kt)
- [`SuspendJCache`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/jcache/SuspendJCache.kt)
- [`SuspendJCacheEntry`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/main/kotlin/io/bluetape4k/cache/jcache/SuspendJCacheEntry.kt)
- [`Cache2kSupportExtTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/test/kotlin/io/bluetape4k/cache/cache2k/Cache2kSupportExtTest.kt)
- [`Cache2kSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-core/src/test/kotlin/io/bluetape4k/cache/cache2k/Cache2kSupportTest.kt)
