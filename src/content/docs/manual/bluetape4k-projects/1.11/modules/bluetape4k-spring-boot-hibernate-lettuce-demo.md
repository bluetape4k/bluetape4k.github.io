---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-hibernate-lettuce-demo"
manualId: bluetape4k-spring-boot-hibernate-lettuce-demo
title: "bluetape4k-spring-boot-hibernate-lettuce-demo"
description: "Spring Boot 4 + Hibernate 7 2nd Level Cache (2LC) with Lettuce Near Cache demo application."
kind: library
group: spring
manual:
  id: "bluetape4k-spring-boot-hibernate-lettuce-demo"
  repository: "bluetape4k-projects"
  group: "spring"
  kind: "library"
  sourceCommit: "e89bf724fd018af8c2ab4564a5c9a007fe27b46a"
  sourcePath: "docs/manual/en/modules/bluetape4k-spring-boot-hibernate-lettuce-demo.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "spring-boot/hibernate-lettuce-demo"
  layer: "build"
---


## Problem

Spring Boot 4 + Hibernate 7 2nd Level Cache (2LC) with Lettuce Near Cache demo application. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-spring-boot-hibernate-lettuce-demo` when the application needs auto-configuration conditions, bean ownership, property binding, and application lifecycle. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-spring-boot-hibernate-lettuce-demo")
}
```

Gradle project path: `:bluetape4k-spring-boot-hibernate-lettuce-demo`. Source directory: `spring-boot/hibernate-lettuce-demo`.

## Concepts

The first source-level concepts to inspect are `DemoApplication`, `CacheController`, `ProductController`, `Product`, and `ProductRepository`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`DemoApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/main/kotlin/io/bluetape4k/examples/cache/lettuce/DemoApplication.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`DemoApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/main/kotlin/io/bluetape4k/examples/cache/lettuce/DemoApplication.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CacheController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/main/kotlin/io/bluetape4k/examples/cache/lettuce/controller/CacheController.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ProductController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/main/kotlin/io/bluetape4k/examples/cache/lettuce/controller/ProductController.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Product`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/main/kotlin/io/bluetape4k/examples/cache/lettuce/domain/Product.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ProductRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/main/kotlin/io/bluetape4k/examples/cache/lettuce/repository/ProductRepository.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Class Structure**, **Runtime Flow**, **Domain Model**, **Product Entity**, **REST API**, **Product API (/api/products)**, **Example: Get product (cache in action)**, **Example: Create a product**, **Example: Update a product (cache refresh)**, and **Example: Delete a product (cache eviction)**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
implementation(project(":bluetape4k-spring-boot-hibernate-lettuce"))
implementation("org.springframework.boot:spring-boot-starter-web")
implementation("org.springframework.boot:spring-boot-starter-data-jpa")
implementation("org.springframework.boot:spring-boot-starter-actuator")
implementation(libs.micrometer.core)
runtimeOnly(libs.h2.v2)
implementation(libs.jackson3.module.kotlin)
implementation(libs.jackson3.module.blackbird)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`application.yml`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/main/resources/application.yml)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track condition reports, startup failures, pool/client health, request latency, and graceful shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-spring-boot-hibernate-lettuce-demo:test --no-configuration-cache
```

Representative test anchors:

- [`DemoApplicationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/test/kotlin/io/bluetape4k/examples/cache/lettuce/DemoApplicationTest.kt)
- [`ReadmeDependencyContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/test/kotlin/io/bluetape4k/examples/cache/lettuce/ReadmeDependencyContractTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `1.11.0` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### Hibernate Lettuce Demo class structure diagram

[![Hibernate Lettuce Demo class structure diagram](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/spring-boot-hibernate-lettuce-demo-diagram-01.png)](../../assets/readme-diagrams/spring-boot-hibernate-lettuce-demo-diagram-01.svg)

_Release README: [`spring-boot/hibernate-lettuce-demo/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/spring-boot/hibernate-lettuce-demo/README.md)_

### Hibernate Lettuce Demo Runtime Flow diagram

[![Hibernate Lettuce Demo Runtime Flow diagram](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/spring-boot-hibernate-lettuce-demo-diagram-02.png)](../../assets/readme-diagrams/spring-boot-hibernate-lettuce-demo-diagram-02.svg)

_Release README: [`spring-boot/hibernate-lettuce-demo/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/spring-boot/hibernate-lettuce-demo/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/build.gradle.kts)
- [`DemoApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/main/kotlin/io/bluetape4k/examples/cache/lettuce/DemoApplication.kt)
- [`CacheController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/main/kotlin/io/bluetape4k/examples/cache/lettuce/controller/CacheController.kt)
- [`ProductController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/main/kotlin/io/bluetape4k/examples/cache/lettuce/controller/ProductController.kt)
- [`Product`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/main/kotlin/io/bluetape4k/examples/cache/lettuce/domain/Product.kt)
- [`ProductRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/main/kotlin/io/bluetape4k/examples/cache/lettuce/repository/ProductRepository.kt)
- [`DemoApplicationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/test/kotlin/io/bluetape4k/examples/cache/lettuce/DemoApplicationTest.kt)
- [`ReadmeDependencyContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/test/kotlin/io/bluetape4k/examples/cache/lettuce/ReadmeDependencyContractTest.kt)
