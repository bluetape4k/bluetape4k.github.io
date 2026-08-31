# Gradle Version Catalog

`gradle/libs.versions.toml` is the source of truth for Bluetape4k build aliases, plugin aliases, shared dependency versions, and generated artifact aliases. It is consumed as a checked-out file; it is not a replacement for the published BOM.

## Import the catalog

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

Use the aliases in a build script:

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

`bt4k.bluetape4k.core` and `bt4k.bluetape4k.coroutines` are aliases for module coordinates. Their resolved versions still come from the imported platform and child BOMs.

## Generated and governed sections

The catalog has three useful boundaries:

1. the central self-version and imported child BOM versions;
2. shared framework/runtime aliases such as Kotlin, Spring Boot, Jackson, Ktor, and Testcontainers;
3. generated managed aliases derived from sibling repositories' `settings.gradle.kts` module includes.

Do not hand-edit generated managed aliases to solve a downstream version problem. Change the source-of-truth block or the owning upstream repository, then run the managed-catalog and shared-version checks.

## Immutable consumption

For CI, record the catalog commit separately from the Maven snapshot metadata. The catalog commit [`6073eefe`](https://github.com/bluetape4k/bluetape4k-dependencies/tree/6073eefe7cd5d7bdf3bb5dec7103ffb5427a4e7b) is the source used by this draft; a later commit may change aliases before the snapshot repository publishes a corresponding BOM.
