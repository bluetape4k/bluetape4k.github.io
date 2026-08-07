---
slug: "manual/bluetape4k-exposed/1.12/modules/bluetape4k-exposed-r2dbc/repository-patterns"
title: R2DBC repository patterns
description: Implement mapping, streaming reads, batches, audit fields, and soft deletion without hiding transaction ownership.
manualId: bluetape4k-exposed-r2dbc
chapterId: repository-patterns
manual:
  id: "bluetape4k-exposed-r2dbc"
  repository: "bluetape4k-exposed"
  group: "r2dbc"
  kind: "library"
  sourceCommit: "6bff7d9939243d166e212ce840ee90261e7239c7"
  sourcePath: "docs/manual/en/modules/bluetape4k-exposed-r2dbc/repository-patterns.md"
  minorVersion: "1.12"
  releaseRef: "1.12.1"
  releaseCommit: "4cc2cce07087241ec24a597d8464615434ea2b81"
  sourceDir: "exposed/r2dbc"
  layer: "build"
  chapterId: "repository-patterns"
  chapterOrder: 2
---


`R2dbcRepository<ID, E>` supplies common Exposed CRUD operations while leaving table choice, ID extraction, row mapping, and insert binding in application code. This is a mapping and query abstraction, not an aggregate transaction manager.

## Smallest useful repository

```kotlin
object ActorTable : LongIdTable("actors") {
    val name = varchar("name", 100)
}

data class ActorRecord(val id: Long = 0, val name: String)

class ActorRepository : LongR2dbcRepository<ActorRecord> {
    override val table = ActorTable
    override fun extractId(entity: ActorRecord) = entity.id

    override suspend fun ResultRow.toEntity() = ActorRecord(
        id = this[ActorTable.id].value,
        name = this[ActorTable.name],
    )

    override fun BatchInsertStatement.bindSave(entity: ActorRecord) {
        this[ActorTable.name] = entity.name
    }
}
```

Override `bindSave` before using the default `saveAll`. The default implementation throws `UnsupportedOperationException`; this prevents an apparently successful batch call from silently omitting application columns.

## Choose terminal behavior deliberately

| Need | API shape | Contract |
| --- | --- | --- |
| Required row | `findById` | Fails when no row exists |
| Optional row | `findByIdOrNull` | Returns `null` when absent |
| Stream/filter | `findAll`, `findBy`, `findByField` | Returns `Flow<E>`; collect inside the transaction |
| Page with total | `findPage` | Validates page number and size and returns `ExposedPage` |
| Bulk insert | `saveAll`, `batchInsert` | Binding and generated-ID behavior must match the table/driver |
| Bulk upsert | `batchUpsert` | Conflict behavior is database-specific and needs integration tests |

Avoid converting every query to `List` by habit. Use a list when the complete result is required in memory; use `Flow` when downstream processing can consume rows incrementally. In both cases, the terminal operation remains inside `suspendTransaction`.

## State-specific repositories

`AuditableR2dbcRepository` adds update helpers for `updatedAt` and `updatedBy`. Plain `updateById` and `updateAll` do not set audit columns automatically, so choose the audited methods where that contract is required.

`SoftDeletedR2dbcRepository` exposes active, deleted, soft-delete, and restore operations. A normal `findAll` is not automatically restricted to active rows. Make visibility explicit at the service boundary rather than assuming a global filter.

## Keep mapping strict

Map required columns directly and fail close to the database boundary. Do not turn every `ResultRow` into `Map<String, Any?>`; explicit mapping keeps nullability, ID conversion, and schema drift visible. If mapping itself performs suspension or external I/O, its latency extends the transaction and connection holding time.

## Batch and paging caveats

- Empty `saveAll` input is a no-op.
- Generated IDs preserve the order reported by Exposed `batchInsert`; verify driver behavior for the selected database.
- `findPage` computes a count and reads page content. Concurrent writes can change the database between those operations unless the chosen isolation level provides the needed view.
- Large offsets remain a database concern. For deep navigation, evaluate keyset pagination in application-specific queries.

## Learning path

Start with one repository and H2, then repeat the same behavior against the production driver. Continue to [`exposed-r2dbc-workshop`](https://github.com/bluetape4k/exposed-r2dbc-workshop) for DDL/DML, coroutine repositories, Spring WebFlux, Ktor, cache, multi-tenancy, and routing exercises. The workshop is a learning repository; the 1.12.1 source links below remain the API authority for this manual.

## Sources

- [`R2dbcRepository.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.12.1/exposed/r2dbc/src/main/kotlin/io/bluetape4k/exposed/r2dbc/repository/R2dbcRepository.kt)
- [`AuditableR2dbcRepository.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.12.1/exposed/r2dbc/src/main/kotlin/io/bluetape4k/exposed/r2dbc/repository/AuditableR2dbcRepository.kt)
- [`SoftDeletedR2dbcRepository.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.12.1/exposed/r2dbc/src/main/kotlin/io/bluetape4k/exposed/r2dbc/repository/SoftDeletedR2dbcRepository.kt)
- [`exposed/r2dbc/build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.12.1/exposed/r2dbc/build.gradle.kts)
