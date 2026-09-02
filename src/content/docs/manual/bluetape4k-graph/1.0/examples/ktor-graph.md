---
slug: "manual/bluetape4k-graph/1.0/examples/ktor-graph"
title: "Ktor graph integration"
manual:
  id: "ktor-graph-examples"
  repository: "bluetape4k-graph"
  group: "examples"
  kind: "example"
  sourceCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourcePath: "docs/manual/bluetape4k-graph/en/examples/ktor-graph.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourceDir: "examples/ktor-graph-examples"
  layer: "learn"
---


## Problem and backend

This example exposes graph reset, count, and route queries through a Ktor plugin and HTTP boundary. It uses **TinkerGraph** to isolate modeling from container and network variance. Read [core model](/manual/bluetape4k-graph/1.0/architecture/core-model/), [TinkerPop](/manual/bluetape4k-graph/1.0/backends/tinkerpop/), and [Ktor integration](/manual/bluetape4k-graph/1.0/frameworks/ktor/) first.

## Model

- Nodes: City
- Edges: ROAD
- Key properties: name, distance

## Prerequisites and release boundary

Use JDK 21, commit `a405300799b36d4d6edb7267ad07ff34d4ad3afe`, and the checked-in wrapper. Examples are not published; run this release fixture as a Gradle project from the release source checkout. In a consumer application, select only `bluetape4k-dependencies:<ecosystem-version>` and add the required graph module without an individual version.

## Run and observe

```bash
./gradlew :ktor-graph-examples:test --tests "io.bluetape4k.graph.examples.ktor.KtorGraphAppTest"
```

The route tests assert that reset reports `reset`, the fixture contains three cities, and the path is `Seoul -> Daejeon -> Busan`. A failure should be split between plugin initialization, route serialization, and graph fixture/traversal behavior.

## Reading order

1. [Schema](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/ktor-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/ktor/KtorGraphAppMain.kt)
2. [Service](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/ktor-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/ktor/KtorGraphAppMain.kt)
3. [Complete executable test](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/ktor-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/ktor/KtorGraphAppTest.kt)
4. [Build file](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/ktor-graph-examples/build.gradle.kts)

Continue [from supply-chain-graph](/manual/bluetape4k-graph/1.0/examples/supply-chain-graph/), then read [code-graph](/manual/bluetape4k-graph/1.0/examples/code-graph/). Also see [paired APIs](/manual/bluetape4k-graph/1.0/architecture/paired-apis/), [testing](/manual/bluetape4k-graph/1.0/guides/testing/), and [operations](/manual/bluetape4k-graph/1.0/guides/operations/).

## Exercises and production gaps

Add one result-changing edge and assertion; repeat through the suspend API; then run a persistent-backend concrete test serially. Add disconnected and malformed inputs as diagnostics. This fixture does not prove throughput, clustering, authorization, tenant isolation, migration, backup, remote-driver timeout, or index quality.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `1.0.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### ktor graph examples architecture

[![ktor graph examples architecture](https://raw.githubusercontent.com/bluetape4k/bluetape4k-graph/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-ktor-graph-examples-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-ktor-graph-examples-architecture-01.svg)

_Release README: [`examples/ktor-graph-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/ktor-graph-examples/README.md)_

### ktor graph examples data flow

[![ktor graph examples data flow](https://raw.githubusercontent.com/bluetape4k/bluetape4k-graph/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-ktor-graph-examples-data-flow-03.png)](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-ktor-graph-examples-data-flow-03.svg)

_Release README: [`examples/ktor-graph-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/ktor-graph-examples/README.md)_

### ktor graph examples ERD

[![ktor graph examples ERD](https://raw.githubusercontent.com/bluetape4k/bluetape4k-graph/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-ktor-graph-examples-erd-02.png)](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-ktor-graph-examples-erd-02.svg)

_Release README: [`examples/ktor-graph-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/ktor-graph-examples/README.md)_

<!-- release-readme-diagrams:end -->
