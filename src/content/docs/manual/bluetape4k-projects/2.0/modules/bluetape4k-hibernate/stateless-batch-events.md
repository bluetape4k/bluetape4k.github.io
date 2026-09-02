---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-hibernate/stateless-batch-events"
title: StatelessSession, batches, and events
description: Compare stateful and stateless bulk work, batch restoration, and listener operations.
manualId: bluetape4k-hibernate
chapterId: stateless-batch-events
manual:
  id: "bluetape4k-hibernate"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-hibernate/stateless-batch-events.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
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

In 2.0.0, failure to read the old value falls back to zero and restoration failure is warning-only.

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

## 2.0.0 Spring limitation

The 2.0.0 `StatelessSessionFactoryBean` binds its resource under the `SessionFactory` key and can collide with an existing JPA transaction resource. The dedicated-key fix came after the release. Prefer explicit `SessionFactory.withStateless` over the injected Spring proxy in 2.0.0.

`registerEventListener` adds Hibernate listeners; the misspelled `registEventListener` is deprecated. Built-in logging listeners can print full entities at trace level. Keep credentials and personal data out of entity string output, and use a durable audit design when audit delivery matters.

## Executable tests

```bash
./gradlew :bluetape4k-hibernate:test --tests '*StatelessSessionStandaloneTest'
./gradlew :bluetape4k-hibernate:test --tests '*SessionSupportTest'
```

## Sources and tests

- [`SessionSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/SessionSupport.kt)
- [`StatelessSesisonSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/stateless/StatelessSesisonSupport.kt)
- [`StatelessSessionFactoryBean.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/spring/StatelessSessionFactoryBean.kt)
- [`StatelessSessionStandaloneTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/hibernate/src/test/kotlin/io/bluetape4k/hibernate/standalone/StatelessSessionStandaloneTest.kt)
