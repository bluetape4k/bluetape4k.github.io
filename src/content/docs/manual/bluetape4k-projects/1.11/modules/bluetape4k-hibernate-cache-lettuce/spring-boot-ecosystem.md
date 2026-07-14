---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate-cache-lettuce/spring-boot-ecosystem"
title: Spring Boot and ecosystem paths
description: Adopt Spring Boot auto-configuration and demos, then choose Hibernate, Lettuce, or Exposed cache learning paths.
manualId: bluetape4k-hibernate-cache-lettuce
chapterId: spring-boot-ecosystem
manual:
  id: "bluetape4k-hibernate-cache-lettuce"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "46993c010f5bef45fef0943bbc93728d16119bd5"
  sourcePath: "docs/manual/en/modules/bluetape4k-hibernate-cache-lettuce/spring-boot-ecosystem.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "cache/hibernate-cache-lettuce"
  layer: "build"
  chapterId: "spring-boot-ecosystem"
---


## Separate the provider from auto-configuration

This module contains the Hibernate RegionFactory. Add the separate Spring Boot artifact for property binding, `HibernatePropertiesCustomizer`, Micrometer, and Actuator.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-spring-boot-hibernate-lettuce")
}
```

The Boot module exposes the core provider as an API dependency; consumers still manage only the central BOM.

```yaml
bluetape4k:
  cache:
    lettuce-near:
      redis-uri: redis://localhost:6379
      codec: lz4fory
      use-resp3: true
      local:
        max-size: 10000
        expire-after-write: 30m
      redis-ttl:
        default: 120s
        regions:
          io.example.Product: 300s
      metrics:
        enabled: true
        enable-caffeine-stats: true
```

Auto-configuration maps these values to `hibernate.cache.lettuce.*` and enables second-level caching. `enabled=false` backs it off. Metrics also enables Hibernate statistics, so measure its production cost.

## Runnable demo

[bluetape4k-spring-boot-hibernate-lettuce-demo](/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-hibernate-lettuce-demo/) contains a Product entity, Spring Data repository, cache controller, and real configuration. Verify the provider contract with core tests, then use the demo to connect HTTP requests to cache statistics.

```bash
./gradlew :bluetape4k-spring-boot-hibernate-lettuce-demo:bootRun
```

Do not copy demo settings directly into production. Redis authentication and TLS, database migration, TTL, pools, and observability remain deployment decisions.

## Choose the next path

| Learning goal | Continue with | Why |
| --- | --- | --- |
| Entity and transaction basics | [bluetape4k-hibernate](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate/) | Understand ORM lifecycle before caching it. |
| Direct Near Cache use | [bluetape4k-cache-lettuce](/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-lettuce/) | Use cache APIs outside Hibernate regions. |
| Redis commands and codecs | [bluetape4k-lettuce](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/) | Inspect the Lettuce client and serialization layer. |
| Boot Metrics and Actuator | [Spring Boot Hibernate Lettuce](/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-hibernate-lettuce/) | Add auto-configuration and operational endpoints. |
| Repository cache strategies | [exposed-workshop](https://github.com/bluetape4k/exposed-workshop) | Compare cache-aside and read/write-through around repositories. |

Hibernate second-level caching owns entity state and query results inside the Hibernate lifecycle. The Exposed workshop's `JdbcCacheRepository`, `EntityMapLoader`, and `EntityMapWriter` instead put read-through, write-through, or write-behind ownership in an application repository. These are different ownership models, not interchangeable labels.

## Sources and links

- [`LettuceNearCacheHibernateAutoConfiguration.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheHibernateAutoConfiguration.kt)
- [`LettuceNearCacheSpringProperties.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheSpringProperties.kt)
- [Demo `application.yml`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce-demo/src/main/resources/application.yml)
- [bluetape4k-exposed repository](https://github.com/bluetape4k/bluetape4k-exposed)
- [exposed-workshop](https://github.com/bluetape4k/exposed-workshop)
