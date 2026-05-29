---
title: Introduction to the Bluetape4k Ecosystem
description: Part 1 of the Bluetape4k introduction series, mapping the ecosystem by application, domain capability, data, infrastructure, and foundation layers.
sidebar:
  order: -202605200000
blog:
  date: 2026-05-20T00:00:00+09:00
  image: /assets/bluetape4k-ecosystem-hero.png
  imageAlt: Editorial illustration of the bluetape4k backend ecosystem as connected building blocks
  cardDescription: "Part 1 of the Bluetape4k introduction series: application, domain capability, data, infrastructure, and foundation layers."
---

<figure class="bt4k-blog-hero">
  <img src="/assets/bluetape4k-ecosystem-hero.png" alt="Editorial illustration of the bluetape4k backend ecosystem as connected building blocks" loading="eager" />
  <figcaption>The ecosystem starts as a map of connected responsibilities before it becomes module-by-module detail.</figcaption>
</figure>

<p class="bt4k-post-meta">Part 1 · Ecosystem overview</p>

Bluetape4k is a Kotlin/JVM library ecosystem for backend services. It is not a single framework that tries to own the whole application. It is closer to a set of layer-specific modules that Spring Boot 4 and Ktor 3 services can adopt as needed.

This first article is a map. Detailed repository architecture, API examples, and migration paths belong in later parts of the series.

<figure class="bt4k-architecture">
  <img src="/assets/bluetape4k-layer-flow-01.png" alt="Bluetape4k ecosystem layer flow" loading="lazy" />
  <figcaption>Part 1 of the Bluetape4k introduction series: application, domain capability, data, infrastructure, and foundation layers.</figcaption>
</figure>

## Ecosystem Overview

Bluetape4k can be read as five layers. The table is intentionally compact; the sections below describe the main component groups in more detail.

<table style="width: 100%; table-layout: fixed;">
  <colgroup>
    <col style="width: 12%;" />
    <col style="width: 38%;" />
    <col style="width: 50%;" />
  </colgroup>
  <thead>
    <tr>
      <th>Layer</th>
      <th>Primary role</th>
      <th>Representative modules</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Application</td>
      <td>Service entrypoints and framework integration</td>
      <td>Spring Boot 4, Ktor 3</td>
    </tr>
    <tr>
      <td>Domain Capability</td>
      <td>Reusable business capabilities</td>
      <td>Leader, JaVers, Image, Text</td>
    </tr>
    <tr>
      <td>Data</td>
      <td>Persistence, query, cache, graph data access</td>
      <td>Exposed, R2DBC, JDBC, Hibernate, MongoDB, Cassandra, GraphDB</td>
    </tr>
    <tr>
      <td>Infrastructure</td>
      <td>Cloud, messaging, observability, resilience</td>
      <td>AWS, Kafka, NATS, Redis, Micrometer, OpenTelemetry, Resilience4j</td>
    </tr>
    <tr>
      <td>Foundation</td>
      <td>Shared Kotlin base, execution models, tests, version alignment</td>
      <td>Core, Coroutines, Virtual Threads, Testing, BOM</td>
    </tr>
  </tbody>
</table>

<figure class="bt4k-architecture">
  <img src="/assets/bluetape4k-layer-components-01.png" alt="Bluetape4k ecosystem components grouped by application, domain capability, data, infrastructure, and foundation layers" loading="lazy" />
  <figcaption>Each layer groups modules by the problem they solve, not by repository boundary.</figcaption>
</figure>

The application layer is the service boundary: Spring Boot 4 or Ktor 3. Bluetape4k fills the domain, data, infrastructure, and foundation layers underneath that boundary.

## Application Layer

### Spring Boot 4

Purpose: make Bluetape4k data, cache, infrastructure, and testing modules easy to assemble in Spring Boot services.

Modules and roles:

- `spring-boot/core`: common Spring Boot auto-configuration and base integration
- `spring-boot/r2dbc`: R2DBC and coroutine data access setup
- `spring-boot/redis`: Redis/Lettuce application cache and connection setup
- `spring-boot/mongodb`, `spring-boot/cassandra`: document and wide-column database integration
- `spring-boot/hibernate-lettuce`: Hibernate second-level cache integration with Lettuce

Representative features:

- Connect Bluetape4k modules through Spring Boot 4 auto-configuration
- Configure runtime concerns such as coroutines, R2DBC, Redis, MongoDB, and Cassandra consistently
- Reduce boilerplate configuration for library consumers

### Ktor 3

Purpose: provide lightweight coroutine-first service integration for cloud, coordination, and graph capabilities.

Modules and roles:

- `aws-ktor`: AWS SDK integration for Ktor services
- `leader-ktor`: leader election integration for Ktor applications
- `graph-ktor`: graph database integration for Ktor services
- `examples/aws-ktor-*`: S3, DynamoDB, and SQS examples
- `examples/ktor-graph-examples`: graph service composition examples

Representative features:

- Compose Ktor 3 services around suspend APIs and coroutine clients
- Attach AWS, leader election, and graph database modules at the application boundary
- Offer an adoption path for services that want a lighter runtime than Spring Boot

## Domain Capability Layer

### Leader

Purpose: prevent duplicate execution of batch jobs, schedulers, polling workers, cache warmers, and migration gates in distributed services.

Modules and roles:

- `leader-core`: leader election API and common execution model
- `leader-redis-lettuce`, `leader-redis-redisson`: Redis-backed election backends
- `leader-hazelcast`, `leader-mongodb`, `leader-zookeeper`: additional coordination backends
- `leader-exposed-jdbc`, `leader-exposed-r2dbc`: database-backed election storage
- `leader-spring-boot`, `leader-ktor`: framework integration

Representative features:

- Skip semantics through `runIfLeader()` when the current node is not elected
- Blocking, `CompletableFuture`, coroutine, and Virtual Threads execution models
- Multi-leader scenarios through `LeaderGroupElector`

### JaVers

Purpose: track domain-object changes in a model-friendly way, instead of relying only on row-level CDC.

Modules and roles:

- `javers-core`: JaVers helpers, codecs, and cache-backed repository support
- `javers-persistence-redis`: Redis Lettuce/Redisson snapshot storage
- `javers-persistence-kafka`: Kafka event-stream persistence
- `bom`: dependency alignment for JaVers modules

Representative features:

- Aggregate and domain object change history
- Redis or Kafka backed audit trail storage
- Diff, snapshot, and history lookup for DDD-style models

### Image

Purpose: provide both general JVM image processing and high-throughput libvips processing inside the same ecosystem.

Modules and roles:

- `images`: Scrimage-based pure JVM processing
- `images-vips-api`: libvips abstraction and common API
- `images-vips-java21`: Java 21 JVips/JNI backend
- `images-vips-java25`: Java 25 FFM/Panama backend
- `images-spring-boot`, `images-benchmark`: Spring Boot integration and benchmarks

Representative features:

- Resize, crop, filter, encode, and batch processing
- High-performance thumbnail and resize pipelines with libvips
- Coroutine-friendly image I/O for readers, writers, and byte encoders

### Text

Purpose: reuse Korean and Japanese tokenization, language detection, and keyword search in Kotlin services.

Modules and roles:

- `tokenizer-core`: common tokenizer request/response models and dictionary utilities
- `tokenizer-korean`: Korean normalization, POS tokenization, and phrase extraction
- `tokenizer-japanese`: Kuromoji IPAdic-based Japanese tokenization
- `lingua`: language detection
- `text-search`: Aho-Corasick search, replacement, and word filtering

Representative features:

- Korean and Japanese text analysis
- Mixed-language detection
- Forbidden-word, keyword-search, and replacement pipelines

## Data Layer

### Exposed

Purpose: provide a Kotlin DSL-oriented persistence model and cover JDBC and R2DBC with a consistent repository pattern.

Modules and roles:

- `exposed-core`: common base for Exposed extensions
- `exposed-jdbc`, `exposed-r2dbc`: JDBC/R2DBC repositories and transaction helpers
- `exposed-dao`: Exposed DAO extensions
- `exposed-cache`: cache integration base
- `exposed-jdbc-caffeine`, `exposed-jdbc-lettuce`, `exposed-jdbc-redisson`: JDBC cache backends
- `exposed-r2dbc-caffeine`, `exposed-r2dbc-lettuce`, `exposed-r2dbc-redisson`: R2DBC cache backends

Representative features:

- Type-safe SQL with Exposed DSL
- JDBC repositories and R2DBC coroutine repositories
- CTE, recursive CTE, batch, and measured query helpers
- JSON columns, encrypted columns, and database-specific extensions
- Spring Boot JDBC/R2DBC integration

### GraphDB

Purpose: reduce vendor API differences across graph databases and provide a common abstraction for graph-heavy domains.

Modules and roles:

- `graph-core`: graph model, repository abstraction, blocking API, and coroutine API
- `graph-neo4j`, `graph-memgraph`, `graph-age`, `graph-tinkerpop`, `graph-falkordb`: database adapters
- `graph-io/core`, `graph-io/csv`, `graph-io/graphml`, `graph-io/jackson2`, `graph-io/jackson3`, `graph-io/okio`: import/export and serialization
- `graph-spring-boot`, `graph-ktor`: framework integration
- `examples/*-graph-examples`: code graph, knowledge graph, fraud detection, and recommendation examples

Representative features:

- Common API for Neo4j, Memgraph, AGE, TinkerGraph, and FalkorDB
- Node/edge batch insert, merge/upsert, schema, and index management
- Transaction blocks, weighted paths, and graph algorithm operations
- Bulk I/O with CSV, NDJSON, GraphML, and OkIO streams
- Blocking and coroutine APIs

### General Data Modules

Purpose: provide supporting data-access utilities outside the Exposed and GraphDB repositories.

Modules and roles:

- `data/hibernate`: Hibernate persistence utilities
- `data/r2dbc`: R2DBC helper APIs
- `data/jdbc`: JDBC data-access utilities
- `data/mongodb`: MongoDB integration helpers
- `data/cassandra`: Cassandra integration helpers

Representative features:

- Reusable helpers for relational, document, and wide-column databases
- Integration base for Spring Boot data modules
- Shared patterns for cache, transaction, and serialization concerns

## Infrastructure Layer

### AWS

Purpose: make AWS Java SDK v2 and AWS Kotlin SDK fit Kotlin service patterns.

Modules and roles:

- `aws`: AWS Java SDK v2 helpers
- `aws-kotlin`: AWS Kotlin SDK coroutine-first helpers
- `aws-spring-boot`: Spring Boot 4 integration
- `aws-ktor`: Ktor 3 integration
- `examples/aws-*`: service-specific examples for S3, DynamoDB, SQS, and more

Representative features:

- Integration for S3, DynamoDB, SES, SNS, SQS, KMS, and CloudWatch
- Support for both Spring Boot operations and Ktor coroutine services
- Local integration testing with LocalStack/FLOCI-style environments

### Messaging

Purpose: support event-driven services and asynchronous integration.

Modules and roles:

- `infra/kafka`: Kafka integration
- `infra/kafka4`: Kafka 4 integration
- `infra/kafka-logback`: Logback to Kafka integration
- `infra/nats`: NATS integration
- `infra/pulsar`: Pulsar integration

Representative features:

- Kafka, NATS, and Pulsar client setup
- Application logging and event pipeline integration
- Reduced configuration and utility boilerplate for async integration

### Cache And Redis

Purpose: provide local cache, distributed cache, and Redis client integration with consistent patterns.

Modules and roles:

- `infra/redis`, `infra/lettuce`, `infra/redisson`: Redis clients and distributed primitives
- `cache/cache-core`: common cache abstraction
- `cache/cache-lettuce`, `cache/cache-redisson`: Redis-backed cache backends
- `cache/cache-hazelcast`: Hazelcast distributed cache backend
- `cache/hibernate-cache-lettuce`: Hibernate second-level cache integration

Representative features:

- Local/distributed cache composition
- Repository, Hibernate, and application cache integration
- Near-cache and 2-tier cache patterns

### Observability And Resilience

Purpose: connect metrics, tracing, resilience, and rate limiting to the rest of the ecosystem.

Modules and roles:

- `infra/micrometer`: Micrometer metrics integration
- `infra/opentelemetry`: OpenTelemetry tracing and telemetry integration
- `infra/resilience4j`: retry, circuit breaker, and bulkhead patterns
- `infra/bucket4j`: rate limiting
- `utils/measured`: measured execution and timing helpers

Representative features:

- Metrics for Prometheus/Grafana-style monitoring
- Telemetry hooks for tracing backends
- Retry, circuit breaker, and rate limiting around external dependencies

## Foundation Layer

### Core

Purpose: provide the shared Kotlin/JVM base used across the ecosystem.

Modules and roles:

- `bluetape4k/core`: guards, validation, extensions, and common utilities
- `bluetape4k/annotations`: API maturity and opt-in annotations
- `bluetape4k/logging`: Kotlin-friendly logging helpers
- `utils/*`: time, state, workflow, id generation, math, geo, and money utilities

Representative features:

- Common guard and helper patterns
- Kotlin-idiomatic extension APIs
- Shared types and utilities for higher-level modules

### Coroutines And Virtual Threads

Purpose: let services choose between Kotlin coroutines and Java Virtual Threads depending on runtime needs.

Modules and roles:

- `bluetape4k/coroutines`: coroutine helpers and suspend-friendly utilities
- `virtualthread/api`: common Virtual Threads abstraction
- `virtualthread/jdk21`: Java 21 support
- `virtualthread/jdk25`: Java 25 support

Representative features:

- Suspend API and coroutine execution support
- Virtual Threads for blocking SDKs and JDBC workloads
- Migration path between coroutine-first code and blocking ecosystems

### Testing

Purpose: reduce repeated test setup and make integration testing cheaper.

Modules and roles:

- `testing/assertions`: assertion helpers
- `testing/junit5`: JUnit 5 utilities
- `testing/testcontainers`: Testcontainers singleton launchers
- `testing/mock-web-server`: HTTP client test server
- `testing/mock-webflux-server`: WebFlux/WebClient test helper

Representative features:

- Less assertion and coroutine test boilerplate
- Simpler infrastructure test setup
- Consistent integration test patterns across modules

### BOM And Version Governance

Purpose: keep compatible dependency sets available even as repositories evolve independently.

Modules and roles:

- `bluetape4k-dependencies`: ecosystem-wide dependency alignment
- `bluetape4k/bom`: core repository alignment
- Repository-local BOMs: AWS, Exposed, Image, JaVers, Leader, Text, and Graph alignment

Representative features:

- Reduced version drift for Kotlin, Spring Boot, Exposed, AWS SDK, and Testcontainers
- Simpler dependency declarations for consumers
- Stable combinations across repository release cadences

## How The Layers Work Together

In a real service, Spring Boot 4 or Ktor 3 forms the application boundary. Under that boundary, teams add Foundation, Data, Infrastructure, and Domain Capability modules as needed.

<figure class="bt4k-architecture">
  <img src="/assets/bluetape4k-layer-flow-01.png" alt="Bluetape4k layer flow showing application entrypoints composing foundation, domain, data, and infrastructure modules" loading="lazy" />
  <figcaption>The flow is an adoption path, not a strict one-way dependency graph.</figcaption>
</figure>

The usual path starts with the Foundation layer: core utilities, coroutine helpers, testing support, and BOM alignment. Then the service adds Data and Infrastructure modules. Domain capabilities such as leader election, audit trails, image processing, and text processing are added when the product needs them.

The key idea is that Bluetape4k is not one large framework. It is an ecosystem of small modules that can be adopted gradually in existing Spring Boot 4 or Ktor 3 services.

The next articles will zoom into individual layers and repositories with architecture diagrams and concrete examples.
