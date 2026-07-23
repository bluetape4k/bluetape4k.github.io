---
slug: "ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-logging/scoped-mdc"
title: Scoped MDC와 중첩 복원
description: Thread-local MDC 값을 operation 범위에 설치하고 정확히 복원하거나 제거합니다.
manualId: bluetape4k-logging
chapterId: scoped-mdc
manual:
  id: "bluetape4k-logging"
  repository: "bluetape4k-projects"
  group: "foundation"
  kind: "library"
  sourceCommit: "3a97a3fc2f3525c3a3384d511a9adb8571b0b680"
  sourcePath: "docs/manual/ko/modules/bluetape4k-logging/scoped-mdc.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "bluetape4k/logging"
  layer: "build"
  learningOrder: 130
  chapterId: "scoped-mdc"
  chapterOrder: 3
---


MDC는 log line에 correlation field를 추가하지만 기반은 thread-local mutable state입니다. 값을 put하고 지우는 책임을 분리하면 다음 request로 context가 새기 쉽습니다.

![Outer, inner, restored MDC state의 수명주기](/manual-assets/bluetape4k-projects/1.11/logging/mdc-scope-lifecycle.svg)

## Scope가 소유하는 것

```kotlin
withLoggingContext(
    "traceId" to "trace-100",
    "tenantId" to tenantId,
) {
    log.info { "Load account" }
}
```

`restorePrevious=true`가 기본입니다. 각 key의 이전 값을 기억하고 block이 성공하거나 exception을 던져도 `finally`에서 복원합니다. 이전 값이 없었던 key는 제거합니다.

## 중첩과 정책

```kotlin
MDC.put("traceId", "outer")
withLoggingContext("traceId" to "inner") {
    check(MDC.get("traceId") == "inner")
}
check(MDC.get("traceId") == "outer")
```

`restorePrevious=false`는 scope 종료 시 적용한 key를 제거합니다. 외부 값으로 돌아가야 하는 nested operation에서는 기본값을 유지합니다. map/vararg의 value가 `null`이면 그 entry는 설치하지 않습니다.

## Exception과 cleanup

cleanup은 business exception 뒤에도 실행됩니다. map cleanup callback 자체의 exception은 원래 실패를 덮지 않도록 삼킵니다. 이 선택은 cleanup 실패를 무시해도 된다는 뜻이 아니라 primary exception을 보존한다는 뜻입니다.

## MDC에 넣을 값

- request/trace/span/tenant처럼 작고 안정적인 correlation key
- 이미 sanitize한 식별자
- log pattern 또는 structured encoder가 실제 출력하는 field

password, token, raw payload, 크기 제한 없는 collection은 넣지 않습니다. MDC field가 설정돼도 Logback pattern에 `%X{traceId}` 또는 structured provider mapping이 없으면 출력되지 않습니다.

## Source와 tests

- [`MdcSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/logging/src/main/kotlin/io/bluetape4k/logging/MdcSupport.kt)
- [`MdcSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/logging/src/test/kotlin/io/bluetape4k/logging/MdcSupportTest.kt)

Thread 전환이 있는 suspend 코드에서는 [Coroutine MDC](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-logging/coroutine-mdc/)를 사용합니다.
