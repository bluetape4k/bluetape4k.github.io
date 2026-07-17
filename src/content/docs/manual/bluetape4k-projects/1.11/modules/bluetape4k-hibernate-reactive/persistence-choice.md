---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate-reactive/persistence-choice"
title: Choosing a persistence technology
description: Compare conventional Hibernate/JPA, Hibernate Reactive, and R2DBC by execution and data model.
manualId: bluetape4k-hibernate-reactive
chapterId: persistence-choice
manual:
  id: "bluetape4k-hibernate-reactive"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "e89bf724fd018af8c2ab4564a5c9a007fe27b46a"
  sourcePath: "docs/manual/en/modules/bluetape4k-hibernate-reactive/persistence-choice.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "data/hibernate-reactive"
  layer: "build"
  chapterId: "persistence-choice"
---


## Selection map

| Primary requirement | Start with | Reason |
| --- | --- | --- |
| Spring JPA, blocking JDBC, conventional EntityManager | [bluetape4k-hibernate](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate/) | Uses regular Hibernate Session and the JPA ecosystem. |
| Non-blocking I/O while retaining relations and dirty checking | `bluetape4k-hibernate-reactive` | Runs Reactive ORM over the Vert.x SQL Client. |
| Direct control of SQL, row mapping, pools, and Flow | [bluetape4k-r2dbc](/manual/bluetape4k-projects/1.11/modules/bluetape4k-r2dbc/) | Builds R2DBC boundaries without an ORM persistence context. |

## Compared with conventional Hibernate

Both Hibernate modules share the entity-mapping model but differ in execution. Conventional Hibernate fits JDBC-based blocking calls, `EntityManager` and `Session` helpers, converters, and Querydsl integration. Hibernate Reactive assumes a Vert.x context, `Uni` or `CompletionStage`, and reactive Session APIs.

Although `bluetape4k-hibernate-reactive` has an API dependency on `bluetape4k-hibernate`, do not call blocking helpers inside a reactive callback. Entity models and common types may be shared; execution models may not.

## Compared with R2DBC

R2DBC makes queries and row mapping central. The code directly shows which SQL runs and which DTO receives each row, without entity graphs, cascades, or dirty checking. Hibernate Reactive is stronger when entity relations and the persistence context are the primary model.

Use these questions to choose:

- Must relation changes be expressed through a managed-entity lifecycle?
- Is the team prepared to operate lazy associations and fetch plans?
- Would direct vendor SQL and row mapping be simpler?
- Does the team already own JPA mappings or SQL/R2DBC pipelines?

## Using more than one

Different bounded contexts may choose different technologies. Within one atomic operation, however, make sure they do not open independent connections and transactions. When multiple technologies update the same table, document version columns, cache invalidation, and schema-migration ownership.

## Related source

- [Conventional Hibernate source](https://github.com/bluetape4k/bluetape4k-projects/tree/1.11.0/data/hibernate/src/main/kotlin)
- [Hibernate Reactive source](https://github.com/bluetape4k/bluetape4k-projects/tree/1.11.0/data/hibernate-reactive/src/main/kotlin)
- [R2DBC source](https://github.com/bluetape4k/bluetape4k-projects/tree/1.11.0/data/r2dbc/src/main/kotlin)
- [Choosing after JDBC](/manual/bluetape4k-projects/1.11/modules/bluetape4k-jdbc/ecosystem-paths/)
