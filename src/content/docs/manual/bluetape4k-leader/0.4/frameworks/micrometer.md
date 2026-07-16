---
slug: "manual/bluetape4k-leader/0.4/frameworks/micrometer"
title: "Micrometer integration"
description: "Measure election decisions and AOP execution while controlling high-cardinality lock names."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "frameworks/micrometer"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "27627f5cf430ef2640d5847ecfeef914ea935c4c"
  sourcePath: "docs/manual/en/frameworks/micrometer.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


Measure election decisions and AOP execution while controlling high-cardinality lock names.

## Two integration points

`MicrometerLeaderElectionListener` records lifecycle decisions from elector events. `MicrometerLeaderAopMetricsRecorder` instruments annotation-driven execution. Choose the one matching the invocation boundary; avoid double-counting the same call through both without an explicit dashboard model.

## Tags

Use bounded tags for backend, result, and stable job family. Normalize or reject tenant-rich lock names before turning them into labels. Store exact lock names in structured logs when needed for diagnosis.

## Dashboard

Pair rates with duration and backend health. An elected counter alone cannot reveal a stuck action; skipped alone cannot distinguish healthy contention from excessive overlap. The Prometheus example includes an end-to-end scrape and dashboard shape that should be adapted to local naming and alert thresholds.

## Release sources

- [`leader-micrometer/src/main/kotlin/io/bluetape4k/leader/micrometer/MicrometerLeaderElectionListener.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-micrometer/src/main/kotlin/io/bluetape4k/leader/micrometer/MicrometerLeaderElectionListener.kt)
- [`leader-micrometer/src/main/kotlin/io/bluetape4k/leader/micrometer/MicrometerLeaderAopMetricsRecorder.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-micrometer/src/main/kotlin/io/bluetape4k/leader/micrometer/MicrometerLeaderAopMetricsRecorder.kt)
- [`examples/prometheus-dashboard/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/examples/prometheus-dashboard/README.md)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Observability and operations](/manual/bluetape4k-leader/0.4/guides/observability-and-operations/)
- [Spring Boot integration](/manual/bluetape4k-leader/0.4/frameworks/spring-boot/)
