---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-nats/connection-options-ownership"
title: Connection and options ownership
description: Understand the natsOptions DSL, Connection creation and shutdown, reconnects, and listener ownership.
manualId: bluetape4k-nats
chapterId: connection-options-ownership
manual:
  id: "modules/bluetape4k-nats/connection-options-ownership"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "e89bf724fd018af8c2ab4564a5c9a007fe27b46a"
  sourcePath: "docs/manual/en/modules/bluetape4k-nats/connection-options-ownership.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "docs/manual"
  layer: "build"
---


## What the DSL does

`natsOptions { ... }` creates a fresh `Options.Builder`, applies the block, and calls `build()`. `natsOptions(properties)` starts from `Properties` and lets the block override values. `natsOptionsOf` is a shortcut for a URL, maximum reconnect count, and buffer size.

```kotlin
val options = natsOptions {
    servers(arrayOf("nats://nats-a:4222", "nats://nats-b:4222"))
    maxReconnects(20)
    bufferSize(8 * 1024 * 1024)
}

val connection = Nats.connect(options)
```

The DSL only exposes the jNATS builder with Kotlin syntax. jNATS still defines authentication, TLS, reconnect waits, pings, executors, defaults, and validation failures.

## Assign a connection owner

The module has no connection provider or global cache. The component that calls `Nats.connect(options)` owns the returned `Connection`. That owner must also:

- configure endpoints and credentials;
- install connection and asynchronous error listeners;
- decide how exhausted reconnects affect readiness;
- stop new work, drain subscriptions and consumers, and close the connection during shutdown.

Use `use` to make ownership visible in a short command or test.

```kotlin
Nats.connect(options).use { connection ->
    connection.publish("jobs.triggered", "nightly")
    connection.flush(2.seconds)
}
```

Do not connect per request in a long-running server. Create one connection at application startup, inject it into publishers and consumers, and release it during shutdown.

## `drain` and `close`

`Connection.drainSuspending(timeout)` awaits the asynchronous jNATS drain future. The timeout must be zero or positive; a negative duration causes `IllegalArgumentException`.

```kotlin
try {
    serve(connection)
} finally {
    val drained = connection.drainSuspending(10.seconds)
    if (!drained) logger.warn { "NATS connection drain timed out" }
    connection.close()
}
```

A successful drain does not prove that arbitrary external side effects started by callbacks have completed. Track and join database, HTTP, or child coroutine work separately.

## Reconnect policy

Reconnects tolerate short network interruptions; they do not retry message processing. Test how core publishes behave across a disconnect and what happens when the pending buffer fills under the chosen jNATS options.

Use connection listeners for state transitions, but do not log server URLs containing credentials or tokens. Derive readiness from the operations the service needs, including JetStream when applicable, rather than from a single `CONNECTED` event.

## Ownership in Spring

`nats-spring` is `compileOnly`. This artifact supplies neither a Spring bean nor auto-configuration. If a Spring Boot application creates a `Connection` bean, prevent another singleton from opening a duplicate connection. Drain and close it exactly once through the bean lifecycle or a dedicated lifecycle component.

## Sources and tests

- [`Options.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/Options.kt)
- [`ConnectionExtensions.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/ConnectionExtensions.kt)
- [`Consumer.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/Consumer.kt)
- [`OptionsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/nats/src/test/kotlin/io/bluetape4k/nats/client/OptionsTest.kt)
- [`ConsumerExtensionsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/nats/src/test/kotlin/io/bluetape4k/nats/client/ConsumerExtensionsTest.kt)
- [`AbstractNatsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/nats/src/test/kotlin/io/bluetape4k/nats/AbstractNatsTest.kt)

The 1.11.0 fixture uses `Connection.use` with a Testcontainer. Application integration tests must cover production lifecycle and terminal reconnect behavior.
