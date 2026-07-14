---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-logging/logger-foundation"
title: Logger foundation
description: Choose naming, initialization, and the SLF4J provider boundary for KLogging and KotlinLogging.
manualId: bluetape4k-logging
chapterId: logger-foundation
manual:
  id: "bluetape4k-logging"
  repository: "bluetape4k-projects"
  group: "foundation"
  kind: "library"
  sourceCommit: "a9051bd77bf5870d3787f15c1d32088412f2bdbb"
  sourcePath: "docs/manual/en/modules/bluetape4k-logging/logger-foundation.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "bluetape4k/logging"
  layer: "build"
  chapterId: "logger-foundation"
---


The declaration style determines call-site ergonomics, name stability, and how operators identify a logger.

![Responsibility boundary across KLogging, KotlinLogging, KLoggerFactory, and SLF4J](/manual-assets/bluetape4k-projects/1.11/logging/logger-api-map.svg)

## Two entry points

Use `KLogging` when a class or companion object should share a `log` property. Kotlin `lazy` creates the logger once on first access.

```kotlin
class InvoiceService {
    companion object : KLogging()

    fun issue() {
        log.info { "Issuing invoice" }
    }
}
```

Use `KotlinLogging` for top-level code, an explicit category, or a `KClass` name.

```kotlin
private val auditLog = KotlinLogging.logger("billing.audit")
private val fileLog = KotlinLogging.logger { }
val serviceLog = KotlinLogging.logger(InvoiceService::class)
```

## Naming contract

`logger(name)` rejects a blank name with `IllegalArgumentException`. The lambda entry point and `KLogging` delegate synthetic and companion-name normalization to `KLoggerNameResolver`. Prefer an explicit category when the name is a stable dashboard or routing key.

## Provider boundary

The module returns SLF4J `Logger`; it does not install a backend. The application owns one provider such as Logback and its configuration. A library must not silently replace appenders or root levels.

## Decision table

| Situation | Choice |
| --- | --- |
| Every instance uses one category | companion `KLogging()` |
| File or top-level function | `KotlinLogging.logger {}` |
| Stable operational category | `logger("stable.name")` |
| Explicit type-based category | `logger(Type::class)` |

## Source and tests

- [`KLogging.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/logging/src/main/kotlin/io/bluetape4k/logging/KLogging.kt)
- [`KotlinLogging.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/logging/src/main/kotlin/io/bluetape4k/logging/KotlinLogging.kt)
- [`KLoggerNameResolver.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/logging/src/main/kotlin/io/bluetape4k/logging/internal/KLoggerNameResolver.kt)
- [`KLoggingTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/logging/src/test/kotlin/io/bluetape4k/logging/KLoggingTest.kt)
- [`KotlinLoggingTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/logging/src/test/kotlin/io/bluetape4k/logging/KotlinLoggingTest.kt)

Next: control evaluation cost and supplier failure in [Lazy messages](/manual/bluetape4k-projects/1.11/modules/bluetape4k-logging/lazy-messages/).
