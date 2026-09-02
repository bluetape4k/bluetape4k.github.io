---
slug: "ko/manual/bluetape4k-projects/2.0/modules/bluetape4k-tenant"
manualId: bluetape4k-tenant
title: "Tenant Context 공통 API"
description: "JDK 25 애플리케이션에서 tenant를 명시적으로 binding하는 공통 API와 ThreadLocal/ScopedValue carrier를 제공합니다. default tenant와 fallback은 없습니다."
kind: library
group: concurrency
learningOrder: 250
manual:
  id: "bluetape4k-tenant"
  repository: "bluetape4k-projects"
  group: "concurrency"
  kind: "library"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/ko/modules/bluetape4k-tenant.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "bluetape4k/tenant"
  layer: "build"
  learningOrder: 250
---


## 해결하는 문제

JDK 25 애플리케이션에서 tenant를 명시적으로 binding하는 공통 API와 ThreadLocal/ScopedValue carrier를 제공합니다. default tenant와 fallback은 없습니다. 이 매뉴얼은 README의 기능 목록을 반복하지 않고 현재 build, source entry point, test, 설정 resource, lifecycle 근거를 연결합니다.

## 사용 시점

인증을 마친 canonical `TenantId`를 default 없이 lexical scope에 전달해야 할 때 `bluetape4k-tenant`를 사용합니다. 같은 platform thread에서 동기 작업을 이어가면 `ThreadLocalTenantContext`, virtual thread나 structured concurrency를 사용하면 `ScopedValueTenantContext`를 선택합니다. Reactor, Ktor, coroutine 경계에서는 자동 전파를 가정하지 말고 해당 carrier adapter를 사용합니다.

## 의존성 좌표

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-tenant")
}
```

Gradle project path는 `:bluetape4k-tenant`, source directory는 `bluetape4k/tenant`입니다.

## 핵심 개념

먼저 확인할 source 개념은 `MissingTenantContextException`, `ScopedValueTenantContext`, `TenantContext`, `TenantId`, `ThreadLocalTenantContext`입니다. 파일 이름은 탐색 anchor일 뿐이므로 public 계약으로 사용하기 전에 선언과 test를 함께 읽습니다.

## 빠른 시작

application scope carrier 하나를 만들고 lexical `withTenant` API만 사용합니다.

```kotlin
val tenantContext: TenantContext = ThreadLocalTenantContext()

tenantContext.withTenant(TenantId("clinic-a")) {
    repository.findAppointments(tenantContext.requireCurrent())
}
```

raw header나 token은 인증과 권한 확인을 거쳐 canonical domain 값으로 바꾼 다음 `TenantId`를 생성합니다.

## 작업별 API

| Entry point | 확인할 내용 |
| --- | --- |
| [`TenantContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/main/kotlin/io/bluetape4k/tenant/TenantContext.kt) | `withTenant`로 binding하고 `currentOrNull` 또는 `requireCurrent`로 조회합니다. |
| [`ThreadLocalTenantContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/main/kotlin/io/bluetape4k/tenant/ThreadLocalTenantContext.kt) | platform thread의 동기 binding을 lexical scope로 제한하며 nested scope 종료 시 이전 값을 복원합니다. |
| [`ScopedValueTenantContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/main/kotlin/io/bluetape4k/tenant/ScopedValueTenantContext.kt) | JDK 25 `ScopedValue`를 사용해 virtual thread와 `StructuredTaskScope`의 lexical 상속을 지원합니다. |
| [`TenantId`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/main/kotlin/io/bluetape4k/tenant/TenantId.kt) | 인증과 권한 확인을 마친 canonical application 값만 전달합니다. |
| [`MissingTenantContextException`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/main/kotlin/io/bluetape4k/tenant/MissingTenantContextException.kt) | 필수 binding 누락은 status 또는 error mapping을 소유한 application boundary에서 처리합니다. |

## 권장 패턴

binding을 공유하는 application boundary와 downstream component에 같은 carrier instance를 주입합니다. 인증, 권한 확인, tenant 존재 확인, schema 또는 connection routing, persistence는 이 모듈 밖에 둡니다. mutable `set`/`clear` API를 추가하거나 request마다 carrier를 만들지 않습니다.

## 연동

모듈 build에 직접적인 `api`, `implementation`, `compileOnly`, `runtimeOnly` dependency line이 없습니다. build file의 plugin과 generated metadata를 확인합니다.

## 설정

이 모듈에는 configuration property나 resource가 없습니다. application이 `TenantContext` instance를 만들고 주입할 때 carrier 종류와 lifecycle을 명시적으로 결정합니다.

## 실패 동작

binding이 없으면 `currentOrNull()`은 `null`, `requireCurrent()`는 `MissingTenantContextException("Tenant context is not bound")`을 던집니다. `ThreadLocalTenantContext`는 nested 이전 값을 복원하고 `finally`에서 binding을 제거하며, `ScopedValueTenantContext`는 lexical carrier 안에서만 값을 유지합니다. fallback tenant는 없습니다.

## 운영

raw header, token, tenant 값은 log, exception, MDC, metric label에 넣지 않습니다. consumer가 binding failure를 기록한다면 tenant identity 대신 bounded carrier/stage label과 기존 correlation 또는 trace identifier를 사용합니다.

## 테스트

모듈 test task는 다음과 같습니다.

```bash
./gradlew :bluetape4k-tenant:test --no-configuration-cache
```

대표 test anchor는 다음과 같습니다.

- [`ScopedValueTenantContextTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/test/kotlin/io/bluetape4k/tenant/ScopedValueTenantContextTest.kt)
- [`TenantContextApiTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/test/kotlin/io/bluetape4k/tenant/TenantContextApiTest.kt)
- [`TenantContextRetentionStressTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/test/kotlin/io/bluetape4k/tenant/TenantContextRetentionStressTest.kt)
- [`TenantIdTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/test/kotlin/io/bluetape4k/tenant/TenantIdTest.kt)
- [`ThreadLocalTenantContextTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/test/kotlin/io/bluetape4k/tenant/ThreadLocalTenantContextTest.kt)

## 워크숍

manual manifest에 등록된 전용 workshop path가 없습니다. 모듈 README와 위 representative test를 실행 근거로 사용합니다.

## 제한 사항

이 모듈은 tenant 인증·인가, schema/connection 선택, coroutine suspension/dispatcher hop 전파를 제공하지 않습니다. 독립적으로 시작한 virtual thread도 binding을 자동 상속하지 않습니다. 비동기 또는 framework 경계마다 알맞은 adapter를 application이 선택해야 합니다.

## 근거

- [모듈 README](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/README.ko.md)
- [모듈 build](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/build.gradle.kts)
- [`MissingTenantContextException`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/main/kotlin/io/bluetape4k/tenant/MissingTenantContextException.kt)
- [`ScopedValueTenantContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/main/kotlin/io/bluetape4k/tenant/ScopedValueTenantContext.kt)
- [`TenantContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/main/kotlin/io/bluetape4k/tenant/TenantContext.kt)
- [`TenantId`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/main/kotlin/io/bluetape4k/tenant/TenantId.kt)
- [`ThreadLocalTenantContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/main/kotlin/io/bluetape4k/tenant/ThreadLocalTenantContext.kt)
- [`ScopedValueTenantContextTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/test/kotlin/io/bluetape4k/tenant/ScopedValueTenantContextTest.kt)
- [`TenantContextApiTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/test/kotlin/io/bluetape4k/tenant/TenantContextApiTest.kt)
- [`TenantContextRetentionStressTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/test/kotlin/io/bluetape4k/tenant/TenantContextRetentionStressTest.kt)
- [`TenantIdTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/test/kotlin/io/bluetape4k/tenant/TenantIdTest.kt)
- [`ThreadLocalTenantContextTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant/src/test/kotlin/io/bluetape4k/tenant/ThreadLocalTenantContextTest.kt)
