---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-money"
manualId: bluetape4k-money
title: "Module bluetape4k-money"
description: "A library built on the Java standard Money API (JSR-354) to simplify financial and currency operations. It uses the JavaMoney Moneta implementation for currency units, money calculations, and exchange-rate conversion."
kind: library
group: utilities
manual:
  id: "bluetape4k-money"
  repository: "bluetape4k-projects"
  group: "utilities"
  kind: "library"
  sourceCommit: "0ecae4a1b0b25e9654cd631b437ef81215d81974"
  sourcePath: "docs/manual/en/modules/bluetape4k-money.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "utils/money"
  layer: "build"
---


## Problem

A library built on the Java standard Money API (JSR-354) to simplify financial and currency operations. It uses the JavaMoney Moneta implementation for currency units, money calculations, and exchange-rate conversion. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-money` when the application needs input contracts, value semantics, algorithmic cost, and deterministic output. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-money")
}
```

Gradle project path: `:bluetape4k-money`. Source directory: `utils/money`.

## Concepts

The first source-level concepts to inspect are `CurrencyConversionSupport`, `CurrencyConverter`, `CurrencySupport`, `FastMoneySupport`, `MoneyAmountSupport`, and `MoneySupport`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`CurrencyConversionSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/main/kotlin/io/bluetape4k/money/CurrencyConversionSupport.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`CurrencyConversionSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/main/kotlin/io/bluetape4k/money/CurrencyConversionSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CurrencyConverter`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/main/kotlin/io/bluetape4k/money/CurrencyConverter.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CurrencySupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/main/kotlin/io/bluetape4k/money/CurrencySupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`FastMoneySupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/main/kotlin/io/bluetape4k/money/FastMoneySupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MoneyAmountSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/main/kotlin/io/bluetape4k/money/MoneyAmountSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MoneySupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/main/kotlin/io/bluetape4k/money/MoneySupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Overview**, **Adding the Dependency**, **Key Features**, **Class Diagram**, **Usage Examples**, **Create Currency Units**, **Create Money (Money)**, **High-Performance Money (FastMoney)**, **Create MonetaryAmount**, and **Money Arithmetic**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-core"))
api(libs.javax.money.api)
api(libs.javamoney.moneta)
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
./gradlew :bluetape4k-money:test --no-configuration-cache
```

Representative test anchors:

- [`CurrencyConversionSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/test/kotlin/io/bluetape4k/money/CurrencyConversionSupportTest.kt)
- [`CurrencyConverterTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/test/kotlin/io/bluetape4k/money/CurrencyConverterTest.kt)
- [`CurrencyUnitSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/test/kotlin/io/bluetape4k/money/CurrencyUnitSupportTest.kt)
- [`FastMoneySupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/test/kotlin/io/bluetape4k/money/FastMoneySupportTest.kt)
- [`MoneyAmountSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/test/kotlin/io/bluetape4k/money/MoneyAmountSupportTest.kt)
- [`MoneySupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/test/kotlin/io/bluetape4k/money/MoneySupportTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/build.gradle.kts)
- [`CurrencyConversionSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/main/kotlin/io/bluetape4k/money/CurrencyConversionSupport.kt)
- [`CurrencyConverter`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/main/kotlin/io/bluetape4k/money/CurrencyConverter.kt)
- [`CurrencySupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/main/kotlin/io/bluetape4k/money/CurrencySupport.kt)
- [`FastMoneySupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/main/kotlin/io/bluetape4k/money/FastMoneySupport.kt)
- [`MoneyAmountSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/main/kotlin/io/bluetape4k/money/MoneyAmountSupport.kt)
- [`MoneySupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/main/kotlin/io/bluetape4k/money/MoneySupport.kt)
- [`CurrencyConversionSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/test/kotlin/io/bluetape4k/money/CurrencyConversionSupportTest.kt)
- [`CurrencyConverterTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/test/kotlin/io/bluetape4k/money/CurrencyConverterTest.kt)
- [`CurrencyUnitSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/test/kotlin/io/bluetape4k/money/CurrencyUnitSupportTest.kt)
- [`FastMoneySupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/test/kotlin/io/bluetape4k/money/FastMoneySupportTest.kt)
- [`MoneyAmountSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/test/kotlin/io/bluetape4k/money/MoneyAmountSupportTest.kt)
- [`MoneySupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/money/src/test/kotlin/io/bluetape4k/money/MoneySupportTest.kt)
