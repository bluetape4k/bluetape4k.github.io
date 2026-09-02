---
slug: "ko/manual/bluetape4k-javers/1.0/examples/javers-ktor"
title: "JaVers Ktor 예제"
manual:
  id: "javers-ktor-example"
  repository: "bluetape4k-javers"
  group: "examples"
  kind: "example"
  sourceCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourcePath: "docs/manual/bluetape4k-javers/ko/examples/javers-ktor.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourceDir: "examples/javers-ktor"
  layer: "learn"
---


이 예제는 Ktor로 주문 command 흐름을 노출하고, Exposed가 현재 상태를 보관하며 JaVers가 감사 이력을 기록하도록 구성합니다. HTTP 검증, blocking 데이터베이스 작업, 감사 경계를 분리해 보여줍니다.

```bash
./gradlew :examples-javers-ktor:test
```

[애플리케이션 진입점](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/examples/javers-ktor/src/main/kotlin/io/bluetape4k/javers/examples/ktor/JaversKtorExampleApplication.kt)부터 읽고 [통합 테스트](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/examples/javers-ktor/src/test/kotlin/io/bluetape4k/javers/examples/ktor/OrderApiIntegrationTest.kt)를 확인하십시오. PostgreSQL 통합 경로에는 Docker가 필요하며 나머지 테스트가 더 작은 피드백 루프를 제공합니다.
