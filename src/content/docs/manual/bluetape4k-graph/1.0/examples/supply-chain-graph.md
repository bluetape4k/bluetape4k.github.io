---
slug: "manual/bluetape4k-graph/1.0/examples/supply-chain-graph"
title: "Supply-chain impact graph"
manual:
  id: "supply-chain-graph-examples"
  repository: "bluetape4k-graph"
  group: "examples"
  kind: "example"
  sourceCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourcePath: "docs/manual/bluetape4k-graph/en/examples/supply-chain-graph.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourceDir: "examples/supply-chain-graph-examples"
  layer: "learn"
---


## Problem and backend

This example traces orders, routes, parts, and dependency cycles across a supply network. It uses **TinkerGraph** to isolate modeling from container and network variance. Read [core model](/manual/bluetape4k-graph/1.0/architecture/core-model/) and [TinkerPop](/manual/bluetape4k-graph/1.0/backends/tinkerpop/) first; use the [selection guide](/manual/bluetape4k-graph/1.0/backends/selection-guide/) before production.

## Model

- Nodes: Supplier/Part/Warehouse/Route/Carrier/CustomerOrder
- Edges: SUPPLIES/REQUIRED_BY/STOCKED_AT/USES_ROUTE/DELIVERS_TO/OPERATES_ROUTE/ALTERNATE_PART
- Key properties: supplierId, partId, routeId, carrierId, orderId, criticality, status

## Prerequisites and release boundary

Use JDK 21, commit `a405300799b36d4d6edb7267ad07ff34d4ad3afe`, and the checked-in wrapper. Examples are not published; run this release fixture as a Gradle project from the release source checkout. In a consumer application, select only `bluetape4k-dependencies:<ecosystem-version>` and add the required graph module without an individual version.

## Run and observe

```bash
./gradlew :supply-chain-graph-examples:test --tests "io.bluetape4k.graph.examples.supplychain.TinkerGraphSupplyChainImpactTest"
```

The tests assert visibility of `order-1001`, `route-air-express`, and `gps-module`, and detect the battery dependency cycle. A failure points to a missing supply relation, reversed dependency, or cycle-detection boundary.

## Reading order

1. [Schema](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/supply-chain-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/supplychain/schema/SupplyChainGraphSchema.kt)
2. [Service](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/supply-chain-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/supplychain/service/SupplyChainImpactService.kt)
3. [Shared executable contract](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/supply-chain-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/supplychain/AbstractSupplyChainImpactTest.kt)
4. [Concrete TinkerGraph test](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/supply-chain-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/supplychain/SupplyChainBackendTests.kt)
5. [Build file](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/supply-chain-graph-examples/build.gradle.kts)

Continue [from data-lineage](/manual/bluetape4k-graph/1.0/examples/data-lineage/), then read [ktor-graph](/manual/bluetape4k-graph/1.0/examples/ktor-graph/). Also see [paired APIs](/manual/bluetape4k-graph/1.0/architecture/paired-apis/), [testing](/manual/bluetape4k-graph/1.0/guides/testing/), and [operations](/manual/bluetape4k-graph/1.0/guides/operations/).

## Exercises and production gaps

Add one result-changing edge and assertion; repeat through the suspend API; then run a persistent-backend concrete test serially. Add disconnected and malformed inputs as diagnostics. This fixture does not prove throughput, clustering, authorization, tenant isolation, migration, backup, remote-driver timeout, or index quality.
