---
slug: "manual/bluetape4k-aws/0.4/modules/bluetape4k-aws-spring-boot/storage-and-messaging"
title: Storage and messaging
description: Operate S3, DynamoDB, SQS, SNS, and SES with explicit delivery semantics.
manualId: bluetape4k-aws-spring-boot
chapterId: storage-and-messaging
manual:
  id: "bluetape4k-aws-spring-boot"
  repository: "bluetape4k-aws"
  group: "framework"
  kind: "library"
  sourceCommit: "cf9f7a4ed610f85b4af440bcdabedcab55f47bd1"
  sourcePath: "docs/manual/en/modules/bluetape4k-aws-spring-boot/storage-and-messaging.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "be4e6daea5654f84579955307ec56a58c8f405be"
  sourceDir: "aws-spring-boot"
  layer: "build"
  chapterId: "storage-and-messaging"
---


Spring-facing operations wrap AWS async clients with suspend APIs and framework lifecycle. They do not remove the service's delivery and consistency rules.

## S3 paths

Use `S3Operations` for common object work and presigned URLs. Use `S3TransferOperations` for large or multipart transfers; it activates only when Transfer Manager is present. Treat copy-then-delete moves and presigned URL expiry as explicit application decisions.

## DynamoDB repositories

`AbstractCoroutinesDynamoDbRepository` provides typed enhanced-client access. Resolve table names through `DynamoDbTableNameResolver` so environment naming stays outside entity code. Batch and query operations still need pagination, unprocessed-item, index, and capacity handling.

## SQS listeners

```kotlin
@SqsListener(
    queue = "${orders.queue-url}",
    maxMessages = 10,
    waitTimeSeconds = 20,
    visibilityTimeoutSeconds = 60,
)
suspend fun receive(order: OrderMessage) {
    orderService.process(order)
}
```

Successful completion acknowledges according to the configured policy. On failure, visibility and redelivery rules decide the next attempt. Set processing timeout below visibility or enable an extension/heartbeat strategy.

## SNS and SES

SNS publish helpers and HTTP parsing are separate concerns. Verify SNS signatures before processing callbacks. SES senders expose coroutine and JavaMail-style adapters; do not retry non-idempotent sends blindly.

## Test what can fail

Test serialization, queue lookup, redelivery, duplicate delivery, DLQ behavior, S3 pagination, multipart cancellation, and DynamoDB partial batch success. A successful send-only test is insufficient.

## Sources

- [S3 operations](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-spring-boot/src/main/kotlin/io/bluetape4k/aws/spring/s3/S3Operations.kt)
- [SQS listener annotation](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-spring-boot/src/main/kotlin/io/bluetape4k/aws/spring/sqs/SqsListener.kt)
- [DynamoDB repository](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-spring-boot/src/main/kotlin/io/bluetape4k/aws/spring/dynamodb/AbstractCoroutinesDynamoDbRepository.kt)
