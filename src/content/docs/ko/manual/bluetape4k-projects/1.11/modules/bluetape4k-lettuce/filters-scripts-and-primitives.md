---
slug: "ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/filters-scripts-and-primitives"
title: Filter, script와 분산 primitive
description: 확률 자료구조, Lua fallback과 Redis 원자 연산 wrapper를 선택합니다.
manualId: bluetape4k-lettuce
chapterId: filters-scripts-and-primitives
manual:
  id: "bluetape4k-lettuce"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "222f640a5a8937d3000dc49b2e2f585726ed70e6"
  sourcePath: "docs/manual/ko/modules/bluetape4k-lettuce/filters-scripts-and-primitives.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/lettuce"
  layer: "build"
  learningOrder: 540
  chapterId: "filters-scripts-and-primitives"
  chapterOrder: 5
---


## 확률 자료구조를 정확히 읽는다

Bloom filter의 `contains=false`는 확실한 부재지만 `true`는 false positive일 수 있습니다. Cuckoo filter는 삭제를 지원하지만 제한된 bucket에서 insert가 실패할 수 있습니다. 서로 다른 option으로 이미 만든 filter를 다시 초기화하면 예외가 납니다.

```kotlin
val filter = LettuceBloomFilter(
    connection,
    "blocked-email",
    BloomFilterOptions(expectedInsertions = 100_000, falseProbability = 0.01),
)
filter.tryInit()
filter.add("spam@example.com")
```

HyperLogLog는 정확한 set 크기가 아니라 근사 cardinality를 제공합니다. 과금이나 quota처럼 정확성이 필요한 판단에는 쓰지 않습니다.

## Lua script의 fallback

`RedisScript`는 source의 SHA1을 미리 계산합니다. `RedisScriptRunner`는 sync, async, suspend 모두 `EVALSHA`를 먼저 실행하고 Redis가 `NOSCRIPT`를 반환할 때 원문 `EVAL`로 재시도합니다. 다른 script 오류는 fallback으로 숨기지 않습니다.

AtomicLong, semaphore, lock은 Redis 명령과 Lua script를 조합합니다. lock과 permit은 `try/finally`에서 반환하고, network 분할이 있는 업무 원자성을 단순 mutex와 동일하게 보지 않습니다.

## Source와 tests

- [`RedisScript.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/script/RedisScript.kt)
- [`LettuceBloomFilter.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/filter/LettuceBloomFilter.kt)
- [`LettuceCuckooFilter.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/filter/LettuceCuckooFilter.kt)
- [`RedisScriptTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/test/kotlin/io/bluetape4k/redis/lettuce/script/RedisScriptTest.kt)

다음은 [운영과 생태계 경로](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/operations-and-ecosystem/)입니다.
