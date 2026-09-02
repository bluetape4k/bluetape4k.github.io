---
slug: "manual/bluetape4k-graph/1.0"
title: "Bluetape4k Graph 0.5 manual"
manual:
  id: "index"
  repository: "bluetape4k-graph"
  group: "overview"
  kind: "guide"
  sourceCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourcePath: "docs/manual/bluetape4k-graph/en/index.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourceDir: "docs/manual/bluetape4k-graph"
  layer: "build"
---


This manual describes the stable `1.0.0` contract at commit `a405300799b36d4d6edb7267ad07ff34d4ad3afe`. It covers the common model, paired synchronous/coroutine APIs, five supported backends, graph-io, and framework integration. Amazon Neptune is **not supported** in 1.0.0; backlog issues are not part of this contract.

## Core capabilities

- **Backend-independent graph model:** The [core model](/manual/bluetape4k-graph/1.0/architecture/core-model/) gives every backend the same vertex, edge, path, and element-ID vocabulary.
- **Synchronous and coroutine APIs:** [Paired APIs](/manual/bluetape4k-graph/1.0/architecture/paired-apis/) keep repository, traversal, batch, merge, and transaction operations aligned across blocking and suspending execution.
- **Five database backends:** The [backend selection guide](/manual/bluetape4k-graph/1.0/backends/selection-guide/) compares Neo4j, Memgraph, Apache AGE, TinkerPop/TinkerGraph, and FalkorDB by query language, transaction behavior, and operational fit.
- **Schema, traversal, and transactions:** [Schema and transactions](/manual/bluetape4k-graph/1.0/architecture/schema-and-transactions/) explains labels, indexes, constraints, merge semantics, paths, and ownership boundaries.
- **Graph import and export:** [graph-io formats](/manual/bluetape4k-graph/1.0/graph-io/formats/), [execution models](/manual/bluetape4k-graph/1.0/graph-io/execution-model/), and [OkIO security](/manual/bluetape4k-graph/1.0/graph-io/okio-security/) cover CSV, NDJSON, GraphML, compression, and authenticated encryption.
- **Application integration and examples:** [Spring Boot](/manual/bluetape4k-graph/1.0/frameworks/spring-boot/), [Ktor](/manual/bluetape4k-graph/1.0/frameworks/ktor/), and the [learning path](/manual/bluetape4k-graph/1.0/guides/learning-path/) connect the common API to runnable domain examples and production checks.

## Start with a decision

1. Follow [Getting started](/manual/bluetape4k-graph/1.0/getting-started/) to import the ecosystem BOM and run one operation.
2. Read the [backend selection guide](/manual/bluetape4k-graph/1.0/backends/selection-guide/) before adopting a driver.
3. Learn the [core model](/manual/bluetape4k-graph/1.0/architecture/core-model/), [paired APIs](/manual/bluetape4k-graph/1.0/architecture/paired-apis/), and [transaction boundary](/manual/bluetape4k-graph/1.0/architecture/schema-and-transactions/).
4. Choose a [learning path](/manual/bluetape4k-graph/1.0/guides/learning-path/), then use the testing and operations guides before production.

![Repository learning map](/manual-assets/bluetape4k-graph/1.0/overview/repository-learning-map.png)

The API center is [`GraphOperations`](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/graph/graph-core/src/main/kotlin/io/bluetape4k/graph/repository/GraphOperations.kt) and [`GraphSuspendOperations`](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/graph/graph-core/src/main/kotlin/io/bluetape4k/graph/repository/GraphSuspendOperations.kt). Both return the backend-independent models defined under [`graph-core/model`](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/graph/graph-core/src/main/kotlin/io/bluetape4k/graph/model/GraphVertex.kt).

## Manual map

- Architecture: repository layout, model, API composition, schema, merge/batch, traversal, and transactions.
- Backends: Neo4j, Memgraph, Apache AGE, TinkerPop/TinkerGraph, and FalkorDB.
- graph-io: format boundaries, execution models, OkIO compression and authenticated encryption.
- Frameworks: Ktor plugin and Spring Boot auto-configuration lifetimes.
- Guides: staged learning, tests, operations, cancellation, and benchmark interpretation.

Version selection belongs to `bluetape4k-dependencies`, not to individual graph libraries or the graph BOM. Every dependency example in this manual therefore imports the ecosystem BOM and leaves module coordinates unversioned.

## Guides and concepts

- Start: [Getting started](/manual/bluetape4k-graph/1.0/getting-started/), [learning path](/manual/bluetape4k-graph/1.0/guides/learning-path/)
- Architecture: [repository map](/manual/bluetape4k-graph/1.0/architecture/repository-map/), [core model](/manual/bluetape4k-graph/1.0/architecture/core-model/), [paired APIs](/manual/bluetape4k-graph/1.0/architecture/paired-apis/), [schema and transactions](/manual/bluetape4k-graph/1.0/architecture/schema-and-transactions/)
- Backends: [selection guide](/manual/bluetape4k-graph/1.0/backends/selection-guide/), [Neo4j and Memgraph](/manual/bluetape4k-graph/1.0/backends/neo4j-and-memgraph/), [Apache AGE](/manual/bluetape4k-graph/1.0/backends/apache-age/), [TinkerPop](/manual/bluetape4k-graph/1.0/backends/tinkerpop/), [FalkorDB](/manual/bluetape4k-graph/1.0/backends/falkordb/)
- graph-io: [formats](/manual/bluetape4k-graph/1.0/graph-io/formats/), [execution model](/manual/bluetape4k-graph/1.0/graph-io/execution-model/), [OkIO security](/manual/bluetape4k-graph/1.0/graph-io/okio-security/)
- Frameworks: [Spring Boot](/manual/bluetape4k-graph/1.0/frameworks/spring-boot/), [Ktor](/manual/bluetape4k-graph/1.0/frameworks/ktor/)
- Production guides: [testing](/manual/bluetape4k-graph/1.0/guides/testing/), [operations](/manual/bluetape4k-graph/1.0/guides/operations/), [failure and cancellation](/manual/bluetape4k-graph/1.0/guides/failure-and-cancellation/), [benchmark-based selection](/manual/bluetape4k-graph/1.0/guides/benchmark-based-selection/)

## Published libraries

- Platform and core: [graph BOM](/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-bom/), [graph core](/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-core/)
- Backends: [Neo4j](/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-neo4j/), [Memgraph](/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-memgraph/), [Apache AGE](/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-age/), [TinkerPop](/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-tinkerpop/), [FalkorDB](/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-falkordb/)
- graph-io: [core](/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-io-core/), [CSV](/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-io-csv/), [Jackson 2](/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-io-jackson2/), [Jackson 3](/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-io-jackson3/), [GraphML](/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-io-graphml/), [OkIO](/manual/bluetape4k-graph/1.0/modules/graph-okio/)
- Frameworks: [Spring Boot](/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-spring-boot/), [Ktor](/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-ktor/)

## Examples

- Modeling: [code graph](/manual/bluetape4k-graph/1.0/examples/code-graph/), [knowledge graph](/manual/bluetape4k-graph/1.0/examples/knowledge-graph/), [LinkedIn graph](/manual/bluetape4k-graph/1.0/examples/linkedin-graph/), [recommendation](/manual/bluetape4k-graph/1.0/examples/recommendation/)
- Risk and operations: [fraud detection](/manual/bluetape4k-graph/1.0/examples/fraud-detection/), [IAM access graph](/manual/bluetape4k-graph/1.0/examples/iam-access-graph/), [observability graph](/manual/bluetape4k-graph/1.0/examples/observability-graph/), [security attack path](/manual/bluetape4k-graph/1.0/examples/security-attack-path/)
- Systems: [supply chain](/manual/bluetape4k-graph/1.0/examples/supply-chain-graph/), [data lineage](/manual/bluetape4k-graph/1.0/examples/data-lineage/), [network topology](/manual/bluetape4k-graph/1.0/examples/network-topology/), [Ktor graph](/manual/bluetape4k-graph/1.0/examples/ktor-graph/)

## Benchmarks

- [Benchmark overview](/manual/bluetape4k-graph/1.0/benchmarks/overview/)
- [Graph operations](/manual/bluetape4k-graph/1.0/benchmarks/graph-operations/)
- [graph-io](/manual/bluetape4k-graph/1.0/benchmarks/graph-io/)
- [AGE and Neo4j](/manual/bluetape4k-graph/1.0/benchmarks/age-and-neo4j/)
