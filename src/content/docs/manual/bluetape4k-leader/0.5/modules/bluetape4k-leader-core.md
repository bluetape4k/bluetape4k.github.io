---
slug: "manual/bluetape4k-leader/0.5/modules/bluetape4k-leader-core"
manualId: "bluetape4k-leader-core"
id: "bluetape4k-leader-core"
title: "Leader core library"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-core"
sourceDir: "leader-core"
releaseRef: "0.5.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-core
manual:
  id: "bluetape4k-leader-core"
  repository: "bluetape4k-leader"
  group: "foundation"
  kind: "library"
  sourceCommit: "5a4837e374df53c5a2c272b7a1d883f07abda6ae"
  sourcePath: "docs/manual/en/modules/bluetape4k-leader-core.md"
  minorVersion: "0.5"
  releaseRef: "0.5.0"
  releaseCommit: "721a9a3808f67489d2bdb8177734325981c24977"
  sourceDir: "leader-core"
  layer: "build"
---


> Library module

## Problem

Defines the common election contract and local implementations for blocking, `CompletableFuture`, virtual-thread, and coroutine code. Contention returns `null`; action failures propagate.

## When to use it

Use local electors for one-JVM coordination and tests. Select a backend module for cross-process ownership.

## Coordinates

Artifact: `io.github.bluetape4k.leader:bluetape4k-leader-core`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-core")
}
```

## Core concepts

Single election protects one lock; group election admits up to `maxLeaders` fixed slots. `LeaderRunResult` separates `Elected`, `Skipped`, and `ActionFailed`.

## Quick start

```kotlin
val elector = LocalLeaderElector(
    LeaderElectionOptions(waitTime = 500.milliseconds, leaseTime = 30.seconds)
)
val result = elector.runIfLeader("daily-report") { generateReport() }
```

## API by task

Use `runIfLeaderResult` when `null` is a valid action result. Use suspend, async, virtual-thread, group, or strategic electors according to the caller's execution model.

## Recommended patterns

Keep lock names stable and business-scoped. Make actions idempotent, size leases above normal duration, and use `autoExtend` only on supported single-leader paths.

## Integrations

All backends implement these interfaces. Spring maps annotations to factories, Ktor schedules suspend actions, and Micrometer decorates outcomes.

## Configuration

`waitTime` bounds acquisition, `leaseTime` is backend-specific, and `minLeaseTime` keeps a successful lock for a minimum duration.

## Failure modes

Contention is `null`/`Skipped`; backend failures are exceptions. Cancellation is rethrown, and blocking interruption restores the interrupt flag.

## Operations

Measure acquisition, skip, action failure, backend failure, and extension failure separately. Listener lease metadata is not proof of ownership.

## Testing

Cover winner/loser behavior, action exceptions, cancellation, release, group capacity, and listener order. Distributed backends still need real integration tests.

## Workshops and learning path

Read the lifecycle and model-selection guides, then run batch-scheduler and strategic-election examples before choosing a backend.

## Limitations

Local electors coordinate only one JVM. A distributed lease cannot roll back external side effects; use idempotency or fencing where duplicates are unsafe.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `0.5.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### leader-core API contract map

[![leader-core API contract map](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-core-class-01.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-core-class-01.svg)

_Release README: [`leader-core/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/leader-core/README.md)_

### Single-leader runIfLeader flow

[![Single-leader runIfLeader flow](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-core-sequence-02.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-core-sequence-02.svg)

_Release README: [`leader-core/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/leader-core/README.md)_

### Group-leader slot flow

[![Group-leader slot flow](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-core-sequence-03.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-core-sequence-03.svg)

_Release README: [`leader-core/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/leader-core/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

[Core contract](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElector.kt) · [Options](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElectionOptions.kt) · [Contract test](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/test/kotlin/io/bluetape4k/leader/LeaderRunResultTest.kt)
