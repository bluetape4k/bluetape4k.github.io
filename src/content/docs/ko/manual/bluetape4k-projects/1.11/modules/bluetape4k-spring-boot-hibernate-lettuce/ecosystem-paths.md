---
slug: "ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-hibernate-lettuce/ecosystem-paths"
title: 생태계에서 다음 선택
description: Spring Boot 자동 구성에서 하위 cache provider, demo, Hibernate와 Redis 운영 자료로 이어지는 경로를 정리합니다.
manualId: bluetape4k-spring-boot-hibernate-lettuce
chapterId: ecosystem-paths
manual:
  id: "bluetape4k-spring-boot-hibernate-lettuce"
  repository: "bluetape4k-projects"
  group: "spring"
  kind: "library"
  sourceCommit: "e1463bff0f864add7c54b7188f492cfe36336cdd"
  sourcePath: "docs/manual/ko/modules/bluetape4k-spring-boot-hibernate-lettuce/ecosystem-paths.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "spring-boot/hibernate-lettuce"
  layer: "build"
  chapterId: "ecosystem-paths"
---


## 이 모듈의 위치

이 모듈은 Spring Boot와 Hibernate cache provider 사이의 adapter입니다.

```text
Spring Boot properties / conditions
        ↓
bluetape4k-spring-boot-hibernate-lettuce
        ↓ Hibernate properties
bluetape4k-hibernate-cache-lettuce
        ↓
bluetape4k-cache-lettuce + Redis/Lettuce
```

문제가 어느 계층에 있는지에 따라 읽을 저장소와 테스트가 달라집니다.

## 하위 cache 구현으로 내려가기

region 생성, key, serialization, Caffeine L1과 Redis L2, invalidation을 이해하려면 [`bluetape4k-hibernate-cache-lettuce`](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate-cache-lettuce/) 매뉴얼로 이동합니다. Spring 없이 Hibernate property로 직접 구성할 때도 이 모듈이 실제 진입점입니다.

일반적인 coroutine Near Cache와 Lettuce client API가 목적이라면 Hibernate adapter를 거치지 말고 `bluetape4k-cache-lettuce`와 `bluetape4k-lettuce`를 검토합니다. ORM transaction이나 entity region이 없는 cache에 Hibernate를 끌어들이지 않습니다.

## 실행 가능한 Spring Boot 예제

[`bluetape4k-spring-boot-hibernate-lettuce-demo`](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-hibernate-lettuce-demo/)는 Product entity, Spring Data repository, CRUD controller, cache statistics endpoint와 실제 `application.yml`을 한 애플리케이션에 연결합니다.

도입 순서는 다음처럼 잡을 수 있습니다.

1. demo의 설정과 entity annotation을 읽습니다.
2. 이 매뉴얼의 context test로 애플리케이션 property를 검증합니다.
3. 실제 Redis와 database로 miss→put→hit를 확인합니다.
4. Actuator와 Micrometer dashboard를 운영 환경에 맞게 제한해 노출합니다.

## ORM 선택으로 돌아가기

2차 캐시는 ORM의 조회 비용을 줄이는 선택이지 ORM 자체를 선택하는 이유는 아닙니다. entity lifecycle, lazy loading과 transaction이 필요한지 먼저 [`bluetape4k-hibernate`](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate/) 매뉴얼에서 확인합니다.

SQL을 직접 통제하려면 [`bluetape4k-jdbc`](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-jdbc/), non-blocking database driver가 필요하면 [`bluetape4k-r2dbc`](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-r2dbc/)를 비교합니다. Kotlin SQL DSL과 repository 생태계가 필요하면 [bluetape4k-exposed](https://github.com/bluetape4k/bluetape4k-exposed) 저장소로 이어집니다. 이 선택들에는 Hibernate 2차 캐시가 그대로 적용되지 않습니다.

## 공식 자료

- [Spring Boot reference documentation](https://docs.spring.io/spring-boot/reference/)
- [Spring Boot Actuator endpoints](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html)
- [Hibernate ORM caching](https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#caching)
- [Redis client-side caching](https://redis.io/docs/latest/develop/reference/client-side-caching/)
- [Lettuce reference guide](https://redis.github.io/lettuce/)

외부 문서는 현재 버전 기준으로 바뀔 수 있습니다. 이 매뉴얼의 1.11.0 동작을 판단할 때는 아래 release source와 test를 우선합니다.

## 1.11.0 소스 지도

- [Spring Boot adapter source](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheHibernateAutoConfiguration.kt)
- [Hibernate cache provider source](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/hibernate-cache-lettuce/src/main/kotlin/io/bluetape4k/hibernate/cache/lettuce/LettuceNearCacheRegionFactory.kt)
- [Spring Boot 데모 매뉴얼](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-hibernate-lettuce-demo/)
- [`LettuceNearCacheIntegrationTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/test/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheIntegrationTest.kt)
