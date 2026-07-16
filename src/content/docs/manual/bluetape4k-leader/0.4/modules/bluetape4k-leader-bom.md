---
slug: "manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-bom"
manualId: "bluetape4k-leader-bom"
id: "bluetape4k-leader-bom"
title: "Leader BOM"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-bom"
sourceDir: "bluetape4k-leader-bom"
releaseRef: "0.4.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-bom
manual:
  id: "bluetape4k-leader-bom"
  repository: "bluetape4k-leader"
  group: "platform"
  kind: "library"
  sourceCommit: "27627f5cf430ef2640d5847ecfeef914ea935c4c"
  sourcePath: "docs/manual/en/modules/bluetape4k-leader-bom.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
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

## Sources

[Stable BOM build](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/bluetape4k-leader-bom/build.gradle.kts) · [Stable repository guide](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/README.md)
