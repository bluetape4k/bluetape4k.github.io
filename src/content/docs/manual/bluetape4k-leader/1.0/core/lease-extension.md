---
slug: "manual/bluetape4k-leader/1.0/core/lease-extension"
title: "Lease extension"
description: "Renew only while ownership still matches, and treat extension outcomes as operational decisions."
releaseRef: 1.0.0
releaseCommit: e70146330302758f563a46b7286e3ce25f1bac49
manual:
  id: "core/lease-extension"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/core/lease-extension.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "docs/manual/bluetape4k-leader"
  layer: "build"
---


Renew only while ownership still matches, and treat extension outcomes as operational decisions.

## Automatic and explicit

`autoExtend=true` starts the shared watchdog for supported single-leader backends. Code inside an elected scope can also call `LockExtender.extendActiveLockDetailed()` or the suspend variant. Group auto-extension is not a general 1.0.0 contract.

## Outcome handling

`Extended` carries a best-effort observed expiry. `NotHeld` means token mismatch, expiry, or takeover. `WrongThread` is specific to a Redisson thread-bound lock used from another thread. `BackendError` preserves transient versus non-transient classification. The Boolean shortcut hides detail and should not drive an operator runbook.

## Safety rule

The backend must extend atomically under the current owner condition. A user extension records its later deadline so the watchdog does not shorten it on the next tick. Stop protected writes when ownership is lost; renewing after expiry cannot retroactively make earlier work safe.

## Release sources

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LockExtender.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LockExtender.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/ExtendOutcome.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/main/kotlin/io/bluetape4k/leader/ExtendOutcome.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderLeaseAutoExtender.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderLeaseAutoExtender.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/1.0/)
- [Lease lifecycle](/manual/bluetape4k-leader/1.0/guides/lease-lifecycle/)
- [Failure and cancellation](/manual/bluetape4k-leader/1.0/guides/failure-and-cancellation/)
