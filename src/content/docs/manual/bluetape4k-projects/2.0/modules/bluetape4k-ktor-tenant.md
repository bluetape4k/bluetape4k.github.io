---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-ktor-tenant"
manualId: bluetape4k-ktor-tenant
title: "Ktor Tenant Context Adapter"
description: "JDK 25 adapter that binds a canonical TenantId to Ktor ApplicationCall.attributes with a one-call/one-tenant contract. The application owns plugins, authentication, header parsing, and HTTP status mapping."
kind: library
group: web
learningOrder: 850
manual:
  id: "bluetape4k-ktor-tenant"
  repository: "bluetape4k-projects"
  group: "web"
  kind: "library"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-ktor-tenant.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "ktor/tenant"
  layer: "build"
  learningOrder: 850
---


## Problem

JDK 25 adapter that binds a canonical TenantId to Ktor ApplicationCall.attributes with a one-call/one-tenant contract. The application owns plugins, authentication, header parsing, and HTTP status mapping. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-ktor-tenant` when an application must attach one authorized `TenantId` to each Ktor `ApplicationCall` and make it available across dispatcher hops that keep the same call. The application plugin or authentication pipeline remains responsible for parsing, authentication, authorization, and HTTP status mapping.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-ktor-tenant")
}
```

Gradle project path: `:bluetape4k-ktor-tenant`. Source directory: `ktor/tenant`.

## Concepts

The first source-level concepts to inspect are `KtorTenantContext`, and `TenantAlreadyBoundException`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Bind once near the start of the request pipeline after the raw input has been validated:

```kotlin
val tenant = authenticateAndResolveClinic(call.request).tenantId
KtorTenantContext.bindTenant(call, tenant)

service.find(KtorTenantContext.requireCurrent(call))
```

Pass the same `ApplicationCall` to downstream code that needs the request-local binding.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`KtorTenantContext.bindTenant`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/ktor/tenant/src/main/kotlin/io/bluetape4k/ktor/tenant/KtorTenantContext.kt) | Bind the first canonical tenant to the call without exposing a mutable clear or overwrite API. |
| [`KtorTenantContext.currentOrNull`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/ktor/tenant/src/main/kotlin/io/bluetape4k/ktor/tenant/KtorTenantContext.kt) | Read the optional request-local binding. |
| [`KtorTenantContext.requireCurrent`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/ktor/tenant/src/main/kotlin/io/bluetape4k/ktor/tenant/KtorTenantContext.kt) | Require the binding and fail with the common missing-context exception when absent. |
| [`TenantAlreadyBoundException`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/ktor/tenant/src/main/kotlin/io/bluetape4k/ktor/tenant/TenantAlreadyBoundException.kt) | Reject a second or concurrent binding without overwriting the first tenant. |

## Patterns

Authenticate and resolve the canonical tenant before calling `bindTenant`, then bind exactly once per call. The `ApplicationCall.attributes` owner provides request-local lifecycle cleanup; do not add a global registry, mutable clear operation, nested rebind, or duplicate-binding recovery.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-tenant"))
api(libs.ktor.server.core)
```

Both dependencies are public API edges: consumers receive the common tenant contract and Ktor server core types with this adapter.

## Configuration

The adapter has no configuration properties or installed Ktor plugin. Applications decide where authentication, canonicalization, binding, and error mapping occur in their own pipeline.

## Failures

`currentOrNull` returns `null` for an unbound call and `requireCurrent` throws the common `MissingTenantContextException`. A second or concurrent `bindTenant` call throws `TenantAlreadyBoundException("Tenant context is already bound to this call")` and preserves the first value.

## Operations

Do not include tenant values in logs, exceptions, MDC, or metric tags. Keep binding-failure telemetry bounded to carrier/stage labels and correlate it through existing trace or request identifiers.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-ktor-tenant:test --no-configuration-cache
```

Representative test anchors:

- [`KtorTenantContextTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/ktor/tenant/src/test/kotlin/io/bluetape4k/ktor/tenant/KtorTenantContextTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

The module does not install an application plugin, authenticate or authorize tenants, parse headers, map exceptions to HTTP responses, or recover from duplicate binding. It provides no default tenant or process-global registry.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/ktor/tenant/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/ktor/tenant/build.gradle.kts)
- [`KtorTenantContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/ktor/tenant/src/main/kotlin/io/bluetape4k/ktor/tenant/KtorTenantContext.kt)
- [`TenantAlreadyBoundException`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/ktor/tenant/src/main/kotlin/io/bluetape4k/ktor/tenant/TenantAlreadyBoundException.kt)
- [`KtorTenantContextTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/ktor/tenant/src/test/kotlin/io/bluetape4k/ktor/tenant/KtorTenantContextTest.kt)
