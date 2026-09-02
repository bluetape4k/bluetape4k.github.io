---
slug: "manual/bluetape4k-graph/1.0/examples/recommendation"
title: "Recommendation graph"
manual:
  id: "recommendation-examples"
  repository: "bluetape4k-graph"
  group: "examples"
  kind: "example"
  sourceCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourcePath: "docs/manual/bluetape4k-graph/en/examples/recommendation.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourceDir: "examples/recommendation-examples"
  layer: "learn"
---


## Problem and backend

This example turns user-item interactions into candidates and a deterministic ranking that tests can explain. It uses **TinkerGraph** to isolate modeling from container and network variance. Read [core model](/manual/bluetape4k-graph/1.0/architecture/core-model/) and [TinkerPop](/manual/bluetape4k-graph/1.0/backends/tinkerpop/) first; use the [selection guide](/manual/bluetape4k-graph/1.0/backends/selection-guide/) before production.

## Model

- Nodes: User/Product
- Edges: PURCHASED/FOLLOWS
- Key properties: userId, productId, category, quantity, purchasedAt

## Prerequisites and release boundary

Use JDK 21, commit `a405300799b36d4d6edb7267ad07ff34d4ad3afe`, and the checked-in wrapper. Examples are not published; run this release fixture as a Gradle project from the release source checkout. In a consumer application, select only `bluetape4k-dependencies:<ecosystem-version>` and add the required graph module without an individual version.

## Run and observe

```bash
./gradlew :recommendation-examples:test --tests "io.bluetape4k.graph.examples.recommendation.TinkerGraphRecommendationTest"
```

The tests assert three separate results: product recommendations include `p-tripod`, follow recommendations include `u-carol`, and the ranked product result includes `p-camera`. A failure usually reflects changed interaction weights, candidate filtering, or ranking order.

## Reading order

1. [Schema](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/recommendation-examples/src/main/kotlin/io/bluetape4k/graph/examples/recommendation/schema/RecommendationSchema.kt)
2. [Service](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/recommendation-examples/src/main/kotlin/io/bluetape4k/graph/examples/recommendation/service/RecommendationService.kt)
3. [Dataset loader contract](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/recommendation-examples/src/test/kotlin/io/bluetape4k/graph/examples/recommendation/RecommendationSampleDatasetLoaderTest.kt)
4. [Concrete TinkerGraph test](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/recommendation-examples/src/test/kotlin/io/bluetape4k/graph/examples/recommendation/RecommendationBackendTests.kt)
5. [Build file](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/recommendation-examples/build.gradle.kts)

Continue [from knowledge-graph](/manual/bluetape4k-graph/1.0/examples/knowledge-graph/), then read [linkedin-graph](/manual/bluetape4k-graph/1.0/examples/linkedin-graph/). Also see [paired APIs](/manual/bluetape4k-graph/1.0/architecture/paired-apis/), [testing](/manual/bluetape4k-graph/1.0/guides/testing/), and [operations](/manual/bluetape4k-graph/1.0/guides/operations/).

## Exercises and production gaps

Add one result-changing edge and assertion; repeat through the suspend API; then run a persistent-backend concrete test serially. Add disconnected and malformed inputs as diagnostics. This fixture does not prove throughput, clustering, authorization, tenant isolation, migration, backup, remote-driver timeout, or index quality.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `1.0.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### recommendation examples Architecture diagram

[![recommendation examples Architecture diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-graph/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-recommendation-examples-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-recommendation-examples-architecture-01.svg)

_Release README: [`examples/recommendation-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/recommendation-examples/README.md)_

### Domain UML diagram

[![Domain UML diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-graph/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-recommendation-examples-class-02.png)](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-recommendation-examples-class-02.svg)

_Release README: [`examples/recommendation-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/recommendation-examples/README.md)_

### Recommendation Flow diagram

[![Recommendation Flow diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-graph/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-recommendation-examples-sequence-03.png)](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/docs/images/readme-diagrams/examples-recommendation-examples-sequence-03.svg)

_Release README: [`examples/recommendation-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/examples/recommendation-examples/README.md)_

<!-- release-readme-diagrams:end -->
