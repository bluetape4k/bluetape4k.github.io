---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-kafka"
manualId: bluetape4k-kafka
title: "Module bluetape4k-kafka"
description: "A utility library for using Apache Kafka efficiently in a Kotlin environment. Provides extension functions and wrapper classes for Kafka clients, Spring Kafka, and Kafka Streams with Kotlin Coroutines support."
kind: library
group: infrastructure
manual:
  id: "bluetape4k-kafka"
  repository: "bluetape4k-projects"
  group: "infrastructure"
  kind: "library"
  sourceCommit: "d42c9dcf3dfa8f169b3bda9c56d3c8531b3ff296"
  sourcePath: "docs/manual/en/modules/bluetape4k-kafka.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/kafka"
  layer: "build"
---


## Problem

A utility library for using Apache Kafka efficiently in a Kotlin environment. Provides extension functions and wrapper classes for Kafka clients, Spring Kafka, and Kafka Streams with Kotlin Coroutines support. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-kafka` when the application needs client lifecycle, reconnect policy, backpressure, retries, and observability. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-kafka")
}
```

Gradle project path: `:bluetape4k-kafka`. Source directory: `infra/kafka`.

## Concepts

The first source-level concepts to inspect are `ConsumerSupport`, `ProducerSupport`, `TopicPartitionSupport`, `BinaryKafkaCodecs`, `ByteArrayKafkaCodec`, `JacksonKafkaCodec`, `KafkaCodec`, and `KafkaCodecs`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`ConsumerSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/ConsumerSupport.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`ConsumerSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/ConsumerSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ProducerSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/ProducerSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TopicPartitionSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/TopicPartitionSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`BinaryKafkaCodecs`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/codec/BinaryKafkaCodecs.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ByteArrayKafkaCodec`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/codec/ByteArrayKafkaCodec.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JacksonKafkaCodec`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/codec/JacksonKafkaCodec.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`KafkaCodec`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/codec/KafkaCodec.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`KafkaCodecs`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/codec/KafkaCodecs.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`StringKafkaCodec`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/codec/StringKafkaCodec.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ProducerCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/coroutines/ProducerCoroutines.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Features**, **Architecture Diagrams**, **Kafka API Structure**, **Producer/Consumer Message Flow**, **Kafka Streams Processing Flow**, **Installation**, **Gradle (Kotlin DSL)**, **Gradle (Groovy DSL)**, **Maven**, and **Dependencies**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
api(project(":bluetape4k-annotations"))
api(project(":bluetape4k-core"))
api(project(":bluetape4k-io"))
compileOnly(project(":bluetape4k-resilience4j"))
api(libs.kafka.clients)
compileOnly(libs.kafka.streams)
compileOnly(libs.kafka.generator)
implementation(libs.spring.kafka)
compileOnly(libs.spring.kafka.test)
implementation(project(":bluetape4k-spring-boot-core"))
implementation("org.springframework.data:spring-data-commons")
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track connection state, queue depth, retries, timeouts, remote errors, and graceful shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-kafka:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractKafkaTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/test/kotlin/io/bluetape4k/kafka/AbstractKafkaTest.kt)
- [`ConsumerSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/test/kotlin/io/bluetape4k/kafka/ConsumerSupportTest.kt)
- [`ProducerSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/test/kotlin/io/bluetape4k/kafka/ProducerSupportTest.kt)
- [`TopicPartitionSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/test/kotlin/io/bluetape4k/kafka/TopicPartitionSupportTest.kt)
- [`AbstractKafkaCodecPoisonPillTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/test/kotlin/io/bluetape4k/kafka/codec/AbstractKafkaCodecPoisonPillTest.kt)
- [`AbstractKafkaCodecTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/test/kotlin/io/bluetape4k/kafka/codec/AbstractKafkaCodecTest.kt)
- [`ByteArrayKafkaCodecTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/test/kotlin/io/bluetape4k/kafka/codec/ByteArrayKafkaCodecTest.kt)
- [`JacksonKafkaCodecSecurityTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/test/kotlin/io/bluetape4k/kafka/codec/JacksonKafkaCodecSecurityTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/build.gradle.kts)
- [`ConsumerSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/ConsumerSupport.kt)
- [`ProducerSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/ProducerSupport.kt)
- [`TopicPartitionSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/TopicPartitionSupport.kt)
- [`BinaryKafkaCodecs`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/codec/BinaryKafkaCodecs.kt)
- [`ByteArrayKafkaCodec`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/codec/ByteArrayKafkaCodec.kt)
- [`JacksonKafkaCodec`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/codec/JacksonKafkaCodec.kt)
- [`KafkaCodec`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/codec/KafkaCodec.kt)
- [`KafkaCodecs`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/codec/KafkaCodecs.kt)
- [`StringKafkaCodec`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/codec/StringKafkaCodec.kt)
- [`ProducerCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/main/kotlin/io/bluetape4k/kafka/coroutines/ProducerCoroutines.kt)
- [`AbstractKafkaTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/test/kotlin/io/bluetape4k/kafka/AbstractKafkaTest.kt)
- [`ConsumerSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/kafka/src/test/kotlin/io/bluetape4k/kafka/ConsumerSupportTest.kt)
