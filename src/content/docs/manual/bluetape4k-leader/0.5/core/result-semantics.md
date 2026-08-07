---
slug: "manual/bluetape4k-leader/0.5/core/result-semantics"
title: "Result semantics"
description: "Know whether an action ran, was skipped, or failed—even when the action can return null."
releaseRef: 0.5.0
releaseCommit: 721a9a3808f67489d2bdb8177734325981c24977
manual:
  id: "core/result-semantics"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "5a4837e374df53c5a2c272b7a1d883f07abda6ae"
  sourcePath: "docs/manual/en/core/result-semantics.md"
  minorVersion: "0.5"
  releaseRef: "0.5.0"
  releaseCommit: "721a9a3808f67489d2bdb8177734325981c24977"
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

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderRunResult.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderRunResult.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElector.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElector.kt)
- [`leader-core/src/test/kotlin/io/bluetape4k/leader/LeaderRunResultTest.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/test/kotlin/io/bluetape4k/leader/LeaderRunResultTest.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.5/)
- [Execution APIs](/manual/bluetape4k-leader/0.5/core/execution-apis/)
- [Failure and cancellation](/manual/bluetape4k-leader/0.5/guides/failure-and-cancellation/)
