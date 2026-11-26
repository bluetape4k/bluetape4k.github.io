---
manualId: "bluetape4k-exposed-r2dbc-dao"
id: "bluetape4k-exposed-r2dbc-dao"
title: "Exposed R2DBC DAO Integration"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-r2dbc-dao"
sourceDir: "exposed/r2dbc-dao"
releaseRef: "develop"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-r2dbc-dao
---

# Exposed R2DBC DAO Integration

> **2.2.0 development preview.** This page describes an experimental integration being prepared for the `2.2.0` development line. It is not included in the stable `2.0.0` release pinned by this manual.

## Problem {#problem}

JetBrains Exposed 1.6.0 introduced experimental R2DBC DAO support through the `exposed-dao-r2dbc` artifact; Exposed 1.6.1 continues to provide that API. A consumer needs its DAO classes together with Exposed core and R2DBC, while keeping the JDBC DAO artifacts out of the same source set. This dependency-only module supplies that opt-in path without adding a Bluetape4k wrapper API or taking ownership of database resources.

## When to use it {#when-to-use}

Use this module when the application already chose the Exposed R2DBC transport and needs the DAO entity model. Stay with the R2DBC DSL when it is sufficient. The upstream API is experimental and may change between releases; check the migration notes and recompile consumers on every Exposed upgrade.

## Coordinates {#coordinates}

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-r2dbc-dao")
    runtimeOnly("org.postgresql:r2dbc-postgresql") // select the deployed driver
}
```

The module exposes `org.jetbrains.exposed:exposed-dao-r2dbc:1.6.1`, Exposed core, and Exposed R2DBC as API dependencies. The application supplies the driver, `ConnectionFactory` or pool, `R2dbcDatabase`, and shutdown lifecycle.

## Core concepts {#concepts}

- Add `ExperimentalR2dbcDaoApi` opt-in where the upstream DAO API is used.
- Use `newSuspend` when generated identifiers or other database-generated values are needed immediately; it inserts before returning.
- Relationship collections are Kotlin `Flow` values. Collect them before the owning `suspendTransaction` closes.
- Call `attach()` before modifying an entity that crossed an R2DBC transaction boundary.
- Keep R2DBC DAO and JDBC DAO artifacts in separate consumer modules or source sets. Their upstream DAO types share names, and the existing Bluetape4k R2DBC integration also includes JDBC DAO support.

## Quick start {#quick-start}

```kotlin
@file:OptIn(org.jetbrains.exposed.v1.dao.r2dbc.ExperimentalR2dbcDaoApi::class)

import kotlinx.coroutines.flow.toList
import org.jetbrains.exposed.v1.core.dao.id.EntityID
import org.jetbrains.exposed.v1.core.dao.id.LongIdTable
import org.jetbrains.exposed.v1.dao.r2dbc.LongEntity
import org.jetbrains.exposed.v1.dao.r2dbc.LongEntityClass
import org.jetbrains.exposed.v1.r2dbc.SchemaUtils
import org.jetbrains.exposed.v1.r2dbc.transactions.suspendTransaction

object Users : LongIdTable("users") {
    val name = varchar("name", 100)
}

class User(id: EntityID<Long>) : LongEntity(id) {
    companion object : LongEntityClass<User>(Users)
    var name by Users.name
}

suspend fun createUser(database: org.jetbrains.exposed.v1.r2dbc.R2dbcDatabase) =
    suspendTransaction(db = database) {
        SchemaUtils.create(Users)
        val user = User.newSuspend { name = "Ada" }
        user.id.value to User.all().toList().map { it.name }
    }
```

Keep DAO work and Flow collection inside the same transaction. The database and connection resources remain application-owned.

## API by task {#api-by-task}

| Task | Upstream API |
|---|---|
| Insert and read generated ID | `EntityClass.newSuspend { ... }` |
| Read related rows | relationship `Flow` and terminal operators such as `toList()` or `count()` |
| Move an entity between transactions | `User.attach(entity)` |
| Intentionally replace a dirty cached entity | `User.attach(entity, force = true)`; this discards its pending changes |

## Recommended patterns {#patterns}

Define one `suspendTransaction` for each database business operation. Create entities, traverse relationships, and collect their `Flow` values before that boundary ends. When moving an entity across transactions, attach it in the receiving transaction before reading mutable state or making updates. Keep imports explicit so JDBC DAO classes cannot accidentally shadow the R2DBC DAO types.

## Integrations {#integrations}

The module is independent of Spring Boot and Ktor. Framework integrations may establish transaction context, but the application must ensure that DAO work uses the same `R2dbcDatabase` and transaction boundary. Configure the R2DBC driver and pool for the chosen database separately.

## Configuration {#configuration}

No production classes or configuration are added by this module. The application configures `ConnectionFactory`, optional pool limits and timeouts, `R2dbcDatabase`, and orderly shutdown. Avoid using a JDBC `Database` or JDBC DAO dependency on the same consumer classpath.

## Failure modes {#failures}

- Reading a generated ID from deferred `new()` work can fail; use `newSuspend()` when the value is needed before a flush.
- Collecting a relationship Flow after its transaction ends can lose access to the transaction connection.
- Modifying an entity in another transaction without `attach()` violates the entity-cache boundary.
- `attach(force = true)` can discard pending changes from the entity already tracked by the current transaction.
- Combining JDBC and R2DBC DAO artifacts introduces same-named DAO types and is unsupported for one consumer source set.

## Operations {#operations}

Monitor pool acquisition, transaction duration, query errors, timeouts, and cancellation with the selected driver. Test how cancellation and rollback affect the database and connection pool; the behavior is not guaranteed uniformly across drivers. Keep ownership and shutdown of pools in the application.

## Testing {#testing}

The integration tests cover generated IDs, relation Flow collection, transaction-to-transaction `attach()`, deleted rows, dirty-cache conflicts, forced replacement, concurrent transaction caches, and cancellation with rollback and connection reuse. Run them with H2 and PostgreSQL, then add the application's selected driver and schema to consumer-level tests. The dependency-only consumer check also verifies that the published coordinates compile when opted in and fail with the expected missing-artifact diagnostic when omitted.

## Workshops and learning path {#workshops}

Start with the [R2DBC module](bluetape4k-exposed-r2dbc.md) to understand coroutine transactions and the DSL path, then read JetBrains' [R2DBC DAO migration guide](https://www.jetbrains.com/help/exposed/migrating-from-jdbc-to-r2dbc-dao.html). See the integration [README](https://github.com/bluetape4k/bluetape4k-exposed/blob/develop/exposed/r2dbc-dao/README.md) and its [Korean version](https://github.com/bluetape4k/bluetape4k-exposed/blob/develop/exposed/r2dbc-dao/README.ko.md) for the complete entity and relation example.

## Limitations {#limitations}

This is an experimental, dependency-only integration planned for `2.2.0`; it does not add a stable Bluetape4k DAO abstraction, driver, connection pool, transaction manager, or lifecycle management. Its API and behavior can change upstream. The page remains outside the stable `2.0.0` release baseline.

## Sources {#sources}

- [Integration build](https://github.com/bluetape4k/bluetape4k-exposed/blob/develop/exposed/r2dbc-dao/build.gradle.kts)
- [DAO contract tests](https://github.com/bluetape4k/bluetape4k-exposed/blob/develop/exposed/r2dbc-dao/src/test/kotlin/io/bluetape4k/exposed/r2dbc/dao/ExposedR2dbcDaoContractTest.kt)
- [JetBrains: Exposed 1.6.0 R2DBC DAO support](https://www.jetbrains.com/help/exposed/whats-new-160.html)
- [JetBrains: Adding Exposed dependencies](https://www.jetbrains.com/help/exposed/adding-dependencies.html)
