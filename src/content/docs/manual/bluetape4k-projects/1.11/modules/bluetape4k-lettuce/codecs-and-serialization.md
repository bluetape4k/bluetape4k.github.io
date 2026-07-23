---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/codecs-and-serialization"
title: Codecs and serialization
description: Treat Redis codecs as wire formats with explicit trust and migration boundaries.
manualId: bluetape4k-lettuce
chapterId: codecs-and-serialization
manual:
  id: "bluetape4k-lettuce"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "3a97a3fc2f3525c3a3384d511a9adb8571b0b680"
  sourcePath: "docs/manual/en/modules/bluetape4k-lettuce/codecs-and-serialization.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "infra/lettuce"
  layer: "build"
  learningOrder: 540
  chapterId: "codecs-and-serialization"
  chapterOrder: 3
---


## A codec is persisted format

`LettuceBinaryCodec<V>` combines String keys with values produced by a `BinarySerializer`. `LettuceJsonCodec<V>` restores JSON to an explicit `valueType`. The integer and long codecs use fixed-width big-endian values compatible with Redisson primitive codecs.

```kotlin
val codec = LettuceBinaryCodecs.lz4Fory<User>()
val connection = LettuceClients.connect(client, codec)
connection.sync().set("user:1", User(1, "Alice"))
```

## Migrate before changing codecs

The default binary codec is LZ4+Fory. FastFory is not wire-compatible with Fory, has no fallback, and does not support cyclic object graphs. A codec switch therefore needs a new prefix, dual writes, or a deliberate cache reset.

## Protobuf caller-owned targets

With `bluetape4k-protobuf` present, `LettuceProtobufCodecs.protobuf()` and
`trustedInternalProtobuf()` use the nullable `encodeValue(value, target)` extension seam to write uncompressed
Protobuf messages into Lettuce's caller-owned `ByteBuf`. Ordinary codec methods stay final; opening
`LettuceBinaryCodec` also exposes Kotlin-generated JVM bridges, so custom subclasses must preserve the serializer's
wire and trust contract.

```kotlin
val codec = LettuceProtobufCodecs.protobuf<MyBluetapeMessage>()
val customPrefixCodec = LettuceBinaryCodec<MyMessage>(
    ProtobufSerializer(allowedClassPrefixes = setOf("com.mycompany.proto.")),
)
```

The default factory accepts only its default prefixes. The explicit custom-prefix codec, compressed factories,
fallback values, and single-argument `ByteBuffer` methods retain copied compatibility behavior. On target-encode
failure, `writerIndex` is unchanged, but capacity or attempted bytes may have changed; clear/reinitialize the range or
discard the buffer. Existing callers need no migration. Java uses `LettuceProtobufCodecs.INSTANCE.protobuf()`.

## Untrusted payloads

Use object deserializers only for trusted values written by the application. If external actors can modify Redis bytes, narrow Redis permissions and prefer primitives or JSON with an explicit type contract. Compression may cost more than it saves for small values, so benchmark representative payloads.

## Source and tests

- [`LettuceBinaryCodecs.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/codec/LettuceBinaryCodecs.kt)
- [`LettuceJsonCodec.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/main/kotlin/io/bluetape4k/redis/lettuce/codec/LettuceJsonCodec.kt)
- [`LettuceProtobufCodecs.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/protobuf/src/main/kotlin/io/bluetape4k/protobuf/serializers/redis/LettuceProtobufCodecs.kt)
- [`FastForyCompatibilityTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/infra/lettuce/src/test/kotlin/io/bluetape4k/redis/lettuce/codec/FastForyCompatibilityTest.kt)

Continue with [Maps and cache loading](/manual/bluetape4k-projects/1.11/modules/bluetape4k-lettuce/maps-and-cache-loading/).
