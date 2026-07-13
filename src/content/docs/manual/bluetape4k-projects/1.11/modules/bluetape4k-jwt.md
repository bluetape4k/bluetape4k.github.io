---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-jwt"
manualId: bluetape4k-jwt
title: "Module bluetape4k-jwt"
description: "A library for creating and parsing JSON Web Tokens (JWT). Built on jjwt 0.13.x, it provides a Kotlin-friendly API and KeyChain management."
kind: library
group: utilities
manual:
  id: "bluetape4k-jwt"
  repository: "bluetape4k-projects"
  group: "utilities"
  kind: "library"
  sourceCommit: "073ab365abcd91889ecd82d0077522cac2f13e15"
  sourcePath: "docs/manual/en/modules/bluetape4k-jwt.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "utils/jwt"
  layer: "build"
---


## Problem

A library for creating and parsing JSON Web Tokens (JWT). Built on jjwt 0.13.x, it provides a Kotlin-friendly API and KeyChain management. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-jwt` when the application needs input contracts, value semantics, algorithmic cost, and deterministic output. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-jwt")
}
```

Gradle project path: `:bluetape4k-jwt`. Source directory: `utils/jwt`.

## Concepts

The first source-level concepts to inspect are `JwtConsts`, `JwtCodecs`, `JwtComposer`, `JwtComposerDsl`, `KeyChain`, `KeyChainDto`, `AbstractKeyChainRepository`, and `KeyChainRepository`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`JwtConsts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/JwtConsts.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`JwtConsts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/JwtConsts.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JwtCodecs`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/codec/JwtCodecs.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JwtComposer`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/composer/JwtComposer.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`JwtComposerDsl`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/composer/JwtComposerDsl.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`KeyChain`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/KeyChain.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`KeyChainDto`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/KeyChainDto.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`AbstractKeyChainRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/repository/AbstractKeyChainRepository.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`KeyChainRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/repository/KeyChainRepository.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`InMemoryKeyChainRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/repository/inmemory/InMemoryKeyChainRepository.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RedisKeyChainRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/repository/redis/RedisKeyChainRepository.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Architecture**, **JWT Create and Verify Flow**, **Class Diagram**, **JWT Token Structure**, **Key Features**, **Usage Examples**, **Basic JWT Creation and Parsing**, **Creating JWTs with Kotlin DSL**, **Using JwtReader**, and **KeyChain Rotation**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-io"))
api(libs.jjwt.api)
api(libs.jjwt.impl)
api(libs.jjwt.jackson)
api(project(":bluetape4k-jackson2"))
api(libs.jackson.module.kotlin)
api(libs.jackson.module.blackbird)
compileOnly(libs.fory.kotlin)
compileOnly(libs.kryo5)
compileOnly(libs.lz4.java)
compileOnly(libs.snappy.java)
compileOnly(libs.zstd.jni)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

Configuration resources found in the module:

- [`gen-keypair.sh`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/resources/gen-keypair.sh)

Read property names and defaults from these resources and the binding source before overriding them.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Measure hot paths, bound input sizes, and monitor failures at the application boundary that calls the utility. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-jwt:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractJwtTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/AbstractJwtTest.kt)
- [`JwtComposerDslTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/composer/JwtComposerDslTest.kt)
- [`JwtComposerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/composer/JwtComposerTest.kt)
- [`AbstractKeyChainRepositoryTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/keychain/AbstractKeyChainRepositoryTest.kt)
- [`KeyChainTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/keychain/KeyChainTest.kt)
- [`InMemoryKeyChainRepositoryTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/keychain/inmemory/InMemoryKeyChainRepositoryTest.kt)
- [`RedisKeyChainRepositoryTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/keychain/redis/RedisKeyChainRepositoryTest.kt)
- [`AbstractJwtProviderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/provider/AbstractJwtProviderTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/build.gradle.kts)
- [`JwtConsts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/JwtConsts.kt)
- [`JwtCodecs`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/codec/JwtCodecs.kt)
- [`JwtComposer`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/composer/JwtComposer.kt)
- [`JwtComposerDsl`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/composer/JwtComposerDsl.kt)
- [`KeyChain`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/KeyChain.kt)
- [`KeyChainDto`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/KeyChainDto.kt)
- [`AbstractKeyChainRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/repository/AbstractKeyChainRepository.kt)
- [`KeyChainRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/repository/KeyChainRepository.kt)
- [`InMemoryKeyChainRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/repository/inmemory/InMemoryKeyChainRepository.kt)
- [`RedisKeyChainRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/repository/redis/RedisKeyChainRepository.kt)
- [`AbstractJwtTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/AbstractJwtTest.kt)
- [`JwtComposerDslTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/composer/JwtComposerDslTest.kt)
