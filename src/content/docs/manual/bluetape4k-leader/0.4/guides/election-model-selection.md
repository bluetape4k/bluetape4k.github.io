---
slug: "manual/bluetape4k-leader/0.4/guides/election-model-selection"
title: "Choose an election model"
description: "Select single, bounded group, or strategic election from the work's concurrency and placement rules."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "guides/election-model-selection"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "848f79344c636456cebe2069e18f732840bf680d"
  sourcePath: "docs/manual/en/guides/election-model-selection.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


Select single, bounded group, or strategic election from the work's concurrency and placement rules.

![Election and execution model decision map](/manual-assets/bluetape4k-leader/0.4/architecture/model-decision-map.png)

## Single leader

Use `LeaderElector` or `SuspendLeaderElector` when at most one instance may execute a named action. Scheduled settlement, migration gates, and control-plane reconciliation are typical cases. The lock name is the concurrency boundary.

## Leader group

Use `LeaderGroupElector` when up to `maxLeaders` workers may run concurrently. Each winner owns a slot. This is a distributed semaphore, not work distribution: the application still needs a queue or partitioning rule so two elected workers do not process the same item.

## Strategic election

Use strategic election when the winner should be selected by candidate information rather than whoever acquires a lock first. FIFO, deterministic random, scored, and weighted scoring are available. Candidate registration and selection introduce freshness requirements; stale candidate data can choose an unsuitable node.

## Decision rule

Start with single leader. Move to a group only when measured throughput requires bounded parallelism. Choose strategic election only when placement quality is itself a requirement and you can maintain candidate health data.

## Release sources

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElector.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElector.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderGroupElector.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderGroupElector.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/StrategicLeaderElector.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/StrategicLeaderElector.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Single, group, and strategic contracts](/manual/bluetape4k-leader/0.4/core/single-group-strategic/)
- [Choose an execution API](/manual/bluetape4k-leader/0.4/guides/execution-model-selection/)
