---
title: "Result semantics"
description: "Know whether an action ran, was skipped, or failed—even when the action can return null."
releaseRef: 1.0.0
releaseCommit: e70146330302758f563a46b7286e3ce25f1bac49
---

# Result semantics

Know whether an action ran, was skipped, or failed—even when the action can return null.

## Nullable API

`runIfLeader(): T?` is concise: the action result means elected and `null` means skipped. If `T` itself is nullable, the two cases are intentionally ambiguous.

## Explicit result

`LeaderRunResult.Elected(value, leaderId?)` proves the action ran, and `value` may still be null. `Skipped` means acquisition did not succeed. `ActionFailed(cause)` means ownership was acquired and the action started but failed. Election/backend errors before action start are thrown instead of being mislabeled as action failures.

## Control-flow exceptions

`CancellationException` is propagated, not wrapped. Blocking paths restore the interrupt flag before rethrowing `InterruptedException`. Future and virtual-thread callers should expect exceptional completion and inspect the underlying cause at the consumption boundary.

## Release sources

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderRunResult.kt`](../../../../leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderRunResult.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElector.kt`](../../../../leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElector.kt)
- [`leader-core/src/test/kotlin/io/bluetape4k/leader/LeaderRunResultTest.kt`](../../../../leader-core/src/test/kotlin/io/bluetape4k/leader/LeaderRunResultTest.kt)

## Continue learning

- [Bluetape4k Leader manual](../index.md)
- [Execution APIs](execution-apis.md)
- [Failure and cancellation](../guides/failure-and-cancellation.md)
