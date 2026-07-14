---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-virtualthread-jdk25"
manualId: bluetape4k-virtualthread-jdk25
title: "Module bluetape4k-virtualthread-jdk25"
description: "Java 25 virtual-thread implementation module."
kind: library
group: concurrency
manual:
  id: "bluetape4k-virtualthread-jdk25"
  repository: "bluetape4k-projects"
  group: "concurrency"
  kind: "library"
  sourceCommit: "dd05a2a56058bd08d503308a2eb98ac1cf73918d"
  sourcePath: "docs/manual/en/modules/bluetape4k-virtualthread-jdk25.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "virtualthread/jdk25"
  layer: "build"
---


## Problem

Java 25 virtual-thread implementation module. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-virtualthread-jdk25` when the application needs scope ownership, cancellation, executor lifecycle, blocking boundaries, and shutdown. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-virtualthread-jdk25")
}
```

Gradle project path: `:bluetape4k-virtualthread-jdk25`. Source directory: `virtualthread/jdk25`.

## Concepts

The first source-level concepts to inspect are `Jdk25VirtualThreadRuntime`, and `Jdk25StructuredTaskScopeProvider`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`Jdk25VirtualThreadRuntime`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/virtualthread/jdk25/src/main/java/io/bluetape4k/concurrent/virtualthread/jdk25/Jdk25VirtualThreadRuntime.java) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`Jdk25VirtualThreadRuntime`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/virtualthread/jdk25/src/main/java/io/bluetape4k/concurrent/virtualthread/jdk25/Jdk25VirtualThreadRuntime.java) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Jdk25StructuredTaskScopeProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/virtualthread/jdk25/src/main/kotlin/io/bluetape4k/concurrent/virtualthread/jdk25/Jdk25StructuredTaskScopeProvider.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Overview**, **Implementation Structure**, **Main Implementations**, **Jdk25VirtualThreadRuntime**, **Jdk25StructuredTaskScopeProvider**, **ServiceLoader Configuration**, **Build Configuration**, **Dependencies**, **Gradle Dependencies**, and **Gradle Usage Example**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-virtualthread-api"))
implementation(project(":bluetape4k-logging"))
implementation(libs.kotlinx.coroutines.core)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`io.bluetape4k.concurrent.virtualthread.StructuredTaskScopeProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/virtualthread/jdk25/src/main/resources/META-INF/services/io.bluetape4k.concurrent.virtualthread.StructuredTaskScopeProvider)
- [`io.bluetape4k.concurrent.virtualthread.VirtualThreadRuntime`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/virtualthread/jdk25/src/main/resources/META-INF/services/io.bluetape4k.concurrent.virtualthread.VirtualThreadRuntime)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track active work, queue depth, cancellation, timeout, executor saturation, and shutdown completion. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-virtualthread-jdk25:test --no-configuration-cache
```

Representative test anchors:

- [`Jdk25StructuredTaskScopeProviderExtTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/virtualthread/jdk25/src/test/kotlin/io/bluetape4k/concurrent/virtualthread/jdk25/Jdk25StructuredTaskScopeProviderExtTest.kt)
- [`Jdk25StructuredTaskScopeProviderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/virtualthread/jdk25/src/test/kotlin/io/bluetape4k/concurrent/virtualthread/jdk25/Jdk25StructuredTaskScopeProviderTest.kt)
- [`Jdk25TaskContextTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/virtualthread/jdk25/src/test/kotlin/io/bluetape4k/concurrent/virtualthread/jdk25/Jdk25TaskContextTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/virtualthread/jdk25/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/virtualthread/jdk25/build.gradle.kts)
- [`Jdk25VirtualThreadRuntime`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/virtualthread/jdk25/src/main/java/io/bluetape4k/concurrent/virtualthread/jdk25/Jdk25VirtualThreadRuntime.java)
- [`Jdk25StructuredTaskScopeProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/virtualthread/jdk25/src/main/kotlin/io/bluetape4k/concurrent/virtualthread/jdk25/Jdk25StructuredTaskScopeProvider.kt)
- [`Jdk25StructuredTaskScopeProviderExtTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/virtualthread/jdk25/src/test/kotlin/io/bluetape4k/concurrent/virtualthread/jdk25/Jdk25StructuredTaskScopeProviderExtTest.kt)
- [`Jdk25StructuredTaskScopeProviderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/virtualthread/jdk25/src/test/kotlin/io/bluetape4k/concurrent/virtualthread/jdk25/Jdk25StructuredTaskScopeProviderTest.kt)
- [`Jdk25TaskContextTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/virtualthread/jdk25/src/test/kotlin/io/bluetape4k/concurrent/virtualthread/jdk25/Jdk25TaskContextTest.kt)
