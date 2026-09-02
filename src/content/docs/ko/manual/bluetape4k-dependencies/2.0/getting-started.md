---
slug: "ko/manual/bluetape4k-dependencies/2.0/getting-started"
title: "시작하기"
manual:
  id: "getting-started"
  repository: "bluetape4k-dependencies"
  group: "overview"
  kind: "guide"
  sourceCommit: "3c203aa9f8ba80685aac766c5fb8f24e23d0058e"
  sourcePath: "docs/manual/bluetape4k-dependencies/ko/getting-started.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "3c203aa9f8ba80685aac766c5fb8f24e23d0058e"
  sourceDir: "docs/manual/bluetape4k-dependencies"
  layer: "build"
---


안정 `2.0.0` BOM을 Maven Central에서 가져와 한 번만 import하고, BOM이 관리하는 Bluetape4k artifact에는 버전을 쓰지 않는다.

## Gradle에서 BOM 사용

```kotlin
repositories {
    mavenCentral()
}

dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:2.0.0"))
    implementation("io.github.bluetape4k:bluetape4k-core")
    implementation("io.github.bluetape4k:bluetape4k-coroutines")
}
```

생태계 BOM 버전은 platform 한 곳에만 선언한다. 하위 library 버전은 import한 BOM이 제공하므로 두 번째 버전이나 timestamped Maven version을 의존성 선언에 추가하지 않는다.

## Maven에서 BOM 사용

`dependencyManagement`에서 BOM을 import한다.

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.github.bluetape4k</groupId>
            <artifactId>bluetape4k-dependencies</artifactId>
            <version>2.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>io.github.bluetape4k</groupId>
        <artifactId>bluetape4k-core</artifactId>
    </dependency>
</dependencies>
```

## Bluetape4k 모듈 빌드에 catalog 추가

Catalog는 published BOM을 대체하는 artifact가 아니라 checkout한 source file이다.

```kotlin
// settings.gradle.kts
dependencyResolutionManagement {
    versionCatalogs {
        create("bt4k") {
            from(files("../bluetape4k-dependencies/gradle/libs.versions.toml"))
        }
    }
}
```

```kotlin
// build.gradle.kts
plugins {
    alias(bt4k.plugins.kotlin.jvm)
}

dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:2.0.0"))
    implementation(bt4k.bluetape4k.core)
    implementation(bt4k.bluetape4k.coroutines)
}
```

CI에서는 catalog checkout을 immutable commit에 고정한다. 중앙 catalog ref와 published BOM은 서로 다른 provenance이므로, catalog commit만으로 Maven artifact가 공개됐다고 판단하지 않는다.

## 첫 검증

1. Maven Central에서 BOM POM이 조회되는지 확인한다.
2. BOM과 버전 없는 Bluetape4k 모듈 하나로 대표 빌드를 실행한다.
3. Catalog checkout이 의도한 불변 release commit 또는 catalog train tag인지 확인한다.

후속 개발선을 의도적으로 시험할 때만 [Snapshot 소비](/ko/manual/bluetape4k-dependencies/2.0/guides/snapshot-consumption/)를 사용한다.
