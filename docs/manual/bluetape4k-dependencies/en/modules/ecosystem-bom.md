# Ecosystem BOM

The published artifact is:

```text
io.github.bluetape4k:bluetape4k-dependencies:2.0.0
```

It is a Maven POM/BOM. It aligns dependency versions; it does not contain runtime classes. Import it as a Gradle `platform` or Maven `dependencyManagement` entry, then declare the actual library modules separately.

## What the BOM manages

- the Bluetape4k child BOMs listed in the [repository map](../architecture/repository-map.md);
- central framework and runtime BOM lines such as Spring Boot, Kotlin, Coroutines, Jackson, Ktor, Netty, Kafka, and Testcontainers;
- the version constraints consumed by the ecosystem's published modules.

The exact generated alias and version inventory remains [`gradle/libs.versions.toml`](https://github.com/bluetape4k/bluetape4k-dependencies/blob/3c203aa9f8ba80685aac766c5fb8f24e23d0058e/gradle/libs.versions.toml). This page summarizes the contract rather than duplicating the catalog.

## Usage contract

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:2.0.0"))
    implementation("io.github.bluetape4k:bluetape4k-core")
}
```

Do not mix this platform with a second, conflicting version of the same Bluetape4k child BOM. If an application must override a transitive library, keep the override explicit and validate the effective dependency graph.

## Stable provenance

This manual is pinned to the signed `2.0.0` tag and commit `3c203aa9f8ba80685aac766c5fb8f24e23d0058e`. The child artifacts, published POM/module metadata, and downstream resolution were verified before the site snapshot was generated.
