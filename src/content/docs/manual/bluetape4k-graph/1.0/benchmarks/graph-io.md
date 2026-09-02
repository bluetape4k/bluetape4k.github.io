---
slug: "manual/bluetape4k-graph/1.0/benchmarks/graph-io"
title: "Graph I/O benchmarks"
manual:
  id: "graph-io-benchmark"
  repository: "bluetape4k-graph"
  group: "benchmarks"
  kind: "benchmark"
  sourceCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourcePath: "docs/manual/bluetape4k-graph/en/benchmarks/graph-io.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourceDir: "benchmark/graph-io-benchmark"
  layer: "apply"
---


## Workload and harness

`graph-io-benchmark` measures CSV, Jackson 2/3 NDJSON, GraphML, and OkIO export/import/round trips over in-memory TinkerGraph and temporary files. The pinned [build configuration](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/benchmark/graph-io-benchmark/build.gradle.kts) defines 3 warmups and 5 three-second iterations for `main`; [benchmark state](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/benchmark/graph-io-benchmark/src/main/kotlin/io/bluetape4k/graph/benchmark/io/BulkGraphIoBenchmarkState.kt) owns temporary resources.

Prerequisites: JDK 21, release commit `a405300799b36d4d6edb7267ad07ff34d4ad3afe`, and sufficient temporary disk space. Docker is not required.

```bash
./gradlew :graph-io-benchmark:smokeBenchmark --rerun-tasks --console=plain
./gradlew :graph-io-benchmark:benchmark --rerun-tasks --console=plain
```

The smoke configuration uses `sizeName=smoke`, 1 warmup, 1 measurement of 200 ms, and representative CSV/Jackson3-OkIO/GraphML-OkIO round trips. It validates wiring only. The full run writes JMH reports below `benchmark/graph-io-benchmark/build/reports/benchmarks/`. Average `ms/op` is lower-is-better; compare methods only at the same size and execution model.

The committed [2026-04-18 result](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/benchmark/2026-04-18-graph-io-bulk-results.md) includes numeric small-dataset rows and run conditions. It does not justify comparing a suspend outlier with another machine or claiming a serializer wins for remote databases.

## Variance, cleanup, and diagnosis

Run three full trials, retain JSON, and compare intervals. Warmups and forks address JVM state but not filesystem cache, antivirus, compression, or disk contention. Trial teardown removes temporary directories; after interruption, inspect the module build directory and OS temporary space before rerunning.

If import counts differ, treat it as correctness failure before reading latency. If JSON is absent, inspect the first failing benchmark and teardown log. This workload does not prove remote-driver throughput, encrypted production storage, huge graphs, memory ceilings, or crash recovery. Read [graph-io execution model](/manual/bluetape4k-graph/1.0/graph-io/execution-model/) and [overview](/manual/bluetape4k-graph/1.0/benchmarks/overview/).

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `1.0.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### graph-io-benchmark Architecture diagram

[![graph-io-benchmark Architecture diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-graph/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/benchmark/graph-io-benchmark-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/benchmark/graph-io-benchmark-architecture-01.svg)

_Release README: [`benchmark/graph-io-benchmark/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/benchmark/graph-io-benchmark/README.md)_

<!-- release-readme-diagrams:end -->
