---
slug: "manual/bluetape4k-graph/0.5/architecture/repository-map"
title: "Repository map"
manual:
  id: "architecture/repository-map"
  repository: "bluetape4k-graph"
  group: "overview"
  kind: "guide"
  sourceCommit: "c72de9d93ffcd3254f42c35f4cef5a5830062ed3"
  sourcePath: "docs/manual/en/architecture/repository-map.md"
  minorVersion: "0.5"
  releaseRef: "0.5.1"
  releaseCommit: "3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907"
  sourceDir: "docs/manual"
  layer: "build"
---


The repository is organized by responsibility, not by one monolithic driver.

| Area | What to learn | Evidence |
|---|---|---|
| `graph/graph-core` | models, repository contracts, schema and algorithms | [`GraphOperations.kt`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/graph/graph-core/src/main/kotlin/io/bluetape4k/graph/repository/GraphOperations.kt) |
| `graph/graph-*` | backend semantics and adapters | [`Neo4jGraphOperations.kt`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/graph/graph-neo4j/src/main/kotlin/io/bluetape4k/graph/neo4j/Neo4jGraphOperations.kt) |
| `graph-io/*` | records, formats and bulk transfer | [`GraphBulkImporter.kt`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/graph-io/core/src/main/kotlin/io/bluetape4k/graph/io/contract/GraphBulkImporter.kt) |
| `ktor`, `spring-boot` | application lifetime integration | [`GraphPlugin.kt`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/ktor/graph-ktor/src/main/kotlin/io/bluetape4k/graph/ktor/GraphPlugin.kt) |
| `examples` | domain-shaped use and cross-backend tests | [`AbstractCodeGraphTest.kt`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/code-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/code/AbstractCodeGraphTest.kt) |
| `benchmark` | workload evidence, not API promises | [`benchmark/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/benchmark/README.md) |

![Repository learning map](/manual-assets/bluetape4k-graph/0.5/overview/repository-learning-map.png)

Read core contracts before a backend implementation. Then trace one operation from interface to backend test. Example projects are deliberately unpublished; copy their design ideas, not their dependency coordinates or deployment assumptions.

When diagnosing a failure, locate its layer: model validation, repository capability, backend query/transaction, format codec, or application lifecycle. This prevents a driver-specific symptom from being documented as a portable contract.

## Trace one operation through the repository

```bash
rg -n 'fun shortestPath' graph/graph-core graph/graph-neo4j graph/graph-memgraph graph/graph-age graph/graph-tinkerpop graph/graph-falkordb
./gradlew :bluetape4k-graph-core:test --tests '*ShortestPathFallbackTest'
./gradlew :code-graph-examples:test --tests '*TinkerGraphCodeGraphTest'
```

Expected: the contract appears in core, backend implementations or fallbacks supply behavior, and the domain example asserts a concrete path. If core passes but the example fails, inspect schema/data setup. If only one backend fails, inspect its query translation and capability test. If all implementations pass but an application route fails, move outward to framework lifetime and resource ownership.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `0.5.1` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### graph Architecture diagram

[![graph Architecture diagram](/manual-assets/bluetape4k-graph/0.5/readme-diagrams/bluetape4k-graph-architecture-01.png)](../../assets/readme-diagrams/bluetape4k-graph-architecture-01.svg)

_Release README: [`README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/README.md)_

### graph Class Structure 2 diagram

[![graph Class Structure 2 diagram](/manual-assets/bluetape4k-graph/0.5/readme-diagrams/bluetape4k-graph-class-02.png)](../../assets/readme-diagrams/bluetape4k-graph-class-02.svg)

_Release README: [`README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/README.md)_

### Backend capability matrix

[![Backend capability matrix](/manual-assets/bluetape4k-graph/0.5/readme-diagrams/root-readme-backend-capability-matrix-01.png)](../../assets/readme-diagrams/root-readme-backend-capability-matrix-01.svg)

_Release README: [`README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/README.md)_

### Bluetape4k Graph overview diagram

[![Bluetape4k Graph overview diagram](/manual-assets/bluetape4k-graph/0.5/readme-diagrams/root-readme-overview-01.png)](../../assets/readme-diagrams/root-readme-overview-01.svg)

_Release README: [`README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/README.md)_

<!-- release-readme-diagrams:end -->
