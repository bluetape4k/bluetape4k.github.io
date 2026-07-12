---
manualId: bluetape4k-science
title: "Module bluetape4k-science"
description: "An integrated Kotlin module for scientific and geospatial data processing: GIS coordinate conversion, Shapefile I/O, JTS geometry operations, PostGIS database pipelines, and NetCDF metadata cataloging."
kind: library
group: utilities
manual:
  id: "bluetape4k-science"
  repository: "bluetape4k-projects"
  group: "utilities"
  kind: "library"
  sourceCommit: "952a8a2566d05c0b7fd977f982bb83f5335848f8"
  sourcePath: "docs/manual/en/modules/bluetape4k-science.md"
  layer: "build"
---


## Problem

An integrated Kotlin module for scientific and geospatial data processing: GIS coordinate conversion, Shapefile I/O, JTS geometry operations, PostGIS database pipelines, and NetCDF metadata cataloging. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-science` when the application needs input contracts, value semantics, algorithmic cost, and deterministic output. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-science")
}
```

Gradle project path: `:bluetape4k-science`. Source directory: `utils/science`.

## Concepts

The first source-level concepts to inspect are `BoundingBox`, `BoundingBoxRelation`, `CoordConverters`, `DM`, `DMS`, `GeoLocation`, `UtmZone`, and `UtmZoneSupport`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`BoundingBox`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/BoundingBox.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`BoundingBox`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/BoundingBox.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`BoundingBoxRelation`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/BoundingBoxRelation.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CoordConverters`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/CoordConverters.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`DM`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/DM.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`DMS`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/DMS.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`GeoLocation`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/GeoLocation.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`UtmZone`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/UtmZone.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`UtmZoneSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/UtmZoneSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Vector`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/Vector.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`NetCdfException`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/exposed/NetCdfException.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Overview**, **Architecture**, **Integrated Module Overview**, **Coordinate Transformation Flow**, **PostGIS + NetCDF Database Schema**, **Module Layout**, **Features**, **Quick Start**, **5.1 GIS Coordinate Conversion**, and **5.2 Shapefile Processing**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-core"))
api(project(":bluetape4k-logging"))
api(libs.jts.core)
compileOnly(libs.proj4j)
compileOnly(libs.proj4j.epsg)
compileOnly(libs.esri.geometry.api)
compileOnly(libs.geotools.shapefile)
compileOnly(libs.geotools.referencing)
compileOnly(libs.geotools.epsg.hsql)
compileOnly(libs.ucar.cdm.core)
compileOnly(libs.ucar.netcdf4)
compileOnly(libs.guava)
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
./gradlew :bluetape4k-science:test --no-configuration-cache
```

Representative test anchors:

- [`BoundingBoxRelationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/test/kotlin/io/bluetape4k/science/coords/BoundingBoxRelationTest.kt)
- [`BoundingBoxTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/test/kotlin/io/bluetape4k/science/coords/BoundingBoxTest.kt)
- [`CoordConvertersTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/test/kotlin/io/bluetape4k/science/coords/CoordConvertersTest.kt)
- [`DmTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/test/kotlin/io/bluetape4k/science/coords/DmTest.kt)
- [`DmsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/test/kotlin/io/bluetape4k/science/coords/DmsTest.kt)
- [`GeoLocationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/test/kotlin/io/bluetape4k/science/coords/GeoLocationTest.kt)
- [`UtmZoneSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/test/kotlin/io/bluetape4k/science/coords/UtmZoneSupportTest.kt)
- [`UtmZoneTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/test/kotlin/io/bluetape4k/science/coords/UtmZoneTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/build.gradle.kts)
- [`BoundingBox`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/BoundingBox.kt)
- [`BoundingBoxRelation`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/BoundingBoxRelation.kt)
- [`CoordConverters`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/CoordConverters.kt)
- [`DM`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/DM.kt)
- [`DMS`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/DMS.kt)
- [`GeoLocation`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/GeoLocation.kt)
- [`UtmZone`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/UtmZone.kt)
- [`UtmZoneSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/UtmZoneSupport.kt)
- [`Vector`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/coords/Vector.kt)
- [`NetCdfException`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/main/kotlin/io/bluetape4k/science/exposed/NetCdfException.kt)
- [`BoundingBoxRelationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/test/kotlin/io/bluetape4k/science/coords/BoundingBoxRelationTest.kt)
- [`BoundingBoxTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/952a8a2566d05c0b7fd977f982bb83f5335848f8/utils/science/src/test/kotlin/io/bluetape4k/science/coords/BoundingBoxTest.kt)
