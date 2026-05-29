---
title: "Virtual Threads Part 4: Hiding Java 21 and Java 25 Behind One API"
description: How bluetape4k exposes a common virtual-thread API while separating Java 21 and Java 25 implementations through ServiceLoader SPI.
sidebar:
  order: -202605291103
blog:
  date: 2026-05-29T11:03:00+09:00
  image: /assets/virtual-threads-part4-spi-01.png
  imageAlt: ServiceLoader module layout for Java 21 and Java 25 virtual thread runtimes
  cardDescription: "Hide Java 21/25 differences inside runtime providers and keep application code on one Virtual Threads API."
---

<figure class="bt4k-blog-hero">
  <img src="/assets/virtual-threads-part4-spi-01.png" alt="ServiceLoader module layout for Java 21 and Java 25 virtual thread runtimes" loading="eager" />
  <figcaption>Hide Java 21/25 differences inside runtime providers and keep application code on one Virtual Threads API.</figcaption>
</figure>

<p class="bt4k-post-meta">2026-05-29 · Virtual Threads series · Part 4</p>

This is Part 4 of the Virtual Threads series. The full series continues with
[Part 1: introduction and cautions](/blog/virtual-threads-part1-guide/),
[Part 2: workshop rules](/blog/virtual-threads-part2-workshop-rules/),
[Part 3: JDBC + Virtual Threads benchmark](/blog/virtual-threads-part3-jdbc-r2dbc-benchmark/), and
[Part 4: Java 21/25 SPI design](/blog/virtual-threads-part4-java21-java25-spi/).

Part 1 explained how to think about Virtual Threads. Part 2 covered workshop rules. Part 3 used
`bluetape4k-exposed` benchmarks to show why JDBC + Virtual Threads can beat R2DBC + Coroutines
more often than expected.

The final topic is library design: how do we keep application code simple while still supporting
different JDK lines internally?

> Can we support Java 21 and Java 25 while exposing only one API to application code?

The `virtualthread` module in `bluetape4k-projects` splits the problem into a common API and
JDK-specific runtime providers. If application code has to ask "am I on Java 21 or Java 25?"
everywhere, too much implementation detail has leaked out.


The key is that the application does not know the `jdk21` or `jdk25` implementation classes. It
calls the common API. `ServiceLoader` selects the runtime provider. The Java-version-specific
part stays inside the artifact and provider implementation.

## Java 21 and Java 25

Java 21 is the Virtual Threads baseline. [JEP 444](https://openjdk.org/jeps/444) made Virtual
Threads final, and it gives us the core tools: `Executors.newVirtualThreadPerTaskExecutor()`,
`Thread.ofVirtual()`, thread dumps, and JFR observability.

Java 25 does not reinvent Virtual Threads. It is an LTS point that carries forward Loom-related
improvements after Java 21.

| Release | Meaning for Virtual Threads |
|---|---|
| Java 21 | Virtual Threads final, thread-per-task APIs available |
| Java 24 | [JEP 491](https://openjdk.org/jeps/491) reduces `synchronized` pinning |
| Java 25 | LTS. [Scoped Values](https://openjdk.org/jeps/506) final, Structured Concurrency remains preview |

The [JDK 25 project page](https://openjdk.org/projects/jdk/25/) includes Structured Concurrency
and Scoped Values in its feature list. Scoped Values are especially useful with Virtual Threads
because they offer a more predictable context model than ThreadLocal for scoped, read-only
values.

But a library should not expose Java 25 APIs as compile-time API if it must still run on Java
21. Application code should see the common API, while runtime modules vary by JDK.

## Common API: `VirtualThreadRuntime`

The core interface should stay small.

```kotlin
interface VirtualThreadRuntime {
    val name: String
    val priority: Int

    fun newThreadPerTaskExecutor(): ExecutorService
    fun threadFactory(namePrefix: String? = null): ThreadFactory
}
```

Application code does not need to know how Java 21 and Java 25 differ. It only needs an
executor, a factory, and stable behavior.

## Provider Selection with ServiceLoader

The runtime loader can discover providers through `ServiceLoader` and pick the highest-priority
available implementation.

```kotlin
object VirtualThreadRuntimes {
    private val runtime: VirtualThreadRuntime by lazy {
        ServiceLoader.load(VirtualThreadRuntime::class.java)
            .sortedByDescending { it.priority }
            .firstOrNull()
            ?: Jdk21VirtualThreadRuntime()
    }

    fun current(): VirtualThreadRuntime = runtime
}
```

The fallback is important. A project should still work with the baseline Java 21 provider even
when no optional provider artifact is present.

## Java 21 Provider

The Java 21 provider uses the stable Virtual Threads API.

```kotlin
class Jdk21VirtualThreadRuntime : VirtualThreadRuntime {
    override val name: String = "jdk21"
    override val priority: Int = 100

    override fun newThreadPerTaskExecutor(): ExecutorService =
        Executors.newVirtualThreadPerTaskExecutor()

    override fun threadFactory(namePrefix: String?): ThreadFactory {
        val builder = Thread.ofVirtual()
        return if (namePrefix == null) {
            builder.factory()
        } else {
            builder.name(namePrefix, 0).factory()
        }
    }
}
```

This provider is the baseline. It depends only on Java 21 final APIs and is safe for the core
line.

## Java 25 Provider

The Java 25 provider can use newer runtime behavior and expose different internals without
changing the application API. For example, it can prefer Scoped Values for context helpers or
use Java 25-specific implementation strategies behind the same interface.

```kotlin
class Jdk25VirtualThreadRuntime : VirtualThreadRuntime {
    override val name: String = "jdk25"
    override val priority: Int = 200

    override fun newThreadPerTaskExecutor(): ExecutorService =
        Executors.newVirtualThreadPerTaskExecutor()

    override fun threadFactory(namePrefix: String?): ThreadFactory =
        Thread.ofVirtual()
            .let { builder ->
                if (namePrefix == null) builder else builder.name(namePrefix, 0)
            }
            .factory()
}
```

The application still calls the same API. The runtime module decides what can be used.

## Module Shape

The module layout is intentionally split.

| Module | Role |
|---|---|
| `virtualthread/api` | Common interfaces and facade |
| `virtualthread/jdk21` | Java 21 implementation and fallback provider |
| `virtualthread/jdk25` | Java 25 implementation |
| application | Depends on API plus the runtime artifact matching the deployment JDK |

Each runtime artifact registers its provider under:

```text
META-INF/services/io.bluetape4k.virtualthread.VirtualThreadRuntime
```

That keeps Java-version-specific classes out of the application-facing API.

## Gradle Usage

An application can choose the provider line explicitly.

```kotlin
dependencies {
    implementation("io.bluetape4k:bluetape4k-virtualthread-api")
    runtimeOnly("io.bluetape4k:bluetape4k-virtualthread-jdk25")
}
```

For Java 21 deployments:

```kotlin
dependencies {
    implementation("io.bluetape4k:bluetape4k-virtualthread-api")
    runtimeOnly("io.bluetape4k:bluetape4k-virtualthread-jdk21")
}
```

The compile-time dependency remains stable. The runtime artifact changes by deployment target.

## Example: Application Code Does Not Change

The application code is the same on Java 21 and Java 25.

```kotlin
class BlockingReportService(
    private val repository: ReportRepository,
) {
    fun generate(ids: List<Long>): List<Report> =
        VirtualThreads.executorService().use { executor ->
            ids.map { id ->
                executor.submit<Report> {
                    repository.loadAndRender(id)
                }
            }.map { future ->
                future.get()
            }
        }
}
```

`repository.loadAndRender(id)` can use JDBC or a blocking SDK. The Virtual Thread handles the
blocking wait. The rules from Part 1 still apply: DB connection pools, timeouts, and downstream
concurrency must be limited separately. A simpler API does not remove operational constraints.

## Series Conclusion

Virtual Threads are now a practical option for Java/Kotlin backend services.

- Part 1: Virtual Threads are cheap threads, not magic threads.
- Part 2: workshop rules keep pooling, semaphores, context, and locks honest.
- Part 3: in batch workloads, JDBC + Virtual Threads can beat R2DBC + Coroutines more often
  than expected.
- Part 4: a library can hide Java 21/25 differences behind a common API and runtime providers.

My favorite conclusion is this: Virtual Threads do not replace reactive programming or
coroutines. They make the existing blocking ecosystem worth measuring again. A good library does
not have to force one style. It should leave a clean path for the workload and runtime in front
of it.
