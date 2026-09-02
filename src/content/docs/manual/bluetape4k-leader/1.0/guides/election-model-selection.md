---
slug: "manual/bluetape4k-leader/1.0/guides/election-model-selection"
title: "Choose an election model"
description: "Select single, bounded group, or strategic election from the work's concurrency and placement rules."
releaseRef: 1.0.0
releaseCommit: e70146330302758f563a46b7286e3ce25f1bac49
manual:
  id: "guides/election-model-selection"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/guides/election-model-selection.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "docs/manual/bluetape4k-leader"
  layer: "build"
---


Select single, bounded group, or strategic election from the work's concurrency and placement rules.

![Election and execution model decision map](/manual-assets/bluetape4k-leader/1.0/architecture/model-decision-map.png)

## Single leader

Use `LeaderElector` or `SuspendLeaderElector` when at most one instance may execute a named action. Scheduled settlement, migration gates, and control-plane reconciliation are typical cases. The lock name is the concurrency boundary.

## Leader group

Use `LeaderGroupElector` when up to `maxLeaders` workers may run concurrently. Each winner owns a slot. This is a distributed semaphore, not work distribution: the application still needs a queue or partitioning rule so two elected workers do not process the same item.

## Strategic election

Use strategic election when the winner should be selected by candidate information rather than whoever acquires a lock first. FIFO, deterministic random, scored, and weighted scoring are available. Candidate registration and selection introduce freshness requirements; stale candidate data can choose an unsuitable node.

## Decision rule

Start with single leader. Move to a group only when measured throughput requires bounded parallelism. Choose strategic election only when placement quality is itself a requirement and you can maintain candidate health data.

## Release sources

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElector.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElector.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderGroupElector.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderGroupElector.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/StrategicLeaderElector.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/main/kotlin/io/bluetape4k/leader/StrategicLeaderElector.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/1.0/)
- [Single, group, and strategic contracts](/manual/bluetape4k-leader/1.0/core/single-group-strategic/)
- [Choose an execution API](/manual/bluetape4k-leader/1.0/guides/execution-model-selection/)
