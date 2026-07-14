---
slug: "manual/bluetape4k-leader/0.4/guides/lease-lifecycle"
title: "Lease lifecycle"
description: "Set wait, maximum lease, minimum hold, and extension from measured work rather than defaults."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "guides/lease-lifecycle"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "848f79344c636456cebe2069e18f732840bf680d"
  sourcePath: "docs/manual/en/guides/lease-lifecycle.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


Set wait, maximum lease, minimum hold, and extension from measured work rather than defaults.

## Four time decisions

`waitTime` bounds acquisition waiting. `leaseTime` bounds ownership. `minLeaseTime` prevents rapid reacquisition after a fast action and must not exceed the lease. `autoExtend` periodically renews supported single-leader leases while the action runs. Defaults are 5 seconds, 60 seconds, zero, and false.

## Sizing

Measure p99 action duration and backend latency. A fixed lease should cover p99 plus GC, scheduling, and network jitter. Keep wait time short for scheduled jobs that should skip, longer only when queueing is intentional. Use a minimum lease when downstream systems need spacing, not as a substitute for rate limiting.

## Expiry and release

Normal completion releases ownership with an owner token. A crash relies on TTL or session expiry. If work can outlive the lease, use supported auto-extension or split work into bounded checkpoints. Even with extension, downstream writes should be idempotent because no lease can eliminate every partition or pause race.

## Release sources

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElectionOptions.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElectionOptions.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderLeaseAutoExtender.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderLeaseAutoExtender.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LockExtender.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LockExtender.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Lease extension](/manual/bluetape4k-leader/0.4/core/lease-extension/)
- [Failure and cancellation](/manual/bluetape4k-leader/0.4/guides/failure-and-cancellation/)
