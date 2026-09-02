---
manualId: "aws-ktor-service-coverage-examples"
id: "aws-ktor-service-coverage-examples"
title: "Ktor Service Coverage Examples"
locale: "en"
kind: "example"
gradlePath: ":aws-ktor-service-coverage-examples"
sourceDir: "examples/aws-ktor-service-coverage-examples"
releaseRef: "1.0.0"
artifact: null
---

# Ktor Service Coverage Examples

> A runnable 1.0.0 example for the remaining AWS service plugins.

## Learning goal {#problem}

Exercise SES/v2, SNS, CloudWatch, CloudWatch Logs, Kinesis, and STS through one small Ktor application surface.

## When to use this example {#when-to-use}

Use it when validating plugin installation and request/response mapping without depending on uneven emulator coverage.

## Project coordinates {#coordinates}

This example is not published. Run `./gradlew :aws-ktor-service-coverage-examples:test` from the release source.

## Concepts to learn {#concepts}

Each plugin receives an application-owned operation facade. Routes call the same application accessors used by production integrations.

## Staged walkthrough {#quick-start}

1. Provide the six operation facades.
2. Install `serviceCoverageExampleModule`.
3. Call the `/coverage/*` routes.
4. Verify the mapped AWS requests and JSON responses.

## Entry points and expected behavior {#api-by-task}

`ServiceCoverageExampleRoutes.kt` exposes email, notification, metric, log, stream-record, and caller-identity routes.

## Recommended exercise order {#patterns}

Start with STS, then add one write-oriented service at a time so configuration and mapping failures remain isolated.

## Integration boundary {#integrations}

The host application owns AWS clients, endpoints, credentials, and operation facades. Ktor owns only plugin installation and routing.

## Configuration checkpoints {#configuration}

Set the CloudWatch namespace, log group and stream, Kinesis stream name, and SNS topic ARN through `ServiceCoverageExampleOptions`.

## Failure modes {#failures}

Blank request fields fail validation. Missing resources, credentials, endpoint support, or IAM permissions surface through the injected operations.

## Operations {#operations}

Use the repository's Floci-first policy where the API is supported, LocalStack for explicit gaps, or real AWS endpoints owned by the application.

## Testing the boundary {#testing}

`ServiceCoverageExampleRoutesTest` uses MockK facades to verify plugin accessors, JSON mapping, AWS request mapping, and response mapping deterministically.

## Next learning path {#workshops}

Continue with the dedicated S3, SQS, DynamoDB, and Exposed examples for deeper lifecycle and persistence scenarios.

## Limitations {#limitations}

The example does not prove emulator parity, live AWS permissions, retry policy, production observability, or resource provisioning.

## Sources {#sources}

- [Routes and plugin setup](../../../../examples/aws-ktor-service-coverage-examples/src/main/kotlin/io/bluetape4k/aws/examples/ktor/servicecoverage/ServiceCoverageExampleRoutes.kt)
- [Deterministic route tests](../../../../examples/aws-ktor-service-coverage-examples/src/test/kotlin/io/bluetape4k/aws/examples/ktor/servicecoverage/ServiceCoverageExampleRoutesTest.kt)
- [Example notes](../../../../examples/aws-ktor-service-coverage-examples/README.md)
