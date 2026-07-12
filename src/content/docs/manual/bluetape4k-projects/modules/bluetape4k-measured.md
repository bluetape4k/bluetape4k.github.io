---
manualId: bluetape4k-measured
title: "Module bluetape4k-measured"
description: "bluetape4k-measured represents compound units such as m/s and kgm/s^2 in a type-safe way, based on composable unit types (Units) and measured values (Measure)."
kind: library
group: utilities
manual:
  id: "bluetape4k-measured"
  repository: "bluetape4k-projects"
  group: "utilities"
  kind: "library"
  sourceCommit: "ebe06db0b305bb2df767beb74bba95f79641bcc8"
  sourcePath: "docs/manual/en/modules/bluetape4k-measured.md"
  layer: "build"
---


## Problem

bluetape4k-measured represents compound units such as m/s and kgm/s^2 in a type-safe way, based on composable unit types (Units) and measured values (Measure). This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-measured` when the application needs input contracts, value semantics, algorithmic cost, and deterministic output. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-measured")
}
```

Gradle project path: `:bluetape4k-measured`. Source directory: `utils/measured`.

## Concepts

The first source-level concepts to inspect are `Angle`, `Area`, `BinarySize`, `EnergyPower`, `Frequency`, `GraphicsLength`, `Length`, and `Mass`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`Angle`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/Angle.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`Angle`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/Angle.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Area`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/Area.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`BinarySize`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/BinarySize.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`EnergyPower`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/EnergyPower.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Frequency`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/Frequency.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`GraphicsLength`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/GraphicsLength.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Length`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/Length.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Mass`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/Mass.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Motion`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/Motion.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Pressure`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/Pressure.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Core Concepts**, **Provided Units**, **Quick Example**, **Test**, **Class Diagram**, **Unit Composition Flow**, and **Compatibility Adapter for units**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-core"))
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
./gradlew :bluetape4k-measured:test --no-configuration-cache
```

Representative test anchors:

- [`AngleTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/test/kotlin/io/bluetape4k/measured/AngleTest.kt)
- [`AreaTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/test/kotlin/io/bluetape4k/measured/AreaTest.kt)
- [`BinarySizeTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/test/kotlin/io/bluetape4k/measured/BinarySizeTest.kt)
- [`EnergyPowerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/test/kotlin/io/bluetape4k/measured/EnergyPowerTest.kt)
- [`FrequencyTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/test/kotlin/io/bluetape4k/measured/FrequencyTest.kt)
- [`GraphicsLengthTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/test/kotlin/io/bluetape4k/measured/GraphicsLengthTest.kt)
- [`LengthTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/test/kotlin/io/bluetape4k/measured/LengthTest.kt)
- [`MassTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/test/kotlin/io/bluetape4k/measured/MassTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/build.gradle.kts)
- [`Angle`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/Angle.kt)
- [`Area`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/Area.kt)
- [`BinarySize`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/BinarySize.kt)
- [`EnergyPower`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/EnergyPower.kt)
- [`Frequency`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/Frequency.kt)
- [`GraphicsLength`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/GraphicsLength.kt)
- [`Length`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/Length.kt)
- [`Mass`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/Mass.kt)
- [`Motion`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/Motion.kt)
- [`Pressure`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/main/kotlin/io/bluetape4k/measured/Pressure.kt)
- [`AngleTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/test/kotlin/io/bluetape4k/measured/AngleTest.kt)
- [`AreaTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/ebe06db0b305bb2df767beb74bba95f79641bcc8/utils/measured/src/test/kotlin/io/bluetape4k/measured/AreaTest.kt)
