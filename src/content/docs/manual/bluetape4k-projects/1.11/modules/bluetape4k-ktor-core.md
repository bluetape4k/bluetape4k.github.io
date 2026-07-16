---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-ktor-core"
manualId: bluetape4k-ktor-core
title: "bluetape4k-ktor-core"
description: "Small Ktor server defaults for bluetape4k applications."
kind: library
group: web
manual:
  id: "bluetape4k-ktor-core"
  repository: "bluetape4k-projects"
  group: "web"
  kind: "library"
  sourceCommit: "e1463bff0f864add7c54b7188f492cfe36336cdd"
  sourcePath: "docs/manual/en/modules/bluetape4k-ktor-core.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "ktor/core"
  layer: "build"
---


## Problem

Small Ktor server defaults for bluetape4k applications. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-ktor-core` when the application needs request lifecycle, cancellation, routing, context propagation, and test boundaries. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-ktor-core")
}
```

Gradle project path: `:bluetape4k-ktor-core`. Source directory: `ktor/core`.

## Concepts

The first source-level concepts to inspect are `ApiErrorResponse`, `Bluetape4kKtorCore`, `Bluetape4kKtorCoreConfig`, `Bluetape4kKtorJson`, `Bluetape4kStatusPages`, `HealthResponse`, `KtorHealthRoutes`, and `KtorRequestParameters`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`ApiErrorResponse`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/ApiErrorResponse.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`ApiErrorResponse`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/ApiErrorResponse.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Bluetape4kKtorCore`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/Bluetape4kKtorCore.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Bluetape4kKtorCoreConfig`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/Bluetape4kKtorCoreConfig.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Bluetape4kKtorJson`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/Bluetape4kKtorJson.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Bluetape4kStatusPages`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/Bluetape4kStatusPages.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HealthResponse`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/HealthResponse.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`KtorHealthRoutes`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/KtorHealthRoutes.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`KtorRequestParameters`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/KtorRequestParameters.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Architecture Diagram**, **Features**, **Dependency**, and **Usage**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-core"))
api(libs.ktor.server.core)
api(libs.ktor.server.content.negotiation)
api(libs.ktor.server.status.pages)
api(libs.ktor.serialization.kotlinx.json)
api(libs.kotlinx.serialization.json)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track request latency, status codes, cancellation, queueing, dependency failures, and shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-ktor-core:test --no-configuration-cache
```

Representative test anchors:

- [`Bluetape4kKtorCoreTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/test/kotlin/io/bluetape4k/ktor/core/Bluetape4kKtorCoreTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/build.gradle.kts)
- [`ApiErrorResponse`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/ApiErrorResponse.kt)
- [`Bluetape4kKtorCore`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/Bluetape4kKtorCore.kt)
- [`Bluetape4kKtorCoreConfig`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/Bluetape4kKtorCoreConfig.kt)
- [`Bluetape4kKtorJson`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/Bluetape4kKtorJson.kt)
- [`Bluetape4kStatusPages`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/Bluetape4kStatusPages.kt)
- [`HealthResponse`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/HealthResponse.kt)
- [`KtorHealthRoutes`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/KtorHealthRoutes.kt)
- [`KtorRequestParameters`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/main/kotlin/io/bluetape4k/ktor/core/KtorRequestParameters.kt)
- [`Bluetape4kKtorCoreTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/core/src/test/kotlin/io/bluetape4k/ktor/core/Bluetape4kKtorCoreTest.kt)
