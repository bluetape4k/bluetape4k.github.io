---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-logging/logger-foundation"
title: Logger foundation
description: Choose naming, initialization, and the SLF4J provider boundary for KLogging and KotlinLogging.
manualId: bluetape4k-logging
chapterId: logger-foundation
manual:
  id: "bluetape4k-logging"
  repository: "bluetape4k-projects"
  group: "foundation"
  kind: "library"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-logging/logger-foundation.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "bluetape4k/logging"
  layer: "build"
  learningOrder: 130
  chapterId: "logger-foundation"
  chapterOrder: 1
---


The declaration style determines call-site ergonomics, name stability, and how operators identify a logger.

![Responsibility boundary across KLogging, KotlinLogging, KLoggerFactory, and SLF4J](/manual-assets/bluetape4k-projects/2.0/logging/logger-api-map.svg)

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

- [`KLogging.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/logging/src/main/kotlin/io/bluetape4k/logging/KLogging.kt)
- [`KotlinLogging.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/logging/src/main/kotlin/io/bluetape4k/logging/KotlinLogging.kt)
- [`KLoggerNameResolver.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/logging/src/main/kotlin/io/bluetape4k/logging/internal/KLoggerNameResolver.kt)
- [`KLoggingTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/logging/src/test/kotlin/io/bluetape4k/logging/KLoggingTest.kt)
- [`KotlinLoggingTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/logging/src/test/kotlin/io/bluetape4k/logging/KotlinLoggingTest.kt)

Next: control evaluation cost and supplier failure in [Lazy messages](/manual/bluetape4k-projects/2.0/modules/bluetape4k-logging/lazy-messages/).
