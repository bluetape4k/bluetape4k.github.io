---
manualId: bluetape4k-spring-boot-mongodb
title: "Module bluetape4k-spring-boot-mongodb"
description: "Spring Data MongoDB Reactive를 Kotlin Coroutines 기반으로 편리하게 사용할 수 있도록 하는 확장 라이브러리입니다 (Spring Boot 4.x)."
kind: library
group: spring
manual:
  id: "bluetape4k-spring-boot-mongodb"
  repository: "bluetape4k-projects"
  group: "spring"
  kind: "library"
  sourceCommit: "dda876503926aa16302b4416e3f3a3e2bff26526"
  sourcePath: "docs/manual/ko/modules/bluetape4k-spring-boot-mongodb.md"
  layer: "build"
---


## 해결하는 문제

Spring Data MongoDB Reactive를 Kotlin Coroutines 기반으로 편리하게 사용할 수 있도록 하는 확장 라이브러리입니다 (Spring Boot 4.x). 이 매뉴얼은 README의 기능 목록을 반복하지 않고 현재 build, source entry point, test, 설정 resource, lifecycle 근거를 연결합니다.

## 사용 시점

애플리케이션에 auto-configuration condition, bean ownership, property binding, application lifecycle이 필요할 때 `bluetape4k-spring-boot-mongodb`를 선택합니다. 아래 source entry point에서 시작해 ownership과 failure 계약이 caller lifecycle에 맞는지 확인합니다. 표준 API나 이미 도입한 더 작은 모듈이 같은 계약을 만족한다면 그쪽을 우선합니다.

## 의존성 좌표

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-spring-boot-mongodb")
}
```

Gradle project path는 `:bluetape4k-spring-boot-mongodb`, source directory는 `spring-boot/mongodb`입니다.

## 핵심 개념

먼저 확인할 source 개념은 `ReactiveMongoAutoConfiguration`, `ReactiveMongoOperationsCoroutines`, `CriteriaExtensions`, `QueryExtensions`, `UpdateExtensions`입니다. 파일 이름은 탐색 anchor일 뿐이므로 public 계약으로 사용하기 전에 선언과 test를 함께 읽습니다.

## 빠른 시작

위 좌표를 추가하고 Gradle을 refresh한 뒤 필요한 작업을 소유한 가장 작은 entry point에서 시작합니다. 먼저 [`ReactiveMongoAutoConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/config/ReactiveMongoAutoConfiguration.kt)를 확인합니다. 이 파일이 모듈의 구체적인 source entry point입니다.

## 작업별 API

| Entry point | 확인할 내용 |
| --- | --- |
| [`ReactiveMongoAutoConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/config/ReactiveMongoAutoConfiguration.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`ReactiveMongoOperationsCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/coroutines/ReactiveMongoOperationsCoroutines.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`CriteriaExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/CriteriaExtensions.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`QueryExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/QueryExtensions.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`UpdateExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/UpdateExtensions.kt) | constructor, function, ownership 계약을 확인합니다. |

## 권장 패턴

README 근거는 **특징**, **다이어그램**, **핵심 클래스 구조**, **ReactiveMongoOperations 코루틴 확장 흐름**, **Criteria / Query / Update DSL 흐름**, **코루틴 변환 시퀀스**, **설치**, **사용 예시**, **ReactiveMongoOperations 코루틴 확장**, **Criteria infix DSL** 순서로 탐색할 수 있습니다. 이 항목으로 방향을 잡고 source와 test에서 동작을 확인합니다. 도입 범위는 좁게 유지하고 소유한 resource를 caller lifecycle에 연결합니다.

## 연동

현재 build에 선언된 integration edge는 다음과 같습니다.

```kotlin
implementation(platform(libs.spring.boot.dependencies))
api(project(":bluetape4k-spring-boot-core"))
implementation(libs.mongodb.driver.kotlin.sync)
implementation(libs.mongodb.driver.kotlin.coroutine)
implementation(libs.mongodb.driver.kotlin.extensions)
api("org.springframework.boot:spring-boot-starter-data-mongodb-reactive")
compileOnly("org.springframework.boot:spring-boot-autoconfigure")
compileOnly("org.springframework.boot:spring-boot-configuration-processor")
api(project(":bluetape4k-coroutines"))
api(libs.kotlinx.coroutines.core)
api(libs.kotlinx.coroutines.reactor)
implementation(libs.reactor.core)
```

`compileOnly` edge는 caller가 제공해야 하는 capability이므로 API를 사용하기 전에 runtime에 실제 dependency가 있는지 확인합니다.

## 설정

모듈에서 찾은 설정 resource는 다음과 같습니다.

- [`org.springframework.boot.autoconfigure.AutoConfiguration.imports`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports)

override하기 전에 이 resource와 binding source에서 property 이름과 default를 확인합니다.

## 실패 동작

failure 의미는 artifact 이름이 아니라 아래 entry point와 test가 결정합니다. cancellation과 timeout signal을 보존하고 소유한 resource를 닫습니다. backend exception은 안정된 domain 계약을 추가할 수 있는 boundary에서만 변환합니다. retry나 fallback을 넣기 전에 test anchor로 실제 동작을 확인합니다.

## 운영

condition report, startup failure, pool/client health, request latency, graceful shutdown을 관찰합니다. capacity, timeout, retry, shutdown 설정은 resource를 소유한 component 가까이에 둡니다. 누가 trade-off를 받아들였는지 알 수 없는 process-wide default는 피합니다.

## 테스트

모듈 test task는 다음과 같습니다.

```bash
./gradlew :bluetape4k-spring-boot-mongodb:test --no-configuration-cache
```

대표 test anchor는 다음과 같습니다.

- [`AbstractReactiveMongoCoroutineTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/AbstractReactiveMongoCoroutineTest.kt)
- [`AbstractReactiveMongoTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/AbstractReactiveMongoTest.kt)
- [`MongoTestApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/MongoTestApplication.kt)
- [`ReactiveMongoOperationsCoroutinesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/coroutines/ReactiveMongoOperationsCoroutinesTest.kt)
- [`User`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/model/User.kt)
- [`CriteriaExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/query/CriteriaExtensionsTest.kt)
- [`QueryExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/query/QueryExtensionsTest.kt)
- [`UpdateExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/query/UpdateExtensionsTest.kt)

## 워크숍

manual manifest에 등록된 전용 workshop path가 없습니다. 모듈 README와 위 representative test를 실행 근거로 사용합니다.

## 제한 사항

이 페이지는 연결된 source와 test가 나타내는 현재 저장소 상태를 설명합니다. optional backend를 애플리케이션 기본값으로 만들거나 benchmark artifact 없이 성능을 단정하지 않습니다. 모듈 버전이 바뀌면 호환성과 lifecycle 설명을 다시 확인해야 합니다.

## 근거

- [모듈 README](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/README.ko.md)
- [모듈 build](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/build.gradle.kts)
- [`ReactiveMongoAutoConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/config/ReactiveMongoAutoConfiguration.kt)
- [`ReactiveMongoOperationsCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/coroutines/ReactiveMongoOperationsCoroutines.kt)
- [`CriteriaExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/CriteriaExtensions.kt)
- [`QueryExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/QueryExtensions.kt)
- [`UpdateExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/main/kotlin/io/bluetape4k/spring/mongodb/query/UpdateExtensions.kt)
- [`AbstractReactiveMongoCoroutineTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/AbstractReactiveMongoCoroutineTest.kt)
- [`AbstractReactiveMongoTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/AbstractReactiveMongoTest.kt)
- [`MongoTestApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/MongoTestApplication.kt)
- [`ReactiveMongoOperationsCoroutinesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/coroutines/ReactiveMongoOperationsCoroutinesTest.kt)
- [`User`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/model/User.kt)
- [`CriteriaExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/query/CriteriaExtensionsTest.kt)
- [`QueryExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/spring-boot/mongodb/src/test/kotlin/io/bluetape4k/spring/mongodb/query/QueryExtensionsTest.kt)
