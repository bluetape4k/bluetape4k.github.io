---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-fastjson2"
manualId: bluetape4k-fastjson2
title: "Fastjson2 Serialization"
description: "bluetape4k-fastjson2 is a module that wraps the Fastjson2 library as Kotlin extension functions."
kind: library
group: io
learningOrder: 340
manual:
  id: "bluetape4k-fastjson2"
  repository: "bluetape4k-projects"
  group: "io"
  kind: "library"
  sourceCommit: "222f640a5a8937d3000dc49b2e2f585726ed70e6"
  sourcePath: "docs/manual/en/modules/bluetape4k-fastjson2.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "io/fastjson2"
  layer: "build"
  learningOrder: 340
---


## Problem

bluetape4k-fastjson2 is a module that wraps the Fastjson2 library as Kotlin extension functions. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-fastjson2` when the application needs encoding boundaries, resource ownership, streaming, compatibility, and malformed input. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-fastjson2")
}
```

Gradle project path: `:bluetape4k-fastjson2`. Source directory: `io/fastjson2`.

## Concepts

The first source-level concepts to inspect are `FastjsonSerializer`, `JSONArrayExtensions`, `JSONBExtensions`, `JSONExtensions`, and `JSONObjectExtensions`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`FastjsonSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/main/kotlin/io/bluetape4k/fastjson2/FastjsonSerializer.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`FastjsonSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/main/kotlin/io/bluetape4k/fastjson2/FastjsonSerializer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JSONArrayExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/main/kotlin/io/bluetape4k/fastjson2/extensions/JSONArrayExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JSONBExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/main/kotlin/io/bluetape4k/fastjson2/extensions/JSONBExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JSONExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/main/kotlin/io/bluetape4k/fastjson2/extensions/JSONExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JSONObjectExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/main/kotlin/io/bluetape4k/fastjson2/extensions/JSONObjectExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Overview**, **Architecture Diagrams**, **Fastjson2 Class Structure**, **JSON vs JSONB Serialization Flow**, **Key Features**, **1. FastjsonSerializer**, **2. JSON String Extension Functions**, **3. JSONB Binary Extension Functions**, **4. JSONArray Extension Functions**, and **5. JSONObject Extension Functions**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(libs.fastjson2)
api(libs.fastjson2.kotlin)
api(project(":bluetape4k-json"))
api(project(":bluetape4k-io"))
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track payload size, allocation, latency, malformed-input rate, resource closure, and protocol errors. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-fastjson2:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractFastjson2Test`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/test/kotlin/io/bluetape4k/fastjson2/AbstractFastjson2Test.kt)
- [`AbstractJsonSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/test/kotlin/io/bluetape4k/fastjson2/AbstractJsonSerializerTest.kt)
- [`FastjsonSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/test/kotlin/io/bluetape4k/fastjson2/FastjsonSerializerTest.kt)
- [`JSONArrayExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/test/kotlin/io/bluetape4k/fastjson2/extensions/JSONArrayExtensionsTest.kt)
- [`JSONBExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/test/kotlin/io/bluetape4k/fastjson2/extensions/JSONBExtensionsTest.kt)
- [`JSONExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/test/kotlin/io/bluetape4k/fastjson2/extensions/JSONExtensionsTest.kt)
- [`JSONObjectExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/test/kotlin/io/bluetape4k/fastjson2/extensions/JSONObjectExtensionsTest.kt)
- [`models`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/test/kotlin/io/bluetape4k/fastjson2/model/models.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `1.11.0` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### Fastjson2 Class Structure diagram

[![Fastjson2 Class Structure diagram](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/io-fastjson2-diagram-01.png)](../../assets/readme-diagrams/io-fastjson2-diagram-01.svg)

_Release README: [`io/fastjson2/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/io/fastjson2/README.md)_

### JSON vs JSONB Serialization Flow diagram

[![JSON vs JSONB Serialization Flow diagram](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/io-fastjson2-diagram-02.png)](../../assets/readme-diagrams/io-fastjson2-diagram-02.svg)

_Release README: [`io/fastjson2/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/io/fastjson2/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/build.gradle.kts)
- [`FastjsonSerializer`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/main/kotlin/io/bluetape4k/fastjson2/FastjsonSerializer.kt)
- [`JSONArrayExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/main/kotlin/io/bluetape4k/fastjson2/extensions/JSONArrayExtensions.kt)
- [`JSONBExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/main/kotlin/io/bluetape4k/fastjson2/extensions/JSONBExtensions.kt)
- [`JSONExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/main/kotlin/io/bluetape4k/fastjson2/extensions/JSONExtensions.kt)
- [`JSONObjectExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/main/kotlin/io/bluetape4k/fastjson2/extensions/JSONObjectExtensions.kt)
- [`AbstractFastjson2Test`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/test/kotlin/io/bluetape4k/fastjson2/AbstractFastjson2Test.kt)
- [`AbstractJsonSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/test/kotlin/io/bluetape4k/fastjson2/AbstractJsonSerializerTest.kt)
- [`FastjsonSerializerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/test/kotlin/io/bluetape4k/fastjson2/FastjsonSerializerTest.kt)
- [`JSONArrayExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/test/kotlin/io/bluetape4k/fastjson2/extensions/JSONArrayExtensionsTest.kt)
- [`JSONBExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/test/kotlin/io/bluetape4k/fastjson2/extensions/JSONBExtensionsTest.kt)
- [`JSONExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/test/kotlin/io/bluetape4k/fastjson2/extensions/JSONExtensionsTest.kt)
- [`JSONObjectExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/fastjson2/src/test/kotlin/io/bluetape4k/fastjson2/extensions/JSONObjectExtensionsTest.kt)
