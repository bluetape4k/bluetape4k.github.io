---
slug: "manual/bluetape4k-graph/0.5/modules/bluetape4k-graph-tinkerpop"
title: "bluetape4k-graph-tinkerpop"
manual:
  id: "bluetape4k-graph-tinkerpop"
  repository: "bluetape4k-graph"
  group: "backends"
  kind: "library"
  sourceCommit: "c72de9d93ffcd3254f42c35f4cef5a5830062ed3"
  sourcePath: "docs/manual/en/modules/bluetape4k-graph-tinkerpop.md"
  minorVersion: "0.5"
  releaseRef: "0.5.1"
  releaseCommit: "3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907"
  sourceDir: "graph/graph-tinkerpop"
  layer: "build"
---


## Before you run

This module maps the common contract to embedded TinkerGraph and Gremlin. Choose it for unit tests, tutorials, algorithm baselines, and a first domain model. Avoid treating an in-memory pass as evidence for remote latency, durability, clustering, or another vendor's transaction semantics. Source: [TinkerGraphOperations.kt](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/graph/graph-tinkerpop/src/main/kotlin/io/bluetape4k/graph/tinkerpop/TinkerGraphOperations.kt).


Execution mode: **standalone in-memory example**. `use` creates and closes `TinkerGraphOperations`; no server, fixture, Driver, or DataSource is required.

## Run

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<ecosystem-version>"))
    implementation("io.github.bluetape4k:bluetape4k-graph-tinkerpop")
}
```

```kotlin
import io.bluetape4k.graph.model.NeighborOptions
import io.bluetape4k.graph.tinkerpop.TinkerGraphOperations

TinkerGraphOperations().use { ops ->
    val a = ops.createVertex("Person", mapOf("name" to "Alice"))
    val b = ops.mergeVertex("Person", mapOf("email" to "b@example.com"), mapOf("name" to "Bob"))
    ops.createEdge(a.id, b.id, "KNOWS")
    check(ops.neighbors(a.id, NeighborOptions(edgeLabel = "KNOWS")).single().id == b.id)
}
```

## Expected result

Expected: no server is started, and the traversal returns one neighbor.

## Transactions and capability differences

The transaction DSL uses a snapshot/restore boundary guarded inside the embedded graph; it is not a remote ACID protocol. [TinkerGraphTransactionTest.kt](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/graph/graph-tinkerpop/src/test/kotlin/io/bluetape4k/graph/tinkerpop/TinkerGraphTransactionTest.kt) locks rollback behavior. Schema management is an in-memory compatibility layer, not vendor DDL. Traversals and algorithms can use local graph access unavailable to remote adapters.

`use` owns only the created TinkerGraph operations object.

## Operations checklist

- Watch heap growth and graph cardinality.
- Record traversal depth and elapsed time.
- Rerun merge and transaction checks on the production graph implementation.
- Discard the graph after each isolated test.

## Failure and recovery

Symptom: rollback assertions fail after an injected exception. Close the object, create a fresh graph, and rerun `TinkerGraphTransactionTest`.

A later backend can disagree on property types, IDs, schema, merge, or transaction behavior even when this module passes. Use it as a domain baseline, then rerun the candidate backend's tests. Watch graph size and traversal depth in long-lived test processes; the graph is heap-resident.

```bash
./gradlew :bluetape4k-graph-tinkerpop:test --tests '*TinkerGraphOperationsTest' --tests '*TinkerGraphTransactionTest'
```

Expected: CRUD/traversal passes and an injected transaction failure restores the snapshot.

## Complete release example

The pinned [TinkerGraphOperationsTest](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/graph/graph-tinkerpop/src/test/kotlin/io/bluetape4k/graph/tinkerpop/TinkerGraphOperationsTest.kt) is complete executable release evidence. Run:

```bash
./gradlew :bluetape4k-graph-tinkerpop:test --tests '*TinkerGraphOperationsTest'
```

Expected: the release test or build completes with the ownership and capability assertions above.

## Non-goals and related guides

See [TinkerPop guide](/manual/bluetape4k-graph/0.5/backends/tinkerpop/), [backend selection](/manual/bluetape4k-graph/0.5/backends/selection-guide/), and [benchmark-based selection](/manual/bluetape4k-graph/0.5/guides/benchmark-based-selection/). This module does not emulate database outages, remote Gremlin servers, persistence, or clustering.
