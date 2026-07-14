---
slug: "manual/bluetape4k-aws/0.4/modules/aws-spring-boot-exposed-examples"
manualId: "aws-spring-boot-exposed-examples"
id: "aws-spring-boot-exposed-examples"
title: "Spring Boot Exposed Workshop"
locale: "en"
kind: "example"
gradlePath: ":aws-spring-boot-exposed-examples"
sourceDir: "examples/aws-spring-boot-exposed-examples"
releaseRef: "0.4.0"
artifact: null
manual:
  id: "aws-spring-boot-exposed-examples"
  repository: "bluetape4k-aws"
  group: "example-database"
  kind: "example"
  sourceCommit: "cf9f7a4ed610f85b4af440bcdabedcab55f47bd1"
  sourcePath: "docs/manual/en/modules/aws-spring-boot-exposed-examples.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "be4e6daea5654f84579955307ec56a58c8f405be"
  sourceDir: "examples/aws-spring-boot-exposed-examples"
  layer: "learn"
---


> A runnable workshop grounded in the 0.4.0 release source.

## Learning goal

Connect Spring Boot 4 MVC to an AWS-configurable Hikari/Exposed JDBC database while keeping HTTP status, transaction ownership, schema setup, and query code in separate components.

## When to use this workshop

Use it when a Spring application needs Exposed JDBC and wants database settings to be replaceable by Secrets Manager, Parameter Store, environment values, or RDS IAM.

## Project coordinates

This example is not published. Run `./gradlew :aws-spring-boot-exposed-examples:test`. Applications use the central BOM with `bluetape4k-aws-spring-boot`, `bluetape4k-aws-exposed`, Exposed JDBC, HikariCP, and a driver.

## Concepts to learn

`OrderController` owns HTTP semantics, `OrderService` owns `transaction(database)`, `OrderRepository` owns Exposed queries, and `OrderSchemaInitializer` creates the table after the auto-configured `Database` is available.

## Staged walkthrough

1. Read the table and repository mapping.
2. Follow controller calls into service-owned transactions.
3. Inspect auto-configured registry, data source, and `Database` beans.
4. Run the PostgreSQL Testcontainers test.
5. Replace direct test settings with an application configuration source without moving secret reads into repositories.

## Entry points and expected behavior

`SpringBootExposedExampleApplication` starts the service. `POST /orders` returns `201`; `GET /orders/{id}` returns one order or `404`; list accepts an optional `customerId` filter.

## Recommended exercise order

Keep one transaction per business operation and keep repositories unaware of Spring and AWS clients. Apply schema migrations before readiness rather than scattering DDL across request paths.

## Integration boundary

`AwsExposedAutoConfiguration` creates a closeable registry and exposes default `DataSource` and `Database` beans. Spring owns those resources; Exposed repositories use an already active transaction.

## Configuration checkpoints

Set JDBC URL, driver, username, password, and Hikari pool limits under `bluetape4k.aws.exposed.default-database`. Production sources may resolve these values before bean creation.

## Failure modes

Driver mismatch, bad credentials, unavailable configuration source, pool exhaustion, migration failure, and repository calls outside a transaction are the main failures.

## Operations

Monitor pool acquisition, active/idle connections, transaction errors, and query latency. Refresh expiring credentials through a deliberate pool replacement and let Spring close the registry once.

## Testing the boundary

`SpringBootExposedExampleApplicationTest` starts PostgreSQL, verifies registry/data source/database beans, and covers HTTP create, read, list, filtering, and not-found behavior on a random port.

## Next learning path

Compare the Ktor Exposed workshop for plugin-managed transactions, then continue with the bluetape4k-exposed manual for repository and transaction patterns.

## Limitations

The test does not call AWS configuration services or RDS IAM and does not prove TLS, migration tooling, credential rotation, or production pool sizing.

## Sources

- [Controller](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-spring-boot-exposed-examples/src/main/kotlin/io/bluetape4k/aws/examples/spring/exposed/OrderController.kt)
- [Transaction-owning service](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-spring-boot-exposed-examples/src/main/kotlin/io/bluetape4k/aws/examples/spring/exposed/OrderService.kt)
- [PostgreSQL integration test](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-spring-boot-exposed-examples/src/test/kotlin/io/bluetape4k/aws/examples/spring/exposed/SpringBootExposedExampleApplicationTest.kt)
