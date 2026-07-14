---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-okio"
manualId: bluetape4k-okio
title: "Module bluetape4k-okio"
description: "bluetape4k-okio is a high-performance I/O extension module built on Square's Okio library."
kind: library
group: io
manual:
  id: "bluetape4k-okio"
  repository: "bluetape4k-projects"
  group: "io"
  kind: "library"
  sourceCommit: "0ecae4a1b0b25e9654cd631b437ef81215d81974"
  sourcePath: "docs/manual/en/modules/bluetape4k-okio.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "io/okio"
  layer: "build"
---


## Problem

bluetape4k-okio is a high-performance I/O extension module built on Square's Okio library. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-okio` when the application needs encoding boundaries, resource ownership, streaming, compatibility, and malformed input. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-okio")
}
```

Gradle project path: `:bluetape4k-okio`. Source directory: `io/okio`.

## Concepts

The first source-level concepts to inspect are `BufferSupport`, `BufferedSourceExtensions`, `ByteStringSupport`, `InputStreamSource`, `OkioConsts`, `OutputStreamSink`, `SinkSupport`, and `SourceSupport`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`BufferSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/BufferSupport.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`BufferSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/BufferSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`BufferedSourceExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/BufferedSourceExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ByteStringSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/ByteStringSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`InputStreamSource`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/InputStreamSource.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`OkioConsts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/OkioConsts.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`OutputStreamSink`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/OutputStreamSink.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`SinkSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/SinkSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`SourceSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/SourceSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TimeoutSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/TimeoutSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AbstractBase64Sink`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/base64/AbstractBase64Sink.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Overview**, **Why Okio**, **Sequence Diagrams**, **Compression Sink (One-Shot) — compress on close**, **Compression Sink (Streaming) — compress incrementally**, **Decompression Source (One-Shot) — decompress on first read**, **Tink Encryption + Compression Combined Flow**, **Coroutines Async File I/O Flow**, **Recommended Usage Scenarios**, and **Anti-Patterns**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-core"))
api(project(":bluetape4k-io"))
compileOnly(project(":bluetape4k-tink"))
api(libs.okio)
compileOnly(libs.commons.codec)
compileOnly(project(":bluetape4k-coroutines"))
compileOnly(libs.kotlinx.coroutines.core)
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
./gradlew :bluetape4k-okio:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractOkioTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/test/kotlin/io/bluetape4k/okio/AbstractOkioTest.kt)
- [`BufferCursorKotlinTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/test/kotlin/io/bluetape4k/okio/BufferCursorKotlinTest.kt)
- [`BufferCursorTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/test/kotlin/io/bluetape4k/okio/BufferCursorTest.kt)
- [`BufferFactory`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/test/kotlin/io/bluetape4k/okio/BufferFactory.kt)
- [`BufferKotlinTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/test/kotlin/io/bluetape4k/okio/BufferKotlinTest.kt)
- [`BufferSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/test/kotlin/io/bluetape4k/okio/BufferSupportTest.kt)
- [`BufferTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/test/kotlin/io/bluetape4k/okio/BufferTest.kt)
- [`BufferedSinkTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/test/kotlin/io/bluetape4k/okio/BufferedSinkTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/build.gradle.kts)
- [`BufferSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/BufferSupport.kt)
- [`BufferedSourceExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/BufferedSourceExtensions.kt)
- [`ByteStringSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/ByteStringSupport.kt)
- [`InputStreamSource`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/InputStreamSource.kt)
- [`OkioConsts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/OkioConsts.kt)
- [`OutputStreamSink`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/OutputStreamSink.kt)
- [`SinkSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/SinkSupport.kt)
- [`SourceSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/SourceSupport.kt)
- [`TimeoutSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/TimeoutSupport.kt)
- [`AbstractBase64Sink`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/main/kotlin/io/bluetape4k/okio/base64/AbstractBase64Sink.kt)
- [`AbstractOkioTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/test/kotlin/io/bluetape4k/okio/AbstractOkioTest.kt)
- [`BufferCursorKotlinTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/okio/src/test/kotlin/io/bluetape4k/okio/BufferCursorKotlinTest.kt)
