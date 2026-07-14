---
slug: "manual/bluetape4k-projects/1.11/modules/idgenerator-spring-boot-demo"
manualId: idgenerator-spring-boot-demo
title: "bluetape4k Spring Boot idgenerator demo"
description: "This example shows how to expose bluetape4k-idgenerators through a Spring Boot REST application. The Ktor version is tracked separately in issue #419."
kind: example
group: learning
manual:
  id: "idgenerator-spring-boot-demo"
  repository: "bluetape4k-projects"
  group: "learning"
  kind: "example"
  sourceCommit: "0ecae4a1b0b25e9654cd631b437ef81215d81974"
  sourcePath: "docs/manual/en/modules/idgenerator-spring-boot-demo.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "examples/spring-boot/idgenerator-spring-boot-demo"
  layer: "learn"
---


## Problem

This example shows how to expose bluetape4k-idgenerators through a Spring Boot REST application. The Ktor version is tracked separately in issue #419. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `idgenerator-spring-boot-demo` when the application needs the runnable entry point, required services, expected behavior, and the production pattern demonstrated. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

This example project is not published as a Maven artifact. Run it from the repository and inspect its Gradle tasks before choosing a command.

Gradle project path: `:idgenerator-spring-boot-demo`. Source directory: `examples/spring-boot/idgenerator-spring-boot-demo`.

## Concepts

The first source-level concepts to inspect are `IdGeneratorDemoApplication`, `IdGeneratorConfiguration`, `IdGeneratorProperties`, `IdGeneratorController`, `IdGeneratorExceptionHandler`, `IdGeneratorResponses`, `IdGeneratorRegistry`, and `IdGeneratorService`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

List the project tasks before running the example or benchmark:

```bash
./gradlew :idgenerator-spring-boot-demo:tasks --all
```

Then use the command documented by the module README and keep required external services isolated.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`IdGeneratorDemoApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/IdGeneratorDemoApplication.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`IdGeneratorConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/config/IdGeneratorConfiguration.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`IdGeneratorProperties`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/config/IdGeneratorProperties.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`IdGeneratorController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/controller/IdGeneratorController.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`IdGeneratorExceptionHandler`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/controller/IdGeneratorExceptionHandler.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`IdGeneratorResponses`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/controller/IdGeneratorResponses.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`IdGeneratorRegistry`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/service/IdGeneratorRegistry.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`IdGeneratorService`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/service/IdGeneratorService.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Architecture**, **Configuration**, **Endpoints**, **Usage**, and **Tests**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
implementation(project(":bluetape4k-idgenerators"))
implementation("org.springframework.boot:spring-boot-starter-web")
implementation("org.springframework.boot:spring-boot-starter-actuator")
implementation(libs.jackson3.module.kotlin)
implementation(libs.jackson3.module.blackbird)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`application.yaml`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/resources/application.yaml)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Run the example in an isolated environment and observe startup, dependency health, requests, and shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :idgenerator-spring-boot-demo:test --no-configuration-cache
```

Representative test anchors:

- [`IdGeneratorDemoApplicationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/test/kotlin/io/bluetape4k/examples/idgenerator/IdGeneratorDemoApplicationTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/build.gradle.kts)
- [`IdGeneratorDemoApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/IdGeneratorDemoApplication.kt)
- [`IdGeneratorConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/config/IdGeneratorConfiguration.kt)
- [`IdGeneratorProperties`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/config/IdGeneratorProperties.kt)
- [`IdGeneratorController`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/controller/IdGeneratorController.kt)
- [`IdGeneratorExceptionHandler`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/controller/IdGeneratorExceptionHandler.kt)
- [`IdGeneratorResponses`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/controller/IdGeneratorResponses.kt)
- [`IdGeneratorRegistry`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/service/IdGeneratorRegistry.kt)
- [`IdGeneratorService`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/main/kotlin/io/bluetape4k/examples/idgenerator/service/IdGeneratorService.kt)
- [`IdGeneratorDemoApplicationTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/spring-boot/idgenerator-spring-boot-demo/src/test/kotlin/io/bluetape4k/examples/idgenerator/IdGeneratorDemoApplicationTest.kt)
