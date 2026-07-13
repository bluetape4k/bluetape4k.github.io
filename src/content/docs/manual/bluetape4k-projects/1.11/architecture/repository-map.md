---
slug: "manual/bluetape4k-projects/1.11/architecture/repository-map"
title: Repository map
description: How the registered modules are grouped for Build, Learn, and Apply navigation.
manual:
  id: "architecture/repository-map"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "073ab365abcd91889ecd82d0077522cac2f13e15"
  sourcePath: "docs/manual/en/architecture/repository-map.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "docs/manual"
  layer: "build"
---


The manual inventory is generated from Gradle `subprojects`; directory names are navigation metadata, not a copied source of truth.

| Path | Manual group | Primary use |
| --- | --- | --- |
| `bluetape4k/` | Foundation | Core types, annotations, logging, coroutines, and BOM |
| `cache/` | Caching | Cache contracts and backends |
| `data/` | Data | JDBC, R2DBC, Hibernate, MongoDB, and Cassandra |
| `infra/` | Infrastructure | Redis, messaging, resilience, metrics, tracing, and search |
| `io/` | I/O | Codecs, serialization, HTTP, gRPC, Protobuf, and Vert.x |
| `ktor/` | Web | Ktor server foundations and testing |
| `spring-boot/` | Spring | Spring Boot integration modules and demos |
| `testing/` | Testing | Assertions, JUnit support, containers, and mock servers |
| `utils/` | Utilities | Domain and algorithmic utilities |
| `virtualthread/` | Concurrency | Virtual-thread APIs and JDK implementations |
| `examples/` | Learning | Runnable examples; not published |
| `benchmark/` | Experiments | Reproducible performance investigations; not published |
