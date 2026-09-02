---
slug: "manual/bluetape4k-dependencies/2.0/getting-started"
title: "Getting started"
manual:
  id: "getting-started"
  repository: "bluetape4k-dependencies"
  group: "overview"
  kind: "guide"
  sourceCommit: "3c203aa9f8ba80685aac766c5fb8f24e23d0058e"
  sourcePath: "docs/manual/bluetape4k-dependencies/en/getting-started.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "3c203aa9f8ba80685aac766c5fb8f24e23d0058e"
  sourceDir: "docs/manual/bluetape4k-dependencies"
  layer: "build"
---


Use the stable `2.0.0` BOM from Maven Central, import it once, and omit versions from managed Bluetape4k artifacts.

## Gradle with the BOM

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

The platform is the only place where the ecosystem BOM version is declared. A child library receives its version from the imported BOM; do not add a second version or a timestamped Maven version to the dependency declaration.

## Maven with the BOM

Import the BOM in `dependencyManagement`:

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

## Add the catalog when you build Bluetape4k modules

The catalog is a checked-out source file, not a Maven artifact replacement:

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

Pin the catalog checkout to an immutable commit in CI. The central catalog ref and the published BOM are separate provenance: a catalog commit does not prove that a Maven artifact is available.

## First checks

1. Resolve Maven Central and confirm the BOM POM is available.
2. Run the representative build with the BOM and one versionless Bluetape4k module.
3. Confirm the catalog checkout is the intended immutable release commit or catalog train tag.

Use [snapshot consumption](/manual/bluetape4k-dependencies/2.0/guides/snapshot-consumption/) only when intentionally testing a later development line.
