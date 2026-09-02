---
manualId: "native-resource-lifecycle"
title: "Native Resource Lifecycle"
locale: "en"
releaseRef: "1.0.0"
---

# Native Resource Lifecycle

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

- [VipsImage contract](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/images-vips-api/src/main/kotlin/io/bluetape4k/images/vips/VipsImage.kt)
- [JDK 25 JVips native test isolation (legacy java21 module)](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/images-vips-java21/build.gradle.kts)
- [JDK 25 FFM native test isolation](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/images-vips-java25/build.gradle.kts)
