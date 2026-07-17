---
slug: "manual/bluetape4k-aws/0.4/architecture/runtime-boundaries"
manualId: "runtime-boundaries"
title: "Runtime and Client Ownership Boundaries"
locale: "en"
releaseRef: "0.4.0"
manual:
  id: "architecture/runtime-boundaries"
  repository: "bluetape4k-aws"
  group: "overview"
  kind: "guide"
  sourceCommit: "6e3e90395ce89b999944c6236cd292650585e28f"
  sourcePath: "docs/manual/en/architecture/runtime-boundaries.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "be4e6daea5654f84579955307ec56a58c8f405be"
  sourceDir: "docs/manual"
  layer: "build"
---


An AWS client is more than a typed API. It owns or shares an HTTP engine, connection pools, credentials providers, worker coroutines, and sometimes background pollers. The correct shutdown rule follows the code that created the resource.

## Ownership matrix

| Creation path | Owner | Shutdown rule |
| --- | --- | --- |
| Application creates a Java SDK client | Application | Close the client when the application stops |
| Application creates a Kotlin SDK client without an injected engine | Application | Close the client; the SDK closes its managed engine |
| Application injects a shared Kotlin SDK HTTP engine | Application | Close every client, then close the shared engine once |
| Spring auto-configuration creates a client or registry | Spring context | Let bean destroy methods close it; do not close the same bean manually |
| Ktor plugin creates a client | Ktor plugin runtime | The plugin stops work and closes its owned client on application shutdown |
| Ktor plugin receives an injected client | Application | The plugin stops its work but does not close the injected client |
| `S3KtorClient` factory creates its HTTP client and credentials provider | `S3KtorClient` | Use `close()`/`use`; owned resources are closed with the wrapper |
| Exposed factory creates a database registry | Registry owner | Close named handles and the default handle through the registry |

## Kotlin SDK shared engines

`HttpClientEngineProvider` exposes shared CRT and OkHttp engine singletons. Once passed explicitly to a Kotlin SDK client, the engine is not managed by that client. This is useful when several clients must share transport resources, but it moves engine shutdown to the application. The CRT engine uses non-daemon threads; leaving the shared engine open can keep the JVM alive after clients are closed.

Prefer a client-managed engine for a single client. Use a shared engine only when the application has a single shutdown owner and can close it after all dependent clients stop.

## Framework-created versus injected clients

The Ktor DynamoDB and SQS plugins record whether a client was injected. A plugin-created client is closed when its runtime stops; an injected client is never closed by the plugin. This makes reuse possible without double-close behavior, but the application must keep the distinction visible in its composition root.

Spring auto-configurations declare closeable clients and registries with destroy methods. If an application replaces an auto-configured bean, its own bean definition must preserve the same lifecycle contract.

## Stop work before closing transport

Long-running runtimes need a two-stage shutdown:

1. stop accepting or polling for new work;
2. drain or cancel in-flight work within a bounded timeout;
3. flush buffered data where the runtime documents it;
4. close clients, pools, and shared engines in dependency order.

The Ktor SQS runtime stops pollers, waits up to `shutdownTimeout` for handlers, then cancels remaining work before closing an owned client. CloudWatch Logs has a separate bounded shutdown flush. These are operational contracts, not implementation details; configure their timeouts against the process termination budget.

## Sources

- [Kotlin SDK shared engine ownership](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-kotlin/src/main/kotlin/io/bluetape4k/aws/kotlin/http/HttpClientEngineProvider.kt)
- [Ktor SQS plugin ownership contract](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-ktor/src/main/kotlin/io/bluetape4k/aws/ktor/sqs/SqsConsumerPluginConfig.kt)
- [Ktor SQS shutdown sequence](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-ktor/src/main/kotlin/io/bluetape4k/aws/ktor/sqs/SqsConsumerRuntime.kt)
- [Ktor S3 client ownership](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-ktor/src/main/kotlin/io/bluetape4k/aws/ktor/s3/S3KtorClient.kt)
- [Exposed database registry](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-exposed/src/main/kotlin/io/bluetape4k/aws/exposed/AwsExposedDatabaseRegistry.kt)
