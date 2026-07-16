---
slug: "manual/bluetape4k-text/0.2/guides/capability-selection"
title: "Capability selection"
manual:
  id: "guides/capability-selection"
  repository: "bluetape4k-text"
  group: "overview"
  kind: "guide"
  sourceCommit: "bf802d7362ac221690043fddd3a3da433af02bed"
  sourcePath: "docs/manual/en/guides/capability-selection.md"
  minorVersion: "0.2"
  releaseRef: "0.2.1"
  releaseCommit: "2db7671afad20045afdcb5793c0113b8b23b972b"
  sourceDir: "docs/manual"
  layer: "build"
---


Select by the result your application needs. Detection, tokenization, dictionary policy, and exact search are complementary but independent.

## Decision table

| Requirement | Primary module | Representative API | Runnable evidence |
|---|---|---|---|
| align all Text artifacts | `bluetape4k-text-bom` | Gradle `platform(...)` | [Getting started](/manual/bluetape4k-text/0.2/getting-started/) |
| validate tokenizer request boundaries | `tokenizer-core` | `tokenizeRequestOf`, `blockwordRequestOf` | [Safety example](/manual/bluetape4k-text/0.2/examples/tokenizer-safety-examples/) |
| normalize or morphologically analyze Korean | `tokenizer-korean` | `KoreanProcessor` | [Korean module](/manual/bluetape4k-text/0.2/modules/tokenizer-korean/) |
| morphologically analyze Japanese | `tokenizer-japanese` | `JapaneseProcessor` | [Japanese module](/manual/bluetape4k-text/0.2/modules/tokenizer-japanese/) |
| estimate languages or filter by script | `lingua` | `LanguageDetector`, `UnicodeDetector` | [Lingua example](/manual/bluetape4k-text/0.2/examples/lingua-examples/) |
| find or replace many exact patterns | `text-search` | `AhoCorasickAutomaton` | [Search example](/manual/bluetape4k-text/0.2/examples/text-search-examples/) |

## Detection or tokenization?

Detection answers “which language is this likely to contain?” Tokenization answers “how does this language-specific processor segment and classify the text?” A detector does not produce morphemes, and a tokenizer does not prove that arbitrary input belongs to its language.

Use detection only when input routing is unknown. If an endpoint is explicitly Korean, validate the boundary and call the Korean processor directly.

## Tokenization or exact search?

Use a tokenizer when grammatical boundaries, POS, stems, or language-specific normalization matter. Use Aho-Corasick when the patterns are known strings and many must be searched together. Exact search preserves raw-text offsets and avoids morphology setup.

Some moderation systems use both: morphology produces policy tokens while an automaton finds exact identifiers or phrases. Keep the two result types separate so tests reveal which rule matched.

## Unicode filtering or Lingua?

Use `UnicodeDetector` for deterministic script evidence such as “does this text contain Hangul?” Use Lingua for natural-language estimation, especially among languages sharing Latin script. For mixed input, script filtering can be a fast first stage followed by statistical detection for the remaining text.

## Core directly or transitively?

Add `tokenizer-core` directly when your code imports its models or dictionary utilities as a public boundary. If all use is internal to `tokenizer-korean` or `tokenizer-japanese`, rely on the processor dependency unless your build policy requires explicit declarations.

## Selection checklist

1. Name the output: language set, analyzed tokens, policy match, or exact offset.
2. Decide whether input language is already part of the endpoint contract.
3. Decide whether setup state can be shared across requests.
4. Select the smallest language and dictionary scope.
5. Add boundary, ambiguity, and failure tests before composing another module.

See the [processing model](/manual/bluetape4k-text/0.2/architecture/processing-model/) for composition and [runtime boundaries](/manual/bluetape4k-text/0.2/architecture/runtime-boundaries/) for lifetime choices.
