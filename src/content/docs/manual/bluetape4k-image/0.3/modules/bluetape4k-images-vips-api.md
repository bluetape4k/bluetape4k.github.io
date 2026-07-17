---
slug: "manual/bluetape4k-image/0.3/modules/bluetape4k-images-vips-api"
manualId: "bluetape4k-images-vips-api"
id: "bluetape4k-images-vips-api"
title: "libvips common API"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-images-vips-api"
sourceDir: "images-vips-api"
releaseRef: "0.3.0"
artifact: io.github.bluetape4k.image:bluetape4k-images-vips-api
manual:
  id: "bluetape4k-images-vips-api"
  repository: "bluetape4k-image"
  group: "native"
  kind: "library"
  sourceCommit: "b6c46eba43a51a4224e0835cc197bf83358bd333"
  sourcePath: "docs/manual/en/modules/bluetape4k-images-vips-api.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "a571c30004f571fe8cfcddc29670c1404d212ec6"
  sourceDir: "images-vips-api"
  layer: "build"
---


> Library module

## Problem

This module is the binding-neutral contract for libvips processing. Applications can compile against `VipsImage` and `VipsRuntime`, then select the Java 21 JNI or Java 25 FFM backend without exposing binding classes in domain code.

## When to use it

Use it for high-throughput resize, thumbnail, crop, and encode pipelines that can accept a native runtime. Keep using Scrimage when Java2D drawing, the rich filter DSL, or a native-free deployment is more important.

## Coordinates

Maven coordinate: `io.github.bluetape4k.image:bluetape4k-images-vips-api`

Add this API plus exactly one runtime backend through the centrally versioned platform.

## Core concepts

`VipsImage` owns native resources and is single-thread oriented. Every transform returns another closeable image. `VipsRuntime` manages process-wide libvips initialization and a terminal shutdown. `VipsEncodeOptions` standardizes quality, effort, lossless mode, and metadata stripping.

## Quick start

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.image:bluetape4k-images-vips-api")
    runtimeOnly("io.github.bluetape4k.image:bluetape4k-images-vips-java25")
}
```

Backend factories create the concrete image; always scope it with `use` and close transformed results as required by that backend's ownership model.

## API by task

- Inspect `width`, `height`, and `bands`.
- Transform with `resize`, `thumbnail`, or `crop`.
- Encode with `toBytes` or `writeTo(Path|OutputStream)`.
- Use Okio and coroutine write extensions for an existing source/sink boundary.
- Initialize with `VipsRuntime.init(concurrency, maxPixels)` and inspect `isInitialized`/`isShutdown`.

## Recommended patterns

Initialize once near process startup and register shutdown only with a JVM shutdown hook. Never place `shutdown()` in a Spring `@PreDestroy` hook when devtools can restart the context. Do not share a `VipsImage` instance across concurrent coroutines.

## Integrations

`images-vips-java21` and `images-vips-java25` implement this API. The API module also exports golden-test fixtures for backend parity and depends on `bluetape4k-images` for the incubating annotation/test comparison surface.

## Configuration

`VipsLimits` caps compressed input at 50 MiB and defaults runtime validation to 150,000,000 `width × height × bands`. `init` defaults to four libvips threads. `VipsEncodeOptions` accepts quality 0..100 and effort 1..9; default is 85/4 with metadata stripping.

## Failure modes

Use `VipsDecodeException`, `VipsEncodeException`, `VipsOperationException`, and `VipsInitializationException` to separate stages. Messages are sanitized; native errors remain in the cause. Calling `init` after terminal shutdown requires a process restart.

## Operations

Monitor decode rejection by category, native initialization, operation/encode latency, and process native memory. Managed-heap benchmarks do not measure libvips allocations. Validate output paths before `writeTo`; the API does not provide a storage-root traversal guard.

## Testing

The API tests cover option validation and Okio ownership. Backend golden, property, writer, and concurrency tests live in each implementation module. Run native suites sequentially on a host with matching libvips support.

## Workshops and learning path

Read the API first, then the lifecycle guide for the chosen backend, then compare benchmark evidence. The Java 21 and Java 25 factories have deliberately different names, making backend selection visible at composition time.

## Limitations

The common API does not discover or instantiate a backend. AVIF/HEIC support depends on both the implementation and host libvips codecs. `shutdown()` is irreversible, and transformed image ownership differs between JNI and FFM—read the backend page before composing nested `use` blocks.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `0.3.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### Processing Pipeline diagram

[![Processing Pipeline diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-image/a571c30004f571fe8cfcddc29670c1404d212ec6/docs/images/readme-diagrams/images-vips-api-architecture-02.png)](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/docs/images/readme-diagrams/images-vips-api-architecture-02.svg)

_Release README: [`images-vips-api/README.md`](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/images-vips-api/README.md)_

### images vips api Class Structure diagram

[![images vips api Class Structure diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-image/a571c30004f571fe8cfcddc29670c1404d212ec6/docs/images/readme-diagrams/images-vips-api-class-01.png)](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/docs/images/readme-diagrams/images-vips-api-class-01.svg)

_Release README: [`images-vips-api/README.md`](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/images-vips-api/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [VipsImage contract](https://github.com/bluetape4k/bluetape4k-image/blob/0.3.0/images-vips-api/src/main/kotlin/io/bluetape4k/images/vips/VipsImage.kt)
- [Runtime terminal contract](https://github.com/bluetape4k/bluetape4k-image/blob/0.3.0/images-vips-api/src/main/kotlin/io/bluetape4k/images/vips/VipsRuntime.kt)
- [Limits](https://github.com/bluetape4k/bluetape4k-image/blob/0.3.0/images-vips-api/src/main/kotlin/io/bluetape4k/images/vips/VipsLimits.kt)
- [Exception policy](https://github.com/bluetape4k/bluetape4k-image/blob/0.3.0/images-vips-api/src/main/kotlin/io/bluetape4k/images/vips/VipsExceptions.kt)
