---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-annotations/implementation-spi"
title: Implementation-sensitive SPI
description: Permit stable calls while requiring opt-in only for third-party implementations and subclasses.
manualId: bluetape4k-annotations
chapterId: implementation-spi
manual:
  id: "bluetape4k-annotations"
  repository: "bluetape4k-projects"
  group: "foundation"
  kind: "library"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-annotations/implementation-spi.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "bluetape4k/annotations"
  layer: "build"
  learningOrder: 120
  chapterId: "implementation-spi"
  chapterOrder: 3
---


A public interface permits both calls and third-party implementations. Its call surface may be stable while method combinations, lifecycle rules, or future abstract members are not. Use `BluetapeImplementationApi` with `@SubclassOptInRequired` for that boundary.

## Provider declaration

```kotlin
import io.bluetape4k.annotations.BluetapeImplementationApi
import kotlin.SubclassOptInRequired

@SubclassOptInRequired(BluetapeImplementationApi::class)
interface StorageProvider {
    fun load(key: String): ByteArray?
}
```

Code may accept this interface and call `load` without opting in. A third-party implementation or subclass receives the warning.

## Consumer implementation

```kotlin
@OptIn(BluetapeImplementationApi::class)
class FileStorageProvider : StorageProvider {
    override fun load(key: String): ByteArray? = TODO()
}
```

The opt-in means the implementation owner will revisit the contract during upgrades. It is not merely a warning suppression.

## How it differs from ordinary markers

`BluetapeImplementationApi` targets classes and annotation classes only. It is not a general function or property marker. Apply it to an SPI type through `@SubclassOptInRequired(BluetapeImplementationApi::class)`.

If ordinary calls are also unstable, use `BluetapeExperimentalApi` or `BluetapeBetaApi`. Choose `Implementation` only when calls are stable and implementation is the restricted boundary.

## What SPI documentation must state

- Why external implementation is not stable yet
- Lifecycle and thread-safety obligations
- Whether new abstract members may appear
- Supported and unsupported implementation strategies
- The criteria for stabilizing the implementation contract

The marker exposes a compiler boundary; it does not explain the implementation contract. Keep these details in the type KDoc.

## Removing the restriction

Remove it after third-party implementations can remain compatible across expected minor releases and policies for new abstract members and lifecycle changes are settled.

## Sources

- [`BluetapeImplementationApi` source and KDoc](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/annotations/src/main/kotlin/io/bluetape4k/annotations/BluetapeImplementationApi.kt)
- [Local implementation compilation test](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/bluetape4k/annotations/src/test/kotlin/io/bluetape4k/annotations/BluetapeApiMarkersTest.kt)
