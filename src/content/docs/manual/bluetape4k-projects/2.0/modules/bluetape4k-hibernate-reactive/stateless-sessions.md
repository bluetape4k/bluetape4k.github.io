---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-hibernate-reactive/stateless-sessions"
title: Using StatelessSession
description: Apply StatelessSession to reactive work that does not need a first-level cache while respecting its limits.
manualId: bluetape4k-hibernate-reactive
chapterId: stateless-sessions
manual:
  id: "bluetape4k-hibernate-reactive"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-hibernate-reactive/stateless-sessions.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "data/hibernate-reactive"
  layer: "build"
  learningOrder: 650
  chapterId: "stateless-sessions"
  chapterOrder: 4
---


## Difference from a regular Session

StatelessSession does not use a first-level cache or regular persistence-context state tracking. It fits bulk single-row lookups and explicit bulk work that does not need managed-entity dirty checking. Use a regular Session when a use case changes an object graph and relies on flush semantics.

```kotlin
val count = sessionFactory.withStatelessTransactionSuspending { session, tx ->
    check(!tx.isMarkedForRollback)
    session.createSelectionQueryAs<Long>("select count(a) from Author a")
        .singleResult.awaitSuspending()
}
```

## Available work

- ID-based `getAs<T>`;
- typed HQL/JPQL, named queries, and native queries;
- result-set mapping and EntityGraph metadata;
- session-only and transaction blocks;
- tenant-ID overloads.

Mutiny supports `LockModeType`, EntityGraph, and graph-name `getAs` overloads, while Stage provides only ID and Hibernate `LockMode` variants.

## Fetch and consistency

The tests use fetch joins, EntityGraphs, and explicit `fetch()` with stateless sessions. The examples explicitly note that `enableFetchProfile` is unavailable for StatelessSession. Another example runs multiple count queries sequentially in one stateless transaction and checks consistent results.

Choosing StatelessSession does not define batch size or backpressure automatically. Bound rows per transaction, pool occupancy time, and database timeouts for bulk work.

## Executable evidence

- [Mutiny stateless extensions](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/hibernate-reactive/src/main/kotlin/io/bluetape4k/hibernate/reactive/mutiny/StatelessSessionSupport.kt)
- [Stage stateless extensions](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/hibernate-reactive/src/main/kotlin/io/bluetape4k/hibernate/reactive/stage/StatelessSessionSupport.kt)
- [`MutinyStatelessSessionExamples.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/hibernate-reactive/src/test/kotlin/io/bluetape4k/hibernate/reactive/examples/mutiny/MutinyStatelessSessionExamples.kt)
- [`StageStatelessSessionExamples.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/data/hibernate-reactive/src/test/kotlin/io/bluetape4k/hibernate/reactive/examples/stage/StageStatelessSessionExamples.kt)
