---
slug: "manual/bluetape4k-exposed/1.11/modules/examples-exposed-bigquery-dry-run"
manualId: "examples-exposed-bigquery-dry-run"
id: "examples-exposed-bigquery-dry-run"
title: "BigQuery Dry-run Example"
locale: "en"
kind: "example"
gradlePath: ":examples-exposed-bigquery-dry-run"
sourceDir: "examples/exposed-bigquery-dry-run"
releaseRef: "1.11.0"
artifact: null
manual:
  id: "examples-exposed-bigquery-dry-run"
  repository: "bluetape4k-exposed"
  group: "example"
  kind: "example"
  sourceCommit: "803227f0f6aa061ddad6cb66721c565dee38f53c"
  sourcePath: "docs/manual/en/modules/examples-exposed-bigquery-dry-run.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "0b494a5fd1e083006046764757342b68a397e4c5"
  sourceDir: "examples/exposed-bigquery-dry-run"
  layer: "learn"
---


> Validate generated BigQuery work and cost-related metadata without turning the example into a production deployment recipe.

## What you learn

This example builds BigQuery SQL through `BigQueryContext.validateRawQuery` and sends the request to a mock REST client. It proves the shape of a dry-run request without cloud credentials or a billable query. It is a learning module, not a published library.

## Prerequisites

- JDK and the repository Gradle Wrapper
- No Google Cloud credential, project, dataset, Docker, or live BigQuery service

The test uses H2 only as an Exposed SQL-generation database and replaces the BigQuery REST client with an in-memory recording fake.

## Run

```bash
./gradlew :examples-exposed-bigquery-dry-run:test
```

## Expected result

The test records one REST `QueryRequest`. Its assertions prove that `dryRun=true` and the requested maximum billed bytes, labels, priority, location, and timeout are carried into the request. It also verifies the generated query text. No real query result or cloud job is created.

## Failure diagnosis

- The test cannot find the expected request: inspect the mock REST client wiring before changing SQL.
- A request option is missing: compare the `validateRawQuery` arguments with the recorded `QueryRequest`.
- Generated SQL differs: inspect the Exposed table/query definition and BigQuery translation boundary.
- A live-cloud error appears: the example was modified to leave its documented mock boundary; restore the fake or move the experiment to a separate environment-gated test.

## Next route

Read the [BigQuery adapter](/manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-bigquery/), compare it in the [database adapter matrix](/manual/bluetape4k-exposed/1.11/guides/database-adapter-matrix/), then use the [Exposed workshop](https://github.com/bluetape4k/exposed-workshop) for repository patterns.

## When to use it

Use it when adding query-cost guards or BigQuery job metadata and you want a fast contract test that needs no cloud account. Use a separate environment-gated smoke test for IAM, dataset location, quota, and live service behavior.

## Coordinates

This example publishes no library coordinate. Consumer applications should import `io.github.bluetape4k:bluetape4k-dependencies:<version>` and omit individual library versions.

## Core concepts

`BigQueryContext` uses H2 to render SQL, while the BigQuery adapter builds a REST `QueryRequest`. A dry run validates request metadata and estimated work; it is not a JDBC transaction and cannot roll back another BigQuery job.

## Quick start

Run the exact Gradle command above and open `BigQueryDryRunExampleTest`. Success means its recorded request assertions pass, not merely that Gradle starts.

## API by task

Create the H2-backed `BigQueryContext`, call `validateRawQuery`, inspect the recorded `QueryRequest`, and assert dry-run and job options. Keep live execution and result paging outside this example.

## Recommended patterns

Keep SQL-generation tests deterministic, set an explicit billed-byte ceiling and location, and test the request object directly. Add a negative test when a mandatory guard is absent.

## Integrations

The example uses `bluetape4k-exposed-bigquery`, Exposed SQL generation through H2, and a fake BigQuery REST client. It deliberately does not integrate Google authentication.

## Configuration

Keep cost-related options explicit in code: maximum billed bytes, labels, priority, location, and timeout. Production credentials and project selection belong to the application environment, not this test.

## Operations

Treat this test as a build-time request contract. In production, separately monitor BigQuery job status, estimated and billed bytes, quota errors, location mismatch, and timeout.

## Testing

Keep the mock test in the fast suite. Add an opt-in live smoke test only when real IAM and service compatibility must be proved, and do not make ordinary contributors require cloud credentials.

## Workshops and learning path

Continue with the [BigQuery adapter](/manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-bigquery/) for execution and paging, then compare analytical adapters in the [database adapter matrix](/manual/bluetape4k-exposed/1.11/guides/database-adapter-matrix/).

## Limitations

The mock proves request construction only. It does not prove IAM, project or dataset existence, regional compatibility, quota, actual byte estimates, result correctness, live paging, or production cost controls.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `1.11.0` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### BigQuery dry-run example flow

[![BigQuery dry-run example flow](/manual-assets/bluetape4k-exposed/1.11/readme-diagrams/examples-exposed-bigquery-dry-run-flow-01.png)](../../assets/readme-diagrams/examples-exposed-bigquery-dry-run-flow-01.svg)

_Release README: [`examples/exposed-bigquery-dry-run/README.md`](https://github.com/bluetape4k/bluetape4k-exposed/blob/0b494a5fd1e083006046764757342b68a397e4c5/examples/exposed-bigquery-dry-run/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Example sources](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/examples/exposed-bigquery-dry-run/README.md)
- [Gradle build](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.11.0/examples/exposed-bigquery-dry-run/build.gradle.kts)
