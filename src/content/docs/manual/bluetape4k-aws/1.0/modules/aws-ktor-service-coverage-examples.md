---
slug: "manual/bluetape4k-aws/1.0/modules/aws-ktor-service-coverage-examples"
manualId: "aws-ktor-service-coverage-examples"
id: "aws-ktor-service-coverage-examples"
title: "Ktor Service Coverage Examples"
locale: "en"
kind: "example"
gradlePath: ":aws-ktor-service-coverage-examples"
sourceDir: "examples/aws-ktor-service-coverage-examples"
releaseRef: "1.0.0"
artifact: null
manual:
  id: "aws-ktor-service-coverage-examples"
  repository: "bluetape4k-aws"
  group: "example-service-coverage"
  kind: "example"
  sourceCommit: "632e0f346b807c4d50e3195f7b2b72082def9460"
  sourcePath: "docs/manual/bluetape4k-aws/en/modules/aws-ktor-service-coverage-examples.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "632e0f346b807c4d50e3195f7b2b72082def9460"
  sourceDir: "examples/aws-ktor-service-coverage-examples"
  layer: "learn"
---


> A runnable 1.0.0 example for the remaining AWS service plugins.

## Learning goal

Exercise SES/v2, SNS, CloudWatch, CloudWatch Logs, Kinesis, and STS through one small Ktor application surface.

## When to use this example

Use it when validating plugin installation and request/response mapping without depending on uneven emulator coverage.

## Project coordinates

This example is not published. Run `./gradlew :aws-ktor-service-coverage-examples:test` from the release source.

## Concepts to learn

Each plugin receives an application-owned operation facade. Routes call the same application accessors used by production integrations.

## Staged walkthrough

1. Provide the six operation facades.
2. Install `serviceCoverageExampleModule`.
3. Call the `/coverage/*` routes.
4. Verify the mapped AWS requests and JSON responses.

## Entry points and expected behavior

`ServiceCoverageExampleRoutes.kt` exposes email, notification, metric, log, stream-record, and caller-identity routes.

## Recommended exercise order

Start with STS, then add one write-oriented service at a time so configuration and mapping failures remain isolated.

## Integration boundary

The host application owns AWS clients, endpoints, credentials, and operation facades. Ktor owns only plugin installation and routing.

## Configuration checkpoints

Set the CloudWatch namespace, log group and stream, Kinesis stream name, and SNS topic ARN through `ServiceCoverageExampleOptions`.

## Failure modes

Blank request fields fail validation. Missing resources, credentials, endpoint support, or IAM permissions surface through the injected operations.

## Operations

Use the repository's Floci-first policy where the API is supported, LocalStack for explicit gaps, or real AWS endpoints owned by the application.

## Testing the boundary

`ServiceCoverageExampleRoutesTest` uses MockK facades to verify plugin accessors, JSON mapping, AWS request mapping, and response mapping deterministically.

## Next learning path

Continue with the dedicated S3, SQS, DynamoDB, and Exposed examples for deeper lifecycle and persistence scenarios.

## Limitations

The example does not prove emulator parity, live AWS permissions, retry policy, production observability, or resource provisioning.

## Sources

- [Routes and plugin setup](https://github.com/bluetape4k/bluetape4k-aws/blob/1.0.0/examples/aws-ktor-service-coverage-examples/src/main/kotlin/io/bluetape4k/aws/examples/ktor/servicecoverage/ServiceCoverageExampleRoutes.kt)
- [Deterministic route tests](https://github.com/bluetape4k/bluetape4k-aws/blob/1.0.0/examples/aws-ktor-service-coverage-examples/src/test/kotlin/io/bluetape4k/aws/examples/ktor/servicecoverage/ServiceCoverageExampleRoutesTest.kt)
- [Example notes](https://github.com/bluetape4k/bluetape4k-aws/blob/1.0.0/examples/aws-ktor-service-coverage-examples/README.md)
