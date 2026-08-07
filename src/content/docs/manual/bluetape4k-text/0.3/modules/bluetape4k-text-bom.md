---
slug: "manual/bluetape4k-text/0.3/modules/bluetape4k-text-bom"
title: "Text BOM"
manual:
  id: "bluetape4k-text-bom"
  repository: "bluetape4k-text"
  group: "foundation"
  kind: "library"
  sourceCommit: "c5726bea30591e4c5c26523ccac4ad62c5ea9237"
  sourcePath: "docs/manual/en/modules/bluetape4k-text-bom.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "aead213d2d25307d7d3684226943a5f95c7411f2"
  sourceDir: "bom"
  layer: "build"
---


The Text BOM aligns versions for the five published runtime libraries. It contains dependency constraints only: importing it does not add a tokenizer, detector, or search API to your classpath.

## What it provides

- one version for `tokenizer-core`, `tokenizer-korean`, `tokenizer-japanese`, `lingua`, and `text-search`;
- Gradle platform and Maven dependency-management compatibility;
- a Text-only alternative when the wider `bluetape4k-dependencies` BOM is not appropriate.

## Add the dependency

Prefer the ecosystem BOM when your application consumes libraries from several bluetape4k repositories:

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<release>"))
    implementation("io.github.bluetape4k.text:lingua")
    implementation("io.github.bluetape4k.text:text-search")
}
```

Import the Text BOM directly when you intentionally manage only this repository's artifacts:

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k.text:bluetape4k-text-bom:0.3.0"))
    implementation("io.github.bluetape4k.text:tokenizer-korean")
}
```

## How it works

The BOM is a Gradle `java-platform` project. Its published POM contributes dependency-management constraints. Runtime classes remain in the five library artifacts, so a build that imports only the BOM will compile no Text API calls.

## When to choose it

Choose `bluetape4k-dependencies` for normal ecosystem applications. Choose `bluetape4k-text-bom` when Text has an intentionally independent release policy in your build. Avoid declaring versions on individual Text modules after importing either BOM; doing so bypasses the alignment you selected.

## Constraints

The BOM aligns compatible coordinates but cannot validate your runtime composition. It also does not add optional coroutines support required by the `text-search` Flow extension in applications that call it.

## Continue learning

- [Getting started](/manual/bluetape4k-text/0.3/getting-started/)
- [Repository map](/manual/bluetape4k-text/0.3/architecture/repository-map/)
- [Capability selection](/manual/bluetape4k-text/0.3/guides/capability-selection/)

## Source evidence

- [BOM README](https://github.com/bluetape4k/bluetape4k-text/blob/0.3.0/bom/README.md)
- [BOM build](https://github.com/bluetape4k/bluetape4k-text/blob/0.3.0/bom/build.gradle.kts)

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `0.3.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### bom Architecture diagram

[![bom Architecture diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-text/aead213d2d25307d7d3684226943a5f95c7411f2/docs/images/readme-diagrams/bom-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-text/blob/aead213d2d25307d7d3684226943a5f95c7411f2/docs/images/readme-diagrams/bom-architecture-01.svg)

_Release README: [`bom/README.md`](https://github.com/bluetape4k/bluetape4k-text/blob/aead213d2d25307d7d3684226943a5f95c7411f2/bom/README.md)_

<!-- release-readme-diagrams:end -->
