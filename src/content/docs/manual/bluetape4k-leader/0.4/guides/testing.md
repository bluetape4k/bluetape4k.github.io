---
slug: "manual/bluetape4k-leader/0.4/guides/testing"
title: "Testing leader election"
description: "Test the contract at three levels: deterministic core behavior, real backend ownership, and multi-instance scenarios."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "guides/testing"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "848f79344c636456cebe2069e18f732840bf680d"
  sourcePath: "docs/manual/en/guides/testing.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


Test the contract at three levels: deterministic core behavior, real backend ownership, and multi-instance scenarios.

## Unit contract

Use local electors or a fake to prove the action runs only when elected, skipped is not an exception, an elected `null` is distinguishable with result APIs, and action errors propagate. Use deterministic lock names and bounded timeouts.

## Backend integration

Run the real client against Testcontainers or an emulator. Verify atomic contention, owner-conditional release, expiry/reacquire, minimum lease, state snapshots, group slot limits, and supported extension paths. Keep heavyweight backends sequential to avoid shared-resource noise.

## Scenario test

Start two application instances or two independently configured electors. Observe exactly one side effect, then kill the leader and verify takeover after the documented lease/session boundary. Also test cancellation and graceful shutdown. A passing happy path does not prove partition safety, so document what the fixture cannot simulate.

## Release sources

- [`leader-core/src/testFixtures/kotlin/io/bluetape4k/leader/contract/AbstractLeaderElectorLeaderIdContractTest.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/testFixtures/kotlin/io/bluetape4k/leader/contract/AbstractLeaderElectorLeaderIdContractTest.kt)
- [`leader-redis-lettuce/src/test/kotlin/io/bluetape4k/leader/lettuce/LettuceSuspendLeaderElectorTest.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-redis-lettuce/src/test/kotlin/io/bluetape4k/leader/lettuce/LettuceSuspendLeaderElectorTest.kt)
- [`examples/batch-scheduler/src/test/kotlin/io/bluetape4k/leader/examples/batch/BatchSchedulerTest.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/examples/batch-scheduler/src/test/kotlin/io/bluetape4k/leader/examples/batch/BatchSchedulerTest.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Failure and cancellation](/manual/bluetape4k-leader/0.4/guides/failure-and-cancellation/)
- [Observability and operations](/manual/bluetape4k-leader/0.4/guides/observability-and-operations/)
