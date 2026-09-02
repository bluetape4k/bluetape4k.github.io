---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-hibernate-cache-lettuce/architecture-regions"
title: Near Cache architecture and regions
description: Understand how Hibernate regions map to Caffeine L1 and Redis L2 for reads, writes, and isolation.
manualId: bluetape4k-hibernate-cache-lettuce
chapterId: architecture-regions
manual:
  id: "bluetape4k-hibernate-cache-lettuce"
  repository: "bluetape4k-projects"
  group: "caching"
  kind: "library"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-hibernate-cache-lettuce/architecture-regions.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "cache/hibernate-cache-lettuce"
  layer: "build"
  learningOrder: 570
  chapterId: "architecture-regions"
  chapterOrder: 1
---


## The two tiers

Each `LettuceNearCache` combines a process-local Caffeine L1 with a shared Redis L2. Reads check L1 first and populate it from Redis on a miss. Writes update Redis before populating L1.

```text
Hibernate SessionFactory
  └─ LettuceNearCacheRegionFactory
       ├─ entity region ─ Caffeine L1 + Redis L2
       ├─ collection region ─ Caffeine L1 + Redis L2
       └─ query region ─ Caffeine L1 + Redis L2
```

If Redis SET fails, `LettuceNearCache.put` throws before changing L1. StorageAccess logs and absorbs that failure, allowing the database transaction to continue without completing the cache put.

## One instance per region

`LettuceNearCacheRegionFactory` uses `ConcurrentHashMap.computeIfAbsent`, so repeated storage-access requests for a region share one Redis connection and Caffeine cache.

```kotlin
val nearCache = caches.computeIfAbsent(regionName) {
    LettuceNearCache(client, codec, properties.buildNearCacheConfig(regionName))
}
```

`getCaches()` exposes an unmodifiable view for Metrics and Actuator. Application code cannot bypass factory ownership by adding or removing entries.

## Redis key space

Near Cache prefixes Redis keys with `{regionName}:`. StorageAccess first converts the Hibernate key to `hck2:<SHA-256 digest>`, producing keys such as:

```text
io.example.Product:hck2:K3...digest
```

Region eviction scans `${regionName}:*` and uses `UNLINK`; it never uses `FLUSHDB`, so other region prefixes remain intact.

## Separate first- and second-level tests

The persistence context in a Hibernate Session is the first-level cache. Two finds in one Session do not prove that the Lettuce second-level cache is working.

```kotlin
repeat(2) {
    sessionFactory.openSession().use { session ->
        session.beginTransaction()
        checkNotNull(session.find(Product::class.java, id))
        session.transaction.commit()
    }
}
```

Use new Sessions and inspect `secondLevelCacheHitCount`.

## Sources and tests

- [`LettuceNearCacheRegionFactory.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/cache/hibernate-cache-lettuce/src/main/kotlin/io/bluetape4k/hibernate/cache/lettuce/LettuceNearCacheRegionFactory.kt)
- [`LettuceNearCache.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/cache/cache-lettuce/src/main/kotlin/io/bluetape4k/cache/nearcache/LettuceNearCache.kt)
- [`HibernateFirstLevelCacheTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/cache/hibernate-cache-lettuce/src/test/kotlin/io/bluetape4k/hibernate/cache/lettuce/HibernateFirstLevelCacheTest.kt)
- [`LettuceNearCacheRegionFactoryTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/cache/hibernate-cache-lettuce/src/test/kotlin/io/bluetape4k/hibernate/cache/lettuce/LettuceNearCacheRegionFactoryTest.kt)
