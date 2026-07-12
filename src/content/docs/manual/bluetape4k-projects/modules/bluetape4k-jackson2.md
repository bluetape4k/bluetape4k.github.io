---
manualId: bluetape4k-jackson2
title: "Module bluetape4k-jackson"
description: "bluetape4k-jackson2 is a module that wraps the Jackson 2.x library with Kotlin DSL and extension functions."
kind: library
group: io
manual:
  id: "bluetape4k-jackson2"
  repository: "bluetape4k-projects"
  group: "io"
  kind: "library"
  sourceCommit: "952a8a2566d05c0b7fd977f982bb83f5335848f8"
  sourcePath: "docs/manual/en/modules/bluetape4k-jackson2.md"
  layer: "build"
---


## Problem

bluetape4k-jackson2 is a module that wraps the Jackson 2.x library with Kotlin DSL and extension functions. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-jackson2` when the application needs encoding boundaries, resource ownership, streaming, compatibility, and malformed input. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-jackson2")
}
```

Gradle project path: `:bluetape4k-jackson2`. Source directory: `io/jackson2`.

## Concepts

The first source-level concepts to inspect are `Jackson`, `JacksonSerializer`, `JsonGeneratorExtensions`, `JsonMapperSupport`, `JsonNodeExtensions`, `AsyncJsonParser`, `SuspendJsonParser`, and `CborJacksonSerializer`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`Jackson`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/Jackson.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`Jackson`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/Jackson.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JacksonSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/JacksonSerializer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JsonGeneratorExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/JsonGeneratorExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JsonMapperSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/JsonMapperSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JsonNodeExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/JsonNodeExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AsyncJsonParser`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/async/AsyncJsonParser.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`SuspendJsonParser`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/async/SuspendJsonParser.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CborJacksonSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/binary/CborJacksonSerializer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CborJsonSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/binary/CborJsonSerializer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`IonJacksonSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/binary/IonJacksonSerializer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Overview**, **Why Jackson2 in bluetape4k**, **Architecture**, **Class Structure**, **Jackson Serialization Pipeline**, **Field Encryption Flow (@JsonTinkEncrypt)**, **Recommended Usage Scenarios**, **Anti-Patterns**, **Key Features**, and **1. JsonMapper DSL**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.jackson.bom))
implementation(platform(libs.spring.boot.dependencies))
api(libs.jackson.core)
api(libs.jackson.databind)
api(libs.jackson.datatype.jdk8)
api(libs.jackson.datatype.jsr310)
api(libs.jackson.module.kotlin)
api(libs.jackson.module.parameter.names)
api(libs.jackson.module.blackbird)
compileOnly(libs.jackson.dataformat.properties)
compileOnly(libs.jackson.dataformat.yaml)
compileOnly(libs.jackson.dataformat.avro)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`com.fasterxml.jackson.databind.Module`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/resources/META-INF/services/com.fasterxml.jackson.databind.Module)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track payload size, allocation, latency, malformed-input rate, resource closure, and protocol errors. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-jackson2:test --no-configuration-cache
```

Representative test anchors:

- [`DisallowedTypedPayload`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/test/kotlin/com/example/disallowed/DisallowedTypedPayload.kt)
- [`AbstractJsonSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/test/kotlin/io/bluetape4k/jackson/AbstractJsonSerializerTest.kt)
- [`JacksonSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/test/kotlin/io/bluetape4k/jackson/JacksonSerializerTest.kt)
- [`JacksonTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/test/kotlin/io/bluetape4k/jackson/JacksonTest.kt)
- [`JsonGeneratorExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/test/kotlin/io/bluetape4k/jackson/JsonGeneratorExtensionsTest.kt)
- [`JsonMapperSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/test/kotlin/io/bluetape4k/jackson/JsonMapperSupportTest.kt)
- [`JsonNodeExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/test/kotlin/io/bluetape4k/jackson/JsonNodeExtensionsTest.kt)
- [`AsyncJsonParserTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/test/kotlin/io/bluetape4k/jackson/async/AsyncJsonParserTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/build.gradle.kts)
- [`Jackson`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/Jackson.kt)
- [`JacksonSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/JacksonSerializer.kt)
- [`JsonGeneratorExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/JsonGeneratorExtensions.kt)
- [`JsonMapperSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/JsonMapperSupport.kt)
- [`JsonNodeExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/JsonNodeExtensions.kt)
- [`AsyncJsonParser`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/async/AsyncJsonParser.kt)
- [`SuspendJsonParser`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/async/SuspendJsonParser.kt)
- [`CborJacksonSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/binary/CborJacksonSerializer.kt)
- [`CborJsonSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/binary/CborJsonSerializer.kt)
- [`IonJacksonSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/main/kotlin/io/bluetape4k/jackson/binary/IonJacksonSerializer.kt)
- [`DisallowedTypedPayload`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/test/kotlin/com/example/disallowed/DisallowedTypedPayload.kt)
- [`AbstractJsonSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/jackson2/src/test/kotlin/io/bluetape4k/jackson/AbstractJsonSerializerTest.kt)
