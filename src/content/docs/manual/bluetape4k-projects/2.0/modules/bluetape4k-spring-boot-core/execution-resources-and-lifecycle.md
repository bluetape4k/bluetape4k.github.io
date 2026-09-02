---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-spring-boot-core/execution-resources-and-lifecycle"
title: Execution resources and lifecycle
description: Explains creation, configuration, ownership, and shutdown of dedicated WebClient loops, controller scopes, and virtual-thread executors.
manualId: bluetape4k-spring-boot-core
chapterId: execution-resources-and-lifecycle
manual:
  id: "modules/bluetape4k-spring-boot-core/execution-resources-and-lifecycle"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-spring-boot-core/execution-resources-and-lifecycle.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "docs/manual/bluetape4k-projects"
  layer: "build"
---


## Isolate WebClient resources from the server

`AbstractWebClientConfig` creates dedicated `LoopResources`, `ReactorResourceFactory`, `ReactorClientHttpConnector`, `ExchangeStrategies`, and `WebClient` beans. `isUseGlobalResources = false` separates the client from global Reactor resources used by a server or another client.

```kotlin
@Configuration
class PartnerWebClientConfig : AbstractWebClientConfig() {
    override val threadCount: Int = 8
    override val connectTimeoutMillis: Int = 2_000
    override val shutdownTimeout: Duration = Duration.ofSeconds(10)
    override val maxInMemorySize: Int = 4 * 1024 * 1024
}
```

Isolation reduces shared failure impact but consumes additional threads and direct memory. Use separate loops at boundaries with a clear traffic or isolation requirement.

## Timeouts and SSL

The response timeout defaults to `PT30S` and can be changed with `bluetape4k.webclient.response-timeout`. Override the subclass property for connect timeout.

The default `sslContext()` validates server certificates using the JDK trust store. `insecureSslContext()` trusts every certificate and belongs only in development or tests. Connect private CAs through a custom trust store and `SslContext` in production.

## Codec memory limit

`exchangeStrategies()` changes only the default codec `maxInMemorySize`, which defaults to 16 MiB. It is a limit for what codecs aggregate in memory, not a total size limit for every streaming payload. Consider streaming or payload design before increasing it for large JSON or multipart data.

## Controller coroutine scopes

`AbstractCoroutineDefaultController`, `AbstractCoroutineIOController`, and `AbstractCoroutineVTController` create separate `CoroutineScope` instances with `SupervisorJob`. Their `@PreDestroy` method cancels the job when the Spring bean is destroyed.

These scopes are not children of the request coroutine. Request cancellation and Reactor or Spring Security context do not follow automatically. Run request-lifetime work in the current suspend context, and hand longer work to an explicitly owned application service scope.

## Virtual-thread configuration

`VirtualThreadAutoConfiguration` registers a virtual-thread-enabled `SimpleAsyncTaskExecutor` only when no `AsyncTaskExecutor` bean exists.

```kotlin
@Import(VirtualThreadAutoConfiguration::class)
class AsyncConfiguration
```

There is no auto-configuration imports metadata, so `@Import` is required. `@ConditionalOnMissingBean` makes the configuration back off when the application already owns an executor.

`AbstractVirtualThreadController.virtualThreadExecutor` is a process-wide companion object created by `newVirtualThreadPerTaskExecutor()`. The class has no close hook. Prefer an application-owned executor bean when shutdown control matters.

## Source and tests

- [`AbstractWebClientConfig.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/webflux/config/AbstractWebClientConfig.kt)
- [`AbstractCoroutineDefaultController.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/webflux/controller/AbstractCoroutineDefaultController.kt)
- [`AbstractCoroutineIOController.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/webflux/controller/AbstractCoroutineIOController.kt)
- [`AbstractCoroutineVTController.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/webflux/controller/AbstractCoroutineVTController.kt)
- [`VirtualThreadAutoConfiguration.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/virtualthread/VirtualThreadAutoConfiguration.kt)
- [`AbstractVirtualThreadController.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/virtualthread/AbstractVirtualThreadController.kt)
- [`CustomWebClientConfigTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/webflux/config/CustomWebClientConfigTest.kt)

## Next chapter

[Testing and ecosystem paths](/manual/bluetape4k-projects/2.0/modules/bluetape4k-spring-boot-core/testing-and-ecosystem-paths/) maps focused test anchors and the next modules to study.
