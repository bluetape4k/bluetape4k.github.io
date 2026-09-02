---
slug: "manual/bluetape4k-javers/1.0/guides/ddd-and-cqrs"
title: "DDD and CQRS"
manual:
  id: "guides/ddd-and-cqrs"
  repository: "bluetape4k-javers"
  group: "overview"
  kind: "guide"
  sourceCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourcePath: "docs/manual/bluetape4k-javers/en/guides/ddd-and-cqrs.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "6648b73333cb665ecba0340588dbc3556c308a52"
  sourceDir: "docs/manual/bluetape4k-javers"
  layer: "build"
---


The 1.0.0 example answers one concrete question: in what order does a command-side service save business state, record audit history, publish an event, and update a query projection?

[![DDD and CQRS order sequence](/manual-assets/bluetape4k-javers/1.0/examples/ddd-cqrs-sequence.png)](../../assets/examples/ddd-cqrs-sequence.svg)

`AggregateRepository.save` executes:

1. subclass `persist(aggregate)` writes the domain source of truth;
2. `javers.commit(author, saved, eventProperties)` stores the audit commit;
3. `DomainEventPublisher.publishAll` publishes events in iteration order;
4. a Kafka consumer later applies the event to `RedisOrderSummaryProjection`.

The sequence is proven by [`AggregateRepository.kt`](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/javers-ddd/src/main/kotlin/io/bluetape4k/javers/ddd/AggregateRepository.kt), the example [`OrderRepository.kt`](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/examples/javers-exposed-ddd/src/main/kotlin/io/bluetape4k/javers/examples/exposedddd/persistence/OrderRepository.kt), and [`OrderProjectionFlowTest.kt`](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/examples/javers-exposed-ddd/src/test/kotlin/io/bluetape4k/javers/examples/exposedddd/OrderProjectionFlowTest.kt).

The example teaches responsibility and ordering. It does not make the database writes and Kafka send atomic. If domain persistence succeeds and the JaVers commit fails, current state can exist without audit history. If both succeed and publication fails, no projection event is delivered. If the consumer fails after Redis changes but before offset progress, it may apply the event again. `OrderMarkedPaid` also requires an existing summary, so missing or reordered `OrderPlaced` fails instead of repairing automatically.

Production systems should add a transactional outbox or equivalent recovery record, stable event IDs, idempotent projection writes, controlled offset commits, dead-letter/retry policy, replay tools, and reconciliation between domain state, audit history, and Redis. `javers-ddd` helps this JaVers workflow; it is not the generic DDD contract owner for bluetape4k.

Continue with [failure contracts](/manual/bluetape4k-javers/1.0/operations/failure-contracts/) and [testing](/manual/bluetape4k-javers/1.0/guides/testing/).
