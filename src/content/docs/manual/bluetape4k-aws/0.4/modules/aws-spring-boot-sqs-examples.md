---
slug: "manual/bluetape4k-aws/0.4/modules/aws-spring-boot-sqs-examples"
manualId: "aws-spring-boot-sqs-examples"
id: "aws-spring-boot-sqs-examples"
title: "Spring Boot SQS and SNS Workshop"
locale: "en"
kind: "example"
gradlePath: ":aws-spring-boot-sqs-examples"
sourceDir: "examples/aws-spring-boot-sqs-examples"
releaseRef: "0.4.0"
artifact: null
manual:
  id: "aws-spring-boot-sqs-examples"
  repository: "bluetape4k-aws"
  group: "example-messaging"
  kind: "example"
  sourceCommit: "6b25d4663a87099fc94ced293eb7ca024420edc7"
  sourcePath: "docs/manual/en/modules/aws-spring-boot-sqs-examples.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "be4e6daea5654f84579955307ec56a58c8f405be"
  sourceDir: "examples/aws-spring-boot-sqs-examples"
  layer: "learn"
---


> A runnable workshop grounded in the 0.4.0 release source.

## Learning goal

Build a Spring Boot 4 messaging path with REST publishing, `@SqsListener`, typed conversion, manual acknowledgement, retry/backoff, interceptor events, SNS-to-SQS fanout, and DLQ redrive setup.

## When to use this workshop

Use it before operating annotation-driven SQS listeners or when fanout, redrive, and duplicate-safe handler behavior need one executable reference.

## Project coordinates

This example is not published. Run `./gradlew :aws-spring-boot-sqs-examples:test`. Applications import the central BOM, `bluetape4k-aws-spring-boot`, and the Java SDK SQS/SNS service modules.

## Concepts to learn

The controller stays thin. `SqsSnsExampleService` owns queue URLs, policies, subscriptions, and redrive attributes. Listeners demonstrate plain messages, typed `OrderPayload`, manual ack, one in-process retry, and interceptor events.

## Staged walkthrough

1. Create a queue and publish one plain message.
2. Confirm the listener store and interceptor events.
3. Send typed JSON and follow manual acknowledgement.
4. Trigger retry-once behavior and inspect both attempts.
5. Create SNS fanout, publish, then configure a source queue and DLQ.

## Entry points and expected behavior

`SpringBootSqsExampleApplication` starts the service. `SqsSnsExampleController` exposes queue creation, send/receive, fanout, SNS publish, DLQ setup, and listener inspection under `/spring/sqs`.

## Recommended exercise order

Make acknowledgement and business idempotency explicit before increasing concurrency. Prefer SQS redrive policy for durable poison-message handling; use in-process retry only for bounded transient failures.

## Integration boundary

Spring auto-configuration owns clients and listener containers. The service owns AWS resource relationships, while `ReceivedOrderStore` is only an in-memory teaching aid.

## Configuration checkpoints

Configure SQS/SNS region and endpoint, listener queue names, poll limits, retry settings, and manual acknowledgement. Production also needs queue policy, redrive policy, visibility, retention, and shutdown budgets.

## Failure modes

Duplicate delivery, invalid JSON, missing queue URLs, insufficient SNS-to-SQS policy, visibility expiry, poison messages, and listener shutdown during work are expected failure paths.

## Operations

Track receive age, delivery count, retry, ack/nack, DLQ depth, and listener phase latency. Keep message bodies and queue URLs out of metric tags and close containers before clients.

## Testing the boundary

`SqsSnsExampleLocalStackTest` supports Floci-first and explicit LocalStack fallback. It verifies queues, listeners, typed/manual ack, retry, events, fanout policy/subscription, publish, and DLQ redrive attributes.

## Next learning path

Compare the Ktor SQS workshop for explicit runtime and observer hooks, then design durable idempotency and failure recovery around the business handler.

## Limitations

The in-memory stores do not survive restart. Emulator success does not prove IAM, production redrive timing, high concurrency, ordering, exactly-once processing, or cross-account fanout.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `0.4.0` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### aws spring boot sqs examples Architecture diagram

[![aws spring boot sqs examples Architecture diagram](/manual-assets/bluetape4k-aws/0.4/readme-diagrams/examples-aws-spring-boot-sqs-examples-architecture-01.png)](../../assets/readme-diagrams/examples-aws-spring-boot-sqs-examples-architecture-01.svg)

_Release README: [`examples/aws-spring-boot-sqs-examples/README.md`](https://github.com/bluetape4k/bluetape4k-aws/blob/be4e6daea5654f84579955307ec56a58c8f405be/examples/aws-spring-boot-sqs-examples/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Controller](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-spring-boot-sqs-examples/src/main/kotlin/io/bluetape4k/aws/examples/spring/sqs/SqsSnsExampleController.kt)
- [Resource-owning service](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-spring-boot-sqs-examples/src/main/kotlin/io/bluetape4k/aws/examples/spring/sqs/SqsSnsExampleService.kt)
- [SQS/SNS integration test](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-spring-boot-sqs-examples/src/test/kotlin/io/bluetape4k/aws/examples/spring/sqs/SqsSnsExampleLocalStackTest.kt)
