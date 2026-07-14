---
slug: "manual/bluetape4k-aws/0.4/modules/bluetape4k-aws-ktor/runtime-lifecycle"
title: Runtime lifecycle
description: Start and stop AWS clients, pollers, handlers, and registries safely.
manualId: bluetape4k-aws-ktor
chapterId: runtime-lifecycle
manual:
  id: "bluetape4k-aws-ktor"
  repository: "bluetape4k-aws"
  group: "framework"
  kind: "library"
  sourceCommit: "cf9f7a4ed610f85b4af440bcdabedcab55f47bd1"
  sourcePath: "docs/manual/en/modules/bluetape4k-aws-ktor/runtime-lifecycle.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "be4e6daea5654f84579955307ec56a58c8f405be"
  sourceDir: "aws-ktor"
  layer: "build"
  chapterId: "runtime-lifecycle"
---


A Ktor runtime may own clients, coroutine jobs, database registries, and in-flight handlers. Ownership is recorded at construction so shutdown can close only what the runtime created.

## Startup

Validate configuration before launching jobs. Resolve queue names, create database registries, and build service clients inside a bounded startup timeout. A partial startup failure must close everything already created.

## Structured background work

Pollers and handlers run under the application lifecycle, not `GlobalScope`. Bound parallelism and use a dedicated or limited I/O dispatcher for blocking boundaries. One failed child should follow the runtime's documented supervision policy rather than silently killing unrelated service work.

## Shutdown sequence

1. Stop scheduling new receives or service work.
2. Cancel or signal pollers.
3. Await in-flight handlers up to `shutdownTimeout`.
4. Apply the configured failure/visibility outcome to interrupted messages.
5. Close plugin-owned clients and registries.
6. Leave injected resources open for their owner.

```kotlin
environment.monitor.subscribe(ApplicationStopping) {
    // Plugins stop work before application-owned shared clients close.
}
```

## SQS visibility during shutdown

If a handler can outlive visibility, enable heartbeat extension or choose a longer timeout. On forced shutdown, immediate redelivery can be safer than waiting for visibility expiry, but only when handlers are idempotent.

## Observability

Record poll, receive, convert, invoke, acknowledge, and failure phases with bounded tags. Track active jobs and shutdown duration. Do not use queue URLs, message bodies, or object keys as unbounded metric tags.

## Verification

A lifecycle test should start and stop the application repeatedly, assert no job remains active, prove an injected client stays open, prove a plugin-created client closes, and exercise timeout cancellation.

## Sources

- [SQS runtime](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-ktor/src/main/kotlin/io/bluetape4k/aws/ktor/sqs/SqsConsumerRuntime.kt)
- [Exposed runtime](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-ktor/src/main/kotlin/io/bluetape4k/aws/ktor/exposed/AwsExposedKtorRuntime.kt)
- [CloudWatch runtime](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-ktor/src/main/kotlin/io/bluetape4k/aws/ktor/cloudwatch/CloudWatchKtorRuntime.kt)
