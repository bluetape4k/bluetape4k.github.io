---
slug: "ko/manual/bluetape4k-dependencies/2.0/modules/ecosystem-bom"
title: "생태계 BOM"
manual:
  id: "ecosystem-bom"
  repository: "bluetape4k-dependencies"
  group: "foundation"
  kind: "library"
  sourceCommit: "3c203aa9f8ba80685aac766c5fb8f24e23d0058e"
  sourcePath: "docs/manual/bluetape4k-dependencies/ko/modules/ecosystem-bom.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "3c203aa9f8ba80685aac766c5fb8f24e23d0058e"
  sourceDir: "."
  layer: "build"
---


게시 artifact는 다음 좌표다.

```text
io.github.bluetape4k:bluetape4k-dependencies:2.0.0
```

이 artifact는 Maven POM/BOM이며 runtime class를 포함하지 않는다. Gradle에서는 `platform`으로, Maven에서는 `dependencyManagement` 항목으로 import한 뒤 실제 library 모듈을 별도로 선언한다.

## BOM이 관리하는 범위

- [저장소 지도](/ko/manual/bluetape4k-dependencies/2.0/architecture/repository-map/)에 정리한 Bluetape4k 하위 BOM;
- Spring Boot, Kotlin, Coroutines, Jackson, Ktor, Netty, Kafka, Testcontainers 같은 중앙 framework·runtime BOM 계열;
- 생태계 published module이 소비하는 version constraint.

정확한 alias와 version inventory는 [`gradle/libs.versions.toml`](https://github.com/bluetape4k/bluetape4k-dependencies/blob/3c203aa9f8ba80685aac766c5fb8f24e23d0058e/gradle/libs.versions.toml)이 기준이다. 이 문서는 catalog 전체를 복제하지 않고 계약만 요약한다.

## 사용 계약

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:2.0.0"))
    implementation("io.github.bluetape4k:bluetape4k-core")
}
```

같은 Bluetape4k 하위 BOM에 대해 충돌하는 두 번째 version을 함께 관리하지 않는다. 애플리케이션이 transitive library를 override해야 한다면 override를 명시하고 effective dependency graph를 검증한다.

## Stable provenance

이 매뉴얼은 서명 tag `2.0.0`과 commit `3c203aa9f8ba80685aac766c5fb8f24e23d0058e`에 고정되어 있다. 하위 artifact, 공개 POM/module metadata, downstream resolution을 검증한 뒤 site snapshot을 생성했다.
