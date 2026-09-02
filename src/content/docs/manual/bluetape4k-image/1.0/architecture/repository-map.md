---
slug: "manual/bluetape4k-image/1.0/architecture/repository-map"
manualId: "repository-map"
title: "Repository Map"
locale: "en"
releaseRef: "1.0.0"
manual:
  id: "architecture/repository-map"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourcePath: "docs/manual/bluetape4k-image/en/architecture/repository-map.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourceDir: "docs/manual/bluetape4k-image"
  layer: "build"
---


The 1.0.0 release contains 19 Gradle projects. Ten are published library coordinates, one is the published image BOM, seven are runnable examples, and one is a benchmark project. The project directory, Gradle path, and artifact name are intentionally not always the same, so the release registry is the authoritative inventory.

## Platform and foundation

- [Image BOM](/manual/bluetape4k-image/1.0/modules/bluetape4k-image-bom/) aligns the ten image library artifacts.
- [Immutable image processing](/manual/bluetape4k-image/1.0/modules/bluetape4k-images/) is the portable Scrimage/Java2D foundation used by CAPTCHA, OCR, Ktor, Spring Boot, and the libvips API test fixtures.

## Capabilities and frameworks

- [CAPTCHA](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-captcha/) generates challenges and owns verification semantics.
- [OCR](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-ocr/) adapts Tess4J/Tesseract to <code>ImmutableImage</code>.
- [Ktor routes](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-ktor/) expose thumbnail and CAPTCHA routes.
- [Spring Boot](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-spring-boot/) configures storage, CDN, health, and metrics.

## Native processing

- [Vips API](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-vips-api/) defines <code>VipsImage</code>, <code>VipsRuntime</code>, formats, writers, and lifecycle rules.
- [JDK 25 JVips JNI](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-vips-java21/) implements that API with JNI; the published module keeps the legacy `java21` name.
- [JDK 25 FFM](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-vips-java25/) implements it with the Foreign Function and Memory API.

The common API does not select or initialize a backend for the application. Deploy exactly one runtime implementation unless a measured migration requires both.

## Learn and measure

The seven workshops cover basic JVM processing, Ktor image/CAPTCHA, Ktor OCR, Spring Boot barcode, image storage, image intelligence, and Spring Boot OCR. The [benchmark project](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-benchmark/) compares processing and I/O paths but is not a published library.

Start from [the learning path](/manual/bluetape4k-image/1.0/guides/learning-path/) instead of reading the project list alphabetically.

## Source

- [Exact 1.0.0 project registration](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/settings.gradle.kts#L84-L123)
- [Publishing inclusion rules](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/build.gradle.kts#L46-L58)

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `1.0.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### image Architecture diagram

[![image Architecture diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-image/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/bluetape4k-image-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/bluetape4k-image-architecture-01.svg)

_Release README: [`README.md`](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/README.md)_

### Bluetape4k Image overview diagram

[![Bluetape4k Image overview diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-image/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/root-readme-overview-01.png)](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/root-readme-overview-01.svg)

_Release README: [`README.md`](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/README.md)_

<!-- release-readme-diagrams:end -->
