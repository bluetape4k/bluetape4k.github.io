---
slug: "manual/bluetape4k-graph/1.0/examples/knowledge-graph"
title: "Knowledge graph"
manual:
  id: "knowledge-graph-examples"
  repository: "bluetape4k-graph"
  group: "examples"
  kind: "example"
  sourceCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourcePath: "docs/manual/bluetape4k-graph/en/examples/knowledge-graph.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourceDir: "examples/knowledge-graph-examples"
  layer: "learn"
---


## Problem and backend

This example links documents, concepts, and entities so a related result has an explanation path. It uses **TinkerGraph** to isolate modeling from container and network variance. Read [core model](/manual/bluetape4k-graph/1.0/architecture/core-model/) and [TinkerPop](/manual/bluetape4k-graph/1.0/backends/tinkerpop/) first; use the [selection guide](/manual/bluetape4k-graph/1.0/backends/selection-guide/) before production.

## Model

- Nodes: Document/Entity/Concept
- Edges: MENTIONS/RELATED_TO/IS_A
- Key properties: documentId, entityId, conceptId, confidence, relationType

## Prerequisites and release boundary

Use JDK 21, commit `a405300799b36d4d6edb7267ad07ff34d4ad3afe`, and the checked-in wrapper. Examples are not published; run this release fixture as a Gradle project from the release source checkout. In a consumer application, select only `bluetape4k-dependencies:<ecosystem-version>` and add the required graph module without an individual version.

## Run and observe

```bash
./gradlew :knowledge-graph-examples:test --tests "io.bluetape4k.graph.examples.knowledge.TinkerGraphKnowledgeGraphTest"
```

The tests assert two distinct relations: a document mentions the expected entities, and an entity is classified under the expected concept. A failure usually comes from mention direction, concept classification, or the traversal bound.

## Reading order

1. [Schema](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/knowledge-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/knowledge/schema/KnowledgeGraphSchema.kt)
2. [Service](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/knowledge-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/knowledge/service/KnowledgeGraphService.kt)
3. [Shared executable contract](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/knowledge-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/knowledge/AbstractKnowledgeGraphTest.kt)
4. [Concrete TinkerGraph test](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/knowledge-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/knowledge/KnowledgeGraphBackendTests.kt)
5. [Build file](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/knowledge-graph-examples/build.gradle.kts)

Continue [from code-graph](/manual/bluetape4k-graph/1.0/examples/code-graph/), then read [recommendation](/manual/bluetape4k-graph/1.0/examples/recommendation/). Also see [paired APIs](/manual/bluetape4k-graph/1.0/architecture/paired-apis/), [testing](/manual/bluetape4k-graph/1.0/guides/testing/), and [operations](/manual/bluetape4k-graph/1.0/guides/operations/).

## Exercises and production gaps

Add one result-changing edge and assertion; repeat through the suspend API; then run a persistent-backend concrete test serially. Add disconnected and malformed inputs as diagnostics. This fixture does not prove throughput, clustering, authorization, tenant isolation, migration, backup, remote-driver timeout, or index quality.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `1.0.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### knowledge graph examples Architecture diagram

[![knowledge graph examples Architecture diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-graph/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-knowledge-graph-examples-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-knowledge-graph-examples-architecture-01.svg)

_Release README: [`examples/knowledge-graph-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/knowledge-graph-examples/README.md)_

### Domain UML diagram

[![Domain UML diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-graph/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-knowledge-graph-examples-class-02.png)](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-knowledge-graph-examples-class-02.svg)

_Release README: [`examples/knowledge-graph-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/knowledge-graph-examples/README.md)_

### Path Inference Flow diagram

[![Path Inference Flow diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-graph/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-knowledge-graph-examples-sequence-03.png)](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-knowledge-graph-examples-sequence-03.svg)

_Release README: [`examples/knowledge-graph-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/knowledge-graph-examples/README.md)_

<!-- release-readme-diagrams:end -->
