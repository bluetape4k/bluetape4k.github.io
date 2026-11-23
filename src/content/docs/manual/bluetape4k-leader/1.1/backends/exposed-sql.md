---
slug: "manual/bluetape4k-leader/1.1/backends/exposed-sql"
title: "Exposed SQL backends"
description: "Use JDBC for blocking services and R2DBC for coroutine-native SQL while keeping election transactions short."
releaseRef: 1.1.0
releaseCommit: 88a0dd1642ab19a05c125f6b11b11f7ca42f5ace
manual:
  id: "backends/exposed-sql"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "88a0dd1642ab19a05c125f6b11b11f7ca42f5ace"
  sourcePath: "docs/manual/bluetape4k-leader/en/backends/exposed-sql.md"
  minorVersion: "1.1"
  releaseRef: "1.1.0"
  releaseCommit: "88a0dd1642ab19a05c125f6b11b11f7ca42f5ace"
  sourceDir: "docs/manual/bluetape4k-leader"
  layer: "build"
---


Use JDBC for blocking services and R2DBC for coroutine-native SQL while keeping election transactions short.

## Module split

`leader-exposed-core` owns the shared table and SQL concepts. `leader-exposed-jdbc` supplies blocking/async electors for JDBC data sources. `leader-exposed-r2dbc` supplies suspend electors for Exposed R2DBC. Supported examples cover H2, PostgreSQL, and MySQL.

## Operational model

Election rows hold owner and expiry metadata; acquisition and release are short database operations, not a transaction around the business action. Keep the action outside the election transaction, provision a connection pool for contender bursts, and prefer database time when clock consistency matters.

## Database server time

Set `LeaderGroupElectionOptions.useDbTime = true` for Exposed JDBC or R2DBC group electors when JVM clocks may differ across nodes. Group acquisition, ownership checks, lease extension, minimum-lease release, and the backend's database-backed active count then use one `SELECT CURRENT_TIMESTAMP` inside the relevant ownership transaction. A release that only deletes the row does not query the clock. The default is `false`.

If the database clock cannot be read, JDBC group state fails closed (`maxLeaders`) and `runIfLeader` returns `null`. R2DBC marks the affected lock name unavailable, reports `maxLeaders` from state queries, and returns `null` from `runIfLeader`. This option applies to the Exposed JDBC and R2DBC group electors; it does not change local or Redis group behavior.

Route every connection, including failover connections, to the same authoritative database clock. Timestamp timezone and precision are provider and session contracts, so configure them consistently across nodes. Database time adds one timestamp round trip per ownership transaction; size the connection pool for that work and keep retry delays outside transactions. For R2DBC, `activeCount()` is a cache snapshot, not an authoritative database count; use `activeCountSuspend()` when a refreshed database count is required. History remains best-effort metadata and does not change ownership.

## Choice

Choose JDBC when the service and transaction stack are blocking. Choose R2DBC when the call path is coroutine-native and avoiding blocking bridges matters. SQL latency is sensitive to network and container setup, so treat bundled H2 rows as local-layer baselines rather than distributed database evidence.

## Release provenance

This page documents the stable `1.1.0` release. The module README links below
refer to the matching release sources.

## Release sources

- [`leader-exposed-core/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.1.0/leader-exposed-core/README.md)
- [`leader-exposed-jdbc/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.1.0/leader-exposed-jdbc/README.md)
- [`leader-exposed-r2dbc/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.1.0/leader-exposed-r2dbc/README.md)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/1.1/)
- [Choose a backend](/manual/bluetape4k-leader/1.1/guides/backend-selection/)
- [Testing leader election](/manual/bluetape4k-leader/1.1/guides/testing/)
