---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-junit5"
manualId: bluetape4k-junit5
title: "Module bluetape4k-junit5"
description: "An extension library that reduces repetitive boilerplate in JUnit 5 tests."
kind: library
group: testing
manual:
  id: "bluetape4k-junit5"
  repository: "bluetape4k-projects"
  group: "testing"
  kind: "library"
  sourceCommit: "d42c9dcf3dfa8f169b3bda9c56d3c8531b3ff296"
  sourcePath: "docs/manual/en/modules/bluetape4k-junit5.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "testing/junit5"
  layer: "build"
---


## Problem

An extension library that reduces repetitive boilerplate in JUnit 5 tests. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-junit5` when the application needs fixture ownership, isolation, deterministic cleanup, and failure diagnostics. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-junit5")
}
```

Gradle project path: `:bluetape4k-junit5`. Source directory: `testing/junit5`.

## Concepts

The first source-level concepts to inspect are `ExtensionContext`, `AwaitilityConfigurationExtension`, `AwaitilityCoroutines`, `MultithreadingTester`, `StructuredTaskScopeTester`, `TestingExecutors`, `CancellationContracts`, and `CoroutineSupport`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`ExtensionContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/ExtensionContext.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`ExtensionContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/ExtensionContext.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AwaitilityConfigurationExtension`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/awaitility/AwaitilityConfigurationExtension.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AwaitilityCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/awaitility/AwaitilityCoroutines.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MultithreadingTester`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/concurrency/MultithreadingTester.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`StructuredTaskScopeTester`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/concurrency/StructuredTaskScopeTester.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TestingExecutors`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/concurrency/TestingExecutors.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CancellationContracts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/coroutines/CancellationContracts.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CoroutineSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/coroutines/CoroutineSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`SuspendedJobTester`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/coroutines/SuspendedJobTester.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`FakeValueExtension`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/faker/FakeValueExtension.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Architecture**, **Extension Component Overview**, **Class Diagram**, **Key Features**, **Usage Examples**, **StopwatchExtension**, **TempFolderExtension**, **OutputCapture**, **FakeValue / Fakers**, and **Stress Testing**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.junit.bom))
api(project(":bluetape4k-logging"))
api(project(":bluetape4k-virtualthread-api"))
runtimeOnly(project(":bluetape4k-virtualthread-jdk21"))
api(libs.kotlin.test.junit5)
api(libs.junit.jupiter)
api(libs.junit.jupiter.engine)
api(libs.junit.jupiter.params)
api(libs.junit.platform.launcher)
api(project(":bluetape4k-assertions"))
api(libs.mockk)
api(libs.awaitility.kotlin)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`org.junit.jupiter.api.extension.Extension`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/resources/META-INF/services/org.junit.jupiter.api.extension.Extension)
- [`org.junit.platform.launcher.TestExecutionListener`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/resources/META-INF/services/org.junit.platform.launcher.TestExecutionListener)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Keep fixtures isolated, bound resource use, expose diagnostics, and close shared services deterministically. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-junit5:test --no-configuration-cache
```

Representative test anchors:

- [`ExtensionContextSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/test/kotlin/io/bluetape4k/junit5/ExtensionContextSupportTest.kt)
- [`AwaitilityCoroutinesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/test/kotlin/io/bluetape4k/junit5/awaitility/AwaitilityCoroutinesTest.kt)
- [`MultithreadingTesterTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/test/kotlin/io/bluetape4k/junit5/concurrency/MultithreadingTesterTest.kt)
- [`StructuredTaskScopeTesterTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/test/kotlin/io/bluetape4k/junit5/concurrency/StructuredTaskScopeTesterTest.kt)
- [`CancellationContractsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/test/kotlin/io/bluetape4k/junit5/coroutines/CancellationContractsTest.kt)
- [`CoroutineSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/test/kotlin/io/bluetape4k/junit5/coroutines/CoroutineSupportTest.kt)
- [`SuspendedJobTesterTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/test/kotlin/io/bluetape4k/junit5/coroutines/SuspendedJobTesterTest.kt)
- [`DataFakerExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/test/kotlin/io/bluetape4k/junit5/faker/DataFakerExamples.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/build.gradle.kts)
- [`ExtensionContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/ExtensionContext.kt)
- [`AwaitilityConfigurationExtension`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/awaitility/AwaitilityConfigurationExtension.kt)
- [`AwaitilityCoroutines`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/awaitility/AwaitilityCoroutines.kt)
- [`MultithreadingTester`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/concurrency/MultithreadingTester.kt)
- [`StructuredTaskScopeTester`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/concurrency/StructuredTaskScopeTester.kt)
- [`TestingExecutors`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/concurrency/TestingExecutors.kt)
- [`CancellationContracts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/coroutines/CancellationContracts.kt)
- [`CoroutineSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/coroutines/CoroutineSupport.kt)
- [`SuspendedJobTester`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/coroutines/SuspendedJobTester.kt)
- [`FakeValueExtension`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/main/kotlin/io/bluetape4k/junit5/faker/FakeValueExtension.kt)
- [`ExtensionContextSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/test/kotlin/io/bluetape4k/junit5/ExtensionContextSupportTest.kt)
- [`AwaitilityCoroutinesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/testing/junit5/src/test/kotlin/io/bluetape4k/junit5/awaitility/AwaitilityCoroutinesTest.kt)
