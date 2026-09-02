---
slug: "manual/bluetape4k-leader/1.0/getting-started"
title: "Getting started"
description: "Validate skip-on-contention semantics locally, then replace only the elector with a distributed backend."
releaseRef: 1.0.0
releaseCommit: e70146330302758f563a46b7286e3ce25f1bac49
manual:
  id: "getting-started"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/getting-started.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "docs/manual/bluetape4k-leader"
  layer: "build"
---


Validate skip-on-contention semantics locally, then replace only the elector with a distributed backend.

## Add one managed dependency

Import the central bluetape4k platform and add the core library. The central platform is the consumer-facing version authority; do not make the Leader BOM a second version choice.

```kotlin
implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
implementation("io.github.bluetape4k.leader:bluetape4k-leader-core")
```

## Run the smallest contract

```kotlin
val elector = LocalLeaderElector()
val result = elector.runIfLeader("daily-report") { generateReport() }
if (result == null) logger.debug { "another contender ran daily-report" }
```

Keep the lock name stable across instances. A blank name is invalid. The default options wait up to 5 seconds, lease for 60 seconds, do not impose a minimum hold time, and do not enable auto-extension.

## Move to production

Replace `LocalLeaderElector` with a backend implementation while retaining the guarded action and its idempotency rules. Set `waitTime` to the amount of queuing you actually tolerate, and make `leaseTime` longer than normal execution plus jitter. Test two contenders, action failure, backend loss, and process restart before rollout.

## Release sources

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/local/LocalLeaderElector.kt`](../../../leader-core/src/main/kotlin/io/bluetape4k/leader/local/LocalLeaderElector.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElectionOptions.kt`](../../../leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderElectionOptions.kt)
- [`leader-core/src/test/kotlin/io/bluetape4k/leader/local/AbstractLocalLeaderElectorTest.kt`](../../../leader-core/src/test/kotlin/io/bluetape4k/leader/local/AbstractLocalLeaderElectorTest.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/1.0/)
- [Result semantics](/manual/bluetape4k-leader/1.0/core/result-semantics/)
- [Choose a backend](/manual/bluetape4k-leader/1.0/guides/backend-selection/)
