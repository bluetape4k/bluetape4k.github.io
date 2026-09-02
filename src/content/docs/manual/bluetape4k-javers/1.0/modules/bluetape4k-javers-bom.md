---
slug: "manual/bluetape4k-javers/1.0/modules/bluetape4k-javers-bom"
title: "Javers BOM"
manual:
  id: "bluetape4k-javers-bom"
  repository: "bluetape4k-javers"
  group: "foundation"
  kind: "library"
  sourceCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourcePath: "docs/manual/bluetape4k-javers/en/modules/bluetape4k-javers-bom.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourceDir: "bom"
  layer: "build"
---


`bluetape4k-javers-bom` aligns the six published library artifacts from this repository. Most applications should import one `bluetape4k-dependencies` ecosystem version instead; use this narrower BOM only when the application deliberately manages compatibility with the rest of bluetape4k.

## Released dependency structure

This diagram is loaded directly from the immutable `1.0.0` release commit and shows the BOM structure documented here. Select the preview to open the SVG at the same release commit.

[![bluetape4k-javers 1.0.0 BOM structure](https://raw.githubusercontent.com/bluetape4k/bluetape4k-javers/6648b73333cb665ecba0340588dbc3556c308a52/docs/images/readme-diagrams/bom-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/docs/images/readme-diagrams/bom-architecture-01.svg)

## Coordinate and selection

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k.javers:bluetape4k-javers-bom:1.0.0"))
    implementation("io.github.bluetape4k.javers:javers-core")
    implementation("io.github.bluetape4k.javers:javers-exposed")
}
```

Choose the BOM when a standalone build consumes two or more Javers modules and cannot import `io.github.bluetape4k:bluetape4k-dependencies`. The platform contains dependency constraints, not runtime code. Its release build derives constraints from every subproject except the BOM itself; the exact rule is pinned in [`bom/build.gradle.kts`](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/bom/build.gradle.kts).

## What it aligns

The published modules aligned by the BOM are `javers-core`, `javers-ddd`, `javers-exposed`, `javers-persistence-kafka`, `javers-persistence-redis`, and `javers-spring-boot4-autoconfigure`.

<!-- BOM_PUBLISHED_MODULES:START -->
`javers-core`, `javers-ddd`, `javers-exposed`, `javers-persistence-kafka`, `javers-persistence-redis`, `javers-spring-boot4-autoconfigure`
<!-- BOM_PUBLISHED_MODULES:END -->

The BOM builder excludes every project under `examples/**` and `benchmark/**`; those projects are runnable or measurement sources, not published dependency coordinates. The BOM does not select a persistence adapter or add optional Lettuce, Redisson, Spring Kafka, or NATS runtime dependencies.

The repository BOM also does not coordinate other bluetape4k repositories. If the service combines Projects, Exposed, Javers, Redis, and Kafka integrations, prefer the ecosystem platform shown in [getting started](/manual/bluetape4k-javers/1.0/getting-started/).

## Failure and operations contract

A platform import can prevent accidental module-version drift, but it cannot prove that a manually selected Exposed, Kafka, Redis, or bluetape4k version is compatible. Dependency locking and build scans should confirm the resolved graph. Upgrade the BOM as one change, run every selected module's integration tests, and inspect optional-client resolution before deployment.

## Testing

```bash
./gradlew :bluetape4k-javers-bom:generatePomFileForBluetapeJaversPublication
ruby scripts/publication/bom_contract.rb \
  bom/build/publications/BluetapeJavers/pom-default.xml \
  docs/manual/en/modules/bluetape4k-javers-bom.md \
  docs/manual/ko/modules/bluetape4k-javers-bom.md
./gradlew :javers-core:test :javers-exposed:test
```

Add the Redis or Kafka module test only when that adapter is part of the application. The [testing guide](/manual/bluetape4k-javers/1.0/guides/testing/) describes the storage-specific checks.

## Non-goals

- It is not a replacement for `bluetape4k-dependencies`.
- It does not add libraries to a configuration by itself.
- It does not make Exposed, Redis, and Kafka interchangeable.
- It does not provide schema migration, topic creation, or Redis policy.

Continue with the [repository map](/manual/bluetape4k-javers/1.0/architecture/repository-map/) before choosing modules.
