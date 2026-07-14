---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate/entity-model-lifecycle"
title: Entity model and lifecycle
description: Understand identifier generation, transient, managed, and detached state, and entity equality.
manualId: bluetape4k-hibernate
chapterId: entity-model-lifecycle
manual:
  id: "bluetape4k-hibernate"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "03115e34f03bad535921d3cad5cd23a2e7814581"
  sourcePath: "docs/manual/en/modules/bluetape4k-hibernate/entity-model-lifecycle.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "data/hibernate"
  layer: "build"
  chapterId: "entity-model-lifecycle"
---


## Separate entity states

Hibernate entities move through transient, managed, and detached states. `persist`, `merge`, lazy loading, and dirty checking behave differently in each state.

`IntJpaEntity` and `LongJpaEntity` use `IDENTITY`, so their IDs normally appear after insert. `UuidJpaEntity` assigns UUID v7 during construction. Because this module defines `isPersisted` as `id != null`, a UUID entity reports persisted before its first insert. Do not use `isPersisted` as a database-existence check.

```kotlin
@Entity
class Account(var email: String = ""): LongJpaEntity() {
    override fun equalProperties(other: Any): Boolean =
        other is Account && email == other.email
}
```

`identifier` throws `IllegalStateException` while the ID is null.

## Equality and hash codes

`AbstractJpaEntity.equals` compares IDs when both entities are persisted, uses `equalProperties` when both are transient, and rejects a mixed persisted/transient pair. It unproxies Hibernate proxies before comparison.

The 1.11.0 hash contract has a known limitation: two transient instances can be equal by business signature but have different identity hash codes. The later class-based hash fix is not 1.11.0 behavior.

- Do not use transient entities as deduplication keys in `HashSet` or `HashMap`.
- Do not keep an entity in a hash collection while its persistence state changes.
- Use a stable business-key value object outside the persistence boundary.

## Trees and lazy proxies

`IntJpaTreeEntity` and `LongJpaTreeEntity` map parent and children. `addChildren` and `removeChildren` update both sides in memory. `CascadeType.ALL` means the deletion policy must match the domain.

`getReference` may return an uninitialized proxy. Read required associations or map the entity to a DTO inside the transaction. `isLoaded` can inspect initialization but does not replace an explicit fetch plan.

## Executable tests

```bash
./gradlew :bluetape4k-hibernate:test --tests '*JpaEntityModelTest'
./gradlew :bluetape4k-hibernate:test --tests '*TreeNodeTest'
```

## Sources and tests

- [`JpaEntity.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/model/JpaEntity.kt)
- [`AbstractJpaEntity.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/model/AbstractJpaEntity.kt)
- [`JpaTreeEntity.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/model/JpaTreeEntity.kt)
- [`TreeNodeTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/test/kotlin/io/bluetape4k/hibernate/mapping/tree/TreeNodeTest.kt)
