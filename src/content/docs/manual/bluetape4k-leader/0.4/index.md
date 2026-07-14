---
slug: "manual/bluetape4k-leader/0.4"
title: "Bluetape4k Leader manual"
description: "A release-faithful guide to choosing, running, and operating distributed leader election with bluetape4k-leader 0.4.0."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "index"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "848f79344c636456cebe2069e18f732840bf680d"
  sourcePath: "docs/manual/en/index.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


A release-faithful guide to choosing, running, and operating distributed leader election with bluetape4k-leader 0.4.0.

![Leader repository and learning map](/manual-assets/bluetape4k-leader/0.4/overview/repository-learning-map.png)

## Start with the decision, not the backend

Leader election is useful when every service instance can see the same work but only one, or a bounded number, should execute it. This manual starts with execution semantics and failure boundaries before it asks you to choose Redis, SQL, MongoDB, or a control-plane lease.

The central contract is deliberate: ordinary contention is not an error. `runIfLeader()` executes the action when elected and returns `null` when another contender owns the lease. Use the result APIs when the action itself may return `null`.

## Recommended route

1. Follow [Getting started](/manual/bluetape4k-leader/0.4/getting-started/) with a local elector.
2. Choose [single, group, or strategic election](/manual/bluetape4k-leader/0.4/guides/election-model-selection/).
3. Match the API to [blocking, future, virtual-thread, or coroutine execution](/manual/bluetape4k-leader/0.4/guides/execution-model-selection/).
4. Select a [backend](/manual/bluetape4k-leader/0.4/guides/backend-selection/) from infrastructure you already operate.
5. Define the [lease lifecycle](/manual/bluetape4k-leader/0.4/guides/lease-lifecycle/), then add [metrics and runbooks](/manual/bluetape4k-leader/0.4/guides/observability-and-operations/).

## Reference by task

- Learn the shared contract in [Leader core](/manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-core/).
- Compare [Lettuce](/manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-redis-lettuce/) and [Redisson](/manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-redis-redisson/) for Redis.
- Choose [Exposed JDBC](/manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-exposed-jdbc/) or [Exposed R2DBC](/manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-exposed-r2dbc/) for SQL-backed election.
- Integrate with [Spring Boot](/manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-spring-boot/), [Ktor](/manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-ktor/), or [Micrometer](/manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-micrometer/).
- Start from a runnable scenario such as the [batch scheduler](/manual/bluetape4k-leader/0.4/modules/batch-scheduler/), [migration gate](/manual/bluetape4k-leader/0.4/modules/migration-gate/), or [Prometheus dashboard](/manual/bluetape4k-leader/0.4/modules/prometheus-dashboard/).

## Release boundary

Every behavior and source link in this manual targets release `0.4.0` at commit `17ab7f872c1f96318c73d3580729cac20a67e017`. Examples are learning projects, not published artifacts. Application builds should normally import `io.github.bluetape4k:bluetape4k-dependencies` and omit versions from individual leader modules.

## Release sources

- [`README.md`](../../../README.md)
- [`leader-core/README.md`](../../../leader-core/README.md)
- [`settings.gradle.kts`](../../../settings.gradle.kts)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Learning path](/manual/bluetape4k-leader/0.4/guides/learning-path/)
- [Runtime model](/manual/bluetape4k-leader/0.4/architecture/runtime-model/)
