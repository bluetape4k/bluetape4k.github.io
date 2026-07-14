---
slug: "manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-etcd"
manualId: "bluetape4k-leader-etcd"
id: "bluetape4k-leader-etcd"
title: "etcd backend"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-etcd"
sourceDir: "leader-etcd"
releaseRef: "0.4.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-etcd
manual:
  id: "bluetape4k-leader-etcd"
  repository: "bluetape4k-leader"
  group: "backends"
  kind: "library"
  sourceCommit: "6bb3ba3f6cdc1286b5ee7d8b7b47d9e92f9c6e3d"
  sourcePath: "docs/manual/en/modules/bluetape4k-leader-etcd.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "leader-etcd"
  layer: "build"
---


> Library module

## Problem

> **Preview:** Validate API and operational behavior before production adoption.

Preview backend using etcd v3 leases and the jetcd Lock service for single and group election, with blocking, future, coroutine, and virtual-thread surfaces.

## When to use it

Use it when etcd is already a reliable control-plane dependency and lease semantics fit the workload.

## Coordinates

Artifact: `io.github.bluetape4k.leader:bluetape4k-leader-etcd`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-etcd")
}
```

## Core concepts

Acquisition creates a lease and lock key; owner-safe release and extension use the returned token. The supplied jetcd client is caller-owned.

## Quick start

```kotlin
val elector = EtcdLeaderElector(
    client,
    EtcdLeaderElectionOptions(keyPrefix = "/apps/orders/leader")
)
elector.runIfLeader("reconcile") { reconcile() }
```

## API by task

Use `EtcdLeaderElector`, suspend, virtual-thread, or group variants. Factories supply Core and framework integrations.

## Recommended patterns

Use a dedicated prefix and least-privilege credentials. Keep actions idempotent and account for lease loss during pauses or partitions.

## Integrations

Spring can construct factories from a client. The etcd-reconciler example demonstrates a control-loop workload.

## Configuration

Configure endpoint in the caller-owned client, key prefix, wait/lease/minimum lease, retry delay, and cleanup timeout budget.

## Failure modes

Contention skips. Lease grant, keepalive, lock, cleanup timeout, authentication, and transport failures propagate after classification.

## Operations

Watch lease keepalive, request latency, compaction/cluster health, cleanup failures, and skipped work. Client closure belongs to the application.

## Testing

Use a real etcd container for acquire/release, lease expiry, key encoding, cleanup timeout, group slots, and cancellation.

## Workshops and learning path

Run etcd-reconciler, then compare etcd leases with Consul sessions and Kubernetes Lease objects.

## Limitations

Preview API may evolve. etcd availability is now on the job path; a lease is not a business-side fencing token.

## Sources

[Elector](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-etcd/src/main/kotlin/io/bluetape4k/leader/etcd/EtcdLeaderElector.kt) · [Options](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-etcd/src/main/kotlin/io/bluetape4k/leader/etcd/EtcdLeaderElectionOptions.kt) · [Stable guide](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-etcd/README.md)
