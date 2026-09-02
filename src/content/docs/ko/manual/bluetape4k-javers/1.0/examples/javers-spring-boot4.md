---
slug: "ko/manual/bluetape4k-javers/1.0/examples/javers-spring-boot4"
title: "JaVers Spring Boot 4 예제"
manual:
  id: "javers-spring-boot4-example"
  repository: "bluetape4k-javers"
  group: "examples"
  kind: "example"
  sourceCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourcePath: "docs/manual/bluetape4k-javers/ko/examples/javers-spring-boot4.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourceDir: "examples/javers-spring-boot4"
  layer: "learn"
---


이 예제는 Spring Boot 4 REST 경계, Exposed 주문 영속성, JaVers 감사를 결합합니다. 애플리케이션에 자동 구성 모듈을 적용하기 전에 bean 구성과 transaction 소유권을 확인하는 용도입니다.

```bash
./gradlew :examples-javers-spring-boot4:test
```

[애플리케이션 구성](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/examples/javers-spring-boot4/src/main/kotlin/io/bluetape4k/javers/examples/springboot4/config/JaversExampleConfiguration.kt)과 [API 통합 테스트](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/examples/javers-spring-boot4/src/test/kotlin/io/bluetape4k/javers/examples/springboot4/OrderApiIntegrationTest.kt)를 함께 확인하십시오. PostgreSQL 통합 변형에는 Docker가 필요합니다.
