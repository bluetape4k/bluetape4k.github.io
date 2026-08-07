---
slug: "manual/bluetape4k-projects/1.12/modules/bluetape4k-hibernate/stateless-batch-events"
title: StatelessSession, batches, and events
description: Compare stateful and stateless bulk work, batch restoration, and listener operations.
manualId: bluetape4k-hibernate
chapterId: stateless-batch-events
manual:
  id: "bluetape4k-hibernate"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "ffde7b8be16124b1c538bb318a7d482927f738ad"
  sourcePath: "docs/manual/en/modules/bluetape4k-hibernate/stateless-batch-events.md"
  minorVersion: "1.12"
  releaseRef: "1.12.1"
  releaseCommit: "7cf0b73646af05c0f8872cc4f6a16983949c4e3e"
  sourceDir: "data/hibernate"
  layer: "build"
  learningOrder: 640
  chapterId: "stateless-batch-events"
  chapterOrder: 5
---


## Reduce stateful Session cost first

`withBatchSize` temporarily applies a positive JDBC batch size and restores the previous value. It does not bound the first-level cache, so bulk inserts still need periodic flush and clear.

```kotlin
session.withBatchSize(100) {
    entities.forEachIndexed { index, entity ->
        persist(entity)
        if ((index + 1) % 100 == 0) { flush(); clear() }
    }
}
```

In 1.12.1, failure to read the old value falls back to zero and restoration failure is warning-only.

## Features omitted by StatelessSession

`SessionFactory.withStateless` owns the stateless session, transaction, commit or rollback, and close. StatelessSession omits the first-level cache, dirty checking, cascading, collection persistence, and JPA entity listeners.

```kotlin
sessionFactory.withStateless { stateless ->
    masters.forEach { master ->
        stateless.insert(master)
        master.details.forEach(stateless::insert)
    }
}
```

Insert related entities explicitly.

## 1.12.1 Spring limitation

The 1.12.1 `StatelessSessionFactoryBean` binds its resource under the `SessionFactory` key and can collide with an existing JPA transaction resource. The dedicated-key fix came after the release. Prefer explicit `SessionFactory.withStateless` over the injected Spring proxy in 1.12.1.

`registerEventListener` adds Hibernate listeners; the misspelled `registEventListener` is deprecated. Built-in logging listeners can print full entities at trace level. Keep credentials and personal data out of entity string output, and use a durable audit design when audit delivery matters.

## Executable tests

```bash
./gradlew :bluetape4k-hibernate:test --tests '*StatelessSessionStandaloneTest'
./gradlew :bluetape4k-hibernate:test --tests '*SessionSupportTest'
```

## Sources and tests

- [`SessionSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/SessionSupport.kt)
- [`StatelessSesisonSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/stateless/StatelessSesisonSupport.kt)
- [`StatelessSessionFactoryBean.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/spring/StatelessSessionFactoryBean.kt)
- [`StatelessSessionStandaloneTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/data/hibernate/src/test/kotlin/io/bluetape4k/hibernate/standalone/StatelessSessionStandaloneTest.kt)
