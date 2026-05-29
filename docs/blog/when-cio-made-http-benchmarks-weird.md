# Ktor CIO가 HTTP 벤치마크를 이상하게 만들었을 때

`bluetape4k-projects`의 `io/http` 모듈은 여러 HTTP client를 한 abstraction 아래에서
사용할 수 있게 한다. Apache HC5, OkHttp3, Java `HttpClient`, Vert.x WebClient, Ktor CIO를
같은 API로 다룰 수 있다.

이런 라이브러리에서 가장 위험한 문장은 "취향대로 고르면 됩니다"다. 실제로는 workload마다
연결 재사용, coroutine bridge, virtual thread, server fixture, pool 설정이 모두 다르게 작동한다.
그래서 issue [#589](https://github.com/bluetape4k/bluetape4k-projects/issues/589)는 단순한
튜닝 티켓이 아니라 "숫자로 보고 결정하자"는 작은 캠페인이었다.

그리고 첫 측정에서 Ktor CIO가 꽤 황당한 숫자를 냈다.

![HTTP client base throughput chart](/assets/io-http-base-throughput-chart-01.png)

## 처음에는 CIO가 너무 느렸다

처음 Ktor CIO row를 넣었을 때의 기분은 좋지 않았다. `/ping`에서는 659.071 ops/s,
50 ms delay endpoint에서는 16.501 ops/s였다. 같은 benchmark에서 다른 client들은 훨씬 높은
throughput을 내고 있었기 때문에, 표만 보면 "이걸 왜 넣었지?"에 가까웠다.

하지만 그 숫자는 공정한 결론이 아니었다. CIO를 전체 JMH concurrency로 돌리면 Docker fixture에서
local ephemeral port가 먼저 바닥났고, 그래서 CIO row만 한 thread로 제한한 상태였다. 즉, 같은 표에
있지만 같은 경기 규칙이 아니었다.

그래서 issue [#587](https://github.com/bluetape4k/bluetape4k-projects/issues/587)의 핵심은
"CIO를 빠르게 보이게 하자"가 아니라 "CIO를 같은 조건에서 재자"였다. 실망스러운 숫자를 지우는 대신,
왜 실망스러웠는지 기록하고 fixture를 고쳤다.

## 첫 번째 수확은 Vert.x였다

issue [#590](https://github.com/bluetape4k/bluetape4k-projects/issues/590)과
PR [#593](https://github.com/bluetape4k/bluetape4k-projects/pull/593)에서 가장 극적인 변화는
Ktor가 아니라 Vert.x였다.

Vert.x WebClient benchmark는 기본 HTTP/1 pool cap의 영향을 받고 있었다. benchmark가 client 자체의
능력을 재는 것이 아니라, fixture와 default pool 설정이 만든 병목을 재고 있던 셈이다. `PoolOptions`를
명시하자 high-latency throughput은 87.844 ops/s에서 1,818.508 ops/s로 올라갔다. 약 20.7배다.

이 숫자는 좋은 optimization 이야기처럼 보이지만, 실제 교훈은 더 단순하다.

> Benchmark가 느린 이유가 항상 production code에 있지는 않다. 측정 장치가 먼저 의심받아야 한다.

## 같은 서버, 같은 concurrency

PR [#594](https://github.com/bluetape4k/bluetape4k-projects/pull/594)는 측정 조건을 다시 정리했다.

- HTTP client benchmark fixture를 `BluetapeWebfluxServer`로 맞췄다.
- CIO만 한 thread로 돌리는 예외를 제거했다.
- 모든 row가 class-level JMH thread count를 사용하게 했다.
- local port exhaustion을 피하기 위해 warmup 1초, measurement 1초의 짧은 equal-thread snapshot으로 맞췄다.

이 결정이 마음에 드는 이유는 "CIO가 이겼다" 같은 결론을 만들지 않았기 때문이다. 반대로 CIO의 한계를
정면으로 드러낸다. Ktor CIO 3.5는 pipelining을 끄면 HTTP/1 connection을 적극적으로 열고,
`pipelining=true`를 강제로 켜면 local mock fixture에서 `ClosedReadChannelException: unexpected EOF`
또는 hang을 만들었다. 그래서 이번 글의 결론도 과장하지 않는다. default CIO behavior를 유지하고,
같은 concurrency에서 짧게 비교한다.

## 최종 snapshot

Base `/ping` benchmark는 connection reuse와 local variance에 민감하다. production ranking이 아니라
"같은 fixture에서 같은 순간에 본 스냅샷"으로 읽어야 한다.

| Client row | `/ping` ops/s |
|---|---:|
| Java `HttpClient` sync | 7,276.492 |
| HC5 classic virtual thread | 7,246.690 |
| OkHttp3 virtual thread | 6,955.796 |
| Vert.x WebClient coroutines | 6,043.906 |
| Ktor CIO coroutines | 2,052.281 |

High-latency endpoint는 더 흥미롭다. 50 ms delay가 들어가면 blocking, coroutine, virtual thread의
차이가 단순 CPU loop보다 실제 service wait time에 가까워진다.

![HTTP client high-latency throughput chart](/assets/io-http-high-latency-throughput-chart-01.png)

| Client row | 50 ms delay ops/s |
|---|---:|
| OkHttp3 virtual thread | 1,902.171 |
| HC5 classic virtual thread | 1,888.018 |
| Java `HttpClient` virtual thread | 1,883.634 |
| HC5 classic | 1,880.023 |
| HC5 async coroutines | 1,860.655 |
| Vert.x WebClient coroutines | 1,859.003 |
| Ktor CIO coroutines | 1,515.026 |
| HC5 classic coroutines | 1,216.306 |

CIO는 여전히 선두권이 아니다. 하지만 처음의 16.501 ops/s 같은 "이건 뭔가 망했다" 수치와는 다른
이야기다. 공정한 조건에서는 1,515.026 ops/s까지 올라왔고, 그 대신 connection behavior와 fixture
compatibility라는 숙제가 남았다.

## 여기서 얻은 선택 기준

이 benchmark 이후 `io/http`의 client 선택은 감으로 말하기 어려워졌다. 적어도 다음 기준은 생겼다.

| 상황 | 먼저 볼 선택지 |
|---|---|
| 짧은 local call, sync API, 단순 사용성 | Java `HttpClient`, HC5 classic |
| wait-heavy HTTP workload | OkHttp3/HC5/Java virtual thread path |
| coroutine-native integration과 non-blocking client가 중요함 | HC5 async, Vert.x WebClient |
| Ktor stack과 통합성이 더 중요함 | Ktor CIO, 단 long-run capacity는 별도 fixture로 재측정 |

핵심은 "가장 빠른 client 하나"가 아니다. `io/http`가 제공해야 하는 것은 workload에 따라 선택할 수
있는 검증된 경로다. 이번 작업은 그 표면을 만들었다.

## 숫자보다 좋았던 것

개인적으로 이번 작업에서 제일 좋은 결과는 Vert.x 20배 향상도, CIO 복권도 아니었다. 느린 숫자가
나왔을 때 바로 implementation을 고치지 않고, benchmark fixture를 의심한 것이다.

처음 CIO 숫자를 봤을 때는 솔직히 실망스러웠다. "Ktor 3까지 붙였는데 이 정도면 블로그에 쓰기도
민망한데?"라는 생각이 먼저 들었다. 그런데 그 민망함 덕분에 측정 조건을 다시 봤고, 결국 더 좋은
기록이 남았다.

- [#589](https://github.com/bluetape4k/bluetape4k-projects/issues/589): benchmark-driven HTTP component performance epic
- [#590](https://github.com/bluetape4k/bluetape4k-projects/issues/590): benchmark-gated self-improve track
- [#587](https://github.com/bluetape4k/bluetape4k-projects/issues/587): Ktor CIO benchmark inclusion and fair comparison
- [PR #593](https://github.com/bluetape4k/bluetape4k-projects/pull/593): Vert.x pool tuning and initial CIO rows
- [PR #594](https://github.com/bluetape4k/bluetape4k-projects/pull/594): WebFlux fixture and equal-thread CIO comparison
- [Benchmark report](https://github.com/bluetape4k/bluetape4k-projects/blob/develop/docs/benchmarks/2026-05-21-io-http-client-benchmark.md)

Benchmark는 "내 코드 빠르다"를 증명하는 도구가 아니다. 가끔은 "내가 방금 본 숫자는 믿으면 안 된다"를
알려주는 도구다. 이번 `io/http` 작업은 그쪽에 가까웠고, 그래서 더 쓸모 있었다.
