---
title: "Hazelcast and ZooKeeper"
description: "Compare TTL map ownership with session-bound Curator recipes."
releaseRef: 1.0.0
releaseCommit: e70146330302758f563a46b7286e3ce25f1bac49
---

# Hazelcast and ZooKeeper

Compare TTL map ownership with session-bound Curator recipes.

## Hazelcast

The Hazelcast backend uses `IMap.putIfAbsent` with TTL and owner-conditional `remove`; it does not require the CP Subsystem. Group election models slots as separate map keys. This favors existing Hazelcast estates, but map backups and cluster split behavior must match the workload's risk.

## ZooKeeper

The ZooKeeper backend uses Curator `InterProcessMutex` and `InterProcessSemaphoreV2`. Ownership is session-based rather than a TTL derived from `leaseTime`. Coroutine single-leader acquisition and release stay on a call-scoped single thread because Curator ownership is thread-sensitive.

## Choice

Choose Hazelcast for an existing data-grid cluster and explicit TTL semantics. Choose ZooKeeper when session-bound coordination and Curator operations are already understood. Test cluster partition and session expiry, not only happy-path contention.

## Release sources

- [`leader-hazelcast/README.md`](../../../../leader-hazelcast/README.md)
- [`leader-zookeeper/README.md`](../../../../leader-zookeeper/README.md)
- [`examples/cache-warmer/README.md`](../../../../examples/cache-warmer/README.md)

## Continue learning

- [Bluetape4k Leader manual](../index.md)
- [Choose a backend](../guides/backend-selection.md)
- [Testing leader election](../guides/testing.md)
