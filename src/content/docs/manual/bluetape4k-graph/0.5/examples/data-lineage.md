---
slug: "manual/bluetape4k-graph/0.5/examples/data-lineage"
title: "Data lineage graph"
manual:
  id: "data-lineage-examples"
  repository: "bluetape4k-graph"
  group: "examples"
  kind: "example"
  sourceCommit: "c72de9d93ffcd3254f42c35f4cef5a5830062ed3"
  sourcePath: "docs/manual/en/examples/data-lineage.md"
  minorVersion: "0.5"
  releaseRef: "0.5.1"
  releaseCommit: "3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907"
  sourceDir: "examples/data-lineage-examples"
  layer: "learn"
---


## Problem and backend

This example follows upstream sources and downstream impact across datasets, jobs, and reports. It uses **TinkerGraph** to isolate modeling from container and network variance. Read [core model](/manual/bluetape4k-graph/0.5/architecture/core-model/) and [TinkerPop](/manual/bluetape4k-graph/0.5/backends/tinkerpop/) first; use the [selection guide](/manual/bluetape4k-graph/0.5/backends/selection-guide/) before production.

## Model

- Nodes: Dataset/Table/Column/PipelineJob/Dashboard/Owner/QualityCheck
- Edges: CONTAINS_TABLE/CONTAINS_COLUMN/INPUT_TO_JOB/OUTPUTS_TABLE/FEEDS_DASHBOARD/OWNS_JOB/VALIDATES_COLUMN
- Key properties: datasetId, tableId, columnId, jobId, dashboardId, ownerId, checkId

## Prerequisites and release boundary

Use JDK 21, commit `3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907`, and the checked-in wrapper. Examples are not published; run this release fixture as a Gradle project from the release source checkout. In a consumer application, select only `bluetape4k-dependencies:<ecosystem-version>` and add the required graph module without an individual version.

## Run and observe

```bash
./gradlew :data-lineage-examples:test --tests "io.bluetape4k.graph.examples.datalineage.TinkerGraphDataLineageImpactTest"
```

The test asserts that downstream impact reaches `exec-revenue` and `ops-quality` and that upstream traversal finds the expected source tables. A failure points first to lineage direction, missing transformation edges, or a changed traversal bound.

## Reading order

1. [Schema](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/data-lineage-examples/src/main/kotlin/io/bluetape4k/graph/examples/datalineage/schema/DataLineageGraphSchema.kt)
2. [Service](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/data-lineage-examples/src/main/kotlin/io/bluetape4k/graph/examples/datalineage/service/DataLineageImpactService.kt)
3. [Shared executable contract](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/data-lineage-examples/src/test/kotlin/io/bluetape4k/graph/examples/datalineage/AbstractDataLineageImpactTest.kt)
4. [Concrete TinkerGraph test](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/data-lineage-examples/src/test/kotlin/io/bluetape4k/graph/examples/datalineage/DataLineageBackendTests.kt)
5. [Build file](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/data-lineage-examples/build.gradle.kts)

Continue [from observability-graph](/manual/bluetape4k-graph/0.5/examples/observability-graph/), then read [supply-chain-graph](/manual/bluetape4k-graph/0.5/examples/supply-chain-graph/). Also see [paired APIs](/manual/bluetape4k-graph/0.5/architecture/paired-apis/), [testing](/manual/bluetape4k-graph/0.5/guides/testing/), and [operations](/manual/bluetape4k-graph/0.5/guides/operations/).

## Exercises and production gaps

Add one result-changing edge and assertion; repeat through the suspend API; then run a persistent-backend concrete test serially. Add disconnected and malformed inputs as diagnostics. This fixture does not prove throughput, clustering, authorization, tenant isolation, migration, backup, remote-driver timeout, or index quality.
