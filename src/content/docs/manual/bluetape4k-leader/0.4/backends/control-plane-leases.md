---
slug: "manual/bluetape4k-leader/0.4/backends/control-plane-leases"
title: "etcd, Consul, and Kubernetes Lease"
description: "Use control-plane-native ownership where the control plane is already the system of record."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "backends/control-plane-leases"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "6bb3ba3f6cdc1286b5ee7d8b7b47d9e92f9c6e3d"
  sourcePath: "docs/manual/en/backends/control-plane-leases.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


Use control-plane-native ownership where the control plane is already the system of record.

## etcd

The preview etcd backend uses the v3 Lock service and leases, with single and group variants. Lease keepalive and client session health are central; test compaction, reconnect, and server quorum loss in the target topology.

## Consul

The preview Consul backend combines Sessions and KV. Session renewal defines liveness, and single/group blocking and suspend paths are available. Treat session invalidation and network partitions as ownership-loss events.

## Kubernetes

The preview Kubernetes backend writes `coordination.k8s.io/v1` Lease resources. It is appropriate for controllers and operators already governed by the cluster API. API-server availability, RBAC, namespace, lease duration, and pod termination grace all enter the operational contract.

## Boundary

Do not add a control plane only for a scheduled job. Choose these modules when the control plane is already authoritative and its availability objective is acceptable for the work.

## Release sources

- [`leader-etcd/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-etcd/README.md)
- [`leader-consul/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-consul/README.md)
- [`leader-k8s/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-k8s/README.md)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Choose a backend](/manual/bluetape4k-leader/0.4/guides/backend-selection/)
- [Observability and operations](/manual/bluetape4k-leader/0.4/guides/observability-and-operations/)
