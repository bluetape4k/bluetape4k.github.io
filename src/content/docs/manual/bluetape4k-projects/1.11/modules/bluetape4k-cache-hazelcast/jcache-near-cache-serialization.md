---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-cache-hazelcast/jcache-near-cache-serialization"
title: JCache near-cache serialization limits
description: Explain listener-factory serialization failures and the capability of listener-free factories.
manualId: bluetape4k-cache-hazelcast
chapterId: jcache-near-cache-serialization
manual:
  id: "modules/bluetape4k-cache-hazelcast/jcache-near-cache-serialization"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "a9051bd77bf5870d3787f15c1d32088412f2bdbb"
  sourcePath: "docs/manual/en/modules/bluetape4k-cache-hazelcast/jcache-near-cache-serialization.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "docs/manual"
  layer: "build"
---


## Why direct listener registration fails

`HazelcastNearJCache` registers a `MutableCacheEntryListenerConfiguration` so back-cache events can update the front cache. When the listener factory captures a Caffeine cache proxy, Hazelcast cannot serialize that configuration for the cluster.

Release tests explicitly expect `HazelcastSerializationException` with an underlying `NotSerializableException`. Although the factory expresses the intended composition, it is not a supported client JCache path in 1.11.0.

## HazelcastCaches creates a listener-free composition

`HazelcastCaches.nearJCache` creates a Caffeine front JCache and Hazelcast back JCache directly without listener registration. `suspendNearJCache` also creates a fixed Caffeine front and calls `SuspendNearJCache.withoutListener`.

```kotlin
val cache = HazelcastCaches.nearJCache<String, User>(hazelcast) {
    cacheName = "users-v1"
}

cache.put("42", user)
cache.clear()             // front only
check(cache.getDeeply("42") == user)
```

Read-through and two-tier writes work, but another process can change the back cache without evicting this front cache. Factory success does not imply peer invalidation support.

## Distinguish the native IMap near cache

When peer invalidation is required, use the `IMap.addEntryListener` path in `HazelcastNearCache`. That listener runs in the client JVM, so capturing Caffeine L1 does not create the JCache listener-factory serialization problem.

| Choice | Benefit | Limit |
| --- | --- | --- |
| factory JCache near cache | Reuses JCache front/back contracts | No listener or peer L1 propagation |
| direct listener-backed JCache factory | Intended event propagation | Serialization failure in 1.11.0 |
| native IMap near cache | Client-side listener invalidation | String keys and no JCache API |

## Fixed suspend-front settings

The 1.11.0 `suspendNearJCache` factory builds Caffeine with a 10,000-entry maximum and 30-minute expire-after-access. It uses the supplied cache name for the back cache but does not apply custom front capacity and expiry from `NearJCacheConfig` to this fixed front.

## Sources and tests

- [`HazelcastCaches.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/HazelcastCaches.kt)
- [`HazelcastNearJCache.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/nearcache/jcache/HazelcastNearJCache.kt)
- [`HazelcastSuspendNearJCache.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/nearcache/jcache/HazelcastSuspendNearJCache.kt)
- [`HazelcastNearJCacheTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-hazelcast/src/test/kotlin/io/bluetape4k/cache/nearcache/jcache/HazelcastNearJCacheTest.kt)
- [`HazelcastSuspendNearJCacheTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/cache/cache-hazelcast/src/test/kotlin/io/bluetape4k/cache/nearcache/jcache/HazelcastSuspendNearJCacheTest.kt)
