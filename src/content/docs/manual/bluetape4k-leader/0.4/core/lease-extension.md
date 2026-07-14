---
slug: "manual/bluetape4k-leader/0.4/core/lease-extension"
title: "Lease extension"
description: "Renew only while ownership still matches, and treat extension outcomes as operational decisions."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "core/lease-extension"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "848f79344c636456cebe2069e18f732840bf680d"
  sourcePath: "docs/manual/en/core/lease-extension.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


Renew only while ownership still matches, and treat extension outcomes as operational decisions.

## Automatic and explicit

`autoExtend=true` starts the shared watchdog for supported single-leader backends. Code inside an elected scope can also call `LockExtender.extendActiveLockDetailed()` or the suspend variant. Group auto-extension is not a general 0.4.0 contract.

## Outcome handling

`Extended` carries a best-effort observed expiry. `NotHeld` means token mismatch, expiry, or takeover. `WrongThread` is specific to a Redisson thread-bound lock used from another thread. `BackendError` preserves transient versus non-transient classification. The Boolean shortcut hides detail and should not drive an operator runbook.

## Safety rule

The backend must extend atomically under the current owner condition. A user extension records its later deadline so the watchdog does not shorten it on the next tick. Stop protected writes when ownership is lost; renewing after expiry cannot retroactively make earlier work safe.

## Release sources

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LockExtender.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LockExtender.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/ExtendOutcome.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/ExtendOutcome.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderLeaseAutoExtender.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderLeaseAutoExtender.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Lease lifecycle](/manual/bluetape4k-leader/0.4/guides/lease-lifecycle/)
- [Failure and cancellation](/manual/bluetape4k-leader/0.4/guides/failure-and-cancellation/)
