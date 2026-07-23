---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-kafka/spring-kafka-templates-listeners"
title: Spring Kafka templates and listener adapters
description: Distinguishes KafkaOperations await extensions, Reactor Kafka suspend templates, consumer offsets/transactions, and listener utilities.
manualId: bluetape4k-kafka
chapterId: spring-kafka-templates-listeners
manual:
  id: "modules/bluetape4k-kafka/spring-kafka-templates-listeners"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "3a97a3fc2f3525c3a3384d511a9adb8571b0b680"
  sourcePath: "docs/manual/en/modules/bluetape4k-kafka/spring-kafka-templates-listeners.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "docs/manual"
  layer: "build"
---


## Three send entry points

The module contains three similarly named layers:

| API | Base | Result |
| --- | --- | --- |
| `io.bluetape4k.kafka.spring.suspendSend` | Spring `KafkaOperations.send(...).await()` | `SendResult` |
| `io.bluetape4k.kafka.spring.core.suspendSend` | `KafkaOperations.execute` and producer callback | `SendResult` |
| `SuspendKafkaProducerTemplate` | Reactor Kafka `KafkaSender` | `SenderResult` or `Flow` |

For an existing `KafkaTemplate` bean, the first extension is the smallest adapter.

```kotlin
val result = kafkaTemplate.suspendSend("orders", order.id, order)
```

In 1.11.0, the `spring.core` Flow helper uses `onCompletion { flush() }`, so flush may run on normal completion, failure, or cancellation. Use individual sends or the native coroutine helper when that behavior is unwanted.

## Reactor Kafka producer template

`SuspendKafkaProducerTemplate` accepts application-owned `SenderOptions` or `KafkaSender`. It sends one record, a `Flow<SenderRecord>`, Spring `Message`s, and transactional records.

```kotlin
val template = SuspendKafkaProducerTemplate(senderOptions)
try {
    template.send("orders", order.id, order)
} finally {
    template.close()
}
```

Message conversion throws a clear `IllegalArgumentException` if the converter does not return `ProducerRecord`, and copies the correlation-id header. Close cancels the internal scope and closes the sender; sender close failures are logged and swallowed.

## Reactor Kafka consumer template

`SuspendKafkaConsumerTemplate` exposes `receive`, `receiveAutoAck`, `receiveExactlyOnce`, and suspend wrappers for subscribe, assign, seek, commit, pause, and metrics.

```kotlin
template.receive().collect { record ->
    handle(record.value())
    record.receiverOffset().acknowledge()
}
```

`receiveAutoAck` concatenates batch publishers. Read Reactor Kafka settings and API contracts for the exact acknowledgment timing. In manual processing, acknowledge only successfully handled records.

## Exactly once and offsets

`receiveExactlyOnce(transactionManager)` returns an inner `Flow` per transaction. The module does not commit business processing automatically. The caller commits after each batch or aborts on failure before the next batch can proceed.

`commitCurrentOffsets` builds `OffsetAndMetadata` from current positions and calls `commitSync`. It rejects partitions outside the current assignment. Values returned by `committed` and `offsetsForTimes` are nullable because Kafka can return null entries.

## 1.11.0 close boundary

Consumer-template close cancels its scope and closes the receiver only when it implements `AutoCloseable`. A non-closeable receiver produces no warning, and a close failure propagates. Warnings and close-failure suppression on the development branch are post-1.11.0 behavior.

## Listener adapters do not create containers

`listenerTypeOf`, `stoppableSleep`, `createOffsetAndMetadata`, and `consumerRecordMetadataOf` delegate to Spring Kafka utilities. They do not configure `@KafkaListener`, container factories, error handlers, or retry topics.

## Sources and tests

- [`KafkaOperationsExtensions.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/spring/KafkaOperationsExtensions.kt)
- [`KafkaOperationExtensions.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/spring/core/KafkaOperationExtensions.kt)
- [`SuspendKafkaProducerTemplate.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/spring/core/SuspendKafkaProducerTemplate.kt)
- [`SuspendKafkaConsumerTemplate.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/spring/core/SuspendKafkaConsumerTemplate.kt)
- [`SuspendKafkaConsumerTemplateTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/test/kotlin/io/bluetape4k/kafka/spring/core/SuspendKafkaConsumerTemplateTest.kt)
- [`ListenerUtilsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/test/kotlin/io/bluetape4k/kafka/spring/listener/ListenerUtilsTest.kt)
