---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-elasticsearch"
manualId: bluetape4k-elasticsearch
title: "Module bluetape4k-elasticsearch"
description: "Elasticsearch client library for Kotlin with Coroutines support."
kind: library
group: infrastructure
manual:
  id: "bluetape4k-elasticsearch"
  repository: "bluetape4k-projects"
  group: "infrastructure"
  kind: "library"
  sourceCommit: "073ab365abcd91889ecd82d0077522cac2f13e15"
  sourcePath: "docs/manual/en/modules/bluetape4k-elasticsearch.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/elasticsearch"
  layer: "build"
---


## Problem

Elasticsearch client library for Kotlin with Coroutines support. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-elasticsearch` when the application needs client lifecycle, reconnect policy, backpressure, retries, and observability. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-elasticsearch")
}
```

Gradle project path: `:bluetape4k-elasticsearch`. Source directory: `infra/elasticsearch`.

## Concepts

The first source-level concepts to inspect are `ElasticsearchClientDsl`, `ElasticsearchClients`, `ElasticsearchDefaults`, `BulkApiCoroutines`, `BulkIngesterCoroutines`, `ElasticsearchCoroutines`, `SearchApiCoroutines`, and `JsonpMappers`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`ElasticsearchClientDsl`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/ElasticsearchClientDsl.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`ElasticsearchClientDsl`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/ElasticsearchClientDsl.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ElasticsearchClients`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/ElasticsearchClients.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ElasticsearchDefaults`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/ElasticsearchDefaults.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`BulkApiCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/coroutines/BulkApiCoroutines.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`BulkIngesterCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/coroutines/BulkIngesterCoroutines.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ElasticsearchCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/coroutines/ElasticsearchCoroutines.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`SearchApiCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/coroutines/SearchApiCoroutines.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JsonpMappers`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/support/JsonpMappers.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Features**, **Architecture**, **Installation**, **Gradle (Kotlin DSL)**, **Gradle (Groovy DSL)**, **Maven**, **Dependencies**, **Client API Structure**, **Usage Examples**, and **1. Creating an Elasticsearch Async Client**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-core"))
api(project(":bluetape4k-io"))
api(project(":bluetape4k-logging"))
api(libs.elasticsearch.java)
api(project(":bluetape4k-coroutines"))
api(libs.kotlinx.coroutines.core)
compileOnly(project(":bluetape4k-jackson2"))
compileOnly(libs.jackson.databind)
compileOnly(libs.jackson.module.kotlin)
compileOnly(project(":bluetape4k-jackson3"))
compileOnly(libs.jackson3.databind)
compileOnly(libs.jackson3.module.kotlin)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track connection state, queue depth, retries, timeouts, remote errors, and graceful shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-elasticsearch:test --no-configuration-cache
```

Representative test anchors:

- [`ElasticsearchClientsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/test/kotlin/io/bluetape4k/elasticsearch/ElasticsearchClientsTest.kt)
- [`BulkApiCoroutinesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/test/kotlin/io/bluetape4k/elasticsearch/coroutines/BulkApiCoroutinesTest.kt)
- [`BulkIngesterCoroutinesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/test/kotlin/io/bluetape4k/elasticsearch/coroutines/BulkIngesterCoroutinesTest.kt)
- [`ElasticsearchCoroutinesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/test/kotlin/io/bluetape4k/elasticsearch/coroutines/ElasticsearchCoroutinesTest.kt)
- [`SearchApiCoroutinesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/test/kotlin/io/bluetape4k/elasticsearch/coroutines/SearchApiCoroutinesTest.kt)
- [`ProductIndexExample`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/test/kotlin/io/bluetape4k/elasticsearch/examples/ProductIndexExample.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/build.gradle.kts)
- [`ElasticsearchClientDsl`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/ElasticsearchClientDsl.kt)
- [`ElasticsearchClients`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/ElasticsearchClients.kt)
- [`ElasticsearchDefaults`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/ElasticsearchDefaults.kt)
- [`BulkApiCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/coroutines/BulkApiCoroutines.kt)
- [`BulkIngesterCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/coroutines/BulkIngesterCoroutines.kt)
- [`ElasticsearchCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/coroutines/ElasticsearchCoroutines.kt)
- [`SearchApiCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/coroutines/SearchApiCoroutines.kt)
- [`JsonpMappers`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/main/kotlin/io/bluetape4k/elasticsearch/support/JsonpMappers.kt)
- [`ElasticsearchClientsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/test/kotlin/io/bluetape4k/elasticsearch/ElasticsearchClientsTest.kt)
- [`BulkApiCoroutinesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/test/kotlin/io/bluetape4k/elasticsearch/coroutines/BulkApiCoroutinesTest.kt)
- [`BulkIngesterCoroutinesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/test/kotlin/io/bluetape4k/elasticsearch/coroutines/BulkIngesterCoroutinesTest.kt)
- [`ElasticsearchCoroutinesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/elasticsearch/src/test/kotlin/io/bluetape4k/elasticsearch/coroutines/ElasticsearchCoroutinesTest.kt)
