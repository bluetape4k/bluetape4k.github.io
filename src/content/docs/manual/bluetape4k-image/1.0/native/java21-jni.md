---
slug: "manual/bluetape4k-image/1.0/native/java21-jni"
manualId: "java21-jni"
title: "JDK 25 JVips JNI Backend (legacy java21 artifact)"
locale: "en"
releaseRef: "1.0.0"
manual:
  id: "native/java21-jni"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourcePath: "docs/manual/bluetape4k-image/en/native/java21-jni.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourceDir: "docs/manual/bluetape4k-image"
  layer: "build"
---


<code>bluetape4k-images-vips-java21</code> implements the common Vips contracts with JVips/JNI. The artifact and package names remain <code>java21</code> for compatibility; this release line requires JDK 25.

## Runtime requirements

Install libvips on the target host and make its shared libraries visible to the JVM. Linux and macOS packaging differ; run a startup probe on the same image used for production. The module compiles and tests with a JDK 25 toolchain.

## Programming model

Initialize <code>JVipsRuntime</code>, load an image, close every <code>JVipsImage</code>, and shut the runtime down after workers drain. The module implements loading from paths, bytes and Okio sources, resize, thumbnail, crop, and JPEG/PNG/WebP/AVIF writers supported by the installed native stack.

The common API should remain the application-facing type. Keep <code>JVipsImage</code> and JVips binding details inside the backend adapter.

## Testing and failure

The release build isolates native tests with <code>forkEvery = 1</code> and <code>maxParallelForks = 1</code>. Preserve this because JNI and native global state can survive between tests. A missing library, unsupported codec, excessive pixel count, or use after runtime shutdown should fail explicitly.

Compare with [JDK 25 FFM](/manual/bluetape4k-image/1.0/native/java25-ffm/) only on equivalent hosts and fixtures.

## Sources

- [JVipsRuntime](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/images-vips-java21/src/main/kotlin/io/bluetape4k/images/vips/java21/JVipsRuntime.kt)
- [JDK 25 module configuration for the legacy java21 module](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/images-vips-java21/build.gradle.kts)
