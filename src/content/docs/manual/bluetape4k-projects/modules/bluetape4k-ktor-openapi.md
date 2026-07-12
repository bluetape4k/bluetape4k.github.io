---
manualId: bluetape4k-ktor-openapi
title: "bluetape4k-ktor-openapi"
description: "Optional Ktor OpenAPI helpers for applications that want explicit documentation routes without changing route behavior."
kind: library
group: web
manual:
  id: "bluetape4k-ktor-openapi"
  repository: "bluetape4k-projects"
  group: "web"
  kind: "library"
  sourceCommit: "dda876503926aa16302b4416e3f3a3e2bff26526"
  sourcePath: "docs/manual/en/modules/bluetape4k-ktor-openapi.md"
  layer: "build"
---


## Problem

Optional Ktor OpenAPI helpers for applications that want explicit documentation routes without changing route behavior. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-ktor-openapi` when the application needs request lifecycle, cancellation, routing, context propagation, and test boundaries. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-ktor-openapi")
}
```

Gradle project path: `:bluetape4k-ktor-openapi`. Source directory: `ktor/openapi`.

## Concepts

The first source-level concepts to inspect are `KtorOpenApiRoutes`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`KtorOpenApiRoutes`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/ktor/openapi/src/main/kotlin/io/bluetape4k/ktor/openapi/KtorOpenApiRoutes.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`KtorOpenApiRoutes`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/ktor/openapi/src/main/kotlin/io/bluetape4k/ktor/openapi/KtorOpenApiRoutes.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Route Diagram**, **Features**, **Dependency**, **Static Specification**, **Runtime Metadata**, and **Non-goals**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-ktor-core"))
api(libs.ktor.server.core)
api(libs.ktor.server.openapi)
api(libs.ktor.server.routing.openapi)
api(libs.ktor.server.swagger)
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
./gradlew :bluetape4k-ktor-openapi:test --no-configuration-cache
```

Representative test anchors:

- [`KtorOpenApiRoutesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/ktor/openapi/src/test/kotlin/io/bluetape4k/ktor/openapi/KtorOpenApiRoutesTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/ktor/openapi/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/ktor/openapi/build.gradle.kts)
- [`KtorOpenApiRoutes`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/ktor/openapi/src/main/kotlin/io/bluetape4k/ktor/openapi/KtorOpenApiRoutes.kt)
- [`KtorOpenApiRoutesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/ktor/openapi/src/test/kotlin/io/bluetape4k/ktor/openapi/KtorOpenApiRoutesTest.kt)
