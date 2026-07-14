---
slug: "ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-jwt"
manualId: bluetape4k-jwt
title: "Module bluetape4k-jwt"
description: "JSON Web Token (JWT)을 생성하고 파싱하는 라이브러리입니다. jjwt 0.13.x 라이브러리를 기반으로 Kotlin 친화적인 API와 KeyChain 관리 기능을 제공합니다."
kind: library
group: utilities
manual:
  id: "bluetape4k-jwt"
  repository: "bluetape4k-projects"
  group: "utilities"
  kind: "library"
  sourceCommit: "46993c010f5bef45fef0943bbc93728d16119bd5"
  sourcePath: "docs/manual/ko/modules/bluetape4k-jwt.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "utils/jwt"
  layer: "build"
---


## 해결하는 문제

JSON Web Token (JWT)을 생성하고 파싱하는 라이브러리입니다. jjwt 0.13.x 라이브러리를 기반으로 Kotlin 친화적인 API와 KeyChain 관리 기능을 제공합니다. 이 매뉴얼은 README의 기능 목록을 반복하지 않고 현재 build, source entry point, test, 설정 resource, lifecycle 근거를 연결합니다.

## 사용 시점

애플리케이션에 입력 계약, value semantics, algorithm cost, deterministic output이 필요할 때 `bluetape4k-jwt`를 선택합니다. 아래 source entry point에서 시작해 ownership과 failure 계약이 caller lifecycle에 맞는지 확인합니다. 표준 API나 이미 도입한 더 작은 모듈이 같은 계약을 만족한다면 그쪽을 우선합니다.

## 의존성 좌표

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-jwt")
}
```

Gradle project path는 `:bluetape4k-jwt`, source directory는 `utils/jwt`입니다.

## 핵심 개념

먼저 확인할 source 개념은 `JwtConsts`, `JwtCodecs`, `JwtComposer`, `JwtComposerDsl`, `KeyChain`, `KeyChainDto`, `AbstractKeyChainRepository`, `KeyChainRepository`입니다. 파일 이름은 탐색 anchor일 뿐이므로 public 계약으로 사용하기 전에 선언과 test를 함께 읽습니다.

## 빠른 시작

위 좌표를 추가하고 Gradle을 refresh한 뒤 필요한 작업을 소유한 가장 작은 entry point에서 시작합니다. 먼저 [`JwtConsts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/JwtConsts.kt)를 확인합니다. 이 파일이 모듈의 구체적인 source entry point입니다.

## 작업별 API

| Entry point | 확인할 내용 |
| --- | --- |
| [`JwtConsts`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/JwtConsts.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`JwtCodecs`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/codec/JwtCodecs.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`JwtComposer`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/composer/JwtComposer.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`JwtComposerDsl`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/composer/JwtComposerDsl.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`KeyChain`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/KeyChain.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`KeyChainDto`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/KeyChainDto.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`AbstractKeyChainRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/repository/AbstractKeyChainRepository.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`KeyChainRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/repository/KeyChainRepository.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`InMemoryKeyChainRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/repository/inmemory/InMemoryKeyChainRepository.kt) | constructor, function, ownership 계약을 확인합니다. |
| [`RedisKeyChainRepository`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/kotlin/io/bluetape4k/jwt/keychain/repository/redis/RedisKeyChainRepository.kt) | constructor, function, ownership 계약을 확인합니다. |

## 권장 패턴

README 근거는 **아키텍처**, **JWT 생성 및 검증 흐름**, **클래스 다이어그램**, **JWT 토큰 구조**, **주요 기능**, **사용 예시**, **기본 JWT 생성 및 파싱**, **Kotlin DSL로 JWT 생성**, **JWT Reader 사용**, **KeyChain 회전 (Rotation)** 순서로 탐색할 수 있습니다. 이 항목으로 방향을 잡고 source와 test에서 동작을 확인합니다. 도입 범위는 좁게 유지하고 소유한 resource를 caller lifecycle에 연결합니다.

## 연동

현재 build에 선언된 integration edge는 다음과 같습니다.

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

`compileOnly` edge는 caller가 제공해야 하는 capability이므로 API를 사용하기 전에 runtime에 실제 dependency가 있는지 확인합니다.

## 설정

모듈에서 찾은 설정 resource는 다음과 같습니다.

- [`gen-keypair.sh`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/main/resources/gen-keypair.sh)

override하기 전에 이 resource와 binding source에서 property 이름과 default를 확인합니다.

## 실패 동작

failure 의미는 artifact 이름이 아니라 아래 entry point와 test가 결정합니다. cancellation과 timeout signal을 보존하고 소유한 resource를 닫습니다. backend exception은 안정된 domain 계약을 추가할 수 있는 boundary에서만 변환합니다. retry나 fallback을 넣기 전에 test anchor로 실제 동작을 확인합니다.

## 운영

hot path를 측정하고 입력 크기를 제한하며 utility를 호출하는 application boundary에서 failure를 관찰합니다. capacity, timeout, retry, shutdown 설정은 resource를 소유한 component 가까이에 둡니다. 누가 trade-off를 받아들였는지 알 수 없는 process-wide default는 피합니다.

## 테스트

모듈 test task는 다음과 같습니다.

```bash
./gradlew :bluetape4k-jwt:test --no-configuration-cache
```

대표 test anchor는 다음과 같습니다.

- [`AbstractJwtTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/AbstractJwtTest.kt)
- [`JwtComposerDslTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/composer/JwtComposerDslTest.kt)
- [`JwtComposerTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/composer/JwtComposerTest.kt)
- [`AbstractKeyChainRepositoryTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/keychain/AbstractKeyChainRepositoryTest.kt)
- [`KeyChainTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/keychain/KeyChainTest.kt)
- [`InMemoryKeyChainRepositoryTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/keychain/inmemory/InMemoryKeyChainRepositoryTest.kt)
- [`RedisKeyChainRepositoryTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/keychain/redis/RedisKeyChainRepositoryTest.kt)
- [`AbstractJwtProviderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/src/test/kotlin/io/bluetape4k/jwt/provider/AbstractJwtProviderTest.kt)

## 워크숍

manual manifest에 등록된 전용 workshop path가 없습니다. 모듈 README와 위 representative test를 실행 근거로 사용합니다.

## 제한 사항

이 페이지는 연결된 source와 test가 나타내는 현재 저장소 상태를 설명합니다. optional backend를 애플리케이션 기본값으로 만들거나 benchmark artifact 없이 성능을 단정하지 않습니다. 모듈 버전이 바뀌면 호환성과 lifecycle 설명을 다시 확인해야 합니다.

## 근거

- [모듈 README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/README.ko.md)
- [모듈 build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/utils/jwt/build.gradle.kts)
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
