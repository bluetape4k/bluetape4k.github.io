---
slug: "manual/bluetape4k-graph/0.5/examples/recommendation"
title: "Recommendation graph"
manual:
  id: "recommendation-examples"
  repository: "bluetape4k-graph"
  group: "examples"
  kind: "example"
  sourceCommit: "c72de9d93ffcd3254f42c35f4cef5a5830062ed3"
  sourcePath: "docs/manual/en/examples/recommendation.md"
  minorVersion: "0.5"
  releaseRef: "0.5.1"
  releaseCommit: "3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907"
  sourceDir: "examples/recommendation-examples"
  layer: "learn"
---


## Problem and backend

This example turns user-item interactions into candidates and a deterministic ranking that tests can explain. It uses **TinkerGraph** to isolate modeling from container and network variance. Read [core model](/manual/bluetape4k-graph/0.5/architecture/core-model/) and [TinkerPop](/manual/bluetape4k-graph/0.5/backends/tinkerpop/) first; use the [selection guide](/manual/bluetape4k-graph/0.5/backends/selection-guide/) before production.

## Model

- Nodes: User/Product
- Edges: PURCHASED/FOLLOWS
- Key properties: userId, productId, category, quantity, purchasedAt

## Prerequisites and release boundary

Use JDK 21, commit `3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907`, and the checked-in wrapper. Examples are not published; run this release fixture as a Gradle project from the release source checkout. In a consumer application, select only `bluetape4k-dependencies:<ecosystem-version>` and add the required graph module without an individual version.

## Run and observe

```bash
./gradlew :recommendation-examples:test --tests "io.bluetape4k.graph.examples.recommendation.TinkerGraphRecommendationTest"
```

The tests assert three separate results: product recommendations include `p-tripod`, follow recommendations include `u-carol`, and the ranked product result includes `p-camera`. A failure usually reflects changed interaction weights, candidate filtering, or ranking order.

## Reading order

1. [Schema](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/recommendation-examples/src/main/kotlin/io/bluetape4k/graph/examples/recommendation/schema/RecommendationSchema.kt)
2. [Service](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/recommendation-examples/src/main/kotlin/io/bluetape4k/graph/examples/recommendation/service/RecommendationService.kt)
3. [Dataset loader contract](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/recommendation-examples/src/test/kotlin/io/bluetape4k/graph/examples/recommendation/RecommendationSampleDatasetLoaderTest.kt)
4. [Concrete TinkerGraph test](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/recommendation-examples/src/test/kotlin/io/bluetape4k/graph/examples/recommendation/RecommendationBackendTests.kt)
5. [Build file](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/recommendation-examples/build.gradle.kts)

Continue [from knowledge-graph](/manual/bluetape4k-graph/0.5/examples/knowledge-graph/), then read [linkedin-graph](/manual/bluetape4k-graph/0.5/examples/linkedin-graph/). Also see [paired APIs](/manual/bluetape4k-graph/0.5/architecture/paired-apis/), [testing](/manual/bluetape4k-graph/0.5/guides/testing/), and [operations](/manual/bluetape4k-graph/0.5/guides/operations/).

## Exercises and production gaps

Add one result-changing edge and assertion; repeat through the suspend API; then run a persistent-backend concrete test serially. Add disconnected and malformed inputs as diagnostics. This fixture does not prove throughput, clustering, authorization, tenant isolation, migration, backup, remote-driver timeout, or index quality.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `0.5.1` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### recommendation examples Architecture diagram

[![recommendation examples Architecture diagram](/manual-assets/bluetape4k-graph/0.5/readme-diagrams/examples-recommendation-examples-architecture-01.png)](../../assets/readme-diagrams/examples-recommendation-examples-architecture-01.svg)

_Release README: [`examples/recommendation-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/recommendation-examples/README.md)_

### Domain UML diagram

[![Domain UML diagram](/manual-assets/bluetape4k-graph/0.5/readme-diagrams/examples-recommendation-examples-class-02.png)](../../assets/readme-diagrams/examples-recommendation-examples-class-02.svg)

_Release README: [`examples/recommendation-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/recommendation-examples/README.md)_

### Recommendation Flow diagram

[![Recommendation Flow diagram](/manual-assets/bluetape4k-graph/0.5/readme-diagrams/examples-recommendation-examples-sequence-03.png)](../../assets/readme-diagrams/examples-recommendation-examples-sequence-03.svg)

_Release README: [`examples/recommendation-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/recommendation-examples/README.md)_

<!-- release-readme-diagrams:end -->
