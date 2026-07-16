---
slug: "manual/bluetape4k-graph/0.5/examples/ktor-graph"
title: "Ktor graph integration"
manual:
  id: "ktor-graph-examples"
  repository: "bluetape4k-graph"
  group: "examples"
  kind: "example"
  sourceCommit: "2d9d09279f4b8a138dd46e3a3ffaf07699f7cfa0"
  sourcePath: "docs/manual/en/examples/ktor-graph.md"
  minorVersion: "0.5"
  releaseRef: "0.5.1"
  releaseCommit: "3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907"
  sourceDir: "examples/ktor-graph-examples"
  layer: "learn"
---


## Problem and backend

This example exposes graph reset, count, and route queries through a Ktor plugin and HTTP boundary. It uses **TinkerGraph** to isolate modeling from container and network variance. Read [core model](/manual/bluetape4k-graph/0.5/architecture/core-model/), [TinkerPop](/manual/bluetape4k-graph/0.5/backends/tinkerpop/), and [Ktor integration](/manual/bluetape4k-graph/0.5/frameworks/ktor/) first.

## Model

- Nodes: City
- Edges: ROAD
- Key properties: name, distance

## Prerequisites and release boundary

Use JDK 21, commit `3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907`, and the checked-in wrapper. Examples are not published; run this release fixture as a Gradle project from the release source checkout. In a consumer application, select only `bluetape4k-dependencies:<ecosystem-version>` and add the required graph module without an individual version.

## Run and observe

```bash
./gradlew :ktor-graph-examples:test --tests "io.bluetape4k.graph.examples.ktor.KtorGraphAppTest"
```

The route tests assert that reset reports `reset`, the fixture contains three cities, and the path is `Seoul -> Daejeon -> Busan`. A failure should be split between plugin initialization, route serialization, and graph fixture/traversal behavior.

## Reading order

1. [Schema](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/ktor-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/ktor/KtorGraphAppMain.kt)
2. [Service](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/ktor-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/ktor/KtorGraphAppMain.kt)
3. [Complete executable test](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/ktor-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/ktor/KtorGraphAppTest.kt)
4. [Build file](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/ktor-graph-examples/build.gradle.kts)

Continue [from supply-chain-graph](/manual/bluetape4k-graph/0.5/examples/supply-chain-graph/), then read [code-graph](/manual/bluetape4k-graph/0.5/examples/code-graph/). Also see [paired APIs](/manual/bluetape4k-graph/0.5/architecture/paired-apis/), [testing](/manual/bluetape4k-graph/0.5/guides/testing/), and [operations](/manual/bluetape4k-graph/0.5/guides/operations/).

## Exercises and production gaps

Add one result-changing edge and assertion; repeat through the suspend API; then run a persistent-backend concrete test serially. Add disconnected and malformed inputs as diagnostics. This fixture does not prove throughput, clustering, authorization, tenant isolation, migration, backup, remote-driver timeout, or index quality.
