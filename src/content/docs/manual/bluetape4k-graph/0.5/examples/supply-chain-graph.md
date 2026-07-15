---
slug: "manual/bluetape4k-graph/0.5/examples/supply-chain-graph"
title: "Supply-chain impact graph"
manual:
  id: "supply-chain-graph-examples"
  repository: "bluetape4k-graph"
  group: "examples"
  kind: "example"
  sourceCommit: "fa6b818344736f8554a97f654ce88fa332aec44d"
  sourcePath: "docs/manual/en/examples/supply-chain-graph.md"
  minorVersion: "0.5"
  releaseRef: "0.5.1"
  releaseCommit: "3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907"
  sourceDir: "examples/supply-chain-graph-examples"
  layer: "learn"
---


## Problem and backend

This example traces orders, routes, parts, and dependency cycles across a supply network. It uses **TinkerGraph** to isolate modeling from container and network variance. Read [core model](/manual/bluetape4k-graph/0.5/architecture/core-model/) and [TinkerPop](/manual/bluetape4k-graph/0.5/backends/tinkerpop/) first; use the [selection guide](/manual/bluetape4k-graph/0.5/backends/selection-guide/) before production.

## Model

- Nodes: Supplier/Part/Warehouse/Route/Carrier/CustomerOrder
- Edges: SUPPLIES/REQUIRED_BY/STOCKED_AT/USES_ROUTE/DELIVERS_TO/OPERATES_ROUTE/ALTERNATE_PART
- Key properties: supplierId, partId, routeId, carrierId, orderId, criticality, status

## Prerequisites and release boundary

Use JDK 21, commit `3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907`, and the checked-in wrapper. Examples are not published; run this release fixture as a Gradle project from the release source checkout. In a consumer application, select only `bluetape4k-dependencies:<ecosystem-version>` and add the required graph module without an individual version.

## Run and observe

```bash
./gradlew :supply-chain-graph-examples:test --tests "io.bluetape4k.graph.examples.supplychain.TinkerGraphSupplyChainImpactTest"
```

The tests assert visibility of `order-1001`, `route-air-express`, and `gps-module`, and detect the battery dependency cycle. A failure points to a missing supply relation, reversed dependency, or cycle-detection boundary.

## Reading order

1. [Schema](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/supply-chain-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/supplychain/schema/SupplyChainGraphSchema.kt)
2. [Service](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/supply-chain-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/supplychain/service/SupplyChainImpactService.kt)
3. [Shared executable contract](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/supply-chain-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/supplychain/AbstractSupplyChainImpactTest.kt)
4. [Concrete TinkerGraph test](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/supply-chain-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/supplychain/SupplyChainBackendTests.kt)
5. [Build file](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/supply-chain-graph-examples/build.gradle.kts)

Continue [from data-lineage](/manual/bluetape4k-graph/0.5/examples/data-lineage/), then read [ktor-graph](/manual/bluetape4k-graph/0.5/examples/ktor-graph/). Also see [paired APIs](/manual/bluetape4k-graph/0.5/architecture/paired-apis/), [testing](/manual/bluetape4k-graph/0.5/guides/testing/), and [operations](/manual/bluetape4k-graph/0.5/guides/operations/).

## Exercises and production gaps

Add one result-changing edge and assertion; repeat through the suspend API; then run a persistent-backend concrete test serially. Add disconnected and malformed inputs as diagnostics. This fixture does not prove throughput, clustering, authorization, tenant isolation, migration, backup, remote-driver timeout, or index quality.
