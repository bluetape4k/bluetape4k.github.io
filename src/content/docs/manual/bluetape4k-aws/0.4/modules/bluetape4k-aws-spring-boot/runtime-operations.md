---
slug: "manual/bluetape4k-aws/0.4/modules/bluetape4k-aws-spring-boot/runtime-operations"
title: Runtime operations
description: Run Spring AWS integrations with bounded lifecycle and observability.
manualId: bluetape4k-aws-spring-boot
chapterId: runtime-operations
manual:
  id: "bluetape4k-aws-spring-boot"
  repository: "bluetape4k-aws"
  group: "framework"
  kind: "library"
  sourceCommit: "a64a49d44060154ec4371de9f7818168b75a6a67"
  sourcePath: "docs/manual/en/modules/bluetape4k-aws-spring-boot/runtime-operations.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "be4e6daea5654f84579955307ec56a58c8f405be"
  sourceDir: "aws-spring-boot"
  layer: "build"
  chapterId: "runtime-operations"
---


Operational correctness comes from lifecycle, bounded concurrency, observability, and secret discipline rather than from auto-configuration alone.

## Client ownership

Auto-configured clients are Spring-owned. Application-provided clients remain application-owned unless registered as closeable beans. Listener containers must stop before their clients. Do not close a shared client from a request handler.

## SQS runtime

Tune concurrent consumers, long-poll duration, maximum messages, visibility timeout, failure visibility, and shutdown timeout together. More pollers can increase throughput but also raise in-flight messages and downstream pressure. Prefer native SQS redrive policies over ad-hoc endless retries.

## Observability

When a `MeterRegistry` is available, S3/SQS operations and listener phases can emit low-cardinality timers. Do not put bucket keys, message bodies, secret IDs, or unbounded exception text in metric tags. Correlate AWS request IDs in logs.

## Remote configuration

Secrets Manager, Parameter Store, and S3 config loaders run during environment preparation. Treat a required source failure as startup failure. Cache resolved configuration in the environment instead of making AWS calls for every request.

## Graceful shutdown

Stop ingress, stop listener polling, await handlers up to a configured timeout, close owned service clients, then close database pools. Verify the same sequence in tests.

## Operational checklist

- Region and endpoint match the deployment.
- Credentials have least privilege and rotate.
- Service SDK jars match enabled integrations.
- Retry budgets are bounded.
- Metrics and logs avoid secrets and high-cardinality identifiers.
- Floci is the default local emulator; LocalStack is an explicit fallback.

## Sources

- [SQS listener container](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-spring-boot/src/main/kotlin/io/bluetape4k/aws/spring/sqs/SqsMessageListenerContainer.kt)
- [Micrometer SQS interceptor](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-spring-boot/src/main/kotlin/io/bluetape4k/aws/spring/sqs/MicrometerSqsListenerInterceptor.kt)
- [Secrets environment processor](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-spring-boot/src/main/kotlin/io/bluetape4k/aws/spring/secretsmanager/SecretsManagerEnvironmentPostProcessor.kt)
