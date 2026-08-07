---
slug: "manual/bluetape4k-graph/0.6/examples/security-attack-path"
title: "Security attack paths"
manual:
  id: "security-attack-path-examples"
  repository: "bluetape4k-graph"
  group: "examples"
  kind: "example"
  sourceCommit: "f29ddc29f5b59a82f218b9f815046fac288ecd30"
  sourcePath: "docs/manual/en/examples/security-attack-path.md"
  minorVersion: "0.6"
  releaseRef: "0.6.0"
  releaseCommit: "72c0256e2e1cf61101d29852210e3c827ca93bc0"
  sourceDir: "examples/security-attack-path-examples"
  layer: "learn"
---


## Problem and backend

This example makes exploit, trust, privilege, and blocking transitions visible along an attack path. It uses **TinkerGraph** to isolate modeling from container and network variance. Read [core model](/manual/bluetape4k-graph/0.6/architecture/core-model/) and [TinkerPop](/manual/bluetape4k-graph/0.6/backends/tinkerpop/) first; use the [selection guide](/manual/bluetape4k-graph/0.6/backends/selection-guide/) before production.

## Model

- Nodes: EntryAsset/Host/Principal/Credential/Vulnerability/Permission
- Edges: CAN_REACH/EXPLOITS/COMPROMISES/RUNS_AS/HAS_CREDENTIAL/GRANTS_ACCESS/HAS_PERMISSION/CONTROLS_ASSET
- Key properties: assetId, hostId, principalId, vulnerabilityId, severity, privilege, status

## Prerequisites and release boundary

Use JDK 21, commit `72c0256e2e1cf61101d29852210e3c827ca93bc0`, and the checked-in wrapper. Examples are not published; run this release fixture as a Gradle project from the release source checkout. In a consumer application, select only `bluetape4k-dependencies:<ecosystem-version>` and add the required graph module without an individual version.

## Run and observe

```bash
./gradlew :security-attack-path-examples:test --tests "io.bluetape4k.graph.examples.securityattack.TinkerGraphSecurityAttackPathTest"
```

The test asserts that the escalation path includes `web-service`, `ci-admin-token`, and `domain-admin`, while `customer-db` remains blocked. A failure means an exploit or trust edge, privilege transition, or blocking rule changed.

## Reading order

1. [Schema](https://github.com/bluetape4k/bluetape4k-graph/blob/72c0256e2e1cf61101d29852210e3c827ca93bc0/examples/security-attack-path-examples/src/main/kotlin/io/bluetape4k/graph/examples/securityattack/schema/SecurityAttackPathGraphSchema.kt)
2. [Service](https://github.com/bluetape4k/bluetape4k-graph/blob/72c0256e2e1cf61101d29852210e3c827ca93bc0/examples/security-attack-path-examples/src/main/kotlin/io/bluetape4k/graph/examples/securityattack/service/SecurityAttackPathService.kt)
3. [Shared executable contract](https://github.com/bluetape4k/bluetape4k-graph/blob/72c0256e2e1cf61101d29852210e3c827ca93bc0/examples/security-attack-path-examples/src/test/kotlin/io/bluetape4k/graph/examples/securityattack/AbstractSecurityAttackPathTest.kt)
4. [Concrete TinkerGraph test](https://github.com/bluetape4k/bluetape4k-graph/blob/72c0256e2e1cf61101d29852210e3c827ca93bc0/examples/security-attack-path-examples/src/test/kotlin/io/bluetape4k/graph/examples/securityattack/SecurityAttackPathBackendTests.kt)
5. [Build file](https://github.com/bluetape4k/bluetape4k-graph/blob/72c0256e2e1cf61101d29852210e3c827ca93bc0/examples/security-attack-path-examples/build.gradle.kts)

Continue [from fraud-detection](/manual/bluetape4k-graph/0.6/examples/fraud-detection/), then read [network-topology](/manual/bluetape4k-graph/0.6/examples/network-topology/). Also see [paired APIs](/manual/bluetape4k-graph/0.6/architecture/paired-apis/), [testing](/manual/bluetape4k-graph/0.6/guides/testing/), and [operations](/manual/bluetape4k-graph/0.6/guides/operations/).

## Exercises and production gaps

Add one result-changing edge and assertion; repeat through the suspend API; then run a persistent-backend concrete test serially. Add disconnected and malformed inputs as diagnostics. This fixture does not prove throughput, clustering, authorization, tenant isolation, migration, backup, remote-driver timeout, or index quality.
