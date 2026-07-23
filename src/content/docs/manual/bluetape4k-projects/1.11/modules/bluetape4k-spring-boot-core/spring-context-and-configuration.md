---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-core/spring-context-and-configuration"
title: Spring Context and configuration helpers
description: Explains merged annotations, BeanFactory, profiles, property helpers, and the boundaries that are not auto-configured.
manualId: bluetape4k-spring-boot-core
chapterId: spring-context-and-configuration
manual:
  id: "modules/bluetape4k-spring-boot-core/spring-context-and-configuration"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "3a97a3fc2f3525c3a3384d511a9adb8571b0b680"
  sourcePath: "docs/manual/en/modules/bluetape4k-spring-boot-core/spring-context-and-configuration.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "docs/manual"
  layer: "build"
---


## Use Spring semantics with Kotlin syntax

The Context helpers do not redefine Spring behavior. `findMergedAnnotationOrNull<A>()` delegates to `AnnotatedElementUtils.findMergedAnnotation`, `BeanFactory.get<T>()` calls Spring `getBean<T>()`, and `PropertyResolver.getAs<T>()` uses Spring conversion. They remove repeated `Class<T>` arguments from Kotlin call sites.

```kotlin
val requestMapping = method.findMergedAnnotationOrNull<RequestMapping>()
val timeout = environment.getAs<Duration>("client.timeout", Duration.ofSeconds(3))
```

Merged lookup includes meta-annotations and `@AliasFor` merging. It has a wider search contract than a direct `getAnnotation`, so choose Spring's find or get semantics deliberately.

## Distinguish a missing bean from ambiguity

The `BeanFactory.findOrNull` family changes only `NoSuchBeanDefinitionException` into `null`. It rethrows `NoUniqueBeanDefinitionException`; an ambiguous choice is not treated as an absent optional integration.

```kotlin
val registry = beanFactory.findOrNull<ObservationRegistry>()
```

Use `get<T>()` when exactly one bean is required. Use `findOrNull` only for optional integration, and select among valid candidates with a name or `@Qualifier`.

## Profile meta-annotations

`LocalProfile`, `DevelopProfile`, `FeatureProfile`, `TestProfile`, `QaProfile`, `StageProfile`, and `ProductionProfile` are Spring `@Profile` meta-annotations.

```kotlin
@Configuration
@ProductionProfile
class ProductionClientConfiguration
```

`DevelopProfile` matches `dev`, `develop`, or `development`. `ProductionProfile` matches `prod`, `product`, or `production`. The annotation's `name` field is metadata; it does not dynamically change the `@Profile` expression.

## Validate required properties at startup

```kotlin
val endpoint = environment.getRequiredPropertyAs<URI>("partner.endpoint")
val batchSize = environment.getAs("worker.batch-size", 100)
```

Use `getRequiredPropertyAs` to expose a missing or invalid value during startup. Use a default overload only when the default is safe for the domain. The module does not create a `@ConfigurationProperties` class, validation policy, or property source.

## Do not assume automatic activation

The 1.11.0 artifact has no `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`. Import `VirtualThreadAutoConfiguration` explicitly:

```kotlin
@SpringBootApplication
@Import(VirtualThreadAutoConfiguration::class)
class Application
```

The `@Component` on `HttpRequestCapturer` and `@RestControllerAdvice` on `ApiExceptionHandler` also require the classes to be inside the application's component-scan range. Adding the artifact does not activate every helper.

## Source and tests

- [`AnnotationExtensions.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/beans/AnnotationExtensions.kt)
- [`BeanFactoryExtensions.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/beans/BeanFactoryExtensions.kt)
- [`ProfileSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/config/ProfileSupport.kt)
- [`PropertyResolverExtensions.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/core/PropertyResolverExtensions.kt)
- [`BeanFactoryExtensionsTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/beans/BeanFactoryExtensionsTest.kt)

## Next chapter

[RestClient and coroutine boundaries](/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-core/rest-client-and-coroutines/) explains how to keep thread, cancellation, and converter ownership visible around a blocking HTTP client.
