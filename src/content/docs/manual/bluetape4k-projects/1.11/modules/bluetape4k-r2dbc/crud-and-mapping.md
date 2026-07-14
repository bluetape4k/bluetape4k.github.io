---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-r2dbc/crud-and-mapping"
title: CRUD and row mapping
description: Use raw-table and entity CRUD with identifier validation, typed row access, and PostgreSQL JSON conversion.
manualId: bluetape4k-r2dbc
chapterId: crud-and-mapping
manual:
  id: "bluetape4k-r2dbc"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "ece059d6f79ae8b6d769e44ec98483a1225f6260"
  sourcePath: "docs/manual/en/modules/bluetape4k-r2dbc/crud-and-mapping.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "data/r2dbc"
  layer: "build"
  chapterId: "crud-and-mapping"
---


## Raw-table and entity paths

`insert`, `update`, and `delete` provide both a thin table-oriented SQL DSL and Spring Data entity operations. Use the raw-table path when the adapter owns the SQL shape, and the entity path when mapping metadata and the domain type drive the operation.

```kotlin
val id = client
    .insert()
    .into("users", "user_id")
    .value("username", "nick")
    .value("password", "pass")
    .value("name", "Nick")
    .nullValue("description", String::class.java)
    .awaitOne()
```

Use `awaitOneLong()` for generated keys larger than `Int`. The README's `sqlInsert` and `awaitGeneratedKey` do not exist in 1.11.0 source and are not used here.

## Make update and delete scope explicit

```kotlin
val changed = client
    .update()
    .table("users")
    .set("active", false)
    .matching("username = :username", mapOf("username" to "nick"))
    .fetch()
    .awaitRowsUpdated()
```

Omitting `matching()` can target every row. Validate condition presence unless a full-table update or delete is intentional.

## Identifier validation boundary

Raw CRUD accepts table and column identifiers that begin with a letter or underscore and contain only letters, digits, underscores, and dots. This blocks value injection through identifier positions. It does not parse the raw where string, order expression, or arbitrary SQL. Bind values as parameters and build SQL fragments only from trusted code.

## Typed rows and PostgreSQL JSON

`R2dbcClient.execute<T>` delegates to `MappingR2dbcConverter`. Align simple projection aliases with property names and register Spring converters for richer rules. `ReadableSupport` adds named and indexed accessors for numbers, strings, dates, times, byte arrays, and UUIDs, including nullable variants.

`JsonToMapConverter` and `MapToJsonConverter` bridge the PostgreSQL driver's `Json` and `Map<String, Any?>` through Jackson3. Both integrations are optional runtime capabilities. Malformed JSON and serialization failures propagate as `ConversionFailedException` with the Jackson cause rather than becoming empty values.

## Sources and tests

- [`Insert.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/core/Insert.kt)
- [`Update.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/core/Update.kt)
- [`Delete.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/core/Delete.kt)
- [`ReadableSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/main/kotlin/io/bluetape4k/r2dbc/support/ReadableSupport.kt)
- [`PostgresJsonConvertersTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/convert/postgresql/PostgresJsonConvertersTest.kt)
- [`InsertTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/core/InsertTest.kt)
- [`UpdateTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/r2dbc/src/test/kotlin/io/bluetape4k/r2dbc/core/UpdateTest.kt)

## Next chapter

Continue to [Dynamic queries](/manual/bluetape4k-projects/1.11/modules/bluetape4k-r2dbc/dynamic-queries/) when optional predicates begin to accumulate.
