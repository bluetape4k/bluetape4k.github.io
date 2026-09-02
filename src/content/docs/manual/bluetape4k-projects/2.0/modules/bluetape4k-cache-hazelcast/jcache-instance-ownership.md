---
slug: "manual/bluetape4k-projects/2.0/modules/bluetape4k-cache-hazelcast/jcache-instance-ownership"
title: JCache and HazelcastInstance ownership
description: Select the Hazelcast provider explicitly and build managers and caches from an existing instance.
manualId: bluetape4k-cache-hazelcast
chapterId: jcache-instance-ownership
manual:
  id: "modules/bluetape4k-cache-hazelcast/jcache-instance-ownership"
  repository: "bluetape4k-projects"
  group: "overview"
  kind: "guide"
  sourceCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourcePath: "docs/manual/bluetape4k-projects/en/modules/bluetape4k-cache-hazelcast/jcache-instance-ownership.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "8165a8989e0075e7c17c489bf3000bf41fef8232"
  sourceDir: "docs/manual/bluetape4k-projects"
  layer: "build"
---


## The provider is explicit, not SPI-discovered

The module's `META-INF/services/javax.cache.spi.CachingProvider` file contains no provider class. `HazelcastJCaching.cacheManagerOf` constructs `HazelcastCachingProvider` and passes the connected instance through `propertiesByInstanceItself(hazelcastInstance)`.

```kotlin
val manager = HazelcastJCaching.cacheManagerOf(hazelcast)
val users = HazelcastJCaching.getOrCreate<String, User>(
    hazelcastInstance = hazelcast,
    name = "users-v1",
    configuration = MutableConfiguration<String, User>().apply {
        setTypes(String::class.java, User::class.java)
    },
)
```

Do not assume that Hazelcast is the default provider on the classpath. This factory path explicitly selects the supplied Hazelcast instance even when the application uses multiple JCache providers.

## Cache identity includes the cluster and name

`getOrCreate` looks up a cache by name and creates it from the configuration only when absent. Reusing a name in one cluster shares distributed data with every component using that name. Include a domain and schema generation in the name.

`MutableConfiguration.setTypes` makes the typed JCache contract explicit but does not define Hazelcast wire serialization. Configure serializers and schema compatibility at the cluster boundary.

## Separate proxy, data, and instance lifecycle

`HazelcastJCaching` receives an externally owned `HazelcastInstance`; the module source never calls `shutdown()`. Closing a cache or manager is separate from shutting down the client or member.

```kotlin
try {
    users.put("42", user)
} finally {
    users.close()
    // The application lifecycle owner closes hazelcast later.
}
```

Near-cache `close` also removes only its listener and L1. It neither destroys the `IMap` nor shuts down Hazelcast. Keep deployment shutdown, proxy close, and distributed-data deletion as separate actions.

## Sources and tests

- [`HazelcastJCaching.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/jcache/HazelcastJCaching.kt)
- [`HazelcastCaches.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/cache/cache-hazelcast/src/main/kotlin/io/bluetape4k/cache/HazelcastCaches.kt)
- [`CachingProvider` service resource](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/cache/cache-hazelcast/src/main/resources/META-INF/services/javax.cache.spi.CachingProvider)
- [`HazelcastCachesTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/2.0.0/cache/cache-hazelcast/src/test/kotlin/io/bluetape4k/cache/HazelcastCachesTest.kt)
