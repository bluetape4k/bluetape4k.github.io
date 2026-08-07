---
slug: "manual/bluetape4k-projects/1.12/modules/bluetape4k-spring-boot-mongodb/query-dsl"
title: Criteria, Query, and Update DSL
description: Compose filters, sorting, pagination, and updates with Kotlin extensions while retaining Spring Data objects.
manualId: bluetape4k-spring-boot-mongodb
chapterId: query-dsl
manual:
  id: "modules/bluetape4k-spring-boot-mongodb/query-dsl"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "ffde7b8be16124b1c538bb318a7d482927f738ad"
  sourcePath: "docs/manual/en/modules/bluetape4k-spring-boot-mongodb/query-dsl.md"
  minorVersion: "1.12"
  releaseRef: "1.12.1"
  releaseCommit: "7cf0b73646af05c0f8872cc4f6a16983949c4e3e"
  sourceDir: "docs/manual"
  layer: "build"
---


## Criteria remains a Spring Data object

Extensions such as `eq`, `gt`, `inValues`, `regex`, and `andWith` do not create another query engine. They are Kotlin infix aliases for methods on Spring Data `Criteria`.

```kotlin
val criteria =
    ("age".criteria() gte 20) andWith
        ("city".criteria() inValues listOf("Seoul", "Busan"))
```

`criteriaOf(c1, c2)` combines conditions with `$and`. Field-existence, null, array-size, element-match, and regex helpers produce the corresponding Spring Data BSON structures.

## Build a Query

```kotlin
val query = queryOf(
    "status".criteria() ne "deleted",
    "age".criteria() gte 20,
).sortDescBy("createdAt")
 .paginate(page = 0, size = 50)
```

`queryOf()` creates an empty `Query` for no arguments, a single-criteria query for one, and an `$and` query for several. `sortBy`, `sortAscBy`, `sortDescBy`, `limitTo`, `skipTo`, and `paginate` mutate and return the same `Query`.

`paginate(page, size)` is only `skip(page * size).limit(size)`. It does not validate arguments. Reject negative pages and non-positive sizes at the controller boundary, and limit large offsets and multiplication ranges.

## Build an Update

```kotlin
val update = ("name" setTo "Alice")
    .andSet("city", "Seoul")
    .andInc("loginCount", 1)
    .andPush("history", "signed-in")
```

`updateOf("name" to "Alice", "age" to 31)` turns every pair into `$set`. `setTo`, `incBy`, `unsetField`, `pushValue`, and `pullValue` start one operation; `andSet`, `andInc`, `andUnset`, and `andPush` add more operations.

## String field boundaries

The DSL accepts document properties as strings. The compiler cannot find typos or renames, so centralize frequently used names or derive them from mapping metadata. Never pass an HTTP parameter directly as a field name or regex; apply an allowlist and input limits.

## Unit-testing the DSL

Criteria, Query, and Update tests do not start MongoDB. They compare `criteriaObject`, `queryObject`, `sortObject`, and `updateObject` with objects produced by the standard Spring Data API. This is the fastest regression test when extending the DSL.

## Source and tests

- [`CriteriaExtensions.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/CriteriaExtensions.kt)
- [`QueryExtensions.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/QueryExtensions.kt)
- [`UpdateExtensions.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/UpdateExtensions.kt)
- [`CriteriaExtensionsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/query/CriteriaExtensionsTest.kt)
- [`QueryExtensionsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/query/QueryExtensionsTest.kt)
- [`UpdateExtensionsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/query/UpdateExtensionsTest.kt)

## Next chapter

Move beyond ordinary finds in [Aggregation, collections, and streaming](/manual/bluetape4k-projects/1.12/modules/bluetape4k-spring-boot-mongodb/aggregation-collections-streaming/).
