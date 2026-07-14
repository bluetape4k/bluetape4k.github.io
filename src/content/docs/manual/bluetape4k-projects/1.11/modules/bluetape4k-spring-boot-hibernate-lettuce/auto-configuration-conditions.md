---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-hibernate-lettuce/auto-configuration-conditions"
title: Auto-configuration conditions and ordering
description: Verify when the Hibernate, Metrics, and Actuator auto-configurations register or back off in 1.11.0.
manualId: bluetape4k-spring-boot-hibernate-lettuce
chapterId: auto-configuration-conditions
manual:
  id: "bluetape4k-spring-boot-hibernate-lettuce"
  repository: "bluetape4k-projects"
  group: "spring"
  kind: "library"
  sourceCommit: "03115e34f03bad535921d3cad5cd23a2e7814581"
  sourcePath: "docs/manual/en/modules/bluetape4k-spring-boot-hibernate-lettuce/auto-configuration-conditions.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "spring-boot/hibernate-lettuce"
  layer: "build"
  chapterId: "auto-configuration-conditions"
---


## Three configuration classes

`AutoConfiguration.imports` registers three classes:

1. `LettuceNearCacheHibernateAutoConfiguration`
2. `LettuceNearCacheMetricsAutoConfiguration`
3. `LettuceNearCacheActuatorAutoConfiguration`

The first creates a `HibernatePropertiesCustomizer`. The other two add observation after Hibernate setup. Metrics and Actuator also declare ordering after Spring Boot JPA auto-configuration.

## Hibernate configuration conditions

The Hibernate configuration requires `LettuceNearCacheRegionFactory` and `EntityManagerFactory` on the classpath. `bluetape4k.cache.lettuce-near.enabled` must be `true` or absent.

It does not wait for an `EntityManagerFactory` bean because the customizer must contribute properties before that factory is created. `ApplicationContextRunner` proves that `enabled=false` removes the customizer.

```yaml
bluetape4k:
  cache:
    lettuce-near:
      enabled: false
```

## Metrics configuration conditions

The metrics binder requires the RegionFactory, `EntityManagerFactory`, and `MeterRegistry` classes plus actual `EntityManagerFactory` and `MeterRegistry` beans. `bluetape4k.cache.lettuce-near.metrics.enabled` must be true or absent.

If the application has no Actuator starter or creates no registry, the cache may still work while the binder backs off. That is an optional-feature condition, not a cache failure.

## Actuator configuration conditions

The endpoint requires the `Endpoint`, RegionFactory, and `EntityManagerFactory` classes, an actual `EntityManagerFactory` bean, and the top-level `enabled` setting. It does not check the metrics setting. An endpoint bean may therefore exist while metrics are disabled, and its L2 fields may be `null` when Hibernate statistics are off.

HTTP exposure is separate from bean registration.

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,nearcache
```

## Diagnostic order

1. Find all three names in the Spring Boot condition evaluation report.
2. Check top-level `enabled` separately from metrics `enabled`.
3. Verify runtime presence of `spring-boot-hibernate`, the JPA starter, and Actuator.
4. Check the `EntityManagerFactory` and `MeterRegistry` beans.
5. If the bean exists but HTTP does not, check management exposure.

## Executable evidence

- [`AutoConfiguration.imports`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports)
- [`LettuceNearCacheHibernateAutoConfiguration.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheHibernateAutoConfiguration.kt)
- [`LettuceNearCacheMetricsAutoConfiguration.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheMetricsAutoConfiguration.kt)
- [`LettuceNearCacheActuatorAutoConfiguration.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/main/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheActuatorAutoConfiguration.kt)
- [`LettuceNearCacheAutoConfigurationTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/hibernate-lettuce/src/test/kotlin/io/bluetape4k/spring/boot/autoconfigure/cache/lettuce/LettuceNearCacheAutoConfigurationTest.kt)
