---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-bucket4j"
manualId: bluetape4k-bucket4j
title: "Module bluetape4k-bucket4j"
description: "A wrapper and utility module for building application-level rate limiters using Bucket4j."
kind: library
group: infrastructure
manual:
  id: "bluetape4k-bucket4j"
  repository: "bluetape4k-projects"
  group: "infrastructure"
  kind: "library"
  sourceCommit: "0ecae4a1b0b25e9654cd631b437ef81215d81974"
  sourcePath: "docs/manual/en/modules/bluetape4k-bucket4j.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/bucket4j"
  layer: "build"
---


## Problem

A wrapper and utility module for building application-level rate limiters using Bucket4j. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-bucket4j` when the application needs client lifecycle, reconnect policy, backpressure, retries, and observability. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-bucket4j")
}
```

Gradle project path: `:bluetape4k-bucket4j`. Source directory: `infra/bucket4j`.

## Concepts

The first source-level concepts to inspect are `BucketKeyValidation`, `ConfigurationSupport`, `SuspendLocalBucket`, `AsyncBucketProxyProvider`, `BucketProxyProvider`, `LettuceBasedProxyManagerSupport`, `RedissonBasedProxyManagerSupport`, and `Slf4jBucketListener`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`BucketKeyValidation`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/BucketKeyValidation.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`BucketKeyValidation`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/BucketKeyValidation.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ConfigurationSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/ConfigurationSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`SuspendLocalBucket`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/coroutines/SuspendLocalBucket.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AsyncBucketProxyProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/distributed/AsyncBucketProxyProvider.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`BucketProxyProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/distributed/BucketProxyProvider.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`LettuceBasedProxyManagerSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/distributed/redis/LettuceBasedProxyManagerSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedissonBasedProxyManagerSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/distributed/redis/RedissonBasedProxyManagerSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Slf4jBucketListener`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/internal/Slf4jBucketListener.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AbstractLocalBucketProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/local/AbstractLocalBucketProvider.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`LocalBucketProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/local/LocalBucketProvider.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Key Features**, **Class Structure**, **Bucket4j Integration Class Diagram**, **Rate Limiting Sequence Diagrams**, **Local Rate Limiter — Token Consumption Flow**, **Distributed Suspend Rate Limiter — Redis-Based Coroutine Flow**, **What This Module Adds Over Raw Bucket4j**, **Dependency**, **Usage Examples**, and **1) Local Rate Limiter**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
api(project(":bluetape4k-core"))
compileOnly(project(":bluetape4k-cache-core"))
api(libs.bucket4j.core)
compileOnly(libs.bucket4j.lettuce)
compileOnly(libs.bucket4j.redisson)
compileOnly(libs.caffeine)
compileOnly(libs.lettuce.core)
compileOnly(libs.redisson)
compileOnly(project(":bluetape4k-coroutines"))
compileOnly(libs.kotlinx.coroutines.core)
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
./gradlew :bluetape4k-bucket4j:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractBucket4jTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/test/kotlin/io/bluetape4k/bucket4j/AbstractBucket4jTest.kt)
- [`ConfigurationSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/test/kotlin/io/bluetape4k/bucket4j/ConfigurationSupportTest.kt)
- [`TestRedisServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/test/kotlin/io/bluetape4k/bucket4j/TestRedisServer.kt)
- [`SuspendLocalBucketListenerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/test/kotlin/io/bluetape4k/bucket4j/coroutines/SuspendLocalBucketListenerTest.kt)
- [`SuspendedLocalBucketTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/test/kotlin/io/bluetape4k/bucket4j/coroutines/SuspendedLocalBucketTest.kt)
- [`AbstractAsyncBucketProxyProviderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/test/kotlin/io/bluetape4k/bucket4j/distributed/AbstractAsyncBucketProxyProviderTest.kt)
- [`AbstractBucketProxyProviderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/test/kotlin/io/bluetape4k/bucket4j/distributed/AbstractBucketProxyProviderTest.kt)
- [`LettuceAsyncBucketProxyProviderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/test/kotlin/io/bluetape4k/bucket4j/distributed/redis/LettuceAsyncBucketProxyProviderTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/build.gradle.kts)
- [`BucketKeyValidation`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/BucketKeyValidation.kt)
- [`ConfigurationSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/ConfigurationSupport.kt)
- [`SuspendLocalBucket`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/coroutines/SuspendLocalBucket.kt)
- [`AsyncBucketProxyProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/distributed/AsyncBucketProxyProvider.kt)
- [`BucketProxyProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/distributed/BucketProxyProvider.kt)
- [`LettuceBasedProxyManagerSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/distributed/redis/LettuceBasedProxyManagerSupport.kt)
- [`RedissonBasedProxyManagerSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/distributed/redis/RedissonBasedProxyManagerSupport.kt)
- [`Slf4jBucketListener`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/internal/Slf4jBucketListener.kt)
- [`AbstractLocalBucketProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/local/AbstractLocalBucketProvider.kt)
- [`LocalBucketProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/main/kotlin/io/bluetape4k/bucket4j/local/LocalBucketProvider.kt)
- [`AbstractBucket4jTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/test/kotlin/io/bluetape4k/bucket4j/AbstractBucket4jTest.kt)
- [`ConfigurationSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/bucket4j/src/test/kotlin/io/bluetape4k/bucket4j/ConfigurationSupportTest.kt)
