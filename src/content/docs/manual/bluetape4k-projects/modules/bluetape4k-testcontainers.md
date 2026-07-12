---
manualId: bluetape4k-testcontainers
title: "Module bluetape4k-testcontainers"
description: "A server wrapper and utility library for building integration tests quickly on top of Testcontainers 2.0.3."
kind: library
group: testing
manual:
  id: "bluetape4k-testcontainers"
  repository: "bluetape4k-projects"
  group: "testing"
  kind: "library"
  sourceCommit: "dda876503926aa16302b4416e3f3a3e2bff26526"
  sourcePath: "docs/manual/en/modules/bluetape4k-testcontainers.md"
  layer: "build"
---


## Problem

A server wrapper and utility library for building integration tests quickly on top of Testcontainers 2.0.3. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-testcontainers` when the application needs fixture ownership, isolation, deterministic cleanup, and failure diagnostics. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-testcontainers")
}
```

Gradle project path: `:bluetape4k-testcontainers`. Source directory: `testing/testcontainers`.

## Concepts

The first source-level concepts to inspect are `GenericContainerExtensions`, `GenericServer`, `PropertyExportingServer`, `AwsEmulatorServer`, `AwsEmulatorServerExtensions`, `DynamoDbLocalServer`, `ElasticMqServer`, and `FlociServer`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`GenericContainerExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/GenericContainerExtensions.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`GenericContainerExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/GenericContainerExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`GenericServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/GenericServer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`PropertyExportingServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/PropertyExportingServer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AwsEmulatorServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/aws/AwsEmulatorServer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AwsEmulatorServerExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/aws/AwsEmulatorServerExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`DynamoDbLocalServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/aws/DynamoDbLocalServer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ElasticMqServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/aws/ElasticMqServer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`FlociServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/aws/FlociServer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`LocalStackServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/aws/LocalStackServer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MiniStackServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/aws/MiniStackServer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Architecture**, **Container Lifecycle**, **Supported Container Class Diagram**, **Supported Container Structure**, **Key Features**, **System Property Export (PropertyExportingServer)**, **Exported Keys by Server**, **Usage Examples**, **Database**, and **PostgreSQL Extensions**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
api(project(":bluetape4k-core"))
api(libs.testcontainers)
api(libs.testcontainers.junit.jupiter)
api(libs.awaitility.kotlin)
api(libs.jna)
api(libs.jna.platform)
compileOnly(libs.hikaricp)
compileOnly(libs.testcontainers.mysql)
compileOnly(libs.testcontainers.mariadb)
compileOnly(libs.testcontainers.postgresql)
compileOnly(libs.testcontainers.cockroachdb)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`rootCA.pem`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/resources/certs/rootCA.pem)
- [`redisson-cluster.yml`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/resources/redisson-cluster.yml)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Keep fixtures isolated, bound resource use, expose diagnostics, and close shared services deterministically. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-testcontainers:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractContainerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/test/kotlin/io/bluetape4k/testcontainers/AbstractContainerTest.kt)
- [`ContainerReusePolicyTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/test/kotlin/io/bluetape4k/testcontainers/ContainerReusePolicyTest.kt)
- [`GenericContainerExtensionsSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/test/kotlin/io/bluetape4k/testcontainers/GenericContainerExtensionsSupportTest.kt)
- [`GenericServerSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/test/kotlin/io/bluetape4k/testcontainers/GenericServerSupportTest.kt)
- [`GenericServerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/test/kotlin/io/bluetape4k/testcontainers/GenericServerTest.kt)
- [`PropertyExportingServerContractTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/test/kotlin/io/bluetape4k/testcontainers/PropertyExportingServerContractTest.kt)
- [`RegisterSystemPropertiesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/test/kotlin/io/bluetape4k/testcontainers/RegisterSystemPropertiesTest.kt)
- [`DynamoDbLocalServerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/test/kotlin/io/bluetape4k/testcontainers/aws/DynamoDbLocalServerTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/build.gradle.kts)
- [`GenericContainerExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/GenericContainerExtensions.kt)
- [`GenericServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/GenericServer.kt)
- [`PropertyExportingServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/PropertyExportingServer.kt)
- [`AwsEmulatorServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/aws/AwsEmulatorServer.kt)
- [`AwsEmulatorServerExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/aws/AwsEmulatorServerExtensions.kt)
- [`DynamoDbLocalServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/aws/DynamoDbLocalServer.kt)
- [`ElasticMqServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/aws/ElasticMqServer.kt)
- [`FlociServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/aws/FlociServer.kt)
- [`LocalStackServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/aws/LocalStackServer.kt)
- [`MiniStackServer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/main/kotlin/io/bluetape4k/testcontainers/aws/MiniStackServer.kt)
- [`AbstractContainerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/test/kotlin/io/bluetape4k/testcontainers/AbstractContainerTest.kt)
- [`ContainerReusePolicyTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/testing/testcontainers/src/test/kotlin/io/bluetape4k/testcontainers/ContainerReusePolicyTest.kt)
