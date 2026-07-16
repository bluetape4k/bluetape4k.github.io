---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-ktor-testing"
manualId: bluetape4k-ktor-testing
title: "bluetape4k-ktor-testing"
description: "Ktor testing helpers for the bluetape4k ecosystem."
kind: library
group: web
manual:
  id: "bluetape4k-ktor-testing"
  repository: "bluetape4k-projects"
  group: "web"
  kind: "library"
  sourceCommit: "e1463bff0f864add7c54b7188f492cfe36336cdd"
  sourcePath: "docs/manual/en/modules/bluetape4k-ktor-testing.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "ktor/testing"
  layer: "build"
---


## Problem

Ktor testing helpers for the bluetape4k ecosystem. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-ktor-testing` when the application needs request lifecycle, cancellation, routing, context propagation, and test boundaries. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-ktor-testing")
}
```

Gradle project path: `:bluetape4k-ktor-testing`. Source directory: `ktor/testing`.

## Concepts

The first source-level concepts to inspect are `Bluetape4kKtorTesting`, `ExpectedApiError`, `KtorJsonMockEngineSupport`, and `KtorResponseAssertions`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`Bluetape4kKtorTesting`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/testing/src/main/kotlin/io/bluetape4k/ktor/testing/Bluetape4kKtorTesting.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`Bluetape4kKtorTesting`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/testing/src/main/kotlin/io/bluetape4k/ktor/testing/Bluetape4kKtorTesting.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ExpectedApiError`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/testing/src/main/kotlin/io/bluetape4k/ktor/testing/ExpectedApiError.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`KtorJsonMockEngineSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/testing/src/main/kotlin/io/bluetape4k/ktor/testing/KtorJsonMockEngineSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`KtorResponseAssertions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/testing/src/main/kotlin/io/bluetape4k/ktor/testing/KtorResponseAssertions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Sequence Diagram**, **Features**, **Dependency**, and **Usage**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-ktor-core"))
api(project(":bluetape4k-assertions"))
api(libs.ktor.server.test.host)
api(libs.ktor.client.core)
api(libs.ktor.client.content.negotiation)
api(libs.ktor.client.mock)
implementation(libs.ktor.serialization.kotlinx.json)
implementation(libs.kotlinx.serialization.json)
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
./gradlew :bluetape4k-ktor-testing:test --no-configuration-cache
```

Representative test anchors:

- [`Bluetape4kKtorTestingTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/testing/src/test/kotlin/io/bluetape4k/ktor/testing/Bluetape4kKtorTestingTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/testing/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/testing/build.gradle.kts)
- [`Bluetape4kKtorTesting`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/testing/src/main/kotlin/io/bluetape4k/ktor/testing/Bluetape4kKtorTesting.kt)
- [`ExpectedApiError`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/testing/src/main/kotlin/io/bluetape4k/ktor/testing/ExpectedApiError.kt)
- [`KtorJsonMockEngineSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/testing/src/main/kotlin/io/bluetape4k/ktor/testing/KtorJsonMockEngineSupport.kt)
- [`KtorResponseAssertions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/testing/src/main/kotlin/io/bluetape4k/ktor/testing/KtorResponseAssertions.kt)
- [`Bluetape4kKtorTestingTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/testing/src/test/kotlin/io/bluetape4k/ktor/testing/Bluetape4kKtorTestingTest.kt)
