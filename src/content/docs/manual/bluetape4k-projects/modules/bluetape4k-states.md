---
manualId: bluetape4k-states
title: "bluetape4k-states"
description: "A Kotlin DSL-based finite state machine (FSM) library for JVM backend and library code."
kind: library
group: utilities
manual:
  id: "bluetape4k-states"
  repository: "bluetape4k-projects"
  group: "utilities"
  kind: "library"
  sourceCommit: "5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6"
  sourcePath: "docs/manual/en/modules/bluetape4k-states.md"
  layer: "build"
---


## Problem

A Kotlin DSL-based finite state machine (FSM) library for JVM backend and library code. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-states` when the application needs input contracts, value semantics, algorithmic cost, and deterministic output. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-states")
}
```

Gradle project path: `:bluetape4k-states`. Source directory: `utils/states`.

## Concepts

The first source-level concepts to inspect are `BaseStateMachine`, `StateMachine`, `StateMachineException`, `SuspendStateMachineInterface`, `TransitionResult`, `DefaultStateMachine`, `ParentTransitionKey`, and `StateMachineDsl`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`BaseStateMachine`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/api/BaseStateMachine.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`BaseStateMachine`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/api/BaseStateMachine.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`StateMachine`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/api/StateMachine.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`StateMachineException`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/api/StateMachineException.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`SuspendStateMachineInterface`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/api/SuspendStateMachineInterface.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TransitionResult`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/api/TransitionResult.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`DefaultStateMachine`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/core/DefaultStateMachine.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ParentTransitionKey`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/core/ParentTransitionKey.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`StateMachineDsl`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/core/StateMachineDsl.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TransitionKey`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/core/TransitionKey.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TransitionRegistry`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/core/TransitionRegistry.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Architecture**, **Concept Overview**, **Class Diagram**, **DSL Builder Structure**, **Key Features**, **Module Positioning**, **Example State Diagrams**, **1. Turnstile — Simple FSM**, **2. Order — One-Way FSM**, and **3. Appointment — Complex FSM (clinic-appointment)**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-core"))
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
./gradlew :bluetape4k-states:test --no-configuration-cache
```

Representative test anchors:

- [`DefaultStateMachineTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/test/kotlin/io/bluetape4k/states/core/DefaultStateMachineTest.kt)
- [`GuardedTransitionTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/test/kotlin/io/bluetape4k/states/core/GuardedTransitionTest.kt)
- [`NestedStateMachineDslTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/test/kotlin/io/bluetape4k/states/core/NestedStateMachineDslTest.kt)
- [`StateMachineDslTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/test/kotlin/io/bluetape4k/states/core/StateMachineDslTest.kt)
- [`SuspendStateMachineTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/test/kotlin/io/bluetape4k/states/coroutines/SuspendStateMachineTest.kt)
- [`AppointmentExampleTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/test/kotlin/io/bluetape4k/states/examples/AppointmentExampleTest.kt)
- [`OrderExampleTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/test/kotlin/io/bluetape4k/states/examples/OrderExampleTest.kt)
- [`TurnstileExampleTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/test/kotlin/io/bluetape4k/states/examples/TurnstileExampleTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/build.gradle.kts)
- [`BaseStateMachine`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/api/BaseStateMachine.kt)
- [`StateMachine`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/api/StateMachine.kt)
- [`StateMachineException`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/api/StateMachineException.kt)
- [`SuspendStateMachineInterface`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/api/SuspendStateMachineInterface.kt)
- [`TransitionResult`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/api/TransitionResult.kt)
- [`DefaultStateMachine`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/core/DefaultStateMachine.kt)
- [`ParentTransitionKey`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/core/ParentTransitionKey.kt)
- [`StateMachineDsl`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/core/StateMachineDsl.kt)
- [`TransitionKey`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/core/TransitionKey.kt)
- [`TransitionRegistry`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/main/kotlin/io/bluetape4k/states/core/TransitionRegistry.kt)
- [`DefaultStateMachineTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/test/kotlin/io/bluetape4k/states/core/DefaultStateMachineTest.kt)
- [`GuardedTransitionTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/5d133ec6ff1d208ebdd0d923cd41bd39e497d8d6/utils/states/src/test/kotlin/io/bluetape4k/states/core/GuardedTransitionTest.kt)
