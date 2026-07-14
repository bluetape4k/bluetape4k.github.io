---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-mutiny"
manualId: bluetape4k-mutiny
title: "Module bluetape4k-mutiny"
description: "Provides extension functions and utilities that make the SmallRye Mutiny reactive library easier to use in Kotlin."
kind: library
group: utilities
manual:
  id: "bluetape4k-mutiny"
  repository: "bluetape4k-projects"
  group: "utilities"
  kind: "library"
  sourceCommit: "ece059d6f79ae8b6d769e44ec98483a1225f6260"
  sourcePath: "docs/manual/en/modules/bluetape4k-mutiny.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "utils/mutiny"
  layer: "build"
---


## Problem

Provides extension functions and utilities that make the SmallRye Mutiny reactive library easier to use in Kotlin. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-mutiny` when the application needs input contracts, value semantics, algorithmic cost, and deterministic output. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-mutiny")
}
```

Gradle project path: `:bluetape4k-mutiny`. Source directory: `utils/mutiny`.

## Concepts

The first source-level concepts to inspect are `CoroutineSupport`, `MultiSupport`, and `UniSupport`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`CoroutineSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/mutiny/src/main/kotlin/io/bluetape4k/mutiny/CoroutineSupport.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`CoroutineSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/mutiny/src/main/kotlin/io/bluetape4k/mutiny/CoroutineSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MultiSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/mutiny/src/main/kotlin/io/bluetape4k/mutiny/MultiSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`UniSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/mutiny/src/main/kotlin/io/bluetape4k/mutiny/UniSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Overview**, **Adding the Dependency**, **Key Features**, **Mutiny Type Diagram**, **Usage Examples**, **Create Uni**, **Transform Uni**, **Create Multi**, **Transform Multi**, and **Coroutine Interop**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-core"))
api(libs.mutiny)
api(libs.mutiny.kotlin)
api(project(":bluetape4k-coroutines"))
api(libs.kotlinx.coroutines.core)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Measure hot paths, bound input sizes, and monitor failures at the application boundary that calls the utility. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-mutiny:test --no-configuration-cache
```

Representative test anchors:

- [`CoroutineSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/mutiny/src/test/kotlin/io/bluetape4k/mutiny/CoroutineSupportTest.kt)
- [`MultiSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/mutiny/src/test/kotlin/io/bluetape4k/mutiny/MultiSupportTest.kt)
- [`UniSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/mutiny/src/test/kotlin/io/bluetape4k/mutiny/UniSupportTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/mutiny/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/mutiny/build.gradle.kts)
- [`CoroutineSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/mutiny/src/main/kotlin/io/bluetape4k/mutiny/CoroutineSupport.kt)
- [`MultiSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/mutiny/src/main/kotlin/io/bluetape4k/mutiny/MultiSupport.kt)
- [`UniSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/mutiny/src/main/kotlin/io/bluetape4k/mutiny/UniSupport.kt)
- [`CoroutineSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/mutiny/src/test/kotlin/io/bluetape4k/mutiny/CoroutineSupportTest.kt)
- [`MultiSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/mutiny/src/test/kotlin/io/bluetape4k/mutiny/MultiSupportTest.kt)
- [`UniSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/mutiny/src/test/kotlin/io/bluetape4k/mutiny/UniSupportTest.kt)
