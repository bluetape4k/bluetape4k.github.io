---
slug: "manual/bluetape4k-leader/1.0/guides/scheduled-job-migration"
title: "Migrate a scheduled job"
description: "Add election around an idempotent job without mistaking it for durable scheduling."
releaseRef: 1.0.0
releaseCommit: e70146330302758f563a46b7286e3ce25f1bac49
manual:
  id: "guides/scheduled-job-migration"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/guides/scheduled-job-migration.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "docs/manual/bluetape4k-leader"
  layer: "build"
---


Add election around an idempotent job without mistaking it for durable scheduling.

## Before wrapping

Give the job a stable logical name, make its effects idempotent, record durable progress, and decide whether a missed run should be skipped, retried, or backfilled. Leader election only coordinates concurrent attempts; it does not persist a schedule.

## Wrap and size

Place only the mutually exclusive section inside `runIfLeader`. Keep unrelated preparation outside when safe. Derive lease time from measured execution and add an idempotency key to external writes. If one run can exceed the lease, enable a supported extension path or split the work.

## Rollout

Deploy first with metrics and no destructive cleanup. Confirm one elected event per schedule, expected skips on other nodes, bounded duration, and clean release. Rehearse leader termination. For Quartz, Spring Batch, or another durable scheduler, keep its recovery semantics and use election only where cross-instance exclusion is still needed.

## Release sources

- [`examples/batch-scheduler/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/examples/batch-scheduler/README.md)
- [`examples/migration-gate/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/examples/migration-gate/README.md)
- [`examples/ktor-app/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/examples/ktor-app/README.md)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/1.0/)
- [Lease lifecycle](/manual/bluetape4k-leader/1.0/guides/lease-lifecycle/)
- [Spring Boot or Ktor](/manual/bluetape4k-leader/1.0/guides/spring-vs-ktor/)
- [Testing leader election](/manual/bluetape4k-leader/1.0/guides/testing/)
