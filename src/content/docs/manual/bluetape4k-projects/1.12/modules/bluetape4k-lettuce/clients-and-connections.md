---
slug: "manual/bluetape4k-projects/1.12/modules/bluetape4k-lettuce/clients-and-connections"
title: Clients and connections
description: Define ownership for Lettuce clients, cached connections, shared resources, and pipelines.
manualId: bluetape4k-lettuce
chapterId: clients-and-connections
manual:
  id: "bluetape4k-lettuce"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "ffde7b8be16124b1c538bb318a7d482927f738ad"
  sourcePath: "docs/manual/en/modules/bluetape4k-lettuce/clients-and-connections.md"
  minorVersion: "1.12"
  releaseRef: "1.12.1"
  releaseCommit: "7cf0b73646af05c0f8872cc4f6a16983949c4e3e"
  sourceDir: "infra/lettuce"
  layer: "build"
  learningOrder: 540
  chapterId: "clients-and-connections"
  chapterOrder: 1
---


## What a default client owns

`LettuceClients.clientOf` uses the process-wide `DEFAULT_CLIENT_RESOURCES` and applies keep-alive, TCP_NODELAY, and a connection timeout. Clients avoid creating separate event-loop pools, but the shared resource now has process lifetime.

```kotlin
val client = LettuceClients.clientOf("redis://redis:6379")
val connection = LettuceClients.connect(client)
check(connection.sync().ping() == "PONG")
LettuceClients.shutdown(client)
```

The same client and codec reuse an open cached connection. A closed connection is recreated under a per-client `ReentrantLock`. This cache is not a connection pool; concurrent callers share Lettuce's thread-safe connection.

## Shutdown order

`shutdown(client)` closes that client's default and codec connections before shutting down the client. Parameterless `shutdown()` closes shared `ClientResources`, so call it only when every client is finished. Objects that call `client.connect(codec)` directly, including loaded maps, own and close those connections themselves.

## Pipelines only issue commands

```kotlin
val futures = connection.withPipeline { commands ->
    (1..100).map { commands.set("item:$it", "v$it") }
}
futures.awaitAll()
```

`withPipeline` disables auto-flush, flushes once after the block, and restores auto-flush in `finally`. Awaiting inside the block can wait for a result that has not been flushed.

## Source and tests

- [`LettuceClients.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/LettuceClients.kt)
- [`LettuceClientsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/infra/lettuce/src/test/kotlin/io/bluetape4k/redis/lettuce/LettuceClientsTest.kt)

Continue with [Commands and coroutines](/manual/bluetape4k-projects/1.12/modules/bluetape4k-lettuce/commands-and-coroutines/).
