---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-mongodb"
manualId: bluetape4k-mongodb
title: "Module bluetape4k-mongodb"
description: "An extension library that makes the MongoDB Kotlin Coroutine Driver more convenient to use."
kind: library
group: data
manual:
  id: "bluetape4k-mongodb"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "b10b0d9ae7ca2321572f3ae7f9d31d04dbb6c0c5"
  sourcePath: "docs/manual/en/modules/bluetape4k-mongodb.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "data/mongodb"
  layer: "build"
---


## Problem

An extension library that makes the MongoDB Kotlin Coroutine Driver more convenient to use. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-mongodb` when the application needs transaction boundaries, connection ownership, query behavior, and serialization. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-mongodb")
}
```

Gradle project path: `:bluetape4k-mongodb`. Source directory: `data/mongodb`.

## Concepts

The first source-level concepts to inspect are `MongoClientExtensions`, `MongoClientProvider`, `MongoClientSupport`, `MongoCollectionExtensions`, `MongoDatabaseExtensions`, `AggregationSupport`, and `DocumentExtensions`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`MongoClientExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/main/kotlin/io/bluetape4k/mongodb/MongoClientExtensions.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`MongoClientExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/main/kotlin/io/bluetape4k/mongodb/MongoClientExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MongoClientProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/main/kotlin/io/bluetape4k/mongodb/MongoClientProvider.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MongoClientSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/main/kotlin/io/bluetape4k/mongodb/MongoClientSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MongoCollectionExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/main/kotlin/io/bluetape4k/mongodb/MongoCollectionExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MongoDatabaseExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/main/kotlin/io/bluetape4k/mongodb/MongoDatabaseExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AggregationSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/main/kotlin/io/bluetape4k/mongodb/aggregation/AggregationSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`DocumentExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/main/kotlin/io/bluetape4k/mongodb/bson/DocumentExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Features**, **Architecture Diagrams**, **Core Class Structure**, **Module API Structure**, **Aggregation Pipeline Data Flow**, **Dependency**, **Core Features**, **1. Creating a MongoClient**, **2. Database & Collection Extensions**, and **3. Collection Convenience Functions**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-io"))
api(project(":bluetape4k-coroutines"))
api(libs.mongodb.driver.kotlin.coroutine)
api(libs.mongodb.driver.kotlin.extensions)
api(libs.mongo.bson.kotlin)
compileOnly(libs.mongo.bson.kotlinx)
implementation(libs.kotlinx.coroutines.core)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track pool saturation, query latency, retries, transaction rollbacks, and schema compatibility. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-mongodb:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractMongoTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/test/kotlin/io/bluetape4k/mongodb/AbstractMongoTest.kt)
- [`MongoClientSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/test/kotlin/io/bluetape4k/mongodb/MongoClientSupportTest.kt)
- [`MongoCollectionExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/test/kotlin/io/bluetape4k/mongodb/MongoCollectionExtensionsTest.kt)
- [`MongoDatabaseExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/test/kotlin/io/bluetape4k/mongodb/MongoDatabaseExtensionsTest.kt)
- [`AggregationSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/test/kotlin/io/bluetape4k/mongodb/aggregation/AggregationSupportTest.kt)
- [`DocumentExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/test/kotlin/io/bluetape4k/mongodb/bson/DocumentExtensionsTest.kt)
- [`AggregationExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/test/kotlin/io/bluetape4k/mongodb/examples/AggregationExamples.kt)
- [`BasicCrudExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/test/kotlin/io/bluetape4k/mongodb/examples/BasicCrudExamples.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/build.gradle.kts)
- [`MongoClientExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/main/kotlin/io/bluetape4k/mongodb/MongoClientExtensions.kt)
- [`MongoClientProvider`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/main/kotlin/io/bluetape4k/mongodb/MongoClientProvider.kt)
- [`MongoClientSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/main/kotlin/io/bluetape4k/mongodb/MongoClientSupport.kt)
- [`MongoCollectionExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/main/kotlin/io/bluetape4k/mongodb/MongoCollectionExtensions.kt)
- [`MongoDatabaseExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/main/kotlin/io/bluetape4k/mongodb/MongoDatabaseExtensions.kt)
- [`AggregationSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/main/kotlin/io/bluetape4k/mongodb/aggregation/AggregationSupport.kt)
- [`DocumentExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/main/kotlin/io/bluetape4k/mongodb/bson/DocumentExtensions.kt)
- [`AbstractMongoTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/test/kotlin/io/bluetape4k/mongodb/AbstractMongoTest.kt)
- [`MongoClientSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/test/kotlin/io/bluetape4k/mongodb/MongoClientSupportTest.kt)
- [`MongoCollectionExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/test/kotlin/io/bluetape4k/mongodb/MongoCollectionExtensionsTest.kt)
- [`MongoDatabaseExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/test/kotlin/io/bluetape4k/mongodb/MongoDatabaseExtensionsTest.kt)
- [`AggregationSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/mongodb/src/test/kotlin/io/bluetape4k/mongodb/aggregation/AggregationSupportTest.kt)
