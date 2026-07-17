---
slug: "ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/commands-and-coroutines"
title: Command와 coroutine
description: sync, async, coroutine command와 RedisFuture 대기·취소 계약을 설명합니다.
manualId: bluetape4k-lettuce
chapterId: commands-and-coroutines
manual:
  id: "bluetape4k-lettuce"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "d6eb7f6e617535286959f850024052ad0ca96738"
  sourcePath: "docs/manual/ko/modules/bluetape4k-lettuce/commands-and-coroutines.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/lettuce"
  layer: "build"
  learningOrder: 540
  chapterId: "commands-and-coroutines"
  chapterOrder: 2
---


## 호출 경로를 섞지 않는다

`commands`는 호출 thread를 block하는 sync API, `asyncCommands`는 `RedisFuture`, `coroutinesCommands`는 Lettuce의 experimental coroutine API를 반환합니다. servlet blocking 경계에서는 sync가 단순할 수 있지만, coroutine service에서는 async 또는 coroutine 경로를 끝까지 유지합니다.

```kotlin
val async = LettuceClients.asyncCommands(client)
val value = async.get("account:1").awaitSuspending()

val values = listOf(async.get("a"), async.get("b")).awaitAll()
```

`awaitAll()`은 입력 순서대로 결과를 돌려주고, 빈 입력은 빈 list입니다. 하나가 실패하면 부분 결과를 만들지 않고 원래 예외를 전파합니다.

## cancellation은 fallback이 아니다

`awaitSuspending()`은 `kotlinx.coroutines.future.await`의 취소 전파 규칙을 따릅니다. loaded map의 suspend 구현도 `CancellationException`을 다시 던집니다. timeout이나 요청 취소를 Redis miss로 바꿔 DB loader를 호출하면 이미 취소된 작업이 뒤에서 계속됩니다.

## command 지원 여부

`RedisCommandSupports`는 client와 command별로 `COMMAND INFO` 결과를 cache합니다. 확인용 임시 connection은 즉시 닫습니다. 실패는 지원하지 않는 것으로 반환하므로, 권한 부족과 실제 미지원이 같은 `false`로 보일 수 있음을 운영 log에서 구분합니다.

## Source와 tests

- [`RedisFutureSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/RedisFutureSupport.kt)
- [`RedisCommandSupports.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/RedisCommandSupports.kt)
- [`RedisFutureSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/test/kotlin/io/bluetape4k/redis/lettuce/RedisFutureSupportTest.kt)

다음은 [Codec과 직렬화](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/codecs-and-serialization/)입니다.
