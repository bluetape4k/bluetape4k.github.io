---
manualId: bluetape4k-workflow
title: "bluetape4k-workflow"
description: "A Kotlin DSL-based workflow orchestration library with support for sync, coroutine-based, and Virtual Thread execution models. Define complex workflows declaratively using composable flow builders."
kind: library
group: utilities
manual:
  id: "bluetape4k-workflow"
  repository: "bluetape4k-projects"
  group: "utilities"
  kind: "library"
  sourceCommit: "dda876503926aa16302b4416e3f3a3e2bff26526"
  sourcePath: "docs/manual/en/modules/bluetape4k-workflow.md"
  layer: "build"
---


## Problem

A Kotlin DSL-based workflow orchestration library with support for sync, coroutine-based, and Virtual Thread execution models. Define complex workflows declaratively using composable flow builders. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-workflow` when the application needs input contracts, value semantics, algorithmic cost, and deterministic output. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-workflow")
}
```

Gradle project path: `:bluetape4k-workflow`. Source directory: `utils/workflow`.

## Concepts

The first source-level concepts to inspect are `ErrorStrategy`, `NamedSuspendWork`, `NamedWork`, `ParallelPolicy`, `RetryPolicy`, `SuspendWork`, `SuspendWorkFlow`, and `Work`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`ErrorStrategy`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/ErrorStrategy.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`ErrorStrategy`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/ErrorStrategy.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`NamedSuspendWork`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/NamedSuspendWork.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`NamedWork`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/NamedWork.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ParallelPolicy`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/ParallelPolicy.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RetryPolicy`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/RetryPolicy.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`SuspendWork`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/SuspendWork.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`SuspendWorkFlow`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/SuspendWorkFlow.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Work`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/Work.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`WorkAdapters`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/WorkAdapters.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`WorkContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/WorkContext.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Architecture**, **Concept Overview**, **WorkReport States**, **Execution Model**, **Key Features**, **WorkStatus & WorkReport**, **Control Flow Analogy**, **Core API**, **WorkContext**, and **Work & SuspendWork**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-core"))
implementation(project(":bluetape4k-virtualthread-api"))
runtimeOnly(project(":bluetape4k-virtualthread-jdk21"))
implementation(project(":bluetape4k-coroutines"))
implementation(libs.kotlinx.coroutines.core)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Measure hot paths, bound input sizes, and monitor failures at the application boundary that calls the utility. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-workflow:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractWorkflowTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/api/AbstractWorkflowTest.kt)
- [`WorkAdapterTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/api/WorkAdapterTest.kt)
- [`WorkContextTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/api/WorkContextTest.kt)
- [`WorkReportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/api/WorkReportTest.kt)
- [`ConditionalWorkFlowTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/core/ConditionalWorkFlowTest.kt)
- [`ParallelWorkFlowTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/core/ParallelWorkFlowTest.kt)
- [`RepeatWorkFlowTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/core/RepeatWorkFlowTest.kt)
- [`RetryWorkFlowTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/core/RetryWorkFlowTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/build.gradle.kts)
- [`ErrorStrategy`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/ErrorStrategy.kt)
- [`NamedSuspendWork`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/NamedSuspendWork.kt)
- [`NamedWork`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/NamedWork.kt)
- [`ParallelPolicy`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/ParallelPolicy.kt)
- [`RetryPolicy`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/RetryPolicy.kt)
- [`SuspendWork`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/SuspendWork.kt)
- [`SuspendWorkFlow`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/SuspendWorkFlow.kt)
- [`Work`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/Work.kt)
- [`WorkAdapters`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/WorkAdapters.kt)
- [`WorkContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/WorkContext.kt)
- [`AbstractWorkflowTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/api/AbstractWorkflowTest.kt)
- [`WorkAdapterTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/api/WorkAdapterTest.kt)
