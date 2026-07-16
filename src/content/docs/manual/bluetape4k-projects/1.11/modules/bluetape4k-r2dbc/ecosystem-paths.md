---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-r2dbc/ecosystem-paths"
title: R2DBC ecosystem path
description: Progress from direct Spring R2DBC through bluetape4k helpers and Spring coroutine extensions to Exposed R2DBC and its workshop.
manualId: bluetape4k-r2dbc
chapterId: ecosystem-paths
manual:
  id: "bluetape4k-r2dbc"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "e1463bff0f864add7c54b7188f492cfe36336cdd"
  sourcePath: "docs/manual/en/modules/bluetape4k-r2dbc/ecosystem-paths.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "data/r2dbc"
  layer: "build"
  chapterId: "ecosystem-paths"
---


## Add one level at a time

Start by understanding connection and transaction boundaries, then add helpers, coroutine CRUD, or a table DSL only when repeated problems justify them.

| Level | Choice | What it teaches and solves |
| --- | --- | --- |
| 1 | Spring `DatabaseClient` | Publisher execution, parameter binding, driver failures, and transaction context |
| 2 | `bluetape4k-r2dbc` | Kotlin mapping, CRUD helpers, pool DSL, suspend transactions, and dynamic queries |
| 3 | [`bluetape4k-spring-boot-r2dbc`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-r2dbc/) | Coroutine CRUD and Flow repository patterns for `R2dbcEntityOperations` |
| 4 | [bluetape4k-exposed](https://github.com/bluetape4k/bluetape4k-exposed) | Exposed table/column DSL, coroutine repositories, caches, and Spring/Ktor integration |
| 5 | [Exposed R2DBC Workshop](https://github.com/bluetape4k/exposed-r2dbc-workshop) | DDL/DML, transactions, WebFlux, multi-tenancy, routing, and production integration |

Higher levels do not erase the lower ones. They still run on an R2DBC driver, connection factory, and transaction boundary, so lower-level knowledge remains part of diagnosis.

## Spring coroutine extensions or Exposed

Choose `bluetape4k-spring-boot-r2dbc` when the application keeps Spring Data entity operations but wants consistent suspend and Flow APIs for find, select, insert, update, delete, and count.

Consider Exposed R2DBC when table and column names repeat across queries, joins and dynamic predicates need a Kotlin DSL, repository rules and cache decorators should be shared, or Spring WebFlux and Ktor should use the same coroutine-native persistence model. Add only the required Exposed modules and align them through the central `bluetape4k-dependencies` BOM.

## JDBC comparison

[`bluetape4k-jdbc`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-jdbc/) remains appropriate for blocking services, batch work, existing JDBC tooling, and small vendor-SQL adapters. Choose R2DBC for a supported non-blocking driver and execution model, not merely because the caller uses coroutine syntax.

| Question | JDBC signal | R2DBC signal |
| --- | --- | --- |
| Existing assets | JDBC drivers and tooling | Verified R2DBC driver and framework support |
| Call model | Blocking service or batch | WebFlux/Ktor coroutines with high concurrent I/O |
| Persistence layer | JDBC/JPA ecosystem | Spring R2DBC or Exposed R2DBC |
| Operational focus | Threads and connection pool | Connection pool, publisher cancellation, pending acquire |

## Workshop progression

The Exposed R2DBC Workshop proceeds through SQL DSL basics, connections and DDL, DML and transactions, coroutines and Flow, Spring repositories, multi-tenancy and routing, and production integration. Run the chapter tests with H2 first, then expand to PostgreSQL and MySQL Testcontainers paths.

## Related modules and repositories

- [`bluetape4k-coroutines`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-coroutines/)
- [`bluetape4k-spring-boot-r2dbc`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-spring-boot-r2dbc/)
- [`bluetape4k-testcontainers`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-testcontainers/)
- [`bluetape4k-jdbc`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-jdbc/)
- [bluetape4k-exposed](https://github.com/bluetape4k/bluetape4k-exposed)
- [Exposed R2DBC Workshop](https://github.com/bluetape4k/exposed-r2dbc-workshop)
- [bluetape4k ecosystem atlas](https://bluetape4k.github.io/ecosystem/atlas/)
