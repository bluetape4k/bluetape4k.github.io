# Gradle Version Catalog

`gradle/libs.versions.toml`은 Bluetape4k build alias, plugin alias, 공통 dependency version, 생성된 artifact alias의 source of truth다. checkout한 파일로 소비하며 published BOM을 대체하지 않는다.

## Catalog import

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

Build script에서 alias를 사용한다.

```kotlin
plugins {
    alias(bt4k.plugins.kotlin.jvm)
}

dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:2.0.0-SNAPSHOT"))
    implementation(bt4k.bluetape4k.core)
    implementation(bt4k.bluetape4k.coroutines)
}
```

`bt4k.bluetape4k.core`와 `bt4k.bluetape4k.coroutines`는 module coordinate alias다. 실제 resolved version은 여전히 import한 platform과 하위 BOM이 제공한다.

## 생성·거버넌스 영역

Catalog에는 세 경계가 있다.

1. 중앙 self-version과 import한 하위 BOM version;
2. Kotlin, Spring Boot, Jackson, Ktor, Testcontainers 같은 공통 framework·runtime alias;
3. sibling 저장소의 `settings.gradle.kts` module include에서 생성되는 managed alias.

생성된 managed alias를 downstream version 문제의 해결책으로 직접 고치지 않는다. source-of-truth block 또는 소유 upstream 저장소를 변경한 뒤 managed-catalog와 shared-version 검사를 실행한다.

## Immutable 소비

CI에서는 catalog commit을 Maven snapshot metadata와 분리해 기록한다. 이 초안이 사용한 catalog commit은 [`6073eefe`](https://github.com/bluetape4k/bluetape4k-dependencies/tree/6073eefe7cd5d7bdf3bb5dec7103ffb5427a4e7b)이며, snapshot 저장소에 대응 BOM이 공개되기 전에 더 최신 commit이 생길 수 있다.
