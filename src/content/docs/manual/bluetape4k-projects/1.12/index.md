---
slug: "manual/bluetape4k-projects/1.12"
title: bluetape4k-projects Manual
description: Task-oriented manuals for every registered library, example, and benchmark module.
manual:
  id: "index"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "ffde7b8be16124b1c538bb318a7d482927f738ad"
  sourcePath: "docs/manual/en/index.md"
  minorVersion: "1.12"
  releaseRef: "1.12.1"
  releaseCommit: "7cf0b73646af05c0f8872cc4f6a16983949c4e3e"
  sourceDir: "docs/manual"
  layer: "build"
---


This manual is the detailed companion to the repository README. It follows the live Gradle project model and gives every registered module an English and Korean page with the same evidence contract.

## Core capabilities

- **Kotlin foundation:** [Core](/manual/bluetape4k-projects/1.12/modules/bluetape4k-core/), [logging](/manual/bluetape4k-projects/1.12/modules/bluetape4k-logging/), and serialization modules provide the shared types, validation, diagnostics, and wire-format building blocks used across the ecosystem.
- **Coroutines and execution models:** [Coroutines](/manual/bluetape4k-projects/1.12/modules/bluetape4k-coroutines/), virtual-thread modules, and reactive adapters make blocking, asynchronous, and suspending boundaries explicit.
- **Data access:** [JDBC](/manual/bluetape4k-projects/1.12/modules/bluetape4k-jdbc/), R2DBC, Hibernate, MongoDB, and Cassandra modules add Kotlin-friendly repositories, batching, transactions, and test support.
- **Distributed infrastructure:** [Redis](/manual/bluetape4k-projects/1.12/modules/bluetape4k-redis/), Kafka, messaging, search, caching, resilience, metrics, and tracing modules cover common service infrastructure without hiding its failure boundaries.
- **Web applications:** [Ktor core](/manual/bluetape4k-projects/1.12/modules/bluetape4k-ktor-core/), Spring Boot, HTTP client, gRPC, and OpenAPI modules connect the shared libraries to application runtimes.
- **Testing and utilities:** [Assertions](/manual/bluetape4k-projects/1.12/modules/bluetape4k-assertions/), JUnit 5, Testcontainers, mock servers, time, ID, money, workflow, and other focused utilities shorten repeatable application and test code.

## Choose a path

- **Build:** Start with [Getting started](/manual/bluetape4k-projects/1.12/getting-started/), then choose a foundation, data, infrastructure, web, or utility module.
- **Learn:** Use example manuals as runnable lessons and follow their links back to the production modules they demonstrate.
- **Apply:** Use benchmark and operations sections to evaluate constraints before adopting a pattern.

## How pages are organized

Every module page explains the problem, selection criteria, dependency coordinates, core concepts, task-oriented APIs, integration patterns, configuration, failure behavior, operations, testing, workshops, limitations, and source evidence.

See the [repository map](/manual/bluetape4k-projects/1.12/architecture/repository-map/) for the module groups and the [getting started guide](/manual/bluetape4k-projects/1.12/getting-started/) for the first dependency and code path.
