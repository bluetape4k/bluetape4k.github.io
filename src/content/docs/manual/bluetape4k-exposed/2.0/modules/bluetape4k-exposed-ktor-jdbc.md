---
slug: "manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-ktor-jdbc"
manualId: "bluetape4k-exposed-ktor-jdbc"
id: "bluetape4k-exposed-ktor-jdbc"
title: "Exposed Ktor JDBC Adapter"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-ktor-jdbc"
sourceDir: "ktor/jdbc"
releaseRef: "develop"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-ktor-jdbc
manual:
  id: "bluetape4k-exposed-ktor-jdbc"
  repository: "bluetape4k-exposed"
  group: "integration"
  kind: "library"
  sourceCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourcePath: "docs/manual/bluetape4k-exposed/en/modules/bluetape4k-exposed-ktor-jdbc.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourceDir: "ktor/jdbc"
  layer: "build"
---


JDBC-specific readiness and transaction helpers for applications that already depend on the backend-neutral Ktor core.

## Problem

Blocking JDBC must not run on a Ktor event-loop dispatcher, and a JDBC-only consumer should not receive R2DBC or cache classes.

## When to use it

Use this adapter for a JDBC `Database` and an application-provided bounded blocking dispatcher.

## Coordinates

```kotlin
implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-ktor-jdbc")
```

## Core concepts

`exposedKtorJdbcReadinessProbe` runs `SELECT 1` in `runInterruptible`. Its statement timeout is the smaller of the configured timeout and the remaining shared readiness budget.

## Quick start

```kotlin
val probe = exposedKtorJdbcReadinessProbe(database, jdbcDispatcher)
route.bluetape4kExposedHealthRoutes(listOf(probe))
```

## API by task

- Use `exposedKtorJdbcReadinessProbe` for a caller-owned JDBC database.
- Use `ApplicationCall.exposedJdbcTransaction` for blocking transactions.
- Compose `bluetape4kExposedJdbcErrors()` in the existing `StatusPages` block.

## Recommended patterns

Size the dispatcher to useful pool concurrency, keep transaction work bounded, and close the database/pool and dispatcher in the application lifecycle.

## Integrations

Depend on `bluetape4k-exposed-ktor-core` and the Exposed JDBC module only. R2DBC and cache integrations are separate artifacts.

## Configuration

The dispatcher is required for JDBC readiness and transactions. Query timeout values must be finite and positive; sub-second JDBC values use a one-second driver timeout minimum.

## Failure modes

Blocking work on the event loop, an exhausted dispatcher, or a driver that ignores interruption can delay a request. Database failures map to a fixed unavailable response and never expose SQL or causes.

## Operations

Observe readiness and transaction timers with the core metric registry. Keep pool, dispatcher, authentication, and shutdown ownership in application code.

## Testing

Test H2 first, then the repository's PostgreSQL and MySQL Testcontainers paths. Include cancellation, statement timeout, and dispatcher-isolation cases.

## Workshops

No selective JDBC workshop is published in this `2.0.0` release line.

## Limitations

Driver support for statement cancellation and query timeout varies. The coroutine deadline is a request boundary, not a guarantee that a non-cooperative driver stops immediately.

## Sources

- [Kotlin `runInterruptible`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-interruptible.html)
- [Ktor server plugins](https://ktor.io/docs/server-plugins.html)
