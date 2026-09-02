---
slug: "manual/bluetape4k-leader/1.0/frameworks/ktor"
title: "Ktor integration"
description: "Install an application-scoped suspend elector and bind periodic attempts to Ktor shutdown."
releaseRef: 1.0.0
releaseCommit: e70146330302758f563a46b7286e3ce25f1bac49
manual:
  id: "frameworks/ktor"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/frameworks/ktor.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "docs/manual/bluetape4k-leader"
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

- [`leader-ktor/src/main/kotlin/io/bluetape4k/leader/ktor/LeaderElectionPlugin.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-ktor/src/main/kotlin/io/bluetape4k/leader/ktor/LeaderElectionPlugin.kt)
- [`leader-ktor/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-ktor/README.md)
- [`examples/ktor-app/src/test/kotlin/io/bluetape4k/leader/examples/ktor/KtorAppTest.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/examples/ktor-app/src/test/kotlin/io/bluetape4k/leader/examples/ktor/KtorAppTest.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/1.0/)
- [Spring Boot or Ktor](/manual/bluetape4k-leader/1.0/guides/spring-vs-ktor/)
- [Migrate a scheduled job](/manual/bluetape4k-leader/1.0/guides/scheduled-job-migration/)
