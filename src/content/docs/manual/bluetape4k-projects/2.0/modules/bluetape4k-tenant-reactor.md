---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-tenant-reactor"
manualId: bluetape4k-tenant-reactor
title: "Reactor Tenant Context Adapter"
description: "JDK 25 adapter for immutable TenantId propagation in Reactor subscriber Context. It installs no default tenant, global hook, or automatic context propagation."
kind: library
group: concurrency
learningOrder: 260
manual:
  id: "bluetape4k-tenant-reactor"
  repository: "bluetape4k-projects"
  group: "concurrency"
  kind: "library"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-tenant-reactor.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "bluetape4k/tenant-reactor"
  layer: "build"
  learningOrder: 260
---


## Problem

JDK 25 adapter for immutable TenantId propagation in Reactor subscriber Context. It installs no default tenant, global hook, or automatic context propagation. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-tenant-reactor` when a reactive pipeline must carry an authorized `TenantId` in Reactor subscriber `Context`. Bind once at the subscription boundary and read through `ContextView` downstream. The adapter is appropriate when explicit propagation is preferred over global hooks or automatic context propagation.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-tenant-reactor")
}
```

Gradle project path: `:bluetape4k-tenant-reactor`. Source directory: `bluetape4k/tenant-reactor`.

## Concepts

The first source-level concepts to inspect are `ReactorTenantContext`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Bind at `contextWrite` and read lazily with `deferContextual`:

```kotlin
val result = Mono.deferContextual { context ->
    service.find(ReactorTenantContext.requireCurrent(context))
}.contextWrite { context ->
    ReactorTenantContext.withTenant(context, TenantId("clinic-a"))
}
```

`withTenant` returns a derived immutable `Context`; it does not mutate the input context.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`ReactorTenantContext.currentOrNull`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant-reactor/src/main/kotlin/io/bluetape4k/tenant/reactor/ReactorTenantContext.kt) | Read an optional `TenantId` from a `ContextView`. |
| [`ReactorTenantContext.requireCurrent`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant-reactor/src/main/kotlin/io/bluetape4k/tenant/reactor/ReactorTenantContext.kt) | Require the binding and fail with the common missing-context exception when absent. |
| [`ReactorTenantContext.withTenant`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant-reactor/src/main/kotlin/io/bluetape4k/tenant/reactor/ReactorTenantContext.kt) | Derive a new `Context` containing the canonical `TenantId`. |

## Patterns

Call `withTenant` once near the subscription boundary and use `deferContextual` where a downstream component needs the tenant. Do not call `Context.put` for every signal, install a global `Hooks` bridge, or copy the tenant into a mutable registry.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-tenant"))
api(libs.reactor.core)
```

Both dependencies are public API edges: consumers receive the common tenant contract and Reactor `Context` types with this adapter.

## Configuration

The adapter has no configuration properties, global registration, or automatic-propagation switch. The application chooses the subscription boundary explicitly in the pipeline.

## Failures

`currentOrNull` returns `null` for an unbound `ContextView`; `requireCurrent` throws the common `MissingTenantContextException`. Cancellation ends the subscriber lifecycle together with its context. The adapter provides no default, fallback, or duplicate-recovery policy.

## Operations

Do not expose tenant values through logs, exceptions, MDC, or metric tags. Binding-failure telemetry should use bounded carrier/stage labels and existing correlation or trace identifiers.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-tenant-reactor:test --no-configuration-cache
```

Representative test anchors:

- [`ReactorTenantContextTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant-reactor/src/test/kotlin/io/bluetape4k/tenant/reactor/ReactorTenantContextTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

The adapter does not authenticate tenants, parse headers, map HTTP errors, install Reactor hooks, or bridge automatically to coroutine `ReactorContext`. Each boundary must opt into propagation explicitly.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant-reactor/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant-reactor/build.gradle.kts)
- [`ReactorTenantContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant-reactor/src/main/kotlin/io/bluetape4k/tenant/reactor/ReactorTenantContext.kt)
- [`ReactorTenantContextTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/tenant-reactor/src/test/kotlin/io/bluetape4k/tenant/reactor/ReactorTenantContextTest.kt)
