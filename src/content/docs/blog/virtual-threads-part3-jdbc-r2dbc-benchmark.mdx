---
title: "Virtual Threads Part 3: Why JDBC Beat R2DBC More Often Than Expected"
description: A practical benchmark story from bluetape4k-exposed showing when JDBC with virtual threads can beat R2DBC with coroutines.
sidebar:
  order: -202605291102
blog:
  date: 2026-05-29T11:02:00+09:00
  image: /assets/virtual-threads-part3-hero.png
  imageAlt: Editorial illustration of JDBC work running on virtual threads beside reactive database work
  cardDescription: "R2DBC looked like the obvious winner, but the benchmark results disagreed. A practical look at JDBC + Virtual Threads."
---

<figure class="bt4k-blog-hero">
  <img src="/assets/virtual-threads-part3-hero.png" alt="Editorial illustration of JDBC work running on virtual threads beside reactive database work" loading="eager" />
  <figcaption>Database performance is often decided at the connection, transaction, and backpressure boundaries.</figcaption>
</figure>

<p class="bt4k-post-meta">2026-05-29 · Virtual Threads series · Part 3</p>

This is Part 3 of the Virtual Threads series. The full series continues with
[Part 1: introduction and cautions](/blog/virtual-threads-part1-guide/),
[Part 2: workshop rules](/blog/virtual-threads-part2-workshop-rules/),
[Part 3: JDBC + Virtual Threads benchmark](/blog/virtual-threads-part3-jdbc-r2dbc-benchmark/), and
[Part 4: Java 21/25 SPI design](/blog/virtual-threads-part4-java21-java25-spi/).

Part 1 framed Virtual Threads as "threads that make waiting-heavy work easier to express," not
as "faster threads." Now we can ask a more practical question.

> If we already have R2DBC + Coroutines, can JDBC + Virtual Threads really win?

In the `bluetape4k-exposed` benchmarks, the answer leaned in one direction. I expected R2DBC to
look stronger: it is non-blocking, and Coroutines make the API pleasant. The measurements were
less sentimental. General CRUD/JOIN benchmarks improved substantially when the JDBC path was
tuned around pool size and indexes, and batch benchmarks often favored JDBC + Virtual Threads
over R2DBC + Coroutines for the same workload.


This chart isolates a large end-to-end batch job with `dataSize=100000` and `parallelism=8`.
Blue bars are JDBC + Virtual Threads, orange bars are R2DBC + Coroutines. Under the same pool
size, MySQL showed about 8.4-8.8x difference and PostgreSQL about 4.9-5.2x.

<figure class="bt4k-architecture">
  <img src="/assets/virtual-threads-part3-benchmark-01.png" alt="Benchmark summary comparing JDBC with virtual threads and R2DBC with coroutines" loading="lazy" />
  <figcaption>R2DBC looked like the obvious winner, but the benchmark results disagreed. A practical look at JDBC + Virtual Threads.</figcaption>
</figure>

## First, the General Exposed JDBC Benchmark

Looking only at batch results would make the conclusion too narrow. `bluetape4k-exposed` also
has a general CRUD/JOIN benchmark, `ExposedJdbcBenchmark`, under
`exposed/exposed-jdbc/src/test/kotlin/.../ExposedJdbcBenchmark.kt`.

It measures five methods on PostgreSQL Testcontainers through `kotlinx-benchmark`/JMH.

| Method | Meaning |
|---|---|
| `singleInsert` | Single-row INSERT |
| `singleFindById` | Primary-key SELECT |
| `singleUpdate` | Single-row UPDATE |
| `joinQuery` | users/orders JOIN query |
| `batchInsert` | 100-row batch INSERT |

The initial total was `25,400.673 ops/sec`. A self-improve loop adjusted HikariCP and benchmark
thread count, then added indexes for the JOIN target table.

| Step | Total throughput |
|---|---:|
| Baseline | 25,400 ops/sec |
| HikariCP max=24, minIdle=8, `@Threads(14)` | 43,487 ops/sec |
| Add orders-table index | 44,161 ops/sec |
| Highest point after stronger measurement settings | 45,431 ops/sec |

This is not a direct JDBC-vs-R2DBC comparison. It is evidence that the ordinary Exposed JDBC
path is sensitive to pool size, thread concurrency, and index design. In other words: measure
the basic path before assuming Virtual Threads will rescue anything. A more aggressive
`synchronous_commit=off` style tuning was rejected because it improved some inserts while
hurting SELECTs badly. A good benchmark cannot make one number pretty while damaging the whole
workload.

The benchmark method is intentionally ordinary.

```kotlin
@Benchmark
@Threads(14)
open fun singleFindById(): Int {
    val pk = (findIdSeq.getAndIncrement() % SEED_USERS) + 1
    return transaction(database) {
        BenchmarkUsers
            .selectAll()
            .where { BenchmarkUsers.id eq pk }
            .count()
            .toInt()
    }
}
```

## JDBC vs R2DBC Batch Comparison

The direct comparison lives in `bluetape4k-exposed/utils/batch/benchmark`.

| Axis | Value |
|---|---|
| Databases | H2, MySQL, PostgreSQL |
| JDBC path | JDBC + Virtual Threads |
| R2DBC path | R2DBC + Coroutines |
| Scenarios | `seedBenchmark`, `endToEndBatchJobBenchmark` |
| Parameters | `dataSize = 1000/10000/100000`, `poolSize = 10/30/60`, `parallelism = 1/4/8` |

Entrypoints look like this.

```bash
./gradlew :exposed-batch:mysqlJdbcBenchmark
./gradlew :exposed-batch:mysqlR2dbcBenchmark

./gradlew :exposed-batch:postgresJdbcBenchmark
./gradlew :exposed-batch:postgresR2dbcBenchmark
```

The meaning is not "JDBC is always better." It is narrower and more useful.

- The workload is batch insert and batch job oriented.
- The comparison includes actual Exposed/JDBC and Exposed/R2DBC implementation cost.
- It is not a coroutine microbenchmark.
- Driver maturity and DB-specific protocol paths are part of the result.

That makes it an application-facing end-to-end comparison.

## Result Summary

By `ops/sec`, JDBC won this many combinations.

| DB | Comparisons | JDBC wins | R2DBC wins | Large batch E2E parallelism=8 |
|---|---:|---:|---:|---|
| MySQL | 36 | 36 | 0 | JDBC about 8.4-8.8x |
| PostgreSQL | 36 | 33 | 3 | JDBC about 4.9-5.2x |
| H2 | 36 | 36 | 0 | JDBC strongly ahead, but in-memory caveat applies |

The MySQL seed benchmark was especially wide. At `dataSize=100000`, JDBC reached about
`1.455 ops/sec`; R2DBC was about `0.050 ops/sec`, roughly a 29x difference.

For the large end-to-end job, the result is easier to read.

| DB | poolSize | JDBC ops/sec | R2DBC ops/sec | JDBC/R2DBC |
|---|---:|---:|---:|---:|
| MySQL | 10 | 1.596 | 0.181 | 8.8x |
| MySQL | 30 | 1.561 | 0.182 | 8.6x |
| MySQL | 60 | 1.525 | 0.182 | 8.4x |
| PostgreSQL | 10 | 0.972 | 0.192 | 5.1x |
| PostgreSQL | 30 | 0.990 | 0.192 | 5.2x |
| PostgreSQL | 60 | 0.951 | 0.193 | 4.9x |

PostgreSQL pointed the same way. JDBC won 33 of 36 combinations, and in the large end-to-end
job with `parallelism=8` it was about 5x higher than R2DBC.

H2 was even more extreme, but H2 is in-memory and should not be treated as a direct network DB
lesson. It is better read as a supporting signal: when JDBC overhead is low, Virtual Threads can
drive a simple path very effectively.

## Why Did This Happen?

R2DBC + Coroutines looks more modern on paper. It wraps callbacks in suspend APIs, uses fewer
threads, and multiplexes more work through non-blocking I/O. That is real. It is also not the
only cost in a batch workload.

| Cost | Explanation |
|---|---|
| driver maturity | JDBC batch paths have been tuned for a long time |
| protocol round-trip | non-blocking does not remove round-trips |
| mapping overhead | reactive stream/suspend bridge cost is part of end-to-end time |
| backpressure granularity | row-level backpressure can be excessive for batch jobs |
| connection pool behavior | DB concurrency is still bounded by connections and server capacity |

Virtual Threads help because the JDBC call may block, but it does not block an expensive
platform thread. That lets us keep the fast JDBC batch path and still raise concurrency.

```kotlin
Executors.newVirtualThreadPerTaskExecutor().use { executor ->
    partitions.forEach { partition ->
        executor.submit {
            transaction {
                processPartition(partition)
            }
        }
    }
}
```

The code does not look special. That is a feature. Transaction boundaries, exceptions, stack
traces, and profilers still look familiar.

## Similar Direction to Coroutine Performance Gains

Virtual Threads and Coroutines solve a related problem: work that is waiting should not tie up
expensive carrier resources for too long. That is why they can both improve I/O-heavy workloads.

The implementation tradeoffs differ.

| Aspect | Coroutines | Virtual Threads |
|---|---|---|
| API shape | `suspend` propagates through the API | Blocking APIs can stay |
| DB access | Fits async drivers such as R2DBC | Fits blocking drivers such as JDBC |
| tooling | Coroutine debugger/context matters | Thread dumps/JFR/thread stacks remain familiar |
| migration | API surface changes | Call stacks change less |

What the `bluetape4k-exposed` benchmark made clear is that "async is theoretically more
scalable" is not enough. Driver and workload matter. In this batch workload, JDBC + Virtual
Threads was both simpler and faster.

## When R2DBC Still Fits

This is not an argument to delete R2DBC. It is the better fit in plenty of cases.

- The whole stack is already reactive or suspend-first.
- Streaming responses and backpressure are core domain concerns.
- The database driver's R2DBC path is fast for the actual workload.
- Reactive pipeline observability is more familiar than thread-per-request observability.
- Transactions are short and rows should be processed as a stream.

But "R2DBC must be faster" is no longer a safe assumption. For batch, insert-heavy, or
transaction-heavy workloads, JDBC + Virtual Threads deserves a measurement.

## Practical Rule

My rule from this result is:

| Situation | Try first |
|---|---|
| legacy JDBC code already exists | JDBC + Virtual Threads |
| many batch inserts/updates | JDBC + Virtual Threads benchmark |
| service API is suspend-first | R2DBC + Coroutines |
| streaming/backpressure is central | R2DBC + Coroutines |
| performance claim matters | Measure both on the same workload |

Virtual Threads put JDBC back into the "worth measuring" category. The JDBC retirement party can
wait a little longer. For Kotlin/JVM backend services, that is very practical: you can keep
existing blocking code and improve throughput without converting every API to `suspend`.

Part 4 shows how to expose that choice as a library API. Java 21 and Java 25 both belong to the
Virtual Threads era, but their available APIs differ, so `bluetape4k-projects` separates common
API from JDK-specific implementations.
