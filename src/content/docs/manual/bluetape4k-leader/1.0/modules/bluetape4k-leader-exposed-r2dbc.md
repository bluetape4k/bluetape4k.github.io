---
slug: "manual/bluetape4k-leader/1.0/modules/bluetape4k-leader-exposed-r2dbc"
manualId: "bluetape4k-leader-exposed-r2dbc"
id: "bluetape4k-leader-exposed-r2dbc"
title: "Exposed R2DBC backend"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-exposed-r2dbc"
sourceDir: "leader-exposed-r2dbc"
releaseRef: "1.0.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-exposed-r2dbc
manual:
  id: "bluetape4k-leader-exposed-r2dbc"
  repository: "bluetape4k-leader"
  group: "backends"
  kind: "library"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/modules/bluetape4k-leader-exposed-r2dbc.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "leader-exposed-r2dbc"
  layer: "build"
---


> Library module

## Problem

Implements coroutine single and group election with Exposed R2DBC transactions while sharing SQL ownership rules with JDBC.

## When to use it

Choose it for coroutine-first R2DBC services; choose JDBC when surrounding APIs are blocking or virtual-thread based.

## Coordinates

Artifact: `io.github.bluetape4k.leader:bluetape4k-leader-exposed-r2dbc`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-exposed-r2dbc")
}
```

## Core concepts

Suspend transactions perform conditional writes with expiry and owner tokens. Cancellation must clean up only the lease owned by that call.

## Quick start

```kotlin
val elector = ExposedR2DbcSuspendLeaderElector(database)
elector.runIfLeader("projection-refresh") { refreshProjection() }
```

## API by task

Use suspend single/group electors, `R2dbcDatabase` extensions, factories, initializer, and suspend history sink.

## Recommended patterns

Keep acquire/use/release in structured scope, do not hide JDBC blocking calls inside it, and migrate the shared schema first.

## Integrations

Can share a namespace with JDBC when database, schema, and release match. Spring and Ktor consume the suspend factory/elector.

## Configuration

Tune wait, lease, retry, schema, R2DBC pool, statement timeout, and lifecycle ownership.

## Failure modes

Contention returns `null`; cancellation rethrows after owner-safe cleanup; connection and transaction failures propagate.

## Operations

Observe acquisition latency, pool queue time, retries, cancellation cleanup, and database load.

## Testing

Use a real R2DBC database for two-client contention, group slots, expiry, and cancellation during acquire/action.

## Workshops and learning path

Compare JDBC, then run migration-gate and the Ktor example to see lifecycle integration.

## Limitations

R2DBC removes blocked threads, not database round trips or database availability risk.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `1.0.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### leader exposed r2dbc Class Structure diagram

[![leader exposed r2dbc Class Structure diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/e70146330302758f563a46b7286e3ce25f1bac49/docs/images/readme-diagrams/leader-exposed-r2dbc-class-01.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/e70146330302758f563a46b7286e3ce25f1bac49/docs/images/readme-diagrams/leader-exposed-r2dbc-class-01.svg)

_Release README: [`leader-exposed-r2dbc/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/e70146330302758f563a46b7286e3ce25f1bac49/leader-exposed-r2dbc/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

[Elector](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-exposed-r2dbc/src/main/kotlin/io/bluetape4k/leader/exposed/r2dbc/ExposedR2DbcSuspendLeaderElector.kt) · [Initializer](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-exposed-r2dbc/src/main/kotlin/io/bluetape4k/leader/exposed/r2dbc/lock/ExposedR2dbcSchemaInitializer.kt) · [Stable guide](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-exposed-r2dbc/README.md)
