---
manualId: bluetape4k-pulsar
title: "bluetape4k-pulsar"
description: "Kotlin을 위한 Apache Pulsar 클라이언트 확장 — 코루틴 우선, DSL 친화적, Jackson2/Jackson3 스키마 지원."
kind: library
group: infrastructure
manual:
  id: "bluetape4k-pulsar"
  repository: "bluetape4k-projects"
  group: "infrastructure"
  kind: "library"
  sourceCommit: "dda876503926aa16302b4416e3f3a3e2bff26526"
  sourcePath: "docs/manual/ko/modules/bluetape4k-pulsar.md"
  layer: "build"
---


## 해결하는 문제

Kotlin을 위한 Apache Pulsar 클라이언트 확장 — 코루틴 우선, DSL 친화적, Jackson2/Jackson3 스키마 지원. 이 매뉴얼은 README의 기능 목록을 반복하지 않고 현재 build, source entry point, test, 설정 resource, lifecycle 근거를 연결합니다.

## 사용 시점

애플리케이션에 client lifecycle, reconnect policy, backpressure, retry, observability이 필요할 때 `bluetape4k-pulsar`를 선택합니다. 아래 source entry point에서 시작해 ownership과 failure 계약이 caller lifecycle에 맞는지 확인합니다. 표준 API나 이미 도입한 더 작은 모듈이 같은 계약을 만족한다면 그쪽을 우선합니다.

## 의존성 좌표

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-bom:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-pulsar")
}
```

Gradle project path는 `:bluetape4k-pulsar`, source directory는 `infra/pulsar`입니다.

## 핵심 개념

먼저 확인할 source 개념은 `PulsarClientSupport`, `PulsarCloseSupport`, `Jackson3Schema`, `JacksonSchema`, `ConsumerExtensions`, `ConsumerSupport`, `ProducerExtensions`, `ProducerSupport`입니다. 파일 이름은 탐색 anchor일 뿐이므로 public 계약으로 사용하기 전에 선언과 test를 함께 읽습니다.

## 빠른 시작

위 좌표를 추가하고 Gradle을 refresh한 뒤 필요한 작업을 소유한 가장 작은 entry point에서 시작합니다. 먼저 [`PulsarClientSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/PulsarClientSupport.kt)를 확인합니다. 이 파일이 모듈의 구체적인 source entry point입니다.

## 작업별 API

| Entry point | 확인할 내용 |
| --- | --- |
| [`PulsarClientSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/PulsarClientSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`PulsarCloseSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/PulsarCloseSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`Jackson3Schema`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/codec/Jackson3Schema.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`JacksonSchema`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/codec/JacksonSchema.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`ConsumerExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/consumer/ConsumerExtensions.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`ConsumerSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/consumer/ConsumerSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`ProducerExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/producer/ProducerExtensions.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`ProducerSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/producer/ProducerSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`ReaderExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/reader/ReaderExtensions.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`ReaderSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/reader/ReaderSupport.kt) | constructor, function, ownership 계약을 확인합니다. |

## 권장 패턴

README 근거는 **아키텍처**, **주요 기능**, **의존성**, **사용 예제**, **클라이언트 생명주기**, **Producer**, **Consumer**, **Reader (구독·ack 불필요)**, **커스텀 JSON 스키마**, **압축** 순서로 탐색할 수 있습니다. 이 항목으로 방향을 잡고 source와 test에서 동작을 확인합니다. 도입 범위는 좁게 유지하고 소유한 resource를 caller lifecycle에 연결합니다.

## 연동

현재 build에 선언된 integration edge는 다음과 같습니다.

```kotlin
api(project(":bluetape4k-core"))
api(project(":bluetape4k-coroutines"))
api(libs.pulsar.client)
compileOnly(project(":bluetape4k-jackson2"))
compileOnly(libs.jackson.databind)
compileOnly(project(":bluetape4k-jackson3"))
compileOnly(libs.jackson3.databind)
implementation(libs.kotlinx.coroutines.core)
```

`compileOnly` edge는 caller가 제공해야 하는 capability이므로 API를 사용하기 전에 runtime에 실제 dependency가 있는지 확인합니다.

## 설정

`src/main/resources` 아래에서 모듈 수준 설정 resource를 찾지 못했습니다. constructor, builder, function argument, 연동 framework로 설정하며 default는 source에서 확인합니다.

## 실패 동작

failure 의미는 artifact 이름이 아니라 아래 entry point와 test가 결정합니다. cancellation과 timeout signal을 보존하고 소유한 resource를 닫습니다. backend exception은 안정된 domain 계약을 추가할 수 있는 boundary에서만 변환합니다. retry나 fallback을 넣기 전에 test anchor로 실제 동작을 확인합니다.

## 운영

connection 상태, queue 깊이, retry, timeout, remote 오류, graceful shutdown을 관찰합니다. capacity, timeout, retry, shutdown 설정은 resource를 소유한 component 가까이에 둡니다. 누가 trade-off를 받아들였는지 알 수 없는 process-wide default는 피합니다.

## 테스트

모듈 test task는 다음과 같습니다.

```bash
./gradlew :bluetape4k-pulsar:test --no-configuration-cache
```

대표 test anchor는 다음과 같습니다.

- [`AbstractPulsarTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/test/kotlin/io/bluetape4k/pulsar/AbstractPulsarTest.kt)
- [`PulsarCleanupCancellationTestSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/test/kotlin/io/bluetape4k/pulsar/PulsarCleanupCancellationTestSupport.kt)
- [`PulsarClientSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/test/kotlin/io/bluetape4k/pulsar/PulsarClientSupportTest.kt)
- [`Jackson3SchemaTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/test/kotlin/io/bluetape4k/pulsar/codec/Jackson3SchemaTest.kt)
- [`JacksonSchemaTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/test/kotlin/io/bluetape4k/pulsar/codec/JacksonSchemaTest.kt)
- [`ConsumerExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/test/kotlin/io/bluetape4k/pulsar/consumer/ConsumerExtensionsTest.kt)
- [`ConsumerSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/test/kotlin/io/bluetape4k/pulsar/consumer/ConsumerSupportTest.kt)
- [`ProducerExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/test/kotlin/io/bluetape4k/pulsar/producer/ProducerExtensionsTest.kt)

## 워크숍

manual manifest에 등록된 전용 workshop path가 없습니다. 모듈 README와 위 representative test를 실행 근거로 사용합니다.

## 제한 사항

이 페이지는 연결된 source와 test가 나타내는 현재 저장소 상태를 설명합니다. optional backend를 애플리케이션 기본값으로 만들거나 benchmark artifact 없이 성능을 단정하지 않습니다. 모듈 버전이 바뀌면 호환성과 lifecycle 설명을 다시 확인해야 합니다.

## 근거

- [모듈 README](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/README.ko.md)
- [모듈 build](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/build.gradle.kts)
- [`PulsarClientSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/PulsarClientSupport.kt)
- [`PulsarCloseSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/PulsarCloseSupport.kt)
- [`Jackson3Schema`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/codec/Jackson3Schema.kt)
- [`JacksonSchema`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/codec/JacksonSchema.kt)
- [`ConsumerExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/consumer/ConsumerExtensions.kt)
- [`ConsumerSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/consumer/ConsumerSupport.kt)
- [`ProducerExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/producer/ProducerExtensions.kt)
- [`ProducerSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/producer/ProducerSupport.kt)
- [`ReaderExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/reader/ReaderExtensions.kt)
- [`ReaderSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/main/kotlin/io/bluetape4k/pulsar/reader/ReaderSupport.kt)
- [`AbstractPulsarTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/test/kotlin/io/bluetape4k/pulsar/AbstractPulsarTest.kt)
- [`PulsarCleanupCancellationTestSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/dda876503926aa16302b4416e3f3a3e2bff26526/infra/pulsar/src/test/kotlin/io/bluetape4k/pulsar/PulsarCleanupCancellationTestSupport.kt)
