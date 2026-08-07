---
slug: "manual/bluetape4k-leader/0.5/modules/bluetape4k-leader-zookeeper"
manualId: "bluetape4k-leader-zookeeper"
id: "bluetape4k-leader-zookeeper"
title: "ZooKeeper backend"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-zookeeper"
sourceDir: "leader-zookeeper"
releaseRef: "0.5.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-zookeeper
manual:
  id: "bluetape4k-leader-zookeeper"
  repository: "bluetape4k-leader"
  group: "backends"
  kind: "library"
  sourceCommit: "5a4837e374df53c5a2c272b7a1d883f07abda6ae"
  sourcePath: "docs/manual/en/modules/bluetape4k-leader-zookeeper.md"
  minorVersion: "0.5"
  releaseRef: "0.5.0"
  releaseCommit: "721a9a3808f67489d2bdb8177734325981c24977"
  sourceDir: "leader-zookeeper"
  layer: "build"
---


> Library module

## Problem

Implements single and group election with Apache Curator `InterProcessMutex` and `InterProcessSemaphoreV2`, including blocking, future, and coroutine APIs.

## When to use it

Choose it when ZooKeeper/Curator is already a supported coordination plane and session-bound ownership is understood operationally.

## Coordinates

Artifact: `io.github.bluetape4k.leader:bluetape4k-leader-zookeeper`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-zookeeper")
}
```

## Core concepts

Ephemeral recipe nodes disappear when the ZooKeeper session expires. `leaseTime` is accepted for Core API consistency but is not the actual release boundary. Suspend single election preserves Curator's acquire/release owner-thread rule.

## Quick start

```kotlin
val curator = CuratorFrameworkFactory.newClient(connect, retry).apply { start() }
val elector = ZooKeeperLeaderElector(curator)
elector.runIfLeader("daily-report") { generateReport() }
```

## API by task

Use single/group blocking electors, async methods, suspend variants, client extensions, and factories. The Curator client is caller-owned.

## Recommended patterns

Use a dedicated base path, stable session settings, bounded retries, and idempotent actions. Treat session suspension/loss as an ownership event.

## Integrations

Spring can consume factories. zookeeper-scheduler demonstrates a scheduled workload and client lifecycle.

## Configuration

Configure base path, wait time, group size, Curator connection/session timeout, retry policy, ACL, and ensemble endpoints. Do not interpret Core `leaseTime` as ZooKeeper TTL.

## Failure modes

Contention skips. Connection suspension/loss, session expiry, ACL, retry exhaustion, and Curator recipe failures propagate. Session loss releases ownership independently of the action.

## Operations

Monitor connection state, session expiry, ensemble latency, retries, znode growth, group permits, and skipped work. Close Curator only during application shutdown.

## Testing

Use a real ZooKeeper container for session loss, owner-thread release, two-client contention, group permits, extension expectations, async completion, and coroutine cancellation.

## Workshops and learning path

Run zookeeper-scheduler, then compare session-bound ownership with TTL-based Redis and lease-based etcd.

## Limitations

No fixed TTL guarantees release at `leaseTime`; session timeout controls it. ZooKeeper ownership does not fence an external side effect.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `0.5.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### leader zookeeper Class Structure diagram

[![leader zookeeper Class Structure diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-zookeeper-class-01.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-zookeeper-class-01.svg)

_Release README: [`leader-zookeeper/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/leader-zookeeper/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

[Elector](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-zookeeper/src/main/kotlin/io/bluetape4k/leader/zookeeper/ZooKeeperLeaderElector.kt) · [Suspend elector](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-zookeeper/src/main/kotlin/io/bluetape4k/leader/zookeeper/ZooKeeperSuspendLeaderElector.kt) · [Stable guide](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-zookeeper/README.md)
