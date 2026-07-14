---
slug: "manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-exposed-core"
manualId: "bluetape4k-leader-exposed-core"
id: "bluetape4k-leader-exposed-core"
title: "Exposed backend core"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-exposed-core"
sourceDir: "leader-exposed-core"
releaseRef: "0.4.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-exposed-core
manual:
  id: "bluetape4k-leader-exposed-core"
  repository: "bluetape4k-leader"
  group: "backends"
  kind: "library"
  sourceCommit: "6bb3ba3f6cdc1286b5ee7d8b7b47d9e92f9c6e3d"
  sourcePath: "docs/manual/en/modules/bluetape4k-leader-exposed-core.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "leader-exposed-core"
  layer: "build"
---


> Library module

## Problem

Defines the shared SQL schema, table mappings, retry policy, history codec, and migrations used by JDBC and R2DBC electors. Applications normally select an adapter instead.

## When to use it

Use it directly when your team owns schema migration or builds a custom SQL adapter.

## Coordinates

Artifact: `io.github.bluetape4k.leader:bluetape4k-leader-exposed-core`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-exposed-core")
}
```

## Core concepts

Lock, group-slot, and history tables share keys and expiry rules. Conditional SQL transactions provide ownership; retry handles transient conflicts.

## Quick start

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-exposed-jdbc")
}
```

## API by task

`ExposedLeaderSchema`, table objects, and `RetryStrategy` are the main support APIs. Adapter initializers are the normal application entry point.

## Recommended patterns

Give schema creation to one deployment step, keep a dedicated namespace, preserve unique keys, and apply migrations before application rollout.

## Integrations

JDBC and R2DBC share these tables and metadata formats; consistent configuration lets both observe the same logical namespace.

## Configuration

Adapters own schema names and retry settings. Database clock, isolation, timeout, and pool sizing remain application responsibilities.

## Failure modes

Missing tables and permission errors are deployment failures, not contention. Serialization conflicts may retry; malformed migration state must surface.

## Operations

Monitor table growth, history retention, dead tuples, and database latency. Never delete a row from application-local time alone.

## Testing

Run schema tests per dialect and verify JDBC/R2DBC agree on keys, expiry units, and metadata.

## Workshops and learning path

Read this before JDBC/R2DBC when migration ownership is separate. The migration-gate example shows election around deployment work.

## Limitations

This is not a complete elector and selects no driver, pool, or transaction manager.

## Sources

[Schema](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-exposed-core/src/main/kotlin/io/bluetape4k/leader/exposed/ExposedLeaderSchema.kt) · [Lock table](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-exposed-core/src/main/kotlin/io/bluetape4k/leader/exposed/tables/LeaderLockTable.kt) · [Stable guide](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-exposed-core/README.md)
