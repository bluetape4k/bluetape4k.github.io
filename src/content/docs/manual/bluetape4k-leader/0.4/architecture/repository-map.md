---
slug: "manual/bluetape4k-leader/0.4/architecture/repository-map"
title: "Repository and learning map"
description: "Understand which modules define contracts, implement storage, integrate frameworks, and demonstrate complete scenarios."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "architecture/repository-map"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "848f79344c636456cebe2069e18f732840bf680d"
  sourcePath: "docs/manual/en/architecture/repository-map.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


Understand which modules define contracts, implement storage, integrate frameworks, and demonstrate complete scenarios.

![Leader repository and learning map](/manual-assets/bluetape4k-leader/0.4/overview/repository-learning-map.png)

## Four layers

`leader-core` owns API semantics and local implementations. Backend modules implement those contracts against Redis, SQL, document stores, coordination systems, or Kubernetes. Framework modules integrate Spring Boot, Ktor, and Micrometer. The 17 `examples/*` projects combine these pieces into runnable operational scenarios.

## Choose by responsibility

Read core before a backend so contention, cancellation, and lease semantics remain stable when infrastructure changes. Read a framework page only after choosing an elector. Use examples to validate startup, shutdown, metrics, and failure behavior; do not add example projects as dependencies because they are excluded from publication.

## Stable and preview

Release 0.4.0 marks core, Redis, Exposed, MongoDB, Hazelcast, ZooKeeper, framework integrations, and Micrometer as stable. DynamoDB, etcd, Consul, and Kubernetes are preview modules. Preview means the operational contract deserves extra integration tests and rollback planning, not that contention semantics change.

## Release sources

- [`settings.gradle.kts`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/settings.gradle.kts)
- [`README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/README.md)
- [`build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/build.gradle.kts)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Learning path](/manual/bluetape4k-leader/0.4/guides/learning-path/)
- [Choose a backend](/manual/bluetape4k-leader/0.4/guides/backend-selection/)
