---
slug: "manual/bluetape4k-image/1.0/integrations/ocr"
manualId: "ocr-integration"
title: "OCR Integration"
locale: "en"
releaseRef: "1.0.0"
manual:
  id: "integrations/ocr"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourcePath: "docs/manual/bluetape4k-image/en/integrations/ocr.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourceDir: "docs/manual/bluetape4k-image"
  layer: "build"
---


<code>bluetape4k-images-ocr</code> adds Tesseract text extraction to the core <code>ImmutableImage</code> model. It is a separate module because OCR brings native packages, language data, latency, and operational failure modes that normal image processing does not need.

![OCR request flow from web upload through validation, image preparation, recognition, and response](/manual-assets/bluetape4k-image/1.0/integrations/ocr-web-flow.svg)

## API model

<code>OcrOptions</code> selects language and engine behavior. <code>OcrResult</code> carries recognized text and result data. <code>TesseractOcrEngine</code> implements the engine, and <code>ImmutableImage.extractText</code> is the convenient entry point for an existing image value.

Configure language and data path explicitly in controlled deployments. Normalize or resize input only when it improves the document class being processed; aggressive filters can remove characters as easily as noise.

## Service design

Bound upload bytes, decoded dimensions, OCR concurrency, and request time. OCR is a good candidate for a worker queue when documents are large or latency is unpredictable. Apply the same data-protection and retention policy to original media and extracted text; recognized text can be more searchable than the image.

Distinguish configuration failure, engine failure, empty recognized text, and request validation. Do not retry malformed or unsupported input indefinitely.

## Learn with runnable paths

Complete [OCR setup](/manual/bluetape4k-image/1.0/guides/ocr-setup/) first. Then run the [Ktor OCR](/manual/bluetape4k-image/1.0/modules/ktor-ocr-api/) or [Spring Boot OCR](/manual/bluetape4k-image/1.0/modules/spring-boot-ocr-api/) workshop and read its tests with the application code.

## Sources

- [OCR contracts](https://github.com/bluetape4k/bluetape4k-image/tree/b38d4891b66dff8bc63db0018b5e41810d1da9bc/images-ocr/src/main/kotlin/io/bluetape4k/images/ocr)
- [OCR module reference](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-ocr/)
