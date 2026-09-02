---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-testcontainers-spring"
manualId: bluetape4k-testcontainers-spring
title: "Spring Testcontainers Property Bridge"
description: "Connect PropertyExportingServer properties to Spring Test's DynamicPropertyRegistry without changing core server lifecycle or JVM system properties."
kind: library
group: testing
learningOrder: 1150
manual:
  id: "bluetape4k-testcontainers-spring"
  repository: "bluetape4k-projects"
  group: "testing"
  kind: "library"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-testcontainers-spring.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "testing/testcontainers-spring"
  layer: "build"
  learningOrder: 1150
---


## Problem

Spring integration tests often need container endpoints as dynamic application properties. The core `bluetape4k-testcontainers` module deliberately remains independent of Spring, so a test needs a small adapter that preserves the core property contract while registering values with Spring Test.

## When to use

Use `bluetape4k-testcontainers-spring` when a Spring Test context consumes properties exported by a `PropertyExportingServer`. Use the core module's `registerSystemProperties()` API instead when the test explicitly needs JVM system properties. Do not add this bridge to a non-Spring test or expect it to start, stop, or configure a container.

## Coordinates

```kotlin
dependencies {
    testImplementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    testImplementation("io.github.bluetape4k:bluetape4k-testcontainers-spring")
}
```

Gradle project path: `:bluetape4k-testcontainers-spring`. Source directory: `testing/testcontainers-spring`.

## Concepts

`PropertyExportingServer` supplies a `propertyNamespace`, a set of `propertyKeys()`, and the current `properties()`. The bridge maps each key to `testcontainers.{namespace}.{key}` and registers a lazy supplier with Spring's `DynamicPropertyRegistry`. The bridge owns only registration; the test still owns the server lifecycle.

## Quick start

Register a server from a static `@DynamicPropertySource` method:

```kotlin
import io.bluetape4k.testcontainers.spring.registerDynamicProperties
import io.bluetape4k.testcontainers.storage.RedisServer
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource

companion object {
    @DynamicPropertySource
    @JvmStatic
    fun registerProperties(registry: DynamicPropertyRegistry) {
        RedisServer.Launcher.redis.registerDynamicProperties(registry)
    }
}
```

Start and stop `RedisServer.Launcher.redis` through the test's existing lifecycle. The bridge reads values only when Spring evaluates the registered supplier.

## API by task

| Task | Entry point | Contract |
| --- | --- | --- |
| Register server properties with Spring | `PropertyExportingServer.registerDynamicProperties(registry)` | Registers one lazy supplier for every key returned by `propertyKeys()`. |
| Keep core and Spring boundaries separate | `PropertyExportingServer` from `bluetape4k-testcontainers` | Reuses the core namespace and property map without adding Spring to the core module. |

## Patterns

Call the extension once from the test's `@DynamicPropertySource` method and keep container startup in the server launcher or test fixture. Because suppliers are lazy and uncached, a value is read from `properties()` for each Spring evaluation. Use one registration path for a key when possible; duplicate registrations are passed to Spring's registry ordering semantics rather than overwritten by this bridge.

## Integrations

The module depends on `bluetape4k-testcontainers` for `PropertyExportingServer` and on Spring Test for `DynamicPropertyRegistry`. It is an optional adapter, not Spring Boot auto-configuration. The release catalog supplies the compatible Spring Test version; consumers should not pin a separate version for this module.

## Configuration

No additional configuration file or system property is introduced. A server with namespace `redis` and key `host` is exposed as `testcontainers.redis.host`. The source namespace and key set remain the core server's responsibility.

## Failures

If `propertyKeys()` declares a key that is absent from `properties()`, the supplier throws `IllegalStateException` when Spring evaluates the value. Exceptions raised by `properties()` are propagated with their original type and message. The bridge does not preflight duplicate keys, cache values, or translate server exceptions.

## Operations

The bridge does not start or stop containers and does not mutate JVM system properties. Keep resource ownership, readiness, shutdown, and diagnostics in the existing `PropertyExportingServer` launcher or test fixture. This keeps Spring context setup independent from container lifecycle decisions.

## Testing

Run the focused module tests:

```bash
./gradlew :bluetape4k-testcontainers-spring:test --no-configuration-cache
```

[`PropertyExportingServerDynamicPropertyRegistryTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/testing/testcontainers-spring/src/test/kotlin/io/bluetape4k/testcontainers/spring/PropertyExportingServerDynamicPropertyRegistryTest.kt) verifies key mapping, lazy and repeated supplier evaluation, missing-key failures, exception propagation, duplicate registration delegation, and JVM system property preservation without Docker.

## Workshops

No dedicated workshop is registered for this adapter. The module README and focused contract test provide the runnable usage and lifecycle evidence.

## Limitations

This module supports Spring Test's dynamic property registry only. It does not provide Spring Boot auto-configuration, container startup, property caching, collision resolution, or migration of existing workshop helpers. Recheck the server's property contract when the core module changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/testing/testcontainers-spring/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/testing/testcontainers-spring/build.gradle.kts)
- [`PropertyExportingServerDynamicPropertyRegistry`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/testing/testcontainers-spring/src/main/kotlin/io/bluetape4k/testcontainers/spring/PropertyExportingServerDynamicPropertyRegistry.kt)
- [`PropertyExportingServerDynamicPropertyRegistryTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/testing/testcontainers-spring/src/test/kotlin/io/bluetape4k/testcontainers/spring/PropertyExportingServerDynamicPropertyRegistryTest.kt)
- [`PropertyExportingServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/PropertyExportingServer.kt)
