---
slug: "manual/bluetape4k-exposed/2.0"
manualId: "repository-overview"
title: "Bluetape4k Exposed Manual"
locale: "en"
releaseRef: "2.0.0"
manual:
  id: "index"
  repository: "bluetape4k-exposed"
  group: "overview"
  kind: "guide"
  sourceCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourcePath: "docs/manual/bluetape4k-exposed/en/index.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourceDir: "docs/manual/bluetape4k-exposed"
  layer: "build"
---


`bluetape4k-exposed` adds repository patterns, transaction boundaries, caching, database-specific extensions, and application integrations to JetBrains Exposed. This manual starts with decisions rather than a feature catalog: choose JDBC or R2DBC, decide when caching is justified, and place database adapters and Spring Boot or Ktor integrations on the correct data-access path.

![Exposed repository overview](/manual-assets/bluetape4k-exposed/2.0/overview/repository-overview.png)

## Core capabilities

- **Repository foundations:** [Core](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-core/), [DAO](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-dao/), and repository conventions turn Exposed tables and entities into reusable Kotlin data-access components.
- **JDBC and R2DBC:** Choose [JDBC](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-jdbc/) for blocking transactions or [R2DBC](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-r2dbc/) for coroutine-first non-blocking access, with separate ownership and cancellation contracts.
- **Transactions and batch work:** The [transaction boundary guide](/manual/bluetape4k-exposed/2.0/guides/transaction-boundaries/) and [batch utilities](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-batch/) cover composition, batching, and failure behavior.
- **Caching:** The [cache selection guide](/manual/bluetape4k-exposed/2.0/guides/cache-selection/) connects shared cache contracts to Caffeine, Lettuce, and Redisson for JDBC and R2DBC repositories.
- **Database and data-format extensions:** The [database adapter matrix](/manual/bluetape4k-exposed/2.0/guides/database-adapter-matrix/) and [serialization/encryption guide](/manual/bluetape4k-exposed/2.0/guides/serialization-and-encryption/) cover vendor-specific SQL, JSON, measured values, and encrypted columns.
- **Application integration:** [Spring Boot and Ktor](/manual/bluetape4k-exposed/2.0/guides/spring-and-ktor/) modules own configuration, lifecycle, and framework-specific transaction wiring.

## Version baseline

Consumers select the central `io.github.bluetape4k:bluetape4k-dependencies:<version>` BOM version, not the repository release documented here. The technical baseline for this manual is `bluetape4k-exposed 2.0.0`, limited to the 40 Gradle projects present in that stable release.

- Release tag: [`2.0.0`](https://github.com/bluetape4k/bluetape4k-exposed/tree/2.0.0)
- Release commit: [`d632a0bc0662ae616b786f552150a7fabd1cee3e`](https://github.com/bluetape4k/bluetape4k-exposed/commit/d632a0bc0662ae616b786f552150a7fabd1cee3e)
- Primary paths: JDBC, R2DBC, cache, database adapters, and application integrations

## Where to start

- Use [Getting started](/manual/bluetape4k-exposed/2.0/getting-started/) for the central BOM and JDBC/R2DBC selection rules.
- Read the [Repository map](/manual/bluetape4k-exposed/2.0/architecture/repository-map/) to see how the stable modules fit together.
- Follow the [Learning path](/manual/bluetape4k-exposed/2.0/guides/learning-path/) for a goal-oriented sequence of examples and workshops.
- Open the [module catalog](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-bom/) when you need coordinates and release-backed source locations.

## Responsibility boundary

This repository owns the application data path. For object history, change comparison, or JaVers commit metadata, move to [`bluetape4k-javers`](https://github.com/bluetape4k/bluetape4k-javers) instead of overloading persistence repositories. JaVers complements Exposed repositories and caches; it does not replace them.
