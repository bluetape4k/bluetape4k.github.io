---
slug: "manual/bluetape4k-leader/0.5/modules/bluetape4k-leader-exposed-jdbc"
manualId: "bluetape4k-leader-exposed-jdbc"
id: "bluetape4k-leader-exposed-jdbc"
title: "Exposed JDBC backend"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-exposed-jdbc"
sourceDir: "leader-exposed-jdbc"
releaseRef: "0.5.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-exposed-jdbc
manual:
  id: "bluetape4k-leader-exposed-jdbc"
  repository: "bluetape4k-leader"
  group: "backends"
  kind: "library"
  sourceCommit: "5a4837e374df53c5a2c272b7a1d883f07abda6ae"
  sourcePath: "docs/manual/en/modules/bluetape4k-leader-exposed-jdbc.md"
  minorVersion: "0.5"
  releaseRef: "0.5.0"
  releaseCommit: "721a9a3808f67489d2bdb8177734325981c24977"
  sourceDir: "leader-exposed-jdbc"
  layer: "build"
---


> Library module

## Problem

Implements single and group election with Exposed JDBC transactions for blocking and virtual-thread services.

## When to use it

Choose it when an operated relational database should also coordinate jobs and an extra coordination service is unjustified.

## Coordinates

Artifact: `io.github.bluetape4k.leader:bluetape4k-leader-exposed-jdbc`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-exposed-jdbc")
}
```

## Core concepts

Conditional row transitions acquire leases; expiry and owner tokens stop an old holder releasing a newer lease.

## Quick start

```kotlin
val elector = ExposedJdbcLeaderElector(database)
elector.runIfLeader("invoice-close") { closeInvoices() }
```

## API by task

Use blocking, group, factory, extension, history-sink, or `ExposedJdbcVirtualThreadLeaderElector` APIs by task.

## Recommended patterns

Create schema before traffic, keep acquire transactions short, and separate the protected business transaction unless atomic coupling is deliberate.

## Integrations

Works with the release's Exposed JDBC databases. Spring can build factories from a `Database` bean.

## Configuration

Tune wait, lease, minimum lease, retry, schema, isolation, statement timeout, and pool capacity.

## Failure modes

Contention returns `null`; connection, permission, schema, rollback, and retry-exhaustion failures propagate.

## Operations

Watch database latency, pool saturation, retries, cleanup, indexes, and clock consistency.

## Testing

Use the production dialect in Testcontainers and test two connections, expiry, stale-owner release, group capacity, and rollback.

## Workshops and learning path

Run migration-gate, compare R2DBC, then use batch-scheduler for a Spring job.

## Limitations

The database is on every acquire path. Lease and business action are not one transaction unless explicitly designed that way.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `0.5.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### leader exposed jdbc Class Structure diagram

[![leader exposed jdbc Class Structure diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-exposed-jdbc-class-01.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-exposed-jdbc-class-01.svg)

_Release README: [`leader-exposed-jdbc/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/leader-exposed-jdbc/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

[Elector](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-exposed-jdbc/src/main/kotlin/io/bluetape4k/leader/exposed/jdbc/ExposedJdbcLeaderElector.kt) · [Initializer](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-exposed-jdbc/src/main/kotlin/io/bluetape4k/leader/exposed/jdbc/lock/ExposedJdbcSchemaInitializer.kt) · [Stable guide](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-exposed-jdbc/README.md)
