---
slug: "manual/bluetape4k-text/0.2/quality/aho-corasick-benchmarks"
title: "Aho-Corasick benchmarks"
manual:
  id: "quality/aho-corasick-benchmarks"
  repository: "bluetape4k-text"
  group: "overview"
  kind: "guide"
  sourceCommit: "5bdcab0887cf27ce79348d08e64db6d196b9cc89"
  sourcePath: "docs/manual/en/quality/aho-corasick-benchmarks.md"
  minorVersion: "0.2"
  releaseRef: "0.2.1"
  releaseCommit: "2db7671afad20045afdcb5793c0113b8b23b972b"
  sourceDir: "docs/manual"
  layer: "build"
---


The 0.2.1 baseline records JMH throughput snapshots for large dictionaries, dense matches, no-match text, Flow collection, a naive small-dictionary comparison, and NFKC normalization. Higher `ops/s` is better.

## Recorded environment

| Item | Value |
|---|---|
| command | `./gradlew :text-search:benchmark` |
| host | Apple M4 Pro, 48 GiB memory |
| JVM | GraalVM JDK 21.0.11 |
| mode | throughput, 1 thread, 1 fork |
| warmup | 2 × 1 second |
| measurement | 5 × 1 second |

## Baseline results

| Benchmark | Ops/s | What it exercises |
|---|---:|---|
| `parseTextNoMatch` | 12,209.23 | 5,000-keyword automaton with no matches |
| `parseTextDenseMatches` | 3,566.90 | dense overlapping candidate matches |
| `parseTextLargeDictionary` | 3,116.99 | 5,000 keywords and 2,000 matched tokens |
| `matchesAsFlowLargeDictionaryCollect` | 712.62 | Flow collection over the large dictionary input |
| `naiveContainsSmallDictionary` | 248.39 | sequential `String.contains` over 1,000 keywords |
| `parseTextNfkcNormalization` | 3.68 | NFKC and case-insensitive normalization path |

The NFKC result demonstrates why normalization should be an explicit requirement rather than a default applied without measurement. It is not directly comparable to the raw no-match case as an algorithm ranking because the work differs.

## Interpret correctly

These values are local comparable snapshots, not production rankings. Compare a later result only when benchmark source, fixture sizes, command, JDK, hardware class, forks, warmup, measurement, and `ops/s` direction remain compatible.

The naive small-dictionary case is a reference workload, not proof that every application gains the same factor. Construction cost and memory are outside these throughput values; measure them separately when automatons change frequently.

## Re-run

```bash
./gradlew :text-search:benchmark
```

Keep the raw JSON. Report the score and error range, explain material fixture changes, and avoid merging values from different environments into one trend line.

## Choose an API with evidence

Use regular search methods for immediate in-memory results. Use Flow for pipeline and cancellation semantics, understanding that the recorded collection path has additional overhead. Enable normalization only for a demonstrated Unicode equivalence requirement.

Continue with the [Text search module](/manual/bluetape4k-text/0.2/modules/text-search/), [search example](/manual/bluetape4k-text/0.2/examples/text-search-examples/), and [startup and memory](/manual/bluetape4k-text/0.2/operations/startup-and-memory/).

## Source evidence

- [Raw baseline JSON](https://github.com/bluetape4k/bluetape4k-text/blob/0.2.1/docs/benchmark/2026-06-04-issue-97-ahocorasick-baselines.json)
- [Benchmark source](https://github.com/bluetape4k/bluetape4k-text/blob/0.2.1/text-search/src/benchmark/kotlin/io/bluetape4k/text/search/benchmark/AhoCorasickBenchmark.kt)
