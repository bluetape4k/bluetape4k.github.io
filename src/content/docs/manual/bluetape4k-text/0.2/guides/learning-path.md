---
slug: "manual/bluetape4k-text/0.2/guides/learning-path"
title: "Learning path"
manual:
  id: "guides/learning-path"
  repository: "bluetape4k-text"
  group: "overview"
  kind: "guide"
  sourceCommit: "1d28940432ea5dc3e8f608577682f76b357e4f7e"
  sourcePath: "docs/manual/en/guides/learning-path.md"
  minorVersion: "0.2"
  releaseRef: "0.2.1"
  releaseCommit: "2db7671afad20045afdcb5793c0113b8b23b972b"
  sourceDir: "docs/manual"
  layer: "build"
---


This path turns the repository into a sequence of observable results. Each stage tells you what to learn, what to run, and what should be true before you continue.

## Stage 1: first result in 15 minutes

Read [Getting started](/manual/bluetape4k-text/0.2/getting-started/) and run one Korean normalization and tokenization call.

You should be able to explain:

- why a runtime module is still required after importing a BOM;
- why structured tokens are more useful than strings for later analysis;
- where blank and oversized text should be rejected.

Continue when the example produces `안돼ㅋㅋㅋ` and `[주말, 특가, 쇼핑몰]`, and your build has no hard-coded Text module version when a BOM already manages it.

## Stage 2: choose a language route

Read [Lingua](/manual/bluetape4k-text/0.2/modules/lingua/) and [mixed-language processing](/manual/bluetape4k-text/0.2/guides/mixed-language-processing/), then run the [Lingua example](/manual/bluetape4k-text/0.2/examples/lingua-examples/).

Inspect three decisions in the example:

1. the detector is built once and reused;
2. the supported language set is explicit;
3. low-accuracy mode is a separate detector choice, not a transparent optimization.

Continue when you can state how your service handles unknown, ambiguous, and mixed input. If a Unicode script check fully answers your route, you do not need a statistical detector for that decision.

## Stage 3: analyze Korean and Japanese

Read the [Korean](/manual/bluetape4k-text/0.2/modules/tokenizer-korean/) and [Japanese](/manual/bluetape4k-text/0.2/modules/tokenizer-japanese/) module pages. Compare their smallest examples, then inspect the [tokenizer safety example](/manual/bluetape4k-text/0.2/examples/tokenizer-safety-examples/).

Learn the difference between:

- normalization and tokenization;
- surface text and POS-aware token data;
- application dictionary policy and packaged dictionaries;
- a valid request and a successful processor call.

Continue when tests assert stable user-visible token surfaces without coupling every assertion to internal morphological choices.

## Stage 4: search many patterns

Read [Text search](/manual/bluetape4k-text/0.2/modules/text-search/), then run the [text search example](/manual/bluetape4k-text/0.2/examples/text-search-examples/). Change one keyword value and observe the builder result, DSL result, replacement text, and first Flow alert.

Continue when you can choose between `parseText`, `containsMatch`, `firstMatch`, `replaceAll`, and `matchesAsFlow`; explain why the builder is not shared after publication; and identify whether your policy needs overlap, word-boundary, or normalization options.

## Stage 5: make it operable

Read [input safety](/manual/bluetape4k-text/0.2/guides/input-safety/), [startup and memory](/manual/bluetape4k-text/0.2/operations/startup-and-memory/), [failure contracts](/manual/bluetape4k-text/0.2/operations/failure-contracts/), and [quality gates](/manual/bluetape4k-text/0.2/quality/quality-gates/).

Before production, confirm:

- detectors, dictionaries, and automatons have explicit owners and lifetimes;
- warmup covers the expensive paths you actually use;
- errors contain lengths and categories, not submitted text;
- benchmark results are interpreted under their recorded environment;
- dictionary changes have persistence and rollout rules.

## Expand by problem

| Problem | Detailed path |
|---|---|
| custom dictionaries or moderation policy | [Dictionaries and blockwords](/manual/bluetape4k-text/0.2/guides/dictionaries-and-blockwords/) |
| mixed Korean, Japanese, and Latin input | [Mixed-language processing](/manual/bluetape4k-text/0.2/guides/mixed-language-processing/) |
| regression coverage | [Testing](/manual/bluetape4k-text/0.2/guides/testing/) |
| exact module choice | [Capability selection](/manual/bluetape4k-text/0.2/guides/capability-selection/) |
| performance interpretation | [Aho-Corasick benchmarks](/manual/bluetape4k-text/0.2/quality/aho-corasick-benchmarks/) |

The module pages remain the API-oriented reference. These guides connect them into application decisions; neither is a substitute for the stable source links attached to each technical claim.
