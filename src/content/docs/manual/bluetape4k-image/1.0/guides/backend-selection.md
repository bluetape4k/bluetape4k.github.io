---
slug: "manual/bluetape4k-image/1.0/guides/backend-selection"
manualId: "backend-selection"
title: "Backend Selection"
locale: "en"
releaseRef: "1.0.0"
manual:
  id: "guides/backend-selection"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourcePath: "docs/manual/bluetape4k-image/en/guides/backend-selection.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourceDir: "docs/manual/bluetape4k-image"
  layer: "build"
---


Choose a backend from deployment constraints and measured workload, not from the expectation that native code is always faster.

![Decision map for choosing Scrimage, JDK 25 JVips, or JDK 25 FFM](/manual-assets/bluetape4k-image/1.0/backends/backend-decision-map.svg)

| Path | Best fit | Runtime cost | Ownership |
|---|---|---|---|
| <code>bluetape4k-images</code> | portable filters, transforms, analysis, JVM services | JDK 25; no libvips | JVM values and caller-owned streams |
| JDK 25 JVips JNI (legacy <code>java21</code> artifact) | native resize, thumbnail, crop, encode on JDK 25 | system libvips and JNI | close every <code>VipsImage</code> |
| JDK 25 FFM | native processing on a JDK 25 deployment | system libvips and native-access flag | close every image and manage runtime shutdown |

## Choose Scrimage when

The application needs the broad immutable-image helpers, Java2D drawing, filter DSL, similarity algorithms, OCR input, or a deployment with no native package. It is also the simplest first implementation and the reference path for [the basic workshop](/manual/bluetape4k-image/1.0/modules/basic-processing/).

## Choose libvips when

The workload is dominated by native-supported resize, crop, thumbnail, or encoding operations and the service can install and monitor libvips. Validate the exact codec on the target host. Library support and the host libvips build are separate facts.

Choose [JDK 25 JVips JNI](/manual/bluetape4k-image/1.0/native/java21-jni/) when the application can provide system libvips and wants the legacy JNI binding. Choose [JDK 25 FFM](/manual/bluetape4k-image/1.0/native/java25-ffm/) when JDK 25 and <code>--enable-native-access=ALL-UNNAMED</code> are part of the deployment contract.

## Avoid accidental dual backends

Do not place both native implementations on the normal runtime classpath merely for convenience. Keep the common [Vips API](/manual/bluetape4k-image/1.0/native/vips-api/) at compile time and select one implementation deliberately. A migration can run both in a benchmark or validation environment, but production ownership must remain explicit.

## Decide with evidence

Use the repository benchmark as directional evidence, then measure representative images, concurrency, file and network boundaries, and memory in the real service. See [performance selection](/manual/bluetape4k-image/1.0/guides/performance-selection/).

## Sources

- [Release backend overview](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/README.md#architecture)
- [Benchmark documentation](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/benchmark/images-benchmark/README.md)
