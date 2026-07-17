---
slug: "manual/bluetape4k-aws/0.4/guides/learning-path"
manualId: "learning-path"
title: "Bluetape4k AWS Learning Path"
locale: "en"
releaseRef: "0.4.0"
manual:
  id: "guides/learning-path"
  repository: "bluetape4k-aws"
  group: "overview"
  kind: "guide"
  sourceCommit: "6b25d4663a87099fc94ced293eb7ca024420edc7"
  sourcePath: "docs/manual/en/guides/learning-path.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "be4e6daea5654f84579955307ec56a58c8f405be"
  sourceDir: "docs/manual"
  layer: "build"
---


The manual contains detailed selection rules, runtime boundaries, and runnable examples. You do not need to read every module in order. Enter at the first unresolved decision, complete one end-to-end path, and then add services or framework features.

## 1. Establish the dependency boundary

Read [Getting started](/manual/bluetape4k-aws/0.4/getting-started/). Import `bluetape4k-dependencies` once and add only the wrapper and AWS service modules required by the application. Confirm that no code depends on an AWS service artifact that exists only because tests or another framework pulled it transitively.

## 2. Choose the SDK model

Use [SDK selection](/manual/bluetape4k-aws/0.4/guides/sdk-selection/) to compare Java SDK v2 and AWS SDK for Kotlin by interoperability, async model, service coverage, transport, and ownership. Build one small client call and close its resources before adding a framework.

## 3. Complete one service path

Follow [AWS service learning paths](/manual/bluetape4k-aws/0.4/guides/service-learning-paths/):

- S3: object lifecycle, application route, emulator test, then presigning or encryption;
- DynamoDB: key design, repository, conditional behavior, then table lifecycle;
- SQS/SNS: acknowledgement, visibility, idempotency, redelivery, then fanout.

Each path points to Ktor and Spring Boot examples with detailed explanations and tests. Read the example README, source, and test together; the lifecycle and configuration decisions often live outside the controller or route.

## 4. Add the framework integration

Read [Spring Boot or Ktor](/manual/bluetape4k-aws/0.4/guides/spring-vs-ktor/). Choose the framework that already owns application configuration and shutdown. If neither integration fits, use the SDK foundation directly instead of bringing in a second framework lifecycle.

## 5. Connect relational storage when needed

Read [AWS-backed configuration to Exposed JDBC](/manual/bluetape4k-aws/0.4/guides/database-with-exposed/) for Secrets Manager or Parameter Store descriptors, optional RDS IAM authentication, Hikari/Exposed database creation, named registries, and transaction ownership. Continue to the [`bluetape4k-exposed` manual](https://bluetape4k.github.io/manual/bluetape4k-exposed/) for repository and transaction patterns.

## 6. Prove operations and shutdown

Finish with [Testing and operations](/manual/bluetape4k-aws/0.4/guides/testing-and-operations/) and [runtime boundaries](/manual/bluetape4k-aws/0.4/architecture/runtime-boundaries/). Run the smallest relevant example against Floci, add an explicit LocalStack fallback only where needed, then test failure, retry, duplicate delivery, and shutdown behavior.

At this point the application should be able to answer four questions for every AWS integration: who creates the client, who closes it, what a retry can repeat, and which test proves the real boundary.

## Sources

- [Representative released example](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-ktor-s3-examples/README.md)
- [Release project registry](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/settings.gradle.kts)
