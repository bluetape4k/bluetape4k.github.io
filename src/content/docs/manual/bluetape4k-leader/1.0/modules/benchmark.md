---
slug: "manual/bluetape4k-leader/1.0/modules/benchmark"
manualId: "benchmark"
id: "benchmark"
title: "Leader election benchmarks"
locale: "en"
kind: "benchmark"
gradlePath: ":benchmark"
sourceDir: "benchmark"
releaseRef: "1.0.0"
artifact: null
manual:
  id: "benchmark"
  repository: "bluetape4k-leader"
  group: "benchmarks"
  kind: "benchmark"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/modules/benchmark.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "benchmark"
  layer: "apply"
---


> Performance benchmark

## Problem

This non-published module compares election backends with one `kotlinx-benchmark`/JMH harness. The 1.0.0 manual anchors its comparison to the 2026-05-29 evidence: throughput is better when higher and average time is better when lower, but only rows from the same workload and runtime target are comparable.

## When to use it

Use the suite to compare a candidate with a baseline on the same machine or to detect a large regression. Do not treat the tables as a production capacity promise or rank unrelated infrastructure from a short microbenchmark.

## Coordinates

This module is not published. Check out tag `1.0.0` and run `:benchmark` from the repository.

## Core concepts

The harness separates blocking and suspend APIs, local and distributed backends, throughput and average-time modes. Kubernetes runs in a separate target because its Fabric8/Vert.x runtime differs from the default etcd target. Forks, threads, warmup, measurement windows, containers, JDK, OS, and hardware are part of every result.

## Quick start

```bash
./gradlew :benchmark:benchmarkBenchmark \
  :benchmark:benchmarkAverageTimeBenchmark \
  --no-configuration-cache --rerun-tasks

./gradlew :benchmark:kubernetesBenchmarkBenchmark \
  :benchmark:kubernetesBenchmarkAverageTimeBenchmark \
  --no-configuration-cache --rerun-tasks
```

## API by task

`BackendLeaderElectorBenchmark` covers blocking paths and `SuspendBackendLeaderElectorBenchmark` covers coroutine paths. Use benchmark filters for a focused experiment and preserve raw JSON instead of copying console summaries.

## Recommended patterns

Change one variable, keep harness and environment fixed, run baseline and candidate in the same session, and compare confidence intervals. Report metric direction and error bounds. Re-run noisy rows instead of explaining them away.

## Integrations

The harness starts backend infrastructure. The 2026-05-29 SQL rows use Exposed JDBC for blocking and Exposed R2DBC for suspend. Kubernetes remains isolated in its own runtime target.

## Configuration

A reproduction record must include JDK, OS, CPU, container versions, fork/thread count, warmup, measurement duration/count, Gradle command, and selected filters. Without that context, numbers from another machine are not comparable.

## Failure modes

Failed containers, a saturated laptop, thermal throttling, or a mixed runtime classpath invalidate the run. Very wide error bounds cannot support a tuning conclusion. One faster sample is not evidence of a fix.

## Operations

Keep throughput and average-time raw JSON together with a short interpretation. If the metrics disagree, inspect setup overhead and outliers before making a claim. Archive the exact commit and environment with the result.

## Testing

Compile benchmark source sets before a long run, smoke a narrow filter, then execute full throughput and average-time modes sequentially. Confirm that the harness uses stable 1.0.0 APIs and no later source surface.

## Workshops and learning path

Read the cross-backend baseline first, then inspect the benchmark class for the measured operation. Use each backend manual to interpret operational trade-offs; the benchmark does not choose a backend for the application.

## Limitations

The 2026-05-29 evidence represents one machine, short JMH windows, and containerized dependencies. It does not model network partitions, production data size, multi-node contention, failover, or protected business-action cost.

## Sources

[Benchmark guide](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/benchmark/README.md) · [2026-05-29 throughput JSON](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/docs/benchmarks/2026-05-29-issue-405-rdb-backend-throughput.json) · [2026-05-29 average-time JSON](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/docs/benchmarks/2026-05-29-issue-405-rdb-backend-average-time.json) · [Harness](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/benchmark/src/benchmark/kotlin/io/bluetape4k/leader/benchmark/BackendLeaderElectorBenchmark.kt)
