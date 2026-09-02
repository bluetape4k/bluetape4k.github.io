---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-pulsar"
manualId: bluetape4k-pulsar
title: "Apache Pulsar Client Extensions"
description: "Use Apache Pulsar Java Client with Kotlin DSLs, suspending operations, Flow, and Jackson 2 or 3 JSON schemas while respecting the 2.0.0 lifecycle boundaries."
kind: library
group: messaging
learningOrder: 740
manual:
  id: "bluetape4k-pulsar"
  repository: "bluetape4k-projects"
  group: "messaging"
  kind: "library"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-pulsar.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "infra/pulsar"
  layer: "build"
  learningOrder: 740
---


## Provided capabilities

`bluetape4k-pulsar` adds Kotlin conveniences to Apache Pulsar Java Client. It configures client, producer, consumer, and reader builders with receiver DSLs; awaits `CompletableFuture` operations from suspending functions; and connects repeated send, receive, and read operations to `Flow`. Optional JSON `Schema<T>` implementations support Jackson 2 and Jackson 3.

The module does not administer brokers, topics, subscriptions, or a schema registry. Pulsar Client still owns reconnects, batching, compression, routing, receiver queues, and the broker protocol. This manual separates the thin bluetape4k layer in 2.0.0 from responsibilities that remain with the application and Pulsar.

## Decisions before adoption

- Decide whether one client lives with the application or a short task creates and closes it.
- Choose Producer, Consumer, or Reader according to message semantics. Reader has no subscription or acknowledgement.
- Define the Consumer subscription type and individual or cumulative acknowledgement policy.
- Choose Jackson 2 or Jackson 3 and keep producer and consumer JSON and schema settings aligned.
- Do not assume that the Flow adapters provide parallel sends or automatic acknowledgements.
- If cleanup must complete during cancellation, compensate for the 2.0.0 cleanup limitation in application shutdown code.

## Dependency

Consumers manage only the central BOM version, not individual Pulsar or Jackson versions.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-pulsar")

    // Add only the JSON generation that the application uses.
    implementation("io.github.bluetape4k:bluetape4k-jackson2")
    // implementation("io.github.bluetape4k:bluetape4k-jackson3")
}
```

Gradle project path: `:bluetape4k-pulsar`. Source directory: `infra/pulsar`. The Jackson integrations are `compileOnly`, so the consuming application must provide the selected runtime dependency.

## First client and message

```kotlin
withPulsarClient("pulsar://localhost:6650") {
    withProducer(Schema.STRING, { topic("persistent://public/default/orders") }) {
        val messageId = sendSuspend {
            value("order-1")
            key("order-1")
        }
    }
}
```

`withPulsarClient` and `withProducer` call `closeAsync()` when their blocks finish. In 2.0.0, close failures are logged and swallowed, and close is not wrapped in a `NonCancellable` context. These functions are convenient scope helpers, not a strong shutdown guarantee.

## API map

| Task | Start with | Boundary to remember |
| --- | --- | --- |
| Create a client | `pulsarClient`, `withPulsarClient` | Supply a URL argument or call `serviceUrl` in setup. |
| Create a producer and send | `producer`, `withProducer`, `sendSuspend` | Pulsar Client defines builder and send semantics. |
| Send a `Flow<T>` | `sendAsFlow` | It awaits one message at a time; it is not parallel. |
| Create a consumer and receive | `consumer`, `withConsumer`, `receiveSuspend` | The caller selects subscription name and type. |
| Receive continuously and ack | `receiveAsFlow`, `acknowledgeSuspend` | Flow neither acknowledges automatically nor owns the Consumer. |
| Acknowledge cumulatively | `acknowledgeCumulativeSuspend` | It is invalid for Shared subscriptions. |
| Read without a subscription | `reader`, `withReader`, `readNextSuspend` | Select a start position; no ack is involved. |
| Drain currently available messages | `readAsFlow` | This finite Flow ends when `hasMessageAvailable()` is false. |
| Encode JSON payloads | `jacksonSchema`, `jackson3Schema` | Align mapper generation and settings on both sides. |

## Learning path

The six chapters follow the 2.0.0 release source and tests from client ownership through wire contracts, message processing, and operational limits. Each chapter combines working API compositions with explicit non-goals and failure or cancellation checks.

1. [Client configuration and lifecycle](/manual/bluetape4k-projects/2.0/modules/bluetape4k-pulsar/client-lifecycle-configuration/) — URL and builder configuration, direct ownership, block scopes, and the 2.0.0 cleanup limit.
2. [Jackson 2 and 3 schemas and wire compatibility](/manual/bluetape4k-projects/2.0/modules/bluetape4k-pulsar/jackson-schemas-wire-compatibility/) — `SchemaInfo`, mapper choice, runtime dependencies, and cross-generation verification.
3. [Producers and coroutine sends](/manual/bluetape4k-projects/2.0/modules/bluetape4k-pulsar/producers-coroutine-send/) — direct, message-DSL, and sequential Flow sends with failure boundaries.
4. [Consumers, Flow, and acknowledgements](/manual/bluetape4k-projects/2.0/modules/bluetape4k-pulsar/consumers-flow-acknowledgement/) — an unbounded receive Flow, individual and cumulative ack, and subscription types.
5. [Readers and positions](/manual/bluetape4k-projects/2.0/modules/bluetape4k-pulsar/readers-and-positions/) — subscription-free reads, `MessageId`, and finite draining behavior.
6. [Cancellation, failures, testing, and operations](/manual/bluetape4k-projects/2.0/modules/bluetape4k-pulsar/cancellation-failures-testing-operations/) — future cancellation, close limitations, Testcontainers evidence, and observability.

For a first integration, follow 1→3→4 and complete one topic's send-and-receive path. Add chapter 2 for domain payloads and chapter 5 for replay or inspection tools.

## Recommended patterns

`PulsarClient` owns connections and threads, so do not create one per message. Let the application own a shared client and reuse producers and consumers for the lifetime of their processing components. The `with*` helpers fit bounded batch and tool operations with clear scopes.

Acknowledge a Consumer message only after application processing succeeds. Treat the crash window between processing and ack, redelivery, and idempotency as application contracts. Use `sendAsFlow` for ordered sequential sends. To raise throughput, configure Pulsar batching and design bounded coroutine concurrency separately.

## Integrations

The module exposes `pulsar-client` as an `api` dependency, so native builders, options, and types remain available. Its base integration edge consists of `bluetape4k-core`, `bluetape4k-coroutines`, and coroutine core.

Jackson 2 and Jackson 3 support is optional. Both implementations derive Pulsar JSON schema metadata, while their respective `ObjectMapper` writes the payload bytes. Naming strategies, modules, date handling, and number settings can produce different wire JSON for the same Kotlin class. Verify compatibility with cross-producer and cross-consumer tests.

## Configuration

The module has no dedicated properties or resources. Configure endpoints, authentication, TLS, timeouts, and connections on `ClientBuilder`; topic, batching, and compression on `ProducerBuilder`; subscription, receiver queue, and ack timeout on `ConsumerBuilder`; and positions on `ReaderBuilder`.

```kotlin
val client = pulsarClient {
    serviceUrl("pulsar+ssl://broker:6651")
    tlsTrustCertsFilePath("/run/secrets/pulsar-ca.pem")
}
```

Calling `pulsarClient()` with an empty URL and omitting `serviceUrl` from setup fails in `build()`. Do not log credentials or tokens.

## Failures

Client creation, send, receive, ack, and read failures propagate as Pulsar Client exceptions. The helpers add no retry, dead-letter routing, transaction, or domain-exception translation. `sendAsFlow`, `receiveAsFlow`, and `readAsFlow` terminate when their upstream or Pulsar operation fails.

When a repeated Flow receives `CancellationException` while awaiting a future, it calls `future.cancel(true)` and rethrows cancellation. This does not roll back a send already accepted by the broker or prove that server-side work stopped. Block-scoped close logs failures instead of returning them to the caller, so shutdown code should observe close state and enforce its own timeout.

## Operations

Observe client connections, producer send latency and pending queues, consumer backlog, redelivery, unacknowledged counts, ack failures, and reader lag. Use bounded topic and subscription dimensions for metrics; do not use message keys or unbounded tenant identifiers as labels.

Design retries together with handler idempotency. During shutdown, stop accepting new sends and receives, wait for in-flight work within a deadline, then close producers, consumers, readers, and the client. The 2.0.0 `with*` helpers alone do not guarantee cleanup completion under cancellation.

## Testing

Release tests use `AbstractPulsarTest`, which starts a `PulsarContainer`. They verify client, producer, consumer, reader, and broker round trips, so run this suite sequentially with other Testcontainers suites.

```bash
./gradlew :bluetape4k-pulsar:test --no-configuration-cache
```

Schema encode/decode and clone behavior are useful server-free contracts. In application tests, separate mapper-specific round-trip unit tests from broker integration tests for schema compatibility, redelivery, and subscription types.

## Workshops

No dedicated workshop is registered in the manual manifest. The release tests serve as small executable examples: direct, DSL, and Flow sends in `ProducerExtensionsTest`; individual and cumulative acknowledgements plus Shared rejection in `ConsumerExtensionsTest`; and earliest or latest reads in `ReaderExtensionsTest`.

Before turning these examples into an operational template, add authentication and TLS, schema evolution, idempotent handling, redelivery, and graceful shutdown tests. `AbstractPulsarTest` is a test fixture, not a published API.

## 2.0.0 scope

This manual targets release commit `8165a8989e0075e7c17c489bf3000bf41fef8232`. A later branch adds `PulsarCloseSupport` and tests for cleanup during cancellation; neither is part of 2.0.0.

Version 2.0.0 does not provide admin APIs, topic or tenant provisioning, schema migration, transaction orchestration, retry or dead-letter policy, health indicators, or metrics exporters. Its `with*` close operation does not run in a non-cancellable context and does not rethrow close failures.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `2.0.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### pulsar Class Structure diagram

[![pulsar Class Structure diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-projects/8165a8989e0075e7c17c489bf3000bf41fef8232/docs/images/readme-diagrams/infra-pulsar-diagram-01.png)](https://github.com/bluetape4k/bluetape4k-projects/blob/8165a8989e0075e7c17c489bf3000bf41fef8232/docs/images/readme-diagrams/infra-pulsar-diagram-01.svg)

_Release README: [`infra/pulsar/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/8165a8989e0075e7c17c489bf3000bf41fef8232/infra/pulsar/README.md)_

<!-- release-readme-diagrams:end -->

## Sources and tests

- [`build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/infra/pulsar/build.gradle.kts)
- [`PulsarClientSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/PulsarClientSupport.kt)
- [`JacksonSchema.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/codec/JacksonSchema.kt)
- [`Jackson3Schema.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/codec/Jackson3Schema.kt)
- [`ProducerExtensions.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/producer/ProducerExtensions.kt)
- [`ConsumerExtensions.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/consumer/ConsumerExtensions.kt)
- [`ReaderExtensions.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/reader/ReaderExtensions.kt)
- [`PulsarClientSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/infra/pulsar/src/test/kotlin/io/bluetape4k/pulsar/PulsarClientSupportTest.kt)
- [`ProducerExtensionsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/infra/pulsar/src/test/kotlin/io/bluetape4k/pulsar/producer/ProducerExtensionsTest.kt)
- [`ConsumerExtensionsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/infra/pulsar/src/test/kotlin/io/bluetape4k/pulsar/consumer/ConsumerExtensionsTest.kt)
- [`ReaderExtensionsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/infra/pulsar/src/test/kotlin/io/bluetape4k/pulsar/reader/ReaderExtensionsTest.kt)
