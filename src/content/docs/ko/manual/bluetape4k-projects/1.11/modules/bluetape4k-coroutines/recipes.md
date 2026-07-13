---
slug: "ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-coroutines/recipes"
title: 실전 레시피와 Workshop
description: Ownership, failure policy, ordering, capacity를 완전한 실행 시나리오로 조립합니다.
manualId: bluetape4k-coroutines
chapterId: recipes
manual:
  id: "bluetape4k-coroutines"
  repository: "bluetape4k-projects"
  group: "foundation"
  kind: "library"
  sourceCommit: "4a375c338033b1f99b4bce6bcc9c62617d820087"
  sourcePath: "docs/manual/ko/modules/bluetape4k-coroutines/recipes.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "bluetape4k/coroutines"
  layer: "build"
  chapterId: "recipes"
---


이 장은 API 목록이 아니라 앞 장의 계약을 한 시나리오 안에서 닫는 방법을 보여줍니다. 각 recipe는 owner, child policy, ordering, capacity, cleanup을 함께 명시합니다.

## Recipe 1: request 안에서 병렬 조회

```kotlin
suspend fun dashboard(userId: String): Dashboard = coroutineScope {
    val profile = async { profileClient.load(userId) }
    val alerts = async { alertClient.load(userId) }
    Dashboard(profile.await(), alerts.await())
}
```

- owner: request caller
- failure: 둘 다 필요한 atomic result, 기본 fail-fast
- cleanup: caller cancellation이 두 child에 전파
- 관측: 두 dependency latency와 전체 request latency

별도 `DefaultCoroutineScope`로 child를 탈출시키지 않습니다.

## Recipe 2: fastest completion과 first success

```kotlin
suspend fun fastestCache(key: String): Value = coroutineScope {
    listOf(
        async { localCache.get(key) },
        async { regionalCache.get(key) },
    ).awaitAnyAndCancelOthers()
}

suspend fun firstAvailable(key: String): Value = firstSuccessTaskScope {
    fork { primary.get(key) }
    fork { fallback.get(key) }
    join().result { cause -> ValueUnavailable(key, cause) }
}
```

첫 함수는 빠른 failure도 winner입니다. 두 번째는 failure를 건너뛰고 성공을 기다립니다. Side effect에 적용한다면 idempotency가 선행 조건입니다.

## Recipe 3: ordered response와 throughput-first work

```kotlin
val response = ids.asFlow()
    .async(Dispatchers.IO) { catalog.load(it) }
    .toList() // input order

events.asFlow()
    .mapParallel(parallelism = databasePoolSize / 2) { repository.store(it) }
    .collect() // completion order may differ
```

Public response ordering과 background work capacity를 같은 operator로 해결하지 않습니다.

## Recipe 4: callback bridge

```kotlin
coroutineScope {
    val subject = PublishSubject<Event>()
    val collector = launch { subject.collect(handler) }
    subject.awaitCollector()

    val registration = source.register(
        onEvent = { event -> launch { subject.emit(event) } },
        onError = { error -> launch { subject.emitError(error) } },
    )
    try {
        collector.join()
    } finally {
        registration.close()
        collector.cancelAndJoin()
    }
}
```

Callback thread, suspending emission, registration cleanup의 owner를 실제 adapter에 맞게 조정합니다. 예제의 핵심은 collector registration을 기다리고 source registration을 `finally`에서 닫는 것입니다.

## Workshop 실행 지도

| 학습 목표 | Workshop | 이 매뉴얼의 장 |
| --- | --- | --- |
| Flow 병렬 enrichment | [`kotlin/flow-extensions-parallel-enrichment`](https://github.com/bluetape4k/bluetape4k-workshop/tree/develop/kotlin/flow-extensions-parallel-enrichment) | [Flow](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-coroutines/flow/) |
| race와 fallback 차이 | [`kotlin/flow-extensions-race-fallback`](https://github.com/bluetape4k/bluetape4k-workshop/tree/develop/kotlin/flow-extensions-race-fallback) | [Deferred](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-coroutines/deferred/) |
| Subject delivery 비교 | [`kotlin/flow-extensions-subject-bridge`](https://github.com/bluetape4k/bluetape4k-workshop/tree/develop/kotlin/flow-extensions-subject-bridge) | [Subjects](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-coroutines/subjects/) |
| Web request lifecycle | [`spring-boot/webflux-coroutines`](https://github.com/bluetape4k/bluetape4k-workshop/tree/develop/spring-boot/webflux-coroutines) | [Lifecycle](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-coroutines/lifecycle/) |
| trace/metric propagation | [`observability/micrometer-tracing-coroutines`](https://github.com/bluetape4k/bluetape4k-workshop/tree/develop/observability/micrometer-tracing-coroutines) | [Operations](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-coroutines/operations/) |

Workshop은 source of truth가 아니라 실행 가능한 companion입니다. API와 lifecycle 계약은 이 매뉴얼 및 현재 library source를 기준으로 하고, workshop은 그 계약을 바꿔가며 관찰하는 장소입니다.

## 실습 순서

1. 정상 경로를 실행하고 output order를 기록합니다.
2. 가장 빠른 branch를 failure로 바꿉니다.
3. collector/caller를 중간에 취소합니다.
4. parallelism과 buffer를 downstream capacity보다 크게 설정해 pressure를 관찰합니다.
5. shutdown 뒤 job/thread가 0으로 수렴하는지 확인합니다.

모듈 전체 선택 지도로 돌아가려면 [Coroutine과 Flow 확장](/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-coroutines/)을 봅니다.
