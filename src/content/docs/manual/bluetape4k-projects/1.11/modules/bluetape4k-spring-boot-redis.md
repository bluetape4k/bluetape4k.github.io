---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-redis"
manualId: bluetape4k-spring-boot-redis
title: "bluetape4k-spring-boot-redis"
description: "A module that replaces Spring Data Redis's serialization layer with high-performance binary serialization and compression combinations (Spring Boot 4.x)."
kind: library
group: spring
manual:
  id: "bluetape4k-spring-boot-redis"
  repository: "bluetape4k-projects"
  group: "spring"
  kind: "library"
  sourceCommit: "d42c9dcf3dfa8f169b3bda9c56d3c8531b3ff296"
  sourcePath: "docs/manual/en/modules/bluetape4k-spring-boot-redis.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "spring-boot/redis"
  layer: "build"
---


## Problem

A module that replaces Spring Data Redis's serialization layer with high-performance binary serialization and compression combinations (Spring Boot 4.x). This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-spring-boot-redis` when the application needs auto-configuration conditions, bean ownership, property binding, and application lifecycle. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-spring-boot-redis")
}
```

Gradle project path: `:bluetape4k-spring-boot-redis`. Source directory: `spring-boot/redis`.

## Concepts

The first source-level concepts to inspect are `RedisBinarySerializer`, `RedisBinarySerializers`, `RedisCompressSerializer`, and `RedisSerializationContextSupport`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`RedisBinarySerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/main/kotlin/io/bluetape4k/spring/redis/serializer/RedisBinarySerializer.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`RedisBinarySerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/main/kotlin/io/bluetape4k/spring/redis/serializer/RedisBinarySerializer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedisBinarySerializers`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/main/kotlin/io/bluetape4k/spring/redis/serializer/RedisBinarySerializers.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedisCompressSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/main/kotlin/io/bluetape4k/spring/redis/serializer/RedisCompressSerializer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedisSerializationContextSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/main/kotlin/io/bluetape4k/spring/redis/serializer/RedisSerializationContextSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Key Features**, **Architecture Diagrams**, **Redis Serializer Class Structure**, **ReactiveRedisTemplate Serialization Flow**, **Installation**, **Usage Examples**, **ReactiveRedisTemplate Configuration (DSL approach)**, **ReactiveRedisTemplate Configuration (convenience function approach)**, **RedisTemplate Configuration**, and **Serializer Reference**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
api(project(":bluetape4k-core"))
api(project(":bluetape4k-io"))
api("org.springframework.boot:spring-boot-starter-data-redis")
runtimeOnly(libs.fory.kotlin)
runtimeOnly(libs.kryo5)
runtimeOnly(libs.lz4.java)
runtimeOnly(libs.zstd.jni)
runtimeOnly(libs.snappy.java)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track condition reports, startup failures, pool/client health, request latency, and graceful shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-spring-boot-redis:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractRedisSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/test/kotlin/io/bluetape4k/spring/redis/serializer/AbstractRedisSerializerTest.kt)
- [`RedisBinarySerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/test/kotlin/io/bluetape4k/spring/redis/serializer/RedisBinarySerializerTest.kt)
- [`RedisBinarySerializersTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/test/kotlin/io/bluetape4k/spring/redis/serializer/RedisBinarySerializersTest.kt)
- [`RedisCompressSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/test/kotlin/io/bluetape4k/spring/redis/serializer/RedisCompressSerializerTest.kt)
- [`RedisSerializationContextSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/test/kotlin/io/bluetape4k/spring/redis/serializer/RedisSerializationContextSupportTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/build.gradle.kts)
- [`RedisBinarySerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/main/kotlin/io/bluetape4k/spring/redis/serializer/RedisBinarySerializer.kt)
- [`RedisBinarySerializers`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/main/kotlin/io/bluetape4k/spring/redis/serializer/RedisBinarySerializers.kt)
- [`RedisCompressSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/main/kotlin/io/bluetape4k/spring/redis/serializer/RedisCompressSerializer.kt)
- [`RedisSerializationContextSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/main/kotlin/io/bluetape4k/spring/redis/serializer/RedisSerializationContextSupport.kt)
- [`AbstractRedisSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/test/kotlin/io/bluetape4k/spring/redis/serializer/AbstractRedisSerializerTest.kt)
- [`RedisBinarySerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/test/kotlin/io/bluetape4k/spring/redis/serializer/RedisBinarySerializerTest.kt)
- [`RedisBinarySerializersTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/test/kotlin/io/bluetape4k/spring/redis/serializer/RedisBinarySerializersTest.kt)
- [`RedisCompressSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/test/kotlin/io/bluetape4k/spring/redis/serializer/RedisCompressSerializerTest.kt)
- [`RedisSerializationContextSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/src/test/kotlin/io/bluetape4k/spring/redis/serializer/RedisSerializationContextSupportTest.kt)
