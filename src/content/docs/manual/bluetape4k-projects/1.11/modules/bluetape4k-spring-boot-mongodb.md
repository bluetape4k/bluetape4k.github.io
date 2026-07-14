---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-mongodb"
manualId: bluetape4k-spring-boot-mongodb
title: "Module bluetape4k-spring-boot-mongodb"
description: "An extension library for working with Spring Data MongoDB Reactive using Kotlin Coroutines (Spring Boot 4.x)."
kind: library
group: spring
manual:
  id: "bluetape4k-spring-boot-mongodb"
  repository: "bluetape4k-projects"
  group: "spring"
  kind: "library"
  sourceCommit: "46993c010f5bef45fef0943bbc93728d16119bd5"
  sourcePath: "docs/manual/en/modules/bluetape4k-spring-boot-mongodb.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "spring-boot/mongodb"
  layer: "build"
---


## Problem

An extension library for working with Spring Data MongoDB Reactive using Kotlin Coroutines (Spring Boot 4.x). This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-spring-boot-mongodb` when the application needs auto-configuration conditions, bean ownership, property binding, and application lifecycle. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-spring-boot-mongodb")
}
```

Gradle project path: `:bluetape4k-spring-boot-mongodb`. Source directory: `spring-boot/mongodb`.

## Concepts

The first source-level concepts to inspect are `ReactiveMongoAutoConfiguration`, `ReactiveMongoOperationsCoroutines`, `CriteriaExtensions`, `QueryExtensions`, and `UpdateExtensions`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`ReactiveMongoAutoConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/config/ReactiveMongoAutoConfiguration.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`ReactiveMongoAutoConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/config/ReactiveMongoAutoConfiguration.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ReactiveMongoOperationsCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/coroutines/ReactiveMongoOperationsCoroutines.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CriteriaExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/CriteriaExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`QueryExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/QueryExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`UpdateExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/UpdateExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Features**, **Diagrams**, **Core Class Structure**, **ReactiveMongoOperations Coroutine Extension Flow**, **Criteria / Query / Update DSL Flow**, **Coroutine Conversion Sequence**, **Installation**, **Usage Examples**, **ReactiveMongoOperations Coroutine Extensions**, and **Criteria infix DSL**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
api(project(":bluetape4k-spring-boot-core"))
implementation(libs.mongodb.driver.kotlin.sync)
implementation(libs.mongodb.driver.kotlin.coroutine)
implementation(libs.mongodb.driver.kotlin.extensions)
api("org.springframework.boot:spring-boot-starter-data-mongodb-reactive")
compileOnly("org.springframework.boot:spring-boot-autoconfigure")
compileOnly("org.springframework.boot:spring-boot-configuration-processor")
api(project(":bluetape4k-coroutines"))
api(libs.kotlinx.coroutines.core)
api(libs.kotlinx.coroutines.reactor)
implementation(libs.reactor.core)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`org.springframework.boot.autoconfigure.AutoConfiguration.imports`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track condition reports, startup failures, pool/client health, request latency, and graceful shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-spring-boot-mongodb:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractReactiveMongoCoroutineTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/AbstractReactiveMongoCoroutineTest.kt)
- [`AbstractReactiveMongoTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/AbstractReactiveMongoTest.kt)
- [`MongoTestApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/MongoTestApplication.kt)
- [`ReactiveMongoOperationsCoroutinesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/coroutines/ReactiveMongoOperationsCoroutinesTest.kt)
- [`User`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/model/User.kt)
- [`CriteriaExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/query/CriteriaExtensionsTest.kt)
- [`QueryExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/query/QueryExtensionsTest.kt)
- [`UpdateExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/query/UpdateExtensionsTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/build.gradle.kts)
- [`ReactiveMongoAutoConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/config/ReactiveMongoAutoConfiguration.kt)
- [`ReactiveMongoOperationsCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/coroutines/ReactiveMongoOperationsCoroutines.kt)
- [`CriteriaExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/CriteriaExtensions.kt)
- [`QueryExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/QueryExtensions.kt)
- [`UpdateExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/UpdateExtensions.kt)
- [`AbstractReactiveMongoCoroutineTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/AbstractReactiveMongoCoroutineTest.kt)
- [`AbstractReactiveMongoTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/AbstractReactiveMongoTest.kt)
- [`MongoTestApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/MongoTestApplication.kt)
- [`ReactiveMongoOperationsCoroutinesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/coroutines/ReactiveMongoOperationsCoroutinesTest.kt)
- [`User`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/model/User.kt)
- [`CriteriaExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/query/CriteriaExtensionsTest.kt)
- [`QueryExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/query/QueryExtensionsTest.kt)
