---
slug: "manual/bluetape4k-leader/0.4/core/result-semantics"
title: "Result semantics"
description: "Know whether an action ran, was skipped, or failed—even when the action can return null."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "core/result-semantics"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "9f8a2152256c1a1ccf4fdbb7d731cf7d6273d700"
  sourcePath: "docs/manual/en/core/result-semantics.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


Know whether an action ran, was skipped, or failed—even when the action can return null.

## Nullable API

`runIfLeader(): T?` is concise: the action result means elected and `null` means skipped. If `T` itself is nullable, the two cases are intentionally ambiguous.

## Explicit result

`LeaderRunResult.Elected(value, leaderId?)` proves the action ran, and `value` may still be null. `Skipped` means acquisition did not succeed. `ActionFailed(cause)` means ownership was acquired and the action started but failed. Election/backend errors before action start are thrown instead of being mislabeled as action failures.

## Control-flow exceptions

`CancellationException` is propagated, not wrapped. Blocking paths restore the interrupt flag before rethrowing `InterruptedException`. Future and virtual-thread callers should expect exceptional completion and inspect the underlying cause at the consumption boundary.

## Release sources

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderRunResult.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderRunResult.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElector.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElector.kt)
- [`leader-core/src/test/kotlin/io/bluetape4k/leader/LeaderRunResultTest.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/test/kotlin/io/bluetape4k/leader/LeaderRunResultTest.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Execution APIs](/manual/bluetape4k-leader/0.4/core/execution-apis/)
- [Failure and cancellation](/manual/bluetape4k-leader/0.4/guides/failure-and-cancellation/)
