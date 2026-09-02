---
slug: "manual/bluetape4k-leader/1.0"
title: "Bluetape4k Leader manual"
description: "A release-faithful guide to choosing, running, and operating distributed leader election with bluetape4k-leader 1.0.0."
releaseRef: 1.0.0
releaseCommit: e70146330302758f563a46b7286e3ce25f1bac49
manual:
  id: "index"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/index.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "docs/manual/bluetape4k-leader"
  layer: "build"
---


A release-faithful guide to choosing, running, and operating distributed leader election with bluetape4k-leader 1.0.0.

![Leader repository and learning map](/manual-assets/bluetape4k-leader/1.0/overview/repository-learning-map.png)

## Core capabilities

- **Election models:** [Single, group, and strategic election](/manual/bluetape4k-leader/1.0/core/single-group-strategic/) support one global leader, bounded parallel leaders, and policy-driven ownership.
- **Execution APIs:** [Blocking, future, virtual-thread, and coroutine APIs](/manual/bluetape4k-leader/1.0/core/execution-apis/) preserve the same election result semantics across application execution models.
- **Lease lifecycle:** [Lease extension](/manual/bluetape4k-leader/1.0/core/lease-extension/) and the [lease lifecycle guide](/manual/bluetape4k-leader/1.0/guides/lease-lifecycle/) define wait time, lease time, minimum hold, renewal, release, and loss behavior.
- **Distributed backends:** The [backend selection guide](/manual/bluetape4k-leader/1.0/guides/backend-selection/) covers Redis, SQL, document stores, cluster coordination systems, and control-plane leases without changing the core contract.
- **Framework integration:** [Spring Boot](/manual/bluetape4k-leader/1.0/frameworks/spring-boot/), [Ktor](/manual/bluetape4k-leader/1.0/frameworks/ktor/), and [Micrometer](/manual/bluetape4k-leader/1.0/frameworks/micrometer/) modules connect configuration, lifecycle, and metrics to the host application.
- **Operations and workshops:** [Observability and operations](/manual/bluetape4k-leader/1.0/guides/observability-and-operations/) plus runnable scheduler, migration, and dashboard examples turn election behavior into deployable runbooks.

## Start with the decision, not the backend

Leader election is useful when every service instance can see the same work but only one, or a bounded number, should execute it. This manual starts with execution semantics and failure boundaries before it asks you to choose Redis, SQL, MongoDB, or a control-plane lease.

The central contract is deliberate: ordinary contention is not an error. `runIfLeader()` executes the action when elected and returns `null` when another contender owns the lease. Use the result APIs when the action itself may return `null`.

## Recommended route

1. Follow [Getting started](/manual/bluetape4k-leader/1.0/getting-started/) with a local elector.
2. Choose [single, group, or strategic election](/manual/bluetape4k-leader/1.0/guides/election-model-selection/).
3. Match the API to [blocking, future, virtual-thread, or coroutine execution](/manual/bluetape4k-leader/1.0/guides/execution-model-selection/).
4. Select a [backend](/manual/bluetape4k-leader/1.0/guides/backend-selection/) from infrastructure you already operate.
5. Define the [lease lifecycle](/manual/bluetape4k-leader/1.0/guides/lease-lifecycle/), then add [metrics and runbooks](/manual/bluetape4k-leader/1.0/guides/observability-and-operations/).

## Reference by task

- Learn the shared contract in [Leader core](/manual/bluetape4k-leader/1.0/modules/bluetape4k-leader-core/).
- Compare [Lettuce](/manual/bluetape4k-leader/1.0/modules/bluetape4k-leader-redis-lettuce/) and [Redisson](/manual/bluetape4k-leader/1.0/modules/bluetape4k-leader-redis-redisson/) for Redis.
- Choose [Exposed JDBC](/manual/bluetape4k-leader/1.0/modules/bluetape4k-leader-exposed-jdbc/) or [Exposed R2DBC](/manual/bluetape4k-leader/1.0/modules/bluetape4k-leader-exposed-r2dbc/) for SQL-backed election.
- Integrate with [Spring Boot](/manual/bluetape4k-leader/1.0/modules/bluetape4k-leader-spring-boot/), [Ktor](/manual/bluetape4k-leader/1.0/modules/bluetape4k-leader-ktor/), or [Micrometer](/manual/bluetape4k-leader/1.0/modules/bluetape4k-leader-micrometer/).
- Start from a runnable scenario such as the [batch scheduler](/manual/bluetape4k-leader/1.0/modules/batch-scheduler/), [migration gate](/manual/bluetape4k-leader/1.0/modules/migration-gate/), or [Prometheus dashboard](/manual/bluetape4k-leader/1.0/modules/prometheus-dashboard/).

## Release boundary

Every behavior and source link in this manual targets release `1.0.0` at commit `e70146330302758f563a46b7286e3ce25f1bac49`. Examples are learning projects, not published artifacts. Application builds should normally import `io.github.bluetape4k:bluetape4k-dependencies` and omit versions from individual leader modules.

## Release sources

- [`README.md`](../../../README.md)
- [`leader-core/README.md`](../../../leader-core/README.md)
- [`settings.gradle.kts`](../../../settings.gradle.kts)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/1.0/)
- [Learning path](/manual/bluetape4k-leader/1.0/guides/learning-path/)
- [Runtime model](/manual/bluetape4k-leader/1.0/architecture/runtime-model/)
