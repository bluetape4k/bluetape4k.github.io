---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate/entitymanager-transactions"
title: EntityManager and transactions
description: Define EntityManager ownership, persist and merge behavior, flush timing, and bulk-query boundaries.
manualId: bluetape4k-hibernate
chapterId: entitymanager-transactions
manual:
  id: "bluetape4k-hibernate"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "46993c010f5bef45fef0943bbc93728d16119bd5"
  sourcePath: "docs/manual/en/modules/bluetape4k-hibernate/entitymanager-transactions.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "data/hibernate"
  layer: "build"
  chapterId: "entitymanager-transactions"
---


## Use one transaction owner

`withNewEntityManager` creates an `EntityManager` and transaction, commits on success, rolls back on failure, and closes the manager. Do not nest it inside a Spring `@Transactional` operation that already owns these resources.

```kotlin
val id = emf.withNewEntityManager { em ->
    val account = Account("user@example.com")
    em.persist(account)
    account.identifier
}
```

In 1.11.0, rollback failure is warning-only. The original exception is preserved, but the rollback error is not attached as suppressed; retain the helper logger when diagnosing failures.

## Continue with the merge result

`save` calls `merge` for a persisted entity outside the current context and `persist` otherwise. Merge copies state into a managed instance; it does not make the detached input managed.

```kotlin
val managed = entityManager.save(detached)
managed.name = "new name"
```

`delete` ignores an entity without an ID and merges a detached entity before removal. `deleteById` starts with a reference, but SQL, foreign-key, and optimistic-lock failures can still appear at flush or commit.

## Flush and bulk operations

Hibernate may delay SQL until flush or commit. Add an explicit `flush()` in tests that must pin the database failure point.

`findAll` defaults to `Int.MAX_VALUE`; production callers must pass a bound. `deleteAll<T>()` is a JPQL bulk delete, so it bypasses entity callbacks, cascades, and managed state. Flush first and clear the persistence context afterward.

```kotlin
entityManager.flush()
val deleted = entityManager.deleteAll<ExpiredSession>()
entityManager.clear()
```

`currentSessionImpl` and `currentConnection` use Hibernate internals. Keep them inside narrow Hibernate-specific integrations.

## Executable tests

```bash
./gradlew :bluetape4k-hibernate:test --tests '*EntityManagerFactorySupportTest'
./gradlew :bluetape4k-hibernate:test --tests '*EntityManagerSupportTest'
```

## Sources and tests

- [`EntityManagerFactorySupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/EntityManagerFactorySupport.kt)
- [`EntityManagerSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/EntityManagerSupport.kt)
- [`EntityManagerSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/test/kotlin/io/bluetape4k/hibernate/EntityManagerSupportTest.kt)
