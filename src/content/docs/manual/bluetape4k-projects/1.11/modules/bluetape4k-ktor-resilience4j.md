---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-ktor-resilience4j"
manualId: bluetape4k-ktor-resilience4j
title: "Ktor Resilience4j Integration"
description: "Route-scoped Resilience4j helpers for Ktor server applications in the bluetape4k ecosystem."
kind: library
group: web
learningOrder: 830
manual:
  id: "bluetape4k-ktor-resilience4j"
  repository: "bluetape4k-projects"
  group: "web"
  kind: "library"
  sourceCommit: "222f640a5a8937d3000dc49b2e2f585726ed70e6"
  sourcePath: "docs/manual/en/modules/bluetape4k-ktor-resilience4j.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "ktor/resilience4j"
  layer: "build"
  learningOrder: 830
---


## Problem

Route-scoped Resilience4j helpers for Ktor server applications in the bluetape4k ecosystem. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-ktor-resilience4j` when the application needs request lifecycle, cancellation, routing, context propagation, and test boundaries. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-ktor-resilience4j")
}
```

Gradle project path: `:bluetape4k-ktor-resilience4j`. Source directory: `ktor/resilience4j`.

## Concepts

The first source-level concepts to inspect are `KtorResiliencePolicies`, `KtorResilienceStatusPages`, and `KtorResilienceSupport`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`KtorResiliencePolicies`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/resilience4j/src/main/kotlin/io/bluetape4k/ktor/resilience4j/KtorResiliencePolicies.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`KtorResiliencePolicies`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/resilience4j/src/main/kotlin/io/bluetape4k/ktor/resilience4j/KtorResiliencePolicies.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`KtorResilienceStatusPages`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/resilience4j/src/main/kotlin/io/bluetape4k/ktor/resilience4j/KtorResilienceStatusPages.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`KtorResilienceSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/resilience4j/src/main/kotlin/io/bluetape4k/ktor/resilience4j/KtorResilienceSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Route Flow Diagram**, **Features**, **Dependency**, **Usage**, **Error Mapping**, and **Non-goals**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-ktor-core"))
api(project(":bluetape4k-resilience4j"))
api(libs.ktor.server.core)
api(libs.ktor.server.status.pages)
implementation(libs.kotlinx.coroutines.core)
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
./gradlew :bluetape4k-ktor-resilience4j:test --no-configuration-cache
```

Representative test anchors:

- [`KtorResilienceSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/resilience4j/src/test/kotlin/io/bluetape4k/ktor/resilience4j/KtorResilienceSupportTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `1.11.0` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### Ktor Resilience4j Route Flow

[![Ktor Resilience4j Route Flow](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/ktor-resilience4j-flow-01.png)](../../assets/readme-diagrams/ktor-resilience4j-flow-01.svg)

_Release README: [`ktor/resilience4j/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/ktor/resilience4j/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/resilience4j/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/resilience4j/build.gradle.kts)
- [`KtorResiliencePolicies`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/resilience4j/src/main/kotlin/io/bluetape4k/ktor/resilience4j/KtorResiliencePolicies.kt)
- [`KtorResilienceStatusPages`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/resilience4j/src/main/kotlin/io/bluetape4k/ktor/resilience4j/KtorResilienceStatusPages.kt)
- [`KtorResilienceSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/resilience4j/src/main/kotlin/io/bluetape4k/ktor/resilience4j/KtorResilienceSupport.kt)
- [`KtorResilienceSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/ktor/resilience4j/src/test/kotlin/io/bluetape4k/ktor/resilience4j/KtorResilienceSupportTest.kt)
