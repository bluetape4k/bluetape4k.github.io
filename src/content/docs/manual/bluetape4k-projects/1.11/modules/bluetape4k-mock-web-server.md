---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-mock-web-server"
manualId: bluetape4k-mock-web-server
title: "bluetape4k-mock-web-server"
description: "A self-contained Spring Boot 4 + Virtual Threads HTTP mock server that replaces external HTTP dependencies in integration tests."
kind: library
group: testing
manual:
  id: "bluetape4k-mock-web-server"
  repository: "bluetape4k-projects"
  group: "testing"
  kind: "library"
  sourceCommit: "46993c010f5bef45fef0943bbc93728d16119bd5"
  sourcePath: "docs/manual/en/modules/bluetape4k-mock-web-server.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "testing/mock-web-server"
  layer: "build"
---


## Problem

A self-contained Spring Boot 4 + Virtual Threads HTTP mock server that replaces external HTTP dependencies in integration tests. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-mock-web-server` when the application needs fixture ownership, isolation, deterministic cleanup, and failure diagnostics. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-mock-web-server")
}
```

Gradle project path: `:bluetape4k-mock-web-server`. Source directory: `testing/mock-web-server`.

## Concepts

The first source-level concepts to inspect are `MockServerApplication`, `AdminController`, `PingController`, `GlobalExceptionHandler`, `HttpsConfiguration`, `HttpbinAdvancedController`, `HttpbinController`, and `HttpbinStreamController`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`MockServerApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/MockServerApplication.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`MockServerApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/MockServerApplication.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AdminController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/admin/AdminController.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`PingController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/admin/PingController.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`GlobalExceptionHandler`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/config/GlobalExceptionHandler.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HttpsConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/config/HttpsConfiguration.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HttpbinAdvancedController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/httpbin/HttpbinAdvancedController.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HttpbinController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/httpbin/HttpbinController.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HttpbinStreamController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/httpbin/HttpbinStreamController.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`HttpbinSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/httpbin/HttpbinSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ImageLoaderService`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/httpbin/ImageLoaderService.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Architecture**, **Diagrams**, **Request Routing Overview**, **Class Diagram**, **Sequence Diagram — httpbin GET**, **Features**, **Configuration**, **Examples**, **Run via Docker**, and **Build Docker image with Jib**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
implementation(platform(libs.jackson3.bom))
implementation("org.springframework.boot:spring-boot-starter-web")
implementation("org.springframework.boot:spring-boot-starter-cache")
implementation(libs.caffeine)
implementation(libs.jackson3.module.kotlin)
implementation(project(":bluetape4k-core"))
implementation(project(":bluetape4k-logging"))
implementation(project(":bluetape4k-jackson3"))
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`application.yml`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/resources/application.yml)
- [`localhost.p12`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/resources/certs/localhost.p12)
- [`rootCA.pem`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/resources/certs/rootCA.pem)
- [`albums.json`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/resources/jsonplaceholder/albums.json)
- [`comments.json`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/resources/jsonplaceholder/comments.json)
- [`photos.json`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/resources/jsonplaceholder/photos.json)
- [`posts.json`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/resources/jsonplaceholder/posts.json)
- [`todos.json`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/resources/jsonplaceholder/todos.json)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Keep fixtures isolated, bound resource use, expose diagnostics, and close shared services deterministically. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-mock-web-server:test --no-configuration-cache
```

Representative test anchors:

- [`MockServerTestBase`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/test/kotlin/io/bluetape4k/mockserver/MockServerTestBase.kt)
- [`ReadmeHttpsPortContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/test/kotlin/io/bluetape4k/mockserver/ReadmeHttpsPortContractTest.kt)
- [`AdminResetContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/test/kotlin/io/bluetape4k/mockserver/admin/AdminResetContractTest.kt)
- [`PingContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/test/kotlin/io/bluetape4k/mockserver/admin/PingContractTest.kt)
- [`HttpbinAdvancedContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/test/kotlin/io/bluetape4k/mockserver/httpbin/HttpbinAdvancedContractTest.kt)
- [`HttpbinContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/test/kotlin/io/bluetape4k/mockserver/httpbin/HttpbinContractTest.kt)
- [`HttpbinStreamContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/test/kotlin/io/bluetape4k/mockserver/httpbin/HttpbinStreamContractTest.kt)
- [`HttpbinSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/test/kotlin/io/bluetape4k/mockserver/httpbin/HttpbinSupportTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/build.gradle.kts)
- [`MockServerApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/MockServerApplication.kt)
- [`AdminController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/admin/AdminController.kt)
- [`PingController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/admin/PingController.kt)
- [`GlobalExceptionHandler`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/config/GlobalExceptionHandler.kt)
- [`HttpsConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/config/HttpsConfiguration.kt)
- [`HttpbinAdvancedController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/httpbin/HttpbinAdvancedController.kt)
- [`HttpbinController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/httpbin/HttpbinController.kt)
- [`HttpbinStreamController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/httpbin/HttpbinStreamController.kt)
- [`HttpbinSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/httpbin/HttpbinSupport.kt)
- [`ImageLoaderService`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/main/kotlin/io/bluetape4k/mockserver/httpbin/ImageLoaderService.kt)
- [`MockServerTestBase`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/test/kotlin/io/bluetape4k/mockserver/MockServerTestBase.kt)
- [`ReadmeHttpsPortContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/mock-web-server/src/test/kotlin/io/bluetape4k/mockserver/ReadmeHttpsPortContractTest.kt)
