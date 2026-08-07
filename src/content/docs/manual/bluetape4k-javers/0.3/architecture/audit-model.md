---
slug: "manual/bluetape4k-javers/0.3/architecture/audit-model"
title: "Audit model"
manual:
  id: "architecture/audit-model"
  repository: "bluetape4k-javers"
  group: "overview"
  kind: "guide"
  sourceCommit: "fb279cdba663bde80d9b146049aca146433a9b36"
  sourcePath: "docs/manual/en/architecture/audit-model.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "978d0490fc438570e7520643aed50e20614772d1"
  sourceDir: "docs/manual"
  layer: "build"
---


A JaVers audit record is not a second copy of an application row. A commit describes one audited operation, snapshots record object state at that commit, changes are calculated differences, and shadows reconstruct domain-shaped historical objects from snapshots.

[![JaVers audit snapshot model](/manual-assets/bluetape4k-javers/0.3/architecture/audit-snapshot-model.png)](../../assets/architecture/audit-snapshot-model.svg)

## Commit and snapshot

`javers.commit(author, object, properties)` creates commit metadata and one or more `CdoSnapshot` values. Metadata includes the commit ID, author, time, and string properties. In `bluetape4k-javers`, [`CommitMetadataExtensions.kt`](https://github.com/bluetape4k/bluetape4k-javers/blob/978d0490fc438570e7520643aed50e20614772d1/javers-core/src/main/kotlin/io/bluetape4k/javers/commit/CommitMetadataExtensions.kt) exposes the commit ID pair and epoch-millisecond timestamp. `AbstractCdoSnapshotRepository` filters snapshots by commit ID, author, date, version, changed properties, type, and commit properties.

A snapshot carries `GlobalId`, version, state, changed property names, type, and commit metadata. `CdoSnapshotRepository.loadSnapshots` returns a GlobalId's snapshots newest first. The abstract implementation may materialize every repository key for broad JQL queries; it warns above 10,000 keys, so indexed SQL query pushdown is not provided by 0.3.0.

## Change and shadow

Changes answer “what differs?”; shadows answer “what did this object look like?” A shadow is reconstructed by JaVers and is not the current application entity. [`SnapshotToShadowTest.kt`](https://github.com/bluetape4k/bluetape4k-javers/blob/978d0490fc438570e7520643aed50e20614772d1/javers-core/src/test/kotlin/io/bluetape4k/javers/SnapshotToShadowTest.kt) proves snapshot-to-shadow reconstruction. [`ShadowProvider.kt`](https://github.com/bluetape4k/bluetape4k-javers/blob/978d0490fc438570e7520643aed50e20614772d1/javers-core/src/main/kotlin/io/bluetape4k/javers/ShadowProvider.kt) caches a `ShadowFactory` per `Javers` instance but accesses JaVers' internal `typeMapper` reflectively; a JaVers internal change can therefore fail with `IllegalStateException`.

## Codecs and repository SPI

`JaversCodec<T>` converts JaVers `JsonObject` state to a storage value and returns `null` when a codec cannot decode. String, compressed string, binary, compressed binary, and map codecs are listed in [`JaversCodecs.kt`](https://github.com/bluetape4k/bluetape4k-javers/blob/978d0490fc438570e7520643aed50e20614772d1/javers-core/src/main/kotlin/io/bluetape4k/javers/codecs/JaversCodecs.kt). A repository must receive JaVers' `JsonConverter` before encoding; otherwise encoding fails immediately.

Continue with [repository composition](/manual/bluetape4k-javers/0.3/architecture/repository-composition/) to map this model onto storage.
