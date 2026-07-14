---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-logging/operations-recipes"
title: Operations, configuration, and recipes
description: Combine backend output, redaction, testing, channel diagnosis, and incident response into one operating contract.
manualId: bluetape4k-logging
chapterId: operations-recipes
manual:
  id: "bluetape4k-logging"
  repository: "bluetape4k-projects"
  group: "foundation"
  kind: "library"
  sourceCommit: "ece059d6f79ae8b6d769e44ec98483a1225f6260"
  sourcePath: "docs/manual/en/modules/bluetape4k-logging/operations-recipes.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "bluetape4k/logging"
  layer: "build"
  chapterId: "operations-recipes"
---


Correct API calls are insufficient when backend configuration or lifecycle is wrong. Operations must verify that required fields are emitted safely and delivered before shutdown.

## Emit MDC fields

```xml
<pattern>%date %-5level [%thread] traceId=%X{traceId} requestId=%X{requestId} %logger - %msg%n</pattern>
```

Map the same keys as structured fields when using a JSON encoder. The application repository owns this configuration; a library must not modify the root logger.

## Request-boundary recipe

```kotlin
suspend fun handle(call: ApplicationCall) {
    val requestId = sanitize(call.request.headers["X-Request-Id"])
        ?: UUID.randomUUID().toString()

    withCoroutineLoggingContext("requestId" to requestId) {
        log.info { "Request accepted" }
        service.execute()
    }
}
```

Bound external values by length and character set before adding them to MDC. Exclude tokens, cookies, authorization headers, and raw bodies from both MDC and messages.

## Test contract

MDC tests should assert:

- the value inside the block;
- restoration after a nested scope;
- restoration after an exception;
- removal after `restorePrevious=false`;
- no installation for null entries;
- propagation across dispatcher switches.

Channel tests use a capturing appender for levels, ordering, prefixes, and causes. They also verify an inactive collector after `closeAndJoin()`, idempotent close, and post-close drop.

```bash
./gradlew :bluetape4k-logging:test --no-configuration-cache
```

## Incident diagnosis

| Symptom | Boundary to inspect | Action |
| --- | --- | --- |
| request ID intermittently missing | plain MDC crossed a coroutine boundary | wrap the suspend operation with the coroutine helper |
| CPU grows while DEBUG is disabled | eager message or serialization | move work into the lambda extension |
| logs disappear near shutdown | async close was mistaken for drain | move important events to a durable path |
| duplicate lines | multiple providers/appenders or additivity | inspect runtime classpath and Logback hierarchy |
| repeated fallback messages | supplier exception | test and simplify message construction |

## Sources and next reading

- [All logging tests](https://github.com/bluetape4k/bluetape4k-projects/tree/1.11.0/bluetape4k/logging/src/test/kotlin/io/bluetape4k/logging)
- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/logging/README.md)
- [Coroutine MDC](/manual/bluetape4k-projects/1.11/modules/bluetape4k-logging/coroutine-mdc/)
- [Async channel](/manual/bluetape4k-projects/1.11/modules/bluetape4k-logging/async-channel/)

No dedicated logging workshop is registered. The smallest runnable exercise is to apply the recipe at a Ktor or Spring request boundary and add nested-MDC and shutdown tests.
