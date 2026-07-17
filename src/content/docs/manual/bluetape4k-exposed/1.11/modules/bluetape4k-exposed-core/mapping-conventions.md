---
slug: "manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-core/mapping-conventions"
title: Mapping conventions
description: Separate tables, result rows, DAO entities, and application records at a transaction-safe persistence boundary.
manualId: bluetape4k-exposed-core
chapterId: mapping-conventions
manual:
  id: "bluetape4k-exposed-core"
  repository: "bluetape4k-exposed"
  group: "foundation"
  kind: "library"
  sourceCommit: "803227f0f6aa061ddad6cb66721c565dee38f53c"
  sourcePath: "docs/manual/en/modules/bluetape4k-exposed-core/mapping-conventions.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "0b494a5fd1e083006046764757342b68a397e4c5"
  sourceDir: "exposed/core"
  layer: "build"
  chapterId: "mapping-conventions"
---


A useful Exposed boundary separates three shapes: a `Table` describes SQL columns, a `ResultRow` represents one query result, and an application record is safe to pass beyond the transaction. Keeping these roles separate makes JDBC and R2DBC repositories share the same schema without leaking driver state into domain code.

## Map rows explicitly

Implement the repository's `ResultRow.toEntity` hook as a small, deterministic mapper. Read required columns with their non-null type and nullable columns with an explicit nullable accessor or normal Exposed indexing.

```kotlin
data class ActorRecord(
    val id: Long,
    val firstName: String,
    val lastName: String,
)

override fun ResultRow.toEntity() = ActorRecord(
    id = this[ActorTable.id].value,
    firstName = this[ActorTable.firstName],
    lastName = this[ActorTable.lastName],
)
```

The core `ResultRow` extensions provide required/nullable pairs for primitives, strings, dates, time values, UUIDs, byte arrays, and numeric values. A required accessor fails with a descriptive error when the selected expression is absent or null; it should not silently invent a domain default.

## Keep DAO entities inside the transaction

Exposed DAO entities are transaction-bound objects. Read delegated properties and convert the entity to a record before the transaction closes. Do not return a DAO entity to an HTTP serializer or enqueue it for later work.

```kotlin
val record = transaction {
    ProductEntity.findById(id)?.let {
        ProductRecord(it.id.value, it.name, it.price, it.stock)
    }
}
```

Entity equality helpers in this module compare the raw ID rather than the `EntityID` wrapper. That is suitable for persistence identity, but it does not replace domain equality for value objects.

## Bind writes deliberately

`JdbcRepository` and `R2dbcRepository` require `BatchInsertStatement.bindSave` before their default `saveAll` can be used. List every required non-ID column. Leaving the default implementation in place fails fast with `UnsupportedOperationException`, which is safer than inserting partially bound records.

```kotlin
override fun BatchInsertStatement.bindSave(actor: ActorRecord) {
    this[ActorTable.firstName] = actor.firstName
    this[ActorTable.lastName] = actor.lastName
}
```

For audit tables, mapping and audit mutation are different responsibilities. `AuditableEntity.flush()` sets `createdBy` or `updatedBy`, but `updatedAt` is guaranteed only by `auditedUpdateById`/`auditedUpdateAll`. Keep this distinction visible in repository code.

## Paging is a result contract, not a snapshot guarantee

`ExposedPage` stores content, total count, page number, and page size. Its navigation flags are derived values. Repository `findPage` first counts rows and then fetches content, so concurrent writes can make the values differ. Use an isolation level that supplies the required consistency, or accept the page as an operational approximation.

## Failure modes

- Returning a DAO entity outside its transaction causes late property access to fail.
- Mapping a nullable DB column to a non-null property without a domain rule turns data drift into an unexplained runtime failure.
- Reusing a row mapper after changing the SELECT projection can make required expressions unavailable.
- Treating a serialized/compressed column as ordinary bytes loses the codec and schema-evolution contract.
- Adding `?: default` to every mapping hides malformed or incomplete stored data.

## Testing the boundary

Test the mapper with representative rows and the repository against a real supported dialect. Include nullability, generated IDs, batch binding, page validation (`pageNumber >= 0`, `pageSize > 0`), and concurrent paging assumptions. If stored data uses compression or serialization, include backward-compatible fixtures rather than testing only values written by the current codec.

Next, read [JDBC repository patterns](/manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-jdbc/repository-patterns/) or the [R2DBC repository guide](/manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-r2dbc/repository-patterns/).

## Sources

- [ResultRow extensions](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/core/src/main/kotlin/io/bluetape4k/exposed/core/ResultRowExtensions.kt)
- [Entity extensions](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/dao/src/main/kotlin/io/bluetape4k/exposed/dao/EntityExtensions.kt)
- [Auditable entity](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/dao/src/main/kotlin/io/bluetape4k/exposed/dao/auditable/AuditableEntity.kt)
- [Paging value](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/core/src/main/kotlin/io/bluetape4k/exposed/core/ExposedPage.kt)
- [JDBC repository contract](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/jdbc/src/main/kotlin/io/bluetape4k/exposed/jdbc/repository/JdbcRepository.kt)
