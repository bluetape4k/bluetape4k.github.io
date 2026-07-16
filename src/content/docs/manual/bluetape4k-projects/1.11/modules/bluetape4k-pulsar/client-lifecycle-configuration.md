---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-pulsar/client-lifecycle-configuration"
title: Client configuration and lifecycle
description: PulsarClient builders, direct and block-scoped ownership, configuration, and the 1.11.0 close boundary.
manualId: bluetape4k-pulsar
chapterId: client-lifecycle-configuration
manual:
  id: "modules/bluetape4k-pulsar/client-lifecycle-configuration"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "e1463bff0f864add7c54b7188f492cfe36336cdd"
  sourcePath: "docs/manual/en/modules/bluetape4k-pulsar/client-lifecycle-configuration.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "docs/manual"
  layer: "build"
---


## Two creation forms

`pulsarClient(serviceUrl, setup)` returns a new `PulsarClient`. When the URL is empty, setup must call `serviceUrl()`.

```kotlin
val client = pulsarClient("pulsar://localhost:6650") {
    connectionTimeout(5, TimeUnit.SECONDS)
}

val tlsClient = pulsarClient {
    serviceUrl("pulsar+ssl://broker:6651")
    tlsTrustCertsFilePath("/run/secrets/pulsar-ca.pem")
}
```

Both forms create a new resource. The caller must close a directly created client.

## Block-scoped helper

`withPulsarClient` awaits `closeAsync()` from `finally` after the block returns or throws.

```kotlin
val result = withPulsarClient(url) {
    withProducer(Schema.STRING, { topic(topic) }) {
        sendSuspend("event")
    }
}
```

Producer, Consumer, and Reader `with*` functions use the same structure. Do not leak their receiver outside the block; it may already be closed.

## The 1.11.0 close contract

Version 1.11.0 runs `runCatching { closeAsync().awaitSuspending() }` and logs close failures as warnings. A close failure does not replace the block result or original exception.

There is a cancellation limit. This release does not await close in a `NonCancellable` context. Attempting close is not the same guarantee as completing close while the coroutine is cancelled. A later branch's `PulsarCloseSupport` is not part of 1.11.0.

## Application-lifetime clients

In a service, let an application component own one client instead of creating one per request. The client must outlive its producers, consumers, and readers. A typical shutdown stops new work, drains in-flight work, closes child resources, and then closes the client.

`withPulsarClient` fits CLI tools and bounded batches where task and client scopes coincide. A long-running consumer benefits from an explicit owner and shutdown deadline.

## Configuration ownership

Authentication, TLS, connection timeouts, listeners, and memory limits are native `ClientBuilder` options. This module provides no property binding or secret loading. Inject credentials from the application configuration layer and keep URLs and tokens out of logs.

## Sources and tests

- [`PulsarClientSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/PulsarClientSupport.kt)
- [`ProducerSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/producer/ProducerSupport.kt)
- [`ConsumerSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/consumer/ConsumerSupport.kt)
- [`ReaderSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/reader/ReaderSupport.kt)
- [`PulsarClientSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/pulsar/src/test/kotlin/io/bluetape4k/pulsar/PulsarClientSupportTest.kt)
