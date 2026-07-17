---
slug: "manual/bluetape4k-text/0.2/examples/lingua-examples"
title: "Lingua example"
manual:
  id: "examples/lingua-examples"
  repository: "bluetape4k-text"
  group: "overview"
  kind: "guide"
  sourceCommit: "df0e0d259666acdea51e0ba68e9587c99b81b3a5"
  sourcePath: "docs/manual/en/examples/lingua-examples.md"
  minorVersion: "0.2"
  releaseRef: "0.2.1"
  releaseCommit: "2db7671afad20045afdcb5793c0113b8b23b972b"
  sourceDir: "docs/manual"
  layer: "build"
---


The runnable Lingua example compares detector reuse, an explicit language subset, and low-accuracy mode. Its mixed sample contains English, Korean, and Japanese sentences.

## Run it

```bash
./gradlew :examples:lingua-examples:run
```

The report contains three lines:

```text
reuse=<detected English, Korean, and Japanese set>
subset=<detected English, Korean, and Japanese set>
lowAccuracy=ENGLISH
```

The two mixed-language values are sets; do not assert their printed order.

## Reused detector

The first detector is constructed for exactly English, Korean, and Japanese, sets minimum relative distance to `0.0`, preloads models, and keeps full-accuracy mode. The example calls it after construction instead of rebuilding it around each text.

This is the default shape for a service with a known support policy: define the set at application setup and share the configured detector.

## DSL subset

The second detector uses the DSL form:

```kotlin
val detector = languageDetectorOf(languages) {
    withMinimumRelativeDistance(0.0)
    withPreloadedLanguageModels()
}
```

It should represent the same product language set as the parameter-based detector. The comparison makes configuration drift visible.

## Low-accuracy detector

The third detector supports only English and German, loads models lazily, and enables low-accuracy mode. The sample `Hello service users` resolves to English in the release fixture.

Low-accuracy mode is a deliberate resource/quality trade-off. Validate it against your corpus rather than switching it on as an invisible performance flag.

## Modify it safely

1. Replace the support set with the exact languages of your product.
2. Add short and ambiguous inputs.
3. Add blank input and verify `detectAllLanguagesOf` returns an empty set.
4. Add an application route assertion separate from detector output.

Continue with [mixed-language processing](/manual/bluetape4k-text/0.2/guides/mixed-language-processing/), [runtime boundaries](/manual/bluetape4k-text/0.2/architecture/runtime-boundaries/), and the [Lingua module](/manual/bluetape4k-text/0.2/modules/lingua/).

## Source evidence

- [Runnable source](https://github.com/bluetape4k/bluetape4k-text/blob/0.2.1/examples/lingua-examples/src/main/kotlin/io/bluetape4k/text/examples/lingua/LinguaExamples.kt)
- [Example tests](https://github.com/bluetape4k/bluetape4k-text/blob/0.2.1/examples/lingua-examples/src/test/kotlin/io/bluetape4k/text/examples/lingua/LinguaExamplesTest.kt)
