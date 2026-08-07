---
slug: "manual/bluetape4k-aws/0.5/modules/aws-ktor-sqs-examples"
manualId: "aws-ktor-sqs-examples"
id: "aws-ktor-sqs-examples"
title: "Ktor SQS Workshop"
locale: "en"
kind: "example"
gradlePath: ":aws-ktor-sqs-examples"
sourceDir: "examples/aws-ktor-sqs-examples"
releaseRef: "0.5.0"
artifact: null
manual:
  id: "aws-ktor-sqs-examples"
  repository: "bluetape4k-aws"
  group: "example-messaging"
  kind: "example"
  sourceCommit: "76f9caed95263acef6f6143ded9519264b88c853"
  sourcePath: "docs/manual/en/modules/aws-ktor-sqs-examples.md"
  minorVersion: "0.5"
  releaseRef: "0.5.0"
  releaseCommit: "664e4dfb544a3c19db484b0f9a8e023a73774b49"
  sourceDir: "examples/aws-ktor-sqs-examples"
  layer: "learn"
---


> A runnable workshop grounded in the 0.5.0 release source.

## Learning goal

Build an observable Ktor SQS consumer with explicit acknowledgement, retry-once redelivery, interceptor events, and observer summaries. HTTP routes let the learner publish, inspect, create, and delete queue resources around the consumer.

## When to use this workshop

Use it before running SQS polling in production or when handler success, nack behavior, and shutdown ownership are still implicit.

## Project coordinates

This example is not published. Run `./gradlew :aws-ktor-sqs-examples:test`. Applications use the central BOM, `bluetape4k-aws-ktor`, and `software.amazon.awssdk:sqs`.

## Concepts to learn

`SqsConsumer` runs concurrent long pollers. `deleteOnSuccess = false` exposes manual ack/nack. Messages prefixed `retry-once:` are nacked with zero visibility once, then acknowledged after redelivery. Interceptors and observers reveal phase and outcome.

## Staged walkthrough

1. Create a queue and install the consumer with one handler.
2. Send a normal message and confirm receipt and acknowledgement.
3. Send `retry-once:*` and inspect lifecycle events across both deliveries.
4. Query queue attributes and observer summaries.
5. Stop the application with work in flight and verify bounded draining.

## Entry points and expected behavior

`SqsExampleRoutes.kt` contains plugin setup and routes under `/sqs`. Routes send messages, expose received bodies, lifecycle events and observations, create/delete queues, and read approximate message counts.

## Recommended exercise order

Make acknowledgement and idempotency visible before increasing `coroutines` or `maxMessages`. Prefer native SQS redrive for durable dead-letter behavior and keep handler effects safe under duplicate delivery.

## Integration boundary

The example injects an `SqsAsyncClient`; therefore the application owns and closes it. The plugin owns pollers and handlers and stops them before the host closes transport.

## Configuration checkpoints

Configure queue URL, poller count, maximum messages, long-poll wait, visibility timeout, retry visibility, and shutdown timeout. Production values must fit handler latency and termination budgets.

## Failure modes

Duplicate delivery, too-short visibility, conversion failure, poison messages, handler timeout, and shutdown during processing are expected conditions. An empty queue response is normal, not an error.

## Operations

Measure receive, convert, invoke, ack, and nack phases; track redelivery and oldest-message age. Do not use message bodies or queue URLs as high-cardinality metric tags.

## Testing the boundary

`SqsExampleRoutesFlociTest` creates a random queue on Floci, tests send and attributes, concurrent sends, queue management, manual ack/nack, retry-once redelivery, and telemetry routes.

## Next learning path

Continue to the Spring Boot SQS/SNS workshop for annotations, typed payloads, fanout, and DLQ configuration. Then design business idempotency outside the transport example.

## Limitations

The in-memory received-message store is for inspection only. The workshop does not prove production throughput, native redrive policy behavior, IAM, tracing export, or exactly-once processing.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `0.5.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### aws ktor sqs examples Architecture diagram

[![aws ktor sqs examples Architecture diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-aws/664e4dfb544a3c19db484b0f9a8e023a73774b49/docs/images/readme-diagrams/examples-aws-ktor-sqs-examples-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-aws/blob/664e4dfb544a3c19db484b0f9a8e023a73774b49/docs/images/readme-diagrams/examples-aws-ktor-sqs-examples-architecture-01.svg)

_Release README: [`examples/aws-ktor-sqs-examples/README.md`](https://github.com/bluetape4k/bluetape4k-aws/blob/664e4dfb544a3c19db484b0f9a8e023a73774b49/examples/aws-ktor-sqs-examples/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Consumer and routes](https://github.com/bluetape4k/bluetape4k-aws/blob/0.5.0/examples/aws-ktor-sqs-examples/src/main/kotlin/io/bluetape4k/aws/examples/ktor/sqs/SqsExampleRoutes.kt)
- [Floci integration test](https://github.com/bluetape4k/bluetape4k-aws/blob/0.5.0/examples/aws-ktor-sqs-examples/src/test/kotlin/io/bluetape4k/aws/examples/ktor/sqs/SqsExampleRoutesFlociTest.kt)
- [Example notes](https://github.com/bluetape4k/bluetape4k-aws/blob/0.5.0/examples/aws-ktor-sqs-examples/README.md)
