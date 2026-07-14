---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-redis/umbrella-dependency-contract"
title: Umbrella dependency contract
description: Distinguish the two exported artifacts from capabilities that bluetape4k-redis does not provide.
manualId: bluetape4k-redis
chapterId: umbrella-dependency-contract
manual:
  id: "bluetape4k-redis"
  repository: "bluetape4k-projects"
  group: "infrastructure"
  kind: "library"
  sourceCommit: "03115e34f03bad535921d3cad5cd23a2e7814581"
  sourcePath: "docs/manual/en/modules/bluetape4k-redis/umbrella-dependency-contract.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/redis"
  layer: "build"
  chapterId: "umbrella-dependency-contract"
---


## Two lines define the public contract

At 1.11.0, [`infra/redis/build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/redis/build.gradle.kts) declares only these dependencies:

```kotlin
dependencies {
    api(project(":bluetape4k-lettuce"))
    api(project(":bluetape4k-redisson"))
}
```

Because they use Gradle's `api` configuration, consumers can compile against public Lettuce and Redisson types, and both artifacts enter the runtime classpath. The umbrella does not select separate versions for those artifacts. The central `bluetape4k-dependencies` BOM aligns them as one release set.

## What the umbrella does not contain

`infra/redis` has no Kotlin or Java files under `src/main` or `src/test`. Do not attribute these capabilities to the umbrella:

- a common `RedisClient` facade or automatic client selection;
- failover between Lettuce and Redisson;
- a shared Codec or key migration mechanism;
- Spring beans, properties, or auto-configuration;
- a Spring Cache provider or database loader/writer;
- a dedicated test suite for the umbrella layer.

The real APIs and failure contracts belong to the [Lettuce manual](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/) and [Redisson manual](/manual/bluetape4k-projects/1.11/modules/bluetape4k-redisson/).

## When one coordinate helps

An application that already uses both client families can preserve its dependency entry point. The umbrella also keeps both APIs available during a migration from Redisson to Lettuce or in the opposite direction.

For a new service that uses only Lettuce commands, however, the umbrella also brings unused Redisson and its transitive dependencies. A direct client coordinate describes that build and operational responsibility more accurately.

## Inspect the build

```bash
./gradlew :application:dependencies --configuration runtimeClasspath
```

Confirm that both artifacts appear in the dependency report. A class being present does not prove that the runtime creates a client instance. Inspect source usages and Spring bean definitions separately.

## Release sources

- [`infra/redis/build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/redis/build.gradle.kts)
- [`infra/redis/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/redis/README.md)
- [`infra/lettuce/build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/build.gradle.kts)
- [`infra/redisson/build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/redisson/build.gradle.kts)
