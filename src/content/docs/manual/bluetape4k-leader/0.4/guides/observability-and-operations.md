---
slug: "manual/bluetape4k-leader/0.4/guides/observability-and-operations"
title: "Observability and operations"
description: "Observe decisions, duration, ownership loss, and backend health without making lock names unbounded labels."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "guides/observability-and-operations"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "9f8a2152256c1a1ccf4fdbb7d731cf7d6273d700"
  sourcePath: "docs/manual/en/guides/observability-and-operations.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


Observe decisions, duration, ownership loss, and backend health without making lock names unbounded labels.

## Signals

Track elected, skipped, action failure, execution duration, active ownership, and lease-extension outcomes. A skipped increase can be healthy contention or a stalled owner; interpret it with duration, state, and backend latency. Alert on sustained failures and non-transient extension errors rather than every skip.

## Cardinality

Lock names often contain tenant or job identifiers. Do not put raw unbounded names into metric tags. Normalize names in the application, pre-register static names, heed the recorder's warning for newly discovered names, and deregister retired dynamic names. Aggregate by stable job family and keep exact identifiers in structured logs or traces where retention is controlled.

## Runbook

For a suspected stuck job: confirm last elected/completed events, inspect effective history status, check backend connectivity and lease expiry, then determine whether the prior action can still write. Only after that should operators force cleanup or rerun. Record who made the decision and which fencing evidence was checked.

## Release sources

- [`leader-micrometer/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-micrometer/README.md)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/history/LeaderHistoryStatusExtensions.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/history/LeaderHistoryStatusExtensions.kt)
- [`examples/prometheus-dashboard/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/examples/prometheus-dashboard/README.md)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Micrometer integration](/manual/bluetape4k-leader/0.4/frameworks/micrometer/)
- [Identity, state, and history](/manual/bluetape4k-leader/0.4/guides/identity-state-and-history/)
- [Testing leader election](/manual/bluetape4k-leader/0.4/guides/testing/)
