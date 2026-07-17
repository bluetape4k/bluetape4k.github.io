---
slug: "manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-dao"
manualId: "bluetape4k-exposed-dao"
id: "bluetape4k-exposed-dao"
title: "Exposed DAO Extensions"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-dao"
sourceDir: "exposed/dao"
releaseRef: "1.11.0"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-dao
manual:
  id: "bluetape4k-exposed-dao"
  repository: "bluetape4k-exposed"
  group: "foundation"
  kind: "library"
  sourceCommit: "803227f0f6aa061ddad6cb66721c565dee38f53c"
  sourcePath: "docs/manual/en/modules/bluetape4k-exposed-dao.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "0b494a5fd1e083006046764757342b68a397e4c5"
  sourceDir: "exposed/dao"
  layer: "build"
---


> Identity, string-ID, generated-ID, and audit conventions for Exposed DAO entities.

## Problem

Exposed DAO entities are transaction-bound objects. Equality, string rendering, generated-ID entity classes, and audit updates are easy to implement inconsistently. This module provides a small shared convention layer above Exposed DAO.

## When to use it

Use it when the domain persistence model intentionally uses Exposed `Entity`/`EntityClass`. Prefer record/DTO mapping through the JDBC or R2DBC repositories when values must leave the transaction boundary.

## Coordinates

`io.github.bluetape4k.exposed:bluetape4k-exposed-dao`, managed by `io.github.bluetape4k:bluetape4k-dependencies:<version>`.

## Core concepts

- `idEquals`, `idHashCode`, and entity string builders make identity handling explicit.
- `StringEntity` and generated-ID entity families pair with core ID tables.
- `AuditableEntity` sets actor fields, but `updatedAt` is guaranteed only by audited JDBC repository updates.
- A DAO entity remains attached to the active Exposed transaction.

## Quick start

```kotlin
class Customer(id: EntityID<String>) : StringEntity(id) {
    companion object : StringEntityClass<Customer>(Customers)
    var name by Customers.name
}
```

Read lazy relations and convert the entity to a detached DTO before the transaction closes.

## API by task

| Task | API |
|---|---|
| Identity equality/hash | `idEquals`, `idHashCode` |
| Diagnostic text | `toStringBuilder`, `entityToStringBuilder` |
| String IDs | `StringEntity`, `StringEntityClass` |
| Generated IDs | KSUID, ULID, Snowflake, time-based UUID entity families |
| Audit actor fields | `AuditableEntity` and typed variants |

## Recommended patterns

Keep DAO access and lazy traversal inside one caller-owned JDBC transaction. Map to immutable output values at that boundary. Avoid returning an `Entity` from a service and touching it later.

## Integrations

DAO builds on core and Exposed DAO, with JDBC available at runtime. The JDBC repository module can share the same table declarations.

## Configuration

No standalone configuration exists. Configure Exposed's database/transaction layer and bind `UserContext` where audit actor fields are needed.

## Failure modes

Detached/lazy access can fail after the transaction closes. Generic entity updates do not guarantee `updatedAt`. Identity comparison before an entity has a stable ID must be treated carefully.

## Operations

Keep transaction duration bounded and avoid logging lazy properties that trigger unexpected queries. Monitor query count when traversing relations.

## Testing

Use a real transaction and database fixture. Assert detached DTO values after mapping, audit actor behavior, and ID-family persistence across the dialects you support.

## Workshops and learning path

Read [Mapping conventions](/manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-core/mapping-conventions/), then choose the [JDBC repository path](/manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-jdbc/). Exposed DAO is not the R2DBC entity model.

## Limitations

This module does not make DAO entities detached, reactive, or safe outside a transaction. It does not own transaction creation.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `1.11.0` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### AuditableEntity UML Class Diagram

[![AuditableEntity UML Class Diagram](/manual-assets/bluetape4k-exposed/1.11/readme-diagrams/exposed-dao-diagram-01.png)](../../assets/readme-diagrams/exposed-dao-diagram-01.svg)

_Release README: [`exposed/dao/README.md`](https://github.com/bluetape4k/bluetape4k-exposed/blob/0b494a5fd1e083006046764757342b68a397e4c5/exposed/dao/README.md)_

### Generated-ID DAO Support Matrix

[![Generated-ID DAO Support Matrix](/manual-assets/bluetape4k-exposed/1.11/readme-diagrams/exposed-dao-diagram-02.png)](../../assets/readme-diagrams/exposed-dao-diagram-02.svg)

_Release README: [`exposed/dao/README.md`](https://github.com/bluetape4k/bluetape4k-exposed/blob/0b494a5fd1e083006046764757342b68a397e4c5/exposed/dao/README.md)_

### Entity Helper Pairing Map

[![Entity Helper Pairing Map](/manual-assets/bluetape4k-exposed/1.11/readme-diagrams/exposed-dao-diagram-03.png)](../../assets/readme-diagrams/exposed-dao-diagram-03.svg)

_Release README: [`exposed/dao/README.md`](https://github.com/bluetape4k/bluetape4k-exposed/blob/0b494a5fd1e083006046764757342b68a397e4c5/exposed/dao/README.md)_

### Automatic field assignment diagram

[![Automatic field assignment diagram](/manual-assets/bluetape4k-exposed/1.11/readme-diagrams/exposed-dao-sequence-01.png)](../../assets/readme-diagrams/exposed-dao-sequence-01.svg)

_Release README: [`exposed/dao/README.md`](https://github.com/bluetape4k/bluetape4k-exposed/blob/0b494a5fd1e083006046764757342b68a397e4c5/exposed/dao/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [DAO build](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/dao/build.gradle.kts)
- [Entity extensions](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/dao/src/main/kotlin/io/bluetape4k/exposed/dao/EntityExtensions.kt)
- [Auditable entity](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/exposed/dao/src/main/kotlin/io/bluetape4k/exposed/dao/auditable/AuditableEntity.kt)
