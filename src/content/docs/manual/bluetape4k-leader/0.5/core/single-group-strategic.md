---
slug: "manual/bluetape4k-leader/0.5/core/single-group-strategic"
title: "Single, group, and strategic contracts"
description: "Understand what each model guarantees—and what work partitioning remains outside the library."
releaseRef: 0.5.0
releaseCommit: 721a9a3808f67489d2bdb8177734325981c24977
manual:
  id: "core/single-group-strategic"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "5a4837e374df53c5a2c272b7a1d883f07abda6ae"
  sourcePath: "docs/manual/en/core/single-group-strategic.md"
  minorVersion: "0.5"
  releaseRef: "0.5.0"
  releaseCommit: "721a9a3808f67489d2bdb8177734325981c24977"
  sourceDir: "docs/manual"
  layer: "build"
---


Understand what each model guarantees—and what work partitioning remains outside the library.

## Interactive visual companions

Start with the detailed `LeaderElector` lock-and-lease walkthrough, then use the `LeaderGroupElector` companion to focus on the `1 → N` slot-capacity delta. Both simulations use the release-pinned Redis/Lettuce model.

[![LeaderElector lock and lease visual companion](/manual-assets/bluetape4k-leader/0.5/visual-companions/leader-elector.en.png)](/visual-companions/bluetape4k-leader/leader-elector/)

[![LeaderGroupElector slot capacity visual companion](/manual-assets/bluetape4k-leader/0.5/visual-companions/leader-group-elector.en.png)](/visual-companions/bluetape4k-leader/leader-group-elector/)

## Single

One lock name permits at most one compliant owner. The action is still at-least-once from a business perspective when leases expire or callers retry, so external effects need idempotency.

## Group

A group exposes up to `maxLeaders` independent slots and reports `activeCount`, `availableSlots`, and `isFull`. Slot ownership limits concurrency but does not assign unique work. Group event projections may omit the concrete leaders because revoke events do not always identify a slot.

## Strategic

Strategic election separates candidate registration from winner selection. Built-ins include FIFO, seeded random, and scored selection with idle-time, success-rate, recent-success, and weighted scorers. It optimizes placement; it does not by itself provide a distributed lock for arbitrary shared writes.

## Release sources

- [`leader-core/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/README.md)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderGroupState.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderGroupState.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/StrategicLeaderElector.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/main/kotlin/io/bluetape4k/leader/StrategicLeaderElector.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.5/)
- [Choose an election model](/manual/bluetape4k-leader/0.5/guides/election-model-selection/)
- [Execution APIs](/manual/bluetape4k-leader/0.5/core/execution-apis/)
