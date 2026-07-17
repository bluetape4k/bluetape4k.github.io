---
slug: "manual/bluetape4k-aws/0.4/modules/bluetape4k-aws-exposed/transaction-boundaries"
title: Transaction boundaries
description: Separate AWS configuration, pool ownership, and Exposed business transactions.
manualId: bluetape4k-aws-exposed
chapterId: transaction-boundaries
manual:
  id: "bluetape4k-aws-exposed"
  repository: "bluetape4k-aws"
  group: "database"
  kind: "library"
  sourceCommit: "6e3e90395ce89b999944c6236cd292650585e28f"
  sourcePath: "docs/manual/en/modules/bluetape4k-aws-exposed/transaction-boundaries.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "be4e6daea5654f84579955307ec56a58c8f405be"
  sourceDir: "aws-exposed"
  layer: "build"
  chapterId: "transaction-boundaries"
  chapterOrder: 3
---


`AwsExposedDatabaseFactory` creates infrastructure; it does not choose business transaction boundaries. The service that combines reads and writes owns the Exposed transaction.

## Registry ownership

A factory creates a default handle and optional named handles. Each handle contains an Exposed `Database` and its data source. The registry closes every created handle, including partial startup cleanup when later database creation fails.

## Keep AWS calls outside JDBC transactions

Resolve secrets and create pools at startup. Do not fetch Secrets Manager values or generate remote configuration inside every transaction. Holding a JDBC connection while waiting on an AWS network call consumes pool capacity without database progress.

```kotlin
suspend fun createOrder(command: CreateOrder): OrderRecord =
    withContext(Dispatchers.IO) {
        transaction(registry.default.database) {
            Orders.insertAndGetId { /* map command */ }
            // Materialize the result before leaving this block.
        }
    }
```

JDBC is blocking. Use the framework's configured I/O or transaction context. A coroutine wrapper changes scheduling, not the driver protocol.

## Retry and side effects

Let exceptions escape the transaction so Exposed can roll back. Retrying the whole block repeats every side effect inside it, so publish messages after commit or use an outbox. Do not keep an Exposed DAO entity after the transaction closes.

## Named databases

Choose the handle before starting the transaction. Two handles mean two independent connections and commits; this library does not provide distributed transactions.

## Testing

Assert rollback, handle close, named lookup, partial-registry cleanup, and pool release. For IAM, inject a fake token generator and a controllable clock.

## Sources

- [Database factory](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-exposed/src/main/kotlin/io/bluetape4k/aws/exposed/AwsExposedDatabaseFactory.kt)
- [Database handle](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-exposed/src/main/kotlin/io/bluetape4k/aws/exposed/AwsExposedDatabaseHandle.kt)
- [Database registry](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-exposed/src/main/kotlin/io/bluetape4k/aws/exposed/AwsExposedDatabaseRegistry.kt)
