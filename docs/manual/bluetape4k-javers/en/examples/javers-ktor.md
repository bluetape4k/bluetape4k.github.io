# JaVers Ktor example

This example exposes an order command flow through Ktor while Exposed owns current state and JaVers records audit history. It keeps HTTP validation, blocking database work, and audit boundaries visible.

```bash
./gradlew :examples-javers-ktor:test
```

Start with the [application entry point](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/examples/javers-ktor/src/main/kotlin/io/bluetape4k/javers/examples/ktor/JaversKtorExampleApplication.kt), then inspect the [integration test](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/examples/javers-ktor/src/test/kotlin/io/bluetape4k/javers/examples/ktor/OrderApiIntegrationTest.kt). The PostgreSQL integration path needs Docker; the remaining tests provide the smaller feedback loop.
