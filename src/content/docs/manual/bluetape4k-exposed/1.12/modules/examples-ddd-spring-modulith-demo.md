---
slug: "manual/bluetape4k-exposed/1.12/modules/examples-ddd-spring-modulith-demo"
manualId: "examples-ddd-spring-modulith-demo"
id: "examples-ddd-spring-modulith-demo"
title: "DDD Spring Modulith Demo"
locale: "en"
kind: "example"
gradlePath: ":examples-ddd-spring-modulith-demo"
sourceDir: "examples/ddd-spring-modulith-demo"
releaseRef: "1.12.1"
artifact: null
manual:
  id: "examples-ddd-spring-modulith-demo"
  repository: "bluetape4k-exposed"
  group: "example"
  kind: "example"
  sourceCommit: "6bff7d9939243d166e212ce840ee90261e7239c7"
  sourcePath: "docs/manual/en/modules/examples-ddd-spring-modulith-demo.md"
  minorVersion: "1.12"
  releaseRef: "1.12.1"
  releaseCommit: "4cc2cce07087241ec24a597d8464615434ea2b81"
  sourceDir: "examples/ddd-spring-modulith-demo"
  layer: "learn"
---


This runnable Spring Boot example keeps order acceptance, event publication, and shipping reservation in named application modules. It demonstrates a DDD-style boundary using Exposed persistence without making the shared contracts depend on Spring or JaVers types.

## What to inspect

The `orders` module accepts an order and publishes `OrderAcceptedEvent` through its named events interface. The `shipping` module consumes that public event with a stable listener and persists a reservation. `modulithinvalid` deliberately contains an invalid dependency so Spring Modulith verification has a negative case to detect.

The concrete tables are `DDD_MODULITH_ORDERS`, `EVENT_PUBLICATION`, and `DDD_MODULITH_SHIPPING_RESERVATIONS`.

## Run the verification

```bash
./gradlew :examples-ddd-spring-modulith-demo:test --no-configuration-cache --no-daemon --console=plain
```

The tests verify module structure as well as the order-to-shipping flow. Read the invalid package alongside the valid module interfaces to see which dependency direction the verifier protects.

## Boundary rules

- Publish stable event DTOs from an explicitly named interface package.
- Consume events through `@ApplicationModuleListener` with a stable listener id.
- Make replay-sensitive writes idempotent by a business key such as `orderId`; shipping checks whether a reservation already exists.
- Keep aggregate and event contracts Spring-neutral. Spring Modulith supplies lifecycle integration in this example, not the domain type system.
- Keep JDBC persistence inside the owning transaction boundary; do not let another module reach into an internal repository.

## Learning path

Start with `orders`, follow `OrderAcceptedEvent` into `shipping`, then inspect `ShippingReservationRepository` and its schema initializer. Finally run the structure tests and study `modulithinvalid` as the intentionally rejected arrangement.

## Problem

The example shows how to keep domain events and module boundaries explicit while persistence and application orchestration evolve independently.

## When to use it

Use it as a small Spring Modulith verification fixture or as a reference for an order-to-shipping event flow. It is not a production deployment template.

## Coordinates

This is an example application and does not publish a library artifact. Run its Gradle test task from the repository root.

## Core concepts

Named interfaces expose stable events; internal repositories and invalid module dependencies remain private to their owning module.

## Quick start

Run `./gradlew :examples-ddd-spring-modulith-demo:test --no-configuration-cache --no-daemon --console=plain` and inspect the structure and flow test reports.

## API by task

- Publish `OrderAcceptedEvent` through the named events interface.
- Consume it with `@ApplicationModuleListener`.
- Persist the shipping reservation through its internal repository.

## Recommended patterns

Keep event DTOs stable, use business-key idempotency for replay-sensitive writes, and keep aggregate contracts independent of framework types.

## Integrations

Spring Modulith supplies module verification and event lifecycle integration; Exposed owns JDBC persistence inside the application transaction boundary.

## Configuration

Configure the test database and Spring application context through the example's Gradle and test-resource settings. Keep production credentials outside this fixture.

## Failure modes

The structure test must reject `modulithinvalid`. Duplicate event delivery and persistence conflicts should be handled by the business key and transaction boundary.

## Operations

Observe event publication, listener completion, reservation writes, and verification failures separately. Record correlation identifiers when adapting the flow to a service.

## Testing

Run the Gradle test task and read both module-structure failures and order-to-shipping flow assertions.

## Workshops and learning path

Read `orders`, follow `OrderAcceptedEvent` into `shipping`, then compare the valid modules with `modulithinvalid`.

## Limitations

The example does not define a production messaging topology, retry policy, deployment model, or cross-service consistency guarantee.

## Sources

- [`DddSpringModulithDemoApplication`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.12.1/examples/ddd-spring-modulith-demo/src/main/kotlin/io/bluetape4k/exposed/examples/modulith/DddSpringModulithDemoApplication.kt)
- [`OrderAcceptedEvent`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.12.1/examples/ddd-spring-modulith-demo/src/main/kotlin/io/bluetape4k/exposed/examples/modulith/orders/events/OrderAcceptedEvent.kt)
- [`ShippingReservationRepository`](https://github.com/bluetape4k/bluetape4k-exposed/blob/1.12.1/examples/ddd-spring-modulith-demo/src/main/kotlin/io/bluetape4k/exposed/examples/modulith/shipping/internal/ShippingReservationRepository.kt)
