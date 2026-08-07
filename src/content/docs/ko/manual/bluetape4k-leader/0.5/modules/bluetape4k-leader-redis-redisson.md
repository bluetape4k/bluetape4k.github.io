---
slug: "ko/manual/bluetape4k-leader/0.5/modules/bluetape4k-leader-redis-redisson"
manualId: "bluetape4k-leader-redis-redisson"
id: "bluetape4k-leader-redis-redisson"
title: "Redis Redisson 백엔드"
locale: "ko"
kind: "library"
gradlePath: ":bluetape4k-leader-redis-redisson"
sourceDir: "leader-redis-redisson"
releaseRef: "0.5.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-redis-redisson
manual:
  id: "bluetape4k-leader-redis-redisson"
  repository: "bluetape4k-leader"
  group: "backends"
  kind: "library"
  sourceCommit: "5a4837e374df53c5a2c272b7a1d883f07abda6ae"
  sourcePath: "docs/manual/ko/modules/bluetape4k-leader-redis-redisson.md"
  minorVersion: "0.5"
  releaseRef: "0.5.0"
  releaseCommit: "721a9a3808f67489d2bdb8177734325981c24977"
  sourceDir: "leader-redis-redisson"
  layer: "build"
---


> 라이브러리 모듈

## 제공하는 기능

Redisson lock/semaphore로 단일·그룹·전략 선출을 구현하며 블로킹과 코루틴 API를 제공합니다.

## 사용하기 좋은 경우

이미 Redisson을 Redis client로 쓰고 직접 Lua script보다 distributed-object API를 선호할 때 선택합니다.

## 의존성 좌표

Maven 좌표: `io.github.bluetape4k.leader:bluetape4k-leader-redis-redisson`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-redis-redisson")
}
```

## 핵심 개념

acquire할 때 항상 명시적인 `leaseTime`을 넘기므로 Redisson native watchdog은 꺼집니다. 자동 연장을 켜면 Core의 `LeaderLeaseAutoExtender`만 동작합니다.

## 빠르게 시작하기

```kotlin
val elector = RedissonLeaderElector(redissonClient)
elector.runIfLeader("webhook-poller") { pollWebhooks() }
```

## 작업별 API

blocking/suspend 단일·group·전략 elector와 factory를 사용합니다. 그룹 선출은 semaphore 방식 permit에 대응합니다.

## 권장 패턴

호출자 소유 client 하나, 안정적인 lock name, 명시적인 lease 크기, 멱등 본문을 사용하세요. Shared `autoExtend` 사용 여부도 의도적으로 정합니다.

## 연동

Spring factory는 `RedissonClient`를 사용합니다. redisson-watchdog 예제에서 native watchdog과 라이브러리 extender의 차이를 설명합니다.

## 설정

wait/lease/minimum lease, auto-extension, group size와 Redis topology, client timeout, retry, codec을 각각 설정합니다.

## 실패 유형과 해결 방법

경쟁은 `null`입니다. Interrupt, Redis/client 장애, 소유권 상실, extend/release 오류는 백엔드 분류에 따라 예외로 드러납니다.

## 운영

Redis 지연, connection 상태, lock TTL, permit 사용량, extension 실패, skip 비율, failover를 관측하세요. Native watchdog이 갱신했다고 가정하면 안 됩니다.

## 테스트

두 client, 명시적 lease 만료, shared extender, owner-safe release, group permit, 전략 registry, failover, suspend 취소를 검증합니다.

## 학습 경로와 예제

운영 적용 전에 redisson-watchdog를 실행하고 rate-limiter와 strategic-election 예제로 이어가세요.

## 제약 사항

명시적 lease는 긴 pause 중 만료될 수 있습니다. Redisson 소유권도 다른 저장소의 쓰기를 fence하지 못합니다.

<!-- release-readme-diagrams:start -->
## 배포본 다이어그램

아래 그림은 `0.5.0` 배포본의 README 자산을 해당 배포 커밋에서 직접 불러옵니다. 이후 SNAPSHOT이 아니라 이 매뉴얼 버전의 구조와 실행 흐름을 보여 줍니다. 미리보기를 누르면 같은 배포 커밋의 SVG 원본이 열립니다.

### leader redis redisson 클래스 구조도

[![leader redis redisson 클래스 구조도](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-redis-redisson-class-01.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-redis-redisson-class-01.svg)

_배포본 README: [`leader-redis-redisson/README.ko.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/leader-redis-redisson/README.ko.md)_

### 1 — acquire/release crash recovery 다이어그램

[![1 — acquire/release crash recovery 다이어그램](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-redis-redisson-sequence-02.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-redis-redisson-sequence-02.svg)

_배포본 README: [`leader-redis-redisson/README.ko.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/leader-redis-redisson/README.ko.md)_

### 2 — updateLeaseTime minLeaseTime 다이어그램

[![2 — updateLeaseTime minLeaseTime 다이어그램](https://raw.githubusercontent.com/bluetape4k/bluetape4k-leader/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-redis-redisson-sequence-03.png)](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/docs/images/readme-diagrams/leader-redis-redisson-sequence-03.svg)

_배포본 README: [`leader-redis-redisson/README.ko.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/721a9a3808f67489d2bdb8177734325981c24977/leader-redis-redisson/README.ko.md)_

<!-- release-readme-diagrams:end -->

## 근거 자료

[Elector](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-redis-redisson/src/main/kotlin/io/bluetape4k/leader/redisson/RedissonLeaderElector.kt) · [Shared extender delegate](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-redis-redisson/src/main/kotlin/io/bluetape4k/leader/redisson/internal/RedissonLockExtendDelegate.kt) · [안정판 안내](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-redis-redisson/README.ko.md)
