---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-cassandra"
manualId: bluetape4k-cassandra
title: "Cassandra Coroutine Client"
description: Use the Apache Cassandra Java Driver from Kotlin with explicit session ownership, coroutine queries, and typed value mapping.
kind: library
group: data
learningOrder: 620
manual:
  id: "bluetape4k-cassandra"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "222f640a5a8937d3000dc49b2e2f585726ed70e6"
  sourcePath: "docs/manual/en/modules/bluetape4k-cassandra.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "data/cassandra"
  layer: "build"
  learningOrder: 620
---


## What this library owns

`bluetape4k-cassandra` adds Kotlin session factories, coroutine queries, and row and statement extensions to the Apache Cassandra Java Driver. It does not operate the Cassandra cluster or its schema. The application still chooses contact points, credentials, keyspaces, and when sessions end.

## Decisions before adopting it

- Decide whether each operation creates and closes its own session or the application reuses sessions.
- For reuse, use bounded configuration dimensions such as contact point, datacenter, routing profile, credential version, and client id rather than request-specific values.
- Choose blocking `execute` or coroutine-based `executeSuspending` to match the calling layer.
- Decide whether the application may create keyspaces or deployment manages them separately.

## Add the dependency

Expose only the central BOM version instead of repeating versions for individual bluetape4k artifacts.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-cassandra")
}
```

## First query

The code that creates a direct session also closes it. Keeping the query inside `use` closes the session after either a successful return or an exception.

```kotlin
import io.bluetape4k.cassandra.cqlSessionOf
import java.net.InetSocketAddress

val contactPoint = InetSocketAddress("127.0.0.1", 9042)

val releaseVersion = cqlSessionOf(
    contactPoint = contactPoint,
    localDatacenter = "datacenter1",
    keyspaceName = "system",
).use { session ->
    session.execute("SELECT release_version FROM system.local")
        .one()
        ?.getString("release_version")
}
```

## API decision map

| Task | Start with | Ownership or caution |
| --- | --- | --- |
| Create a session for a short scope | `cqlSessionOf`, `cqlSession` | The caller closes it with `use` or `close`. |
| Reuse a session for one connection context | `CqlSessionProvider`, `CqlSessionIdentity` | The identity is the cache boundary; the provider registers shutdown. |
| Query or prepare from a coroutine | `executeSuspending`, `prepareSuspending` | Preserve caller cancellation and paging boundaries. |
| Map rows and driver values to Kotlin types | `RowSupport`, `GettableSupport`, `DataTypeSupport` | Check null and column-type contracts first. |
| Assemble statements and query builders | `StatementSupport`, `QueryBuilderSupport` | Keep consistency, timeout, and keyspace visible at the call site. |
| Manage keyspaces and integration tests | `CassandraAdmin`, `AbstractCassandraTest` | Separate production DDL authority from test-container lifecycle. |

## Learning path

1. [CqlSession lifecycle and cache boundaries](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cassandra/session-lifecycle/)
2. [Coroutine queries](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cassandra/coroutine-queries/)
3. [Rows and data mapping](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cassandra/rows-data-mapping/)
4. [Statements and query builder](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cassandra/statements-query-builder/)
5. [Operations and testing](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cassandra/operations-testing/)

## Recommended patterns

Close directly created sessions where they are created, and reuse shared sessions through a bounded `CqlSessionIdentity`. Keep query values behind bind markers, map each `Row` into a domain type at the read boundary, and treat multi-page results as partially consumable and cancellable.

## Integrations

The module builds on the Apache Cassandra Java Driver core, query builder, and mapper runtime, and connects asynchronous execution and paging to Kotlin Coroutines. An application that uses mapper-generated `EntityHelper` types must also configure the DataStax mapper annotation processor in its build.

## Configuration

The application owns contact points, `localDatacenter`, authentication, TLS, keyspace, and statement consistency and timeout. Provider identities should contain only a bounded set of log-approved connection or credential configuration IDs.

## Failure behavior

Blank keyspaces and local datacenters are rejected at the input boundary. Query preparation and execution, row mapping, and next-page fetch failures propagate at their respective operation boundaries. For bootstrap authentication failures, inspect the 1.11.0 admin-session settings first.

## Operations

Keyspace creation and deletion are real cluster side effects. Separate production privileges and replication policy from application startup, and observe session shutdown, query and paging failures, batch size, and timeout. See [Operational boundaries and Testcontainers verification](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cassandra/operations-testing/) for the full checklist.

## Testing

Tests that require real Cassandra behavior use Testcontainers and a working Docker runtime. Do not run them in parallel with other heavy integration tests.

```bash
./gradlew :bluetape4k-cassandra:test --no-build-cache --no-configuration-cache
```

## Workshops

There is no module-specific workshop yet. The examples and source/test links verified against 1.11.0 provide a sequential path through sessions, coroutine paging, mapping, QueryBuilder, and operations.

## 1.11.0 limitation

In 1.11.0, `CqlSessionProvider` builds its keyspace-bootstrap admin session with `builderSupplier().build()`. The trailing builder block applies only to the final keyspace-bound session. Put contact point, local datacenter, authentication, and TLS settings required by both sessions in `builderSupplier`. This differs from the behavior introduced by PR #986 after 1.11.0.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `1.11.0` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### Extension Function API Overview diagram

[![Extension Function API Overview diagram](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/data-cassandra-diagram-01.png)](../../assets/readme-diagrams/data-cassandra-diagram-01.svg)

_Release README: [`data/cassandra/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/data/cassandra/README.md)_

### Core API Structure diagram

[![Core API Structure diagram](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/data-cassandra-diagram-02.png)](../../assets/readme-diagrams/data-cassandra-diagram-02.svg)

_Release README: [`data/cassandra/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/data/cassandra/README.md)_

### Asynchronous Query Execution Flow diagram

[![Asynchronous Query Execution Flow diagram](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/data-cassandra-sequence-01.png)](../../assets/readme-diagrams/data-cassandra-sequence-01.svg)

_Release README: [`data/cassandra/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/data/cassandra/README.md)_

<!-- release-readme-diagrams:end -->

## Sources and tests

- [`CqlSessionProvider.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CqlSessionProvider.kt)
- [`CqlSessionSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/CqlSessionSupport.kt)
- [`AsyncCqlSessionSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/AsyncCqlSessionSupport.kt)
- [`RowSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/RowSupport.kt)
- [`StatementSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/cassandra/src/main/kotlin/io/bluetape4k/cassandra/cql/StatementSupport.kt)
- [`CqlSessionProviderTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/CqlSessionProviderTest.kt)
- [`CqlSessionSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/cassandra/src/test/kotlin/io/bluetape4k/cassandra/CqlSessionSupportTest.kt)
