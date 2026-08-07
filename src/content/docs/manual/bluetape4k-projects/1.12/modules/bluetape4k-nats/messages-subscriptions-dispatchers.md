---
slug: "manual/bluetape4k-projects/1.12/modules/bluetape4k-nats/messages-subscriptions-dispatchers"
title: Messages, subscriptions, and dispatchers
description: Build NatsMessage values, choose blocking Subscription pulls or Dispatcher callbacks, and define shutdown ordering.
manualId: bluetape4k-nats
chapterId: messages-subscriptions-dispatchers
manual:
  id: "modules/bluetape4k-nats/messages-subscriptions-dispatchers"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "ffde7b8be16124b1c538bb318a7d482927f738ad"
  sourcePath: "docs/manual/en/modules/bluetape4k-nats/messages-subscriptions-dispatchers.md"
  minorVersion: "1.12"
  releaseRef: "1.12.1"
  releaseCommit: "7cf0b73646af05c0f8872cc4f6a16983949c4e3e"
  sourceDir: "docs/manual"
  layer: "build"
---


## Build a message explicitly

`natsMessageOf` assembles a jNATS `NatsMessage` from a subject, payload, reply-to subject, and headers. A blank subject fails; a `null` payload is allowed.

```kotlin
val message = natsMessageOf(
    subject = "documents.convert",
    data = requestBytes,
    replyTo = "documents.convert.reply",
    headers = Headers().apply {
        add("Content-Type", "application/json")
    },
)

connection.publish(message)
```

The builder does not enforce duplicate-header, payload-schema, or serializer rules. Publishers and consumers sharing a subject need a separate contract for encoding, schema evolution, and maximum size.

## Blocking subscriptions

`Connection.subscribe(subject)` returns a `Subscription`. The Kotlin `nextMessage(timeout)` extension rejects negative durations and returns `null` when no message arrives before the deadline.

```kotlin
val subscription = connection.subscribe("audit.created")
while (running) {
    val message = subscription.nextMessage(500.milliseconds) ?: continue
    handle(message)
}
subscription.unsubscribe()
```

This call blocks its current thread. A loop on a coroutine dispatcher can occupy a worker indefinitely. Use callback dispatch or place the blocking loop on an explicitly owned IO execution context.

## Dispatcher callbacks

`createDispatcher` asks jNATS to invoke callbacks for subscriptions.

```kotlin
val dispatcher = connection.createDispatcher()
dispatcher.subscribe("orders.*") { message ->
    handleOrderEvent(message)
}
```

Long blocking handlers can delay later messages on the same dispatcher. Check the jNATS dispatcher threading and serialization settings. If a callback launches coroutines, define the scope owner, concurrency bound, and shutdown join behavior.

## Unsubscribe and drain

Unsubscribe a subscription or dispatcher subject to stop accepting new messages. Unsubscribe does not cancel arbitrary work already started by a callback. A typical shutdown order is:

1. remove readiness and stop new external requests;
2. stop new subscription or dispatcher deliveries;
3. await in-flight handler work;
4. drain consumers and the connection;
5. close the connection.

`Consumer.drainSuspending` awaits the jNATS consumer drain future, but it cannot discover unrelated child jobs created by a handler.

## Slow consumers and backpressure

When core publish rate exceeds application processing, pending messages and memory pressure grow. Launching unbounded coroutines in a callback only transfers pressure from the jNATS queue to the application heap and downstream services.

Set maximum processing concurrency, pending limits, and drop or disconnect policy, then record slow-consumer events. Use a JetStream consumer with acknowledgments and redelivery for messages that must be processed.

## Sources and tests

- [`NatsMessage.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/NatsMessage.kt)
- [`SubscriptionExtensions.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/SubscriptionExtensions.kt)
- [`Consumer.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/Consumer.kt)
- [`NatsMessageTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/infra/nats/src/test/kotlin/io/bluetape4k/nats/client/NatsMessageTest.kt)
- [`SubscriptionExtensionsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/infra/nats/src/test/kotlin/io/bluetape4k/nats/client/SubscriptionExtensionsTest.kt)
- [`SimplePublishExample.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/infra/nats/src/test/kotlin/io/bluetape4k/nats/SimplePublishExample.kt)

The 1.12.1 module does not provide a `Flow<Message>` adapter or a bounded worker pool. The application chooses the processing and backpressure model.
