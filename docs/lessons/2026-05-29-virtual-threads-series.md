# Virtual Threads 블로그 시리즈

## 배경

Java Virtual Threads를 다루는 한국어 블로그 시리즈 네 편을 게시했다. introduction과 production caution, `bluetape4k-workshop/virtualthreads/rules` 예제, `bluetape4k-exposed` JDBC/R2DBC benchmark 근거, `bluetape4k-projects`의 Java 21/25 SPI 설계를 포함한다.

## 결정

주제를 하나의 긴 글이 아니라 네 개의 집중된 글로 나눈다.

- Part 1: 개념, 적합성, 운영상 주의점
- Part 2: pooling, semaphore, ScopedValue, lock code example을 포함한 workshop rule
- Part 3: benchmark 기반 JDBC + Virtual Threads 대 R2DBC + Coroutines 이야기
- Part 4: Java 21/25 공용 API와 `ServiceLoader` runtime-provider 설계

## 근거

- Java 21 Virtual Threads의 OpenJDK JEP 444
- synchronized-without-pinning 동작이 이후 JDK에 반영된 내용을 설명하는 OpenJDK JEP 491
- OpenJDK JDK 25 feature list와 Scoped Values의 JEP 506
- H2, MySQL, PostgreSQL에 대한 `bluetape4k-exposed/utils/batch/benchmark` 결과
- `bluetape4k-projects/virtualthread` API README와 source summary

## 향후 규칙

performance나 runtime version 글을 작성할 때는 주장을 측정한 workload 범위로 한정하고, 주장을 어떻게 검증했는지 보여주는 짧은 code path 또는 command를 포함한다.
