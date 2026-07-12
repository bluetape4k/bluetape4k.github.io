---
manualId: bluetape4k-nats
title: "Module bluetape4k-nats"
description: "NATS.io is a simple, secure, and high-performance open-source messaging system for cloud-native applications, IoT messaging, and microservices architectures."
kind: library
group: infrastructure
manual:
  id: "bluetape4k-nats"
  repository: "bluetape4k-projects"
  group: "infrastructure"
  kind: "library"
  sourceCommit: "dda876503926aa16302b4416e3f3a3e2bff26526"
  sourcePath: "docs/manual/en/modules/bluetape4k-nats.md"
  layer: "build"
---


## Problem

NATS.io is a simple, secure, and high-performance open-source messaging system for cloud-native applications, IoT messaging, and microservices architectures. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-nats` when the application needs client lifecycle, reconnect policy, backpressure, retries, and observability. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-nats")
}
```

Gradle project path: `:bluetape4k-nats`. Source directory: `infra/nats`.

## Concepts

The first source-level concepts to inspect are `ConnectionExtensions`, `Consumer`, `ConsumerContext`, `JetStream`, `JetStreamApiException`, `JetStreamManagement`, `JetStreamOptions`, and `KeyValueManagement`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`ConnectionExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/ConnectionExtensions.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`ConnectionExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/ConnectionExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Consumer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/Consumer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`ConsumerContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/ConsumerContext.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JetStream`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/JetStream.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JetStreamApiException`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/JetStreamApiException.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JetStreamManagement`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/JetStreamManagement.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JetStreamOptions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/JetStreamOptions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`KeyValueManagement`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/KeyValueManagement.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`KeyValueOptions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/KeyValueOptions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`NatsConsts`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/NatsConsts.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Architecture**, **Features**, **Dependency**, **Key Features**, **1. Connection Extension Functions**, **2. JetStream Support**, **3. JetStreamManagement**, **4. Subscription Extensions**, **5. NATS Service**, and **6. Stream Configuration DSL**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-core"))
api(project(":bluetape4k-io"))
api(libs.jnats)
compileOnly(libs.nats.spring)
compileOnly(project(":bluetape4k-coroutines"))
compileOnly(libs.kotlinx.coroutines.core)
compileOnly(libs.kotlinx.coroutines.reactor)
compileOnly(libs.jackson3.module.blackbird)
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
./gradlew :bluetape4k-nats:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractNatsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/test/kotlin/io/bluetape4k/nats/AbstractNatsTest.kt)
- [`SimplePublishExample`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/test/kotlin/io/bluetape4k/nats/SimplePublishExample.kt)
- [`ConnectionExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/test/kotlin/io/bluetape4k/nats/client/ConnectionExtensionsTest.kt)
- [`ConsumerExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/test/kotlin/io/bluetape4k/nats/client/ConsumerExtensionsTest.kt)
- [`JetStreamOptionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/test/kotlin/io/bluetape4k/nats/client/JetStreamOptionsTest.kt)
- [`KeyValueOptionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/test/kotlin/io/bluetape4k/nats/client/KeyValueOptionsTest.kt)
- [`NatsManagementExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/test/kotlin/io/bluetape4k/nats/client/NatsManagementExtensionsTest.kt)
- [`NatsMessageTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/test/kotlin/io/bluetape4k/nats/client/NatsMessageTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/build.gradle.kts)
- [`ConnectionExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/ConnectionExtensions.kt)
- [`Consumer`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/Consumer.kt)
- [`ConsumerContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/ConsumerContext.kt)
- [`JetStream`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/JetStream.kt)
- [`JetStreamApiException`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/JetStreamApiException.kt)
- [`JetStreamManagement`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/JetStreamManagement.kt)
- [`JetStreamOptions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/JetStreamOptions.kt)
- [`KeyValueManagement`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/KeyValueManagement.kt)
- [`KeyValueOptions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/KeyValueOptions.kt)
- [`NatsConsts`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/main/kotlin/io/bluetape4k/nats/client/NatsConsts.kt)
- [`AbstractNatsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/test/kotlin/io/bluetape4k/nats/AbstractNatsTest.kt)
- [`SimplePublishExample`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/nats/src/test/kotlin/io/bluetape4k/nats/SimplePublishExample.kt)
