---
slug: "manual/bluetape4k-image/0.3/guides/native-resource-lifecycle"
manualId: "native-resource-lifecycle"
title: "Native Resource Lifecycle"
locale: "en"
releaseRef: "0.3.0"
manual:
  id: "guides/native-resource-lifecycle"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "4f32b77dff190acb79534b67b34f9056843ebeeb"
  sourcePath: "docs/manual/en/guides/native-resource-lifecycle.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "a571c30004f571fe8cfcddc29670c1404d212ec6"
  sourceDir: "docs/manual"
  layer: "build"
---


libvips images are not ordinary garbage-collected values. Each <code>VipsImage</code> owns native state and implements <code>AutoCloseable</code>.

## Scope every derived image

Loading, resizing, cropping, and other operations can each produce a new native image. Close the source and every result:

    runtime.load(path).use { source ->
        source.resize(640, 480).use { resized ->
            resized.writeTo(output)
        }
    }

Do not return a <code>VipsImage</code> from a scope that already closed it. For application APIs, prefer returning encoded bytes, a file result, or a caller-owned closeable with explicit ownership.

## Initialize once, shut down last

Initialize either <code>JVipsRuntime</code> or <code>FfmVipsRuntime</code> during application startup. Shutdown is process-wide: no request, worker, or writer may still use libvips afterward. Framework destruction order must stop traffic and workers before shutting down the runtime.

## Isolate native tests

The release config runs JNI and FFM tests with one test class per fork and one parallel fork. Preserve this isolation when adding CI jobs. Native failure can poison process state, and two backends can compete for the same global library.

## Cancellation and partial output

Coroutine cancellation does not remove the need for <code>use</code>. Close in structured scopes and write final output atomically when partial files are unsafe. Bound input bytes and pixels before entering native decode.

## Sources

- [VipsImage contract](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/images-vips-api/src/main/kotlin/io/bluetape4k/images/vips/VipsImage.kt)
- [Java 21 native test isolation](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/images-vips-java21/build.gradle.kts)
- [Java 25 native test isolation](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/images-vips-java25/build.gradle.kts)
