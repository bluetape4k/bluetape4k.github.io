---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-core/testing-and-ecosystem-paths"
title: Testing and ecosystem paths
description: Shows how to verify Spring Boot Core helpers in small slices and continue into data, WebFlux, and observability modules.
manualId: bluetape4k-spring-boot-core
chapterId: testing-and-ecosystem-paths
manual:
  id: "modules/bluetape4k-spring-boot-core/testing-and-ecosystem-paths"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "e89bf724fd018af8c2ab4564a5c9a007fe27b46a"
  sourcePath: "docs/manual/en/modules/bluetape4k-spring-boot-core/testing-and-ecosystem-paths.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "docs/manual"
  layer: "build"
---


## Start below the full application context

Not every Spring helper test needs `@SpringBootTest`. Annotation, BeanFactory, property, error-body, and Observation contracts can be tested in small units. Start an application context only when bean wiring or component scanning is the subject.

```bash
./gradlew :bluetape4k-spring-boot-core:test --no-configuration-cache
```

Use the full module task as the final check. While changing documentation or call sites, run the relevant test class first.

## Test anchors by capability

| Capability | Read first | Contract |
| --- | --- | --- |
| Annotation and bean | `AnnotationExtensionsTest`, `BeanFactoryExtensionsTest` | merged lookup, absence, ambiguity |
| Property | `PropertyResolverExtensionsTest` | nullable, default, required conversion |
| RestClient | `RestClientExtensionsTest`, `RestClientCoroutinesDslTest` | method, headers, body, nullable, interrupt |
| WebFlux request | `HttpRequestFilterTest` | Reactor Context propagation and absence |
| DataBuffer | `DataBufferSupportTest` | reads, writes, byte limits, join, pooled release |
| Error response | `ApiExceptionHandlerTest` | status and body per exception |
| Observation | `SpringObservationSupportTest` | start, error, stop, cancellation, cleanup |
| WebClient resource | `CustomWebClientConfigTest` | dedicated resources and bean wiring |

## Isolate real external boundaries

HTTP client tests use a mock server or test request factory to verify methods, bodies, converters, and cancellation without calling an internet service. WebClient resource tests should verify `isUseGlobalResources=false`, timeouts, and connector wiring, not just bean existence.

DataBuffer tests distinguish default buffers from Netty pooled buffers when checking release. Observation tests use a recording handler to validate lifecycle and key values without an exporter.

## What Spring Boot provides

These capabilities do not belong to this module:

- application bootstrap and auto-configuration discovery;
- embedded server and WebFlux runtime;
- Jackson converters and serialization policy;
- Actuator endpoints and Prometheus or OpenTelemetry exporters;
- authentication, authorization, and transactions;
- HTTP connection pools, retries, and circuit breakers.

A test fixture receiving these capabilities from Spring Boot does not make them library features.

## Choose the next module

- Learn coroutine, Flow, cancellation, dispatcher, and context rules in [`bluetape4k-coroutines`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-coroutines/).
- Continue to [`bluetape4k-jdbc`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-jdbc/) for JDBC helpers and imperative transactions.
- Use [`bluetape4k-spring-boot-r2dbc`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-r2dbc/) for Spring Data R2DBC entity operations with Flow and suspend functions.
- When comparing Hibernate and Exposed, decide the JDBC persistence and transaction requirements first, then move to each repository's manual.
- `bluetape4k-micrometer` owns backend-specific metric helpers; `bluetape4k-resilience4j` owns resilience policies.

## Practical study sequence

1. Use one Context helper with its focused unit test.
2. If HTTP is needed, choose blocking or reactive I/O and assign timeout and converter ownership.
3. When using WebFlux request context or DataBuffer, test subscriptions and buffer lifecycle.
4. Define an external-safe message and stable error code for API failures.
5. Wrap service boundaries with the application-owned `ObservationRegistry` and review cardinality.
6. Add a dedicated executor or event loop only when operational isolation requires it.

## Source and tests

- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/build.gradle.kts)
- [English README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/README.md)
- [`WebClientReadmeExamplesTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/tests/WebClientReadmeExamplesTest.kt)
- [`RestClientCoroutinesDslTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/http/RestClientCoroutinesDslTest.kt)
- [`HttpRequestFilterTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/webflux/filter/HttpRequestFilterTest.kt)
- [`SpringObservationSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/observability/SpringObservationSupportTest.kt)

## Back to the manual

Return to [Common boundaries for Spring Boot applications](/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-core/) for the complete API map and 1.11.0 limitations.
