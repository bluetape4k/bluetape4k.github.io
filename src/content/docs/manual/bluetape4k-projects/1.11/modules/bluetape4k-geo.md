---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-geo"
manualId: bluetape4k-geo
title: "Module bluetape4k-geo"
description: "A unified module for geographic information processing. Provides Geocode, GeoHash, and GeoIP2 functionality."
kind: library
group: utilities
manual:
  id: "bluetape4k-geo"
  repository: "bluetape4k-projects"
  group: "utilities"
  kind: "library"
  sourceCommit: "e1463bff0f864add7c54b7188f492cfe36336cdd"
  sourcePath: "docs/manual/en/modules/bluetape4k-geo.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "utils/geo"
  layer: "build"
---


## Problem

A unified module for geographic information processing. Provides Geocode, GeoHash, and GeoIP2 functionality. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-geo` when the application needs input contracts, value semantics, algorithmic cost, and deterministic output. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-geo")
}
```

Gradle project path: `:bluetape4k-geo`. Source directory: `utils/geo`.

## Concepts

The first source-level concepts to inspect are `Address`, `Geocode`, `GeocodeAddressFinder`, `SuspendGeocodeAddressFinder`, `BingAddress`, `BingAddressFinder`, `BingMapModel`, and `BingMapService`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`Address`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/Address.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`Address`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/Address.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Geocode`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/Geocode.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`GeocodeAddressFinder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/GeocodeAddressFinder.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`SuspendGeocodeAddressFinder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/SuspendGeocodeAddressFinder.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`BingAddress`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/bing/BingAddress.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`BingAddressFinder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/bing/BingAddressFinder.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`BingMapModel`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/bing/BingMapModel.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`BingMapService`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/bing/BingMapService.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`GeoApiContextSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/google/GeoApiContextSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`GoogleAddress`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/google/GoogleAddress.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Architecture**, **Module Overview**, **Class Diagram**, **GeoHash Encoding/Decoding Flow**, **Key Features**, **Geocode (formerly utils/geocode)**, **GeoHash**, **GeoIP2 (formerly utils/geoip2)**, **Usage Examples**, and **GeoHash Encoding/Decoding**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-core"))
api(project(":bluetape4k-io"))
compileOnly(project(":bluetape4k-jackson3"))
compileOnly(project(":bluetape4k-resilience4j"))
compileOnly(project(":bluetape4k-feign"))
compileOnly(libs.feign.core)
compileOnly(libs.feign.kotlin)
compileOnly(libs.feign.slf4j)
compileOnly(libs.feign.jackson)
compileOnly("com.google.maps:google-maps-services:2.2.0")
compileOnly(libs.httpclient5)
compileOnly(libs.httpclient5.cache)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`GeoLite2-ASN.mmdb`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/resources/GeoLite2-ASN.mmdb)
- [`GeoLite2-City.mmdb`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/resources/GeoLite2-City.mmdb)
- [`GeoLite2-Country.mmdb`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/resources/GeoLite2-Country.mmdb)
- [`BingMapApi.http`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/resources/bing/BingMapApi.http)
- [`location.json`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/resources/bing/location.json)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Measure hot paths, bound input sizes, and monitor failures at the application boundary that calls the utility. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-geo:test --no-configuration-cache
```

Representative test anchors:

- [`GeoReadmeContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/test/kotlin/io/bluetape4k/geo/GeoReadmeContractTest.kt)
- [`AbstractGeocodeTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/test/kotlin/io/bluetape4k/geocode/AbstractGeocodeTest.kt)
- [`JsonSerializationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/test/kotlin/io/bluetape4k/geocode/JsonSerializationTest.kt)
- [`BingAddressFinderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/test/kotlin/io/bluetape4k/geocode/bing/BingAddressFinderTest.kt)
- [`BingMapServiceTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/test/kotlin/io/bluetape4k/geocode/bing/BingMapServiceTest.kt)
- [`GoogleAddressFinderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/test/kotlin/io/bluetape4k/geocode/google/GoogleAddressFinderTest.kt)
- [`AbstractGeoHashTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/test/kotlin/io/bluetape4k/geohash/AbstractGeoHashTest.kt)
- [`BoudingBoxTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/test/kotlin/io/bluetape4k/geohash/BoudingBoxTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/build.gradle.kts)
- [`Address`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/Address.kt)
- [`Geocode`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/Geocode.kt)
- [`GeocodeAddressFinder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/GeocodeAddressFinder.kt)
- [`SuspendGeocodeAddressFinder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/SuspendGeocodeAddressFinder.kt)
- [`BingAddress`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/bing/BingAddress.kt)
- [`BingAddressFinder`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/bing/BingAddressFinder.kt)
- [`BingMapModel`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/bing/BingMapModel.kt)
- [`BingMapService`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/bing/BingMapService.kt)
- [`GeoApiContextSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/google/GeoApiContextSupport.kt)
- [`GoogleAddress`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/main/kotlin/io/bluetape4k/geocode/google/GoogleAddress.kt)
- [`GeoReadmeContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/test/kotlin/io/bluetape4k/geo/GeoReadmeContractTest.kt)
- [`AbstractGeocodeTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/geo/src/test/kotlin/io/bluetape4k/geocode/AbstractGeocodeTest.kt)
