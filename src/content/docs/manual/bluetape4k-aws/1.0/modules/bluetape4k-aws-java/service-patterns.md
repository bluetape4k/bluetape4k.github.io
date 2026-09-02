---
slug: "manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-java/service-patterns"
title: Service patterns
description: Apply consistent S3, DynamoDB, messaging, KMS, and testing patterns.
manualId: bluetape4k-aws-java
chapterId: service-patterns
manual:
  id: "bluetape4k-aws-java"
  repository: "bluetape4k-aws"
  group: "foundation"
  kind: "library"
  sourceCommit: "632e0f346b807c4d50e3195f7b2b72082def9460"
  sourcePath: "docs/manual/bluetape4k-aws/en/modules/bluetape4k-aws-java/service-patterns.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "632e0f346b807c4d50e3195f7b2b72082def9460"
  sourceDir: "aws-java"
  layer: "build"
  chapterId: "service-patterns"
  chapterOrder: 3
---


The module follows repeatable patterns across services: request builders remove boilerplate, client extensions keep the AWS client explicit, and higher-level helpers encode pagination, batching, or repository rules.

## S3

Small object operations use client extensions. Large or multipart transfers belong to Transfer Manager. A normal move is copy then delete and can leave both objects when deletion fails; use the atomic helper only when rollback-by-delete matches the business requirement.

## DynamoDB

Use enhanced-client schemas and `DynamoDbCoroutineRepository` for typed entities. Batch executors must handle unprocessed keys/items because DynamoDB can return partial success. Query DSL helpers reduce expression mistakes but do not choose indexes or capacity strategy for you.

## SQS and SNS

Long polling reduces empty receives. Delete an SQS message only after successful processing, and choose visibility changes for retry behavior. SNS HTTP parsing is not signature verification; validate the certificate chain, signature, version, and expected topic before acting on a notification.

## KMS and secrets

Keep plaintext in the narrowest scope. Do not put revealed values in data-class strings, structured logs, or exception messages. Retry throttling failures with the application's bounded retry policy, not an infinite helper loop.

## Service SDK policy

`bluetape4k-aws-java` uses service SDKs as `compileOnly`. The consumer imports `bluetape4k-dependencies`, adds this library without a version, and adds only the needed `software.amazon.awssdk:<service>` modules.

## Test progression

1. Unit-test request mapping and failure policy.
2. Run service behavior against Floci.
3. Use LocalStack only for a documented emulator gap.
4. Run a bounded AWS smoke test only when credentials and cleanup authority are explicit.

## Sources

- [DynamoDB repository](https://github.com/bluetape4k/bluetape4k-aws/blob/1.0.0/aws-java/src/main/kotlin/io/bluetape4k/aws/dynamodb/repository/DynamoDbCoroutineRepository.kt)
- [S3 move operations](https://github.com/bluetape4k/bluetape4k-aws/blob/1.0.0/aws-java/src/main/kotlin/io/bluetape4k/aws/s3/S3AsyncClientCoroutinesExtensions.kt)
- [SQS coroutine operations](https://github.com/bluetape4k/bluetape4k-aws/blob/1.0.0/aws-java/src/main/kotlin/io/bluetape4k/aws/sqs/SqsAsyncClientCoroutinesExtensions.kt)
