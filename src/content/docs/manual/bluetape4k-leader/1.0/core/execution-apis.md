---
slug: "manual/bluetape4k-leader/1.0/core/execution-apis"
title: "Execution APIs"
description: "Map each interface to its lambda, return type, scheduler, and cancellation surface."
releaseRef: 1.0.0
releaseCommit: e70146330302758f563a46b7286e3ce25f1bac49
manual:
  id: "core/execution-apis"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/core/execution-apis.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "docs/manual/bluetape4k-leader"
  layer: "build"
---


Map each interface to its lambda, return type, scheduler, and cancellation surface.

## Interface map

`LeaderElector` accepts `() -> T` and returns `T?`. `AsyncLeaderElector` accepts `() -> CompletableFuture<T>` and returns `CompletableFuture<T?>`. `VirtualThreadLeaderElector` accepts `() -> T` and returns `VirtualFuture<T?>`. `SuspendLeaderElector` accepts a suspend lambda and returns `T?`. Group interfaces mirror the blocking and suspend shapes.

## Do not adapt by convenience

Choose the interface at the application boundary. Wrapping a blocking backend in a coroutine does not make its I/O non-blocking, and nesting arbitrary thread hops can break thread-bound ownership such as Redisson extension. Prefer the backend's native interface.

## Slot overloads

`LeaderSlot` carries a lock name and audit leader id. Default bridge overloads warn and cannot prove that a backend stamped the supplied identity; backend implementations should override slot and result variants. Do not assume `Elected.leaderId` is populated when a bridge path returns null.

## Release sources

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElector.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElector.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/AsyncLeaderElector.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/main/kotlin/io/bluetape4k/leader/AsyncLeaderElector.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/VirtualThreadLeaderElector.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/main/kotlin/io/bluetape4k/leader/VirtualThreadLeaderElector.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/coroutines/SuspendLeaderElector.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/main/kotlin/io/bluetape4k/leader/coroutines/SuspendLeaderElector.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/1.0/)
- [Result semantics](/manual/bluetape4k-leader/1.0/core/result-semantics/)
- [Choose an execution API](/manual/bluetape4k-leader/1.0/guides/execution-model-selection/)
