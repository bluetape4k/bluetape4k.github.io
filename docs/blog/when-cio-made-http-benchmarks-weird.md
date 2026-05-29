---
title: "When Ktor CIO Made HTTP Benchmarks Weird"
description: A benchmark-backed story about io/http client tuning, the Vert.x pool bottleneck, and why Ktor CIO's disappointing first numbers were still useful.
sidebar:
  order: -202605290852
blog:
  date: 2026-05-29T08:52:00+09:00
  image: /assets/io-http-cio-hero.png
  imageAlt: Editorial illustration of HTTP clients running through the same benchmark harness
  cardDescription: How disappointing Ktor CIO numbers led to a fairer benchmark, a Vert.x pool fix, and workload-based HTTP client guidance.
---

<figure class="bt4k-blog-hero">
  <img src="/assets/io-http-cio-hero.png" alt="Editorial illustration of HTTP clients running through the same benchmark harness" loading="eager" />
  <figcaption>The same HTTP abstraction can hide very different bottlenecks under each client implementation.</figcaption>
</figure>

<p class="bt4k-post-meta">2026-05-29 · bluetape4k io/http benchmark note</p>

The `io/http` module in `bluetape4k-projects` lets several HTTP clients sit behind one
abstraction. Apache HC5, OkHttp3, Java `HttpClient`, Vert.x WebClient, and Ktor CIO can be
used through the same API.

For a library like this, the most dangerous sentence is "just pick the one you like." In
practice, connection reuse, coroutine bridges, virtual threads, server fixtures, and pool
settings all behave differently by workload. That is why issue
[#589](https://github.com/bluetape4k/bluetape4k-projects/issues/589) was less a tuning ticket
and more a small campaign: decide with numbers.

And in the first run, Ktor CIO produced numbers that looked almost absurd.

![HTTP client base throughput chart](/assets/io-http-base-throughput-chart-01.png)

<figure class="bt4k-architecture">
  <img src="/assets/io-http-high-latency-throughput-chart-01.png" alt="HTTP client high-latency throughput benchmark chart comparing OkHttp, HC5, Java HttpClient, Vert.x, and Ktor CIO" loading="lazy" />
  <figcaption>How disappointing Ktor CIO numbers led to a fairer benchmark, a Vert.x pool fix, and workload-based HTTP client guidance.</figcaption>
</figure>

## At First, CIO Was Painfully Slow

The first time I added the Ktor CIO row, it did not feel good. It showed 659.071 ops/s on
`/ping` and 16.501 ops/s on the 50 ms delay endpoint. Other clients in the same benchmark were
far ahead, so the table almost read like: "why did we even include this?"

But that was not a fair conclusion. When CIO was run with the full JMH concurrency, the local
Docker fixture exhausted ephemeral ports first. The CIO row had therefore been limited to one
thread while other rows used the class-level thread count. It was in the same table, but it was
not playing by the same rules.

So the point of issue [#587](https://github.com/bluetape4k/bluetape4k-projects/issues/587) was
not "make CIO look fast." It was "measure CIO under the same conditions." Instead of deleting
the disappointing result, we recorded why it was disappointing and fixed the fixture.

## The First Win Was Vert.x

The most dramatic change in issue
[#590](https://github.com/bluetape4k/bluetape4k-projects/issues/590) and
PR [#593](https://github.com/bluetape4k/bluetape4k-projects/pull/593) was not Ktor. It was
Vert.x.

The Vert.x WebClient benchmark was being capped by the default HTTP/1 pool. The benchmark was
not measuring what the client could do; it was measuring a bottleneck created by the fixture and
default pool settings. Once `PoolOptions` was made explicit, high-latency throughput moved from
87.844 ops/s to 1,818.508 ops/s. That is about 20.7x.

That sounds like an optimization story, but the real lesson is simpler.

> A slow benchmark is not always slow because production code is slow. The measurement rig has
> to be suspected first.

## Same Server, Same Concurrency

PR [#594](https://github.com/bluetape4k/bluetape4k-projects/pull/594) cleaned up the measuring
conditions.

- The HTTP client benchmark fixture was moved to `BluetapeWebfluxServer`.
- The one-thread exception for CIO was removed.
- Every row used the class-level JMH thread count.
- To avoid local port exhaustion, the benchmark used short equal-thread snapshots: one second of
  warmup and one second of measurement.

I like this decision because it did not manufacture a "CIO won" conclusion. It exposed CIO's
limits directly. Ktor CIO 3.5 opens HTTP/1 connections aggressively when pipelining is disabled,
and forcing `pipelining=true` in the local mock fixture caused
`ClosedReadChannelException: unexpected EOF` or hangs. So this post does not overstate the
result either. We kept the default CIO behavior and compared it briefly under the same
concurrency.

## Final Snapshot

The base `/ping` benchmark is sensitive to connection reuse and local variance. It should be
read as a same-fixture snapshot, not as a production ranking.

| Client row | `/ping` ops/s |
|---|---:|
| Java `HttpClient` sync | 7,276.492 |
| HC5 classic virtual thread | 7,246.690 |
| OkHttp3 virtual thread | 6,955.796 |
| Vert.x WebClient coroutines | 6,043.906 |
| Ktor CIO coroutines | 2,052.281 |

The high-latency endpoint is more interesting. With a 50 ms delay, the benchmark starts to look
more like service wait time than a simple CPU loop.


| Client row | 50 ms delay ops/s |
|---|---:|
| OkHttp3 virtual thread | 1,902.171 |
| HC5 classic virtual thread | 1,888.018 |
| Java `HttpClient` virtual thread | 1,883.634 |
| HC5 classic | 1,880.023 |
| HC5 async coroutines | 1,860.655 |
| Vert.x WebClient coroutines | 1,859.003 |
| Ktor CIO coroutines | 1,515.026 |
| HC5 classic coroutines | 1,216.306 |

CIO is still not at the top. But it is a different story from the original 16.501 ops/s "this
must be broken" result. Under fairer conditions it reached 1,515.026 ops/s, while still leaving
open questions around connection behavior and fixture compatibility.

## The Selection Rules We Got

After this benchmark, choosing an `io/http` client became harder to hand-wave. At minimum, we
have these starting points.

| Situation | Start with |
|---|---|
| Short local calls, sync API, simple usage | Java `HttpClient`, HC5 classic |
| Wait-heavy HTTP workload | OkHttp3/HC5/Java virtual-thread paths |
| Coroutine-native integration and non-blocking client matter most | HC5 async, Vert.x WebClient |
| Ktor-stack integration matters more | Ktor CIO, but remeasure long-run capacity with a dedicated fixture |

The point is not "one fastest client." What `io/http` should provide is a set of measured paths
that can be selected by workload. This work made that API surface much more useful.

## What Was Better Than the Numbers

Personally, the best result was not the 20x Vert.x improvement, and it was not a CIO redemption
story. It was the choice to question the benchmark fixture before changing implementation code.

When I first saw the CIO numbers, I was disappointed. My first reaction was close to: "we added
Ktor 3 and this is what we get?" That embarrassment forced us to look at the measuring
conditions, and the final record became much better because of it.

- [#589](https://github.com/bluetape4k/bluetape4k-projects/issues/589): benchmark-driven HTTP component performance epic
- [#590](https://github.com/bluetape4k/bluetape4k-projects/issues/590): benchmark-gated self-improve track
- [#587](https://github.com/bluetape4k/bluetape4k-projects/issues/587): Ktor CIO benchmark inclusion and fair comparison
- [PR #593](https://github.com/bluetape4k/bluetape4k-projects/pull/593): Vert.x pool tuning and initial CIO rows
- [PR #594](https://github.com/bluetape4k/bluetape4k-projects/pull/594): WebFlux fixture and equal-thread CIO comparison
- [Benchmark report](https://github.com/bluetape4k/bluetape4k-projects/blob/develop/docs/benchmarks/2026-05-21-io-http-client-benchmark.md)

A benchmark is not only a tool for proving "my code is fast." Sometimes it tells you, "do not
trust the number you just saw." This `io/http` work was closer to the second kind, and that made
it more useful.
