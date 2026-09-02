---
slug: "manual/bluetape4k-exposed/2.0/modules/examples-exposed-clickhouse-oltp-olap"
manualId: "examples-exposed-clickhouse-oltp-olap"
id: "examples-exposed-clickhouse-oltp-olap"
title: "ClickHouse OLTP/OLAP Example"
locale: "en"
kind: "example"
gradlePath: ":examples-exposed-clickhouse-oltp-olap"
sourceDir: "examples/exposed-clickhouse-oltp-olap"
releaseRef: "2.0.0"
artifact: null
manual:
  id: "examples-exposed-clickhouse-oltp-olap"
  repository: "bluetape4k-exposed"
  group: "example"
  kind: "example"
  sourceCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourcePath: "docs/manual/bluetape4k-exposed/en/modules/examples-exposed-clickhouse-oltp-olap.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourceDir: "examples/exposed-clickhouse-oltp-olap"
  layer: "learn"
---


> Observe why transactional and analytical workloads need different data paths.

## What you learn

The example contrasts an OLTP-oriented write/read flow with a ClickHouse analytical flow. It demonstrates workload placement; it does not claim that one database replaces the other.

## Prerequisites

- JDK and repository Gradle wrapper
- Docker for the database containers used by the tests
- Enough local memory and free ports for both workload sides

## Run

```bash
./gradlew :examples-exposed-clickhouse-oltp-olap:test
```

## Expected result

Testcontainers starts PostgreSQL and ClickHouse. The test commits orders to the PostgreSQL `Orders` table, forwards records into the ClickHouse `OrderEvents` `MergeTree`, and verifies regional analytics with `uniqExact`, `quantile`, and `argMax` queries.

## Failure diagnosis

- Container cannot start: check Docker, memory, and port conflicts.
- ClickHouse connection fails: wait for readiness and inspect container logs.
- Analytical rows are missing: verify ingestion/flush timing before changing query semantics.
- SQL dialect error: compare generated SQL with the ClickHouse adapter limitations.

## Next route

Read [ClickHouse adapter](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-clickhouse/), [OLTP vs OLAP](/manual/bluetape4k-exposed/2.0/guides/oltp-vs-olap/), and the [bluetape4k workshop](https://github.com/bluetape4k/bluetape4k-workshop).

## When to use it

Use it when evaluating a transactional source plus analytical sink and you need to observe the handoff boundary. It is especially useful before choosing an outbox, replay ledger, or idempotent ingestion key.

## Coordinates

This example publishes no library coordinate. Consumer applications should import `io.github.bluetape4k:bluetape4k-dependencies:<version>` and omit individual library versions.

## Core concepts

PostgreSQL owns the OLTP commit. ClickHouse owns a separate analytical write. The forward step is not atomic with the PostgreSQL transaction, so a failure can leave the sink partially populated. Analytics use ClickHouse-specific functions and raw SQL where the Exposed expression API does not model them.

## Quick start

Start Docker, run the exact Gradle command above, and inspect `OltpOlapIntegrationTest`. Success means both database containers are ready, the OLTP rows are committed, the forward completes, and the aggregation assertions pass.

## API by task

Follow `OrdersRepository` for PostgreSQL inserts, the forwarding step that maps committed orders to `OrderEvents`, and `AnalyticsRepository` for batch ingestion and aggregation queries. Keep these three stages visible when adapting the example.

## Recommended patterns

Use a stable event identifier in ClickHouse, make forwarding idempotent, record the last successfully forwarded position, and test replay after a mid-batch failure. Prefer a durable outbox when losing an analytical event is unacceptable.

## Integrations

The test combines the Exposed JDBC PostgreSQL path, the ClickHouse adapter, PostgreSQL Testcontainers, and ClickHouse Testcontainers. Both services are disposable test infrastructure.

## Configuration

Keep PostgreSQL and ClickHouse connection settings separate. In production, configure ClickHouse engine, ordering key, partitioning, retention, batching, and retry policy from the actual query and ingestion workload.

## Operations

Monitor source commit position, forward lag, forwarded and rejected rows, retry count, ClickHouse insert latency, and aggregation latency. Alert on a growing gap between committed OLTP rows and accepted analytical events.

## Testing

Keep the clean end-to-end test, then add a failure between PostgreSQL commit and ClickHouse completion. Prove that replay neither loses nor double-counts events under the application's chosen idempotency key.

## Workshops and learning path

Continue with the [ClickHouse adapter](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-clickhouse/) for supported DDL and transactions, then use [OLTP vs OLAP](/manual/bluetape4k-exposed/2.0/guides/oltp-vs-olap/) to design the production handoff.

## Limitations

The example proves one local two-container path. It does not provide an exactly-once pipeline, distributed transaction, production schema migration, capacity plan, replication policy, retention policy, or disaster recovery.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `2.0.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### PostgreSQL OLTP and ClickHouse OLAP example topology

[![PostgreSQL OLTP and ClickHouse OLAP example topology](https://raw.githubusercontent.com/bluetape4k/bluetape4k-exposed/d632a0bc0662ae616b786f552150a7fabd1cee3e/docs/images/readme-diagrams/examples-exposed-clickhouse-oltp-olap-diagram-01.png)](https://github.com/bluetape4k/bluetape4k-exposed/blob/d632a0bc0662ae616b786f552150a7fabd1cee3e/docs/images/readme-diagrams/examples-exposed-clickhouse-oltp-olap-diagram-01.svg)

_Release README: [`examples/exposed-clickhouse-oltp-olap/README.md`](https://github.com/bluetape4k/bluetape4k-exposed/blob/d632a0bc0662ae616b786f552150a7fabd1cee3e/examples/exposed-clickhouse-oltp-olap/README.md)_

### OLTP to OLAP integration test flow

[![OLTP to OLAP integration test flow](https://raw.githubusercontent.com/bluetape4k/bluetape4k-exposed/d632a0bc0662ae616b786f552150a7fabd1cee3e/docs/images/readme-diagrams/examples-exposed-clickhouse-oltp-olap-flow-02.png)](https://github.com/bluetape4k/bluetape4k-exposed/blob/d632a0bc0662ae616b786f552150a7fabd1cee3e/docs/images/readme-diagrams/examples-exposed-clickhouse-oltp-olap-flow-02.svg)

_Release README: [`examples/exposed-clickhouse-oltp-olap/README.md`](https://github.com/bluetape4k/bluetape4k-exposed/blob/d632a0bc0662ae616b786f552150a7fabd1cee3e/examples/exposed-clickhouse-oltp-olap/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Example sources](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/examples/exposed-clickhouse-oltp-olap/README.md)
- [Gradle build](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/examples/exposed-clickhouse-oltp-olap/build.gradle.kts)
