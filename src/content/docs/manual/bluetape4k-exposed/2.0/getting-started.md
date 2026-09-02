---
slug: "manual/bluetape4k-exposed/2.0/getting-started"
manualId: "getting-started"
title: "Getting Started with Bluetape4k Exposed"
locale: "en"
releaseRef: "2.0.0"
manual:
  id: "getting-started"
  repository: "bluetape4k-exposed"
  group: "overview"
  kind: "guide"
  sourceCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourcePath: "docs/manual/bluetape4k-exposed/en/getting-started.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourceDir: "docs/manual/bluetape4k-exposed"
  layer: "build"
---


## Align versions with the central BOM

Applications should not pin each Exposed module independently. Import the `bluetape4k-dependencies` BOM once, then add only the data-access path the application needs.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-jdbc")
    // Choose this instead for coroutine-native reactive database access:
    // implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-r2dbc")
}
```

Replace `<version>` with the released `bluetape4k-dependencies` version used by your application. The `2.0.0` label in this manual is the verified Exposed source baseline, not the consumer version to paste into this snippet.

## Choose JDBC or R2DBC first

Do not import both paths by habit. Choose the primary path from the driver model, transaction owner, blocking boundary, and framework integration.

| Decision | JDBC | R2DBC |
| --- | --- | --- |
| Driver | Blocking JDBC driver | Non-blocking R2DBC driver |
| Call chain | Allows or isolates blocking work | Remains coroutine/non-blocking end to end |
| Transaction owner | JDBC transaction manager | R2DBC transaction manager and coroutine context |
| Typical integration | Spring MVC and conventional batch work | Spring WebFlux and coroutine services |

JDBC is the production default when an existing JDBC driver and transaction manager own the boundary. Do not choose R2DBC merely because a function is marked `suspend`; use it when the driver, pool, framework, and full call chain preserve the non-blocking model.

## Continue from the foundation

1. Read [`core`](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-core/) and [`dao`](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-dao/) for IDs, entities, and mapping.
2. Build repository and transaction boundaries with either [`jdbc`](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-jdbc/) or [`r2dbc`](/manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-r2dbc/).
3. Add caches, database adapters, and Spring Boot or Ktor integration only after the base path is tested.
4. Use the [learning path](/manual/bluetape4k-exposed/2.0/guides/learning-path/) for runnable follow-up material.
