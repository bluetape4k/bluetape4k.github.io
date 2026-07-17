---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-examples-jpa-blazepersistence-demo"
manualId: bluetape4k-examples-jpa-blazepersistence-demo
title: "Module Examples - JPA & Blaze Persistence"
description: "This module demonstrates JPA query patterns with Blaze Persistence: Criteria Builder, Entity Views, offset pagination, keyset pagination, and count metadata."
kind: example
group: learning
manual:
  id: "bluetape4k-examples-jpa-blazepersistence-demo"
  repository: "bluetape4k-projects"
  group: "learning"
  kind: "example"
  sourceCommit: "e89bf724fd018af8c2ab4564a5c9a007fe27b46a"
  sourcePath: "docs/manual/en/modules/bluetape4k-examples-jpa-blazepersistence-demo.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "examples/jpa-blazepersistence-demo"
  layer: "learn"
---


## Problem

This module demonstrates JPA query patterns with Blaze Persistence: Criteria Builder, Entity Views, offset pagination, keyset pagination, and count metadata. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-examples-jpa-blazepersistence-demo` when the application needs the runnable entry point, required services, expected behavior, and the production pattern demonstrated. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

This example project is not published as a Maven artifact. Run it from the repository and inspect its Gradle tasks before choosing a command.

Gradle project path: `:bluetape4k-examples-jpa-blazepersistence-demo`. Source directory: `examples/jpa-blazepersistence-demo`.

## Concepts

The first source-level concepts to inspect are `BlazePersistenceConfiguration`, `MemberPage`, `MemberSearchCondition`, `Member`, `Team`, `MemberBlazeRepository`, `MemberSummaryView`, and `MemberTeamView`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

List the project tasks before running the example or benchmark:

```bash
./gradlew :bluetape4k-examples-jpa-blazepersistence-demo:tasks --all
```

Then use the command documented by the module README and keep required external services isolated.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`BlazePersistenceConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/config/BlazePersistenceConfiguration.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MemberPage`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/dto/MemberPage.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MemberSearchCondition`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/dto/MemberSearchCondition.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Member`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/model/Member.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Team`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/model/Team.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MemberBlazeRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/repository/MemberBlazeRepository.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MemberSummaryView`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/view/MemberSummaryView.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MemberTeamView`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/view/MemberTeamView.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Why Blaze Persistence**, **Example Coverage**, **Domain Model and Read Path**, **Core Usage**, **Entity View Registration**, **Dynamic Criteria Query**, **Entity View Pagination**, **Querydsl Migration Notes**, **Dependencies**, and **How to Run**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
implementation(project(":bluetape4k-hibernate"))
implementation(libs.jakarta.annotation.api)
implementation(libs.jakarta.persistence.api.v32)
implementation(libs.hibernate.core)
implementation(libs.blaze.persistence.core.api.jakarta)
runtimeOnly(libs.blaze.persistence.core.impl.jakarta)
implementation(libs.blaze.persistence.entity.view.api.jakarta)
runtimeOnly(libs.blaze.persistence.entity.view.impl.jakarta)
implementation(libs.blaze.persistence.jpa.criteria.api.jakarta)
runtimeOnly(libs.blaze.persistence.jpa.criteria.impl.jakarta)
runtimeOnly(libs.blaze.persistence.integration.hibernate7)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Run the example in an isolated environment and observe startup, dependency health, requests, and shutdown. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-examples-jpa-blazepersistence-demo:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractBlazePersistenceTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/test/kotlin/io/bluetape4k/examples/jpa/blazepersistence/AbstractBlazePersistenceTest.kt)
- [`BlazePersistenceApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/test/kotlin/io/bluetape4k/examples/jpa/blazepersistence/BlazePersistenceApplication.kt)
- [`TestEntityManager`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/test/kotlin/io/bluetape4k/examples/jpa/blazepersistence/TestEntityManager.kt)
- [`AbstractDomainTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/test/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/AbstractDomainTest.kt)
- [`MemberBlazeRepositoryTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/test/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/repository/MemberBlazeRepositoryTest.kt)
- [`InitMemberService`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/test/kotlin/io/bluetape4k/examples/jpa/blazepersistence/services/InitMemberService.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `1.11.0` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### Domain Model and Read Path diagram

[![Domain Model and Read Path diagram](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/examples-jpa-blazepersistence-demo-diagram-01.png)](../../assets/readme-diagrams/examples-jpa-blazepersistence-demo-diagram-01.svg)

_Release README: [`examples/jpa-blazepersistence-demo/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/examples/jpa-blazepersistence-demo/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/build.gradle.kts)
- [`BlazePersistenceConfiguration`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/config/BlazePersistenceConfiguration.kt)
- [`MemberPage`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/dto/MemberPage.kt)
- [`MemberSearchCondition`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/dto/MemberSearchCondition.kt)
- [`Member`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/model/Member.kt)
- [`Team`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/model/Team.kt)
- [`MemberBlazeRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/repository/MemberBlazeRepository.kt)
- [`MemberSummaryView`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/view/MemberSummaryView.kt)
- [`MemberTeamView`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/main/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/view/MemberTeamView.kt)
- [`AbstractBlazePersistenceTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/test/kotlin/io/bluetape4k/examples/jpa/blazepersistence/AbstractBlazePersistenceTest.kt)
- [`BlazePersistenceApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/test/kotlin/io/bluetape4k/examples/jpa/blazepersistence/BlazePersistenceApplication.kt)
- [`TestEntityManager`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/test/kotlin/io/bluetape4k/examples/jpa/blazepersistence/TestEntityManager.kt)
- [`AbstractDomainTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-blazepersistence-demo/src/test/kotlin/io/bluetape4k/examples/jpa/blazepersistence/domain/AbstractDomainTest.kt)
