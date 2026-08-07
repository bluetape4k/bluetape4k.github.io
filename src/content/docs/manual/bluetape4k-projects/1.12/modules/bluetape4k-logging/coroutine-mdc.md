---
slug: "manual/bluetape4k-projects/1.12/modules/bluetape4k-logging/coroutine-mdc"
title: Coroutine MDC propagation
description: Carry correlation context across suspension and dispatcher switches with MDCContext.
manualId: bluetape4k-logging
chapterId: coroutine-mdc
manual:
  id: "bluetape4k-logging"
  repository: "bluetape4k-projects"
  group: "foundation"
  kind: "library"
  sourceCommit: "ffde7b8be16124b1c538bb318a7d482927f738ad"
  sourcePath: "docs/manual/en/modules/bluetape4k-logging/coroutine-mdc.md"
  minorVersion: "1.12"
  releaseRef: "1.12.1"
  releaseCommit: "7cf0b73646af05c0f8872cc4f6a16983949c4e3e"
  sourceDir: "bluetape4k/logging"
  layer: "build"
  learningOrder: 130
  chapterId: "coroutine-mdc"
  chapterOrder: 4
---


Plain MDC cannot follow a coroutine to another thread because its state is thread-local. `withCoroutineLoggingContext` combines scoped MDC with `MDCContext` from `kotlinx-coroutines-slf4j`.

## A complete boundary

```kotlin
suspend fun handle(requestId: String) =
    withCoroutineLoggingContext(
        "requestId" to requestId,
        "component" to "checkout",
    ) {
        coroutineScope {
            val stock = async(Dispatchers.IO) { inventory.load() }
            val price = async(Dispatchers.Default) { pricing.load() }
            log.info { "Composing checkout" }
            stock.await() to price.await()
        }
    }
```

The helper runs the block inside `withContext(MDCContext())`. Child coroutines inherit their parent context, so the snapshot crosses dispatcher switches.

## The snapshot rule

`MDCContext` captures MDC when the context is created. A plain `MDC.put` inside the block is not automatically recaptured for later suspensions. Use a new helper scope or `MDCContext` boundary when a new value must propagate.

## Restoration policy

`restorePrevious=true` uses the same nested restoration contract as the synchronous helper. With `false`, the helper also removes the applied non-null keys in an outer `finally` so caller-thread residue is cleared.

## Decision table

| Code shape | Choice |
| --- | --- |
| Synchronous block without suspension | `withLoggingContext` |
| suspend, async, or dispatcher switch | `withCoroutineLoggingContext` |
| Framework already owns trace MDC | avoid duplicate ownership and verify its lifecycle |

## Source and tests

- [`MdcSupportCoroutines.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/bluetape4k/logging/src/main/kotlin/io/bluetape4k/logging/coroutines/MdcSupportCoroutines.kt)
- [`MdcSupportCoroutinesTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/bluetape4k/logging/src/test/kotlin/io/bluetape4k/logging/coroutines/MdcSupportCoroutinesTest.kt)

Before asynchronous emission, inspect the additional lifecycle in [Async channel](/manual/bluetape4k-projects/1.12/modules/bluetape4k-logging/async-channel/).
