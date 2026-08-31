# Getting started

Use `2.0.0-SNAPSHOT` only for development validation. Configure the snapshot repository explicitly, import the BOM once, and omit versions from managed Bluetape4k artifacts.

## Gradle with the BOM

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

The platform is the only place where the ecosystem BOM version is declared. A child library receives its version from the imported BOM; do not add a second version or a timestamped Maven version to the dependency declaration.

## Maven with the BOM

Declare the snapshot repository and import the BOM in `dependencyManagement`:

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
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:2.0.0-SNAPSHOT"))
    implementation(bt4k.bluetape4k.core)
    implementation(bt4k.bluetape4k.coroutines)
}
```

Pin the catalog checkout to an immutable commit in CI. The central catalog ref and the published snapshot are separate provenance: a catalog commit does not prove that a Maven artifact is available.

## First checks

1. Resolve the snapshot repository and confirm the BOM POM is available.
2. Run the representative build with the BOM and one versionless Bluetape4k module.
3. If a known snapshot was just republished, use `--refresh-dependencies` once; do not use it to hide a missing repository or an incorrect coordinate.

Continue with [snapshot consumption](guides/snapshot-consumption.md) before sharing a development build.
