---
slug: "manual/bluetape4k-image/0.3/native/vips-api"
manualId: "vips-api"
title: "libvips Common API"
locale: "en"
releaseRef: "0.3.0"
manual:
  id: "native/vips-api"
  repository: "bluetape4k-image"
  group: "overview"
  kind: "guide"
  sourceCommit: "4f32b77dff190acb79534b67b34f9056843ebeeb"
  sourcePath: "docs/manual/en/native/vips-api.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "a571c30004f571fe8cfcddc29670c1404d212ec6"
  sourceDir: "docs/manual"
  layer: "build"
---


<code>bluetape4k-images-vips-api</code> separates image-processing contracts from the Java 21 JVips and Java 25 FFM bindings. Compile application code against <code>VipsImage</code> and <code>VipsRuntime</code>, then select one implementation at runtime.

## Core contracts

<code>VipsRuntime</code> initializes the native library and loads images. <code>VipsImage</code> exposes dimensions, resize, thumbnail, crop, encode, and close. Format and writer option types keep binding classes out of the public application boundary. Okio support writes encoded output to sinks.

Every image is closeable. Operations that return a <code>VipsImage</code> transfer ownership of a new native object to the caller. See [native resource lifecycle](/manual/bluetape4k-image/0.3/guides/native-resource-lifecycle/).

## Binding-neutral application design

Keep backend selection in composition code:

- business code accepts the common runtime or a smaller application adapter;
- startup initializes exactly one backend;
- processing code closes source and derived images;
- shutdown runs after requests and workers stop.

Do not expose JVips or FFM binding types from public services unless the application intentionally depends on one backend.

## Security boundary

Validate path roots, encoded input size, output options, and allowed formats before calling the native implementation. Native code does not remove the need for application limits. Error messages returned to clients should not expose filesystem paths or native loader details.

## Sources

- [VipsImage](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/images-vips-api/src/main/kotlin/io/bluetape4k/images/vips/VipsImage.kt)
- [VipsRuntime](https://github.com/bluetape4k/bluetape4k-image/blob/a571c30004f571fe8cfcddc29670c1404d212ec6/images-vips-api/src/main/kotlin/io/bluetape4k/images/vips/VipsRuntime.kt)
