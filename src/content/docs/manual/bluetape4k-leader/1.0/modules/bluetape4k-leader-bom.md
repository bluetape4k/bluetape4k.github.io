---
slug: "manual/bluetape4k-leader/1.0/modules/bluetape4k-leader-bom"
manualId: "bluetape4k-leader-bom"
id: "bluetape4k-leader-bom"
title: "Leader BOM"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-bom"
sourceDir: "bluetape4k-leader-bom"
releaseRef: "1.0.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-bom
manual:
  id: "bluetape4k-leader-bom"
  repository: "bluetape4k-leader"
  group: "platform"
  kind: "library"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/modules/bluetape4k-leader-bom.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "bluetape4k-leader-bom"
  layer: "build"
---


> Library module

## Problem

Aligns every published Leader artifact. Applications should not choose this internal BOM separately; `bluetape4k-dependencies` already imports it.

## When to use it

Use this page to diagnose version alignment. For normal setup, choose one ecosystem platform version and omit versions from all Leader modules.

## Coordinates

Internal coordinate: `io.github.bluetape4k.leader:bluetape4k-leader-bom`. Consumers import `io.github.bluetape4k:bluetape4k-dependencies:<version>`.

## Core concepts

This is a Gradle `java-platform`: it publishes constraints, not runtime classes. Ownership flows from the application to `bluetape4k-dependencies`, then to this BOM.

## Quick start

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-core")
}
```

## API by task

There is no runtime API. Use `dependencyInsight` to inspect which platform selected a module version.

## Recommended patterns

Import one top-level platform and keep module declarations versionless. Upgrade the platform as one reviewed change.

## Integrations

The consumer-facing integration is `bluetape4k-dependencies`; Maven users import it through dependency management.

## Configuration

The BOM has no properties, beans, or lifecycle. Stable artifacts resolve from Maven Central.

## Failure modes

Mixing a direct Leader BOM with explicitly versioned modules splits version ownership. Remove module versions and inspect the resolved constraints.

## Operations

Record the selected `bluetape4k-dependencies` version in build and deployment metadata, not an internal Leader BOM version.

## Testing

Compile one Core type and one selected backend after a platform upgrade; dependency locking can guard the resolved graph.

## Workshops and learning path

Start with the repository overview, then open the backend you will operate. Examples demonstrate executable combinations.

## Limitations

Version alignment does not guarantee compatibility with every external Redis, database, Kubernetes, or framework version.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `1.0.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### leader bom Architecture diagram

[![leader bom Architecture diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/e70146330302758f563a46b7286e3ce25f1bac49/docs/images/readme-diagrams/bluetape4k-leader-bom-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/e70146330302758f563a46b7286e3ce25f1bac49/docs/images/readme-diagrams/bluetape4k-leader-bom-architecture-01.svg)

_Release README: [`bluetape4k-leader-bom/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/e70146330302758f563a46b7286e3ce25f1bac49/bluetape4k-leader-bom/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

[Stable BOM build](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/bluetape4k-leader-bom/build.gradle.kts) · [Stable repository guide](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/README.md)
