---
title: "Virtual Threads 4편: Java 21과 Java 25를 하나의 API 뒤에 숨기기"
description: bluetape4k가 공통 Virtual Thread API를 제공하면서 Java 21과 Java 25 구현을 ServiceLoader SPI로 분리하는 방식을 설명한다.
sidebar:
  order: -202605291103
blog:
  date: 2026-05-29T11:03:00+09:00
  image: /assets/virtual-threads-part4-hero.png
  imageAlt: 하나의 SPI가 Java 21과 Java 25 런타임 구현을 연결하는 소개용 일러스트
  cardDescription: "Java 21/25 차이는 런타임 provider 안에 숨기고 애플리케이션 코드는 하나의 Virtual Threads API만 사용하게 한다."
---

<figure class="bt4k-blog-hero">
  <img src="/assets/virtual-threads-part4-hero.png" alt="하나의 SPI가 Java 21과 Java 25 런타임 구현을 연결하는 소개용 일러스트" loading="eager" />
  <figcaption>SPI 경계를 제대로 단순하게 만들면 하나의 공개 API 뒤에 두 런타임 선택지를 숨길 수 있다.</figcaption>
</figure>

<p class="bt4k-post-meta">2026-05-29 · Virtual Threads 시리즈 · Part 4</p>

이 글은 Virtual Threads 시리즈의 4편이다. 전체 시리즈는
[Part 1: 소개와 주의점](/blog/virtual-threads-part1-guide/),
[Part 2: 워크숍 규칙](/blog/virtual-threads-part2-workshop-rules/),
[Part 3: JDBC + Virtual Threads 벤치마크](/blog/virtual-threads-part3-jdbc-r2dbc-benchmark/),
[Part 4: Java 21/25 SPI 설계](/blog/virtual-threads-part4-java21-java25-spi/)로 이어진다.

Part 1에서는 Virtual Threads를 어떻게 바라볼지 정리했고, Part 2에서는 워크숍 규칙을 다뤘다. Part 3에서는
`bluetape4k-exposed` 벤치마크를 통해 JDBC + Virtual Threads가 예상보다 자주 R2DBC + Coroutines를
앞설 수 있는 이유를 확인했다.

마지막 주제는 라이브러리 설계다. 내부에서 서로 다른 JDK 계열을 지원하면서 애플리케이션 코드는 어떻게
단순하게 유지할 수 있을까?

> Java 21과 Java 25를 지원하면서 애플리케이션 코드에는 하나의 API만 보여줄 수 있을까?

`bluetape4k-projects`의 `virtualthread` 모듈은 이 문제를 공통 API와 JDK별 런타임 provider로 나눈다.
애플리케이션 코드가 어디서나 "지금 Java 21인가, Java 25인가?"를 물어야 한다면 구현 세부 정보가
너무 많이 새어 나온 것이다.


핵심은 애플리케이션이 `jdk21`이나 `jdk25` 구현 클래스를 알지 않는다는 점이다. 애플리케이션은 공통 API를
호출하고, `ServiceLoader`가 런타임 provider를 선택한다. Java 버전별 차이는 artifact와 provider 구현
내부에 남는다.

<figure class="bt4k-architecture">
  <img src="/assets/virtual-threads-part4-spi-01.png" alt="ServiceLoader를 사용하는 Java 21과 Java 25 Virtual Thread 런타임 모듈 구성" loading="lazy" />
  <figcaption>Java 21/25 차이는 런타임 provider 안에 숨기고 애플리케이션 코드는 하나의 Virtual Threads API만 사용하게 한다.</figcaption>
</figure>

## Java 21과 Java 25

Java 21은 Virtual Threads의 기준선이다. [JEP 444](https://openjdk.org/jeps/444)로 Virtual Threads가
정식 기능이 됐고, `Executors.newVirtualThreadPerTaskExecutor()`, `Thread.ofVirtual()`, thread dump,
JFR 관찰성 같은 핵심 도구를 제공한다.

Java 25는 Virtual Threads를 새로 발명한 릴리스가 아니다. Java 21 이후의 Loom 관련 개선을 이어받은
LTS 지점이다.

| 릴리스 | Virtual Threads 관점의 의미 |
|---|---|
| Java 21 | Virtual Threads 정식 제공, thread-per-task API 사용 가능 |
| Java 24 | [JEP 491](https://openjdk.org/jeps/491)으로 `synchronized` pinning 완화 |
| Java 25 | LTS. [Scoped Values](https://openjdk.org/jeps/506) 정식 제공, Structured Concurrency는 preview 유지 |

기능 목록은 [JDK 25 project page](https://openjdk.org/projects/jdk/25/)에서 확인할 수 있다. Scoped Values는
scope 안에서 읽기 전용으로 사용하는 값에 대해 ThreadLocal보다 예측 가능한 context 모델을 제공하므로
Virtual Threads와 함께 사용할 때 특히 유용하다.

하지만 Java 21에서도 실행해야 하는 라이브러리가 Java 25 API를 compile-time API로 노출해서는 안 된다.
애플리케이션 코드는 공통 API를 보고, 런타임 모듈만 JDK에 따라 달라져야 한다.

## 공통 API: `VirtualThreadRuntime`

핵심 interface는 작게 유지해야 한다.

```kotlin
interface VirtualThreadRuntime {
    val name: String
    val priority: Int

    fun newThreadPerTaskExecutor(): ExecutorService
    fun threadFactory(namePrefix: String? = null): ThreadFactory
}
```

애플리케이션 코드는 Java 21과 Java 25의 차이를 알 필요가 없다. executor, factory, 그리고 안정적인
동작만 알면 된다.

## ServiceLoader를 사용한 Provider 선택

런타임 loader는 `ServiceLoader`로 provider를 찾고, 사용 가능한 구현 중 priority가 가장 높은 것을
선택할 수 있다.

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

fallback이 중요하다. 선택적 provider artifact가 없어도 프로젝트가 기준선인 Java 21 provider로 동작해야
한다.

## Java 21 Provider

Java 21 provider는 안정적인 Virtual Threads API를 사용한다.

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

이 provider가 기준선이다. Java 21 정식 API에만 의존하므로 core 계열에서 안전하게 사용할 수 있다.

## Java 25 Provider

Java 25 provider는 애플리케이션 API를 바꾸지 않고 더 새로운 런타임 동작과 다른 내부 구현을 사용할 수 있다.
예를 들어 context helper에서 Scoped Values를 우선하거나, 같은 interface 뒤에 Java 25 전용 구현 전략을
둘 수 있다.

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

애플리케이션은 여전히 같은 API를 호출한다. 무엇을 사용할지는 런타임 모듈이 결정한다.

## 모듈 구성

모듈 구성은 의도적으로 분리한다.

| 모듈 | 역할 |
|---|---|
| `virtualthread/api` | 공통 interface와 facade |
| `virtualthread/jdk21` | Java 21 구현과 fallback provider |
| `virtualthread/jdk25` | Java 25 구현 |
| application | API와 배포 JDK에 맞는 런타임 artifact에 의존 |

Each runtime artifact registers its provider under:

```text
META-INF/services/io.bluetape4k.virtualthread.VirtualThreadRuntime
```

이렇게 하면 Java 버전별 클래스가 애플리케이션용 API 밖으로 드러나지 않는다.

## Gradle 사용

애플리케이션은 사용할 provider 계열을 명시적으로 선택할 수 있다.

```kotlin
dependencies {
    implementation("io.bluetape4k:bluetape4k-virtualthread-api")
    runtimeOnly("io.bluetape4k:bluetape4k-virtualthread-jdk25")
}
```

Java 21 배포에서는 다음과 같이 선언한다.

```kotlin
dependencies {
    implementation("io.bluetape4k:bluetape4k-virtualthread-api")
    runtimeOnly("io.bluetape4k:bluetape4k-virtualthread-jdk21")
}
```

compile-time dependency는 안정적으로 유지되고, runtime artifact만 배포 대상에 따라 바뀐다.

## 예제: 애플리케이션 코드는 바뀌지 않는다

Java 21과 Java 25에서 애플리케이션 코드는 같다.

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

`repository.loadAndRender(id)`는 JDBC나 blocking SDK를 사용해도 된다. Virtual Thread가 blocking 대기를
담당한다. 다만 Part 1의 규칙은 그대로 적용된다. DB connection pool, timeout, downstream 동시성은
각각 제한해야 한다. API가 단순해져도 운영 제약이 사라지는 것은 아니다.

## 시리즈 결론

Virtual Threads는 이제 Java/Kotlin backend 서비스에서 실용적인 선택지다.

- Part 1: Virtual Threads는 저비용 스레드이지 마법의 스레드가 아니다.
- Part 2: 워크숍 규칙은 pooling, semaphore, context, lock의 한계를 분명하게 만든다.
- Part 3: batch workload에서는 JDBC + Virtual Threads가 예상보다 자주 R2DBC + Coroutines를 앞설 수 있다.
- Part 4: 라이브러리는 공통 API와 런타임 provider 뒤에 Java 21/25 차이를 숨길 수 있다.

가장 중요한 결론은 이렇다. Virtual Threads는 reactive programming이나 coroutines를 대체하지 않는다.
기존 blocking 생태계를 다시 측정해 볼 가치가 있게 만든다. 좋은 라이브러리는 한 가지 스타일을 강요할
필요가 없다. 현재 workload와 runtime에 맞는 경로를 깔끔하게 열어 두면 된다.
