---
slug: "manual/bluetape4k-image/1.0/getting-started"
manualId: "getting-started"
title: "Getting Started"
locale: "en"
releaseRef: "1.0.0"
manual:
  id: "getting-started"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourcePath: "docs/manual/bluetape4k-image/en/getting-started.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourceDir: "docs/manual/bluetape4k-image"
  layer: "build"
---


Begin with the smallest dependency and runtime that can complete one image task. Do not add every backend: Scrimage and libvips solve overlapping problems but have different deployment and ownership costs.

## 1. Import the central BOM

Choose the released <code>bluetape4k-dependencies</code> version used by the rest of the application.

    dependencies {
        implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
        implementation("io.github.bluetape4k.image:bluetape4k-images")
    }

The repository also publishes <code>bluetape4k-image-bom</code>, but normal ecosystem consumers should use the central BOM so Kotlin, coroutines, framework, and sibling Bluetape libraries remain aligned. See the [Image BOM reference](/manual/bluetape4k-image/1.0/modules/bluetape4k-image-bom/) when maintaining a narrower standalone dependency graph.

## 2. Pick one execution path

- Choose [immutable image processing](/manual/bluetape4k-image/1.0/modules/bluetape4k-images/) for portable JVM loading, writing, filters, transforms, and analysis.
- Add [CAPTCHA](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-captcha/), [OCR](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-ocr/), [Ktor](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-ktor/), or [Spring Boot](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-spring-boot/) only when the application uses that capability.
- Choose [JDK 25 JVips JNI](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-vips-java21/) when the service can install libvips; the published JNI artifact keeps the legacy `java21` name.
- Choose [JDK 25 FFM](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-vips-java25/) when native-access flags are acceptable.

Use [Backend selection](/manual/bluetape4k-image/1.0/guides/backend-selection/) for a fuller comparison.

## 3. Run a workshop

The [basic processing workshop](/manual/bluetape4k-image/1.0/modules/basic-processing/) is the shortest portable path. Framework applications can continue with the [Ktor image API](/manual/bluetape4k-image/1.0/modules/ktor-image-api/) or [Spring Boot image API](/manual/bluetape4k-image/1.0/modules/spring-boot-image-api/). OCR has separate [Ktor](/manual/bluetape4k-image/1.0/modules/ktor-ocr-api/) and [Spring Boot](/manual/bluetape4k-image/1.0/modules/spring-boot-ocr-api/) workshops because host Tesseract setup is part of the exercise.

## 4. Verify the real boundary

Run the target module test, not only the root compile:

    ./gradlew :bluetape4k-images:test

Native and OCR checks require host software and must run sequentially. Read [OCR setup](/manual/bluetape4k-image/1.0/guides/ocr-setup/) and [native resource lifecycle](/manual/bluetape4k-image/1.0/guides/native-resource-lifecycle/) before enabling them.

## Sources

- [Release build configuration](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/build.gradle.kts)
- [Release dependency examples](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/README.md#installation)
