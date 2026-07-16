---
slug: "manual/bluetape4k-aws/0.4/modules/aws-spring-boot-s3-examples"
manualId: "aws-spring-boot-s3-examples"
id: "aws-spring-boot-s3-examples"
title: "Spring Boot S3 Workshop"
locale: "en"
kind: "example"
gradlePath: ":aws-spring-boot-s3-examples"
sourceDir: "examples/aws-spring-boot-s3-examples"
releaseRef: "0.4.0"
artifact: null
manual:
  id: "aws-spring-boot-s3-examples"
  repository: "bluetape4k-aws"
  group: "example-s3"
  kind: "example"
  sourceCommit: "a64a49d44060154ec4371de9f7818168b75a6a67"
  sourcePath: "docs/manual/en/modules/aws-spring-boot-s3-examples.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "be4e6daea5654f84579955307ec56a58c8f405be"
  sourceDir: "examples/aws-spring-boot-s3-examples"
  layer: "learn"
---


> A runnable workshop grounded in the 0.4.0 release source.

## Learning goal

Expose S3 object operations through a small Spring Boot WebFlux controller while auto-configured operations own SDK details. The workshop adds listing, deletion, presigning, and optional client-side encryption to a basic upload/download path.

## When to use this workshop

Use it when a Spring service needs S3 templates, presigned URLs, or envelope encryption and must understand which SDK modules and beans activate each feature.

## Project coordinates

This example is not published. Run `./gradlew :aws-spring-boot-s3-examples:test`. Applications import the central BOM, `bluetape4k-aws-spring-boot`, and `software.amazon.awssdk:s3`; encrypted routes also need KMS support.

## Concepts to learn

`S3DocumentController` delegates to `S3Operations`/`S3CoroutinesTemplate`. Optional `S3ClientSideEncryptionOperations` stores encrypted data with envelope metadata. Auto-configuration creates and closes service clients.

## Staged walkthrough

1. Upload and download one object.
2. List by prefix and delete the object.
3. Generate presigned GET and PUT URLs and inspect their expiry.
4. Enable the encrypted route with a deterministic test KMS implementation.
5. Run AOT tasks after changing configuration or controller types.

## Entry points and expected behavior

`SpringBootS3ExampleApplication` starts the service and `S3DocumentController` exposes `/s3/documents`. It supports plain/encrypted upload and download, object listing, presigned URLs, and delete.

## Recommended exercise order

Keep bucket/key validation at the HTTP boundary and stream payloads when size is unbounded. Separate object naming, retention, encryption context, and authorization from the transport helper.

## Integration boundary

Spring creates the S3 client, presigner, templates, and optional encryption operations when their classes and properties are present. The controller does not own or close them.

## Configuration checkpoints

Set region and optional endpoint override/path-style access for emulators. Configure presign duration. Encryption needs a key ID, stable encryption context, `KmsOperations`, and the AWS KMS runtime module.

## Failure modes

Missing bucket, wrong addressing style, expired presigned URL, partial upload, absent KMS bean, mismatched encryption context, and oversized buffering are likely failures.

## Operations

Measure latency, bytes, failures, retries, and presign counts without logging object content or signed query strings. Define multipart, retention, versioning, and partial-failure policy outside the controller.

## Testing the boundary

`S3DocumentControllerLocalStackTest` selects the emulator, creates a bucket, and verifies upload, download, listing, presigned URLs, delete, and encryption using a deterministic KMS test double.

## Next learning path

Compare the Ktor S3 workshop for direct SigV4 HTTP behavior, then add service-specific IAM, large-object transfer, and real KMS smoke tests.

## Limitations

The deterministic KMS helper does not prove AWS KMS permissions or ciphertext behavior. The example does not benchmark large transfers, multipart recovery, versioned deletion, or bucket policy.

## Sources

- [S3 controller](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-spring-boot-s3-examples/src/main/kotlin/io/bluetape4k/aws/examples/spring/s3/S3DocumentController.kt)
- [Application entry point](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-spring-boot-s3-examples/src/main/kotlin/io/bluetape4k/aws/examples/spring/s3/SpringBootS3ExampleApplication.kt)
- [Emulator integration test](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-spring-boot-s3-examples/src/test/kotlin/io/bluetape4k/aws/examples/spring/s3/S3DocumentControllerLocalStackTest.kt)
