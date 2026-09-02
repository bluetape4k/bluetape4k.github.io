---
slug: "manual/bluetape4k-projects/2.0/modules/serializer-benchmark"
manualId: serializer-benchmark
title: "Serializer Allocation Benchmark"
description: "This non-published module proves allocation behavior for existing serializer ByteArray, compatibility ByteBuffer, and optimized ByteBuffer paths."
kind: benchmark
group: examples
learningOrder: 1515
manual:
  id: "serializer-benchmark"
  repository: "bluetape4k-projects"
  group: "examples"
  kind: "benchmark"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/serializer-benchmark.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "benchmark/serializer-benchmark"
  layer: "apply"
  learningOrder: 1515
---


## Problem

This non-published module proves allocation behavior for existing serializer ByteArray, compatibility ByteBuffer, and optimized ByteBuffer paths. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `serializer-benchmark` when the application needs the runnable entry point, required services, expected behavior, and the production pattern demonstrated. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

This benchmark project is not published as a Maven artifact. Run it from the repository and inspect its Gradle tasks before choosing a command.

Gradle project path: `:serializer-benchmark`. Source directory: `benchmark/serializer-benchmark`.

## Concepts

The first source-level concepts to inspect are `AvroSerializerAllocationBenchmark`, `BinarySerializerAllocationBenchmark`, `JsonSerializerAllocationBenchmark`, `SerializerBenchmarkPayload`, and `SerializerBenchmarkSupport`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

List the project tasks before running the example or benchmark:

```bash
./gradlew :serializer-benchmark:tasks --all
```

Then use the command documented by the module README and keep required external services isolated.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`AvroSerializerAllocationBenchmark`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/benchmark/serializer-benchmark/src/benchmark/kotlin/io/bluetape4k/benchmark/serializer/AvroSerializerAllocationBenchmark.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`BinarySerializerAllocationBenchmark`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/benchmark/serializer-benchmark/src/benchmark/kotlin/io/bluetape4k/benchmark/serializer/BinarySerializerAllocationBenchmark.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JsonSerializerAllocationBenchmark`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/benchmark/serializer-benchmark/src/benchmark/kotlin/io/bluetape4k/benchmark/serializer/JsonSerializerAllocationBenchmark.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`SerializerBenchmarkPayload`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/benchmark/serializer-benchmark/src/main/kotlin/io/bluetape4k/benchmark/serializer/SerializerBenchmarkPayload.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`SerializerBenchmarkSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/benchmark/serializer-benchmark/src/main/kotlin/io/bluetape4k/benchmark/serializer/SerializerBenchmarkSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Commands**, **Matrix**, and **Buffer Contract**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(project(":bluetape4k-io"))
implementation(project(":bluetape4k-json"))
implementation(project(":bluetape4k-jackson2"))
implementation(project(":bluetape4k-jackson3"))
implementation(project(":bluetape4k-fastjson2"))
implementation(project(":bluetape4k-avro"))
implementation(libs.kryo5)
implementation(bt4k.fory.kotlin)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Run the example in an isolated environment and observe startup, dependency health, requests, and shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :serializer-benchmark:test --no-configuration-cache
```

Representative test anchors:

- [`SerializerBenchmarkSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/benchmark/serializer-benchmark/src/test/kotlin/io/bluetape4k/benchmark/serializer/SerializerBenchmarkSupportTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/benchmark/serializer-benchmark/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/benchmark/serializer-benchmark/build.gradle.kts)
- [`AvroSerializerAllocationBenchmark`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/benchmark/serializer-benchmark/src/benchmark/kotlin/io/bluetape4k/benchmark/serializer/AvroSerializerAllocationBenchmark.kt)
- [`BinarySerializerAllocationBenchmark`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/benchmark/serializer-benchmark/src/benchmark/kotlin/io/bluetape4k/benchmark/serializer/BinarySerializerAllocationBenchmark.kt)
- [`JsonSerializerAllocationBenchmark`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/benchmark/serializer-benchmark/src/benchmark/kotlin/io/bluetape4k/benchmark/serializer/JsonSerializerAllocationBenchmark.kt)
- [`SerializerBenchmarkPayload`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/benchmark/serializer-benchmark/src/main/kotlin/io/bluetape4k/benchmark/serializer/SerializerBenchmarkPayload.kt)
- [`SerializerBenchmarkSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/benchmark/serializer-benchmark/src/main/kotlin/io/bluetape4k/benchmark/serializer/SerializerBenchmarkSupport.kt)
- [`SerializerBenchmarkSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/benchmark/serializer-benchmark/src/test/kotlin/io/bluetape4k/benchmark/serializer/SerializerBenchmarkSupportTest.kt)
