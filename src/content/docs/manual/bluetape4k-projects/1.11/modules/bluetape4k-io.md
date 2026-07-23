---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-io"
manualId: bluetape4k-io
title: "Kotlin I/O Utilities"
description: "bluetape4k-io is a high-performance I/O utility library for Kotlin. It provides simple and efficient tools for file handling, compression, serialization, async I/O, and more."
kind: library
group: io
learningOrder: 300
manual:
  id: "bluetape4k-io"
  repository: "bluetape4k-projects"
  group: "io"
  kind: "library"
  sourceCommit: "3a97a3fc2f3525c3a3384d511a9adb8571b0b680"
  sourcePath: "docs/manual/en/modules/bluetape4k-io.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "io/io"
  layer: "build"
  learningOrder: 300
---


## Problem

bluetape4k-io is a high-performance I/O utility library for Kotlin. It provides simple and efficient tools for file handling, compression, serialization, async I/O, and more. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-io` when the application needs encoding boundaries, resource ownership, streaming, compatibility, and malformed input. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-io")
}
```

Gradle project path: `:bluetape4k-io`. Source directory: `io/io`.

## Concepts

The first source-level concepts to inspect are `BOMSupport`, `ByteBufferExtensions`, `ByteBufferInputStream`, `ByteBufferOutputStream`, `FileCoroutineSupport`, `FileSupport`, `FileSupportResult`, and `FlushableSupport`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`BOMSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/BOMSupport.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`BOMSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/BOMSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ByteBufferExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/ByteBufferExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ByteBufferInputStream`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/ByteBufferInputStream.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ByteBufferOutputStream`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/ByteBufferOutputStream.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`FileCoroutineSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/FileCoroutineSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`FileSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/FileSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`FileSupportResult`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/FileSupportResult.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`FlushableSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/FlushableSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HexDumpSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/HexDumpSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`InputStreamSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/InputStreamSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Overview**, **Architecture**, **Compressor Hierarchy**, **BinarySerializer Hierarchy**, **compress/decompress Flow**, **serialize/deserialize Flow**, **Key Features**, **1. Compression (Compressor)**, **2. Serialization (BinarySerializer)**, and **3. File Utilities (FileSupport)**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-core"))
compileOnly(project(":bluetape4k-tink"))
compileOnly(libs.commons.io)
compileOnly(libs.commons.lang3)
compileOnly(libs.commons.codec)
compileOnly(libs.commons.compress)
api(libs.okio)
compileOnly(project(":bluetape4k-coroutines"))
compileOnly(libs.kotlinx.coroutines.core)
compileOnly(libs.reactor.core)
compileOnly(libs.reactor.kotlin.extensions)
compileOnly(libs.eclipse.collections)
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
./gradlew :bluetape4k-io:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractIOTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/test/kotlin/io/bluetape4k/io/AbstractIOTest.kt)
- [`BOMSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/test/kotlin/io/bluetape4k/io/BOMSupportTest.kt)
- [`ByteBufferExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/test/kotlin/io/bluetape4k/io/ByteBufferExtensionsTest.kt)
- [`ByteBufferStreamTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/test/kotlin/io/bluetape4k/io/ByteBufferStreamTest.kt)
- [`FileCoroutinesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/test/kotlin/io/bluetape4k/io/FileCoroutinesTest.kt)
- [`FileSupportResultTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/test/kotlin/io/bluetape4k/io/FileSupportResultTest.kt)
- [`FileSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/test/kotlin/io/bluetape4k/io/FileSupportTest.kt)
- [`HexDumpSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/test/kotlin/io/bluetape4k/io/HexDumpSupportTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `1.11.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### Compressor Hierarchy diagram

[![Compressor Hierarchy diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-projects/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/io-io-diagram-01.png)](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/io-io-diagram-01.svg)

_Release README: [`io/io/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/io/io/README.md)_

### BinarySerializer Hierarchy diagram

[![BinarySerializer Hierarchy diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-projects/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/io-io-diagram-02.png)](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/io-io-diagram-02.svg)

_Release README: [`io/io/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/io/io/README.md)_

### compress/decompress Flow diagram

[![compress/decompress Flow diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-projects/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/io-io-sequence-01.png)](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/io-io-sequence-01.svg)

_Release README: [`io/io/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/io/io/README.md)_

### serialize/deserialize Flow diagram

[![serialize/deserialize Flow diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-projects/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/io-io-sequence-02.png)](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/io-io-sequence-02.svg)

_Release README: [`io/io/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/io/io/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/build.gradle.kts)
- [`BOMSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/BOMSupport.kt)
- [`ByteBufferExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/ByteBufferExtensions.kt)
- [`ByteBufferInputStream`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/ByteBufferInputStream.kt)
- [`ByteBufferOutputStream`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/ByteBufferOutputStream.kt)
- [`FileCoroutineSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/FileCoroutineSupport.kt)
- [`FileSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/FileSupport.kt)
- [`FileSupportResult`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/FileSupportResult.kt)
- [`FlushableSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/FlushableSupport.kt)
- [`HexDumpSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/HexDumpSupport.kt)
- [`InputStreamSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/main/kotlin/io/bluetape4k/io/InputStreamSupport.kt)
- [`AbstractIOTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/test/kotlin/io/bluetape4k/io/AbstractIOTest.kt)
- [`BOMSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/io/src/test/kotlin/io/bluetape4k/io/BOMSupportTest.kt)
