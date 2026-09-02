---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-r2dbc/transactions-and-lifecycle"
title: Transactions and lifecycle
description: Connect suspend transactions, transaction-aware connections, schema initialization, and the 2.0.0 auto-configuration boundary.
manualId: bluetape4k-r2dbc
chapterId: transactions-and-lifecycle
manual:
  id: "bluetape4k-r2dbc"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-r2dbc/transactions-and-lifecycle.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "data/r2dbc"
  layer: "build"
  learningOrder: 610
  chapterId: "transactions-and-lifecycle"
  chapterOrder: 5
---


## The smallest atomic boundary

`withTransactionSuspend` creates a `TransactionalOperator` for the `DatabaseClient.connectionFactory`. Successful completion commits; an exception rolls back.

```kotlin
val result = client.databaseClient.withTransactionSuspend {
    client.databaseClient
        .sql("INSERT INTO accounts (owner, balance) VALUES (:owner, :balance)")
        .bind("owner", "kim")
        .bind("balance", 1000)
        .fetch()
        .awaitRowsUpdated()

    client.databaseClient
        .sql("INSERT INTO audit_log (message) VALUES (:message)")
        .bind("message", "account created")
        .fetch()
        .awaitRowsUpdated()

    "created"
}
```

Place the boundary around the smallest service operation whose writes must succeed together. The block's `ReactiveTransaction` can mark rollback-only state when required.

## Transaction manager cache and direct connections

Version 2.0.0 caches one manager per `ConnectionFactory` in a locked `WeakHashMap`. This avoids repeated manager construction but does not own the pool lifecycle. `withTransactionSuspending` is deprecated; use `withTransactionSuspend`.

`getConnectionAndAwait` and `releaseConnectionAndAwait` recognize Spring transaction-bound connections. `fetchConnectionAndAwait` calls `ConnectionFactory.create()` directly; the caller must close the result and must not assume it is the current transaction connection. Prefer the same `DatabaseClient` inside a transaction unless low-level access is necessary.

## Schema and data initialization

`resourceDatabasePopulatorOf` wraps SQL resources, `compositeDatabasePopulatorOf` orders multiple populators, and `connectionFactoryInitializer` attaches them to a factory.

```kotlin
val initializer = connectionFactoryInitializer(connectionFactory) {
    setDatabasePopulator(
        compositeDatabasePopulatorOf(
            resourceDatabasePopulatorOf(ClassPathResource("schema.sql")),
            resourceDatabasePopulatorOf(ClassPathResource("data.sql")),
        )
    )
}
```

Do not let this initializer and a migration tool both own production schema state. Select one source of truth and test execution timing and repeat safety.

## 2.0.0 auto-configuration

`R2dbcClientAutoConfiguration` registers `R2dbcClient` from `DatabaseClient`, `R2dbcEntityTemplate`, and `MappingR2dbcConverter` when the `DatabaseClient` class is present. Version 2.0.0 has no `@ConditionalOnMissingBean(R2dbcClient::class)`. A user bean does not automatically cause back-off; explicitly exclude or reconcile the auto-configuration.

Preserve transaction exceptions and cancellation. Retry an entire transaction only when the operation is idempotent and the failure is known to be transient.

## Sources and tests

- [`TransactionSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/support/TransactionSupport.kt)
- [`ConnectionFactoryUtils.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/connection/ConnectionFactoryUtils.kt)
- [`R2dbcClientAutoConfiguration.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/config/R2dbcClientAutoConfiguration.kt)
- [`ConnectionFactoryInitializer.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/connection/init/ConnectionFactoryInitializer.kt)
- [`TransactionSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/support/TransactionSupportTest.kt)
- [`ConnectionInitTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/connection/init/ConnectionInitTest.kt)

## Next chapter

Continue to the [R2DBC ecosystem path](/manual/bluetape4k-projects/2.0/modules/bluetape4k-r2dbc/ecosystem-paths/).
