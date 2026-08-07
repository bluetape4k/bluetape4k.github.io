---
slug: "manual/bluetape4k-leader/0.5/backends/cluster-coordination"
title: "Hazelcast and ZooKeeper"
description: "Compare TTL map ownership with session-bound Curator recipes."
releaseRef: 0.5.0
releaseCommit: 721a9a3808f67489d2bdb8177734325981c24977
manual:
  id: "backends/cluster-coordination"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "5a4837e374df53c5a2c272b7a1d883f07abda6ae"
  sourcePath: "docs/manual/en/backends/cluster-coordination.md"
  minorVersion: "0.5"
  releaseRef: "0.5.0"
  releaseCommit: "721a9a3808f67489d2bdb8177734325981c24977"
  sourceDir: "docs/manual"
  layer: "build"
---


Compare TTL map ownership with session-bound Curator recipes.

## Hazelcast

The Hazelcast backend uses `IMap.putIfAbsent` with TTL and owner-conditional `remove`; it does not require the CP Subsystem. Group election models slots as separate map keys. This favors existing Hazelcast estates, but map backups and cluster split behavior must match the workload's risk.

## ZooKeeper

The ZooKeeper backend uses Curator `InterProcessMutex` and `InterProcessSemaphoreV2`. Ownership is session-based rather than a TTL derived from `leaseTime`. Coroutine single-leader acquisition and release stay on a call-scoped single thread because Curator ownership is thread-sensitive.

## Choice

Choose Hazelcast for an existing data-grid cluster and explicit TTL semantics. Choose ZooKeeper when session-bound coordination and Curator operations are already understood. Test cluster partition and session expiry, not only happy-path contention.

## Release sources

- [`leader-hazelcast/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-hazelcast/README.md)
- [`leader-zookeeper/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-zookeeper/README.md)
- [`examples/cache-warmer/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/examples/cache-warmer/README.md)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.5/)
- [Choose a backend](/manual/bluetape4k-leader/0.5/guides/backend-selection/)
- [Testing leader election](/manual/bluetape4k-leader/0.5/guides/testing/)
