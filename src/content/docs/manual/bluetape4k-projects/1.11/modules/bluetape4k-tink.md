---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-tink"
manualId: bluetape4k-tink
title: "bluetape4k-tink"
description: "An idiomatic Kotlin wrapper around Google Tink cryptography library."
kind: library
group: io
manual:
  id: "bluetape4k-tink"
  repository: "bluetape4k-projects"
  group: "io"
  kind: "library"
  sourceCommit: "e89bf724fd018af8c2ab4564a5c9a007fe27b46a"
  sourcePath: "docs/manual/en/modules/bluetape4k-tink.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "io/tink"
  layer: "build"
---


## Problem

An idiomatic Kotlin wrapper around Google Tink cryptography library. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-tink` when the application needs encoding boundaries, resource ownership, streaming, compatibility, and malformed input. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-tink")
}
```

Gradle project path: `:bluetape4k-tink`. Source directory: `io/tink`.

## Concepts

The first source-level concepts to inspect are `SecureRandomSupport`, `TinkSupport`, `TinkAead`, `TinkAeadExtensions`, `TinkAeads`, `TinkDaeads`, `TinkDeterministicAead`, and `TinkDigester`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`SecureRandomSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/SecureRandomSupport.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`SecureRandomSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/SecureRandomSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TinkSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/TinkSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TinkAead`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/aead/TinkAead.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TinkAeadExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/aead/TinkAeadExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TinkAeads`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/aead/TinkAeads.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TinkDaeads`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/daead/TinkDaeads.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TinkDeterministicAead`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/daead/TinkDeterministicAead.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TinkDigester`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/digest/TinkDigester.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TinkDigesterExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/digest/TinkDigesterExtensions.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`TinkDigesters`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/digest/TinkDigesters.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Why Tink**, **Diagrams**, **TinkEncryptor Class Hierarchy**, **AEAD encrypt/decrypt Flow**, **Recommended Usage Scenarios**, **Anti-Patterns**, **Features**, **Dependencies**, **Quick Start**, and **AEAD — Authenticated Encryption (AES-256-GCM)**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-core"))
compileOnly(libs.lettuce.core)
compileOnly(libs.redisson)
api(libs.tink)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track payload size, allocation, latency, malformed-input rate, resource closure, and protocol errors. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-tink:test --no-configuration-cache
```

Representative test anchors:

- [`SecureRandomSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/test/kotlin/io/bluetape4k/tink/SecureRandomSupportTest.kt)
- [`TinkSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/test/kotlin/io/bluetape4k/tink/TinkSupportTest.kt)
- [`TinkAeadExtensionsTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/test/kotlin/io/bluetape4k/tink/aead/TinkAeadExtensionsTest.kt)
- [`TinkAeadTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/test/kotlin/io/bluetape4k/tink/aead/TinkAeadTest.kt)
- [`TinkDeterministicAeadTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/test/kotlin/io/bluetape4k/tink/daead/TinkDeterministicAeadTest.kt)
- [`TinkDigesterTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/test/kotlin/io/bluetape4k/tink/digest/TinkDigesterTest.kt)
- [`TinkEncryptorTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/test/kotlin/io/bluetape4k/tink/encrypt/TinkEncryptorTest.kt)
- [`InMemoryVersionedDaeadKeysetStore`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/test/kotlin/io/bluetape4k/tink/keyset/InMemoryVersionedDaeadKeysetStore.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `1.11.0` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### TinkEncryptor Class Hierarchy diagram

[![TinkEncryptor Class Hierarchy diagram](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/io-tink-diagram-01.png)](../../assets/readme-diagrams/io-tink-diagram-01.svg)

_Release README: [`io/tink/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/io/tink/README.md)_

### AEAD encrypt/decrypt Flow diagram

[![AEAD encrypt/decrypt Flow diagram](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/io-tink-sequence-01.png)](../../assets/readme-diagrams/io-tink-sequence-01.svg)

_Release README: [`io/tink/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/io/tink/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/build.gradle.kts)
- [`SecureRandomSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/SecureRandomSupport.kt)
- [`TinkSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/TinkSupport.kt)
- [`TinkAead`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/aead/TinkAead.kt)
- [`TinkAeadExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/aead/TinkAeadExtensions.kt)
- [`TinkAeads`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/aead/TinkAeads.kt)
- [`TinkDaeads`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/daead/TinkDaeads.kt)
- [`TinkDeterministicAead`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/daead/TinkDeterministicAead.kt)
- [`TinkDigester`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/digest/TinkDigester.kt)
- [`TinkDigesterExtensions`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/digest/TinkDigesterExtensions.kt)
- [`TinkDigesters`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/main/kotlin/io/bluetape4k/tink/digest/TinkDigesters.kt)
- [`SecureRandomSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/test/kotlin/io/bluetape4k/tink/SecureRandomSupportTest.kt)
- [`TinkSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/tink/src/test/kotlin/io/bluetape4k/tink/TinkSupportTest.kt)
