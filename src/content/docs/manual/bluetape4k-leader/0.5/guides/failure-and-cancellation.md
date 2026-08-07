---
slug: "manual/bluetape4k-leader/0.5/guides/failure-and-cancellation"
title: "Failure and cancellation"
description: "Separate ordinary contention, action failure, backend failure, cancellation, and ownership loss."
releaseRef: 0.5.0
releaseCommit: 721a9a3808f67489d2bdb8177734325981c24977
manual:
  id: "guides/failure-and-cancellation"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "5a4837e374df53c5a2c272b7a1d883f07abda6ae"
  sourcePath: "docs/manual/en/guides/failure-and-cancellation.md"
  minorVersion: "0.5"
  releaseRef: "0.5.0"
  releaseCommit: "721a9a3808f67489d2bdb8177734325981c24977"
  sourceDir: "docs/manual"
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

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderRunResult.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderRunResult.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/ExtendOutcome.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/main/kotlin/io/bluetape4k/leader/ExtendOutcome.kt)
- [`leader-core/src/test/kotlin/io/bluetape4k/leader/LeaderRunResultTest.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/test/kotlin/io/bluetape4k/leader/LeaderRunResultTest.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.5/)
- [Lease lifecycle](/manual/bluetape4k-leader/0.5/guides/lease-lifecycle/)
- [Observability and operations](/manual/bluetape4k-leader/0.5/guides/observability-and-operations/)
