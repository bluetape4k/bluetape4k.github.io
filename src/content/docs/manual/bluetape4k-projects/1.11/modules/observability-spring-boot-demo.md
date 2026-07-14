---
slug: "manual/bluetape4k-projects/1.11/modules/observability-spring-boot-demo"
manualId: observability-spring-boot-demo
title: "bluetape4k Spring Boot observability demo"
description: "Runnable Spring Boot 4 application that shows how to use bluetape4k observation helpers with Spring Boot Actuator Prometheus metrics and application-owned OTLP tracing configuration."
kind: example
group: learning
manual:
  id: "observability-spring-boot-demo"
  repository: "bluetape4k-projects"
  group: "learning"
  kind: "example"
  sourceCommit: "03115e34f03bad535921d3cad5cd23a2e7814581"
  sourcePath: "docs/manual/en/modules/observability-spring-boot-demo.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "examples/spring-boot/observability-spring-boot-demo"
  layer: "learn"
---


## Problem

Runnable Spring Boot 4 application that shows how to use bluetape4k observation helpers with Spring Boot Actuator Prometheus metrics and application-owned OTLP tracing configuration. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `observability-spring-boot-demo` when the application needs the runnable entry point, required services, expected behavior, and the production pattern demonstrated. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

This example project is not published as a Maven artifact. Run it from the repository and inspect its Gradle tasks before choosing a command.

Gradle project path: `:observability-spring-boot-demo`. Source directory: `examples/spring-boot/observability-spring-boot-demo`.

## Concepts

The first source-level concepts to inspect are `ObservabilitySpringBootDemoApplication`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

List the project tasks before running the example or benchmark:

```bash
./gradlew :observability-spring-boot-demo:tasks --all
```

Then use the command documented by the module README and keep required external services isolated.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`ObservabilitySpringBootDemoApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/observability-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/spring/observability/ObservabilitySpringBootDemoApplication.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Example Scenario**, **Architecture**, **Sequence Diagram**, **Dependencies**, **Configuration**, **Run**, **Verify**, and **Test**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
implementation(project(":bluetape4k-micrometer"))
implementation(project(":bluetape4k-spring-boot-core"))
implementation("org.springframework.boot:spring-boot-starter-web")
implementation("org.springframework.boot:spring-boot-starter-actuator")
runtimeOnly(libs.micrometer.registry.prometheus)
runtimeOnly(libs.micrometer.tracing.bridge.otel)
runtimeOnly(libs.opentelemetry.exporter.otlp)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`application.yaml`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/observability-spring-boot-demo/src/main/resources/application.yaml)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Run the example in an isolated environment and observe startup, dependency health, requests, and shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :observability-spring-boot-demo:test --no-configuration-cache
```

Representative test anchors:

- [`ObservabilitySpringBootDemoApplicationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/observability-spring-boot-demo/src/test/kotlin/io/bluetape4k/examples/spring/observability/ObservabilitySpringBootDemoApplicationTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/observability-spring-boot-demo/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/observability-spring-boot-demo/build.gradle.kts)
- [`ObservabilitySpringBootDemoApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/observability-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/spring/observability/ObservabilitySpringBootDemoApplication.kt)
- [`ObservabilitySpringBootDemoApplicationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/observability-spring-boot-demo/src/test/kotlin/io/bluetape4k/examples/spring/observability/ObservabilitySpringBootDemoApplicationTest.kt)
