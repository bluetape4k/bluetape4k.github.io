---
slug: "ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-idgenerators"
manualId: bluetape4k-idgenerators
title: "분산 ID 생성기"
description: "분산 환경에서 Unique ID를 다양한 알고리즘으로 생성합니다. UUID(V1~V7), ULID, KSUID, Snowflake, Flake, Hashids를 통일된 IdGenerator 인터페이스로 제공합니다."
kind: library
group: utilities
learningOrder: 1200
manual:
  id: "bluetape4k-idgenerators"
  repository: "bluetape4k-projects"
  group: "utilities"
  kind: "library"
  sourceCommit: "222f640a5a8937d3000dc49b2e2f585726ed70e6"
  sourcePath: "docs/manual/ko/modules/bluetape4k-idgenerators.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "utils/idgenerators"
  layer: "build"
  learningOrder: 1200
---


## 해결하는 문제

분산 환경에서 Unique ID를 다양한 알고리즘으로 생성합니다. UUID(V1~V7), ULID, KSUID, Snowflake, Flake, Hashids를 통일된 IdGenerator 인터페이스로 제공합니다. 이 매뉴얼은 README의 기능 목록을 반복하지 않고 현재 build, source entry point, test, 설정 resource, lifecycle 근거를 연결합니다.

## 사용 시점

애플리케이션에 입력 계약, value semantics, algorithm cost, deterministic output이 필요할 때 `bluetape4k-idgenerators`를 선택합니다. 아래 source entry point에서 시작해 ownership과 failure 계약이 caller lifecycle에 맞는지 확인합니다. 표준 API나 이미 도입한 더 작은 모듈이 같은 계약을 만족한다면 그쪽을 우선합니다.

## 의존성 좌표

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-idgenerators")
}
```

Gradle project path는 `:bluetape4k-idgenerators`, source directory는 `utils/idgenerators`입니다.

## 핵심 개념

먼저 확인할 source 개념은 `IdGenerator`, `LongIdGenerator`, `MachineIdSupport`, `Flake`, `Hashids`, `HashidsSupport`, `BitInputStream`, `BitOutputStream`입니다. 파일 이름은 탐색 anchor일 뿐이므로 public 계약으로 사용하기 전에 선언과 test를 함께 읽습니다.

## 빠른 시작

위 좌표를 추가하고 Gradle을 refresh한 뒤 필요한 작업을 소유한 가장 작은 entry point에서 시작합니다. 먼저 [`IdGenerator`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/IdGenerator.kt)를 확인합니다. 이 파일이 모듈의 구체적인 source entry point입니다.

## 작업별 API

| Entry point | 확인할 내용 |
| --- | --- |
| [`IdGenerator`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/IdGenerator.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`LongIdGenerator`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/LongIdGenerator.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`MachineIdSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/MachineIdSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`Flake`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/flake/Flake.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`Hashids`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/hashids/Hashids.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`HashidsSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/hashids/HashidsSupport.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`BitInputStream`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/ksuid/BitInputStream.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`BitOutputStream`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/ksuid/BitOutputStream.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`BytesBase62`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/ksuid/BytesBase62.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`Ksuid`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/ksuid/Ksuid.kt) | constructor, function, ownership 계약을 확인합니다. |

## 권장 패턴

README 근거는 **알고리즘 선택 가이드**, **아키텍처**, **전체 알고리즘 구조**, **클래스 다이어그램**, **Snowflake 비트 구조**, **알고리즘 비교**, **사용 예시**, **Snowflake (Twitter 스타일)**, **UUID (통합 API)**, **ULID (Universally Unique Lexicographically Sortable Identifier)** 순서로 탐색할 수 있습니다. 이 항목으로 방향을 잡고 source와 test에서 동작을 확인합니다. 도입 범위는 좁게 유지하고 소유한 resource를 caller lifecycle에 연결합니다.

## 연동

현재 build에 선언된 integration edge는 다음과 같습니다.

```kotlin
api(project(":bluetape4k-core"))
api(libs.java.uuid.generator)  // https://github.com/cowtowncoder/java-uuid-generator
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
./gradlew :bluetape4k-idgenerators:test --no-configuration-cache
```

대표 test anchor는 다음과 같습니다.

- [`IdSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/test/kotlin/io/bluetape4k/idgenerators/IdSupportTest.kt)
- [`FlakeTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/test/kotlin/io/bluetape4k/idgenerators/flake/FlakeTest.kt)
- [`HashIdsSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/test/kotlin/io/bluetape4k/idgenerators/hashids/HashIdsSupportTest.kt)
- [`HashidsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/test/kotlin/io/bluetape4k/idgenerators/hashids/HashidsTest.kt)
- [`BytesBase62Test`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/test/kotlin/io/bluetape4k/idgenerators/ksuid/BytesBase62Test.kt)
- [`KsuidEdgeCasesTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/test/kotlin/io/bluetape4k/idgenerators/ksuid/KsuidEdgeCasesTest.kt)
- [`KsuidGeneratorTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/test/kotlin/io/bluetape4k/idgenerators/ksuid/KsuidGeneratorTest.kt)
- [`KsuidMillisTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/test/kotlin/io/bluetape4k/idgenerators/ksuid/KsuidMillisTest.kt)

## 워크숍

manual manifest에 등록된 전용 workshop path가 없습니다. 모듈 README와 위 representative test를 실행 근거로 사용합니다.

## 제한 사항

이 페이지는 연결된 source와 test가 나타내는 현재 저장소 상태를 설명합니다. optional backend를 애플리케이션 기본값으로 만들거나 benchmark artifact 없이 성능을 단정하지 않습니다. 모듈 버전이 바뀌면 호환성과 lifecycle 설명을 다시 확인해야 합니다.

<!-- release-readme-diagrams:start -->
## 배포본 다이어그램

아래 그림은 현재 개발 브랜치가 아니라 `1.11.0` 배포 태그의 README 자산을 바이트 단위로 그대로 옮긴 것입니다. 따라서 이후 SNAPSHOT 변경이 아니라 이 매뉴얼 버전의 구조와 실행 흐름을 보여 줍니다. 미리보기를 누르면 SVG 원본이 열립니다.

### idgenerators 아키텍처

[![idgenerators 아키텍처](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/utils-idgenerators-diagram-01.png)](../../assets/readme-diagrams/utils-idgenerators-diagram-01.svg)

_배포본 README: [`utils/idgenerators/README.ko.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/utils/idgenerators/README.ko.md)_

### ID Generators 클래스 구조도

[![ID Generators 클래스 구조도](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/utils-idgenerators-diagram-02.png)](../../assets/readme-diagrams/utils-idgenerators-diagram-02.svg)

_배포본 README: [`utils/idgenerators/README.ko.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/utils/idgenerators/README.ko.md)_

### Snowflake 다이어그램

[![Snowflake 다이어그램](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/utils-idgenerators-diagram-03.png)](../../assets/readme-diagrams/utils-idgenerators-diagram-03.svg)

_배포본 README: [`utils/idgenerators/README.ko.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/utils/idgenerators/README.ko.md)_

### ULID (Universally Unique Lexicographically Sortable Identif. 다이어그램

[![ULID (Universally Unique Lexicographically Sortable Identif. 다이어그램](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/utils-idgenerators-diagram-04.png)](../../assets/readme-diagrams/utils-idgenerators-diagram-04.svg)

_배포본 README: [`utils/idgenerators/README.ko.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/utils/idgenerators/README.ko.md)_

### ULID (Universally Unique Lexicographically Sortable Identif. 다이어그램

[![ULID (Universally Unique Lexicographically Sortable Identif. 다이어그램](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/utils-idgenerators-diagram-05.png)](../../assets/readme-diagrams/utils-idgenerators-diagram-05.svg)

_배포본 README: [`utils/idgenerators/README.ko.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/utils/idgenerators/README.ko.md)_

### KSUID Layout 다이어그램

[![KSUID Layout 다이어그램](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/utils-idgenerators-diagram-06.png)](../../assets/readme-diagrams/utils-idgenerators-diagram-06.svg)

_배포본 README: [`utils/idgenerators/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/utils/idgenerators/README.md)_

### Flake Layout 다이어그램

[![Flake Layout 다이어그램](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/utils-idgenerators-diagram-07.png)](../../assets/readme-diagrams/utils-idgenerators-diagram-07.svg)

_배포본 README: [`utils/idgenerators/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/utils/idgenerators/README.md)_

<!-- release-readme-diagrams:end -->

## 근거

- [모듈 README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/README.ko.md)
- [모듈 build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/build.gradle.kts)
- [`IdGenerator`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/IdGenerator.kt)
- [`LongIdGenerator`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/LongIdGenerator.kt)
- [`MachineIdSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/MachineIdSupport.kt)
- [`Flake`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/flake/Flake.kt)
- [`Hashids`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/hashids/Hashids.kt)
- [`HashidsSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/hashids/HashidsSupport.kt)
- [`BitInputStream`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/ksuid/BitInputStream.kt)
- [`BitOutputStream`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/ksuid/BitOutputStream.kt)
- [`BytesBase62`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/ksuid/BytesBase62.kt)
- [`Ksuid`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/main/kotlin/io/bluetape4k/idgenerators/ksuid/Ksuid.kt)
- [`IdSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/test/kotlin/io/bluetape4k/idgenerators/IdSupportTest.kt)
- [`FlakeTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/idgenerators/src/test/kotlin/io/bluetape4k/idgenerators/flake/FlakeTest.kt)
