---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-r2dbc"
manualId: bluetape4k-r2dbc
title: "Module bluetape4k-r2dbc"
description: "Run Spring R2DBC SQL with Kotlin Coroutines and Flow, including mapping, transactions, and connection-pool utilities."
kind: library
group: data
manual:
  id: "bluetape4k-r2dbc"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "46993c010f5bef45fef0943bbc93728d16119bd5"
  sourcePath: "docs/manual/en/modules/bluetape4k-r2dbc.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "data/r2dbc"
  layer: "build"
---


## Capabilities

`bluetape4k-r2dbc` adds Kotlin-oriented execution, mapping, CRUD, and transaction helpers to Spring R2DBC's `DatabaseClient` and `R2dbcEntityTemplate`. It also provides DSLs for connection factories and pools, typed-null binding, a dynamic query builder, and PostgreSQL JSON converters.

The module does not replace an R2DBC driver or provide a complete ORM. Callers still own SQL and transaction boundaries, and `QueryBuilder` is not a type-safe DSL that validates tables and columns at compile time. Continue to the [R2DBC ecosystem path](/manual/bluetape4k-projects/1.11/modules/bluetape4k-r2dbc/ecosystem-paths/) when a table DSL and repository layer are required.

## Decisions before adoption

- Confirm that the call path must avoid blocking JDBC. Calling JDBC from a coroutine does not make the I/O non-blocking.
- Decide who closes the `ConnectionPool` and directly acquired connections.
- Decide whether Spring owns transactions or this module creates the boundary with `withTransactionSuspend`.
- Choose domain-object mapping or raw map results.
- Choose between waiting during overload and failing fast with bounded pending acquire and an acquire timeout.
- Define where SQL fragments and identifiers are validated.

## Dependencies

Consumers manage only the central `bluetape4k-dependencies` BOM version. The application selects Spring R2DBC and the database driver.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-r2dbc")

    implementation("org.springframework.boot:spring-boot-starter-data-r2dbc")
    runtimeOnly("org.postgresql:r2dbc-postgresql") // replace with the selected driver
}
```

## First query

When Spring Boot supplies `DatabaseClient`, `R2dbcEntityTemplate`, and `MappingR2dbcConverter`, the 1.11.0 auto-configuration creates `R2dbcClient`. The typed `execute<T>` path maps rows through `MappingR2dbcConverter`.

```kotlin
import io.bluetape4k.r2dbc.R2dbcClient
import io.bluetape4k.r2dbc.core.execute
import kotlinx.coroutines.flow.Flow
import org.springframework.r2dbc.core.flow

data class AccountSummary(
    val accountId: Long,
    val name: String,
)

fun findActiveAccounts(client: R2dbcClient): Flow<AccountSummary> =
    client
        .execute<AccountSummary>(
            "SELECT account_id, name FROM accounts WHERE active = :active"
        )
        .bind("active", true)
        .fetch()
        .flow()
```

The query starts when the Flow is collected. Keep the path non-blocking and do not mix it with arbitrary blocking or separately acquired connections.

## API map

| Task | Start with | Boundary to remember |
| --- | --- | --- |
| Hold the client components | `R2dbcClient` | It stores existing Spring objects; it does not create or close a pool. |
| Configure connection options and a pool | `connectionFactoryOptionsOf`, `r2dbcConnectionPool` | The application supplies the driver and closes the pool. |
| Execute raw SQL | `DatabaseClient.execute`, `R2dbcClient.execute` | The caller owns SQL and result cardinality. |
| Bind named or indexed parameters | `bindMap`, `bindIndexedMap`, `bindNullable` | Raw nulls in maps are rejected; use typed nulls. |
| Map rows to a type | `execute<T>`, `MappingR2dbcConverter.read<T>` | Converter errors propagate when columns and properties do not match. |
| Run table-oriented CRUD | `insert`, `update`, `delete` | Table and column identifiers are checked, but the caller owns raw where SQL. |
| Build dynamic SQL | `query`, `queryWithCount`, `QueryBuilder` | It is not type-safe, and `queryWithCount` executes its block twice. |
| Run a suspend transaction | `withTransactionSuspend` | It connects the same `DatabaseClient` factory to a transaction manager. |
| Initialize schema and data | `connectionFactoryInitializer`, `resourceDatabasePopulatorOf` | Attach initialization and failure policy to the application lifecycle. |

## Learning path

Each chapter explains ownership and failure boundaries that are easy to get wrong, not just a feature list. Examples link to the 1.11.0 release source and representative tests, so readers can continue directly from the explanation to implementation and verification evidence.

1. [Connections and pools](/manual/bluetape4k-projects/1.11/modules/bluetape4k-r2dbc/connections-and-pools/) — configure connections, own the pool lifecycle, and choose overload behavior.
2. [SQL execution and parameter binding](/manual/bluetape4k-projects/1.11/modules/bluetape4k-r2dbc/sql-and-binding/) — use `DatabaseClient`, typed mapping, named/indexed parameters, and typed nulls.
3. [CRUD and row mapping](/manual/bluetape4k-projects/1.11/modules/bluetape4k-r2dbc/crud-and-mapping/) — combine raw-table and entity CRUD with identifier checks, `Readable`, and PostgreSQL JSON conversion.
4. [Dynamic queries](/manual/bluetape4k-projects/1.11/modules/bluetape4k-r2dbc/dynamic-queries/) — build nested predicates and count queries within the 1.11.0 validation contract.
5. [Transactions and lifecycle](/manual/bluetape4k-projects/1.11/modules/bluetape4k-r2dbc/transactions-and-lifecycle/) — connect commit, rollback, transaction-aware connections, and schema initialization.
6. [R2DBC ecosystem path](/manual/bluetape4k-projects/1.11/modules/bluetape4k-r2dbc/ecosystem-paths/) — progress from direct Spring R2DBC to this module, Spring coroutine extensions, Exposed R2DBC, and the workshop.

For first adoption, read chapters 1 through 5 in order. When selecting a persistence technology, start with chapter 6 and return to the required level.

## Recommended patterns

Create the pool once during application startup and close it once during shutdown. Separate parameters from SQL and bind nullable values with typed `Parameter` objects. Place `withTransactionSuspend` around the smallest service boundary whose writes must succeed together. Keep Flow execution non-blocking and isolate any blocking bridge behind an explicit adapter boundary.

## Integrations

`bluetape4k-coroutines` and `r2dbc-pool` are API dependencies. Spring Data R2DBC, Spring Boot auto-configuration, Reactor, Jackson3, and database drivers are optional or `compileOnly`; add the runtime capabilities required by the APIs in use.

Use [`bluetape4k-spring-boot-r2dbc`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-r2dbc/) for broader Spring Data R2DBC coroutine CRUD extensions. Move to the R2DBC modules in `bluetape4k-exposed` when a table/column DSL and repository abstraction are needed.

## Configuration

With Spring Boot, `spring.r2dbc.*` owns driver connection settings. For direct configuration, use `R2dbcConnectionConfig` and `R2dbcPoolConfig` to set the driver, SSL, timeouts, pool size, warmup, pending queue, and validation strategy.

In 1.11.0, `R2dbcClientAutoConfiguration` activates when `DatabaseClient` is present and does not back off when the application defines its own `R2dbcClient` bean. Applications that configure the type directly must avoid the auto-configuration conflict themselves.

## Failure behavior

`bindMap`, `bindIndexedMap`, and map-based updates reject raw `null` with `IllegalArgumentException`. Use `typedNullParameter<T>()`, `bindNullable<T>()`, or `nullValue`. Mapping and PostgreSQL JSON conversion propagate Spring conversion failures instead of silently substituting values.

Invalid pool-size or JMX settings fail during configuration or pool conversion. An exception in a transaction block triggers rollback, and cancellation must not be swallowed as an ordinary fallback condition.

## Operations

Observe active and idle connections, pending acquire, acquire timeout, connection hold time, query p95/p99, and rollbacks together. Bounded-queue failures do not automatically mean the pool should grow; they may be the intended signal that the database cannot accept more work. `validationQuery` adds a database round trip to acquisition, so prefer driver-local validation when it is sufficient.

## Testing

The 1.11.0 release tests cover H2 SQL, CRUD, transactions, and pool saturation.

```bash
./gradlew :bluetape4k-r2dbc:test --no-build-cache --no-configuration-cache
```

Pool benchmarks are not ordinary regression tests. PostgreSQL and MySQL benchmarks use Testcontainers and should not run in parallel with other heavy database suites.

## Workshops

Within the module, `ExecuteTest`, `InsertTest`, and `TransactionSupportTest` are the smallest executable examples. For a higher-level Kotlin SQL DSL and repository path, [Exposed R2DBC Workshop](https://github.com/bluetape4k/exposed-r2dbc-workshop) continues through SQL DSL, DDL/DML, coroutines, Spring WebFlux, and production patterns.

## 1.11.0 scope

This manual targets the `bluetape4k-projects` 1.11.0 tag. It does not describe the post-release auto-configuration back-off or `QueryBuilder.limit` and `offset` precondition checks as 1.11 features. In 1.11, callers must enforce `limit > 0` and `offset >= 0`.

The 1.11.0 README mentions APIs that are absent from the release source: `sqlInsert`, `sqlUpdate`, `sqlDelete`, `awaitGeneratedKey`, `awaitSingleAsMap`, `awaitCount`, `awaitExists`, and `awaitList`. They are intentionally excluded; this manual uses only APIs present in release source and tests.

## Sources and tests

- [`R2dbcClient.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/R2dbcClient.kt)
- [`ConnectionPoolSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/pool/ConnectionPoolSupport.kt)
- [`R2dbcPoolConfig.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/pool/R2dbcPoolConfig.kt)
- [`DatabaseClientSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/support/DatabaseClientSupport.kt)
- [`Execute.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/core/Execute.kt)
- [`QueryBuilder.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/query/QueryBuilder.kt)
- [`TransactionSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/support/TransactionSupport.kt)
- [`ExecuteTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/core/ExecuteTest.kt)
- [`ConnectionPoolSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/pool/ConnectionPoolSupportTest.kt)
- [`TransactionSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/support/TransactionSupportTest.kt)
