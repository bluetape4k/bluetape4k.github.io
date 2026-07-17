---
slug: "manual/bluetape4k-aws/0.4/modules/aws-ktor-exposed-examples"
manualId: "aws-ktor-exposed-examples"
id: "aws-ktor-exposed-examples"
title: "Ktor Exposed Workshop"
locale: "en"
kind: "example"
gradlePath: ":aws-ktor-exposed-examples"
sourceDir: "examples/aws-ktor-exposed-examples"
releaseRef: "0.4.0"
artifact: null
manual:
  id: "aws-ktor-exposed-examples"
  repository: "bluetape4k-aws"
  group: "example-database"
  kind: "example"
  sourceCommit: "6b25d4663a87099fc94ced293eb7ca024420edc7"
  sourcePath: "docs/manual/en/modules/aws-ktor-exposed-examples.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "be4e6daea5654f84579955307ec56a58c8f405be"
  sourceDir: "examples/aws-ktor-exposed-examples"
  layer: "learn"
---


> A runnable workshop grounded in the 0.4.0 release source.

## Learning goal

Connect Ktor routes to Exposed JDBC without leaking blocking transactions or pool lifecycle into the HTTP layer. The workshop separates route semantics, repository queries, schema startup, and plugin-owned database resources.

## When to use this workshop

Use it when a Ktor application needs PostgreSQL through Exposed and database settings may later come from Secrets Manager, Parameter Store, or RDS IAM.

## Project coordinates

This example is not published. Run `./gradlew :aws-ktor-exposed-examples:test`. Applications use the central BOM with `bluetape4k-aws-ktor`, `bluetape4k-aws-exposed`, Exposed JDBC, HikariCP, and a JDBC driver.

## Concepts to learn

`AwsExposedPlugin` creates and closes the registry. `call.awsExposedTransaction` dispatches blocking JDBC work to the configured transaction context. `OrderRepository` assumes an active transaction and owns queries only.

## Staged walkthrough

1. Read `OrdersTable`, `OrderRepository`, and their mapping functions.
2. Follow `ExposedExampleApplication.kt` through plugin configuration and schema creation.
3. Trace create/read/list routes into `call.awsExposedTransaction`.
4. Run the PostgreSQL Testcontainers test and inspect the not-found case.

## Entry points and expected behavior

`POST /exposed/orders` creates an order and returns `201`. `GET /exposed/orders/{id}` returns one row or `404`. `GET /exposed/orders` lists rows and accepts an optional `customerId` filter.

## Recommended exercise order

Keep HTTP status decisions in routes, transaction ownership in the plugin boundary, and SQL in the repository. Add a second query only after the first path proves rollback and dispatcher behavior.

## Integration boundary

The example joins `bluetape4k-aws-exposed`, the Ktor plugin, Exposed JDBC, HikariCP, and PostgreSQL. AWS credentials are not required locally because test settings come directly from the container.

## Configuration checkpoints

Configure JDBC URL, driver, username, password, and pool size in `defaultDatabase`. Production code can resolve the same fields before plugin installation, but must not fetch secrets inside every transaction.

## Failure modes

Wrong driver or URL, an exhausted pool, schema initialization failure, blocking work on the wrong dispatcher, and repository calls outside a transaction are the primary failures. Closing the registry while requests are active can interrupt work.

## Operations

Monitor pool saturation, acquisition time, transaction failures, and query latency. Stop new requests before closing the plugin-owned registry. Rotate credentials through a planned pool refresh rather than mutating active connections.

## Testing the boundary

`ExposedExampleApplicationTest` starts PostgreSQL, supplies container JDBC settings, and verifies create, read, list, filter, and not-found behavior through Ktor test application routes.

## Next learning path

Continue with the Spring Boot Exposed workshop to compare bean-managed lifecycle, then use the bluetape4k-exposed manual for repository patterns and transaction design.

## Limitations

The local test does not exercise Secrets Manager, Parameter Store, RDS IAM, TLS, credential rotation, migrations, or production pool sizing.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `0.4.0` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### aws ktor exposed examples Architecture diagram

[![aws ktor exposed examples Architecture diagram](/manual-assets/bluetape4k-aws/0.4/readme-diagrams/examples-aws-ktor-exposed-examples-architecture-01.png)](../../assets/readme-diagrams/examples-aws-ktor-exposed-examples-architecture-01.svg)

_Release README: [`examples/aws-ktor-exposed-examples/README.md`](https://github.com/bluetape4k/bluetape4k-aws/blob/be4e6daea5654f84579955307ec56a58c8f405be/examples/aws-ktor-exposed-examples/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Application and plugin setup](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-ktor-exposed-examples/src/main/kotlin/io/bluetape4k/aws/examples/ktor/exposed/ExposedExampleApplication.kt)
- [Table and repository](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-ktor-exposed-examples/src/main/kotlin/io/bluetape4k/aws/examples/ktor/exposed/OrderDomain.kt)
- [PostgreSQL route test](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-ktor-exposed-examples/src/test/kotlin/io/bluetape4k/aws/examples/ktor/exposed/ExposedExampleApplicationTest.kt)
