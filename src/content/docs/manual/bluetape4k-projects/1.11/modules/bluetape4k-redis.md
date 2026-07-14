---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-redis"
manualId: bluetape4k-redis
title: "bluetape4k-redis"
description: "An umbrella module that bundles both the Lettuce and Redisson Redis clients. Existing code depending on bluetape4k-redis continues to work without modification."
kind: library
group: infrastructure
manual:
  id: "bluetape4k-redis"
  repository: "bluetape4k-projects"
  group: "infrastructure"
  kind: "library"
  sourceCommit: "0ecae4a1b0b25e9654cd631b437ef81215d81974"
  sourcePath: "docs/manual/en/modules/bluetape4k-redis.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/redis"
  layer: "build"
---


## Problem

An umbrella module that bundles both the Lettuce and Redisson Redis clients. Existing code depending on bluetape4k-redis continues to work without modification. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-redis` when the application needs client lifecycle, reconnect policy, backpressure, retries, and observability. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-redis")
}
```

Gradle project path: `:bluetape4k-redis`. Source directory: `infra/redis`.

## Concepts

The module is configuration or platform metadata and has no Kotlin/Java source type to index.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. The module has no Kotlin/Java source entry point; inspect its Gradle model and README.

## API by task

No Kotlin/Java source file is registered for this module. Use the build model and README as its public surface.

## Patterns

The README evidence is organized around **Module Structure**, **Dependency**, **Full Bundle (umbrella)**, **Selective Client Dependencies**, **Submodule Details**, **bluetape4k-lettuce**, **bluetape4k-redisson**, **Module Dependency Structure**, **Exported API Surface**, and **Spring Data Redis**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-lettuce"))
api(project(":bluetape4k-redisson"))
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track connection state, queue depth, retries, timeouts, remote errors, and graceful shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-redis:test --no-configuration-cache
```

No Kotlin/Java test file was found in the manifest's test paths. Verify the module build and add a focused contract test when adopting behavior not covered elsewhere.

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/redis/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/redis/build.gradle.kts)
