---
slug: "manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-ktor-cache"
manualId: "bluetape4k-exposed-ktor-cache"
id: "bluetape4k-exposed-ktor-cache"
title: "Exposed Ktor Cache Adapter"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-ktor-cache"
sourceDir: "ktor/cache"
releaseRef: "develop"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-ktor-cache
manual:
  id: "bluetape4k-exposed-ktor-cache"
  repository: "bluetape4k-exposed"
  group: "integration"
  kind: "library"
  sourceCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourcePath: "docs/manual/bluetape4k-exposed/en/modules/bluetape4k-exposed-ktor-cache.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourceDir: "ktor/cache"
  layer: "build"
---


Backend-neutral Ktor readiness contributors for caller-owned Exposed cache repositories and snapshot failure buffers.

## Problem

Cache health must be observable without turning a readiness request into database, network, or blocking work.

## When to use it

Use this adapter when a Ktor service wants an O(1) in-memory view of JDBC, R2DBC, snapshot, or custom cache health.

## Coordinates

```kotlin
implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-ktor-cache")
```

## Core concepts

`ExposedKtorCacheContributor` sanitizes finite status and measurements. A contributor is caller-owned, side-effect-free, cancellation-cooperative, and bounded to a low-cardinality component name.

## Quick start

```kotlin
val config = ExposedKtorCacheReadinessConfig(listOf(
    ExposedKtorCacheContributor.custom("local-cache") { ExposedKtorCacheStatus.UP },
))
val probes = exposedKtorCacheReadinessProbes(config)
route.bluetape4kExposedHealthRoutes(probes)
```

## API by task

- Use `jdbcRepository`, `r2dbcRepository`, `snapshot`, or `custom` contributors.
- Wrap contributors with `ExposedKtorCacheReadinessConfig`.
- Convert the immutable configuration with `exposedKtorCacheReadinessProbes`.

## Recommended patterns

Read an existing health snapshot; do not perform I/O in a supplier. Use stable component names and let the application own cache invalidation and shutdown.

## Integrations

The adapter depends on core and the Exposed cache foundation. JDBC Caffeine and R2DBC Caffeine persistence implementations remain optional.

## Configuration

Configure one to sixteen unique contributors. Queue and snapshot measurements are non-negative; unavailable values use `NaN` and are never coerced to zero.

## Failure modes

Supplier exceptions become `DOWN`, cancellation follows the request context, and invalid component names or measurements fail at configuration time. Raw cache keys, URLs, SQL, and causes are not returned.

## Operations

Cache probes run sequentially under the core shared deadline. Export core readiness metrics and monitor the cache repository's own lifecycle report separately.

## Testing

Test O(1) snapshot conversion, negative-value rejection, supplier cancellation, deadline expiry, duplicate components, and sanitized responses.

## Workshops

No selective cache workshop is published in this `2.0.0` release line.

## Limitations

The contributor contract does not make blocking or backend-I/O suppliers safe. Applications must supply a true in-memory observer.

## Sources

- [Micrometer meter concepts](https://docs.micrometer.io/micrometer/reference/concepts.html)
- [Caffeine cache](https://github.com/ben-manes/caffeine)
