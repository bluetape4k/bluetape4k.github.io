---
slug: "manual/bluetape4k-exposed/1.12/architecture/repository-map"
manualId: "repository-map"
title: "Exposed Repository Map"
locale: "en"
releaseRef: "1.12.1"
manual:
  id: "architecture/repository-map"
  repository: "bluetape4k-exposed"
  group: "overview"
  kind: "guide"
  sourceCommit: "6bff7d9939243d166e212ce840ee90261e7239c7"
  sourcePath: "docs/manual/en/architecture/repository-map.md"
  minorVersion: "1.12"
  releaseRef: "1.12.1"
  releaseCommit: "4cc2cce07087241ec24a597d8464615434ea2b81"
  sourceDir: "docs/manual"
  layer: "build"
---


The 40 Gradle projects in `bluetape4k-exposed 1.12.1` do not all play the same role. Start from the shared foundation and choose either JDBC or R2DBC. Add caches, codecs, and database adapters only where needed, then select application integrations that match the framework's resource and transaction ownership.

![Exposed module map](/manual-assets/bluetape4k-exposed/1.12/overview/module-map.png)

## Read the repository in four layers

1. **Foundation** — `core`, `dao`, `cache`, and `bom` define shared types and module alignment.
2. **Data access** — `jdbc` and `r2dbc` implement different driver and transaction models. An application chooses one as its primary path.
3. **Optional capabilities** — Caffeine, Lettuce, and Redisson caches; JSON, Tink, and measured columns; and database adapters refine the base path.
4. **Application integrations** — Spring Boot, Ktor, Batch, and Spring Modulith connect Exposed to framework-owned resources.

A database adapter does not replace JDBC or R2DBC; it adds dialect or backend-specific behavior after the base path is selected. Caching has the same ordering constraint. Adding it before repository and transaction semantics are clear leaves stale reads and invalidation ownership undefined.

## Release scope

This map contains only modules present in tag `1.12.1`. Develop-only modules stay out until a later stable minor establishes a new manual baseline. Use the [module manual](/manual/bluetape4k-exposed/1.12/modules/bluetape4k-exposed-bom/) for the exact project inventory and source locations.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `1.12.1` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### Bluetape4k Exposed module composition diagram

[![Bluetape4k Exposed module composition diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-exposed/4cc2cce07087241ec24a597d8464615434ea2b81/docs/images/readme-diagrams/root-readme-module-relationships-01.png)](https://github.com/bluetape4k/bluetape4k-exposed/blob/4cc2cce07087241ec24a597d8464615434ea2b81/docs/images/readme-diagrams/root-readme-module-relationships-01.svg)

_Release README: [`README.md`](https://github.com/bluetape4k/bluetape4k-exposed/blob/4cc2cce07087241ec24a597d8464615434ea2b81/README.md)_

### Bluetape4k Exposed overview diagram

[![Bluetape4k Exposed overview diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-exposed/4cc2cce07087241ec24a597d8464615434ea2b81/docs/images/readme-diagrams/root-readme-overview-01.png)](https://github.com/bluetape4k/bluetape4k-exposed/blob/4cc2cce07087241ec24a597d8464615434ea2b81/docs/images/readme-diagrams/root-readme-overview-01.svg)

_Release README: [`README.md`](https://github.com/bluetape4k/bluetape4k-exposed/blob/4cc2cce07087241ec24a597d8464615434ea2b81/README.md)_

<!-- release-readme-diagrams:end -->
