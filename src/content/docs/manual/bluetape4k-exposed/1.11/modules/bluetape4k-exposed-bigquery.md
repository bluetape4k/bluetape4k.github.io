---
slug: "manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-bigquery"
manualId: "bluetape4k-exposed-bigquery"
id: "bluetape4k-exposed-bigquery"
title: "Exposed BigQuery Adapter"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-bigquery"
sourceDir: "exposed/bigquery"
releaseRef: "1.11.0"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-bigquery
manual:
  id: "bluetape4k-exposed-bigquery"
  repository: "bluetape4k-exposed"
  group: "database"
  kind: "library"
  sourceCommit: "06bf8ce472aefbe925117901a971399cbee68a53"
  sourcePath: "docs/manual/en/modules/bluetape4k-exposed-bigquery.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "0b494a5fd1e083006046764757342b68a397e4c5"
  sourceDir: "exposed/bigquery"
  layer: "build"
---


`bluetape4k-exposed-bigquery` converts Exposed DSL statements to GoogleSQL and executes them through BigQuery REST query jobs. It is an SQL-generation and remote-execution bridge, not a JDBC transaction adapter.

## Problem

Applications may want Exposed table and query definitions without installing a BigQuery JDBC driver. `BigQueryContext` uses an internal H2 PostgreSQL-mode database only to render SQL, then sends the translated statement to the BigQuery API.

## When to use it

Use it for BigQuery SELECT, basic INSERT/UPDATE/DELETE, dry runs, and controlled DDL where query-job semantics are acceptable. Use another persistence boundary when a unit of work requires JDBC atomicity or DAO behavior.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-bigquery")
}
```

## Core concepts

- `BigQueryContext` owns the REST client, project/dataset, SQL generator DB, and dispatcher.
- `Query.withBigQuery()` creates an executor for list, Flow, single-row, and dry-run tasks.
- `BigQueryQueryOptions` controls billed-byte limits, labels, priority, location, destination table, timeout, and cache use.
- REST calls are independent query jobs; there is no client-side rollback across them.

## Quick start

```kotlin
val context = BigQueryContext.create(bigquery, "project", "analytics")
with(context) {
    val estimate = Events.selectAll().withBigQuery(
        BigQueryQueryOptions(maximumBytesBilled = 10_000_000)
    ).dryRun()
    val rows = Events.selectAll().limit(100).withBigQuery().toList()
}
```

## API by task

| Task | API |
| --- | --- |
| Exposed query | `query.withBigQuery().toList()` / `toFlow()` |
| Cost and syntax validation | `dryRun()` / `validateRawQuery()` |
| DML | `execInsert`, `execUpdate`, `execDelete` |
| DDL | `execCreateTable`, `execDropTable` |
| Raw GoogleSQL | `runRawQuery` |

## Recommended patterns

Dry-run every user-shaped or high-cost query and set `maximumBytesBilled`. Prefer `toFlow` for large results because it follows BigQuery page tokens page by page; `toList` collects all pages. Make each DML call independently retryable and do not model several calls as one transaction.

## Integrations

The public integration is `google-api-services-bigquery-v2`; H2 is an internal runtime SQL generator. Release tests can use a locally installed emulator or a Testcontainers BigQuery emulator. The runnable `examples-exposed-bigquery-dry-run` path demonstrates validation without paid execution.

## Configuration

Provide an authenticated `Bigquery` client and align project, dataset, location, and credentials. Set labels for cost attribution, a timeout, and a billed-byte cap. The default uses standard SQL and a 30-second request timeout when no override is supplied.

## Failure modes

- A successful earlier query job is not rolled back when a later job fails.
- SQL accepted by H2 generation can still be rejected by BigQuery; dry run is the server-side check.
- `toList` may consume substantial heap across many result pages.
- SchemaUtils automation, sequences, generated keys, and `ALTER COLUMN TYPE` are limited.

## Operations

Record job ID, labels, bytes processed/billed, slot time, cache use, location, and error details. Separate dry-run authorization failures from execution failures and preserve the generated SQL in diagnostics without logging sensitive literals.

## Testing

Unit-test SQL generation and query options, then run API behavior against the emulator. Keep a small production-project smoke test for permissions and location differences. Test page tokens, cancellation between pages, dry-run limits, and conversion of decimal/timestamp/null values.

## Workshops and learning path

Begin with [the BigQuery dry-run example](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/examples/exposed-bigquery-dry-run/README.md), then use the [adapter matrix](/manual/bluetape4k-exposed/1.11/guides/database-adapter-matrix/) and [OLTP vs OLAP guide](/manual/bluetape4k-exposed/1.11/guides/oltp-vs-olap/) to decide whether BigQuery owns execution or is reached through Trino.

## Limitations

This module does not provide JDBC transaction semantics, full DAO compatibility, universal SchemaUtils DDL, or rollback across REST jobs. Join/alias result access and all schema translations should be verified against the actual query.

## Sources

- [`BigQueryContext`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/bigquery/src/main/kotlin/io/bluetape4k/exposed/bigquery/BigQueryContext.kt)
- [`BigQueryQueryExecutor`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/bigquery/src/main/kotlin/io/bluetape4k/exposed/bigquery/BigQueryQueryExecutor.kt)
- [`BigQueryQueryOptions`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/bigquery/src/main/kotlin/io/bluetape4k/exposed/bigquery/BigQueryQueryOptions.kt)
- [Context release test](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/bigquery/src/test/kotlin/io/bluetape4k/exposed/bigquery/BigQueryContextUnitTest.kt)
