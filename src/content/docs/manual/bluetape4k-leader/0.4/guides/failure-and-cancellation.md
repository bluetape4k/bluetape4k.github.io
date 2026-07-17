---
slug: "manual/bluetape4k-leader/0.4/guides/failure-and-cancellation"
title: "Failure and cancellation"
description: "Separate ordinary contention, action failure, backend failure, cancellation, and ownership loss."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "guides/failure-and-cancellation"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "9f8a2152256c1a1ccf4fdbb7d731cf7d6273d700"
  sourcePath: "docs/manual/en/guides/failure-and-cancellation.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
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

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderRunResult.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderRunResult.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/ExtendOutcome.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/ExtendOutcome.kt)
- [`leader-core/src/test/kotlin/io/bluetape4k/leader/LeaderRunResultTest.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/test/kotlin/io/bluetape4k/leader/LeaderRunResultTest.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Lease lifecycle](/manual/bluetape4k-leader/0.4/guides/lease-lifecycle/)
- [Observability and operations](/manual/bluetape4k-leader/0.4/guides/observability-and-operations/)
