---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-hibernate-lettuce"
manualId: bluetape4k-spring-boot-hibernate-lettuce
title: "bluetape4k-spring-boot-hibernate-lettuce"
description: "Spring Boot 4 Auto-Configuration for Hibernate 7 2nd Level Cache (Lettuce Near Cache)."
kind: library
group: spring
manual:
  id: "bluetape4k-spring-boot-hibernate-lettuce"
  repository: "bluetape4k-projects"
  group: "spring"
  kind: "library"
  sourceCommit: "073ab365abcd91889ecd82d0077522cac2f13e15"
  sourcePath: "docs/manual/en/modules/bluetape4k-spring-boot-hibernate-lettuce.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "spring-boot/hibernate-lettuce"
  layer: "build"
---


## Problem

Spring Boot 4 Auto-Configuration for Hibernate 7 2nd Level Cache (Lettuce Near Cache). This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-spring-boot-hibernate-lettuce` when the application needs auto-configuration conditions, bean ownership, property binding, and application lifecycle. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-spring-boot-hibernate-lettuce")
}
```

Gradle project path: `:bluetape4k-spring-boot-hibernate-lettuce`. Source directory: `spring-boot/hibernate-lettuce`.

## Concepts

The first source-level concepts to inspect are `LettuceNearCacheActuatorAutoConfiguration`, `LettuceNearCacheActuatorEndpoint`, `LettuceNearCacheHibernateAutoConfiguration`, `LettuceNearCacheMetricsAutoConfiguration`, `LettuceNearCacheMetricsBinder`, and `LettuceNearCacheSpringProperties`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`LettuceNearCacheActuatorAutoConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheActuatorAutoConfiguration.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`LettuceNearCacheActuatorAutoConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheActuatorAutoConfiguration.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`LettuceNearCacheActuatorEndpoint`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheActuatorEndpoint.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`LettuceNearCacheHibernateAutoConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheHibernateAutoConfiguration.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`LettuceNearCacheMetricsAutoConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheMetricsAutoConfiguration.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`LettuceNearCacheMetricsBinder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheMetricsBinder.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`LettuceNearCacheSpringProperties`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheSpringProperties.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Auto-Configuration Class Structure**, **Auto-Configuration Activation Flow**, **Spring Boot 4 Notes**, **Features**, **Dependencies (Spring Boot 4)**, **Quick Start**, **1. Add the dependency and configure application.yml**, **2. Annotate your entities for caching**, **3. Run — auto-configuration takes care of the rest**, and **Full Configuration Options**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
api(project(":bluetape4k-hibernate-cache-lettuce"))
compileOnly("org.springframework.boot:spring-boot-autoconfigure")
compileOnly("org.springframework.boot:spring-boot-hibernate")
compileOnly("org.springframework.boot:spring-boot-starter-data-jpa")
compileOnly(libs.hibernate.core)
compileOnly(libs.micrometer.core)
compileOnly("org.springframework.boot:spring-boot-starter-actuator")
compileOnly("org.springframework.boot:spring-boot-micrometer-metrics")
implementation(libs.fory.kotlin)
implementation(libs.zstd.jni)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`org.springframework.boot.autoconfigure.AutoConfiguration.imports`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track condition reports, startup failures, pool/client health, request latency, and graceful shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-spring-boot-hibernate-lettuce:test --no-configuration-cache
```

Representative test anchors:

- [`LettuceNearCacheAutoConfigurationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/test/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheAutoConfigurationTest.kt)
- [`LettuceNearCacheIntegrationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/test/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheIntegrationTest.kt)
- [`LettuceNearCachePropertiesCustomizerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/test/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCachePropertiesCustomizerTest.kt)
- [`ReadmeDependencyContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/test/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/ReadmeDependencyContractTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/build.gradle.kts)
- [`LettuceNearCacheActuatorAutoConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheActuatorAutoConfiguration.kt)
- [`LettuceNearCacheActuatorEndpoint`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheActuatorEndpoint.kt)
- [`LettuceNearCacheHibernateAutoConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheHibernateAutoConfiguration.kt)
- [`LettuceNearCacheMetricsAutoConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheMetricsAutoConfiguration.kt)
- [`LettuceNearCacheMetricsBinder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheMetricsBinder.kt)
- [`LettuceNearCacheSpringProperties`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheSpringProperties.kt)
- [`LettuceNearCacheAutoConfigurationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/test/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheAutoConfigurationTest.kt)
- [`LettuceNearCacheIntegrationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/test/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheIntegrationTest.kt)
- [`LettuceNearCachePropertiesCustomizerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/test/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCachePropertiesCustomizerTest.kt)
- [`ReadmeDependencyContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/test/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/ReadmeDependencyContractTest.kt)
