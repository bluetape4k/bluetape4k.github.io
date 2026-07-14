---
slug: "manual/bluetape4k-image/0.3/modules/bluetape4k-images-ktor"
manualId: "bluetape4k-images-ktor"
id: "bluetape4k-images-ktor"
title: "Ktor image routes"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-images-ktor"
sourceDir: "images-ktor"
releaseRef: "0.3.0"
artifact: io.github.bluetape4k.image:bluetape4k-images-ktor
manual:
  id: "bluetape4k-images-ktor"
  repository: "bluetape4k-image"
  group: "frameworks"
  kind: "library"
  sourceCommit: "6d265160a89feeef27cc5fc562b169d517ca56d4"
  sourcePath: "docs/manual/en/modules/bluetape4k-images-ktor.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "a571c30004f571fe8cfcddc29670c1404d212ec6"
  sourceDir: "images-ktor"
  layer: "build"
---


> Library module

## Problem

This module provides small Ktor route adapters for CAPTCHA issue/verification and multipart thumbnail generation. It standardizes validation and HTTP responses while leaving authentication, JSON installation, persistence, and rate limiting with the application.

## When to use it

Use it for a compact Ktor service that needs the release CAPTCHA contract or a single-image thumbnail endpoint. Compose a custom route when uploads must stream to object storage, use libvips, or participate in a larger domain workflow.

## Coordinates

Maven coordinate: `io.github.bluetape4k.image:bluetape4k-images-ktor`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.image:bluetape4k-images-ktor")
}
```

## Core concepts

`bluetape4kCaptchaRoutes` registers GET issue and POST verify endpoints backed by `CaptchaVerificationService`. `bluetape4kImageThumbnailRoutes` reads one streamed multipart part, decodes through Scrimage, resizes by maximum side, and returns encoded bytes.

## Quick start

```kotlin
install(ContentNegotiation) { json() }

routing {
    bluetape4kCaptchaRoutes()
    bluetape4kImageThumbnailRoutes(
        ImageThumbnailKtorRoutesConfig(maxInputBytes = 5L * 1024 * 1024),
    )
}
```

## API by task

- `GET /captcha?length=6`: returns id, base64 PNG, content type, and expiry.
- `POST /captcha/{id}/verify`: consumes the challenge and maps success/wrong/expired/missing to 200/400/410/404.
- `POST /images/thumbnail?maxSide=320`: reads multipart field `file` and returns PNG by default.
- Replace generators, verification stores, id factories, writers, route paths, and response content types through config objects.

## Recommended patterns

Install JSON serialization before CAPTCHA routes. Provide a distributed one-shot store and an unpredictable id factory in clustered services. Apply auth, CSRF policy, upload content validation, quotas, and rate limits at the application boundary.

## Integrations

The routes reuse `bluetape4k-ktor-core` request/error helpers, `bluetape4k-images`, and `bluetape4k-images-captcha`. They do not integrate Spring storage, S3, CDN, OCR, or libvips.

## Configuration

CAPTCHA defaults to `/captcha`. Thumbnail defaults to `/images/thumbnail`, field `file`, 10 MiB maximum input, 320 default maximum side, 2,048 hard maximum side, and PNG output. Every multipart part is released after inspection.

## Failure modes

Invalid parameters, missing/wrong multipart fields, empty uploads, and oversize uploads return the shared 400 error payload. Malformed image I/O is also mapped to 400. CAPTCHA verification uses distinct status codes; unexpected runtime failures remain server errors.

## Operations

Scrimage decode/encode runs on `Dispatchers.IO`, but the upload is buffered into a bounded byte array. Observe request size, decode latency, status counts, and CAPTCHA issue/verify ratios without logging answers or image contents.

## Testing

Use Ktor test application coverage in `CaptchaKtorRoutesTest` and `ImageThumbnailKtorRoutesTest`. Add application tests for installed JSON, authentication, distributed-store behavior, body limits, and malformed payloads.

## Workshops and learning path

Start with the route tests, run the `examples/ktor-image-api` and `examples/ktor-ocr-api` applications, then replace default in-memory/security boundaries before production.

## Limitations

The thumbnail endpoint is not a streaming transform: it buffers at most `maxInputBytes + 1` and uses Scrimage. It creates one thumbnail, stores nothing, and performs no MIME sniffing beyond image decode. CAPTCHA routes do not install JSON or abuse controls.

## Sources

- [CAPTCHA routes](https://github.com/bluetape4k/bluetape4k-image/blob/0.3.0/images-ktor/src/main/kotlin/io/bluetape4k/images/ktor/CaptchaKtorRoutes.kt)
- [Thumbnail route and limits](https://github.com/bluetape4k/bluetape4k-image/blob/0.3.0/images-ktor/src/main/kotlin/io/bluetape4k/images/ktor/ImageThumbnailKtorRoutes.kt)
- [Release build](https://github.com/bluetape4k/bluetape4k-image/blob/0.3.0/images-ktor/build.gradle.kts)
