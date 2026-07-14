---
slug: "manual/bluetape4k-image/0.3/modules/ktor-image-api"
manualId: "ktor-image-api"
id: "ktor-image-api"
title: "Ktor image API workshop"
locale: "en"
kind: "example"
gradlePath: ":ktor-image-api"
sourceDir: "examples/ktor-image-api"
releaseRef: "0.3.0"
artifact: null
manual:
  id: "ktor-image-api"
  repository: "bluetape4k-image"
  group: "workshops"
  kind: "example"
  sourceCommit: "6d265160a89feeef27cc5fc562b169d517ca56d4"
  sourcePath: "docs/manual/en/modules/ktor-image-api.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "a571c30004f571fe8cfcddc29670c1404d212ec6"
  sourceDir: "examples/ktor-image-api"
  layer: "learn"
---


> Runnable example

## Problem

This local Ktor 3 application wires the repository-owned CAPTCHA and thumbnail route helpers into one runnable API. It shows the route contract, multipart boundary, JSON error defaults, and test-host integration without storage, Docker, S3, CDN, or native libvips.

## When to use it

Use it to evaluate `bluetape4k-images-ktor`, prototype a local CAPTCHA flow, or learn how a multipart upload becomes a bounded PNG thumbnail. It is not a storage-service template.

## Coordinates

The workshop is not published. Applications should choose one `bluetape4k-dependencies` version, then add `bluetape4k-images-ktor` and the Ktor modules selected by the application without pinning image-library versions individually.

## Core concepts

- `installBluetape4kKtorCore` installs shared serialization and API error conventions.
- `bluetape4kCaptchaRoutes` issues a bounded challenge and verifies one-time answers.
- `bluetape4kImageThumbnailRoutes` validates multipart input and returns PNG bytes.
- Ktor's `testApplication` exercises the same application module without opening a real port.

## Quick start

Prerequisite: JDK 21 or newer. No external service is required.

```bash
./gradlew :ktor-image-api:run
PORT=9090 ./gradlew :ktor-image-api:run
```

```bash
curl "http://localhost:8080/api/captcha?length=6"
curl -F "file=@images/src/test/resources/images/cafe.jpg;type=image/jpeg" \
  "http://localhost:8080/api/images/thumbnail?maxSide=320" -o thumbnail.png
```

## API by task

| Task | Endpoint or API | Observable result |
| --- | --- | --- |
| Readiness | `GET /ready` | `200 OK`, plain text `OK` |
| Issue CAPTCHA | `GET /api/captcha?length=6` | id, Base64 PNG, content type, expiry |
| Verify answer | `POST /api/captcha/{id}/verify` | one-time verification result |
| Create thumbnail | `POST /api/images/thumbnail?maxSide=320` | PNG bytes bounded by `maxSide` |

## Recommended patterns

Mount reusable routes under explicit application paths, keep readiness separate, bound image size at the request boundary, and return bytes directly when persistence is not part of the use case. Test both the success response and the shared error payload.

## Integrations

The application combines [`bluetape4k-images-ktor`](/manual/bluetape4k-image/0.3/modules/bluetape4k-images-ktor/), [`bluetape4k-images-captcha`](/manual/bluetape4k-image/0.3/modules/bluetape4k-images-captcha/), and [`bluetape4k-images`](/manual/bluetape4k-image/0.3/modules/bluetape4k-images/). Add storage through an application-owned service rather than making the thumbnail route imply persistence.

## Configuration

The server listens on port `8080`; `PORT` overrides it. The release source mounts CAPTCHA at `/api/captcha` and image routes at `/api/images`.

## Failure modes

- Wrong or missing multipart field: use the field name `file`; the route returns `400 bad_request`.
- Unsupported input or invalid `maxSide`: inspect the JSON error message before debugging image decoding.
- CAPTCHA verification fails: distinguish an incorrect answer from an expired or already-consumed challenge.
- Port conflict: set `PORT` to another local port.

## Operations

The challenge store is process-local and the thumbnail response is not retained. A restart discards challenge state. Production deployments must decide persistence, rate limiting, abuse controls, maximum request size, and public delivery separately.

## Testing

```bash
./gradlew :ktor-image-api:test
```

The release test verifies readiness, a decodable PNG CAPTCHA, a thumbnail whose dimensions do not exceed the requested bound, and the missing-file-field error contract.

## Workshops and learning path

1. Run [`basic-processing`](/manual/bluetape4k-image/0.3/modules/basic-processing/) to learn the underlying image operations.
2. Run this workshop and inspect both JSON and binary responses.
3. Read the Ktor, CAPTCHA, and core image module manuals linked above.
4. Continue to [`ktor-ocr-api`](/manual/bluetape4k-image/0.3/modules/ktor-ocr-api/) for a custom streamed multipart route and native-service error mapping.

## Limitations

This is intentionally local-only: no persistence, public URL, S3/CDN policy, authentication, distributed CAPTCHA state, or native acceleration is included.

## Sources

- [Release README](https://github.com/bluetape4k/bluetape4k-image/blob/0.3.0/examples/ktor-image-api/README.md)
- [Application source](https://github.com/bluetape4k/bluetape4k-image/blob/0.3.0/examples/ktor-image-api/src/main/kotlin/io/bluetape4k/images/examples/ktor/KtorImageApiApplication.kt)
- [Route tests](https://github.com/bluetape4k/bluetape4k-image/blob/0.3.0/examples/ktor-image-api/src/test/kotlin/io/bluetape4k/images/examples/ktor/KtorImageApiApplicationTest.kt)
- [Gradle build file](https://github.com/bluetape4k/bluetape4k-image/blob/0.3.0/examples/ktor-image-api/build.gradle.kts)
