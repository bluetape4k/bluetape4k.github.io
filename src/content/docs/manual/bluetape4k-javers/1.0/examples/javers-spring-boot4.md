---
slug: "manual/bluetape4k-javers/1.0/examples/javers-spring-boot4"
title: "JaVers Spring Boot 4 example"
manual:
  id: "javers-spring-boot4-example"
  repository: "bluetape4k-javers"
  group: "examples"
  kind: "example"
  sourceCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourcePath: "docs/manual/bluetape4k-javers/en/examples/javers-spring-boot4.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourceDir: "examples/javers-spring-boot4"
  layer: "learn"
---


This example combines a Spring Boot 4 REST boundary, Exposed order persistence, and JaVers auditing. Use it to inspect bean composition and transaction ownership before applying the auto-configuration module in an application.

```bash
./gradlew :examples-javers-spring-boot4:test
```

Read the [application configuration](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/examples/javers-spring-boot4/src/main/kotlin/io/bluetape4k/javers/examples/springboot4/config/JaversExampleConfiguration.kt) with the [API integration test](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/examples/javers-spring-boot4/src/test/kotlin/io/bluetape4k/javers/examples/springboot4/OrderApiIntegrationTest.kt). The PostgreSQL integration variant requires Docker.
