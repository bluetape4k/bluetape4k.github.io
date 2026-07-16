---
slug: "manual/bluetape4k-graph/0.5/examples/fraud-detection"
title: "Fraud detection graph"
manual:
  id: "fraud-detection-examples"
  repository: "bluetape4k-graph"
  group: "examples"
  kind: "example"
  sourceCommit: "2d9d09279f4b8a138dd46e3a3ffaf07699f7cfa0"
  sourcePath: "docs/manual/en/examples/fraud-detection.md"
  minorVersion: "0.5"
  releaseRef: "0.5.1"
  releaseCommit: "3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907"
  sourceDir: "examples/fraud-detection-examples"
  layer: "learn"
---


## Problem and backend

This example combines transfer paths, cycles, and risk signals to explain why an account is suspicious. It uses **TinkerGraph** to isolate modeling from container and network variance. Read [core model](/manual/bluetape4k-graph/0.5/architecture/core-model/) and [TinkerPop](/manual/bluetape4k-graph/0.5/backends/tinkerpop/) first; use the [selection guide](/manual/bluetape4k-graph/0.5/backends/selection-guide/) before production.

## Model

- Nodes: Account
- Edges: TRANSFERRED_TO
- Key properties: accountId, ownerName, riskTier, amount, occurredAt

## Prerequisites and release boundary

Use JDK 21, commit `3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907`, and the checked-in wrapper. Examples are not published; run this release fixture as a Gradle project from the release source checkout. In a consumer application, select only `bluetape4k-dependencies:<ecosystem-version>` and add the required graph module without an individual version.

## Run and observe

```bash
./gradlew :fraud-detection-examples:test --tests "io.bluetape4k.graph.examples.fraud.TinkerGraphFraudDetectionTest"
```

The test asserts that `acct-bob` is scored, the transfer cycle closes, and sink analysis reaches `acct-sink`. A failure usually indicates changed transfer direction, risk weighting, or cycle/depth limits rather than a Gradle-output problem.

## Reading order

1. [Schema](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/fraud-detection-examples/src/main/kotlin/io/bluetape4k/graph/examples/fraud/schema/FraudDetectionSchema.kt)
2. [Service](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/fraud-detection-examples/src/main/kotlin/io/bluetape4k/graph/examples/fraud/service/FraudDetectionService.kt)
3. [Shared executable contract](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/fraud-detection-examples/src/test/kotlin/io/bluetape4k/graph/examples/fraud/AbstractFraudDetectionTest.kt)
4. [Concrete TinkerGraph test](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/fraud-detection-examples/src/test/kotlin/io/bluetape4k/graph/examples/fraud/FraudDetectionBackendTests.kt)
5. [Build file](https://github.com/bluetape4k/bluetape4k-graph/blob/3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907/examples/fraud-detection-examples/build.gradle.kts)

Continue [from iam-access-graph](/manual/bluetape4k-graph/0.5/examples/iam-access-graph/), then read [security-attack-path](/manual/bluetape4k-graph/0.5/examples/security-attack-path/). Also see [paired APIs](/manual/bluetape4k-graph/0.5/architecture/paired-apis/), [testing](/manual/bluetape4k-graph/0.5/guides/testing/), and [operations](/manual/bluetape4k-graph/0.5/guides/operations/).

## Exercises and production gaps

Add one result-changing edge and assertion; repeat through the suspend API; then run a persistent-backend concrete test serially. Add disconnected and malformed inputs as diagnostics. This fixture does not prove throughput, clustering, authorization, tenant isolation, migration, backup, remote-driver timeout, or index quality.
