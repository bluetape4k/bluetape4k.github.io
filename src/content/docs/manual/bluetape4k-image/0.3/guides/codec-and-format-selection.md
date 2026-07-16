---
slug: "manual/bluetape4k-image/0.3/guides/codec-and-format-selection"
manualId: "codec-and-format-selection"
title: "Codec and Format Selection"
locale: "en"
releaseRef: "0.3.0"
manual:
  id: "guides/codec-and-format-selection"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "471a5f364520923911dc31d91be5179a6985337e"
  sourcePath: "docs/manual/en/guides/codec-and-format-selection.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "a571c30004f571fe8cfcddc29670c1404d212ec6"
  sourceDir: "docs/manual"
  layer: "build"
---


Separate three questions: can the API name a format, can the selected backend encode or decode it, and does the target host provide the required codec? Treating them as one question creates deployment-only failures.

## Portable JVM path

[Immutable image processing](/manual/bluetape4k-image/0.3/modules/bluetape4k-images/) uses Scrimage and ImageIO providers. JPEG and PNG are the safest general-purpose paths. TwelveMonkeys dependencies extend TIFF and metadata handling. WebP writing uses the Scrimage WebP integration. SVG is rasterized through optional Batik dependencies, so the application must add Batik when it accepts SVG input.

Animated GIF-to-WebP, TIFF, and SVG deserve explicit fixture tests. Metadata, animation, transparency, and color behavior can differ even when decoding succeeds.

## libvips path

The common [Vips API](/manual/bluetape4k-image/0.3/native/vips-api/) exposes image formats and encoding options, while the Java 21 and Java 25 implementations delegate capability to their native binding and installed libvips. AVIF and HEIC are incubating paths. Verify the target machine with real encode and decode fixtures; do not infer support from a developer laptop.

## Selection rules

- JPEG: photographs where lossy size reduction is acceptable.
- PNG: lossless output, alpha, diagrams, and exact visual fixtures.
- WebP: use after browser/client and encoder behavior are verified.
- TIFF: document and archival input; test multipage and metadata requirements separately.
- SVG: untrusted XML input needs strict size and external-resource policy before rasterization.
- AVIF/HEIC: deploy only after native codec verification and fallback design.

Record accepted input formats separately from generated output formats. A service rarely needs to accept every format it can produce.

## Sources

- [Release image dependencies](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/images/build.gradle.kts)
- [Vips image format contract](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/images-vips-api/src/main/kotlin/io/bluetape4k/images/vips/VipsImageFormat.kt)
