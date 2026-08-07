---
slug: "manual/bluetape4k-leader/0.5/guides/spring-vs-ktor"
title: "Spring Boot or Ktor"
description: "Choose integration from the host framework's lifecycle and invocation model, not feature count."
releaseRef: 0.5.0
releaseCommit: 721a9a3808f67489d2bdb8177734325981c24977
manual:
  id: "guides/spring-vs-ktor"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "5a4837e374df53c5a2c272b7a1d883f07abda6ae"
  sourcePath: "docs/manual/en/guides/spring-vs-ktor.md"
  minorVersion: "0.5"
  releaseRef: "0.5.0"
  releaseCommit: "721a9a3808f67489d2bdb8177734325981c24977"
  sourceDir: "docs/manual"
  layer: "build"
---


Choose integration from the host framework's lifecycle and invocation model, not feature count.

![Framework and observability ownership flow](/manual-assets/bluetape4k-leader/0.5/frameworks/framework-observability-flow.png)

## Spring Boot

Use the Spring module when electors should be auto-configured and methods guarded declaratively with `@LeaderElection` or `@LeaderGroupElection`. Release 0.5.0 uses AspectJ compile-time weaving, not proxy-only interception. It supports synchronous, suspend, Mono, Flux, and Flow shapes with stream-specific lease rules.

## Ktor

Use the Ktor plugin when the service already owns coroutine scheduling and wants an application-scoped `SuspendLeaderElector`. `leaderScheduled()` binds the periodic job to Ktor lifecycle and cancels it on `ApplicationStopped`.

## Boundary

Neither integration turns leader election into a scheduler or durable queue. Spring's annotation wraps an invocation; Ktor's helper launches a periodic coroutine. Misfire recovery, durable work state, retries, and idempotency still belong to the application or a job framework.

## Release sources

- [`leader-spring-boot/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-spring-boot/README.md)
- [`leader-ktor/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-ktor/README.md)
- [`examples/ktor-app/src/main/kotlin/io/bluetape4k/leader/examples/ktor/KtorAppMain.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/examples/ktor-app/src/main/kotlin/io/bluetape4k/leader/examples/ktor/KtorAppMain.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.5/)
- [Spring Boot integration](/manual/bluetape4k-leader/0.5/frameworks/spring-boot/)
- [Ktor integration](/manual/bluetape4k-leader/0.5/frameworks/ktor/)
- [Migrate a scheduled job](/manual/bluetape4k-leader/0.5/guides/scheduled-job-migration/)
