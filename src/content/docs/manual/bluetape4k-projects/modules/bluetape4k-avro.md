---
manualId: bluetape4k-avro
title: "Module bluetape4k-avro"
description: "A module providing a high-level API for Apache Avro serialization and deserialization."
kind: library
group: io
manual:
  id: "bluetape4k-avro"
  repository: "bluetape4k-projects"
  group: "io"
  kind: "library"
  sourceCommit: "952a8a2566d05c0b7fd977f982bb83f5335848f8"
  sourcePath: "docs/manual/en/modules/bluetape4k-avro.md"
  layer: "build"
---


## Problem

A module providing a high-level API for Apache Avro serialization and deserialization. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-avro` when the application needs encoding boundaries, resource ownership, streaming, compatibility, and malformed input. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-avro")
}
```

Gradle project path: `:bluetape4k-avro`. Source directory: `io/avro`.

## Concepts

The first source-level concepts to inspect are `AvroGenericRecordSerializer`, `AvroReflectSerializer`, `AvroSpecificRecordSerializer`, `CodecFactorySupport`, `DefaultAvroGenericRecordSerializer`, `DefaultAvroReflectSerializer`, and `DefaultAvroSpecificRecordSerializer`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`AvroGenericRecordSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/main/kotlin/io/bluetape4k/avro/AvroGenericRecordSerializer.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`AvroGenericRecordSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/main/kotlin/io/bluetape4k/avro/AvroGenericRecordSerializer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AvroReflectSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/main/kotlin/io/bluetape4k/avro/AvroReflectSerializer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AvroSpecificRecordSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/main/kotlin/io/bluetape4k/avro/AvroSpecificRecordSerializer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CodecFactorySupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/main/kotlin/io/bluetape4k/avro/CodecFactorySupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`DefaultAvroGenericRecordSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/main/kotlin/io/bluetape4k/avro/impl/DefaultAvroGenericRecordSerializer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`DefaultAvroReflectSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/main/kotlin/io/bluetape4k/avro/impl/DefaultAvroReflectSerializer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`DefaultAvroSpecificRecordSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/main/kotlin/io/bluetape4k/avro/impl/DefaultAvroSpecificRecordSerializer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Overview**, **Architecture Diagrams**, **Avro Serializer Class Structure**, **Avro Serialization/Deserialization Flow**, **Compression Codec Selection Guide**, **Serializer Types**, **AvroGenericRecordSerializer**, **AvroSpecificRecordSerializer**, **AvroReflectSerializer**, and **Compression Codec Support**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-io"))
api(libs.avro)
api(libs.avro.kotlin)
runtimeOnly(libs.snappy.java)
runtimeOnly(libs.lz4.java)
runtimeOnly(libs.zstd.jni)
runtimeOnly(libs.xz)
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
./gradlew :bluetape4k-avro:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractAvroTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/test/kotlin/io/bluetape4k/avro/AbstractAvroTest.kt)
- [`CodecFactorySupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/test/kotlin/io/bluetape4k/avro/CodecFactorySupportTest.kt)
- [`TestMessageProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/test/kotlin/io/bluetape4k/avro/TestMessageProvider.kt)
- [`DefaultAvroGenericRecordSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/test/kotlin/io/bluetape4k/avro/impl/DefaultAvroGenericRecordSerializerTest.kt)
- [`DefaultAvroReflectSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/test/kotlin/io/bluetape4k/avro/impl/DefaultAvroReflectSerializerTest.kt)
- [`DefaultAvroSpecificRecordSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/test/kotlin/io/bluetape4k/avro/impl/DefaultAvroSpecificRecordSerializerTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/build.gradle.kts)
- [`AvroGenericRecordSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/main/kotlin/io/bluetape4k/avro/AvroGenericRecordSerializer.kt)
- [`AvroReflectSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/main/kotlin/io/bluetape4k/avro/AvroReflectSerializer.kt)
- [`AvroSpecificRecordSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/main/kotlin/io/bluetape4k/avro/AvroSpecificRecordSerializer.kt)
- [`CodecFactorySupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/main/kotlin/io/bluetape4k/avro/CodecFactorySupport.kt)
- [`DefaultAvroGenericRecordSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/main/kotlin/io/bluetape4k/avro/impl/DefaultAvroGenericRecordSerializer.kt)
- [`DefaultAvroReflectSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/main/kotlin/io/bluetape4k/avro/impl/DefaultAvroReflectSerializer.kt)
- [`DefaultAvroSpecificRecordSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/main/kotlin/io/bluetape4k/avro/impl/DefaultAvroSpecificRecordSerializer.kt)
- [`AbstractAvroTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/test/kotlin/io/bluetape4k/avro/AbstractAvroTest.kt)
- [`CodecFactorySupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/test/kotlin/io/bluetape4k/avro/CodecFactorySupportTest.kt)
- [`TestMessageProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/test/kotlin/io/bluetape4k/avro/TestMessageProvider.kt)
- [`DefaultAvroGenericRecordSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/test/kotlin/io/bluetape4k/avro/impl/DefaultAvroGenericRecordSerializerTest.kt)
- [`DefaultAvroReflectSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/io/avro/src/test/kotlin/io/bluetape4k/avro/impl/DefaultAvroReflectSerializerTest.kt)
