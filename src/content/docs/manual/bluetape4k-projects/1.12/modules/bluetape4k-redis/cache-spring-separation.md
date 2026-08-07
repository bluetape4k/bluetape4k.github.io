---
slug: "manual/bluetape4k-projects/1.12/modules/bluetape4k-redis/cache-spring-separation"
title: Separating cache providers and Spring Data Redis
description: Distinguish Redis client helpers from cache abstractions, Hibernate caching, and Spring Data Redis serializers.
manualId: bluetape4k-redis
chapterId: cache-spring-separation
manual:
  id: "bluetape4k-redis"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "ffde7b8be16124b1c538bb318a7d482927f738ad"
  sourcePath: "docs/manual/en/modules/bluetape4k-redis/cache-spring-separation.md"
  minorVersion: "1.12"
  releaseRef: "1.12.1"
  releaseCommit: "7cf0b73646af05c0f8872cc4f6a16983949c4e3e"
  sourceDir: "infra/redis"
  layer: "build"
  learningOrder: 550
  chapterId: "cache-spring-separation"
  chapterOrder: 5
---


## A Redis client is not a cache provider

`bluetape4k-lettuce` and `bluetape4k-redisson` provide clients and client-specific helpers. The umbrella only exports both modules. Function-result memoization, cache-aside loaders and writers, Spring Cache managers, and Hibernate second-level caching are separate concerns.

| Capability | Module | Relationship to the umbrella |
| --- | --- | --- |
| Lettuce commands and coroutines | `bluetape4k-lettuce` | Exported by the umbrella |
| Redisson objects and Near Cache | `bluetape4k-redisson` | Exported by the umbrella |
| Cache abstraction with Lettuce | `bluetape4k-cache-lettuce` | Separate artifact |
| Cache abstraction with Redisson | `bluetape4k-cache-redisson` | Separate artifact |
| Hibernate second-level cache | `bluetape4k-hibernate-cache-lettuce` | Separate provider and region lifecycle |
| Spring Data Redis serializers | `bluetape4k-spring-boot-redis` | Separate Spring Boot module |

## Choose a cache abstraction deliberately

Start with a client module when application code executes key-value commands directly. Use a cache module when the application needs shared TTL policy, function-result reuse, or loader/writer behavior. An `RMapCache` alone does not provide database read-through; verify that actual `MapLoader` and `MapWriter` implementations are connected.

The [Cache Core manual](/manual/bluetape4k-projects/1.12/modules/bluetape4k-cache-core/) explains cache-aside, stampede control, Near Cache, and failure contracts independently of a provider. Confirm that the abstraction is needed before selecting a provider.

## Spring Data Redis is a separate entry point

`bluetape4k-spring-boot-redis` supplies serializers and serialization contexts for `RedisTemplate` and `ReactiveRedisTemplate`. Its dependencies and Spring lifecycle are separate from the two-client bundle.

Spring Data Redis may use Lettuce internally without the application calling bluetape4k Lettuce helpers. An application may also use Redisson together with the serializer module, but it must still manage two client pools and serialization boundaries.

## Dependency example

Do not add the umbrella when only Spring Data serializers are required.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-spring-boot-redis")
}
```

For a Lettuce-backed cache abstraction, depend on `bluetape4k-cache-lettuce`. It already declares its required Lettuce dependency, so adding the umbrella is redundant.

## Continue to the focused manuals

- [Lettuce Cache](/manual/bluetape4k-projects/1.12/modules/bluetape4k-cache-lettuce/)
- [Redisson Cache](/manual/bluetape4k-projects/1.12/modules/bluetape4k-cache-redisson/)
- [Hibernate Cache Lettuce](/manual/bluetape4k-projects/1.12/modules/bluetape4k-hibernate-cache-lettuce/)
- [Spring Boot Redis](/manual/bluetape4k-projects/1.12/modules/bluetape4k-spring-boot-redis/)

## Release sources

- [`cache/cache-lettuce/build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/cache/cache-lettuce/build.gradle.kts)
- [`cache/cache-redisson/build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/cache/cache-redisson/build.gradle.kts)
- [`spring-boot/redis/build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/spring-boot/redis/build.gradle.kts)
