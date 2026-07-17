---
slug: "manual/bluetape4k-graph/0.5/examples/linkedin-graph"
title: "Professional social graph"
manual:
  id: "linkedin-graph-examples"
  repository: "bluetape4k-graph"
  group: "examples"
  kind: "example"
  sourceCommit: "c72de9d93ffcd3254f42c35f4cef5a5830062ed3"
  sourcePath: "docs/manual/en/examples/linkedin-graph.md"
  minorVersion: "0.5"
  releaseRef: "0.5.1"
  releaseCommit: "3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907"
  sourceDir: "examples/linkedin-graph-examples"
  layer: "learn"
---


## Problem and backend

This example connects people, employers, skills, and endorsements to exercise several social-graph lookup shapes. It uses **TinkerGraph** to isolate modeling from container and network variance. Read [core model](/manual/bluetape4k-graph/0.5/architecture/core-model/) and [TinkerPop](/manual/bluetape4k-graph/0.5/backends/tinkerpop/) first; use the [selection guide](/manual/bluetape4k-graph/0.5/backends/selection-guide/) before production.

## Model

- Nodes: Person/Company/Skill
- Edges: KNOWS/WORKS_AT/FOLLOWS/HAS_SKILL/ENDORSES
- Key properties: name, title, company, skills, strength, role, level

## Prerequisites and release boundary

Use JDK 21, commit `3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907`, and the checked-in wrapper. Examples are not published; run this release fixture as a Gradle project from the release source checkout. In a consumer application, select only `bluetape4k-dependencies:<ecosystem-version>` and add the required graph module without an individual version.

## Run and observe

```bash
./gradlew :linkedin-graph-examples:test --tests "io.bluetape4k.graph.examples.linkedin.TinkerGraphLinkedInGraphTest"
```

The tests assert direct connections, a multi-hop connection path, second-degree connections, employer lookup, and follower lookup. A failure identifies which social relation or lookup direction no longer matches the fixture, so inspect that assertion before widening traversal depth.

## Reading order

1. [Schema](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/linkedin-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/linkedin/schema/LinkedInSchema.kt)
2. [Service](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/linkedin-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/linkedin/service/LinkedInGraphService.kt)
3. [Shared executable contract](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/linkedin-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/linkedin/AbstractLinkedInGraphTest.kt)
4. [Concrete TinkerGraph test](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/linkedin-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/linkedin/TinkerGraphLinkedInGraphTest.kt)
5. [Build file](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/linkedin-graph-examples/build.gradle.kts)

Continue [from recommendation](/manual/bluetape4k-graph/0.5/examples/recommendation/), then read [iam-access-graph](/manual/bluetape4k-graph/0.5/examples/iam-access-graph/). Also see [paired APIs](/manual/bluetape4k-graph/0.5/architecture/paired-apis/), [testing](/manual/bluetape4k-graph/0.5/guides/testing/), and [operations](/manual/bluetape4k-graph/0.5/guides/operations/).

## Exercises and production gaps

Add one result-changing edge and assertion; repeat through the suspend API; then run a persistent-backend concrete test serially. Add disconnected and malformed inputs as diagnostics. This fixture does not prove throughput, clustering, authorization, tenant isolation, migration, backup, remote-driver timeout, or index quality.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `0.5.1` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### linkedin graph examples architecture

[![linkedin graph examples architecture](/manual-assets/bluetape4k-graph/0.5/readme-diagrams/examples-linkedin-graph-examples-architecture-01.png)](../../assets/readme-diagrams/examples-linkedin-graph-examples-architecture-01.svg)

_Release README: [`examples/linkedin-graph-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/linkedin-graph-examples/README.md)_

### linkedin graph examples data flow

[![linkedin graph examples data flow](/manual-assets/bluetape4k-graph/0.5/readme-diagrams/examples-linkedin-graph-examples-data-flow-03.png)](../../assets/readme-diagrams/examples-linkedin-graph-examples-data-flow-03.svg)

_Release README: [`examples/linkedin-graph-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/linkedin-graph-examples/README.md)_

### linkedin graph examples ERD

[![linkedin graph examples ERD](/manual-assets/bluetape4k-graph/0.5/readme-diagrams/examples-linkedin-graph-examples-erd-02.png)](../../assets/readme-diagrams/examples-linkedin-graph-examples-erd-02.svg)

_Release README: [`examples/linkedin-graph-examples/README.md`](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/linkedin-graph-examples/README.md)_

<!-- release-readme-diagrams:end -->
