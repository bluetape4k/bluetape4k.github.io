---
slug: "manual/bluetape4k-leader/0.4/benchmarks/interpreting-results"
title: "Interpret benchmark results"
description: "Use the 0.4.0 JMH data for controlled comparisons, not infrastructure purchasing decisions."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "benchmarks/interpreting-results"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "848f79344c636456cebe2069e18f732840bf680d"
  sourcePath: "docs/manual/en/benchmarks/interpreting-results.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


Use the 0.4.0 JMH data for controlled comparisons, not infrastructure purchasing decisions.

## What was measured

The benchmark module uses kotlinx-benchmark with JMH. The recorded cross-backend runs use one fork, one thread, two warmups, and three one-second measurements on one machine. PostgreSQL, MySQL, Kubernetes, Redis extension, history recorder, and selected repeat runs have separate raw artifacts and constraints.

## Read direction and uncertainty

Higher throughput and lower average time are better only within comparable rows. Error bounds are broad for several container-backed results; overlapping intervals do not justify a winner. Local and H2 rows measure in-process or local SQL overhead and are intentionally separated from distributed backend charts.

## Use in engineering

Repeat the exact command before and after a code change on the same machine. Preserve environment, raw JSON, warmup, fork, and error data. For backend selection, benchmark the deployed topology and actual action; the release results cannot model your network, durability, or pool contention.

## Release sources

- [`benchmark/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/benchmark/README.md)
- [`docs/benchmarks/2026-05-21-leader-cross-backend-baseline.md`](../../../benchmarks/2026-05-21-leader-cross-backend-baseline.md)
- [`docs/benchmarks/2026-05-29-issue-405-rdb-backend-throughput.json`](../../../benchmarks/2026-05-29-issue-405-rdb-backend-throughput.json)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Choose a backend](/manual/bluetape4k-leader/0.4/guides/backend-selection/)
- [Testing leader election](/manual/bluetape4k-leader/0.4/guides/testing/)
