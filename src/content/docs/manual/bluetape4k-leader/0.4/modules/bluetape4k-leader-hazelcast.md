---
slug: "manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-hazelcast"
manualId: "bluetape4k-leader-hazelcast"
id: "bluetape4k-leader-hazelcast"
title: "Hazelcast backend"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-hazelcast"
sourceDir: "leader-hazelcast"
releaseRef: "0.4.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-hazelcast
manual:
  id: "bluetape4k-leader-hazelcast"
  repository: "bluetape4k-leader"
  group: "backends"
  kind: "library"
  sourceCommit: "9f8a2152256c1a1ccf4fdbb7d731cf7d6273d700"
  sourcePath: "docs/manual/en/modules/bluetape4k-leader-hazelcast.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "leader-hazelcast"
  layer: "build"
---


> Library module

## Problem

Implements single and fixed-slot group election with Hazelcast `IMap` TTL entries and owner tokens. Blocking, future, and coroutine paths share the Core skip-on-contention contract.

## When to use it

Choose it when the application already operates a Hazelcast cluster and wants coordination in the same failure domain.

## Coordinates

Artifact: `io.github.bluetape4k.leader:bluetape4k-leader-hazelcast`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-hazelcast")
}
```

## Core concepts

`putIfAbsent` plus TTL acquires a token-owned entry. The lock is not thread-bound; extend and release must still verify the token so an old holder cannot modify a newer lease.

## Quick start

```kotlin
val elector = HazelcastLeaderElector(
    hazelcastInstance,
    LeaderElectionOptions(leaseTime = 30.seconds)
)
elector.runIfLeader("cache-warmer") { warmCache() }
```

## API by task

Use single/group electors and suspend variants; factories connect framework integrations. State APIs read the shared map but do not grant execution rights.

## Recommended patterns

Keep the Hazelcast instance caller-owned, use stable lock names, leave capacity for election maps, and make protected work idempotent.

## Integrations

Spring factories can use a `HazelcastInstance`. The cache-warmer example demonstrates an ordinary scheduled workload.

## Configuration

Tune wait, lease, minimum lease, group size, cluster discovery, split-brain protection, and map backup policy. The default single-lock map is `bluetape4k:leader:locks`.

## Failure modes

Contention returns `null`. Cluster disconnects, serialization/configuration errors, and owner-safe extend/release failures propagate. TTL expiry can overlap a paused old action.

## Operations

Monitor cluster membership, partition migration, map operation latency, backup health, extension failures, and skip rate.

## Testing

Use a multi-member test cluster for contention, partition/membership changes, TTL expiry, owner-token release, group slots, and suspend cancellation.

## Workshops and learning path

Run cache-warmer, then compare the in-memory distributed model with Redis and MongoDB backends.

## Limitations

Hazelcast availability and split-brain policy become election dependencies. TTL ownership is not an external fencing token.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `0.4.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### leader-hazelcast implementation structure diagram

[![leader-hazelcast implementation structure diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/17ab7f872c1f96318c73d3580729cac20a67e017/docs/images/readme-diagrams/leader-hazelcast-class-01.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/17ab7f872c1f96318c73d3580729cac20a67e017/docs/images/readme-diagrams/leader-hazelcast-class-01.svg)

_Release README: [`leader-hazelcast/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/17ab7f872c1f96318c73d3580729cac20a67e017/leader-hazelcast/README.md)_

### Lock acquire/release sequence diagram

[![Lock acquire/release sequence diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/17ab7f872c1f96318c73d3580729cac20a67e017/docs/images/readme-diagrams/leader-hazelcast-sequence-02.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/17ab7f872c1f96318c73d3580729cac20a67e017/docs/images/readme-diagrams/leader-hazelcast-sequence-02.svg)

_Release README: [`leader-hazelcast/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/17ab7f872c1f96318c73d3580729cac20a67e017/leader-hazelcast/README.md)_

### Group election slot sequence (maxLeaders = N) diagram

[![Group election slot sequence (maxLeaders = N) diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/17ab7f872c1f96318c73d3580729cac20a67e017/docs/images/readme-diagrams/leader-hazelcast-sequence-03.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/17ab7f872c1f96318c73d3580729cac20a67e017/docs/images/readme-diagrams/leader-hazelcast-sequence-03.svg)

_Release README: [`leader-hazelcast/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/17ab7f872c1f96318c73d3580729cac20a67e017/leader-hazelcast/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

[Elector](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-hazelcast/src/main/kotlin/io/bluetape4k/leader/hazelcast/HazelcastLeaderElector.kt) · [Lock implementation](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-hazelcast/src/main/kotlin/io/bluetape4k/leader/hazelcast/lock/HazelcastLock.kt) · [Stable guide](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-hazelcast/README.md)
