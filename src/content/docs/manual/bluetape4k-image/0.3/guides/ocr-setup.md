---
slug: "manual/bluetape4k-image/0.3/guides/ocr-setup"
manualId: "ocr-setup"
title: "OCR Setup"
locale: "en"
releaseRef: "0.3.0"
manual:
  id: "guides/ocr-setup"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "471a5f364520923911dc31d91be5179a6985337e"
  sourcePath: "docs/manual/en/guides/ocr-setup.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "a571c30004f571fe8cfcddc29670c1404d212ec6"
  sourceDir: "docs/manual"
  layer: "build"
---


The OCR module adapts Tess4J/Tesseract to <code>ImmutableImage</code>. Adding the Maven artifact supplies Java integration, not the native engine or language data.

## Install the host engine

On macOS:

    brew install tesseract tesseract-lang

On Ubuntu or Debian:

    sudo apt-get install tesseract-ocr tesseract-ocr-eng

Install every requested language. Verify that <code>tesseract --list-langs</code> includes the values passed to <code>OcrOptions</code>. Configure the data path explicitly when the deployment layout does not match Tesseract defaults.

## Use the smallest API

Add [the OCR module](/manual/bluetape4k-image/0.3/modules/bluetape4k-images-ocr/), load an <code>ImmutableImage</code>, and call <code>extractText</code> with explicit language and page-segmentation options. The default engine creates a fresh Tess4J instance for each call. This avoids sharing mutable engine state, but OCR remains CPU- and native-resource-intensive; bound concurrency and request time.

## Test in layers

- Normal unit tests keep native OCR disabled.
- Enable host-native checks with <code>-Docr.enabled=true</code>.
- Enable container checks with <code>-Docr.container.enabled=true</code> when Docker is available.

Run native and container OCR checks sequentially. Keep a small fixture with known text and assert normalized content rather than layout-sensitive whitespace.

Continue with the [Ktor OCR workshop](/manual/bluetape4k-image/0.3/modules/ktor-ocr-api/) or [Spring Boot OCR workshop](/manual/bluetape4k-image/0.3/modules/spring-boot-ocr-api/).

## Sources

- [OCR runtime guide](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/images-ocr/README.md)
- [OCR test switches](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/images-ocr/build.gradle.kts)
