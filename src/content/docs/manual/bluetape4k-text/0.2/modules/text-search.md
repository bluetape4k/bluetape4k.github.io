---
slug: "manual/bluetape4k-text/0.2/modules/text-search"
title: "Multi-pattern text search library"
manual:
  id: "text-search"
  repository: "bluetape4k-text"
  group: "search"
  kind: "library"
  sourceCommit: "5bdcab0887cf27ce79348d08e64db6d196b9cc89"
  sourcePath: "docs/manual/en/modules/text-search.md"
  minorVersion: "0.2"
  releaseRef: "0.2.1"
  releaseCommit: "2db7671afad20045afdcb5793c0113b8b23b972b"
  sourceDir: "text-search"
  layer: "build"
---


`text-search` implements an immutable generic Aho-Corasick automaton. It searches many keywords in one pass and associates each match with an application value. Options cover case handling, overlaps, word boundaries, Unicode normalization, and early-match behavior.

![Text search flow](/manual-assets/bluetape4k-text/0.2/text-search/search-flow.png)

## What it provides

- mutable builder and Kotlin DSL, producing an immutable automaton;
- `parseText`, `firstMatch`, `containsMatch`, `tokenize`, and `replaceAll`;
- generic match values and original-text offsets;
- `NONE`, `LATIN_ALPHA`, and `WHITESPACE_SEPARATED` boundary modes;
- NFC/NFKC normalization with offset mapping;
- `matchesAsFlow` for coroutine collection.

## Add the dependency

```kotlin
dependencies {
    implementation("io.github.bluetape4k.text:text-search:0.2.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:<compatible-version>") // Flow calls only
}
```

## Smallest useful example

```kotlin
import io.bluetape4k.text.search.AhoCorasickAutomaton
import io.bluetape4k.text.search.SearchOptions

val automaton = AhoCorasickAutomaton.builder<String>()
    .add("password reset", "ACCOUNT_TAKEOVER")
    .add("card declined", "PAYMENT_RISK")
    .options(SearchOptions(ignoreCase = true, allowOverlaps = false))
    .build()

val matches = automaton.parseText("Password reset before card declined")
println(matches.map { it.value })
// [ACCOUNT_TAKEOVER, PAYMENT_RISK]
```

The builder is the configuration phase. After `build()`, share the automaton as an immutable snapshot.

## Choose a result operation

| Operation | Use it when |
|---|---|
| `parseText` | all matches and offsets are needed now |
| `firstMatch` | the leftmost-longest match is sufficient |
| `containsMatch` | only a Boolean decision is needed |
| `tokenize` | matched and unmatched fragments must be rendered separately |
| `replaceAll` | each accepted match becomes replacement text |
| `matchesAsFlow` | the surrounding coroutine pipeline benefits from collection and cancellation |

`tokenize` always returns a non-overlapping sequence. `allowOverlaps = false` resolves competing matches before other operations consume them.

## Boundaries and normalization

`LATIN_ALPHA` avoids matching a keyword inside a larger alphabetic word. `WHITESPACE_SEPARATED` is useful for phrases that must be surrounded by whitespace. Unicode normalization enables canonically or compatibility-equivalent input, but it adds measurable work; the 0.2.1 NFKC benchmark is much slower than the raw no-match path.

## Flow collection

```kotlin
import io.bluetape4k.text.search.flow.matchesAsFlow
import kotlinx.coroutines.flow.take
import kotlinx.coroutines.flow.toList

val firstAlert = automaton.matchesAsFlow("critical login before card declined")
    .take(1)
    .toList()
```

The Flow extension runs through `channelFlow` on `Dispatchers.Default`. Bounded collection prevents retaining unnecessary results, but the automaton still performs CPU work over the supplied text.

## Constraints and failure behavior

Define the keyword snapshot and option policy before publication. Rebuilding on every request repeats setup work. Match offsets refer to the original text even when normalization is enabled, which is why the implementation maintains offset mapping. Treat benchmark values as local comparisons under their recorded environment.

## Continue learning

- [Text search runnable example](/manual/bluetape4k-text/0.2/examples/text-search-examples/)
- [Aho-Corasick benchmarks](/manual/bluetape4k-text/0.2/quality/aho-corasick-benchmarks/)
- [Testing](/manual/bluetape4k-text/0.2/guides/testing/)

## Source evidence

- [AhoCorasickAutomaton](https://github.com/bluetape4k/bluetape4k-text/blob/0.2.1/text-search/src/main/kotlin/io/bluetape4k/text/search/AhoCorasickAutomaton.kt)
- [SearchOptions](https://github.com/bluetape4k/bluetape4k-text/blob/0.2.1/text-search/src/main/kotlin/io/bluetape4k/text/search/SearchOptions.kt)
- [Flow extension](https://github.com/bluetape4k/bluetape4k-text/blob/0.2.1/text-search/src/main/kotlin/io/bluetape4k/text/search/flow/AhoCorasickFlowExtensions.kt)
