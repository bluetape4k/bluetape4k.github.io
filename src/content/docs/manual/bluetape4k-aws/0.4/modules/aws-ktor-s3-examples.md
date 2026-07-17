---
slug: "manual/bluetape4k-aws/0.4/modules/aws-ktor-s3-examples"
manualId: "aws-ktor-s3-examples"
id: "aws-ktor-s3-examples"
title: "Ktor S3 Workshop"
locale: "en"
kind: "example"
gradlePath: ":aws-ktor-s3-examples"
sourceDir: "examples/aws-ktor-s3-examples"
releaseRef: "0.4.0"
artifact: null
manual:
  id: "aws-ktor-s3-examples"
  repository: "bluetape4k-aws"
  group: "example-s3"
  kind: "example"
  sourceCommit: "6e3e90395ce89b999944c6236cd292650585e28f"
  sourcePath: "docs/manual/en/modules/aws-ktor-s3-examples.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "be4e6daea5654f84579955307ec56a58c8f405be"
  sourceDir: "examples/aws-ktor-s3-examples"
  layer: "learn"
---


> A runnable workshop grounded in the 0.4.0 release source.

## Learning goal

Use the Ktor-based SigV4 S3 client both directly and behind server routes. The workshop covers object upload/download, streaming, listing, deletion, presigning, content-type detection, configuration objects, and client-side envelope encryption.

## When to use this workshop

Use it when a Ktor service wants an HTTP-client-native S3 path or needs to understand `S3KtorClient` ownership before exposing object routes.

## Project coordinates

This example is not published. Run `./gradlew :aws-ktor-s3-examples:test`. Applications import the central BOM and `bluetape4k-aws-ktor`; the client signs Ktor HTTP requests with AWS credentials.

## Concepts to learn

`S3KtorExamples` contains copyable client scenarios. `s3KtorExampleModule` exposes them as routes. Path-style addressing is used for endpoint overrides; factory-created clients and credential providers close with `S3KtorClient`.

## Staged walkthrough

1. Run the direct put/get example inside `use`.
2. Trace upload, download, streaming, list, and delete routes.
3. Freeze the clock and inspect deterministic presigned URLs.
4. Add content detection and config objects.
5. Study the demo envelope-encryption provider, then replace it with an application-owned KMS path.

## Entry points and expected behavior

`S3KtorExamples.kt` owns direct scenarios; `S3KtorServerExamples.kt` owns routes under `/s3`. The routes return bytes or streams for objects, key lists for prefixes, text config values, presigned GET/PUT URLs, and delete results.

## Recommended exercise order

Keep bucket/key validation at the HTTP edge and S3 behavior in the client. Stream large downloads rather than buffering them, and treat move as copy followed by delete with an explicit partial-failure policy.

## Integration boundary

`S3KtorClient` uses Ktor `HttpClient` plus `AwsSigV4Plugin`. A supplied HTTP client or credentials provider remains caller-owned; factory-created resources are wrapper-owned.

## Configuration checkpoints

Local endpoints need a region, endpoint override, test credentials, and path addressing. Real AWS normally uses virtual-hosted addressing and the deployment credential chain. Presign duration and signing clock are part of the request contract.

## Failure modes

Wrong addressing style, clock skew, expired credentials, invalid bucket/key values, partial streams, and unclosed clients are common failures. The in-memory encryption key provider is intentionally unsafe for production.

## Operations

Record operation latency, status, retry count, transferred bytes, and presign failures without logging signed URLs or object payloads. Bound buffers and multipart concurrency, and close owned resources on shutdown.

## Testing the boundary

`S3KtorExamplesTest` verifies direct helpers, deterministic presigning, and encryption behavior. `S3KtorServerExamplesTest` uses a Ktor `MockEngine` with explicit S3 responses to verify route mapping without hiding HTTP requests.

## Next learning path

Continue to the Spring Boot S3 workshop for auto-configured SDK operations and Transfer Manager, then add real emulator coverage for the operations used by the application.

## Limitations

MockEngine tests do not prove S3 IAM, network behavior, multipart recovery, bucket policy, KMS integration, or production throughput.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `0.4.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### aws ktor s3 examples Architecture diagram

[![aws ktor s3 examples Architecture diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-aws/be4e6daea5654f84579955307ec56a58c8f405be/docs/images/readme-diagrams/examples-aws-ktor-s3-examples-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-aws/blob/be4e6daea5654f84579955307ec56a58c8f405be/docs/images/readme-diagrams/examples-aws-ktor-s3-examples-architecture-01.svg)

_Release README: [`examples/aws-ktor-s3-examples/README.md`](https://github.com/bluetape4k/bluetape4k-aws/blob/be4e6daea5654f84579955307ec56a58c8f405be/examples/aws-ktor-s3-examples/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Direct S3 scenarios](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-ktor-s3-examples/src/main/kotlin/io/bluetape4k/aws/examples/ktor/s3/S3KtorExamples.kt)
- [Ktor server routes](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-ktor-s3-examples/src/main/kotlin/io/bluetape4k/aws/examples/ktor/s3/S3KtorServerExamples.kt)
- [Route tests](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/examples/aws-ktor-s3-examples/src/test/kotlin/io/bluetape4k/aws/examples/ktor/s3/S3KtorServerExamplesTest.kt)
