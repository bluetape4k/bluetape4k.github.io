---
slug: "manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-ktor"
manualId: "bluetape4k-leader-ktor"
id: "bluetape4k-leader-ktor"
title: "Ktor integration"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-ktor"
sourceDir: "leader-ktor"
releaseRef: "0.4.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-ktor
manual:
  id: "bluetape4k-leader-ktor"
  repository: "bluetape4k-leader"
  group: "frameworks"
  kind: "library"
  sourceCommit: "848f79344c636456cebe2069e18f732840bf680d"
  sourcePath: "docs/manual/en/modules/bluetape4k-leader-ktor.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "leader-ktor"
  layer: "build"
---


> Library module

## Problem

Integrates a suspend elector with Ktor 3 through `LeaderElectionPlugin`, `leaderScheduled`, and an optional management route. It binds job lifetime to the application lifecycle.

## When to use it

Use it when a Ktor service owns coroutine jobs that should run on only one node. Use Spring integration for proxy/annotation-driven methods.

## Coordinates

Artifact: `io.github.bluetape4k.leader:bluetape4k-leader-ktor`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-ktor")
}
```

## Core concepts

The plugin resolves one `SuspendLeaderElector`; scheduled jobs run in application-owned coroutine scope and stop on shutdown. Contention skips the iteration rather than failing the server.

## Quick start

```kotlin
install(LeaderElectionPlugin) {
    leaderElection = mySuspendElector
}
leaderScheduled("projection-refresh", 1.minutes) {
    refreshProjection()
}
```

## API by task

Install the plugin for elector ownership, call `leaderScheduled` for periodic suspend work, and expose management routes only under an authenticated operations boundary.

## Recommended patterns

Install once, choose stable lock names, keep actions shorter than the lease or extend safely, and make shutdown cancellation part of the job contract.

## Integrations

Any suspend backend can be supplied. The ktor-app example shows plugin installation, scheduling, and lifecycle together.

## Configuration

Configure the elector in its backend module, then set schedule interval/delay and Ktor scope ownership. Do not create a hidden second client inside each job.

## Failure modes

A missing plugin or elector is a startup configuration failure. Direct elector calls propagate backend and action failures. `Application.leaderScheduled` catches non-cancellation `Exception`, logs it at WARN, suppresses that iteration, and continues with the next cycle; normal contention still skips. Cancellation stops scheduling and lets the elector release owned state.

## Operations

Measure scheduled attempts, elected runs, skips, failures, duration, and shutdown completion. Keep management endpoints authenticated and low-cardinality.

## Testing

Use Ktor test application for plugin configuration and schedule lifecycle, plus backend integration tests for ownership. Verify shutdown during acquire and action.

## Workshops and learning path

Run ktor-app, then follow the chosen backend page. Compare with Spring when deciding explicit scheduling versus AOP annotations.

## Limitations

The integration schedules jobs; it does not provide durable scheduling, missed-run recovery, cron persistence, or exactly-once delivery.

## Sources

[Plugin](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-ktor/src/main/kotlin/io/bluetape4k/leader/ktor/LeaderElectionPlugin.kt) · [Scheduling extension](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-ktor/src/main/kotlin/io/bluetape4k/leader/ktor/ApplicationExt.kt) · [Stable guide](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-ktor/README.md)
