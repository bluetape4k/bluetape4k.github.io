---
manualId: bluetape4k-json
title: "Module bluetape4k-json"
description: "bluetape4k-json defines the small JSON serialization SPI shared by the Jackson 2, Jackson 3, and Fastjson2 modules."
kind: library
group: io
manual:
  id: "bluetape4k-json"
  repository: "bluetape4k-projects"
  group: "io"
  kind: "library"
  sourceCommit: "5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6"
  sourcePath: "docs/manual/en/modules/bluetape4k-json.md"
  layer: "build"
---


## Problem

bluetape4k-json defines the small JSON serialization SPI shared by the Jackson 2, Jackson 3, and Fastjson2 modules. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-json` when the application needs encoding boundaries, resource ownership, streaming, compatibility, and malformed input. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-json")
}
```

Gradle project path: `:bluetape4k-json`. Source directory: `io/json`.

## Concepts

The first source-level concepts to inspect are `JsonSerializationException`, and `JsonSerializer`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`JsonSerializationException`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/io/json/src/main/kotlin/io/bluetape4k/json/JsonSerializationException.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`JsonSerializationException`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/io/json/src/main/kotlin/io/bluetape4k/json/JsonSerializationException.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JsonSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/io/json/src/main/kotlin/io/bluetape4k/json/JsonSerializer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Overview**, **Architecture**, **JsonSerializer Class Structure**, **Serializer Call Flow**, **Key Features**, **JsonSerializer SPI**, **Supported Methods**, **Failure Policy**, **Kotlin Reified Extension Functions**, and **Implementations**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(libs.jakarta.json.api)
implementation(project(":bluetape4k-core"))
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
./gradlew :bluetape4k-json:test --no-configuration-cache
```

Representative test anchors:

- [`JsonSerializationExceptionTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/io/json/src/test/kotlin/io/bluetape4k/json/JsonSerializationExceptionTest.kt)
- [`JsonSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/io/json/src/test/kotlin/io/bluetape4k/json/JsonSerializerTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/io/json/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/io/json/build.gradle.kts)
- [`JsonSerializationException`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/io/json/src/main/kotlin/io/bluetape4k/json/JsonSerializationException.kt)
- [`JsonSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/io/json/src/main/kotlin/io/bluetape4k/json/JsonSerializer.kt)
- [`JsonSerializationExceptionTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/io/json/src/test/kotlin/io/bluetape4k/json/JsonSerializationExceptionTest.kt)
- [`JsonSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/io/json/src/test/kotlin/io/bluetape4k/json/JsonSerializerTest.kt)
