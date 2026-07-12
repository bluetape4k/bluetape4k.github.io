---
manualId: bluetape4k-spring-boot-core
title: "Module bluetape4k-spring-boot-core"
description: "Spring Boot 4.x 기반 공통 기능 통합 모듈입니다."
kind: library
group: spring
manual:
  id: "bluetape4k-spring-boot-core"
  repository: "bluetape4k-projects"
  group: "spring"
  kind: "library"
  sourceCommit: "dda876503926aa16302b4416e3f3a3e2bff26526"
  sourcePath: "docs/manual/ko/modules/bluetape4k-spring-boot-core.md"
  layer: "build"
---


## 해결하는 문제

Spring Boot 4.x 기반 공통 기능 통합 모듈입니다. 이 매뉴얼은 README의 기능 목록을 반복하지 않고 현재 build, source entry point, test, 설정 resource, lifecycle 근거를 연결합니다.

## 사용 시점

애플리케이션에 auto-configuration condition, bean ownership, property binding, application lifecycle이 필요할 때 `bluetape4k-spring-boot-core`를 선택합니다. 아래 source entry point에서 시작해 ownership과 failure 계약이 caller lifecycle에 맞는지 확인합니다. 표준 API나 이미 도입한 더 작은 모듈이 같은 계약을 만족한다면 그쪽을 우선합니다.

## 의존성 좌표

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-spring-boot-core")
}
```

Gradle project path는 `:bluetape4k-spring-boot-core`, source directory는 `spring-boot/core`입니다.

## 핵심 개념

먼저 확인할 source 개념은 `AnnotationExtensions`, `BeanFactoryExtensions`, `BeanUtilsSupport`, `PropertyAccessorUtilsSupport`, `ProfileSupport`, `PropertyResolverExtensions`, `ToStringCreatorSupport`, `DataBufferSupport`입니다. 파일 이름은 탐색 anchor일 뿐이므로 public 계약으로 사용하기 전에 선언과 test를 함께 읽습니다.

## 빠른 시작

위 좌표를 추가하고 Gradle을 refresh한 뒤 필요한 작업을 소유한 가장 작은 entry point에서 시작합니다. 먼저 [`AnnotationExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/beans/AnnotationExtensions.kt)를 확인합니다. 이 파일이 모듈의 구체적인 source entry point입니다.

## 작업별 API

| Entry point | 확인할 내용 |
| --- | --- |
| [`AnnotationExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/beans/AnnotationExtensions.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`BeanFactoryExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/beans/BeanFactoryExtensions.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`BeanUtilsSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/beans/BeanUtilsSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`PropertyAccessorUtilsSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/beans/PropertyAccessorUtilsSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`ProfileSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/config/ProfileSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`PropertyResolverExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/core/PropertyResolverExtensions.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`ToStringCreatorSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/core/ToStringCreatorSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`DataBufferSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/core/io/buffer/DataBufferSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`ExampleMatcherSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/data/ExampleMatcherSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`RestClientBuilderDsl`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/http/RestClientBuilderDsl.kt) | constructor, function, ownership 계약을 확인합니다. |

## 권장 패턴

README 근거는 **제공 기능**, **Spring Core 유틸리티**, **Spring WebFlux + Coroutines**, **RestClient Coroutines DSL**, **Spring Boot Observability 헬퍼**, **테스트 유틸리티**, **다이어그램**, **Spring Boot Core 기능 맵**, **Spring WebFlux + Coroutines 요청 흐름**, **RestClient Coroutines DSL 구조** 순서로 탐색할 수 있습니다. 이 항목으로 방향을 잡고 source와 test에서 동작을 확인합니다. 도입 범위는 좁게 유지하고 소유한 resource를 caller lifecycle에 연결합니다.

## 연동

현재 build에 선언된 integration edge는 다음과 같습니다.

```kotlin
implementation(platform(libs.spring.boot.dependencies))
compileOnly("org.springframework.boot:spring-boot-starter-webflux")
compileOnly("org.springframework.boot:spring-boot-starter-web")
compileOnly("org.springframework.boot:spring-boot-starter-test")
compileOnly(project(":bluetape4k-io"))
compileOnly(project(":bluetape4k-jackson3"))
compileOnly("org.springframework:spring-context-support")
compileOnly("org.springframework:spring-messaging")
compileOnly("org.springframework:spring-web")
compileOnly("org.springframework.data:spring-data-commons")
compileOnly("org.springframework.boot:spring-boot-autoconfigure")
compileOnly("org.springframework.boot:spring-boot-configuration-processor")
```

`compileOnly` edge는 caller가 제공해야 하는 capability이므로 API를 사용하기 전에 runtime에 실제 dependency가 있는지 확인합니다.

## 설정

`src/main/resources` 아래에서 모듈 수준 설정 resource를 찾지 못했습니다. constructor, builder, function argument, 연동 framework로 설정하며 default는 source에서 확인합니다.

## 실패 동작

failure 의미는 artifact 이름이 아니라 아래 entry point와 test가 결정합니다. cancellation과 timeout signal을 보존하고 소유한 resource를 닫습니다. backend exception은 안정된 domain 계약을 추가할 수 있는 boundary에서만 변환합니다. retry나 fallback을 넣기 전에 test anchor로 실제 동작을 확인합니다.

## 운영

condition report, startup failure, pool/client health, request latency, graceful shutdown을 관찰합니다. capacity, timeout, retry, shutdown 설정은 resource를 소유한 component 가까이에 둡니다. 누가 trade-off를 받아들였는지 알 수 없는 process-wide default는 피합니다.

## 테스트

모듈 test task는 다음과 같습니다.

```bash
./gradlew :bluetape4k-spring-boot-core:test --no-configuration-cache
```

대표 test anchor는 다음과 같습니다.

- [`AbstractSpringTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/AbstractSpringTest.kt)
- [`AnnotationExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/beans/AnnotationExtensionsTest.kt)
- [`BeanFactoryExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/beans/BeanFactoryExtensionsTest.kt)
- [`BeanUtilsSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/beans/BeanUtilsSupportTest.kt)
- [`PropertyResolverExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/core/PropertyResolverExtensionsTest.kt)
- [`ToStringCreatorExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/core/ToStringCreatorExtensionsTest.kt)
- [`DataBufferSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/core/io/buffer/DataBufferSupportTest.kt)
- [`ExampleMatcherSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/data/ExampleMatcherSupportTest.kt)

## 워크숍

manual manifest에 등록된 전용 workshop path가 없습니다. 모듈 README와 위 representative test를 실행 근거로 사용합니다.

## 제한 사항

이 페이지는 연결된 source와 test가 나타내는 현재 저장소 상태를 설명합니다. optional backend를 애플리케이션 기본값으로 만들거나 benchmark artifact 없이 성능을 단정하지 않습니다. 모듈 버전이 바뀌면 호환성과 lifecycle 설명을 다시 확인해야 합니다.

## 근거

- [모듈 README](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/README.ko.md)
- [모듈 build](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/build.gradle.kts)
- [`AnnotationExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/beans/AnnotationExtensions.kt)
- [`BeanFactoryExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/beans/BeanFactoryExtensions.kt)
- [`BeanUtilsSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/beans/BeanUtilsSupport.kt)
- [`PropertyAccessorUtilsSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/beans/PropertyAccessorUtilsSupport.kt)
- [`ProfileSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/config/ProfileSupport.kt)
- [`PropertyResolverExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/core/PropertyResolverExtensions.kt)
- [`ToStringCreatorSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/core/ToStringCreatorSupport.kt)
- [`DataBufferSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/core/io/buffer/DataBufferSupport.kt)
- [`ExampleMatcherSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/data/ExampleMatcherSupport.kt)
- [`RestClientBuilderDsl`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/main/kotlin/io/bluetape4k/spring/http/RestClientBuilderDsl.kt)
- [`AbstractSpringTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/AbstractSpringTest.kt)
- [`AnnotationExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/core/src/test/kotlin/io/bluetape4k/spring/beans/AnnotationExtensionsTest.kt)
