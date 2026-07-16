---
slug: "manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-micrometer"
manualId: "bluetape4k-leader-micrometer"
id: "bluetape4k-leader-micrometer"
title: "Micrometer instrumentation"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-micrometer"
sourceDir: "leader-micrometer"
releaseRef: "0.4.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-micrometer
manual:
  id: "bluetape4k-leader-micrometer"
  repository: "bluetape4k-leader"
  group: "frameworks"
  kind: "library"
  sourceCommit: "27627f5cf430ef2640d5847ecfeef914ea935c4c"
  sourcePath: "docs/manual/en/modules/bluetape4k-leader-micrometer.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "leader-micrometer"
  layer: "build"
---


> Library module

## Problem

Adds Micrometer metrics around single/group/suspend electors, Core lifecycle listeners, Spring AOP recording, and history sinks without changing election truth.

## When to use it

Use it when operations need acquisition, skip, failure, duration, or history metrics across backends. Keep it out if no registry consumes the data.

## Coordinates

Artifact: `io.github.bluetape4k.leader:bluetape4k-leader-micrometer`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-micrometer")
}
```

## Core concepts

Instrumented wrappers delegate ownership to the underlying elector. Metrics describe attempts and outcomes; they never grant permission to execute.

## Quick start

```kotlin
val instrumented = InstrumentedLeaderElector(
    delegate = elector,
    registry = meterRegistry
)
instrumented.runIfLeader("daily-report") { generateReport() }
```

## API by task

Wrap direct electors, attach `MicrometerLeaderElectionListener`, use the AOP recorder for Spring, or decorate safe history recorders.

## Recommended patterns

Register one wrapper per logical elector, use bounded tags, and keep lock names out of tags when they are tenant- or request-derived.

## Integrations

Works with every Core-compatible backend. prometheus-dashboard demonstrates export and dashboard/alert wiring.

## Configuration

Choose registry, common tags, meter filters, histogram/percentile policy, and cardinality limits in the application. The module does not configure a monitoring backend.

## Failure modes

A metrics registry failure must not become ownership truth. Duplicate wrapping double-counts. Unbounded lock-name tags can exhaust memory even when election works.

## Operations

Alert on backend failure and extension failure separately from normal skip. Track duration and attempt volume, then correlate with backend latency.

## Testing

Use a simple registry to assert names/tags/outcomes, failure paths, suspend cancellation, no-op behavior, and history decoration without duplicate counts.

## Workshops and learning path

Run prometheus-dashboard after learning Core outcomes. Then use the chosen backend page to interpret which failures are operationally actionable.

## Limitations

Metrics are observational and may be dropped. They do not provide durable audit, tracing, alerts, dashboards, or low-cardinality policy automatically.

## Sources

[Instrumented electors](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-micrometer/src/main/kotlin/io/bluetape4k/leader/micrometer/InstrumentedLeaderElectors.kt) · [Listener](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-micrometer/src/main/kotlin/io/bluetape4k/leader/micrometer/MicrometerLeaderElectionListener.kt) · [Stable guide](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-micrometer/README.md)
