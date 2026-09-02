---
slug: "manual/bluetape4k-leader/1.0/guides/lease-lifecycle"
title: "Lease lifecycle"
description: "Set wait, maximum lease, minimum hold, and extension from measured work rather than defaults."
releaseRef: 1.0.0
releaseCommit: e70146330302758f563a46b7286e3ce25f1bac49
manual:
  id: "guides/lease-lifecycle"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/guides/lease-lifecycle.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "docs/manual/bluetape4k-leader"
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

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElectionOptions.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElectionOptions.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderLeaseAutoExtender.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderLeaseAutoExtender.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LockExtender.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LockExtender.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/1.0/)
- [Lease extension](/manual/bluetape4k-leader/1.0/core/lease-extension/)
- [Failure and cancellation](/manual/bluetape4k-leader/1.0/guides/failure-and-cancellation/)
