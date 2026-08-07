---
slug: "manual/bluetape4k-graph/0.6/examples/iam-access-graph"
title: "IAM access graph"
manual:
  id: "iam-access-graph-examples"
  repository: "bluetape4k-graph"
  group: "examples"
  kind: "example"
  sourceCommit: "f29ddc29f5b59a82f218b9f815046fac288ecd30"
  sourcePath: "docs/manual/en/examples/iam-access-graph.md"
  minorVersion: "0.6"
  releaseRef: "0.6.0"
  releaseCommit: "72c0256e2e1cf61101d29852210e3c827ca93bc0"
  sourceDir: "examples/iam-access-graph-examples"
  layer: "learn"
---


## Problem and backend

This example expands principal, group, role, policy, and emergency grants into an explainable access path. It uses **TinkerGraph** to isolate modeling from container and network variance. Read [core model](/manual/bluetape4k-graph/0.6/architecture/core-model/) and [TinkerPop](/manual/bluetape4k-graph/0.6/backends/tinkerpop/) first; use the [selection guide](/manual/bluetape4k-graph/0.6/backends/selection-guide/) before production.

## Model

- Nodes: IamUser/IamGroup/IamRole/IamPolicy/IamPermission/IamResource/IamSessionGrant
- Edges: MEMBER_OF/HAS_ROLE/ATTACHED_POLICY/GRANTS_PERMISSION/APPLIES_TO/HAS_TEMP_GRANT/TEMPORARY_PERMISSION
- Key properties: userId, roleId, policyId, action, resourceId, grantId, expiresAt

## Prerequisites and release boundary

Use JDK 21, commit `72c0256e2e1cf61101d29852210e3c827ca93bc0`, and the checked-in wrapper. Examples are not published; run this release fixture as a Gradle project from the release source checkout. In a consumer application, select only `bluetape4k-dependencies:<ecosystem-version>` and add the required graph module without an individual version.

## Run and observe

```bash
./gradlew :iam-access-graph-examples:test --tests "io.bluetape4k.graph.examples.iam.TinkerGraphIamAccessGraphTest"
```

The tests assert two independent grants: inherited group access passes through `group:engineering` and `role:deployer-role`, while temporary emergency access passes through `grant:break-glass-1001`. A failure means the principal-to-role direction, policy expansion, or deny boundary needs inspection.

## Reading order

1. [Schema](https://github.com/bluetape4k/bluetape4k-graph/blob/72c0256e2e1cf61101d29852210e3c827ca93bc0/examples/iam-access-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/iam/schema/IamAccessGraphSchema.kt)
2. [Service](https://github.com/bluetape4k/bluetape4k-graph/blob/72c0256e2e1cf61101d29852210e3c827ca93bc0/examples/iam-access-graph-examples/src/main/kotlin/io/bluetape4k/graph/examples/iam/service/IamAccessGraphService.kt)
3. [Shared executable contract](https://github.com/bluetape4k/bluetape4k-graph/blob/72c0256e2e1cf61101d29852210e3c827ca93bc0/examples/iam-access-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/iam/AbstractIamAccessGraphTest.kt)
4. [Concrete TinkerGraph test](https://github.com/bluetape4k/bluetape4k-graph/blob/72c0256e2e1cf61101d29852210e3c827ca93bc0/examples/iam-access-graph-examples/src/test/kotlin/io/bluetape4k/graph/examples/iam/IamAccessBackendTests.kt)
5. [Build file](https://github.com/bluetape4k/bluetape4k-graph/blob/72c0256e2e1cf61101d29852210e3c827ca93bc0/examples/iam-access-graph-examples/build.gradle.kts)

Continue [from linkedin-graph](/manual/bluetape4k-graph/0.6/examples/linkedin-graph/), then read [fraud-detection](/manual/bluetape4k-graph/0.6/examples/fraud-detection/). Also see [paired APIs](/manual/bluetape4k-graph/0.6/architecture/paired-apis/), [testing](/manual/bluetape4k-graph/0.6/guides/testing/), and [operations](/manual/bluetape4k-graph/0.6/guides/operations/).

## Exercises and production gaps

Add one result-changing edge and assertion; repeat through the suspend API; then run a persistent-backend concrete test serially. Add disconnected and malformed inputs as diagnostics. This fixture does not prove throughput, clustering, authorization, tenant isolation, migration, backup, remote-driver timeout, or index quality.
