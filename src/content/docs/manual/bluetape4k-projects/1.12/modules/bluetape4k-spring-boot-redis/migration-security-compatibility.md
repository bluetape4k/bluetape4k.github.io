---
slug: "manual/bluetape4k-projects/1.12/modules/bluetape4k-spring-boot-redis/migration-security-compatibility"
title: Security, compatibility, and migration
description: Address JDK deserialization risk, serializer schema changes, and safe Redis-value migration during rolling deployments.
manualId: bluetape4k-spring-boot-redis
chapterId: migration-security-compatibility
manual:
  id: "modules/bluetape4k-spring-boot-redis/migration-security-compatibility"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "ffde7b8be16124b1c538bb318a7d482927f738ad"
  sourcePath: "docs/manual/en/modules/bluetape4k-spring-boot-redis/migration-security-compatibility.md"
  minorVersion: "1.12"
  releaseRef: "1.12.1"
  releaseCommit: "7cf0b73646af05c0f8872cc4f6a16983949c4e3e"
  sourceDir: "docs/manual"
  layer: "build"
---


## Redis values are input

Multiple applications, jobs, and operational tools can write a private Redis instance. A compromised credential or faulty producer still creates untrusted input for readers. Restrict write access, key namespaces, and allowed deserialization types.

## JDK deserialization boundary

JDK serialization can invoke gadget chains from the application classpath. Release 1.12.1 deprecates `Jdk`, `GzipJdk`, `LZ4Jdk`, `SnappyJdk`, and `ZstdJdk`.

Their replacement metadata points to the corresponding Kryo combination or plain `Kryo`. Existing data remains readable, but these constants should not define a new format.

## Serializer changes are schema migrations

Moving from Kryo to Fory or LZ4 to Zstd changes persisted bytes. Field and polymorphic subtype changes can also break readers even when the serializer name stays the same.

A versioned keyspace is the simplest boundary:

```text
orders:v1:{id}  -> old serializer
orders:v2:{id}  -> new serializer
```

During migration, readers can try v2 and fall back to v1, then repopulate v2. Define an end date because fallback reads add complexity and load.

## Rolling deployment matrix

| Writer | Reader | Contract |
| --- | --- | --- |
| old | old | current baseline |
| old | new | read existing values |
| new | new | new-format round trip |
| new | old | backward compatibility or isolated keys |

If the last pair fails, prevent new writers from placing values in a keyspace still read by old instances.

## Do not hide failures

Converting every deserialize failure into a cache miss can turn corruption or hostile payloads into source-store load. Count failures by bounded schema version and key prefix, then quarantine or delete only the affected keys.

Do not log raw payloads or personal data. Byte size, serializer ID, exception type, and deployment version usually provide enough diagnostic context.

## Null is not deletion

Serializer null becomes an empty byte array; it does not delete a Redis key. Represent absence through deletion or an explicit envelope. Negative caching needs a marker distinct from valid empty payloads.

## Sources and tests

- [`RedisBinarySerializers.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/spring-boot/redis/src/main/kotlin/io/bluetape4k/spring/redis/serializer/RedisBinarySerializers.kt)
- [`RedisBinarySerializer.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/spring-boot/redis/src/main/kotlin/io/bluetape4k/spring/redis/serializer/RedisBinarySerializer.kt)
- [`RedisBinarySerializerTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/spring-boot/redis/src/test/kotlin/io/bluetape4k/spring/redis/serializer/RedisBinarySerializerTest.kt)
