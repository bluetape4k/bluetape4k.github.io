---
slug: "manual/bluetape4k-leader/0.5/guides/identity-state-and-history"
title: "Identity, state, and history"
description: "Use audit identity, physical node identity, snapshots, events, and history for different questions."
releaseRef: 0.5.0
releaseCommit: 721a9a3808f67489d2bdb8177734325981c24977
manual:
  id: "guides/identity-state-and-history"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "5a4837e374df53c5a2c272b7a1d883f07abda6ae"
  sourcePath: "docs/manual/en/guides/identity-state-and-history.md"
  minorVersion: "0.5"
  releaseRef: "0.5.0"
  releaseCommit: "721a9a3808f67489d2bdb8177734325981c24977"
  sourceDir: "docs/manual"
  layer: "build"
---


Use audit identity, physical node identity, snapshots, events, and history for different questions.

## Do not mix identities

`LeaderLease.auditLeaderId` is the election-time audit identity and may be a fencing token or backend holder id. `nodeId` is the physical process identity when separately available. Comparing a physical node id as though it were a monotonic fencing token creates split-brain risk.

## State and events

`state()` and group state are best-effort snapshots. Listener callbacks and the hot event flow expose elected, revoked, and skipped transitions for observation. They do not replace atomic acquire and they may omit precise expiry data.

## History

A history sink records acquired, completed, and failed records. `EXPIRED` is computed on read when an acquired record's `lockedUntil` is in the past; it is not persisted by a sweeper in v1. History recorder failures are isolated from the protected business action, so monitor the sink separately.

## Release sources

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderLease.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderLease.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderState.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderState.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/history/LeaderHistoryStatus.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/main/kotlin/io/bluetape4k/leader/history/LeaderHistoryStatus.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.5/)
- [Observability and operations](/manual/bluetape4k-leader/0.5/guides/observability-and-operations/)
- [Micrometer integration](/manual/bluetape4k-leader/0.5/frameworks/micrometer/)
