---
slug: "manual/bluetape4k-graph/0.5/examples/observability-graph"
title: "Observability incident graph"
manual:
  id: "observability-graph-examples"
  repository: "bluetape4k-graph"
  group: "examples"
  kind: "example"
  sourceCommit: "fa6b818344736f8554a97f654ce88fa332aec44d"
  sourcePath: "docs/manual/en/examples/observability-graph.md"
  minorVersion: "0.5"
  releaseRef: "0.5.1"
  releaseCommit: "3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907"
  sourceDir: "examples/observability-graph-examples"
  layer: "learn"
---


## Problem and backend

This example correlates dependencies, owners, and alerts instead of treating telemetry as unrelated records. It uses **TinkerGraph** to isolate modeling from container and network variance. Read [core model](/manual/bluetape4k-graph/0.5/architecture/core-model/) and [TinkerPop](/manual/bluetape4k-graph/0.5/backends/tinkerpop/) first; use the [selection guide](/manual/bluetape4k-graph/0.5/backends/selection-guide/) before production.

## Model

- Nodes: Service/Api/Team/Alert/Incident
- Edges: DEPENDS_ON/OWNED_BY/ALERTS_ON/ROOT_CAUSE
- Key properties: serviceId, apiId, teamId, alertId, incidentId, severity, status

## Prerequisites and release boundary

Use JDK 21, commit `3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907`, and the checked-in wrapper. Examples are not published; run this release fixture as a Gradle project from the release source checkout. In a consumer application, select only `bluetape4k-dependencies:<ecosystem-version>` and add the required graph module without an individual version.

## Run and observe

```bash
./gradlew :observability-graph-examples:test --tests "io.bluetape4k.graph.examples.observability.TinkerGraphObservabilityIncidentTest"
```

The tests assert downstream dependencies, upstream impacted services and public APIs, the shared alert boundary, and owning teams. A failure should be read as a broken telemetry relation or correlation path, not as proof that the whole observability model failed.

## Reading order

1. [Schema](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/observability-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/observability/schema/ObservabilityGraphSchema.kt)
2. [Service](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/observability-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/observability/service/ObservabilityIncidentService.kt)
3. [Shared executable contract](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/observability-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/observability/AbstractObservabilityIncidentTest.kt)
4. [Concrete TinkerGraph test](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/observability-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/observability/ObservabilityBackendTests.kt)
5. [Build file](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/observability-graph-examples/build.gradle.kts)

Continue [from network-topology](/manual/bluetape4k-graph/0.5/examples/network-topology/), then read [data-lineage](/manual/bluetape4k-graph/0.5/examples/data-lineage/). Also see [paired APIs](/manual/bluetape4k-graph/0.5/architecture/paired-apis/), [testing](/manual/bluetape4k-graph/0.5/guides/testing/), and [operations](/manual/bluetape4k-graph/0.5/guides/operations/).

## Exercises and production gaps

Add one result-changing edge and assertion; repeat through the suspend API; then run a persistent-backend concrete test serially. Add disconnected and malformed inputs as diagnostics. This fixture does not prove throughput, clustering, authorization, tenant isolation, migration, backup, remote-driver timeout, or index quality.
