---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-core/webflux-request-and-buffers"
title: WebFlux request context and DataBuffer
description: Explains Reactor Context request propagation, internal path rewriting, DataBuffer flows, and pooled-buffer lifecycle.
manualId: bluetape4k-spring-boot-core
chapterId: webflux-request-and-buffers
manual:
  id: "modules/bluetape4k-spring-boot-core/webflux-request-and-buffers"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "a9051bd77bf5870d3787f15c1d32088412f2bdbb"
  sourcePath: "docs/manual/en/modules/bluetape4k-spring-boot-core/webflux-request-and-buffers.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "docs/manual"
  layer: "build"
---


## Keep the current request in Reactor Context

`HttpRequestCapturer` stores a `ServerHttpRequest` copy under the `ServerHttpRequest::class.java` key in Reactor Context. `HttpRequestHolder.getHttpRequest()` reads the subscription context and returns an empty `Mono` when no request is present.

```kotlin
val request = HttpRequestHolder.getHttpRequest().awaitSingleOrNull()
val requestId = request?.headers?.getFirst("X-Request-Id")
```

This is not a global ThreadLocal holder. The request disappears if code leaves the filter chain or loses Reactor Context. Read only the required values and pass them into domain calls instead of retaining the request.

## Component scan and filter order

`HttpRequestCapturer` is a `@Component` and must be included by application scanning. If another filter consumes the context value, assign ordering and verify it in the real request pipeline.

`AbstractRedirectWebFilter` does not send an HTTP redirect. When the path matches exactly, it rewrites the request path inside `ServerWebExchange` and continues the filter chain. Query parameters and the rest of the exchange are retained.

## Read DataBuffer as Flow

Input streams, channels, `Path`, and Spring `Resource` can be exposed as `Flow<DataBuffer>`.

```kotlin
fun download(path: Path, factory: DataBufferFactory): Flow<DataBuffer> =
    path.readAsDataBuffer(factory, bufferSize = 16 * 1024)
```

The flow starts reading when collected. Multiple collections may reopen a source or attempt to reuse the same stream. Keep streaming for large responses instead of combining everything with `join()`.

## Byte limits and memory

`takeUntilByteCount` forwards data up to a cumulative byte count, while `skipUntilByteCount` skips that amount. `join(maxByteCount)` combines buffers.

An unbounded `join()` over external input can exhaust heap or direct memory. Set a protocol or application limit and decide how to map the resulting Spring error to a client response.

## Release pooled buffers

Netty pooled `DataBuffer` instances use reference counting. The `retain`, `touch`, and `release` helpers delegate to `DataBufferUtils`.

```kotlin
val retained = buffer.retain()
try {
    consume(retained)
} finally {
    retained.release()
}
```

Only the owner should release a buffer. Double-release and handing a buffer to another asynchronous task without retaining it can cause use-after-release or leaks. The `write(OutputStream)` and channel overloads do not close their destination.

## Source and tests

- [`HttpRequestCapturer.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/webflux/filter/HttpRequestCapturer.kt)
- [`HttpRequestHolder.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/webflux/filter/HttpRequestHolder.kt)
- [`AbstractRedirectWebFilter.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/webflux/filter/AbstractRedirectWebFilter.kt)
- [`DataBufferSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/core/io/buffer/DataBufferSupport.kt)
- [`HttpRequestFilterTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/webflux/filter/HttpRequestFilterTest.kt)
- [`DataBufferSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/core/io/buffer/DataBufferSupportTest.kt)

## Next chapter

[Error responses and observations](/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-core/error-responses-and-observability/) shows how to represent failures as HTTP responses and telemetry.
