---
slug: "manual/bluetape4k-leader/0.4/guides/backend-selection"
title: "Choose a backend"
description: "Prefer infrastructure you already operate, then compare ownership, clock, and failure semantics."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "guides/backend-selection"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "6bb3ba3f6cdc1286b5ee7d8b7b47d9e92f9c6e3d"
  sourcePath: "docs/manual/en/guides/backend-selection.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


Prefer infrastructure you already operate, then compare ownership, clock, and failure semantics.

![Leader backend selection map](/manual-assets/bluetape4k-leader/0.4/backends/backend-selection-map.png)

## Selection order

First ask which durable service is already mandatory for the application. Redis is a strong low-latency default. Exposed JDBC/R2DBC keeps election state with application SQL data. MongoDB and DynamoDB fit document/key-value estates. etcd, Consul, Kubernetes Lease, and ZooKeeper fit control-plane coordination. Hazelcast fits an existing Hazelcast cluster without requiring its CP subsystem.

## Semantics to compare

Check atomic acquire and owner-conditional release, the source of expiry time, session versus TTL ownership, group support, suspend support, and auto-extension support. Also check whether a state query can report owner and expiry precisely. These differences affect operations even when `runIfLeader()` has the same API.

## Avoid infrastructure by benchmark

The bundled JMH results are same-machine comparison evidence, not a universal ranking. Network topology, durability settings, connection pools, and failure recovery dominate production behavior. Choose by operational fit, then benchmark your own action and environment.

## Release sources

- [`README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/README.md)
- [`benchmark/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/benchmark/README.md)
- [`docs/benchmarks/2026-05-21-leader-cross-backend-baseline.md`](../../../benchmarks/2026-05-21-leader-cross-backend-baseline.md)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Redis backends](/manual/bluetape4k-leader/0.4/backends/redis/)
- [etcd, Consul, and Kubernetes Lease](/manual/bluetape4k-leader/0.4/backends/control-plane-leases/)
- [Testing leader election](/manual/bluetape4k-leader/0.4/guides/testing/)
