---
slug: "manual/bluetape4k-leader/0.4/backends/redis"
title: "Redis backends"
description: "Choose Lettuce for command-level control or Redisson for its client ecosystem while respecting thread-bound ownership."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "backends/redis"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "848f79344c636456cebe2069e18f732840bf680d"
  sourcePath: "docs/manual/en/backends/redis.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


Choose Lettuce for command-level control or Redisson for its client ecosystem while respecting thread-bound ownership.

## Common contract

Both modules provide single, group, suspend, factory, state, and strategic variants. They use owner tokens for conditional release and the shared lease auto-extender. Redis server availability and key expiry are part of the correctness boundary.

## Lettuce

Lettuce exposes sync and coroutine-friendly command paths and is a good fit when the application already owns a Lettuce connection. Validate connection lifecycle and command timeout separately from election `waitTime`.

## Redisson

Redisson integrates with `RLock`/semaphore-style facilities. Some ownership is tied to the acquiring thread; extending from another thread yields `WrongThread`. The 0.4.0 elector passes an explicit lease, so benchmarked `autoExtend` refers to bluetape4k's shared extender, not Redisson's native watchdog mode.

## Release sources

- [`leader-redis-lettuce/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-redis-lettuce/README.md)
- [`leader-redis-redisson/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-redis-redisson/README.md)
- [`docs/benchmarks/2026-06-01-issue-422-redis-lease-extension-throughput.json`](../../../benchmarks/2026-06-01-issue-422-redis-lease-extension-throughput.json)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Choose a backend](/manual/bluetape4k-leader/0.4/guides/backend-selection/)
- [Lease extension](/manual/bluetape4k-leader/0.4/core/lease-extension/)
