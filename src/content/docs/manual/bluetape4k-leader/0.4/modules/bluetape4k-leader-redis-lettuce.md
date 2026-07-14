---
slug: "manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-redis-lettuce"
manualId: "bluetape4k-leader-redis-lettuce"
id: "bluetape4k-leader-redis-lettuce"
title: "Redis Lettuce backend"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-redis-lettuce"
sourceDir: "leader-redis-lettuce"
releaseRef: "0.4.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-redis-lettuce
manual:
  id: "bluetape4k-leader-redis-lettuce"
  repository: "bluetape4k-leader"
  group: "backends"
  kind: "library"
  sourceCommit: "848f79344c636456cebe2069e18f732840bf680d"
  sourcePath: "docs/manual/en/modules/bluetape4k-leader-redis-lettuce.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "leader-redis-lettuce"
  layer: "build"
---


> Library module

## Problem

Implements single, fixed-slot group, and strategic election with Lettuce connections, token-owned Redis keys, Lua compare-and-delete/extend, and blocking/coroutine APIs.

## When to use it

Choose it when Redis is already operated and the application prefers Lettuce's connection model and explicit scripting.

## Coordinates

Artifact: `io.github.bluetape4k.leader:bluetape4k-leader-redis-lettuce`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-redis-lettuce")
}
```

## Core concepts

A unique token owns a TTL key. Lua scripts make release and extension conditional. Strategic election stores candidate metadata and applies Core strategies.

## Quick start

```kotlin
val elector = LettuceLeaderElector(connection)
elector.runIfLeader("daily-report") { generateReport() }
```

## API by task

Use the connection extension/factory, blocking/suspend single/group electors, and strategic electors. The connection is caller-owned.

## Recommended patterns

Use a dedicated key prefix, keep Redis client and connection lifecycle explicit, make actions idempotent, and plan behavior during failover.

## Integrations

Spring can build factories from Lettuce resources. strategic-election and rate-limiter show candidate and group patterns.

## Configuration

Configure wait/lease/minimum lease, auto-extension, key prefix, group size, retry, client timeouts, topology refresh, and Redis durability policy.

## Failure modes

Contention returns `null`. Timeout, MOVED/topology, script, authentication, and extension failures propagate. Expired ownership can overlap an old paused action.

## Operations

Monitor command latency, reconnects, topology changes, script failures, keyspace/TTL, extension failure, skip rate, and Redis memory pressure.

## Testing

Use Redis integration tests for two connections, token-safe release, expiry, group slots, strategic registry, failover handling, and suspend cancellation.

## Workshops and learning path

Run strategic-election for candidate scoring and rate-limiter for group slots; compare Lettuce with Redisson's higher-level client model.

## Limitations

Redis availability and failover semantics are on the job path. A Redis token is not fencing for an external database.

## Sources

[Elector](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-redis-lettuce/src/main/kotlin/io/bluetape4k/leader/lettuce/LettuceLeaderElector.kt) · [Lua support](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-redis-lettuce/src/main/kotlin/io/bluetape4k/leader/lettuce/script/RedisScript.kt) · [Stable guide](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-redis-lettuce/README.md)
