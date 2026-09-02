---
slug: "manual/bluetape4k-image/1.0/architecture/runtime-boundaries"
manualId: "runtime-boundaries"
title: "Runtime Boundaries"
locale: "en"
releaseRef: "1.0.0"
manual:
  id: "architecture/runtime-boundaries"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourcePath: "docs/manual/bluetape4k-image/en/architecture/runtime-boundaries.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourceDir: "docs/manual/bluetape4k-image"
  layer: "build"
---


Image processing crosses heap, file, network, and native-memory boundaries. A successful API call does not prove that these resources are owned correctly.

![Resource ownership across decode, transform, encode, and native processing](/manual-assets/bluetape4k-image/1.0/architecture/processing-lifecycle.svg)

## JVM image boundary

<code>ImmutableImage</code> operations return new values. Input streams, Okio sources, temporary files, and output sinks still belong to the caller unless the selected helper explicitly documents closure. Bound image dimensions and encoded input size before allocating full pixel buffers.

## Native libvips boundary

<code>VipsImage</code> implements <code>AutoCloseable</code>. Every loaded image and derived native image must be closed, normally with <code>use</code>. Initialize the selected <code>VipsRuntime</code> once per process and shut it down only after all images and workers have finished.

The JVips JNI implementation (published under the legacy <code>java21</code> module name) requires JDK 25, JVips/JNI, and a visible system libvips installation. The FFM implementation also requires JDK 25, system libvips, and <code>--enable-native-access=ALL-UNNAMED</code>. See [native resource lifecycle](/manual/bluetape4k-image/1.0/guides/native-resource-lifecycle/).

## OCR boundary

OCR uses Tess4J and host Tesseract. The process needs the native engine and requested traineddata files. A language identifier in <code>OcrOptions</code> is not enough if the matching data is absent. The default engine creates a Tesseract instance per call, avoiding shared mutable native state, but the application still owns concurrency limits and request timeouts.

## Framework and storage boundary

Ktor route helpers do not install the application's JSON or error handling policy. Spring Boot auto-configuration creates storage, health, metrics, and optional CDN components according to configuration, but the application owns credentials, filesystem permissions, S3 bucket policy, CloudFront keys, upload limits, and shutdown order.

## Operational questions

For every path, document:

1. who opens and closes each resource;
2. which limits apply before decoding;
3. which native packages and data files the deployment supplies;
4. how cancellation, partial writes, and shutdown are tested.

## Sources

- [VipsImage lifecycle contract](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/images-vips-api/src/main/kotlin/io/bluetape4k/images/vips/VipsImage.kt)
- [OCR engine implementation](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/images-ocr/src/main/kotlin/io/bluetape4k/images/ocr/TesseractOcrEngine.kt)
