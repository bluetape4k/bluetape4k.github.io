---
slug: "manual/bluetape4k-aws/0.4/modules/bluetape4k-aws-ktor/client-and-sigv4"
title: Ktor client and SigV4
description: Sign Ktor client requests correctly and diagnose canonical-request failures.
manualId: bluetape4k-aws-ktor
chapterId: client-and-sigv4
manual:
  id: "bluetape4k-aws-ktor"
  repository: "bluetape4k-aws"
  group: "framework"
  kind: "library"
  sourceCommit: "cf9f7a4ed610f85b4af440bcdabedcab55f47bd1"
  sourcePath: "docs/manual/en/modules/bluetape4k-aws-ktor/client-and-sigv4.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "be4e6daea5654f84579955307ec56a58c8f405be"
  sourceDir: "aws-ktor"
  layer: "build"
  chapterId: "client-and-sigv4"
---


`AwsSigV4Plugin` signs an outbound Ktor client request with AWS Signature Version 4. Correct signing depends on the final method, URL, headers, body, region, service, credentials, and clock.

## Install the plugin

```kotlin
val client = HttpClient(CIO) {
    install(AwsSigV4Plugin) {
        region = "ap-northeast-2"
        service = "execute-api"
        credentialsProvider = credentials
        authLocation = AwsSigV4AuthLocation.Header
    }
}
```

The credential provider is resolved for every send, allowing rotating credentials. Keep provider construction outside the request path.

## Body replayability

When payload signing is enabled, the plugin needs a replayable body to hash and send. Streaming bodies that cannot be replayed require a deliberate unsigned-payload or service-specific strategy; do not silently buffer unlimited content.

## Canonical request controls

`doubleUrlEncode`, `normalizePath`, and header versus query authentication affect the canonical request. Use service documentation and fixed test vectors before changing defaults. Presigned URLs also need bounded expiry and a stable signing clock.

## Failure diagnosis

A 403 signature mismatch is usually wrong region/service, changed path encoding, clock skew, credentials, or a body/header mutation after signing. Log the request ID and safe canonical metadata, never the secret access key or signature material.

## Deterministic testing

Inject fixed credentials, a fixed `Clock`, and a test signer or compare against known AWS test vectors. Cover repeated headers, query parameters, empty bodies, and non-ASCII paths.

## Sources

- [SigV4 client plugin](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-ktor/src/main/kotlin/io/bluetape4k/aws/ktor/client/AwsSigV4Plugin.kt)
- [SigV4 configuration](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-ktor/src/main/kotlin/io/bluetape4k/aws/ktor/client/AwsSigV4PluginConfig.kt)
- [SigV4 tests](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-ktor/src/test/kotlin/io/bluetape4k/aws/ktor/client/AwsSigV4PluginTest.kt)
