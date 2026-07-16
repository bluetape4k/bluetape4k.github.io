---
slug: "manual/bluetape4k-image/0.3/native/java21-jni"
manualId: "java21-jni"
title: "Java 21 JVips Backend"
locale: "en"
releaseRef: "0.3.0"
manual:
  id: "native/java21-jni"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "471a5f364520923911dc31d91be5179a6985337e"
  sourcePath: "docs/manual/en/native/java21-jni.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "a571c30004f571fe8cfcddc29670c1404d212ec6"
  sourceDir: "docs/manual"
  layer: "build"
---


<code>bluetape4k-images-vips-java21</code> implements the common Vips contracts with JVips/JNI. Choose it when the application must run on JDK 21 and can supply system libvips.

## Runtime requirements

Install libvips on the target host and make its shared libraries visible to the JVM. Linux and macOS packaging differ; run a startup probe on the same image used for production. The module compiles and tests with a Java 21 toolchain.

## Programming model

Initialize <code>JVipsRuntime</code>, load an image, close every <code>JVipsImage</code>, and shut the runtime down after workers drain. The module implements loading from paths, bytes and Okio sources, resize, thumbnail, crop, and JPEG/PNG/WebP/AVIF writers supported by the installed native stack.

The common API should remain the application-facing type. Keep <code>JVipsImage</code> and JVips binding details inside the backend adapter.

## Testing and failure

The release build isolates native tests with <code>forkEvery = 1</code> and <code>maxParallelForks = 1</code>. Preserve this because JNI and native global state can survive between tests. A missing library, unsupported codec, excessive pixel count, or use after runtime shutdown should fail explicitly.

Compare with [Java 25 FFM](/manual/bluetape4k-image/0.3/native/java25-ffm/) only on equivalent hosts and fixtures.

## Sources

- [JVipsRuntime](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/images-vips-java21/src/main/kotlin/io/bluetape4k/images/vips/java21/JVipsRuntime.kt)
- [Java 21 module configuration](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/images-vips-java21/build.gradle.kts)
