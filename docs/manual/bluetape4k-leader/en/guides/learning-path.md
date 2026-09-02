---
title: "Learning path"
description: "Move from a five-minute contract check to backend-specific operations and production drills."
releaseRef: 1.0.0
releaseCommit: e70146330302758f563a46b7286e3ce25f1bac49
---

# Learning path

Move from a five-minute contract check to backend-specific operations and production drills.

## Stage 1 — semantics

Run two local contenders and verify that exactly one action runs while the other returns `null`. Repeat with `runIfLeaderResult()` so `Skipped` and an elected `null` result are visibly different. Then throw from the action and confirm the failure reaches the caller.

## Stage 2 — model and backend

Choose single, group, or strategic election from the concurrency requirement. Choose the execution API from the application's threading model. Only then select a backend already covered by your operational skills. The module pages contain constructors, configuration, and failure notes; the runnable examples show the pieces together.

## Stage 3 — production exercises

Measure action duration, set lease and wait budgets, enable metrics, and write alerts for skipped spikes, failures, and lease-extension errors. Rehearse backend loss, expired ownership, duplicate delivery, graceful shutdown, and restart. A manual is complete only when the team knows what to observe and what to do next.

## Release sources

- [`leader-core/src/test/kotlin/io/bluetape4k/leader/LeaderRunResultTest.kt`](../../../../leader-core/src/test/kotlin/io/bluetape4k/leader/LeaderRunResultTest.kt)
- [`examples/batch-scheduler/README.md`](../../../../examples/batch-scheduler/README.md)
- [`examples/prometheus-dashboard/README.md`](../../../../examples/prometheus-dashboard/README.md)

## Continue learning

- [Bluetape4k Leader manual](../index.md)
- [Choose an election model](election-model-selection.md)
- [Testing leader election](testing.md)
- [Observability and operations](observability-and-operations.md)
