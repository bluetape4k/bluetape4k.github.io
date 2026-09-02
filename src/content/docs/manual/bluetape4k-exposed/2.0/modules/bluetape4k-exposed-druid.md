---
slug: "manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-druid"
manualId: "bluetape4k-exposed-druid"
id: "bluetape4k-exposed-druid"
title: "Exposed Druid JDBC Utilities"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-druid"
sourceDir: "exposed/druid"
releaseRef: "2.0.0"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-druid
manual:
  id: "bluetape4k-exposed-druid"
  repository: "bluetape4k-exposed"
  group: "database"
  kind: "library"
  sourceCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourcePath: "docs/manual/bluetape4k-exposed/en/modules/bluetape4k-exposed-druid.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourceDir: "exposed/druid"
  layer: "build"
---


`bluetape4k-exposed-druid` supplies a deliberately query-only JDBC boundary for Apache Druid through the Calcite Avatica remote driver. It does not make Druid an Exposed transaction or DAO database.

## When to use it

Use this module when an application needs parameterized SQL queries and metadata reads from a Druid Avatica endpoint. Keep mutations, multi-step consistency, and schema ownership outside this adapter: the helper rejects non-query statements before it opens a connection.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-druid")
}
```

## Connection and query boundary

`DruidConnectionOptions` builds the official Avatica Router URL, including the JSON or Protobuf serialization choice, context values, and authentication properties. `DruidJdbc.connection()` creates a JDBC connection from those options; `DruidJdbc.query()` accepts a query statement and binds parameters through `PreparedStatement`.

```kotlin
val options = DruidConnectionOptions(
    endpoint = "https://druid.example.com",
    context = mapOf("sqlTimeZone" to "UTC")
)
val rows = DruidJdbc.query(options, "SELECT datasource FROM INFORMATION_SCHEMA.TABLES") { statement ->
    statement.executeQuery().use { resultSet ->
        generateSequence { if (resultSet.next()) resultSet.getString(1) else null }.toList()
    }
}
```

## Recommended patterns

- Validate endpoint, query-only values, context, and authentication before opening a JDBC connection.
- Bind user-shaped values as parameters; never assemble literals into SQL text.
- Keep Druid reads at an application-owned boundary and use an OLTP database for transactional writes.
- Treat Avatica timeouts, transport failures, and result decoding as query failures, not as a transaction that can be rolled back.

## Testing

The unit suite verifies official Avatica URL construction, Protobuf configuration, property propagation, early validation, parameterized metadata SQL, and rejection of non-query statements.

```bash
./gradlew :bluetape4k-exposed-druid:test --no-daemon
```

## Problem

Druid is a remote, read-oriented SQL boundary. Treating its Avatica connection like an Exposed transaction would create misleading rollback and consistency expectations.

## Core concepts

The adapter separates endpoint construction, query validation, parameter binding, and result mapping. It never owns a Druid schema or multi-statement transaction.

## Quick start

Create `DruidConnectionOptions`, call `DruidJdbc.query`, and map the `ResultSet` inside the callback. Keep the endpoint and context values application configuration.

## API by task

- Build a Router URL with `DruidConnectionOptions`.
- Open a connection with `DruidJdbc.connection` when a lower-level JDBC operation is required.
- Execute a parameterized read with `DruidJdbc.query`.

## Integrations

Use the helper from a service or repository boundary. Spring and Ktor applications should inject endpoint settings and expose query results through their own request and timeout policies.

## Configuration

Configure the Avatica endpoint, serialization mode, SQL context, authentication properties, and connection timeout. Do not put credentials in source-controlled URLs.

## Failure modes

Reject non-query statements before connecting. Handle Avatica transport errors, timeout errors, malformed responses, and mapping failures as read failures with an application-level retry policy.

## Operations

Log the logical query name, endpoint identity, duration, row count, and failure category without logging credentials or sensitive query parameters. Bound result size and request time.

## Workshops and learning path

Start with the query-only example, then inspect URL construction and parameter binding tests before integrating the adapter into a service boundary.

## Limitations

This module does not provide Exposed DAO support, distributed transactions, schema migrations, write statements, or a guarantee that a remote Druid query is idempotent.

## Sources

- [`DruidConnectionOptions`](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/exposed/druid/src/main/kotlin/io/bluetape4k/exposed/druid/DruidConnectionOptions.kt)
- [`DruidJdbc`](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/exposed/druid/src/main/kotlin/io/bluetape4k/exposed/druid/DruidJdbc.kt)
- [`DruidJdbcTest`](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/exposed/druid/src/test/kotlin/io/bluetape4k/exposed/druid/DruidJdbcTest.kt)
