---
slug: "ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-redis/cache-spring-separation"
title: Cache provider와 Spring Data Redis 분리
description: Redis client helper, cache abstraction, Hibernate cache와 Spring Data Redis serializer의 역할을 구분합니다.
manualId: bluetape4k-redis
chapterId: cache-spring-separation
manual:
  id: "bluetape4k-redis"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "d6eb7f6e617535286959f850024052ad0ca96738"
  sourcePath: "docs/manual/ko/modules/bluetape4k-redis/cache-spring-separation.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/redis"
  layer: "build"
  learningOrder: 550
  chapterId: "cache-spring-separation"
  chapterOrder: 5
---


## Redis client가 곧 cache provider는 아니다

`bluetape4k-lettuce`와 `bluetape4k-redisson`은 Redis client와 client-specific helper를 제공합니다. `bluetape4k-redis`는 이 두 모듈을 함께 내보낼 뿐입니다. 함수 결과 memoization, cache-aside loader/writer, Spring Cache manager나 Hibernate 2차 cache는 별도 문제입니다.

| 필요한 기능 | 선택할 모듈 | 우산 모듈과의 관계 |
| --- | --- | --- |
| Lettuce command와 coroutine | `bluetape4k-lettuce` | 우산이 함께 내보냄 |
| Redisson 분산 객체와 Near Cache | `bluetape4k-redisson` | 우산이 함께 내보냄 |
| cache abstraction과 Lettuce backend | `bluetape4k-cache-lettuce` | 별도 artifact |
| cache abstraction과 Redisson backend | `bluetape4k-cache-redisson` | 별도 artifact |
| Hibernate 2차 cache | `bluetape4k-hibernate-cache-lettuce` | 별도 provider·region lifecycle |
| Spring Data Redis serializer | `bluetape4k-spring-boot-redis` | 별도 Spring Boot module |

## Cache abstraction을 고를 때

애플리케이션이 key-value command를 직접 실행한다면 client module에서 시작합니다. 동일 함수의 결과를 TTL로 재사용하거나 loader/writer와 cache-aside 정책을 공통화하려면 cache module을 선택합니다. Redisson `RMapCache`를 쓴다고 DB read-through가 자동으로 생기는 것도 아닙니다. 실제 `MapLoader`와 `MapWriter` 연결 여부를 확인합니다.

[Cache Core 매뉴얼](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-core/)은 cache-aside, stampede, Near Cache와 실패 계약을 provider와 분리해 설명합니다. provider 선택 전에 이 추상화가 필요한지 먼저 확인합니다.

## Spring Data Redis는 별도 진입점이다

`bluetape4k-spring-boot-redis`는 `RedisTemplate`과 `ReactiveRedisTemplate`에 쓸 serializer와 serialization context를 제공합니다. 이 모듈의 dependency와 auto-configuration lifecycle은 `bluetape4k-redis`의 두-client 묶음과 별개입니다.

Spring Data Redis가 Lettuce를 내부 driver로 사용하더라도 애플리케이션이 `bluetape4k-lettuce` helper를 직접 사용한다는 뜻은 아닙니다. 반대로 Redisson client를 쓰면서 Spring Data serializer module을 함께 사용할 수도 있지만 두 client pool과 serialization 경계를 따로 관리해야 합니다.

## 의존성 예제

Spring Data serializer만 필요하다면 우산 좌표를 추가하지 않습니다.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-spring-boot-redis")
}
```

Lettuce 기반 cache abstraction이 필요하면 `bluetape4k-cache-lettuce`를 선택합니다. 그 모듈이 필요한 Lettuce dependency를 이미 선언하므로 우산 좌표를 중복해서 추가할 이유가 없습니다.

## 다음 매뉴얼

- [Lettuce Cache](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-lettuce/)
- [Redisson Cache](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-redisson/)
- [Hibernate Cache Lettuce](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate-cache-lettuce/)
- [Spring Boot Redis](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-redis/)

## Release sources

- [`cache/cache-lettuce/build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-lettuce/build.gradle.kts)
- [`cache/cache-redisson/build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-redisson/build.gradle.kts)
- [`spring-boot/redis/build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/redis/build.gradle.kts)
