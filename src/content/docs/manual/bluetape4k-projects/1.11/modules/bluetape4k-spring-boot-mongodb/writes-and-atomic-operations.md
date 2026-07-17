---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-mongodb/writes-and-atomic-operations"
title: Writes and atomic operations
description: Separate the contracts of insert, save, update, upsert, delete, and find-and-modify.
manualId: bluetape4k-spring-boot-mongodb
chapterId: writes-and-atomic-operations
manual:
  id: "modules/bluetape4k-spring-boot-mongodb/writes-and-atomic-operations"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "e89bf724fd018af8c2ab4564a5c9a007fe27b46a"
  sourcePath: "docs/manual/en/modules/bluetape4k-spring-boot-mongodb/writes-and-atomic-operations.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "docs/manual"
  layer: "build"
---


## Distinguish insert from save

`insertSuspending(entity)` delegates a new-document insert. An existing ID can produce a duplicate-key failure. `saveSuspending(entity)` can insert or replace a document according to its ID state.

```kotlin
val inserted = mongoOperations.insertSuspending(
    User(name = "Alice", email = "alice@example.com", age = 30, city = "Seoul")
)

val saved = mongoOperations.saveSuspending(inserted.copy(city = "Suwon"))
```

When only a few fields change, use a conditional update rather than rewriting the whole document with `save`.

## Read UpdateResult

`updateFirstSuspending`, `updateMultiSuspending`, and `upsertSuspending` return `UpdateResult`.

```kotlin
val result = mongoOperations.updateFirstSuspending<User>(
    queryOf("email".criteria() eq "alice@example.com"),
    ("city" setTo "Suwon").andInc("loginCount", 1),
)

check(result.matchedCount == 1L)
```

A `matchedCount` of zero means no document matched. A matched document with `modifiedCount == 0` may already contain the requested value or may not be counted as changed by the server. Do not treat those states as identical.

## Upsert

`upsertSuspending` updates a matching document and inserts one when none matches. Ensure that the query contains a stable business key so a repeated request does not create more documents. Back a required invariant with a unique index.

## Atomic modify and remove

`findAndModifySuspending` and `findAndRemoveSuspending` ask the server to modify or remove one matching document atomically and return the document. No match returns `null`.

```kotlin
val previous: User? = mongoOperations.findAndModifySuspending(
    queryOf("email".criteria() eq email),
    "loginCount" incBy 1,
)
```

The default find-and-modify operation returns the document before modification. This extension has no options parameter; use Spring Data's options-capable API directly when the updated document is required.

## Delete results and transactions

Deleting by query or entity returns `DeleteResult`. Compare `deletedCount` with the expected count. The extension does not start a transaction, so group a business operation that touches multiple collections in a Spring reactive transaction at the service boundary.

## Source and tests

- [`ReactiveMongoOperationsCoroutines.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/coroutines/ReactiveMongoOperationsCoroutines.kt)
- [`ReactiveMongoOperationsCoroutinesTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/coroutines/ReactiveMongoOperationsCoroutinesTest.kt)
- [`UpdateExtensions.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/UpdateExtensions.kt)

## Next chapter

Build write filters and update documents in [Criteria, Query, and Update DSL](/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-mongodb/query-dsl/).
