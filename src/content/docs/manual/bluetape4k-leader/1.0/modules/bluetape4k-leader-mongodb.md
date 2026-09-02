---
slug: "manual/bluetape4k-leader/1.0/modules/bluetape4k-leader-mongodb"
manualId: "bluetape4k-leader-mongodb"
id: "bluetape4k-leader-mongodb"
title: "MongoDB backend"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-mongodb"
sourceDir: "leader-mongodb"
releaseRef: "1.0.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-mongodb
manual:
  id: "bluetape4k-leader-mongodb"
  repository: "bluetape4k-leader"
  group: "backends"
  kind: "library"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/modules/bluetape4k-leader-mongodb.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "leader-mongodb"
  layer: "build"
---


> Library module

## Problem

Implements single/group election with token-owned MongoDB documents, atomic `findOneAndUpdate`, expiry, TTL indexes, and blocking/coroutine factories.

## When to use it

Choose it when MongoDB is already a durable application dependency and coordination in the same replica set is operationally simpler.

## Coordinates

Artifact: `io.github.bluetape4k.leader:bluetape4k-leader-mongodb`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-mongodb")
}
```

## Core concepts

The collection stores lock documents with owner token and `expireAt`; atomic filters acquire and extend. TTL index cleanup is not the correctness clock.

## Quick start

```kotlin
val collection = database.getCollection<Document>("bluetape4k_leader_locks")
val elector = MongoLeaderElector(collection)
elector.runIfLeader("tenant-aggregation") { aggregate() }
```

## API by task

Use blocking/suspend single and group electors, factories, extensions, and optional Mongo history sink/indexer. Collection lifecycle is caller-owned.

## Recommended patterns

Use majority write concern in replica sets, stable collection/name prefixes, idempotent actions, and owner-token conditions on extend/release.

## Integrations

Spring can build factories from a `MongoClient`. tenant-aggregator demonstrates a partitioned workload.

## Configuration

Configure database/collection, wait/lease/minimum lease, retry delay, group size, write concern, and history TTL/index policy.

## Failure modes

Contention returns `null`. Network, primary election, write-concern, permission, and index errors propagate. TTL deletion delay must not control acquisition.

## Operations

Monitor command latency, write concern errors, primary changes, retry rate, stale documents, TTL monitor lag, extension failures, and history growth.

## Testing

Use a replica-set Testcontainer for two-client contention, failover behavior, TTL/expiry, stale owner, group slots, suspend cancellation, and index creation.

## Workshops and learning path

Run tenant-aggregator, then compare MongoDB with SQL when deciding document versus transactional coordination.

## Limitations

Replica-set configuration affects split-brain risk. MongoDB lease ownership does not fence writes to another system.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `1.0.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### leader mongodb Class Structure diagram

[![leader mongodb Class Structure diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/e70146330302758f563a46b7286e3ce25f1bac49/docs/images/readme-diagrams/leader-mongodb-class-01.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/e70146330302758f563a46b7286e3ce25f1bac49/docs/images/readme-diagrams/leader-mongodb-class-01.svg)

_Release README: [`leader-mongodb/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/e70146330302758f563a46b7286e3ce25f1bac49/leader-mongodb/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

[Elector](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-mongodb/src/main/kotlin/io/bluetape4k/leader/mongodb/MongoLeaderElector.kt) · [Lock implementation](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-mongodb/src/main/kotlin/io/bluetape4k/leader/mongodb/lock/MongoLock.kt) · [Stable guide](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-mongodb/README.md)
