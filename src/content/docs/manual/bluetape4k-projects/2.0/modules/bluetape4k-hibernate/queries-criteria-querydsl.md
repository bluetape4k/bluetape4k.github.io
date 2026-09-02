---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-hibernate/queries-criteria-querydsl"
title: JPQL, Criteria, and Querydsl
description: Move from reified lookup helpers to dynamic queries and projections.
manualId: bluetape4k-hibernate
chapterId: queries-criteria-querydsl
manual:
  id: "bluetape4k-hibernate"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-hibernate/queries-criteria-querydsl.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "data/hibernate"
  layer: "build"
  learningOrder: 640
  chapterId: "queries-criteria-querydsl"
  chapterOrder: 3
---


## Start with the smallest query form

Use `findAs` for an ID, typed JPQL for a fixed query, and Criteria or Querydsl when conditions must be composed.

```kotlin
val active = entityManager
    .createQueryAs<Account>("select a from Account a where a.active = true")
    .setPaging(0, 50)
    .resultList
```

`findOneOrNull` converts only `NoResultException` to null. Non-unique and database failures still propagate. Natural-ID helpers support one `@NaturalId` or a non-empty map of composite attributes.

## Criteria helpers

```kotlin
val cb = entityManager.criteriaBuilder
val query = cb.createQueryAs<Account>()
val root = query.from<Account>()
query.select(root).where(cb.eq(root.attribute(Account::active), true))
```

`attribute` uses the Kotlin property name as the JPA path. It reduces strings but is not a generated metamodel check.

## Querydsl and projections

Querydsl fits joins, subqueries, projections, and reusable predicates. Q types still require annotation processing. Select constructor, bean, or `@QueryProjection` mapping based on compile-time checks and coupling.

| Query shape | Start with |
| --- | --- |
| ID or natural ID | reified lookup helper |
| Short fixed query | typed JPQL |
| JPA-standard dynamic query | Criteria |
| Kotlin joins and projections | Querydsl |
| Entity Views and keyset pages | Blaze-Persistence demo |

Avoid deprecated Querydsl `fetchCount()` and `fetchResults()` shortcuts for complex queries; use an explicit count or Blaze-Persistence page metadata.

## Executable examples

```bash
./gradlew :bluetape4k-hibernate:test --tests '*SimpleQuerydslExamples'
./gradlew :bluetape4k-examples-jpa-querydsl-demo:test
./gradlew :bluetape4k-examples-jpa-blazepersistence-demo:test
```

## Sources and tests

- [`CriteriaSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/criteria/CriteriaSupport.kt)
- [`TypedQuerySupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/criteria/TypedQuerySupport.kt)
- [`SimpleQuerydslExamples.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/hibernate/src/test/kotlin/io/bluetape4k/hibernate/querydsl/simple/SimpleQuerydslExamples.kt)
- [`NaturalIdTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/hibernate/src/test/kotlin/io/bluetape4k/hibernate/mapping/naturalid/NaturalIdTest.kt)
