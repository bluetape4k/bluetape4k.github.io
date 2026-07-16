---
slug: "manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-mysql8"
manualId: "bluetape4k-exposed-mysql8"
id: "bluetape4k-exposed-mysql8"
title: "Exposed MySQL 8 GIS Extensions"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-mysql8"
sourceDir: "exposed/mysql8"
releaseRef: "1.11.0"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-mysql8
manual:
  id: "bluetape4k-exposed-mysql8"
  repository: "bluetape4k-exposed"
  group: "database"
  kind: "library"
  sourceCommit: "06bf8ce472aefbe925117901a971399cbee68a53"
  sourcePath: "docs/manual/en/modules/bluetape4k-exposed-mysql8.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "0b494a5fd1e083006046764757342b68a397e4c5"
  sourceDir: "exposed/mysql8"
  layer: "build"
---


`bluetape4k-exposed-mysql8` adds JTS-backed MySQL 8 geometry columns, WKB conversion, constructors, spatial predicates, measurements, and transformations to Exposed JDBC.

## Problem

MySQL's internal geometry bytes and SRID-aware SQL do not map cleanly to generic Exposed columns. This module keeps conversion and spatial expressions type-directed.

## When to use it

Use it for MySQL 8 schemas that store or query geometry. Plain MySQL CRUD should depend on the JDBC module and Connector/J without this GIS layer.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-mysql8")
    runtimeOnly("com.mysql:mysql-connector-j")
}
```

## Core concepts

Geometry columns carry an SRID and map to JTS types. `MySqlWkbUtils` translates MySQL internal geometry, while expressions cover contains/within/intersects, distance, area, length, buffer, union, difference, intersection, centroid, and envelope.

## Quick start

```kotlin
object Places : Table() {
    val location = geoPoint("location", srid = 4326)
    val reference = geoPoint("reference", srid = 4326)
}
transaction(db) {
    Places.selectAll().where { Places.location.stDWithin(Places.reference, 1_000.0) }
}
```

## API by task

| Task | API |
| --- | --- |
| Columns | `geoPoint`, `geoPolygon`, `geoLineString`, multi/geometry helpers |
| Relations | `stContains`, `stWithin`, `stIntersects`, `stTouches` |
| Measurements | `stDistance`, `stDistanceSphere`, `stLength`, `stArea` |
| Transformations | `stBuffer`, `stUnion`, `stDifference`, `stIntersection` |

## Recommended patterns

Choose and document one SRID, validate incoming geometry, and add spatial indexes through migrations. Page ordinary query results with a stable order; use JDBC batch operations from the JDBC module for bulk writes.

## Integrations

JTS is an API dependency; Connector/J is compile-only and must be present at runtime. Release tests run MySQL Testcontainers and cover WKB conversion, geometry types, spatial relations, measurements, and a write-path spike.

## Configuration

Align server character/time-zone settings separately from geometry SRID. The application owns Connector/J properties, pool size, transaction isolation, and schema migration.

## Failure modes

Mismatched SRIDs, invalid WKB, unsupported geometry subtype, or missing spatial indexes can fail conversion or turn a bounded query into a scan. Results returned as generic expressions may require explicit conversion.

## Operations

Observe spatial index use, rows examined, temporary tables, lock waits, batch latency, and connection pool saturation. Record SRID and unit assumptions beside every distance threshold.

## Testing

Use MySQL 8 Testcontainers. Assert round trips for each geometry family, null handling, WKB byte order, spatial relation semantics, transaction rollback, paging order, and batch failure.

## Workshops and learning path

Read the [database adapter matrix](/manual/bluetape4k-exposed/1.11/guides/database-adapter-matrix/), implement one point query, then add complex geometry and indexes. Follow the JDBC [transaction boundary guide](/manual/bluetape4k-exposed/1.11/guides/transaction-boundaries/).

## Limitations

The module does not bundle Connector/J at runtime, manage schema/indexes, or make spatial functions portable to PostgreSQL/PostGIS. It is a MySQL 8 GIS extension, not a general MySQL adapter.

## Sources

- [Geometry column types](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/mysql8/src/main/kotlin/io/bluetape4k/exposed/mysql8/gis/GeoColumnTypes.kt)
- [Spatial functions](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/mysql8/src/main/kotlin/io/bluetape4k/exposed/mysql8/gis/SpatialFunctions.kt)
- [`MySqlWkbUtils`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/mysql8/src/main/kotlin/io/bluetape4k/exposed/mysql8/gis/MySqlWkbUtils.kt)
- [Geometry release test](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/mysql8/src/test/kotlin/io/bluetape4k/exposed/mysql8/gis/GeometryColumnTypeTest.kt)
