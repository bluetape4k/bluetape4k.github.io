---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-micrometer"
manualId: bluetape4k-micrometer
title: "Module bluetape4k-micrometer"
description: "A module that provides application performance measurement and observability features using Micrometer and the Observation API."
kind: library
group: infrastructure
manual:
  id: "bluetape4k-micrometer"
  repository: "bluetape4k-projects"
  group: "infrastructure"
  kind: "library"
  sourceCommit: "ece059d6f79ae8b6d769e44ec98483a1225f6260"
  sourcePath: "docs/manual/en/modules/bluetape4k-micrometer.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/micrometer"
  layer: "build"
---


## Problem

A module that provides application performance measurement and observability features using Micrometer and the Observation API. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-micrometer` when the application needs client lifecycle, reconnect policy, backpressure, retries, and observability. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-micrometer")
}
```

Gradle project path: `:bluetape4k-micrometer`. Source directory: `infra/micrometer`.

## Concepts

The first source-level concepts to inspect are `KeyValueSupport`, `TimerExtensions`, `Cache2kCacheMetrics`, `MeasuredCall`, `MeasuredCallAdapter`, `MetricsRecorder`, `MicrometerRetrofitMetricsFactory`, and `MicrometerRetrofitMetricsRecorder`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`KeyValueSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/common/KeyValueSupport.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`KeyValueSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/common/KeyValueSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TimerExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/TimerExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Cache2kCacheMetrics`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/cache/Cache2kCacheMetrics.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MeasuredCall`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/MeasuredCall.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MeasuredCallAdapter`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/MeasuredCallAdapter.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MetricsRecorder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/MetricsRecorder.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MicrometerRetrofitMetricsFactory`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/MicrometerRetrofitMetricsFactory.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MicrometerRetrofitMetricsRecorder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/MicrometerRetrofitMetricsRecorder.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Outcome`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/Outcome.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RetrofitCallMetricsCollector`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/RetrofitCallMetricsCollector.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Overview**, **Architecture**, **Core Class Structure**, **Metric Collection Flow**, **Retrofit2 Metric Collection Sequence**, **Coroutine Observation Flow**, **Dependency**, **Key Features**, **1. Timer Extensions**, and **Measuring Execution Time of Suspend Functions**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
api(project(":bluetape4k-core"))
implementation(project(":bluetape4k-cache-core"))
api(libs.micrometer.core)
implementation(libs.micrometer.registry.prometheus)
implementation(libs.micrometer.registry.datadog)
api(libs.micrometer.observation)
implementation(libs.micrometer.observation.test)
implementation(libs.micrometer.tracing.bridge.otel)
api(libs.micrometer.context.propagation)  // thread local <-> reactor 등 상이한 환경에서 context 전파를 위해 사용
implementation(libs.cache2k.core)
implementation(project(":bluetape4k-retrofit2"))
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
./gradlew :bluetape4k-micrometer:test --no-configuration-cache
```

Representative test anchors:

- [`KeyValueSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/test/kotlin/io/bluetape4k/micrometer/common/KeyValueSupportTest.kt)
- [`AbstractMicrometerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/test/kotlin/io/bluetape4k/micrometer/instrument/AbstractMicrometerTest.kt)
- [`TimerExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/test/kotlin/io/bluetape4k/micrometer/instrument/TimerExtensionsTest.kt)
- [`Cache2kCacheMetricsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/test/kotlin/io/bluetape4k/micrometer/instrument/cache/Cache2kCacheMetricsTest.kt)
- [`OutcomeTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/test/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/OutcomeTest.kt)
- [`Retrofit2MetricsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/test/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/Retrofit2MetricsTest.kt)
- [`RetrofitMetricsSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/test/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/RetrofitMetricsSupportTest.kt)
- [`RetrofitMetricsUnitTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/test/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/RetrofitMetricsUnitTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/build.gradle.kts)
- [`KeyValueSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/common/KeyValueSupport.kt)
- [`TimerExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/TimerExtensions.kt)
- [`Cache2kCacheMetrics`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/cache/Cache2kCacheMetrics.kt)
- [`MeasuredCall`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/MeasuredCall.kt)
- [`MeasuredCallAdapter`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/MeasuredCallAdapter.kt)
- [`MetricsRecorder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/MetricsRecorder.kt)
- [`MicrometerRetrofitMetricsFactory`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/MicrometerRetrofitMetricsFactory.kt)
- [`MicrometerRetrofitMetricsRecorder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/MicrometerRetrofitMetricsRecorder.kt)
- [`Outcome`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/Outcome.kt)
- [`RetrofitCallMetricsCollector`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/main/kotlin/io/bluetape4k/micrometer/instrument/retrofit2/RetrofitCallMetricsCollector.kt)
- [`KeyValueSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/test/kotlin/io/bluetape4k/micrometer/common/KeyValueSupportTest.kt)
- [`AbstractMicrometerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/micrometer/src/test/kotlin/io/bluetape4k/micrometer/instrument/AbstractMicrometerTest.kt)
