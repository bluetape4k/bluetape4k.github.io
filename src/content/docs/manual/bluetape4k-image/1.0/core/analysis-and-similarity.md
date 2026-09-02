---
slug: "manual/bluetape4k-image/1.0/core/analysis-and-similarity"
manualId: "analysis-and-similarity"
title: "Analysis and Similarity"
locale: "en"
releaseRef: "1.0.0"
manual:
  id: "core/analysis-and-similarity"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourcePath: "docs/manual/bluetape4k-image/en/core/analysis-and-similarity.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourceDir: "docs/manual/bluetape4k-image"
  layer: "build"
---


The release provides blur and dominant-color analysis plus several similarity families. Choose the metric from the question being asked; no single score means “same image” in every product.

## Analysis

<code>blurScore</code>/<code>isBlurry</code> support quality gates with an application-selected threshold. Dominant-color helpers summarize color distribution. Run analysis on a normalized size and color path if results must be comparable across uploads.

## Similarity families

- Pixel delta and MSE measure direct differences and require closely aligned inputs.
- PSNR summarizes reconstruction error.
- SSIM and MSSIM compare structural information and tolerate some pixel-level variation.
- aHash, dHash, wHash, and pHash produce compact perceptual descriptors for candidate lookup.
- Histogram similarity compares color distribution without preserving layout.
- Block-mean descriptors and rotation-aware comparison help when exact pixel alignment is not available.

Build a two-stage system for large collections: use a compact hash to find candidates, then a more expensive structural metric to rank or confirm them. Store metric name, normalization rules, descriptor size, and threshold with the result.

## Thresholds are domain data

Do not copy a threshold from an unrelated fixture. Build positive and negative samples from the product domain, evaluate false matches and misses, and version the chosen policy. Resize both inputs consistently before comparing them.

## Sources

- [Analysis package](https://github.com/bluetape4k/bluetape4k-image/tree/b38d4891b66dff8bc63db0018b5e41810d1da9bc/images/src/main/kotlin/io/bluetape4k/images/analysis)
- [Similarity package](https://github.com/bluetape4k/bluetape4k-image/tree/b38d4891b66dff8bc63db0018b5e41810d1da9bc/images/src/main/kotlin/io/bluetape4k/images/similarity)
