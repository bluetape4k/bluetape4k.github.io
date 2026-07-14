---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-cassandra/reactive-coroutine-operations"
title: "Reactive operations and coroutines"
description: "Understand execution timing, empty results, and cancellation when adapting Spring Data Cassandra publishers to Flow and suspend functions."
manual:
  id: "modules/bluetape4k-spring-boot-cassandra/reactive-coroutine-operations"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "a9051bd77bf5870d3787f15c1d32088412f2bdbb"
  sourcePath: "docs/manual/en/modules/bluetape4k-spring-boot-cassandra/reactive-coroutine-operations.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "docs/manual"
  layer: "build"
---


## Choosing Flow or suspend

Use `Flow` when processing several rows and a suspend function for one result. `selectAsFlow` converts the `Flux` returned by Spring Data with `asFlow()` and does not materialize the result first.

```kotlin
fun activeUsers(operations: ReactiveCassandraOperations): Flow<User> =
    operations.selectAsFlow(
        Query.query(Criteria.where("active").eq(true))
    )
```

The returned Flow is cold. Calling the function alone does not run CQL. A terminal operation such as `collect`, `toList`, or `first` starts the subscription. Collecting the same Flow twice may execute the query twice.

## Two one-row contracts

`selectOneSuspending` uses `awaitSingle()` and requires one result. Use `selectOneOrNullSuspending` or `selectOneOrNullByIdSuspending` when absence is valid.

```kotlin
suspend fun requiredUser(operations: ReactiveCassandraOperations, id: UUID): User =
    operations.selectOneSuspending(Query.query(Criteria.where("id").eq(id)))

suspend fun optionalUser(operations: ReactiveCassandraOperations, id: UUID): User? =
    operations.selectOneOrNullByIdSuspending<User>(id)
```

Choose the operation that matches the service contract instead of converting absence through a catch block. A nullable result and a backend failure are different states.

## CRUD and options

Insert, update, and delete adapters delegate to Spring Data operations and await their `Mono`. Option overloads return `EntityWriteResult` or `WriteResult`, allowing callers to inspect LWT application and execution details.

```kotlin
val result = operations.insertSuspending(
    user,
    insertOptions { withIfNotExists() },
)
check(result.wasApplied())
```

`updateSuspending(query, update)`, `deleteSuspending(query)`, `countSuspending`, `existsSuspending`, and `sliceSuspending` follow the same rule. They add no retry or domain-exception translation.

## Calling ReactiveSession directly

`ReactiveSession.executeSuspending` accepts a CQL string, positional arguments, a named-argument map, or a `Statement`. String overloads construct a `SimpleStatement` and delegate to the statement overload.

```kotlin
val prepared = session.prepareSuspending(
    "SELECT * FROM users WHERE id = ?"
)
val resultSet = session.executeSuspending(prepared.bind(userId))
```

Reuse prepared query shapes. The adapters preserve fetch size, consistency, and execution profile configured on the statement.

## Cancellation and errors

Coroutine cancellation cancels the Reactor subscription. It does not prove that Cassandra stopped a request already submitted to the server. Handle timeout, idempotence, and retry through explicit driver policy.

Row-mapping and driver errors propagate during Flow collection or the suspend call. Avoid broad `runCatching` around suspend operations because it can turn cancellation into an ordinary failure.

## Selection rules

- Keep large results as Flow and avoid an unnecessary `toList()`.
- Use an `OrNull` API when one-row absence is expected.
- Return `ReactiveResultSet` directly only when low-level metadata is required.
- Choose the highest-level typed mapping that satisfies the service before dropping to statements.

## Sources

- [`ReactiveCassandraOperationsCoroutines.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/ReactiveCassandraOperationsCoroutines.kt)
- [`ReactiveSelectOperationSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/ReactiveSelectOperationSupport.kt)
- [`ReactiveSessionCoroutines.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/cassandra/src/main/kotlin/io/bluetape4k/spring/cassandra/ReactiveSessionCoroutines.kt)
- [`ReactiveCassandraOperationsCoroutinesUnitTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/cassandra/src/test/kotlin/io/bluetape4k/spring/cassandra/ReactiveCassandraOperationsCoroutinesUnitTest.kt)
