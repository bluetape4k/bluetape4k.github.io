---
slug: "manual/bluetape4k-leader/1.0/modules/bluetape4k-leader-redis-redisson"
manualId: "bluetape4k-leader-redis-redisson"
id: "bluetape4k-leader-redis-redisson"
title: "Redis Redisson backend"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-redis-redisson"
sourceDir: "leader-redis-redisson"
releaseRef: "1.0.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-redis-redisson
manual:
  id: "bluetape4k-leader-redis-redisson"
  repository: "bluetape4k-leader"
  group: "backends"
  kind: "library"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/modules/bluetape4k-leader-redis-redisson.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
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

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `1.0.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### leader redis redisson Class Structure diagram

[![leader redis redisson Class Structure diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/e70146330302758f563a46b7286e3ce25f1bac49/docs/images/readme-diagrams/leader-redis-redisson-class-01.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/e70146330302758f563a46b7286e3ce25f1bac49/docs/images/readme-diagrams/leader-redis-redisson-class-01.svg)

_Release README: [`leader-redis-redisson/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/e70146330302758f563a46b7286e3ce25f1bac49/leader-redis-redisson/README.md)_

### Scenario 1 — Normal acquire/release plus crash recovery diagram

[![Scenario 1 — Normal acquire/release plus crash recovery diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/e70146330302758f563a46b7286e3ce25f1bac49/docs/images/readme-diagrams/leader-redis-redisson-sequence-02.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/e70146330302758f563a46b7286e3ce25f1bac49/docs/images/readme-diagrams/leader-redis-redisson-sequence-02.svg)

_Release README: [`leader-redis-redisson/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/e70146330302758f563a46b7286e3ce25f1bac49/leader-redis-redisson/README.md)_

### Scenario 2 — minLeaseTime via updateLeaseTime diagram

[![Scenario 2 — minLeaseTime via updateLeaseTime diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/e70146330302758f563a46b7286e3ce25f1bac49/docs/images/readme-diagrams/leader-redis-redisson-sequence-03.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/e70146330302758f563a46b7286e3ce25f1bac49/docs/images/readme-diagrams/leader-redis-redisson-sequence-03.svg)

_Release README: [`leader-redis-redisson/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/e70146330302758f563a46b7286e3ce25f1bac49/leader-redis-redisson/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

[Elector](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-redis-redisson/src/main/kotlin/io/bluetape4k/leader/redisson/RedissonLeaderElector.kt) · [Shared extender delegate](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-redis-redisson/src/main/kotlin/io/bluetape4k/leader/redisson/internal/RedissonLockExtendDelegate.kt) · [Stable guide](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-redis-redisson/README.md)
