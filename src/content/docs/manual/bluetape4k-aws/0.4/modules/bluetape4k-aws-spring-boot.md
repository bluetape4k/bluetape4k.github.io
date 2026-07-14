---
slug: "manual/bluetape4k-aws/0.4/modules/bluetape4k-aws-spring-boot"
manualId: "bluetape4k-aws-spring-boot"
id: "bluetape4k-aws-spring-boot"
title: "AWS Spring Boot Integration"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-aws-spring-boot"
sourceDir: "aws-spring-boot"
releaseRef: "0.4.0"
artifact: io.github.bluetape4k.aws:bluetape4k-aws-spring-boot
manual:
  id: "bluetape4k-aws-spring-boot"
  repository: "bluetape4k-aws"
  group: "framework"
  kind: "library"
  sourceCommit: "cf9f7a4ed610f85b4af440bcdabedcab55f47bd1"
  sourcePath: "docs/manual/en/modules/bluetape4k-aws-spring-boot.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "be4e6daea5654f84579955307ec56a58c8f405be"
  sourceDir: "aws-spring-boot"
  layer: "build"
---


> Library manual grounded in the 0.4.0 release source.

## Problem

Spring Boot 4 auto-configuration, coroutine templates, repositories, listeners, configuration sources, and Micrometer instrumentation for selected AWS services.

## When to use it

Use it when Spring should own AWS clients and application-facing templates while the application keeps explicit control of service SDK dependencies.

## Coordinates

Applications select one central BOM version.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.aws:bluetape4k-aws-spring-boot")
}
```

AWS service SDKs follow a `compileOnly` policy; add the services actually used as runtime dependencies.

## Core concepts

Conditional auto-configurations back off when a service SDK is absent. Properties customize region, endpoint, credentials, and service behavior; templates expose suspend operations; listener containers own background jobs.

## Quick start

```kotlin
@Service
class ObjectStore(private val s3: S3Operations) {
    suspend fun put(bucket: String, key: String, bytes: ByteArray) =
        s3.upload(bucket, key, bytes)
}
```

## API by task

S3 and Transfer Manager, DynamoDB repositories and DAX, SQS listener/runtime, SNS, SES, KMS, CloudWatch, IMDS, Secrets Manager, Parameter Store, S3 Access Grants/Vectors, and Exposed.

## Recommended patterns

Put client and background-job ownership at one application boundary. Configure region, credentials, and endpoints once instead of rebuilding them per call.

## Integrations

Import the central BOM, add this library without a version, then add only `software.amazon.awssdk:<service>` modules used by enabled auto-configurations.

## Configuration

Use the `bluetape4k.aws` property namespace, endpoint overrides for emulators, and customizer beans when client-builder control must stay in application code.

## Failure modes

Most missing-bean failures mean the service SDK is absent or a condition did not match. SQS visibility, listener concurrency, payload conversion, and shutdown timeouts require explicit tuning.

## Operations

Expose Micrometer metrics, make listener acknowledgement policy explicit, close custom clients, and keep environment property-source calls out of request paths.

## Testing

Use `ApplicationContextRunner` for conditional beans and Floci-backed integration tests for enabled services. Test listener shutdown and redelivery, not only successful sends.

## Workshops and learning path

Read `auto-configuration`, then `storage-and-messaging`, then `runtime-operations`; run the four released Spring Boot examples.

## Limitations

This is not awspring and does not enable every AWS service automatically. Optional integrations remain absent until their classes and properties are present.

## Sources

- [Release source: `aws-spring-boot/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-spring-boot/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports)
- [Release source: `aws-spring-boot/src/main/kotlin/io/bluetape4k/aws/spring/sqs/SqsListener.kt`](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-spring-boot/src/main/kotlin/io/bluetape4k/aws/spring/sqs/SqsListener.kt)
- [Release test: auto-configuration](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-spring-boot/src/test/kotlin/io/bluetape4k/aws/spring/AwsAutoConfigurationTest.kt)
