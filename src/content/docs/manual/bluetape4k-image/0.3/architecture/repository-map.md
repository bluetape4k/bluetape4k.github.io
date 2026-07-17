---
slug: "manual/bluetape4k-image/0.3/architecture/repository-map"
manualId: "repository-map"
title: "Repository Map"
locale: "en"
releaseRef: "0.3.0"
manual:
  id: "architecture/repository-map"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "b6c46eba43a51a4224e0835cc197bf83358bd333"
  sourcePath: "docs/manual/en/architecture/repository-map.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "a571c30004f571fe8cfcddc29670c1404d212ec6"
  sourceDir: "docs/manual"
  layer: "build"
---


The 0.3.0 release contains 15 Gradle projects. Nine are published coordinates, five are runnable examples, and one is a benchmark project. The project directory, Gradle path, and artifact name are intentionally not always the same, so the release registry is the authoritative inventory.

## Platform and foundation

- [Image BOM](/manual/bluetape4k-image/0.3/modules/bluetape4k-image-bom/) aligns the eight image library artifacts.
- [Immutable image processing](/manual/bluetape4k-image/0.3/modules/bluetape4k-images/) is the portable Scrimage/Java2D foundation used by CAPTCHA, OCR, Ktor, Spring Boot, and the libvips API test fixtures.

## Capabilities and frameworks

- [CAPTCHA](/manual/bluetape4k-image/0.3/modules/bluetape4k-images-captcha/) generates challenges and owns verification semantics.
- [OCR](/manual/bluetape4k-image/0.3/modules/bluetape4k-images-ocr/) adapts Tess4J/Tesseract to <code>ImmutableImage</code>.
- [Ktor routes](/manual/bluetape4k-image/0.3/modules/bluetape4k-images-ktor/) expose thumbnail and CAPTCHA routes.
- [Spring Boot](/manual/bluetape4k-image/0.3/modules/bluetape4k-images-spring-boot/) configures storage, CDN, health, and metrics.

## Native processing

- [Vips API](/manual/bluetape4k-image/0.3/modules/bluetape4k-images-vips-api/) defines <code>VipsImage</code>, <code>VipsRuntime</code>, formats, writers, and lifecycle rules.
- [Java 21 JVips](/manual/bluetape4k-image/0.3/modules/bluetape4k-images-vips-java21/) implements that API with JNI.
- [Java 25 FFM](/manual/bluetape4k-image/0.3/modules/bluetape4k-images-vips-java25/) implements it with the Foreign Function and Memory API.

The common API does not select or initialize a backend for the application. Deploy exactly one runtime implementation unless a measured migration requires both.

## Learn and measure

The five workshops cover basic JVM processing, Ktor image/CAPTCHA, Ktor OCR, Spring Boot storage, and Spring Boot OCR. The [benchmark project](/manual/bluetape4k-image/0.3/modules/bluetape4k-images-benchmark/) compares processing and I/O paths but is not a published library.

Start from [the learning path](/manual/bluetape4k-image/0.3/guides/learning-path/) instead of reading the project list alphabetically.

## Source

- [Exact 0.3.0 project registration](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/settings.gradle.kts#L84-L123)
- [Publishing inclusion rules](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/build.gradle.kts#L46-L58)

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `0.3.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### image Architecture diagram

[![image Architecture diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-image/a571c30004f571fe8cfcddc29670c1404d212ec6/docs/images/readme-diagrams/bluetape4k-image-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/docs/images/readme-diagrams/bluetape4k-image-architecture-01.svg)

_Release README: [`README.md`](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/README.md)_

### Bluetape4k Image overview diagram

[![Bluetape4k Image overview diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-image/a571c30004f571fe8cfcddc29670c1404d212ec6/docs/images/readme-diagrams/root-readme-overview-01.png)](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/docs/images/readme-diagrams/root-readme-overview-01.svg)

_Release README: [`README.md`](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/README.md)_

<!-- release-readme-diagrams:end -->
