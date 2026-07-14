---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-feign"
manualId: bluetape4k-feign
title: "Module bluetape4k-feign"
description: "bluetape4k-feign extends OpenFeign with a Kotlin DSL and Coroutines support."
kind: library
group: io
manual:
  id: "bluetape4k-feign"
  repository: "bluetape4k-projects"
  group: "io"
  kind: "library"
  sourceCommit: "a9051bd77bf5870d3787f15c1d32088412f2bdbb"
  sourcePath: "docs/manual/en/modules/bluetape4k-feign.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "io/feign"
  layer: "build"
---


## Problem

bluetape4k-feign extends OpenFeign with a Kotlin DSL and Coroutines support. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-feign` when the application needs encoding boundaries, resource ownership, streaming, compatibility, and malformed input. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-feign")
}
```

Gradle project path: `:bluetape4k-feign`. Source directory: `io/feign`.

## Concepts

The first source-level concepts to inspect are `FeignBuilderSupport`, `FeignRequestSupport`, `FeignResponseSupport`, `AsyncVertxHttpClient`, `VertxFeignSupport`, `VertxHttpClient`, `FeignFastjsonDecoder`, and `FeignFastjsonEncoder`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`FeignBuilderSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/FeignBuilderSupport.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`FeignBuilderSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/FeignBuilderSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`FeignRequestSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/FeignRequestSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`FeignResponseSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/FeignResponseSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AsyncVertxHttpClient`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/clients/vertx/AsyncVertxHttpClient.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`VertxFeignSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/clients/vertx/VertxFeignSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`VertxHttpClient`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/clients/vertx/VertxHttpClient.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`FeignFastjsonDecoder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/codec/FeignFastjsonDecoder.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`FeignFastjsonEncoder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/codec/FeignFastjsonEncoder.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JacksonDecoder2`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/codec/JacksonDecoder2.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JacksonEncoder2`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/codec/JacksonEncoder2.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Overview**, **Architecture**, **Overall Architecture: Feign + Coroutines Integration**, **Class Structure: Feign + Coroutines**, **HTTP Transport Layer Options**, **Suspend Function HTTP Request Flow**, **Key Features**, **1. Feign Builder DSL**, **2. Coroutines Support**, and **3. HTTP Transport Layer Options**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
api(project(":bluetape4k-http"))
api(project(":bluetape4k-netty"))
compileOnly(project(":bluetape4k-coroutines"))
compileOnly(libs.kotlinx.coroutines.core)
compileOnly(libs.kotlinx.coroutines.reactor)
api(libs.feign.core)
api(libs.feign.hc5)
api(libs.feign.kotlin)
api(libs.feign.slf4j)
api(libs.feign.jackson)
compileOnly(libs.feign.reactive.wrappers)
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
./gradlew :bluetape4k-feign:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractFeignTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/test/kotlin/io/bluetape4k/feign/AbstractFeignTest.kt)
- [`FeignBuilderSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/test/kotlin/io/bluetape4k/feign/FeignBuilderSupportTest.kt)
- [`FeignRequestSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/test/kotlin/io/bluetape4k/feign/FeignRequestSupportTest.kt)
- [`FeignResponseSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/test/kotlin/io/bluetape4k/feign/FeignResponseSupportTest.kt)
- [`RetryerRegressionTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/test/kotlin/io/bluetape4k/feign/RetryerRegressionTest.kt)
- [`AbstractClientTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/test/kotlin/io/bluetape4k/feign/clients/AbstractClientTest.kt)
- [`AbstractCoroutineClientTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/test/kotlin/io/bluetape4k/feign/clients/AbstractCoroutineClientTest.kt)
- [`AbstractHttpbinCoroutineTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/test/kotlin/io/bluetape4k/feign/clients/AbstractHttpbinCoroutineTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/build.gradle.kts)
- [`FeignBuilderSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/FeignBuilderSupport.kt)
- [`FeignRequestSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/FeignRequestSupport.kt)
- [`FeignResponseSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/FeignResponseSupport.kt)
- [`AsyncVertxHttpClient`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/clients/vertx/AsyncVertxHttpClient.kt)
- [`VertxFeignSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/clients/vertx/VertxFeignSupport.kt)
- [`VertxHttpClient`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/clients/vertx/VertxHttpClient.kt)
- [`FeignFastjsonDecoder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/codec/FeignFastjsonDecoder.kt)
- [`FeignFastjsonEncoder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/codec/FeignFastjsonEncoder.kt)
- [`JacksonDecoder2`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/codec/JacksonDecoder2.kt)
- [`JacksonEncoder2`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/main/kotlin/io/bluetape4k/feign/codec/JacksonEncoder2.kt)
- [`AbstractFeignTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/test/kotlin/io/bluetape4k/feign/AbstractFeignTest.kt)
- [`FeignBuilderSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/feign/src/test/kotlin/io/bluetape4k/feign/FeignBuilderSupportTest.kt)
