---
slug: "manual/bluetape4k-image/0.3/guides/learning-path"
manualId: "learning-path"
title: "Image Learning Path"
locale: "en"
releaseRef: "0.3.0"
manual:
  id: "guides/learning-path"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "6d265160a89feeef27cc5fc562b169d517ca56d4"
  sourcePath: "docs/manual/en/guides/learning-path.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "a571c30004f571fe8cfcddc29670c1404d212ec6"
  sourceDir: "docs/manual"
  layer: "build"
---


The manual includes selection rules, API explanations, runnable examples, failure diagnosis, and operational constraints. Enter at the first unresolved decision instead of reading all projects alphabetically.

![Learning path from portable JVM processing through framework examples and native backends](/manual-assets/bluetape4k-image/0.3/overview/repository-learning-map.svg)

## 1. Complete portable JVM processing

Read [Getting started](/manual/bluetape4k-image/0.3/getting-started/), [the immutable image model](/manual/bluetape4k-image/0.3/core/immutable-image-model/), and [loading and writing](/manual/bluetape4k-image/0.3/core/loading-and-writing/). Run the [basic processing workshop](/manual/bluetape4k-image/0.3/modules/basic-processing/) and prove one load-transform-write path.

## 2. Add only the capability you need

Continue to [transforms and filters](/manual/bluetape4k-image/0.3/core/transforms-and-filters/) or [analysis and similarity](/manual/bluetape4k-image/0.3/core/analysis-and-similarity/). If the service needs challenges or text extraction, add [CAPTCHA](/manual/bluetape4k-image/0.3/integrations/captcha/) or [OCR](/manual/bluetape4k-image/0.3/integrations/ocr/); these are separate dependencies and runtime concerns.

## 3. Choose the application boundary

Use [Spring Boot versus Ktor](/manual/bluetape4k-image/0.3/guides/spring-vs-ktor/). Complete one framework workshop:

- [Ktor image API](/manual/bluetape4k-image/0.3/modules/ktor-image-api/) for thumbnail and CAPTCHA routes;
- [Spring Boot image API](/manual/bluetape4k-image/0.3/modules/spring-boot-image-api/) for storage, upload, and download;
- the matching [Ktor OCR](/manual/bluetape4k-image/0.3/modules/ktor-ocr-api/) or [Spring Boot OCR](/manual/bluetape4k-image/0.3/modules/spring-boot-ocr-api/) workshop after host Tesseract is ready.

## 4. Move to native processing only with a reason

Read [backend selection](/manual/bluetape4k-image/0.3/guides/backend-selection/), [Vips API](/manual/bluetape4k-image/0.3/native/vips-api/), and [native lifecycle](/manual/bluetape4k-image/0.3/guides/native-resource-lifecycle/). Choose Java 21 JNI or Java 25 FFM from the actual deployment JDK and package constraints. Close every derived image.

## 5. Validate the production boundary

Finish with [testing and operations](/manual/bluetape4k-image/0.3/guides/testing-and-operations/), [failure diagnosis](/manual/bluetape4k-image/0.3/guides/failure-diagnosis/), and [performance selection](/manual/bluetape4k-image/0.3/guides/performance-selection/). Record input limits, native prerequisites, resource ownership, storage policy, and the benchmark or load test that supports the chosen backend.

At the end, the application should answer: which backend performs each task, who closes its resources, which inputs are rejected before decode, and which test proves the deployment boundary.

## Sources

- [Release examples](https://github.com/bluetape4k/bluetape4k-image/tree/a571c30004f571fe8cfcddc29670c1404d212ec6/examples)
- [Release module guide](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/README.md#modules)
