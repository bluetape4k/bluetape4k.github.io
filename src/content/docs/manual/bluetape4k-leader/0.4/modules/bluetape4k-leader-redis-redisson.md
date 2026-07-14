---
slug: "manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-redis-redisson"
manualId: "bluetape4k-leader-redis-redisson"
id: "bluetape4k-leader-redis-redisson"
title: "Redis Redisson backend"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-redis-redisson"
sourceDir: "leader-redis-redisson"
releaseRef: "0.4.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-redis-redisson
manual:
  id: "bluetape4k-leader-redis-redisson"
  repository: "bluetape4k-leader"
  group: "backends"
  kind: "library"
  sourceCommit: "6bb3ba3f6cdc1286b5ee7d8b7b47d9e92f9c6e3d"
  sourcePath: "docs/manual/en/modules/bluetape4k-leader-redis-redisson.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "leader-redis-redisson"
  layer: "build"
---


> Library module

## Problem

Implements single, group, and strategic election with Redisson locks/semaphores and blocking/coroutine APIs.

## When to use it

Choose it when Redisson is already the Redis client and its distributed-object API is preferred over direct Lettuce scripting.

## Coordinates

Artifact: `io.github.bluetape4k.leader:bluetape4k-leader-redis-redisson`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-redis-redisson")
}
```

## Core concepts

Acquisition always passes explicit `leaseTime`, so Redisson's native watchdog is disabled. Core `LeaderLeaseAutoExtender` is the only automatic extender when enabled.

## Quick start

```kotlin
val elector = RedissonLeaderElector(redissonClient)
elector.runIfLeader("webhook-poller") { pollWebhooks() }
```

## API by task

Use blocking/suspend single/group and strategic electors plus factories. Group election maps to semaphore-style permits.

## Recommended patterns

Keep one caller-owned client, stable lock names, explicit lease sizing, idempotent actions, and a deliberate choice about shared `autoExtend`.

## Integrations

Spring factories use `RedissonClient`. redisson-watchdog explains the distinction between native watchdog and the library's shared extender.

## Configuration

Configure wait/lease/minimum lease, auto-extension, group size, Redis topology, client timeout, retry, and codec independently.

## Failure modes

Contention returns `null`. Interrupts, Redis/client failures, lost ownership, and extend/release errors propagate according to the backend classifier.

## Operations

Monitor Redis latency, connection state, lock TTL, permit usage, extension failures, skip rate, and failover events. Do not assume the native watchdog renewed a lock.

## Testing

Test two clients, explicit lease expiry, shared extender, owner-safe release, group permits, strategic registry, failover, and suspend cancellation.

## Workshops and learning path

Run redisson-watchdog before production adoption, then compare rate-limiter and strategic-election examples.

## Limitations

Explicit leases can expire during long pauses. Redisson ownership still does not fence writes to another store.

## Sources

[Elector](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-redis-redisson/src/main/kotlin/io/bluetape4k/leader/redisson/RedissonLeaderElector.kt) · [Shared extender delegate](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-redis-redisson/src/main/kotlin/io/bluetape4k/leader/redisson/internal/RedissonLockExtendDelegate.kt) · [Stable guide](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-redis-redisson/README.md)
