---
slug: "manual/bluetape4k-graph/0.5/examples/code-graph"
title: "Code graph"
manual:
  id: "code-graph-examples"
  repository: "bluetape4k-graph"
  group: "examples"
  kind: "example"
  sourceCommit: "8d30d7a22d69314803453cbb4a8fd4ea8150df0f"
  sourcePath: "docs/manual/en/examples/code-graph.md"
  minorVersion: "0.5"
  releaseRef: "0.5.1"
  releaseCommit: "3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907"
  sourceDir: "examples/code-graph-examples"
  layer: "learn"
---


## Problem and backend

This example models modules, declarations, and calls so dependency and call paths can be inspected directly. It uses **TinkerGraph** to isolate modeling from container and network variance. Read [core model](/manual/bluetape4k-graph/0.5/architecture/core-model/) and [TinkerPop](/manual/bluetape4k-graph/0.5/backends/tinkerpop/) first; use the [selection guide](/manual/bluetape4k-graph/0.5/backends/selection-guide/) before production.

## Model

- Nodes: Module/Class/Function
- Edges: DEPENDS_ON/IMPORTS/EXTENDS/IMPLEMENTS/CALLS/BELONGS_TO
- Key properties: name, qualifiedName, signature, dependencyType, callCount

## Prerequisites and release boundary

Use JDK 21, commit `3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907`, and the checked-in wrapper. Examples are not published; run this release fixture as a Gradle project from the release source checkout. In a consumer application, select only `bluetape4k-dependencies:<ecosystem-version>` and add the required graph module without an individual version.

## Run and observe

```bash
./gradlew :code-graph-examples:test --tests "io.bluetape4k.graph.examples.code.TinkerGraphCodeGraphTest"
```

The test asserts that the call path contains more than one vertex and that a disconnected pair has no path. A failure usually means the fixture edges, their direction, or the traversal depth no longer matches the code-graph model.

## Reading order

1. [Schema](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/code-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/code/schema/CodeGraphSchema.kt)
2. [Service](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/code-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/code/service/CodeGraphService.kt)
3. [Shared executable contract](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/code-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/code/AbstractCodeGraphTest.kt)
4. [Concrete TinkerGraph test](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/code-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/code/TinkerGraphCodeGraphTest.kt)
5. [Build file](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/code-graph-examples/build.gradle.kts)

Continue [from ktor-graph](/manual/bluetape4k-graph/0.5/examples/ktor-graph/), then read [knowledge-graph](/manual/bluetape4k-graph/0.5/examples/knowledge-graph/). Also see [paired APIs](/manual/bluetape4k-graph/0.5/architecture/paired-apis/), [testing](/manual/bluetape4k-graph/0.5/guides/testing/), and [operations](/manual/bluetape4k-graph/0.5/guides/operations/).

## Exercises and production gaps

Add one result-changing edge and assertion; repeat through the suspend API; then run a persistent-backend concrete test serially. Add disconnected and malformed inputs as diagnostics. This fixture does not prove throughput, clustering, authorization, tenant isolation, migration, backup, remote-driver timeout, or index quality.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `0.5.1` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### code graph examples architecture

[![code graph examples architecture](https://raw.githubusercontent.com/bluetape4k/bluetape4k-graph/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/docs/images/readme-diagrams/examples-code-graph-examples-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/docs/images/readme-diagrams/examples-code-graph-examples-architecture-01.svg)

_Release README: [`examples/code-graph-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/code-graph-examples/README.md)_

### code graph examples data flow

[![code graph examples data flow](https://raw.githubusercontent.com/bluetape4k/bluetape4k-graph/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/docs/images/readme-diagrams/examples-code-graph-examples-data-flow-03.png)](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/docs/images/readme-diagrams/examples-code-graph-examples-data-flow-03.svg)

_Release README: [`examples/code-graph-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/code-graph-examples/README.md)_

### code graph examples ERD

[![code graph examples ERD](https://raw.githubusercontent.com/bluetape4k/bluetape4k-graph/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/docs/images/readme-diagrams/examples-code-graph-examples-erd-02.png)](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/docs/images/readme-diagrams/examples-code-graph-examples-erd-02.svg)

_Release README: [`examples/code-graph-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/code-graph-examples/README.md)_

<!-- release-readme-diagrams:end -->
