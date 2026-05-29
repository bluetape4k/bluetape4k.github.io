# Virtual Threads blog series

## Context

Published a four-part Korean blog series about Java Virtual Threads:
introduction and production cautions, `bluetape4k-workshop/virtualthreads/rules`
examples, `bluetape4k-exposed` JDBC/R2DBC benchmark evidence, and Java 21/25 SPI
design in `bluetape4k-projects`.

## Decision

Split the topic into four focused posts instead of one long article:

- Part 1: concept, suitability, and operational cautions.
- Part 2: workshop rules with code examples for pooling, semaphores, ScopedValue, and locks.
- Part 3: benchmark-driven JDBC + Virtual Threads vs R2DBC + Coroutines story.
- Part 4: Java 21/25 common API and `ServiceLoader` runtime-provider design.

## Evidence

- OpenJDK JEP 444 for Java 21 Virtual Threads.
- OpenJDK JEP 491 for synchronized-without-pinning behavior carried into newer JDKs.
- OpenJDK JDK 25 feature list and JEP 506 for Scoped Values.
- `bluetape4k-exposed/utils/batch/benchmark` results for H2, MySQL, and PostgreSQL.
- `bluetape4k-projects/virtualthread` API README and source summaries.

## Future Rule

When writing performance or runtime-version posts, keep claims scoped to the
measured workload and include a short code path or command that shows how the
claim was verified.
