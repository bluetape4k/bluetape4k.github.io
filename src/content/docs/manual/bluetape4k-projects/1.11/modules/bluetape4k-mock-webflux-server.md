---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-mock-webflux-server"
manualId: bluetape4k-mock-webflux-server
title: "bluetape4k-mock-webflux-server"
description: "A standalone Spring Boot 4 + WebFlux mock server for integration testing. It provides HTTP endpoints compatible with httpbin.org and jsonplaceholder.typicode.com, implemented with Kotlin Coroutines (suspend fun, Flow)."
kind: library
group: testing
manual:
  id: "bluetape4k-mock-webflux-server"
  repository: "bluetape4k-projects"
  group: "testing"
  kind: "library"
  sourceCommit: "03115e34f03bad535921d3cad5cd23a2e7814581"
  sourcePath: "docs/manual/en/modules/bluetape4k-mock-webflux-server.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "testing/mock-webflux-server"
  layer: "build"
---


## Problem

A standalone Spring Boot 4 + WebFlux mock server for integration testing. It provides HTTP endpoints compatible with httpbin.org and jsonplaceholder.typicode.com, implemented with Kotlin Coroutines (suspend fun, Flow). This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-mock-webflux-server` when the application needs fixture ownership, isolation, deterministic cleanup, and failure diagnostics. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-mock-webflux-server")
}
```

Gradle project path: `:bluetape4k-mock-webflux-server`. Source directory: `testing/mock-webflux-server`.

## Concepts

The first source-level concepts to inspect are `MockWebfluxServerApplication`, `AdminController`, `PingController`, `GlobalExceptionHandler`, `HttpsServerLifecycle`, `WebFluxJacksonConfig`, `HttpbinAdvancedController`, and `HttpbinController`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`MockWebfluxServerApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/MockWebfluxServerApplication.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`MockWebfluxServerApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/MockWebfluxServerApplication.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AdminController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/admin/AdminController.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`PingController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/admin/PingController.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`GlobalExceptionHandler`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/config/GlobalExceptionHandler.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HttpsServerLifecycle`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/config/HttpsServerLifecycle.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`WebFluxJacksonConfig`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/config/WebFluxJacksonConfig.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HttpbinAdvancedController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/httpbin/HttpbinAdvancedController.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HttpbinController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/httpbin/HttpbinController.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HttpbinStreamController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/httpbin/HttpbinStreamController.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HttpbinSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/httpbin/HttpbinSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Architecture**, **Comparison with bluetape4k-mock-web-server**, **Diagrams**, **Request Routing Overview**, **Class Diagram**, **Sequence Diagram — httpbin GET**, **Features**, **Configuration**, **Examples**, and **Run via Docker**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
implementation(platform(libs.jackson3.bom))
implementation("org.springframework.boot:spring-boot-starter-webflux")
implementation("org.springframework.boot:spring-boot-starter-cache")
implementation("org.springframework.boot:spring-boot-starter-actuator")
implementation(libs.caffeine)
implementation(libs.jackson3.module.kotlin)
implementation(libs.kotlinx.coroutines.core)
implementation(libs.kotlinx.coroutines.reactor)
implementation(project(":bluetape4k-core"))
implementation(project(":bluetape4k-coroutines"))
implementation(project(":bluetape4k-logging"))
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`application.yml`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/resources/application.yml)
- [`localhost.p12`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/resources/certs/localhost.p12)
- [`rootCA.pem`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/resources/certs/rootCA.pem)
- [`albums.json`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/resources/jsonplaceholder/albums.json)
- [`comments.json`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/resources/jsonplaceholder/comments.json)
- [`photos.json`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/resources/jsonplaceholder/photos.json)
- [`posts.json`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/resources/jsonplaceholder/posts.json)
- [`todos.json`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/resources/jsonplaceholder/todos.json)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Keep fixtures isolated, bound resource use, expose diagnostics, and close shared services deterministically. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-mock-webflux-server:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractMockWebfluxServerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/test/kotlin/io/bluetape4k/mockwebflux/AbstractMockWebfluxServerTest.kt)
- [`ReadmeRouteContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/test/kotlin/io/bluetape4k/mockwebflux/ReadmeRouteContractTest.kt)
- [`AdminResetContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/test/kotlin/io/bluetape4k/mockwebflux/admin/AdminResetContractTest.kt)
- [`PingContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/test/kotlin/io/bluetape4k/mockwebflux/admin/PingContractTest.kt)
- [`GlobalExceptionHandlerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/test/kotlin/io/bluetape4k/mockwebflux/config/GlobalExceptionHandlerTest.kt)
- [`HttpbinAdvancedContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/test/kotlin/io/bluetape4k/mockwebflux/httpbin/HttpbinAdvancedContractTest.kt)
- [`HttpbinContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/test/kotlin/io/bluetape4k/mockwebflux/httpbin/HttpbinContractTest.kt)
- [`HttpbinStreamContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/test/kotlin/io/bluetape4k/mockwebflux/httpbin/HttpbinStreamContractTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/build.gradle.kts)
- [`MockWebfluxServerApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/MockWebfluxServerApplication.kt)
- [`AdminController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/admin/AdminController.kt)
- [`PingController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/admin/PingController.kt)
- [`GlobalExceptionHandler`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/config/GlobalExceptionHandler.kt)
- [`HttpsServerLifecycle`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/config/HttpsServerLifecycle.kt)
- [`WebFluxJacksonConfig`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/config/WebFluxJacksonConfig.kt)
- [`HttpbinAdvancedController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/httpbin/HttpbinAdvancedController.kt)
- [`HttpbinController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/httpbin/HttpbinController.kt)
- [`HttpbinStreamController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/httpbin/HttpbinStreamController.kt)
- [`HttpbinSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/main/kotlin/io/bluetape4k/mockwebflux/httpbin/HttpbinSupport.kt)
- [`AbstractMockWebfluxServerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/test/kotlin/io/bluetape4k/mockwebflux/AbstractMockWebfluxServerTest.kt)
- [`ReadmeRouteContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-webflux-server/src/test/kotlin/io/bluetape4k/mockwebflux/ReadmeRouteContractTest.kt)
