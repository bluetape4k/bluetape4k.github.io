---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate/ecosystem-paths"
title: Choosing the surrounding persistence stack
description: Choose JDBC, Hibernate, Exposed, or a reactive runtime by data model and execution constraints.
manualId: bluetape4k-hibernate
chapterId: ecosystem-paths
manual:
  id: "bluetape4k-hibernate"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "03115e34f03bad535921d3cad5cd23a2e7814581"
  sourcePath: "docs/manual/en/modules/bluetape4k-hibernate/ecosystem-paths.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "data/hibernate"
  layer: "build"
  chapterId: "ecosystem-paths"
---


## Confirm that the problem needs an ORM

Hibernate fits aggregate lifecycle, dirty checking, lazy associations, JPA annotations, and Spring Data JPA. A small SQL adapter or reporting query can be simpler without entity state and flush rules.

| Need | Start with | Boundary |
| --- | --- | --- |
| Direct SQL, connection, and vendor control | [bluetape4k-jdbc](/manual/bluetape4k-projects/1.11/modules/bluetape4k-jdbc/) | Explicit mapping and transactions |
| JPA lifecycle and Spring Data | `bluetape4k-hibernate` | ORM aggregate model |
| Kotlin table and SQL DSL | [bluetape4k-exposed](https://github.com/bluetape4k/bluetape4k-exposed) | SQL-oriented JDBC or R2DBC runtime |
| Non-blocking persistence | [bluetape4k-hibernate-reactive](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate-reactive/), [bluetape4k-r2dbc](/manual/bluetape4k-projects/1.11/modules/bluetape4k-r2dbc/) | Do not wrap blocking Session calls in coroutines |

Hibernate and JDBC can coexist, but one transaction owner must provide the connection when they share a transaction. Do not leak Hibernate entities, Exposed rows, and JDBC DTOs across the same persistence boundary.

Hibernate is natural when aggregate changes are persisted by dirty checking. Exposed is often simpler when SQL shape stays explicit and rows map directly to DTOs. Existing JPA mappings, Spring Data repositories, and operational tooling also influence the choice. Align all library versions through the `bluetape4k-dependencies` BOM.

## Executable next steps

- [JPA Querydsl demo](/manual/bluetape4k-projects/1.11/modules/bluetape4k-examples-jpa-querydsl-demo/): Spring Data repositories, dynamic queries, and DTO projections.
- [Blaze-Persistence demo](/manual/bluetape4k-projects/1.11/modules/bluetape4k-examples-jpa-blazepersistence-demo/): Entity Views, offset and keyset pagination, and count metadata.
- [`SimpleQuerydslExamples`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/test/kotlin/io/bluetape4k/hibernate/querydsl/simple/SimpleQuerydslExamples.kt): module-local Querydsl examples.
- [`mapping` tests](https://github.com/bluetape4k/bluetape4k-projects/tree/1.11.0/data/hibernate/src/test/kotlin/io/bluetape4k/hibernate/mapping): associations, inheritance, IDs, trees, and localized entities.

This chapter can later link to a central ecosystem guide for Hibernate versus Exposed, JDBC-to-R2DBC migration, and transaction-manager combinations.

## Sources and links

- [bluetape4k-exposed repository](https://github.com/bluetape4k/bluetape4k-exposed)
- [`bluetape4k-jdbc` learning path](/manual/bluetape4k-projects/1.11/modules/bluetape4k-jdbc/ecosystem-paths/)
- [`bluetape4k-hibernate-reactive`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate-reactive/)
- [`bluetape4k-r2dbc`](/manual/bluetape4k-projects/1.11/modules/bluetape4k-r2dbc/)
