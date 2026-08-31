# Ecosystem BOM

The published artifact is:

```text
io.github.bluetape4k:bluetape4k-dependencies:2.0.0-SNAPSHOT
```

It is a Maven POM/BOM. It aligns dependency versions; it does not contain runtime classes. Import it as a Gradle `platform` or Maven `dependencyManagement` entry, then declare the actual library modules separately.

## What the BOM manages

- the Bluetape4k child BOMs listed in the [repository map](../architecture/repository-map.md);
- central framework and runtime BOM lines such as Spring Boot, Kotlin, Coroutines, Jackson, Ktor, Netty, Kafka, and Testcontainers;
- the version constraints consumed by the ecosystem's published modules.

The exact generated alias and version inventory remains [`gradle/libs.versions.toml`](https://github.com/bluetape4k/bluetape4k-dependencies/blob/6073eefe7cd5d7bdf3bb5dec7103ffb5427a4e7b/gradle/libs.versions.toml). This page summarizes the contract rather than duplicating the catalog.

## Usage contract

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:2.0.0-SNAPSHOT"))
    implementation("io.github.bluetape4k:bluetape4k-core")
}
```

Do not mix this platform with a second, conflicting version of the same Bluetape4k child BOM. If an application must override a transitive library, keep the override explicit and validate the effective dependency graph.

## Stable promotion

The snapshot coordinate is temporary. Before a stable manual can claim `2.0.0`, the release process must verify all required child artifacts, the exact signed tag and commit, the published POM/module metadata, and downstream resolution. Only then should the central manual manifest receive stable provenance and a generated site snapshot.
