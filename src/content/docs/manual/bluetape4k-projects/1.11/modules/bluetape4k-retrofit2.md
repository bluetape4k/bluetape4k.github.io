---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-retrofit2"
manualId: bluetape4k-retrofit2
title: "Module bluetape4k-retrofit2"
description: "bluetape4k-retrofit2 is a module that extends Retrofit2 with Kotlin DSL and Coroutines support."
kind: library
group: io
manual:
  id: "bluetape4k-retrofit2"
  repository: "bluetape4k-projects"
  group: "io"
  kind: "library"
  sourceCommit: "ece059d6f79ae8b6d769e44ec98483a1225f6260"
  sourcePath: "docs/manual/en/modules/bluetape4k-retrofit2.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "io/retrofit2"
  layer: "build"
---


## Problem

bluetape4k-retrofit2 is a module that extends Retrofit2 with Kotlin DSL and Coroutines support. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-retrofit2` when the application needs encoding boundaries, resource ownership, streaming, compatibility, and malformed input. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-retrofit2")
}
```

Gradle project path: `:bluetape4k-retrofit2`. Source directory: `io/retrofit2`.

## Concepts

The first source-level concepts to inspect are `ExceptionSupport`, `RetrofitCallSupport`, `RetrofitSupport`, `SuspendRetrofitCallSupport`, `Hc5CallFactory`, `Hc5OkHttp3Support`, `VertxCallFactory`, and `VertxOkHttp3Support`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`ExceptionSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/ExceptionSupport.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`ExceptionSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/ExceptionSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RetrofitCallSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/RetrofitCallSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RetrofitSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/RetrofitSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`SuspendRetrofitCallSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/SuspendRetrofitCallSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Hc5CallFactory`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/clients/hc5/Hc5CallFactory.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Hc5OkHttp3Support`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/clients/hc5/Hc5OkHttp3Support.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`VertxCallFactory`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/clients/vertx/VertxCallFactory.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`VertxOkHttp3Support`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/clients/vertx/VertxOkHttp3Support.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ResultCall`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/result/ResultCall.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ResultCallAdapterFactory`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/result/ResultCallAdapterFactory.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Overview**, **Architecture**, **Retrofit2 Module Architecture**, **Retrofit2 + Result Pattern Integration**, **Suspend Result HTTP Request Flow**, **Key Features**, **1. Retrofit Builder DSL**, **2. Result Pattern Support**, **3. Coroutines Support**, and **4. Multiple HTTP Backends (CallFactory)**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
api(project(":bluetape4k-http"))
api(project(":bluetape4k-okio"))
api(project(":bluetape4k-netty"))
api(project(":bluetape4k-coroutines"))
compileOnly(libs.kotlinx.coroutines.core)
compileOnly(libs.kotlinx.coroutines.reactive)
compileOnly(libs.kotlinx.coroutines.reactor)
api(libs.retrofit2)
api(libs.retrofit2.converter.jackson)
api(libs.retrofit2.converter.scalars)
api(libs.retrofit2.adapter.java8)
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
./gradlew :bluetape4k-retrofit2:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractRetrofitTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/test/kotlin/io/bluetape4k/retrofit2/AbstractRetrofitTest.kt)
- [`ExceptionSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/test/kotlin/io/bluetape4k/retrofit2/ExceptionSupportTest.kt)
- [`RetrofitBuilderSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/test/kotlin/io/bluetape4k/retrofit2/RetrofitBuilderSupportTest.kt)
- [`RetrofitSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/test/kotlin/io/bluetape4k/retrofit2/RetrofitSupportTest.kt)
- [`RetryRetrofitCallSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/test/kotlin/io/bluetape4k/retrofit2/RetryRetrofitCallSupportTest.kt)
- [`SuspendRetrofitCallSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/test/kotlin/io/bluetape4k/retrofit2/SuspendRetrofitCallSupportTest.kt)
- [`AbstractClientTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/test/kotlin/io/bluetape4k/retrofit2/client/AbstractClientTest.kt)
- [`AbstractDetectTempEmailTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/test/kotlin/io/bluetape4k/retrofit2/client/AbstractDetectTempEmailTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/build.gradle.kts)
- [`ExceptionSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/ExceptionSupport.kt)
- [`RetrofitCallSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/RetrofitCallSupport.kt)
- [`RetrofitSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/RetrofitSupport.kt)
- [`SuspendRetrofitCallSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/SuspendRetrofitCallSupport.kt)
- [`Hc5CallFactory`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/clients/hc5/Hc5CallFactory.kt)
- [`Hc5OkHttp3Support`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/clients/hc5/Hc5OkHttp3Support.kt)
- [`VertxCallFactory`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/clients/vertx/VertxCallFactory.kt)
- [`VertxOkHttp3Support`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/clients/vertx/VertxOkHttp3Support.kt)
- [`ResultCall`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/result/ResultCall.kt)
- [`ResultCallAdapterFactory`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/main/kotlin/io/bluetape4k/retrofit2/result/ResultCallAdapterFactory.kt)
- [`AbstractRetrofitTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/test/kotlin/io/bluetape4k/retrofit2/AbstractRetrofitTest.kt)
- [`ExceptionSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/retrofit2/src/test/kotlin/io/bluetape4k/retrofit2/ExceptionSupportTest.kt)
