---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-logging/scoped-mdc"
title: Scoped MDC and nested restoration
description: Install thread-local MDC values for one operation, then restore or remove them precisely.
manualId: bluetape4k-logging
chapterId: scoped-mdc
manual:
  id: "bluetape4k-logging"
  repository: "bluetape4k-projects"
  group: "foundation"
  kind: "library"
  sourceCommit: "d42c9dcf3dfa8f169b3bda9c56d3c8531b3ff296"
  sourcePath: "docs/manual/en/modules/bluetape4k-logging/scoped-mdc.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "bluetape4k/logging"
  layer: "build"
  chapterId: "scoped-mdc"
---


MDC adds correlation fields to log lines, but its underlying state is thread-local and mutable. Separating put and cleanup responsibility easily leaks one request into the next.

![Lifecycle of outer, inner, and restored MDC state](/manual-assets/bluetape4k-projects/1.11/logging/mdc-scope-lifecycle.svg)

## What the scope owns

```kotlin
withLoggingContext(
    "traceId" to "trace-100",
    "tenantId" to tenantId,
) {
    log.info { "Load account" }
}
```

`restorePrevious=true` is the default. The helper remembers each prior value and restores it in `finally` after success or failure. Keys without a previous value are removed.

## Nesting and policy

```kotlin
MDC.put("traceId", "outer")
withLoggingContext("traceId" to "inner") {
    check(MDC.get("traceId") == "inner")
}
check(MDC.get("traceId") == "outer")
```

With `restorePrevious=false`, the scope removes installed keys on exit. Keep the default for a nested operation that must return to outer values. A `null` map or vararg value is not installed.

## Exceptions and cleanup

Cleanup runs after a business exception. A map cleanup callback exception is swallowed so it cannot replace the primary failure. This preserves the main exception; it does not make cleanup defects harmless.

## Values appropriate for MDC

- small, stable request, trace, span, or tenant correlation keys
- identifiers already sanitized
- fields actually emitted by the log pattern or structured encoder

Do not store passwords, tokens, raw payloads, or unbounded collections. Setting a field is insufficient: Logback needs `%X{traceId}` or a corresponding structured mapping to emit it.

## Source and tests

- [`MdcSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/logging/src/main/kotlin/io/bluetape4k/logging/MdcSupport.kt)
- [`MdcSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/logging/src/test/kotlin/io/bluetape4k/logging/MdcSupportTest.kt)

Use [Coroutine MDC](/manual/bluetape4k-projects/1.11/modules/bluetape4k-logging/coroutine-mdc/) when suspend code can switch threads.
