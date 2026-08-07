---
slug: "manual/bluetape4k-leader/0.5/frameworks/ktor"
title: "Ktor integration"
description: "Install an application-scoped suspend elector and bind periodic attempts to Ktor shutdown."
releaseRef: 0.5.0
releaseCommit: 721a9a3808f67489d2bdb8177734325981c24977
manual:
  id: "frameworks/ktor"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "5a4837e374df53c5a2c272b7a1d883f07abda6ae"
  sourcePath: "docs/manual/en/frameworks/ktor.md"
  minorVersion: "0.5"
  releaseRef: "0.5.0"
  releaseCommit: "721a9a3808f67489d2bdb8177734325981c24977"
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

- [`leader-ktor/src/main/kotlin/io/bluetape4k/leader/ktor/LeaderElectionPlugin.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-ktor/src/main/kotlin/io/bluetape4k/leader/ktor/LeaderElectionPlugin.kt)
- [`leader-ktor/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-ktor/README.md)
- [`examples/ktor-app/src/test/kotlin/io/bluetape4k/leader/examples/ktor/KtorAppTest.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/examples/ktor-app/src/test/kotlin/io/bluetape4k/leader/examples/ktor/KtorAppTest.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.5/)
- [Spring Boot or Ktor](/manual/bluetape4k-leader/0.5/guides/spring-vs-ktor/)
- [Migrate a scheduled job](/manual/bluetape4k-leader/0.5/guides/scheduled-job-migration/)
