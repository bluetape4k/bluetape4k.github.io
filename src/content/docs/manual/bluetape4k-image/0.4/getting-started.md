---
slug: "manual/bluetape4k-image/0.4/getting-started"
manualId: "getting-started"
title: "Getting Started"
locale: "en"
releaseRef: "0.4.0"
manual:
  id: "getting-started"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "e56fea655ad3168527b5f663d114df722ad55d3f"
  sourcePath: "docs/manual/en/getting-started.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "ea5175b083babf8880f53cf80c9a264a0c61777e"
  sourceDir: "docs/manual"
  layer: "build"
---


Begin with the smallest dependency and runtime that can complete one image task. Do not add every backend: Scrimage and libvips solve overlapping problems but have different deployment and ownership costs.

## 1. Import the central BOM

Choose the released <code>bluetape4k-dependencies</code> version used by the rest of the application.

    dependencies {
        implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
        implementation("io.github.bluetape4k.image:bluetape4k-images")
    }

The repository also publishes <code>bluetape4k-image-bom</code>, but normal ecosystem consumers should use the central BOM so Kotlin, coroutines, framework, and sibling Bluetape libraries remain aligned. See the [Image BOM reference](/manual/bluetape4k-image/0.4/modules/bluetape4k-image-bom/) when maintaining a narrower standalone dependency graph.

## 2. Pick one execution path

- Choose [immutable image processing](/manual/bluetape4k-image/0.4/modules/bluetape4k-images/) for portable JVM loading, writing, filters, transforms, and analysis.
- Add [CAPTCHA](/manual/bluetape4k-image/0.4/modules/bluetape4k-images-captcha/), [OCR](/manual/bluetape4k-image/0.4/modules/bluetape4k-images-ocr/), [Ktor](/manual/bluetape4k-image/0.4/modules/bluetape4k-images-ktor/), or [Spring Boot](/manual/bluetape4k-image/0.4/modules/bluetape4k-images-spring-boot/) only when the application uses that capability.
- Choose [Java 21 JVips](/manual/bluetape4k-image/0.4/modules/bluetape4k-images-vips-java21/) when the service already runs JDK 21 and can install libvips.
- Choose [Java 25 FFM](/manual/bluetape4k-image/0.4/modules/bluetape4k-images-vips-java25/) when JDK 25 and native-access flags are acceptable.

Use [Backend selection](/manual/bluetape4k-image/0.4/guides/backend-selection/) for a fuller comparison.

## 3. Run a workshop

The [basic processing workshop](/manual/bluetape4k-image/0.4/modules/basic-processing/) is the shortest portable path. Framework applications can continue with the [Ktor image API](/manual/bluetape4k-image/0.4/modules/ktor-image-api/) or [Spring Boot image API](/manual/bluetape4k-image/0.4/modules/spring-boot-image-api/). OCR has separate [Ktor](/manual/bluetape4k-image/0.4/modules/ktor-ocr-api/) and [Spring Boot](/manual/bluetape4k-image/0.4/modules/spring-boot-ocr-api/) workshops because host Tesseract setup is part of the exercise.

## 4. Verify the real boundary

Run the target module test, not only the root compile:

    ./gradlew :bluetape4k-images:test

Native and OCR checks require host software and must run sequentially. Read [OCR setup](/manual/bluetape4k-image/0.4/guides/ocr-setup/) and [native resource lifecycle](/manual/bluetape4k-image/0.4/guides/native-resource-lifecycle/) before enabling them.

## Sources

- [Release build configuration](https://github.com/bluetape4k/bluetape4k-image/blob/ea5175b083babf8880f53cf80c9a264a0c61777e/build.gradle.kts)
- [Release dependency examples](https://github.com/bluetape4k/bluetape4k-image/blob/ea5175b083babf8880f53cf80c9a264a0c61777e/README.md#installation)
