---
slug: "manual/bluetape4k-leader/0.4/frameworks/ktor"
title: "Ktor integration"
description: "Install an application-scoped suspend elector and bind periodic attempts to Ktor shutdown."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "frameworks/ktor"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "6bb3ba3f6cdc1286b5ee7d8b7b47d9e92f9c6e3d"
  sourcePath: "docs/manual/en/frameworks/ktor.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


Install an application-scoped suspend elector and bind periodic attempts to Ktor shutdown.

## Plugin

`LeaderElectionPlugin` exposes a configured `SuspendLeaderElector` through the Ktor application. The application decides which backend client and elector it owns. Keep one lifecycle owner so plugin shutdown does not race a separately closed client.

## Scheduling

`Application.leaderScheduled(lockName, period) { ... }` launches periodic election attempts. Only the elected instance runs the body, and the job is cancelled on `ApplicationStopped`. Set lease longer than one normal iteration or use a supported extension strategy for variable work.

## What remains yours

The helper does not persist missed schedules, serialize retries, or make side effects idempotent. Record durable work state if a run must be recovered. Test two Ktor applications against one backend and verify both exclusive execution and shutdown cancellation.

## Release sources

- [`leader-ktor/src/main/kotlin/io/bluetape4k/leader/ktor/LeaderElectionPlugin.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-ktor/src/main/kotlin/io/bluetape4k/leader/ktor/LeaderElectionPlugin.kt)
- [`leader-ktor/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-ktor/README.md)
- [`examples/ktor-app/src/test/kotlin/io/bluetape4k/leader/examples/ktor/KtorAppTest.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/examples/ktor-app/src/test/kotlin/io/bluetape4k/leader/examples/ktor/KtorAppTest.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.4/)
- [Spring Boot or Ktor](/manual/bluetape4k-leader/0.4/guides/spring-vs-ktor/)
- [Migrate a scheduled job](/manual/bluetape4k-leader/0.4/guides/scheduled-job-migration/)
