---
slug: "manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-bom"
manualId: "bluetape4k-exposed-bom"
id: "bluetape4k-exposed-bom"
title: "Exposed Bill of Materials"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-bom"
sourceDir: "exposed/bom"
releaseRef: "2.0.0"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-bom
manual:
  id: "bluetape4k-exposed-bom"
  repository: "bluetape4k-exposed"
  group: "foundation"
  kind: "library"
  sourceCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourcePath: "docs/manual/bluetape4k-exposed/en/modules/bluetape4k-exposed-bom.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourceDir: "exposed/bom"
  layer: "build"
---


> Version alignment for the published `bluetape4k-exposed` libraries. Applications should normally import the central `bluetape4k-dependencies` BOM instead of selecting this repository BOM directly.

## Problem

An application can combine core, JDBC or R2DBC, a database adapter, and framework integration modules. Declaring every version independently permits a dependency graph that was never released or tested together. This BOM publishes constraints for the repository's publishable modules.

## When to use it

Use the central `io.github.bluetape4k:bluetape4k-dependencies:<version>` platform for an application that consumes more than one bluetape4k repository. Import this narrower BOM only when dependency management is intentionally limited to `bluetape4k-exposed`.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-jdbc")
}
```

Direct repository BOM: `io.github.bluetape4k.exposed:bluetape4k-exposed-bom:2.0.0`.

## Core concepts

- A BOM contributes version constraints; it adds no runtime classes.
- The repository BOM constrains published library projects and excludes examples, demos, and benchmarks.
- The documentation version records source provenance. The version an application selects should come from the central dependency catalog unless it deliberately owns lower-level alignment.

## Quick start

Import one platform, omit versions from managed bluetape4k artifacts, and inspect Gradle's resolved dependency graph. Do not import both BOMs merely to repeat the same constraints.

## API by task

| Task | Gradle API |
|---|---|
| Accept managed versions | `implementation(platform(...))` |
| Enforce every constraint | `implementation(enforcedPlatform(...))` |
| Inspect one dependency | `dependencyInsight` |
| Inspect a configuration | `dependencies --configuration runtimeClasspath` |

## Recommended patterns

Keep the central BOM version in one version catalog or convention plugin. Upgrade it as one change, then run the application's compile and integration tests before merging.

## Integrations

The BOM aligns repository artifacts; it does not install a JDBC driver, R2DBC driver, connection pool, Spring starter, or Testcontainers module. Declare those according to the selected runtime path.

## Configuration

No runtime configuration is exposed. Gradle resolves the platform during dependency graph construction.

## Failure modes

- Adding explicit versions beside managed artifacts can override the tested set.
- Treating a BOM as a library leaves required runtime modules absent.
- Mixing central and repository BOM versions from different release lines can produce surprising constraint selection.

## Operations

Record the central BOM version in deployment provenance. When diagnosing a classpath problem, capture `dependencyInsight` output rather than inferring the selected version from the build file.

## Testing

Run a dependency-resolution check, compile the chosen JDBC or R2DBC path, and execute its database integration tests. The BOM itself has no behavioral test surface.

## Workshops and learning path

Continue with [Getting started](/manual/bluetape4k-exposed/2.0/getting-started/), then choose [JDBC or R2DBC](/manual/bluetape4k-exposed/2.0/guides/jdbc-vs-r2dbc/). Workshop repositories use the same central dependency-management entry point.

## Limitations

The BOM cannot guarantee behavioral compatibility with an independently overridden Exposed, Kotlin, driver, or framework version. It also does not select JDBC over R2DBC.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `2.0.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### Exposed BOM managed artifact map

[![Exposed BOM managed artifact map](https://raw.githubusercontent.com/bluetape4k/bluetape4k-exposed/d632a0bc0662ae616b786f552150a7fabd1cee3e/docs/images/readme-diagrams/exposed-bom-diagram-01.png)](https://github.com/bluetape4k/bluetape4k-exposed/blob/d632a0bc0662ae616b786f552150a7fabd1cee3e/docs/images/readme-diagrams/exposed-bom-diagram-01.svg)

_Release README: [`exposed/bom/README.md`](https://github.com/bluetape4k/bluetape4k-exposed/blob/d632a0bc0662ae616b786f552150a7fabd1cee3e/exposed/bom/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [BOM build](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/exposed/bom/build.gradle.kts)
- [Repository settings](https://github.com/bluetape4k/bluetape4k-exposed/blob/2.0.0/settings.gradle.kts)
