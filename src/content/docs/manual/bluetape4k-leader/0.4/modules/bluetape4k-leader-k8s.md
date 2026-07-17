---
slug: "manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-k8s"
manualId: "bluetape4k-leader-k8s"
id: "bluetape4k-leader-k8s"
title: "Kubernetes Lease backend"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-k8s"
sourceDir: "leader-k8s"
releaseRef: "0.4.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-k8s
manual:
  id: "bluetape4k-leader-k8s"
  repository: "bluetape4k-leader"
  group: "backends"
  kind: "library"
  sourceCommit: "dba8da7f095bd73aa5fb595b3b0741dcffd0e494"
  sourcePath: "docs/manual/en/modules/bluetape4k-leader-k8s.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "leader-k8s"
  layer: "build"
---


> Library module

## Problem

> **Preview:** Validate API and operational behavior before production adoption.

Preview backend using `coordination.k8s.io/v1` Lease objects for single and fixed-slot group election. It offers blocking, future, and coroutine APIs.

## When to use it

Choose it for workloads that already run in Kubernetes and should use native RBAC and namespace boundaries rather than another coordination store.

## Coordinates

Artifact: `io.github.bluetape4k.leader:bluetape4k-leader-k8s`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-k8s")
}
```

## Core concepts

Each acquisition writes a unique fencing token into a Lease holder identity. Update, extend, and release are resource-version/owner conditional; the supplied Fabric8 client is caller-owned.

## Quick start

```kotlin
val elector = KubernetesLeaseLeaderElector(
    client,
    KubernetesLeaseOptions(namespace = "operators")
)
elector.runIfLeader("reconcile") { reconcile() }
```

## API by task

Use `KubernetesLeaseLeaderElector`, suspend, and group variants. Client extension functions provide compact blocking and future calls.

## Recommended patterns

Grant least-privilege get/create/update permissions for Leases in one namespace. Use deterministic names and keep the protected action idempotent.

## Integrations

Spring can create a factory from the client. k8s-lease and k8s-operator examples show scheduled and control-loop use.

## Configuration

Configure namespace, name prefix, wait/lease/minimum lease, retry delay, and group size. Client endpoint, authentication, and lifecycle belong to the application.

## Failure modes

Contention and resource-version conflicts within the budget skip/retry. RBAC denial, API outage, malformed Lease state, and cleanup failure propagate.

## Operations

Monitor Kubernetes API latency, 409 conflicts, 403 errors, lease renewal age, stale objects, and client throttling. Include namespace and Lease name in diagnostics.

## Testing

Use a real API server or faithful test environment for two-client conflict, resource-version races, expiry, owner-safe release, group slots, and cancellation.

## Workshops and learning path

Run k8s-lease first, then k8s-operator. Compare this control-plane dependency with etcd without assuming direct etcd access is equivalent.

## Limitations

Preview API may evolve. Kubernetes API availability, RBAC, and rate limits are on the execution path; Lease ownership does not fence an external database.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `0.4.0` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### leader-k8s architecture diagram

[![leader-k8s architecture diagram](/manual-assets/bluetape4k-leader/0.4/readme-diagrams/leader-k8s-architecture-01.png)](../../assets/readme-diagrams/leader-k8s-architecture-01.svg)

_Release README: [`leader-k8s/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/17ab7f872c1f96318c73d3580729cac20a67e017/leader-k8s/README.md)_

### leader-k8s acquire and release sequence diagram

[![leader-k8s acquire and release sequence diagram](/manual-assets/bluetape4k-leader/0.4/readme-diagrams/leader-k8s-sequence-02.png)](../../assets/readme-diagrams/leader-k8s-sequence-02.svg)

_Release README: [`leader-k8s/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/17ab7f872c1f96318c73d3580729cac20a67e017/leader-k8s/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

[Elector](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-k8s/src/main/kotlin/io/bluetape4k/leader/k8s/KubernetesLeaseLeaderElector.kt) · [Options](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-k8s/src/main/kotlin/io/bluetape4k/leader/k8s/KubernetesLeaseOptions.kt) · [Stable guide](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-k8s/README.md)
