---
slug: "manual/bluetape4k-javers/1.0/modules/javers-spring-boot4-autoconfigure"
title: "JaVers Spring Boot 4 auto-configuration"
manual:
  id: "javers-spring-boot4-autoconfigure"
  repository: "bluetape4k-javers"
  group: "foundation"
  kind: "library"
  sourceCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourcePath: "docs/manual/bluetape4k-javers/en/modules/javers-spring-boot4-autoconfigure.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourceDir: "javers-spring-boot4-autoconfigure"
  layer: "build"
---


This module wires the bluetape4k JaVers repositories into Spring Boot 4. Add it when the application wants configuration properties and conditional repository beans instead of constructing the repository graph directly.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:2.0.0"))
    implementation("io.github.bluetape4k.javers:javers-spring-boot4-autoconfigure")
}
```

Verify repository selection and property binding with:

```bash
./gradlew :javers-spring-boot4-autoconfigure:test
```

The release contract is defined by [JaversAutoConfiguration](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/javers-spring-boot4-autoconfigure/src/main/kotlin/io/bluetape4k/javers/autoconfigure/JaversAutoConfiguration.kt) and its [configuration test](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/javers-spring-boot4-autoconfigure/src/test/kotlin/io/bluetape4k/javers/autoconfigure/JaversAutoConfigurationTest.kt).
