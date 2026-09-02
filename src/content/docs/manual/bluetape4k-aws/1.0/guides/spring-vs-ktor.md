---
slug: "manual/bluetape4k-aws/1.0/guides/spring-vs-ktor"
manualId: "spring-vs-ktor"
title: "Spring Boot or Ktor for AWS Integration"
locale: "en"
releaseRef: "1.0.0"
manual:
  id: "guides/spring-vs-ktor"
  repository: "bluetape4k-aws"
  group: "overview"
  kind: "guide"
  sourceCommit: "632e0f346b807c4d50e3195f7b2b72082def9460"
  sourcePath: "docs/manual/bluetape4k-aws/en/guides/spring-vs-ktor.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "632e0f346b807c4d50e3195f7b2b72082def9460"
  sourceDir: "docs/manual/bluetape4k-aws"
  layer: "build"
---


Choose the integration that already owns application configuration and lifecycle. Both modules expose coroutine-friendly APIs; their main difference is how clients, background work, properties, and shutdown are composed.

## Selection guide

| Need | Spring Boot | Ktor |
| --- | --- | --- |
| Configuration | Bind `bluetape4k.aws.*` properties and conditional beans | Configure installed plugins and shared `AwsKtorDefaults` |
| Resource ownership | Spring beans and destroy methods | Plugin runtime plus explicit injected-versus-created ownership |
| S3 | Templates, transfer manager, presigning, configuration sources, encryption | SigV4 Ktor client, object/multipart/presigning, encryption |
| DynamoDB | Coroutine repositories and optional DAX | Kotlin SDK repository plugin and explicit table definitions |
| Messaging | `@SqsListener`, container registry, SNS templates and HTTP parsing | SQS consumer plugin with handler, interceptors, observers, and ack/nack |
| Database | Auto-configured AWS-backed Exposed registry | `AwsExposedPlugin` and route-level database access |
| Observability | Micrometer integration follows Spring conventions | Optional Micrometer observers/templates wired by plugins |

## Choose Spring Boot when the context owns infrastructure

Spring Boot fits applications that already use configuration properties, conditional auto-configuration, bean replacement, actuator, and context-managed shutdown. The module does not depend on awspring. It creates only clients whose service SDK classes and configuration are present, so the application still adds the required AWS service artifacts.

Use the Spring examples to see the full boundary: property overrides, application beans, controller or listener, Testcontainers emulator, and AOT tasks where the example provides them.

## Choose Ktor when plugins own the runtime edge

Ktor fits services that want explicit plugin installation and smaller runtime composition. Each plugin validates its own configuration and records whether it created or received a client. Background runtimes—such as SQS polling and CloudWatch Logs buffering—attach to Ktor application lifecycle events and stop with bounded timeouts.

The plugin boundary does not make all resources plugin-owned. An injected client remains application-owned. Keep client creation in one composition root so the shutdown rule is visible.

## Do not wrap one framework in the other

If an application already uses Spring Boot, adding a Ktor plugin only to reuse one helper creates two lifecycle models. Use the underlying `bluetape4k-aws-java`, `bluetape4k-aws-kotlin`, or `bluetape4k-aws-exposed` module directly when a framework-specific adapter does not fit. The same rule applies to Ktor applications importing Spring auto-configuration.

## Sources

- [Spring AWS auto-configuration](https://github.com/bluetape4k/bluetape4k-aws/blob/1.0.0/aws-spring-boot/src/main/kotlin/io/bluetape4k/aws/spring/AwsAutoConfiguration.kt)
- [Spring AWS properties](https://github.com/bluetape4k/bluetape4k-aws/blob/1.0.0/aws-spring-boot/src/main/kotlin/io/bluetape4k/aws/spring/AwsProperties.kt)
- [Ktor shared defaults](https://github.com/bluetape4k/bluetape4k-aws/blob/1.0.0/aws-ktor/src/main/kotlin/io/bluetape4k/aws/ktor/AwsKtorCore.kt)
- [Ktor SQS plugin](https://github.com/bluetape4k/bluetape4k-aws/blob/1.0.0/aws-ktor/src/main/kotlin/io/bluetape4k/aws/ktor/sqs/SqsConsumerPlugin.kt)
- [Ktor Exposed plugin](https://github.com/bluetape4k/bluetape4k-aws/blob/1.0.0/aws-ktor/src/main/kotlin/io/bluetape4k/aws/ktor/exposed/AwsExposedPlugin.kt)
