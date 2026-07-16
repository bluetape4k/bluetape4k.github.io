---
slug: "manual/bluetape4k-javers/0.2/guides/learning-path"
title: "Learning path"
manual:
  id: "guides/learning-path"
  repository: "bluetape4k-javers"
  group: "overview"
  kind: "guide"
  sourceCommit: "37423566ffd4f389ce3e85c573ed8348bbeaff2c"
  sourcePath: "docs/manual/en/guides/learning-path.md"
  minorVersion: "0.2"
  releaseRef: "0.2.1"
  releaseCommit: "bffe19439ca891fa5301a76421bdef7ba75252a0"
  sourceDir: "docs/manual"
  layer: "build"
---


The shortest useful route depends on what you must build or operate.

## Application developer

Start with [getting started](/manual/bluetape4k-javers/0.2/getting-started/) to create one durable repository. Then read [the audit model](/manual/bluetape4k-javers/0.2/architecture/audit-model/) to distinguish snapshots from application rows and shadows from live entities. Finish with [DDD and CQRS](/manual/bluetape4k-javers/0.2/guides/ddd-and-cqrs/): you will see the exact persistence, audit, publication, and projection order and the gaps a production outbox must close.

## Persistence integrator

Read [repository map](/manual/bluetape4k-javers/0.2/architecture/repository-map/), then [persistence selection](/manual/bluetape4k-javers/0.2/persistence/selection-guide/). The Exposed page teaches schema and transaction ownership; the Redis page separates Lettuce and Redisson; the Kafka page makes the write-only contract explicit. Finish with [failure contracts](/manual/bluetape4k-javers/0.2/operations/failure-contracts/) to define retry and reconciliation before wiring two destinations.

## Operator or test engineer

Begin with [observability](/manual/bluetape4k-javers/0.2/operations/observability/) to identify commit failures, query cost, Kafka lag, and projection drift. [Testing](/manual/bluetape4k-javers/0.2/guides/testing/) then maps those risks to unit, database, and Testcontainers checks. The example's [`OrderProjectionFlowTest`](https://github.com/bluetape4k/bluetape4k-javers/blob/bffe19439ca891fa5301a76421bdef7ba75252a0/examples/javers-exposed-ddd/src/test/kotlin/io/bluetape4k/javers/examples/exposedddd/OrderProjectionFlowTest.kt) is the executable end-to-end reference.

For background facilities, continue to the published [Projects manual](https://bluetape4k.github.io/manual/bluetape4k-projects/) and [Exposed manual](https://bluetape4k.github.io/manual/bluetape4k-exposed/). Their generic repository, transaction, Redis, Kafka, and Testcontainers contracts are intentionally not duplicated here.
