---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/operations-and-ecosystem"
title: Operations and ecosystem
description: Observe Lettuce in production and choose the next cache, Hibernate, Exposed, or workshop layer.
manualId: bluetape4k-lettuce
chapterId: operations-and-ecosystem
manual:
  id: "bluetape4k-lettuce"
  repository: "bluetape4k-projects"
  group: "infrastructure"
  kind: "library"
  sourceCommit: "a9051bd77bf5870d3787f15c1d32088412f2bdbb"
  sourcePath: "docs/manual/en/modules/bluetape4k-lettuce/operations-and-ecosystem.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/lettuce"
  layer: "build"
  chapterId: "operations-and-ecosystem"
---


## What to observe

Track Redis connection and reconnect state, command latency and timeouts, pipeline batch size, and codec decode failures. Loaded maps add hit/miss rates, loader latency, write-behind queue depth, retries, dead letters, and shutdown draining. Queue saturation usually means the writer cannot keep up with Redis writes, not merely that the configured capacity is small.

## From tests to production failures

`LettuceClientsTest` covers connection reuse and multi-thread, virtual-thread, and coroutine access. `RedisFutureSupportTest` checks ordering and failure propagation. Loaded-map tests cover writer failures, dead letters, and caller-scope ownership. Benchmark numbers describe one machine and payload set; they are not an application SLA.

## Choose the next layer

- Stay here for direct Redis commands and coroutine adapters.
- Use [`bluetape4k-cache-lettuce`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-lettuce/) for memoization and cache abstractions.
- Use [`bluetape4k-hibernate-cache-lettuce`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate-cache-lettuce/) for Hibernate second-level caching.
- For database-backed loading and writing, define transaction boundaries with [`bluetape4k-jdbc`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-jdbc/), [`bluetape4k-hibernate`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate/), or Exposed repositories.
- Continue with [bluetape4k-workshop](https://github.com/bluetape4k/bluetape4k-workshop) and [Exposed Workshop](https://github.com/bluetape4k/exposed-workshop) for complete examples.

Do not label cache-aside PUT management as true write-through. A write-through or write-behind example must include the database writer and its consistency boundary.

## Source and tests

- [`Benchmark.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/Benchmark.md)
- [`LettuceSuspendedLoadedMapTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/test/kotlin/io/bluetape4k/redis/lettuce/map/LettuceSuspendedLoadedMapTest.kt)
- [`FastForyCompatibilityTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/test/kotlin/io/bluetape4k/redis/lettuce/codec/FastForyCompatibilityTest.kt)
