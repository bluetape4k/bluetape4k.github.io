---
slug: "manual/bluetape4k-aws/0.4/modules/bluetape4k-aws-bom"
manualId: "bluetape4k-aws-bom"
id: "bluetape4k-aws-bom"
title: "AWS Bill of Materials"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-aws-bom"
sourceDir: "bom"
releaseRef: "0.4.0"
artifact: io.github.bluetape4k.aws:bluetape4k-aws-bom
manual:
  id: "bluetape4k-aws-bom"
  repository: "bluetape4k-aws"
  group: "foundation"
  kind: "library"
  sourceCommit: "a64a49d44060154ec4371de9f7818168b75a6a67"
  sourcePath: "docs/manual/en/modules/bluetape4k-aws-bom.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "be4e6daea5654f84579955307ec56a58c8f405be"
  sourceDir: "bom"
  layer: "build"
---


> Library manual grounded in the 0.4.0 release source.

## Problem

A narrow BOM that aligns the published bluetape4k AWS libraries. Application code should normally import the central `bluetape4k-dependencies` platform instead.

## When to use it

Use it only when a build intentionally consumes AWS repository artifacts without the rest of the bluetape4k release train.

## Coordinates

Applications select one central BOM version.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.aws:bluetape4k-aws-bom")
}
```

AWS service SDKs follow a `compileOnly` policy; add the services actually used as runtime dependencies.

## Core concepts

The BOM carries dependency constraints; it contains no runtime code. `bluetape4k-dependencies` composes this BOM with the other repository BOMs.

## Quick start

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.aws:bluetape4k-aws-java")
    implementation("software.amazon.awssdk:s3")
}
```

`<version>` is the only bluetape4k version an application selects.

## API by task

Import the platform and omit versions from `bluetape4k-aws-java`, `-kotlin`, `-exposed`, `-spring-boot`, and `-ktor`.

## Recommended patterns

Put client and background-job ownership at one application boundary. Configure region, credentials, and endpoints once instead of rebuilding them per call.

## Integrations

The BOM aligns bluetape4k libraries, but service SDK modules remain explicit runtime choices because the library declares them `compileOnly`.

## Configuration

Declare the central platform once in a convention plugin or shared dependency block.

## Failure modes

A missing service SDK causes class-loading or bean back-off symptoms. A separately pinned repository BOM can create incompatible cross-repository versions.

## Operations

Upgrade the central BOM as one reviewed change and run compile plus integration tests for the services actually enabled.

## Testing

Run `./gradlew :bluetape4k-aws-bom:dependencies` in this repository and dependency insight in the consuming application.

## Workshops and learning path

Start with the central platform, choose one library, add one service SDK, and then follow the matching S3, DynamoDB, SQS, or Exposed example.

## Limitations

This BOM does not add AWS SDK service jars, create clients, or configure credentials.

## Sources

- [Release source: `bom/build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/bom/build.gradle.kts)
