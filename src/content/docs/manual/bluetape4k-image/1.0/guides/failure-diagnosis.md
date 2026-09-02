---
slug: "manual/bluetape4k-image/1.0/guides/failure-diagnosis"
manualId: "failure-diagnosis"
title: "Failure Diagnosis"
locale: "en"
releaseRef: "1.0.0"
manual:
  id: "guides/failure-diagnosis"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourcePath: "docs/manual/bluetape4k-image/en/guides/failure-diagnosis.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourceDir: "docs/manual/bluetape4k-image"
  layer: "build"
---


Classify failures by boundary before changing image code.

## Decode and format failures

Confirm input bytes, content type, dimensions, and the selected backend. An extension is not proof of the encoded format. For SVG, TIFF, WebP, AVIF, and HEIC, verify that the required JVM or native codec is present. Reproduce with the smallest fixture and the exact release backend.

## Native startup failures

<code>UnsatisfiedLinkError</code> or a missing-library message usually means libvips is absent or not visible to the process. Check package installation and dynamic-library search paths. Java 25 FFM also requires <code>--enable-native-access=ALL-UNNAMED</code>. Do not hide startup failure by silently switching backend unless fallback semantics are explicitly designed.

## OCR failures

“Error opening data file” points to missing traineddata or an incorrect data path. Verify <code>tesseract --list-langs</code>, requested language values, and process permissions. Distinguish empty recognized text from engine initialization failure.

## Storage and route failures

For local storage, check root path, traversal protection, directory permissions, and partial files. For S3 or CloudFront, check region, credentials, bucket/key policy, signing key, and clock. For Ktor, verify that JSON, error handling, authentication, and request limits are installed by the application.

## Resource and shutdown failures

Growing native memory usually means a derived <code>VipsImage</code> was not closed or concurrency is unbounded. Failures after shutdown indicate runtime termination happened before workers drained.

Capture the failing input safely, backend, codec, dimensions, elapsed time, exception type, host package versions, and release commit. Avoid logging image contents or credentials.

## Sources

- [Release troubleshooting guide](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/README.md#troubleshooting-libvips-startup)
- [Storage exception hierarchy](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/images-spring-boot/src/main/kotlin/io/bluetape4k/images/spring/ImageStorageException.kt)
