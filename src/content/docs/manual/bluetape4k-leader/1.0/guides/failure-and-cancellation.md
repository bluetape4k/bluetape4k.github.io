---
slug: "manual/bluetape4k-leader/1.0/guides/failure-and-cancellation"
title: "Failure and cancellation"
description: "Separate ordinary contention, action failure, backend failure, cancellation, and ownership loss."
releaseRef: 1.0.0
releaseCommit: e70146330302758f563a46b7286e3ce25f1bac49
manual:
  id: "guides/failure-and-cancellation"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/guides/failure-and-cancellation.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "docs/manual/bluetape4k-leader"
  layer: "build"
---


Separate ordinary contention, action failure, backend failure, cancellation, and ownership loss.

## Five outcomes

Contention returns skipped. Action exceptions propagate from nullable APIs or appear as `ActionFailed` in result APIs. Backend acquire failures are infrastructure errors and are not disguised as contention. Cancellation propagates. Lease extension can additionally report `NotHeld`, `WrongThread`, or `BackendError`.

## Caller policy

Count skipped separately from failed. Retry a backend error only after classifying it and checking whether the action may already have started. Never retry an action failure blindly. On `NotHeld`, stop or fence remaining external writes because another contender may acquire ownership.

## Shutdown

Stop scheduling new attempts, cancel scoped coroutine jobs, wait for bounded in-flight work, then close the elector's backend client according to its ownership contract. Framework integrations help bind this sequence to application lifecycle, but the application still owns the action's cancellation safety.

## Release sources

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderRunResult.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderRunResult.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/ExtendOutcome.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/main/kotlin/io/bluetape4k/leader/ExtendOutcome.kt)
- [`leader-core/src/test/kotlin/io/bluetape4k/leader/LeaderRunResultTest.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/test/kotlin/io/bluetape4k/leader/LeaderRunResultTest.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/1.0/)
- [Lease lifecycle](/manual/bluetape4k-leader/1.0/guides/lease-lifecycle/)
- [Observability and operations](/manual/bluetape4k-leader/1.0/guides/observability-and-operations/)
