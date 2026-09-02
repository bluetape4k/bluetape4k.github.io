---
slug: "manual/bluetape4k-leader/1.0/backends/exposed-sql"
title: "Exposed SQL backends"
description: "Use JDBC for blocking services and R2DBC for coroutine-native SQL while keeping election transactions short."
releaseRef: 1.0.0
releaseCommit: e70146330302758f563a46b7286e3ce25f1bac49
manual:
  id: "backends/exposed-sql"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/backends/exposed-sql.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "docs/manual/bluetape4k-leader"
  layer: "build"
---


Use JDBC for blocking services and R2DBC for coroutine-native SQL while keeping election transactions short.

## Module split

`leader-exposed-core` owns the shared table and SQL concepts. `leader-exposed-jdbc` supplies blocking/async electors for JDBC data sources. `leader-exposed-r2dbc` supplies suspend electors for Exposed R2DBC. Supported examples cover H2, PostgreSQL, and MySQL.

## Operational model

Election rows hold owner and expiry metadata; acquisition and release are short database operations, not a transaction around the business action. Keep the action outside the election transaction, provision a connection pool for contender bursts, and prefer database time when clock consistency matters.

## Choice

Choose JDBC when the service and transaction stack are blocking. Choose R2DBC when the call path is coroutine-native and avoiding blocking bridges matters. SQL latency is sensitive to network and container setup, so treat bundled H2 rows as local-layer baselines rather than distributed database evidence.

## Release provenance

This page is pinned to the `1.0.0` release and therefore intentionally does not
describe APIs introduced after that release. Consult the current
`leader-exposed-jdbc` and `leader-exposed-r2dbc` module READMEs on the
development branch for post-release database-time options and behavior.

## Release sources

- [`leader-exposed-core/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-exposed-core/README.md)
- [`leader-exposed-jdbc/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-exposed-jdbc/README.md)
- [`leader-exposed-r2dbc/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-exposed-r2dbc/README.md)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/1.0/)
- [Choose a backend](/manual/bluetape4k-leader/1.0/guides/backend-selection/)
- [Testing leader election](/manual/bluetape4k-leader/1.0/guides/testing/)
