---
slug: "ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-workflow"
manualId: bluetape4k-workflow
title: "bluetape4k-workflow"
description: "Kotlin DSL 기반 워크플로우 오케스트레이션 라이브러리입니다. 동기, 코루틴, Virtual Thread 실행 모델을 지원하며 선언적 DSL로 복잡한 워크플로우를 구성할 수 있습니다."
kind: library
group: utilities
manual:
  id: "bluetape4k-workflow"
  repository: "bluetape4k-projects"
  group: "utilities"
  kind: "library"
  sourceCommit: "0ecae4a1b0b25e9654cd631b437ef81215d81974"
  sourcePath: "docs/manual/ko/modules/bluetape4k-workflow.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "utils/workflow"
  layer: "build"
---


## 해결하는 문제

Kotlin DSL 기반 워크플로우 오케스트레이션 라이브러리입니다. 동기, 코루틴, Virtual Thread 실행 모델을 지원하며 선언적 DSL로 복잡한 워크플로우를 구성할 수 있습니다. 이 매뉴얼은 README의 기능 목록을 반복하지 않고 현재 build, source entry point, test, 설정 resource, lifecycle 근거를 연결합니다.

## 사용 시점

애플리케이션에 입력 계약, value semantics, algorithm cost, deterministic output이 필요할 때 `bluetape4k-workflow`를 선택합니다. 아래 source entry point에서 시작해 ownership과 failure 계약이 caller lifecycle에 맞는지 확인합니다. 표준 API나 이미 도입한 더 작은 모듈이 같은 계약을 만족한다면 그쪽을 우선합니다.

## 의존성 좌표

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-workflow")
}
```

Gradle project path는 `:bluetape4k-workflow`, source directory는 `utils/workflow`입니다.

## 핵심 개념

먼저 확인할 source 개념은 `ErrorStrategy`, `NamedSuspendWork`, `NamedWork`, `ParallelPolicy`, `RetryPolicy`, `SuspendWork`, `SuspendWorkFlow`, `Work`입니다. 파일 이름은 탐색 anchor일 뿐이므로 public 계약으로 사용하기 전에 선언과 test를 함께 읽습니다.

## 빠른 시작

위 좌표를 추가하고 Gradle을 refresh한 뒤 필요한 작업을 소유한 가장 작은 entry point에서 시작합니다. 먼저 [`ErrorStrategy`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/ErrorStrategy.kt)를 확인합니다. 이 파일이 모듈의 구체적인 source entry point입니다.

## 작업별 API

| Entry point | 확인할 내용 |
| --- | --- |
| [`ErrorStrategy`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/ErrorStrategy.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`NamedSuspendWork`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/NamedSuspendWork.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`NamedWork`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/NamedWork.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`ParallelPolicy`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/ParallelPolicy.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`RetryPolicy`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/RetryPolicy.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`SuspendWork`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/SuspendWork.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`SuspendWorkFlow`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/SuspendWorkFlow.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`Work`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/Work.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`WorkAdapters`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/WorkAdapters.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`WorkContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/WorkContext.kt) | constructor, function, ownership 계약을 확인합니다. |

## 권장 패턴

README 근거는 **아키텍처**, **개념 개요**, **WorkReport 상태**, **실행 모델 선택**, **주요 특징**, **WorkStatus & WorkReport**, **제어 흐름 비유**, **핵심 API**, **WorkContext**, **Work & SuspendWork** 순서로 탐색할 수 있습니다. 이 항목으로 방향을 잡고 source와 test에서 동작을 확인합니다. 도입 범위는 좁게 유지하고 소유한 resource를 caller lifecycle에 연결합니다.

## 연동

현재 build에 선언된 integration edge는 다음과 같습니다.

```kotlin
api(project(":bluetape4k-core"))
implementation(project(":bluetape4k-virtualthread-api"))
runtimeOnly(project(":bluetape4k-virtualthread-jdk21"))
implementation(project(":bluetape4k-coroutines"))
implementation(libs.kotlinx.coroutines.core)
```

`compileOnly` edge는 caller가 제공해야 하는 capability이므로 API를 사용하기 전에 runtime에 실제 dependency가 있는지 확인합니다.

## 설정

`src/main/resources` 아래에서 모듈 수준 설정 resource를 찾지 못했습니다. constructor, builder, function argument, 연동 framework로 설정하며 default는 source에서 확인합니다.

## 실패 동작

failure 의미는 artifact 이름이 아니라 아래 entry point와 test가 결정합니다. cancellation과 timeout signal을 보존하고 소유한 resource를 닫습니다. backend exception은 안정된 domain 계약을 추가할 수 있는 boundary에서만 변환합니다. retry나 fallback을 넣기 전에 test anchor로 실제 동작을 확인합니다.

## 운영

hot path를 측정하고 입력 크기를 제한하며 utility를 호출하는 application boundary에서 failure를 관찰합니다. capacity, timeout, retry, shutdown 설정은 resource를 소유한 component 가까이에 둡니다. 누가 trade-off를 받아들였는지 알 수 없는 process-wide default는 피합니다.

## 테스트

모듈 test task는 다음과 같습니다.

```bash
./gradlew :bluetape4k-workflow:test --no-configuration-cache
```

대표 test anchor는 다음과 같습니다.

- [`AbstractWorkflowTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/api/AbstractWorkflowTest.kt)
- [`WorkAdapterTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/api/WorkAdapterTest.kt)
- [`WorkContextTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/api/WorkContextTest.kt)
- [`WorkReportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/api/WorkReportTest.kt)
- [`ConditionalWorkFlowTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/core/ConditionalWorkFlowTest.kt)
- [`ParallelWorkFlowTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/core/ParallelWorkFlowTest.kt)
- [`RepeatWorkFlowTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/core/RepeatWorkFlowTest.kt)
- [`RetryWorkFlowTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/core/RetryWorkFlowTest.kt)

## 워크숍

manual manifest에 등록된 전용 workshop path가 없습니다. 모듈 README와 위 representative test를 실행 근거로 사용합니다.

## 제한 사항

이 페이지는 연결된 source와 test가 나타내는 현재 저장소 상태를 설명합니다. optional backend를 애플리케이션 기본값으로 만들거나 benchmark artifact 없이 성능을 단정하지 않습니다. 모듈 버전이 바뀌면 호환성과 lifecycle 설명을 다시 확인해야 합니다.

## 근거

- [모듈 README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/README.ko.md)
- [모듈 build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/build.gradle.kts)
- [`ErrorStrategy`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/ErrorStrategy.kt)
- [`NamedSuspendWork`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/NamedSuspendWork.kt)
- [`NamedWork`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/NamedWork.kt)
- [`ParallelPolicy`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/ParallelPolicy.kt)
- [`RetryPolicy`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/RetryPolicy.kt)
- [`SuspendWork`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/SuspendWork.kt)
- [`SuspendWorkFlow`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/SuspendWorkFlow.kt)
- [`Work`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/Work.kt)
- [`WorkAdapters`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/WorkAdapters.kt)
- [`WorkContext`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/main/kotlin/io/bluetape4k/workflow/api/WorkContext.kt)
- [`AbstractWorkflowTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/api/AbstractWorkflowTest.kt)
- [`WorkAdapterTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/workflow/src/test/kotlin/io/bluetape4k/workflow/api/WorkAdapterTest.kt)
