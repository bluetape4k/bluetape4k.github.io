# 시작하기

`2.0.0-SNAPSHOT`은 개발 검증에만 사용한다. Snapshot 저장소를 명시하고, BOM을 한 번만 import하며, BOM이 관리하는 Bluetape4k artifact에는 버전을 쓰지 않는다.

## Gradle에서 BOM 사용

```kotlin
repositories {
    maven { url = uri("https://central.sonatype.com/repository/maven-snapshots") }
    mavenCentral()
}

dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:2.0.0-SNAPSHOT"))
    implementation("io.github.bluetape4k:bluetape4k-core")
    implementation("io.github.bluetape4k:bluetape4k-coroutines")
}
```

생태계 BOM 버전은 platform 한 곳에만 선언한다. 하위 library 버전은 import한 BOM이 제공하므로 두 번째 버전이나 timestamped Maven version을 의존성 선언에 추가하지 않는다.

## Maven에서 BOM 사용

Snapshot 저장소를 선언하고 `dependencyManagement`에서 BOM을 import한다.

```xml
<repositories>
    <repository>
        <id>central-snapshots</id>
        <url>https://central.sonatype.com/repository/maven-snapshots</url>
        <releases><enabled>false</enabled></releases>
        <snapshots><enabled>true</enabled></snapshots>
    </repository>
</repositories>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.github.bluetape4k</groupId>
            <artifactId>bluetape4k-dependencies</artifactId>
            <version>2.0.0-SNAPSHOT</version>
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
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:2.0.0-SNAPSHOT"))
    implementation(bt4k.bluetape4k.core)
    implementation(bt4k.bluetape4k.coroutines)
}
```

CI에서는 catalog checkout을 immutable commit에 고정한다. 중앙 catalog ref와 published snapshot은 서로 다른 provenance이므로, catalog commit만으로 Maven artifact가 공개됐다고 판단하지 않는다.

## 첫 검증

1. Snapshot 저장소에서 BOM POM이 조회되는지 확인한다.
2. BOM과 버전 없는 Bluetape4k 모듈 하나로 대표 빌드를 실행한다.
3. 방금 재게시된 snapshot을 의도적으로 소비할 때만 `--refresh-dependencies`를 한 번 사용한다. 저장소나 좌표 오류를 숨기는 용도로 사용하지 않는다.

이어서 [Snapshot 소비](guides/snapshot-consumption.md)에서 개발 빌드 공유 전 확인할 항목을 읽는다.
