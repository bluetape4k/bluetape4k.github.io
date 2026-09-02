---
slug: "manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-spring-boot-common"
manualId: "bluetape4k-exposed-spring-boot-common"
id: "bluetape4k-exposed-spring-boot-common"
title: "Exposed Spring Boot Common Spring Data SPI"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-spring-boot-common"
sourceDir: "spring-boot/common"
releaseRef: "2.0.0"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-spring-boot-common
manual:
  id: "bluetape4k-exposed-spring-boot-common"
  repository: "bluetape4k-exposed"
  group: "integration"
  kind: "library"
  sourceCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourcePath: "docs/manual/bluetape4k-exposed/en/modules/bluetape4k-exposed-spring-boot-common.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourceDir: "spring-boot/common"
  layer: "build"
---


> Backend-neutral Spring Data metadata and query planning shared by the Exposed JDBC and R2DBC adapters.

## Problem

Spring Data metadata, query planning, and sort conversion were previously duplicated in backend adapters.
This module provides one canonical contract so JDBC and R2DBC use the same annotations, mapping metadata,
derived-query predicates, parameter access, and `Sort` conversion without making either backend depend on
the other.

## When to use it

Use it when an adapter or an application needs Exposed-aware Spring Data annotations, mapping metadata,
derived-query planning, or sort conversion without opening a database connection. Use the JDBC or R2DBC
adapter when repository factories, execution, and transaction behavior are required.

## Coordinates

Import the ecosystem BOM and omit individual Bluetape4k module versions:

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-spring-boot-common")
}
```

The common module has no dependency on the JDBC or R2DBC Spring Data adapters. It uses the repository BOM
for Exposed and the shared Bluetape4k logging and assertion libraries in its test surface.

## Core concepts

`@ExposedEntity` marks an Exposed DAO entity for Spring Data metadata. `ExposedMappingContext` caches
`ExposedPersistentEntity` instances and their table-backed properties. `ExposedQueryCreator` translates
the supported Spring Data `PartTree` operators into Exposed expressions, while
`ParameterMetadataProvider` supplies method parameters and `Sort.toExposedOrderBy` converts safe property
names to table columns.

## Quick start

Import the common annotations and sort conversion in new source:

```kotlin
import io.bluetape4k.spring.data.exposed.common.annotation.ExposedEntity
import io.bluetape4k.spring.data.exposed.common.annotation.Query
import io.bluetape4k.spring.data.exposed.common.repository.support.toExposedOrderBy

@ExposedEntity
class Member(/* Exposed DAO constructor */)

@Query("SELECT * FROM members WHERE email = ?1")
fun findByEmail(email: String): List<Member>
```

The adapter that executes the repository remains responsible for its database and transaction boundary.

## API by task

- Use `@ExposedEntity` and `ExposedMappingContext` for backend-neutral entity metadata.
- Use `@Query` for declared query metadata shared by JDBC and R2DBC repository methods.
- Use `ExposedQueryCreator` and `ParameterMetadataProvider` when implementing a Spring Data query adapter.
- Use `Sort.toExposedOrderBy` for validated table-column ordering.
- Use the JDBC or R2DBC artifact for repository registration and execution.

## Recommended patterns

Keep this module free of backend-specific transaction or connection code. Treat `ExposedMappingContext`
as shared metadata and do not mutate table metadata during query execution. Prefer the common imports for
new source; keep legacy JDBC imports only while migrating existing consumers. Let the sort converter skip
unknown properties through the existing Bluetape4k logging path instead of interpolating arbitrary SQL.

## Integrations

The JDBC adapter uses the common query, mapping, annotation, and sort contracts while retaining its
transaction manager and repository execution. The R2DBC adapter uses the same contracts while retaining
its suspend execution and coroutine lifecycle. The common module itself does not register Spring Boot
auto-configuration.

## Configuration

There is no database or transaction configuration in this module. Applications configure the selected
JDBC or R2DBC adapter, its database, pools, transaction boundaries, and repository scanning. Keep the
common dependency version aligned through `bluetape4k-dependencies`.

## Failure modes

- An entity is not mapped: verify `@ExposedEntity` and the Exposed DAO/table contract.
- A property cannot be resolved: verify the property has a supported Exposed column mapping.
- A derived query is rejected: stay within the bounded `ExposedQueryCreator` operator set or provide a
  declared query/adapter-specific implementation.
- A sort field is ignored: use the mapped table column name or its supported `camelCase`/`snake_case`
  spelling; unknown fields are logged and skipped.
- A runtime transaction is missing: configure the JDBC or R2DBC adapter; this module does not create one.

## Operations

Observe query planning failures and skipped sort properties through the configured Bluetape4k logging
path. Correlate those messages with the selected adapter's transaction and database metrics. Do not treat
successful metadata creation as database readiness.

## Testing

Test annotation metadata, mapping cache identity and concurrency, supported derived-query operators,
parameter binding, sort conversion, and unsupported-property behavior. Use `bluetape4k-assertions` in
tests and run the JDBC and R2DBC adapter suites separately because their database and transaction
semantics remain distinct.

## Workshops and learning path

Run the [Spring Boot JDBC example](/manual/bluetape4k-exposed/2.0/modules/exposed-spring-boot-jdbc-demo/) and the
[Spring Boot R2DBC example](/manual/bluetape4k-exposed/2.0/modules/exposed-spring-boot-r2dbc-demo/) to see the common SPI behind each adapter.
Then read the adapter manuals for transaction ownership and coroutine lifecycle details.

## Limitations

This module does not provide repository factories, transaction managers, connection pools, entity reloads,
or backend-specific error handling. Derived-query support is limited to the operators implemented by
`ExposedQueryCreator`; unsupported operators fail explicitly.

## Sources

- [`ExposedEntity.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/spring-boot/common/src/main/kotlin/io/bluetape4k/spring/data/exposed/common/annotation/ExposedEntity.kt)
- [`Query.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/spring-boot/common/src/main/kotlin/io/bluetape4k/spring/data/exposed/common/annotation/Query.kt)
- [`ExposedMappingContext.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/spring-boot/common/src/main/kotlin/io/bluetape4k/spring/data/exposed/common/mapping/ExposedMappingContext.kt)
- [`ExposedQueryCreator.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/spring-boot/common/src/main/kotlin/io/bluetape4k/spring/data/exposed/common/repository/query/ExposedQueryCreator.kt)
- [`ExposedSortSupport.kt`](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/spring-boot/common/src/main/kotlin/io/bluetape4k/spring/data/exposed/common/repository/support/ExposedSortSupport.kt)
