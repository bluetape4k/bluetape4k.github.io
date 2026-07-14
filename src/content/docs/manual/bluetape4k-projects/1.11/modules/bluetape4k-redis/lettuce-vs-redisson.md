---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-redis/lettuce-vs-redisson"
title: Choosing Lettuce or Redisson
description: Select a client by separating command-oriented requirements from distributed-object requirements.
manualId: bluetape4k-redis
chapterId: lettuce-vs-redisson
manual:
  id: "bluetape4k-redis"
  repository: "bluetape4k-projects"
  group: "infrastructure"
  kind: "library"
  sourceCommit: "03115e34f03bad535921d3cad5cd23a2e7814581"
  sourcePath: "docs/manual/en/modules/bluetape4k-redis/lettuce-vs-redisson.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/redis"
  layer: "build"
  chapterId: "lettuce-vs-redisson"
---


## Choose the abstraction, not the library name

Both clients connect to Redis, but their primary abstractions differ. Decide whether the application wants to compose Redis commands directly or use higher-level distributed objects with their own lifecycle.

| Requirement | Lettuce | Redisson |
| --- | --- | --- |
| Sync/async commands and pipelines | Primary path | Available, but not the focus of these helpers |
| Awaiting futures in coroutines | `awaitSuspending`, coroutine commands | `RFuture` adapters and suspended batch/transactions |
| Object codecs | Binary, JSON, and Protobuf codecs | JSON, Fory, and compressed codecs |
| Distributed locks, maps, and queues | Design with raw commands | Redisson distributed objects |
| Stream consumer-group helpers | Build with command APIs | Validated `RStreamSupport` helpers |
| Local cached maps | Check the 1.11.0 loaded-map limits | Near Cache over `RLocalCachedMap` |

## Choose Lettuce for command-oriented code

Lettuce is a direct fit when Redis commands, pipelines, and explicit key design are central to the service. `LettuceClients` supplies client and command entry points, while `RedisFutureSupport` bridges futures to suspending calls.

A coroutine adapter does not turn the Redis operation into a cancellable transaction. Assign connection ownership, timeouts, and reconnect behavior first in [Clients and connections](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/clients-and-connections/).

## Choose Redisson for distributed objects

Redisson fits distributed locks, maps, Streams, batch and transactions, or local cached maps. The `redissonClient {}` DSL reduces setup, but the application still owns and shuts down the returned client.

Near Cache is not just a faster-map switch. Pub/Sub invalidation, reconnect behavior, Codec compatibility, and cache names are operational contracts. See [Local cached maps and invalidation](/manual/bluetape4k-projects/1.11/modules/bluetape4k-redisson/local-cache-pubsub-invalidation/).

## Use both only with explicit boundaries

A service may use Lettuce commands and a Redisson lock together. It then owns two client pools, retry policies, timeouts, and shutdown paths. If both clients share a keyspace, test the exact Codec bytes rather than assuming compatibility.

Cross-client failure fallback is risky. A command can succeed at the server before the first client reports a timeout, and the second client can execute it again. Do not add automatic fallback without idempotency and result-reconciliation rules.

## Continue from the decision

- For Lettuce, continue to [Commands and coroutines](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/commands-and-coroutines/).
- For Redisson, start with [Clients, distributed objects, and Streams](/manual/bluetape4k-projects/1.11/modules/bluetape4k-redisson/client-distributed-objects-streams/).
- To remove one client from an existing umbrella consumer, follow [Selective dependency migration](/manual/bluetape4k-projects/1.11/modules/bluetape4k-redis/selective-dependency-migration/).

## Release sources

- [`LettuceClients.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/LettuceClients.kt)
- [`RedisFutureSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/RedisFutureSupport.kt)
- [`RedissonClientSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/RedissonClientSupport.kt)
- [`RedissonClientCoroutine.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/coroutines/RedissonClientCoroutine.kt)
