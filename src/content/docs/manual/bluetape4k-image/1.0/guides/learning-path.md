---
slug: "manual/bluetape4k-image/1.0/guides/learning-path"
manualId: "learning-path"
title: "Image Learning Path"
locale: "en"
releaseRef: "1.0.0"
manual:
  id: "guides/learning-path"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourcePath: "docs/manual/bluetape4k-image/en/guides/learning-path.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourceDir: "docs/manual/bluetape4k-image"
  layer: "build"
---


The manual includes selection rules, API explanations, runnable examples, failure diagnosis, and operational constraints. Enter at the first unresolved decision instead of reading all projects alphabetically.

![Learning path from portable JVM processing through framework examples and native backends](/manual-assets/bluetape4k-image/1.0/overview/repository-learning-map.svg)

## 1. Complete portable JVM processing

Read [Getting started](/manual/bluetape4k-image/1.0/getting-started/), [the immutable image model](/manual/bluetape4k-image/1.0/core/immutable-image-model/), and [loading and writing](/manual/bluetape4k-image/1.0/core/loading-and-writing/). Run the [basic processing workshop](/manual/bluetape4k-image/1.0/modules/basic-processing/) and prove one load-transform-write path.

## 2. Add only the capability you need

Continue to [transforms and filters](/manual/bluetape4k-image/1.0/core/transforms-and-filters/) or [analysis and similarity](/manual/bluetape4k-image/1.0/core/analysis-and-similarity/). If the service needs challenges or text extraction, add [CAPTCHA](/manual/bluetape4k-image/1.0/integrations/captcha/) or [OCR](/manual/bluetape4k-image/1.0/integrations/ocr/); these are separate dependencies and runtime concerns.

## 3. Choose the application boundary

Use [Spring Boot versus Ktor](/manual/bluetape4k-image/1.0/guides/spring-vs-ktor/). Complete one framework workshop:

- [Ktor image API](/manual/bluetape4k-image/1.0/modules/ktor-image-api/) for thumbnail and CAPTCHA routes;
- [Spring Boot image API](/manual/bluetape4k-image/1.0/modules/spring-boot-image-api/) for storage, upload, and download;
- the matching [Ktor OCR](/manual/bluetape4k-image/1.0/modules/ktor-ocr-api/) or [Spring Boot OCR](/manual/bluetape4k-image/1.0/modules/spring-boot-ocr-api/) workshop after host Tesseract is ready.

## 4. Move to native processing only with a reason

Read [backend selection](/manual/bluetape4k-image/1.0/guides/backend-selection/), [Vips API](/manual/bluetape4k-image/1.0/native/vips-api/), and [native lifecycle](/manual/bluetape4k-image/1.0/guides/native-resource-lifecycle/). Choose JDK 25 JVips JNI (the legacy `java21` artifact) or JDK 25 FFM from the native package constraints. Close every derived image.

## 5. Validate the production boundary

Finish with [testing and operations](/manual/bluetape4k-image/1.0/guides/testing-and-operations/), [failure diagnosis](/manual/bluetape4k-image/1.0/guides/failure-diagnosis/), and [performance selection](/manual/bluetape4k-image/1.0/guides/performance-selection/). Record input limits, native prerequisites, resource ownership, storage policy, and the benchmark or load test that supports the chosen backend.

At the end, the application should answer: which backend performs each task, who closes its resources, which inputs are rejected before decode, and which test proves the deployment boundary.

## Sources

- [Release examples](https://github.com/bluetape4k/bluetape4k-image/tree/b38d4891b66dff8bc63db0018b5e41810d1da9bc/examples)
- [Release module guide](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/README.md#modules)
