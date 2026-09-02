---
slug: "manual/bluetape4k-javers/1.0/guides/cross-repository-paths"
title: "Cross-repository paths"
manual:
  id: "guides/cross-repository-paths"
  repository: "bluetape4k-javers"
  group: "overview"
  kind: "guide"
  sourceCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourcePath: "docs/manual/bluetape4k-javers/en/guides/cross-repository-paths.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourceDir: "docs/manual/bluetape4k-javers"
  layer: "build"
---


The JaVers manual intentionally stops where another repository owns the generic contract.

## Exposed boundary

`javers-exposed` persists JaVers CDO snapshots and commit metadata. It does not replace JDBC/R2DBC application repositories, transaction helpers, cache write modes, Ktor helpers, or Spring auto-configuration from `bluetape4k-exposed`. Use the published [Exposed manual](https://bluetape4k.github.io/manual/bluetape4k-exposed/) for those topics, especially [transaction ownership](https://bluetape4k.github.io/manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-jdbc/transaction-ownership/).

## Projects boundary

Redis clients, Kafka utilities, codecs, DDD foundations outside the JaVers workflow, and Testcontainers launchers belong to `bluetape4k-projects`. Use its [published manual](https://bluetape4k.github.io/manual/bluetape4k-projects/). This repository's release example directly uses Projects facilities in [`examples/javers-exposed-ddd/build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/examples/javers-exposed-ddd/build.gradle.kts).

## Version boundary

Consumers should import one `io.github.bluetape4k:bluetape4k-dependencies` ecosystem version. That platform coordinates Projects, Exposed, Redis, Kafka, and Javers artifacts. Do not construct a compatibility matrix inside an application build unless the ecosystem platform is unavailable.

Ktor integration, Spring Boot 4 auto-configuration, `examples/javers-ktor`, `examples/javers-spring-boot4`, and `benchmark/javers-exposed-benchmark` are after 1.0.0. Their current develop source must not be read as a 0.2 contract. The release module boundary is visible in [`settings.gradle.kts`](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/settings.gradle.kts).
