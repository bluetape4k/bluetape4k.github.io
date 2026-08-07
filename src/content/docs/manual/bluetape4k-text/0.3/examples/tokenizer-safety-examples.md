---
slug: "manual/bluetape4k-text/0.3/examples/tokenizer-safety-examples"
title: "Tokenizer safety example"
manual:
  id: "examples/tokenizer-safety-examples"
  repository: "bluetape4k-text"
  group: "overview"
  kind: "guide"
  sourceCommit: "c5726bea30591e4c5c26523ccac4ad62c5ea9237"
  sourcePath: "docs/manual/en/examples/tokenizer-safety-examples.md"
  minorVersion: "0.3"
  releaseRef: "0.3.0"
  releaseCommit: "aead213d2d25307d7d3684226943a5f95c7411f2"
  sourceDir: "docs/manual"
  layer: "build"
---


This example places a small service-style boundary in front of Korean and Japanese processors. It distinguishes invalid input, oversized input, successful processing, and unexpected processor failure without echoing submitted text.

## Run it

```bash
./gradlew :examples:tokenizer-safety-examples:run
```

The program runs four accepted Korean/Japanese tokenize and blockword calls, then submits an oversized Korean tokenizer value. Accepted lines report language and token or masked length; the oversized line reports status `413`, actual length, and the maximum.

## Boundary order

`TokenizerSafetyHandler` performs checks in this order:

1. text longer than the operation's public maximum → `413`;
2. blank text → `400`;
3. processor call succeeds → `200`;
4. processor throws → sanitized `500`.

The maximum is `MAX_TOKENIZE_TEXT_LENGTH` for tokenization and `MAX_BLOCKWORD_TEXT_LENGTH` for masking. Both are `100_000` in release 0.3.0.

## Injected processor functions

The handler accepts Korean and Japanese functions in its constructor. Tests can force a processor failure without loading a real model and then verify that the response contains `processor error` but not the submitted sentinel.

This design keeps boundary tests fast and separates adapter policy from tokenizer correctness.

## Coroutine caveat

The example wraps synchronous processor calls with `runCatching`. If your injected function becomes `suspend`, replace broad `runCatching` with explicit `try/catch` that rethrows `CancellationException` before handling other exceptions.

## Adapt it to HTTP

Map `SafetyResponse.status` to your framework response and keep `body` free of input. Add transport byte limits before decoding, retain the library character limit after decoding, and attach only a policy-safe request identifier.

## Test cases to retain

- blank and whitespace-only input;
- exactly-at-limit and one-over-limit input;
- each language and each operation;
- injected processor failure;
- sentinel absence in every error and rendered report.

Continue with [input safety](/manual/bluetape4k-text/0.3/guides/input-safety/), [failure contracts](/manual/bluetape4k-text/0.3/operations/failure-contracts/), and [tokenizer core](/manual/bluetape4k-text/0.3/modules/tokenizer-core/).

## Source evidence

- [Runnable source](https://github.com/bluetape4k/bluetape4k-text/blob/0.3.0/examples/tokenizer-safety-examples/src/main/kotlin/io/bluetape4k/text/examples/tokenizer/TokenizerSafetyExamples.kt)
- [Example tests](https://github.com/bluetape4k/bluetape4k-text/blob/0.3.0/examples/tokenizer-safety-examples/src/test/kotlin/io/bluetape4k/text/examples/tokenizer/TokenizerSafetyExamplesTest.kt)
