---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-vertx"
manualId: bluetape4k-vertx
title: "Module bluetape4k-vertx"
description: "A unified module for async and Coroutines-based development with Vert.x."
kind: library
group: io
manual:
  id: "bluetape4k-vertx"
  repository: "bluetape4k-projects"
  group: "io"
  kind: "library"
  sourceCommit: "0ecae4a1b0b25e9654cd631b437ef81215d81974"
  sourcePath: "docs/manual/en/modules/bluetape4k-vertx.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "io/vertx"
  layer: "build"
---


## Problem

A unified module for async and Coroutines-based development with Vert.x. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-vertx` when the application needs encoding boundaries, resource ownership, streaming, compatibility, and malformed input. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-vertx")
}
```

Gradle project path: `:bluetape4k-vertx`. Source directory: `io/vertx`.

## Concepts

The first source-level concepts to inspect are `CoroutineSupport`, `FutureExtensions`, `VertxSupport`, `VertxDecorators`, `VertxFutureBulkheadSupport`, `VertxFutureCircuitBreakerSupport`, `VertxFutureRateLimiterSupport`, and `VertxFutureRetrySupport`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`CoroutineSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/CoroutineSupport.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`CoroutineSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/CoroutineSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`FutureExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/FutureExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`VertxSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/VertxSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`VertxDecorators`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/resilience4j/VertxDecorators.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`VertxFutureBulkheadSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/resilience4j/VertxFutureBulkheadSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`VertxFutureCircuitBreakerSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/resilience4j/VertxFutureCircuitBreakerSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`VertxFutureRateLimiterSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/resilience4j/VertxFutureRateLimiterSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`VertxFutureRetrySupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/resilience4j/VertxFutureRetrySupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`VertxFutureSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/resilience4j/VertxFutureSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`VertxFutureTimeLimiterSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/resilience4j/VertxFutureTimeLimiterSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **What's Included**, **Vert.x Core (formerly vertx/core)**, **Vert.x SQL Client (formerly vertx/sqlclient)**, **Resilience4j Integration (formerly vertx/resilience4j)**, **Architecture Diagrams**, **Module Dependency Structure**, **Vert.x Event Loop + Coroutines Processing Flow**, **Circuit Breaker + Resilience4j Integration Flow**, **Vert.x Core Component Class Structure**, and **Installation**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-io"))
api(project(":bluetape4k-netty"))
api(project(":bluetape4k-coroutines"))
api(project(":bluetape4k-jdbc"))
api(libs.vertx.core)
api(libs.vertx.lang.kotlin)
api(libs.vertx.lang.kotlin.coroutines)
compileOnly(libs.vertx.web)
compileOnly(libs.vertx.web.client)
compileOnly(libs.vertx.junit5)
api(project(":bluetape4k-resilience4j"))
compileOnly(libs.resilience4j.reactor)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track payload size, allocation, latency, malformed-input rate, resource closure, and protocol errors. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-vertx:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractVertxTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/test/kotlin/io/bluetape4k/vertx/AbstractVertxTest.kt)
- [`SampleVerticle`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/test/kotlin/io/bluetape4k/vertx/SampleVerticle.kt)
- [`VertxSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/test/kotlin/io/bluetape4k/vertx/VertxSupportTest.kt)
- [`LifecycleExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/test/kotlin/io/bluetape4k/vertx/examples/LifecycleExamples.kt)
- [`SampleVerticleTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/test/kotlin/io/bluetape4k/vertx/examples/SampleVerticleTest.kt)
- [`VertxJunit5Examples`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/test/kotlin/io/bluetape4k/vertx/examples/VertxJunit5Examples.kt)
- [`AbstractVertxFutureTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/test/kotlin/io/bluetape4k/vertx/resilience4j/AbstractVertxFutureTest.kt)
- [`VertxDecoratorsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/test/kotlin/io/bluetape4k/vertx/resilience4j/VertxDecoratorsTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/build.gradle.kts)
- [`CoroutineSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/CoroutineSupport.kt)
- [`FutureExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/FutureExtensions.kt)
- [`VertxSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/VertxSupport.kt)
- [`VertxDecorators`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/resilience4j/VertxDecorators.kt)
- [`VertxFutureBulkheadSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/resilience4j/VertxFutureBulkheadSupport.kt)
- [`VertxFutureCircuitBreakerSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/resilience4j/VertxFutureCircuitBreakerSupport.kt)
- [`VertxFutureRateLimiterSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/resilience4j/VertxFutureRateLimiterSupport.kt)
- [`VertxFutureRetrySupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/resilience4j/VertxFutureRetrySupport.kt)
- [`VertxFutureSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/resilience4j/VertxFutureSupport.kt)
- [`VertxFutureTimeLimiterSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/main/kotlin/io/bluetape4k/vertx/resilience4j/VertxFutureTimeLimiterSupport.kt)
- [`AbstractVertxTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/test/kotlin/io/bluetape4k/vertx/AbstractVertxTest.kt)
- [`SampleVerticle`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/vertx/src/test/kotlin/io/bluetape4k/vertx/SampleVerticle.kt)
