---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-examples-coroutines-demo"
manualId: bluetape4k-examples-coroutines-demo
title: "Kotlin Coroutine Examples"
description: "A collection of examples for learning the features and usage patterns of Kotlin Coroutines."
kind: example
group: examples
learningOrder: 1400
manual:
  id: "bluetape4k-examples-coroutines-demo"
  repository: "bluetape4k-projects"
  group: "examples"
  kind: "example"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-examples-coroutines-demo.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "examples/coroutines-demo"
  layer: "learn"
  learningOrder: 1400
---


## Problem

A collection of examples for learning the features and usage patterns of Kotlin Coroutines. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-examples-coroutines-demo` when the application needs the runnable entry point, required services, expected behavior, and the production pattern demonstrated. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

This example project is not published as a Maven artifact. Run it from the repository and inspect its Gradle tasks before choosing a command.

Gradle project path: `:bluetape4k-examples-coroutines-demo`. Source directory: `examples/coroutines-demo`.

## Concepts

The module is configuration or platform metadata and has no Kotlin/Java source type to index.

## Quick start

List the project tasks before running the example or benchmark:

```bash
./gradlew :bluetape4k-examples-coroutines-demo:tasks --all
```

Then use the command documented by the module README and keep required external services isolated.

## API by task

No Kotlin/Java source file is registered for this module. Use the build model and README as its public surface.

## Patterns

The README evidence is organized around **Examples**, **Basics (guide/)**, **Flow Examples (flow/)**, **Channel Examples (channels/)**, **Cancellation (cancellation/)**, **Coroutine Context (context/)**, **Builders (builders/)**, **Dispatchers (dispatchers/)**, **Exception Handling (exceptions/)**, and **Scope (scope/)**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The module build declares no direct `api`, `implementation`, `compileOnly`, or `runtimeOnly` dependency line. Inspect plugins and generated metadata in the build file.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Run the example in an isolated environment and observe startup, dependency health, requests, and shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-examples-coroutines-demo:test --no-configuration-cache
```

Representative test anchors:

- [`TestSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/TestSupport.kt)
- [`CoroutineBuilderExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/builders/CoroutineBuilderExamples.kt)
- [`CoroutineContextBuilderExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/builders/CoroutineContextBuilderExamples.kt)
- [`CancellationExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/cancellation/CancellationExamples.kt)
- [`ActorExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/channels/ActorExamples.kt)
- [`ChannelExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/channels/ChannelExamples.kt)
- [`MutexExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/concurrency/MutexExamples.kt)
- [`CoroutineContextExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/context/CoroutineContextExamples.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `2.0.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### Coroutines demo learning map

[![Coroutines demo learning map](https://raw.githubusercontent.com/bluetape4k/bluetape4k-projects/8165a8989e0075e7c17c489bf3000bf41fef8232/docs/images/readme-diagrams/examples-coroutines-demo-diagram-01.png)](https://github.com/bluetape4k/bluetape4k-projects/blob/8165a8989e0075e7c17c489bf3000bf41fef8232/docs/images/readme-diagrams/examples-coroutines-demo-diagram-01.svg)

_Release README: [`examples/coroutines-demo/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/8165a8989e0075e7c17c489bf3000bf41fef8232/examples/coroutines-demo/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/build.gradle.kts)
- [`TestSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/TestSupport.kt)
- [`CoroutineBuilderExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/builders/CoroutineBuilderExamples.kt)
- [`CoroutineContextBuilderExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/builders/CoroutineContextBuilderExamples.kt)
- [`CancellationExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/cancellation/CancellationExamples.kt)
- [`ActorExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/channels/ActorExamples.kt)
- [`ChannelExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/channels/ChannelExamples.kt)
- [`MutexExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/concurrency/MutexExamples.kt)
- [`CoroutineContextExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/examples/coroutines-demo/src/test/kotlin/io/bluetape4k/examples/coroutines/context/CoroutineContextExamples.kt)
