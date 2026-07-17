---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-examples-jpa-querydsl-demo"
manualId: bluetape4k-examples-jpa-querydsl-demo
title: "JPA with Querydsl"
description: "A collection of examples for learning database query patterns using JPA and Querydsl."
kind: example
group: examples
learningOrder: 1430
manual:
  id: "bluetape4k-examples-jpa-querydsl-demo"
  repository: "bluetape4k-projects"
  group: "examples"
  kind: "example"
  sourceCommit: "222f640a5a8937d3000dc49b2e2f585726ed70e6"
  sourcePath: "docs/manual/en/modules/bluetape4k-examples-jpa-querydsl-demo.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "examples/jpa-querydsl-demo"
  layer: "learn"
  learningOrder: 1430
---


## Problem

A collection of examples for learning database query patterns using JPA and Querydsl. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-examples-jpa-querydsl-demo` when the application needs the runnable entry point, required services, expected behavior, and the production pattern demonstrated. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

This example project is not published as a Maven artifact. Run it from the repository and inspect its Gradle tasks before choosing a command.

Gradle project path: `:bluetape4k-examples-jpa-querydsl-demo`. Source directory: `examples/jpa-querydsl-demo`.

## Concepts

The first source-level concepts to inspect are `MemberDto`, `MemberSearchCondition`, `MemberTeamDto`, `TeamDto`, `dto-mapping`, `Member`, `Team`, and `MemberRepository`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

List the project tasks before running the example or benchmark:

```bash
./gradlew :bluetape4k-examples-jpa-querydsl-demo:tasks --all
```

Then use the command documented by the module README and keep required external services isolated.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`MemberDto`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/dto/MemberDto.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MemberSearchCondition`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/dto/MemberSearchCondition.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MemberTeamDto`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/dto/MemberTeamDto.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TeamDto`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/dto/TeamDto.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`dto-mapping`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/mapper/dto-mapping.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Member`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/model/Member.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Team`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/model/Team.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MemberRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/repository/MemberRepository.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MemberRepositoryCustom`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/repository/MemberRepositoryCustom.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`MemberRepositoryImpl`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/repository/MemberRepositoryImpl.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Examples**, **Querydsl Basics (examples/)**, **Common Query Patterns**, **Basic Queries**, **JPQL vs Querydsl**, **Projections (DTO Queries)**, **Dynamic Queries**, **Subqueries**, **Domain Model**, and **Entities (domain/model/)**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
implementation(platform(libs.spring.boot.dependencies))
implementation(project(":bluetape4k-hibernate"))
implementation(libs.jakarta.annotation.api)
implementation(libs.jakarta.persistence.api)
implementation(libs.hibernate.core)
implementation(libs.querydsl.jpa)
implementation(libs.hibernate.validator)
runtimeOnly(libs.jakarta.validation.api)
implementation("org.springframework.boot:spring-boot-starter-data-jpa")
implementation("org.springframework.boot:spring-boot-starter-validation")
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
./gradlew :bluetape4k-examples-jpa-querydsl-demo:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractQuerydslTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/test/kotlin/io/bluetape4k/examples/jpa/querydsl/AbstractQuerydslTest.kt)
- [`QuerydslApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/test/kotlin/io/bluetape4k/examples/jpa/querydsl/QuerydslApplication.kt)
- [`TestEntityManager`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/test/kotlin/io/bluetape4k/examples/jpa/querydsl/TestEntityManager.kt)
- [`AbstractDomainTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/test/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/AbstractDomainTest.kt)
- [`JpaRepositoryTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/test/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/repository/JpaRepositoryTest.kt)
- [`QuerydslExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/test/kotlin/io/bluetape4k/examples/jpa/querydsl/examples/QuerydslExamples.kt)
- [`InitMemberService`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/test/kotlin/io/bluetape4k/examples/jpa/querydsl/services/InitMemberService.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `1.11.0` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### JPA Querydsl demo structure

[![JPA Querydsl demo structure](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/examples-jpa-querydsl-demo-diagram-01.png)](../../assets/readme-diagrams/examples-jpa-querydsl-demo-diagram-01.svg)

_Release README: [`examples/jpa-querydsl-demo/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/examples/jpa-querydsl-demo/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/build.gradle.kts)
- [`MemberDto`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/dto/MemberDto.kt)
- [`MemberSearchCondition`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/dto/MemberSearchCondition.kt)
- [`MemberTeamDto`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/dto/MemberTeamDto.kt)
- [`TeamDto`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/dto/TeamDto.kt)
- [`dto-mapping`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/mapper/dto-mapping.kt)
- [`Member`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/model/Member.kt)
- [`Team`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/model/Team.kt)
- [`MemberRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/repository/MemberRepository.kt)
- [`MemberRepositoryCustom`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/repository/MemberRepositoryCustom.kt)
- [`MemberRepositoryImpl`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/main/kotlin/io/bluetape4k/examples/jpa/querydsl/domain/repository/MemberRepositoryImpl.kt)
- [`AbstractQuerydslTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/test/kotlin/io/bluetape4k/examples/jpa/querydsl/AbstractQuerydslTest.kt)
- [`QuerydslApplication`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/examples/jpa-querydsl-demo/src/test/kotlin/io/bluetape4k/examples/jpa/querydsl/QuerydslApplication.kt)
