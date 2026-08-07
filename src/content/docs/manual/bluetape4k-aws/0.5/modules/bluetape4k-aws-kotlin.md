---
slug: "manual/bluetape4k-aws/0.5/modules/bluetape4k-aws-kotlin"
manualId: "bluetape4k-aws-kotlin"
id: "bluetape4k-aws-kotlin"
title: "AWS SDK for Kotlin Extensions"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-aws-kotlin"
sourceDir: "aws-kotlin"
releaseRef: "0.5.0"
artifact: io.github.bluetape4k.aws:bluetape4k-aws-kotlin
manual:
  id: "bluetape4k-aws-kotlin"
  repository: "bluetape4k-aws"
  group: "foundation"
  kind: "library"
  sourceCommit: "76f9caed95263acef6f6143ded9519264b88c853"
  sourcePath: "docs/manual/en/modules/bluetape4k-aws-kotlin.md"
  minorVersion: "0.5"
  releaseRef: "0.5.0"
  releaseCommit: "664e4dfb544a3c19db484b0f9a8e023a73774b49"
  sourceDir: "aws-kotlin"
  layer: "build"
---


> Library manual grounded in the 0.5.0 release source.

## Problem

Builders, model conversions, Flow helpers, and client lifecycle utilities for the native suspend-based AWS SDK for Kotlin.

## When to use it

Choose it when the application is coroutine-first and does not need Java SDK v2 client interoperability.

## Coordinates

Applications select one central BOM version.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.aws:bluetape4k-aws-kotlin")
}
```

AWS service SDKs follow a `compileOnly` policy; add the services actually used as runtime dependencies.

## Core concepts

Service calls are suspend functions from the SDK itself. This module adds concise request builders, pagination/Flow patterns, and `with...Client` ownership helpers.

## Quick start

```kotlin
withS3Client(region = region) { s3 ->
    s3.putFromByteArray(bucket, key, bytes)
    s3.getAsByteArray(bucket, key)
}
```

## API by task

DynamoDB model DSL and batch execution, S3 object operations, SQS/SNS, SES, KMS, CloudWatch, Kinesis record Flow, STS, and HTTP engine providers.

## Recommended patterns

Put client and background-job ownership at one application boundary. Configure region, credentials, and endpoints once instead of rebuilding them per call.

## Integrations

Add the selected `aws.sdk.kotlin:<service>` modules explicitly. Ktor integrations can use this library where native Kotlin SDK clients are appropriate.

## Configuration

Choose the region, credential provider, endpoint, retry strategy, and CRT or OkHttp engine when creating the client.

## Failure modes

Do not mix Java SDK v2 and Kotlin SDK models accidentally. Watch for unbounded Flow collection, missing service modules, and clients created outside a closeable scope.

## Operations

Share long-lived clients when call volume is high; use `with...Client` for bounded jobs. Record the chosen HTTP engine and timeout policy.

## Testing

Run service tests against Floci first and switch the emulator explicitly when a native Kotlin SDK feature is unsupported.

## Workshops and learning path

Begin with S3 request builders, then DynamoDB model conversion, and finally Kinesis or pagination Flow handling.

## Limitations

The module is not a compatibility wrapper around Java SDK v2; types and some service coverage differ.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `0.5.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### AWS Kotlin architecture diagram

[![AWS Kotlin architecture diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-aws/664e4dfb544a3c19db484b0f9a8e023a73774b49/docs/images/readme-diagrams/aws-kotlin-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-aws/blob/664e4dfb544a3c19db484b0f9a8e023a73774b49/docs/images/readme-diagrams/aws-kotlin-architecture-01.svg)

_Release README: [`aws-kotlin/README.md`](https://github.com/bluetape4k/bluetape4k-aws/blob/664e4dfb544a3c19db484b0f9a8e023a73774b49/aws-kotlin/README.md)_

### AWS Kotlin operation flow diagram

[![AWS Kotlin operation flow diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-aws/664e4dfb544a3c19db484b0f9a8e023a73774b49/docs/images/readme-diagrams/aws-kotlin-flow-02.png)](https://github.com/bluetape4k/bluetape4k-aws/blob/664e4dfb544a3c19db484b0f9a8e023a73774b49/docs/images/readme-diagrams/aws-kotlin-flow-02.svg)

_Release README: [`aws-kotlin/README.md`](https://github.com/bluetape4k/bluetape4k-aws/blob/664e4dfb544a3c19db484b0f9a8e023a73774b49/aws-kotlin/README.md)_

### AWS Kotlin client lifecycle sequence diagram

[![AWS Kotlin client lifecycle sequence diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-aws/664e4dfb544a3c19db484b0f9a8e023a73774b49/docs/images/readme-diagrams/aws-kotlin-sequence-03.png)](https://github.com/bluetape4k/bluetape4k-aws/blob/664e4dfb544a3c19db484b0f9a8e023a73774b49/docs/images/readme-diagrams/aws-kotlin-sequence-03.svg)

_Release README: [`aws-kotlin/README.md`](https://github.com/bluetape4k/bluetape4k-aws/blob/664e4dfb544a3c19db484b0f9a8e023a73774b49/aws-kotlin/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Release source: `aws-kotlin/src/main/kotlin/io/bluetape4k/aws/kotlin/s3/S3ClientSupport.kt`](https://github.com/bluetape4k/bluetape4k-aws/blob/0.5.0/aws-kotlin/src/main/kotlin/io/bluetape4k/aws/kotlin/s3/S3ClientSupport.kt)
- [Release source: `aws-kotlin/src/main/kotlin/io/bluetape4k/aws/kotlin/kinesis/KinesisRecordFlow.kt`](https://github.com/bluetape4k/bluetape4k-aws/blob/0.5.0/aws-kotlin/src/main/kotlin/io/bluetape4k/aws/kotlin/kinesis/KinesisRecordFlow.kt)
- [Release test: emulator selection](https://github.com/bluetape4k/bluetape4k-aws/blob/0.5.0/aws-kotlin/src/test/kotlin/io/bluetape4k/aws/kotlin/AbstractAwsTest.kt)
