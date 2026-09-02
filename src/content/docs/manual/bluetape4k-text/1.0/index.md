---
slug: "manual/bluetape4k-text/1.0"
title: "bluetape4k-text 0.2 Manual"
manual:
  id: "index"
  repository: "bluetape4k-text"
  group: "overview"
  kind: "guide"
  sourceCommit: "59256aea7011d3f9073d74470459a13363150153"
  sourcePath: "docs/manual/bluetape4k-text/en/index.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "59256aea7011d3f9073d74470459a13363150153"
  sourceDir: "docs/manual/bluetape4k-text"
  layer: "build"
---


`bluetape4k-text` is a Kotlin/JVM toolkit for Korean and Japanese tokenization, language detection, dictionary-backed filtering, and multi-pattern text search. This manual documents the stable `1.0.0` release and organizes the library by the problem you need to solve rather than by repository directory alone.

![Repository learning map](/manual-assets/bluetape4k-text/1.0/overview/repository-learning-map.png)

## Core capabilities

| I need to… | Start with | Learn by running |
|---|---|---|
| normalize, tokenize, stem, or extract phrases from Korean | [Korean tokenizer](/manual/bluetape4k-text/1.0/modules/tokenizer-korean/) | [Tokenizer safety example](/manual/bluetape4k-text/1.0/examples/tokenizer-safety-examples/) |
| tokenize Japanese and inspect parts of speech | [Japanese tokenizer](/manual/bluetape4k-text/1.0/modules/tokenizer-japanese/) | [Tokenizer safety example](/manual/bluetape4k-text/1.0/examples/tokenizer-safety-examples/) |
| detect one or several languages in a text | [Lingua](/manual/bluetape4k-text/1.0/modules/lingua/) | [Lingua example](/manual/bluetape4k-text/1.0/examples/lingua-examples/) |
| remove domain-specific blockwords with managed dictionaries | [Dictionaries and blockwords](/manual/bluetape4k-text/1.0/guides/dictionaries-and-blockwords/) | [Tokenizer safety example](/manual/bluetape4k-text/1.0/examples/tokenizer-safety-examples/) |
| find many keywords in one pass | [Text search](/manual/bluetape4k-text/1.0/modules/text-search/) | [Text search example](/manual/bluetape4k-text/1.0/examples/text-search-examples/) |
| build a custom tokenizer or request boundary | [Tokenizer core](/manual/bluetape4k-text/1.0/modules/tokenizer-core/) | [Input safety](/manual/bluetape4k-text/1.0/guides/input-safety/) |
| align every Text artifact version | [Text BOM](/manual/bluetape4k-text/1.0/modules/bluetape4k-text-bom/) | [Getting started](/manual/bluetape4k-text/1.0/getting-started/) |

If you are not sure which path applies, use the [capability selection guide](/manual/bluetape4k-text/1.0/guides/capability-selection/). It compares detection, tokenization, filtering, and search as separate capabilities that can be composed when needed.

## Build

The shortest route to a working program is [Getting started](/manual/bluetape4k-text/1.0/getting-started/). It shows dependency management through `bluetape4k-dependencies`, the Text-only BOM alternative, and a small Korean tokenization example.

The repository contains six published artifacts. The BOM aligns five runtime libraries; it does not provide runtime classes itself. See the [repository map](/manual/bluetape4k-text/1.0/architecture/repository-map/) before selecting dependencies for a larger service.

## Learn

The [learning path](/manual/bluetape4k-text/1.0/guides/learning-path/) is more than a list of links. Each stage explains what to learn, which runnable example to execute, what result to inspect, and when to continue:

1. build and call one processor;
2. choose between script filtering and statistical language detection;
3. understand Korean and Japanese processor boundaries;
4. build an immutable Aho-Corasick automaton;
5. add request, memory, and failure controls.

Detailed module pages include the smallest useful code, result interpretation, selection rules, constraints, and links to stable source. The three example pages explain how to modify the repository examples instead of merely pointing at their directories.

## Operate

Text processing is not free. Language models, tokenizer dictionaries, and search automatons have different startup and memory profiles. Read [runtime boundaries](/manual/bluetape4k-text/1.0/architecture/runtime-boundaries/), [startup and memory](/manual/bluetape4k-text/1.0/operations/startup-and-memory/), and [failure contracts](/manual/bluetape4k-text/1.0/operations/failure-contracts/) before placing them behind an HTTP endpoint.

The [quality gates](/manual/bluetape4k-text/1.0/quality/quality-gates/) page separates deterministic repository evidence from claims the release does not make. The [Aho-Corasick benchmark](/manual/bluetape4k-text/1.0/quality/aho-corasick-benchmarks/) records the exact local run conditions and explains why those values are comparison snapshots, not production rankings.

## Version and source

This manual covers minor line `0.2` and is pinned to stable release `1.0.0` at commit `59256aea7011d3f9073d74470459a13363150153`. Source links point to that release, so future development does not silently change the contract described here.

- [Release README](https://github.com/bluetape4k/bluetape4k-text/blob/1.0.0/README.md)
- [Release settings](https://github.com/bluetape4k/bluetape4k-text/blob/1.0.0/settings.gradle.kts)
