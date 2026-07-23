---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-javatimes"
manualId: bluetape4k-javatimes
title: "Java Time Utilities"
description: "An advanced time-operations library for the Java Time API (java.time)."
kind: library
group: utilities
learningOrder: 1210
manual:
  id: "bluetape4k-javatimes"
  repository: "bluetape4k-projects"
  group: "utilities"
  kind: "library"
  sourceCommit: "3a97a3fc2f3525c3a3384d511a9adb8571b0b680"
  sourcePath: "docs/manual/en/modules/bluetape4k-javatimes.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "utils/javatimes"
  layer: "build"
  learningOrder: 1210
---


## Problem

An advanced time-operations library for the Java Time API (java.time). This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-javatimes` when the application needs input contracts, value semantics, algorithmic cost, and deterministic output. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-javatimes")
}
```

Gradle project path: `:bluetape4k-javatimes`. Source directory: `utils/javatimes`.

## Concepts

The first source-level concepts to inspect are `AbstractTemporalInterval`, `IntervalTypealias`, `MutableTemporalInterval`, `ReadableTemporalInterval`, `TemporalInterval`, `TemporalIntervalSupport`, `TemporalIntervalWindowed`, and `ITimeBlock`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`AbstractTemporalInterval`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/interval/AbstractTemporalInterval.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`AbstractTemporalInterval`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/interval/AbstractTemporalInterval.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`IntervalTypealias`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/interval/IntervalTypealias.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MutableTemporalInterval`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/interval/MutableTemporalInterval.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ReadableTemporalInterval`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/interval/ReadableTemporalInterval.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TemporalInterval`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/interval/TemporalInterval.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TemporalIntervalSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/interval/TemporalIntervalSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TemporalIntervalWindowed`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/interval/TemporalIntervalWindowed.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ITimeBlock`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/period/ITimeBlock.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ITimeCalendar`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/period/ITimeCalendar.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ITimePeriod`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/period/ITimePeriod.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Architecture**, **Feature Overview**, **Class Hierarchy — Period Framework**, **PeriodRelation — How Two Periods Relate**, **Core Features (from bluetape4k-core)**, **Features**, **Temporal Interval (interval/)**, **Period Framework (period/)**, **TimeBlock and TimeRange**, and **DateAdd — Business Day Calculations**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

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
./gradlew :bluetape4k-javatimes:test --no-configuration-cache
```

Representative test anchors:

- [`TemporalIntervalSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/test/kotlin/io/bluetape4k/javatimes/interval/TemporalIntervalSupportTest.kt)
- [`TemporalIntervalTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/test/kotlin/io/bluetape4k/javatimes/interval/TemporalIntervalTest.kt)
- [`TemporalIntervalWindowedTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/test/kotlin/io/bluetape4k/javatimes/interval/TemporalIntervalWindowedTest.kt)
- [`AbstractPeriodTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/test/kotlin/io/bluetape4k/javatimes/period/AbstractPeriodTest.kt)
- [`PeriodRelationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/test/kotlin/io/bluetape4k/javatimes/period/PeriodRelationTest.kt)
- [`TimeBlockTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/test/kotlin/io/bluetape4k/javatimes/period/TimeBlockTest.kt)
- [`TimeCalendarConfigTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/test/kotlin/io/bluetape4k/javatimes/period/TimeCalendarConfigTest.kt)
- [`TimeCalendarTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/test/kotlin/io/bluetape4k/javatimes/period/TimeCalendarTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `1.11.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### Feature Overview diagram

[![Feature Overview diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-projects/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/utils-javatimes-diagram-01.png)](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/utils-javatimes-diagram-01.svg)

_Release README: [`utils/javatimes/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/utils/javatimes/README.md)_

### Class Hierarchy — Period Framework diagram

[![Class Hierarchy — Period Framework diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-projects/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/utils-javatimes-diagram-02.png)](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/utils-javatimes-diagram-02.svg)

_Release README: [`utils/javatimes/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/utils/javatimes/README.md)_

### PeriodRelation — How Two Periods Relate diagram

[![PeriodRelation — How Two Periods Relate diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-projects/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/utils-javatimes-diagram-03.png)](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/docs/images/readme-diagrams/utils-javatimes-diagram-03.svg)

_Release README: [`utils/javatimes/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/utils/javatimes/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/build.gradle.kts)
- [`AbstractTemporalInterval`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/interval/AbstractTemporalInterval.kt)
- [`IntervalTypealias`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/interval/IntervalTypealias.kt)
- [`MutableTemporalInterval`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/interval/MutableTemporalInterval.kt)
- [`ReadableTemporalInterval`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/interval/ReadableTemporalInterval.kt)
- [`TemporalInterval`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/interval/TemporalInterval.kt)
- [`TemporalIntervalSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/interval/TemporalIntervalSupport.kt)
- [`TemporalIntervalWindowed`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/interval/TemporalIntervalWindowed.kt)
- [`ITimeBlock`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/period/ITimeBlock.kt)
- [`ITimeCalendar`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/period/ITimeCalendar.kt)
- [`ITimePeriod`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/main/kotlin/io/bluetape4k/javatimes/period/ITimePeriod.kt)
- [`TemporalIntervalSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/test/kotlin/io/bluetape4k/javatimes/interval/TemporalIntervalSupportTest.kt)
- [`TemporalIntervalTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/javatimes/src/test/kotlin/io/bluetape4k/javatimes/interval/TemporalIntervalTest.kt)
