---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-redis/lifecycle-codec-boundaries"
title: Lifecycle and codec boundaries
description: Manage client shutdown, coroutine behavior, and Redis wire formats independently for Lettuce and Redisson.
manualId: bluetape4k-redis
chapterId: lifecycle-codec-boundaries
manual:
  id: "bluetape4k-redis"
  repository: "bluetape4k-projects"
  group: "infrastructure"
  kind: "library"
  sourceCommit: "ece059d6f79ae8b6d769e44ec98483a1225f6260"
  sourcePath: "docs/manual/en/modules/bluetape4k-redis/lifecycle-codec-boundaries.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/redis"
  layer: "build"
  chapterId: "lifecycle-codec-boundaries"
---


## The umbrella does not merge client lifecycles

Lettuce `RedisClient` and Redisson `RedissonClient` instances own different connections and thread resources. Adding `bluetape4k-redis` does not create a shared lifecycle manager. Assign one application component as the owner of each client and keep creation and shutdown together.

`LettuceClients.commands(client)` reuses a cached connection for that client. `LettuceClients.shutdown(client)` closes its cached connection. Process-wide shared resources must be closed only at the matching application shutdown boundary.

A Redisson factory returns a new `RedissonClient`, and the caller must invoke `shutdown()`. For Spring beans, verify that a destroy method or lifecycle callback is registered.

## Coroutines do not change ownership

`RedisFuture.awaitSuspending()` and the Redisson `RFuture` adapters bridge callback results into suspending calls. They do not close clients or add atomicity to Redis commands. Include the possibility that a server already executed a command before a timeout or cancellation in the application's idempotency design.

Do not call blocking `get()` on a coroutine dispatcher and label the path non-blocking. Keep the selected client's async or coroutine API through the boundary. If blocking is unavoidable, isolate it on a bounded dispatcher.

## A Codec is a persisted deployment contract

Changing client libraries does not change bytes already stored in Redis. Similar serializer names, or both clients supporting Fory or JSON, do not prove wire compatibility. Compression wrappers, type metadata, allow-lists, and serializer configuration must also match.

Use one of these migration strategies:

- Invalidate cache data before deployment or let it expire under a short TTL.
- Write persistent data under a new prefix, backfill it, and then switch reads.
- Preserve representative old bytes as fixtures and run a decode contract test with the new client.

## Keyspace and trust boundaries

Document the prefix owned by each client while both are active. Shared keys need one TTL, serialization, compression, and schema-evolution policy. When Redis data crosses a trust boundary, do not broaden polymorphic decoding or binary fallback without an explicit migration window.

## Operational checks

- Active connections and reconnects per client
- Duplicate-execution risk after timeout or cancellation
- Codec decode failures and fallback use
- Pending commands and worker drain at shutdown
- Deployed versions and Codecs that access each prefix

## Release sources

- [`LettuceClients.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/LettuceClients.kt)
- [`RedisFutureSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/RedisFutureSupport.kt)
- [`RedissonClientSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/redisson/src/main/kotlin/io/bluetape4k/redis/redisson/RedissonClientSupport.kt)
- [Lettuce codecs and serialization](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/codecs-and-serialization/)
- [Redisson codecs and security](/manual/bluetape4k-projects/1.11/modules/bluetape4k-redisson/codecs-security-wire-format/)
