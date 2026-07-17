---
slug: "manual/bluetape4k-leader/0.4/core/single-group-strategic"
title: "Single, group, and strategic contracts"
description: "Understand what each model guarantees—and what work partitioning remains outside the library."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "core/single-group-strategic"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "9f8a2152256c1a1ccf4fdbb7d731cf7d6273d700"
  sourcePath: "docs/manual/en/core/single-group-strategic.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


Understand what each model guarantees—and what work partitioning remains outside the library.

## Single

One lock name permits at most one compliant owner. The action is still at-least-once from a business perspective when leases expire or callers retry, so external effects need idempotency.

## Group

A group exposes up to `maxLeaders` independent slots and reports `activeCount`, `availableSlots`, and `isFull`. Slot ownership limits concurrency but does not assign unique work. Group event projections may omit the concrete leaders because revoke events do not always identify a slot.

## Strategic

Strategic election separates candidate registration from winner selection. Built-ins include FIFO, seeded random, and scored selection with idle-time, success-rate, recent-success, and weighted scorers. It optimizes placement; it does not by itself provide a distributed lock for arbitrary shared writes.

## Release sources

- [`leader-core/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/README.md)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderGroupState.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderGroupState.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/StrategicLeaderElector.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/StrategicLeaderElector.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Choose an election model](/manual/bluetape4k-leader/0.4/guides/election-model-selection/)
- [Execution APIs](/manual/bluetape4k-leader/0.4/core/execution-apis/)
