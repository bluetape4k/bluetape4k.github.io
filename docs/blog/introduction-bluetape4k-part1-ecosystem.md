---
title: Bluetape4k 생태계 한눈에 보기
description: Bluetape4k 소개 시리즈 Part 1. 애플리케이션, 도메인 기능, 데이터, 인프라, 기반 계층으로 전체 구조를 짚어봅니다.
sidebar:
  order: -202605200000
blog:
  date: 2026-05-20T00:00:00+09:00
  image: /assets/bluetape4k-ecosystem-hero.png
  imageAlt: Bluetape4k 백엔드 생태계를 연결된 구성 요소로 보여 주는 소개용 일러스트
  cardDescription: "Spring Boot 4, Ktor 3, 도메인 기능, 데이터, 인프라, 기반 계층으로 Bluetape4k 전체 구조를 정리합니다."
---

<figure class="bt4k-blog-hero">
  <img src="/assets/bluetape4k-ecosystem-hero.png" alt="Bluetape4k 백엔드 생태계를 연결된 Kotlin/JVM 구성 요소로 보여 주는 일러스트" loading="eager" />
  <figcaption>Bluetape4k는 하나의 거대한 프레임워크가 아니라, Spring Boot 4와 Ktor 3 서비스가 필요한 경계부터 골라 붙일 수 있는 Kotlin/JVM 백엔드 모듈 생태계입니다.</figcaption>
</figure>

Bluetape4k를 처음 보면 저장소가 많다. `projects`, `exposed`, `aws`, `image`, `text`, `leader`,
`javers`, `graph`, `dependencies`가 따로 있고, 각 저장소 안에도 여러 모듈이 있다. 그래서 첫 글은
"무엇을 어디서부터 읽어야 하는가"를 위한 지도에 가깝게 쓰는 편이 낫다.

핵심 구조는 단순하다. Spring Boot 4나 Ktor 3가 애플리케이션 경계를 맡고, Bluetape4k는 그 아래의 도메인 기능,
데이터, 인프라, 기반 계층을 채운다. 모든 모듈을 가져오는 방식이 아니라, 필요한 경계에 맞춰 작은 조합을 고르는
방식이다.

<figure class="bt4k-architecture" data-diagram-title="Bluetape4k 생태계의 계층과 선택 경계">
  <img src="/assets/bluetape4k-ecosystem-overview-ko.png" alt="Spring Boot 4 또는 Ktor 3 서비스가 애플리케이션 경계를 소유하고, Bluetape4k의 도메인 기능, 데이터, 인프라, 기반 계층 중 필요한 부분만 선택해 조합하는 책임 지도" loading="lazy" />
  <figcaption>애플리케이션은 서비스가 소유하고, Bluetape4k는 서비스가 실제로 만나는 문제와 경계에 맞춰 선택합니다.</figcaption>
</figure>

## 전체 계층 구조

<table>
  <thead>
    <tr>
      <th>계층</th>
      <th>역할</th>
      <th>대표 저장소와 모듈</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>애플리케이션</td>
      <td>Spring Boot 4, Ktor 3 애플리케이션 경계</td>
      <td>`spring-boot/*`, `*-ktor`, examples</td>
    </tr>
    <tr>
      <td>도메인 기능</td>
      <td>서비스 도메인에 가까운 기능 묶음</td>
      <td>Leader, JaVers, Image, Text, Graph</td>
    </tr>
    <tr>
      <td>데이터</td>
      <td>JDBC, R2DBC, Exposed, 문서형·와이드 컬럼 데이터베이스 도우미</td>
      <td>Exposed, `data/*`, GraphDB adapter</td>
    </tr>
    <tr>
      <td>인프라</td>
      <td>클라우드, 메시징, 캐시, 관측성, 복원력</td>
      <td>AWS, Kafka, NATS, Redis, Micrometer, OpenTelemetry, Resilience4j</td>
    </tr>
    <tr>
      <td>기반</td>
      <td>Kotlin/JVM 공통 기반</td>
      <td>core, coroutines, logging, testing, BOM</td>
    </tr>
  </tbody>
</table>

이 표는 의존성 그래프라기보다 읽는 순서다. 처음에는 기반 계층을 보고, 서비스가 실제로 만나는 경계에 따라
데이터·인프라·도메인 기능을 고르면 된다.

## 애플리케이션 계층

애플리케이션 계층은 Spring Boot 4나 Ktor 3가 담당한다. Bluetape4k는 애플리케이션 프레임워크를 대체하지
않는다. 대신 프레임워크 안에서 반복되는 자동 구성, 코루틴 데이터 접근, Redis 캐시, 클라우드 통합, 예제 구성을
제공한다.

### Spring Boot 4

개발 목적은 Spring Boot 4 애플리케이션에서 Bluetape4k의 데이터·캐시·인프라·테스트 모듈을 자연스럽게 연결하는
것이다.

주요 모듈은 다음과 같다.

- `spring-boot/core`: Spring Boot 자동 구성과 공통 속성 바인딩
- `spring-boot/r2dbc`: R2DBC 기반 코루틴 데이터 접근 통합
- `spring-boot/redis`: Redis/Lettuce 기반 애플리케이션 캐시와 Redis 통합
- `spring-boot/mongodb`, `spring-boot/cassandra`: 문서형·와이드 컬럼 데이터베이스 통합
- `spring-boot/hibernate-lettuce`: Hibernate 2차 캐시와 Lettuce 캐시 통합

대표 기능은 코루틴, R2DBC, Redis, MongoDB, Cassandra 같은 서비스 경계를 Spring Boot 안에서 일관되게 연결하는
것이다. 애플리케이션이 프레임워크 연결 코드를 반복해서 직접 쓰지 않도록 돕는다.

### Ktor 3

Ktor 쪽은 suspend API와 코루틴 클라이언트를 중심으로 한 애플리케이션 경계를 맡는다. Spring Boot보다 가벼운
런타임을 원하는 서비스가 AWS, 리더 선출, 그래프 데이터베이스 같은 기능을 붙일 때 쓴다.

주요 모듈은 다음과 같다.

- `aws-ktor`: Ktor 서비스에서 AWS SDK 도우미를 쓰기 위한 통합
- `leader-ktor`: Ktor 애플리케이션에서 리더 선출을 연결하는 통합
- `graph-ktor`: 그래프 데이터베이스 기능을 Ktor 경계에 연결하는 통합
- `examples/aws-ktor-*`: AWS, 리더 선출, 그래프 데이터베이스 기능을 함께 보여주는 예제

Ktor 3 모듈은 "프레임워크를 새로 만든다"기보다, Ktor 서비스 안에서 Bluetape4k 모듈을 쓰는 도입 경로를
제공한다.

## 도메인 기능 계층

도메인 기능 계층은 서비스 도메인에 가까운 기능을 맡는다. 리더 선출, 감사 이력, 이미지 처리, 텍스트 처리,
그래프 데이터베이스처럼 기반 유틸리티만으로 설명하기 어려운 영역이다.

### Leader

Leader 모듈의 목적은 분산 환경에서 배치, 스케줄러, 폴링 작업자, 마이그레이션 게이트 같은 작업을
안전하게 한 노드 또는 일부 노드에 맡기는 것이다.

주요 모듈은 다음과 같다.

- `leader-core`: 리더 선출 API와 실행 모델
- `leader-redis-lettuce`, `leader-redis-redisson`: Redis 기반 백엔드
- `leader-hazelcast`, `leader-mongodb`, `leader-zookeeper`: 여러 분산 백엔드
- `leader-exposed-jdbc`, `leader-exposed-r2dbc`: 데이터베이스 기반 백엔드
- `leader-spring-boot`, `leader-ktor`: 애플리케이션 프레임워크 통합

대표 기능은 `runIfLeader()` API, blocking/`CompletableFuture`/코루틴/Virtual Threads 실행 모델,
`LeaderGroupElector` 기반 다중 리더 처리다. 단일 리더만 필요한 작업부터 여러 작업자를 제한적으로 선발해야 하는
작업까지 다룬다.

### JaVers

JaVers 모듈은 애그리게이트와 도메인 객체의 변경 이력을 저장하고 조회하는 감사 이력 영역을 맡는다.

주요 모듈은 다음과 같다.

- `javers-core`: JaVers 도우미, 코덱, 캐시 기반 리포지터리 지원
- `javers-persistence-redis`: Redis Lettuce/Redisson 기반 스냅샷 저장소
- `javers-persistence-kafka`: Kafka 이벤트 스트림 기반 영속화
- `bom`: JaVers 관련 의존성 버전 정렬

대표 기능은 애그리게이트·도메인 객체 단위의 변경 이력, Redis 또는 Kafka 기반 감사 이력 저장소, DDD 모델에서
차이·스냅샷·이력을 조회하는 기능이다.

### Image

Image 모듈은 일반적인 JVM 이미지 처리와 libvips 기반 대량 처리를 같은 생태계 안에서 선택할 수
있게 한다.

주요 모듈은 다음과 같다.

- `images`: Scrimage 기반 순수 JVM 이미지 처리
- `images-vips-api`: libvips 추상화와 공통 API
- `images-vips-java21`: Java 21 JVips/JNI 백엔드
- `images-vips-java25`: Java 25 FFM/Panama 백엔드
- `images-spring-boot`, `images-benchmark`: Spring Boot 통합과 벤치마크

대표 기능은 크기 조정, 자르기, 필터, 인코딩, 일괄 처리다. 일반적인 이미지 작업은 순수 JVM으로 시작하고,
대량 썸네일·크기 조정 파이프라인은 libvips 백엔드로 옮길 수 있다.

### Text

Text 모듈은 한국어·일본어 중심 토크나이저, 언어 감지, 키워드 검색을 Kotlin 서비스에서
재사용할 수 있게 한다.

주요 모듈은 다음과 같다.

- `tokenizer-core`: 토크나이저 공통 요청·응답 모델과 사전 유틸리티
- `tokenizer-korean`: 한국어 정규화, 품사 토큰화, 구문 추출
- `tokenizer-japanese`: Kuromoji IPAdic 기반 일본어 토큰화
- `lingua`: Lingua 기반 언어 감지
- `text-search`: Aho-Corasick 검색, 치환, 단어 필터링

대표 기능은 한국어/일본어 텍스트 분석, 다국어 언어 감지, 금칙어/키워드 검색, 치환 파이프라인
구성이다.

## 데이터 계층

데이터 계층은 영속화와 데이터베이스 통합을 맡는다. Exposed DSL, JDBC/R2DBC 리포지터리, 문서형
데이터베이스 도우미, 그래프 데이터베이스 어댑터가 여기에 들어간다.

### Exposed

Exposed 모듈은 JPA 스타일보다 Kotlin DSL에 가까운 영속화 모델을 제공하고, JDBC와 R2DBC를 같은
리포지터리 패턴으로 다루기 위한 모듈이다.

주요 모듈은 다음과 같다.

- `exposed-core`: 공통 리포지터리, 쿼리 도우미, DSL 지원
- `exposed-jdbc`, `exposed-r2dbc`: JDBC/R2DBC 어댑터
- cache, JSON, encryption, dialect extension 관련 모듈
- Spring Boot JDBC/R2DBC 통합

대표 기능은 타입 안전 SQL 작성, JDBC 리포지터리와 R2DBC 코루틴 리포지터리, CTE/recursive CTE/batch/
measured query helper, JSON column, encrypted column, database-specific extension이다.

### GraphDB

GraphDB 모듈은 그래프 데이터베이스별 API 차이를 줄이고, 그래프 비중이 큰 서비스를 공통 API로 다루기 위한
영역이다.

주요 모듈은 다음과 같다.

- `graph-core`: 그래프 모델, 리포지터리 추상화, blocking/coroutine API
- `graph-neo4j`, `graph-memgraph`, `graph-age`, `graph-tinkerpop`, `graph-falkordb`: 데이터베이스 어댑터
- `graph-io/core`, `graph-io/csv`, `graph-io/graphml`, `graph-io/jackson2`, `graph-io/jackson3`, `graph-io/okio`: import/export와 직렬화
- `graph-spring-boot`, `graph-ktor`: 애플리케이션 프레임워크 통합
- `examples/*-graph-examples`: code graph, knowledge graph, fraud detection, recommendation 예제

대표 기능은 Neo4j, Memgraph, AGE, TinkerGraph, FalkorDB를 공통 API로 접근하고, node/edge batch insert,
merge/upsert, schema/index management, transaction block, weighted path, 그래프 알고리즘 작업을 지원하는
것이다. CSV, NDJSON, GraphML, OkIO stream 기반 bulk I/O도 제공한다.

### 일반 데이터 모듈

Exposed나 GraphDB 외에도 서비스에서 자주 쓰는 데이터 접근 도우미가 있다.

- `data/hibernate`: Hibernate 기반 영속화 유틸리티
- `data/r2dbc`: R2DBC 공통 도우미
- `data/jdbc`: JDBC 기반 데이터 접근 유틸리티
- `data/mongodb`: MongoDB 통합 도우미
- `data/cassandra`: Cassandra 통합 도우미

이 모듈들은 관계형, 문서형, 와이드 컬럼 데이터베이스를 사용할 때 반복되는 리포지터리, 트랜잭션,
직렬화, Spring Boot 데이터 통합 패턴을 줄여 준다.

## 인프라 계층

인프라 계층은 클라우드, 메시징, 캐시, 관측성, 회복성처럼 애플리케이션 운영 경계와
가까운 기능을 맡는다.

### AWS

AWS 모듈은 AWS Java SDK v2와 AWS Kotlin SDK를 서비스 코드에서 쓰기 쉽게 감싼다.

주요 모듈은 다음과 같다.

- `aws`: AWS Java SDK v2 도우미
- `aws-kotlin`: AWS Kotlin SDK 코루틴 우선 도우미
- `aws-spring-boot`: Spring Boot 4 통합
- `aws-ktor`: Ktor 3 통합
- `examples/aws-*`: S3, DynamoDB, SQS, LocalStack/FLOCI 예제

대표 기능은 S3, DynamoDB, SQS 같은 AWS 서비스를 코루틴 친화적으로 쓰고, 로컬 통합 테스트를
LocalStack/FLOCI 기반으로 구성하는 것이다.

### Messaging

Messaging 모듈은 이벤트 파이프라인과 비동기 통합에서 반복되는 설정을 줄인다.

- `infra/kafka`, `infra/kafka4`: Kafka 클라이언트 통합
- `infra/kafka-logback`: 애플리케이션 로깅을 Kafka 이벤트 파이프라인으로 연결
- `infra/nats`: NATS 메시징 통합
- `infra/pulsar`: Pulsar 메시징 통합

대표 기능은 Kafka/NATS/Pulsar 기반 메시징 클라이언트 구성과 애플리케이션 로깅/이벤트 파이프라인 통합이다.

### 캐시와 Redis

Cache와 Redis 모듈은 로컬 캐시, 분산 캐시, Redis 클라이언트 통합을 맡는다.

- `infra/redis`, `infra/lettuce`, `infra/redisson`: Redis 클라이언트와 분산 프리미티브
- `cache/cache-core`: 공통 캐시 추상화
- `cache/cache-lettuce`, `cache/cache-redisson`: Redis 기반 캐시 백엔드
- `cache/cache-hazelcast`: Hazelcast 분산 캐시 백엔드
- `cache/hibernate-cache-lettuce`: Hibernate 2차 캐시 통합

대표 기능은 Caffeine/로컬 캐시와 Redis/Hazelcast 분산 캐시를 함께 쓰는 구조, 리포지터리 캐시,
Hibernate 캐시, 애플리케이션 캐시, near-cache와 2-tier cache 구성이다.

### 관측성과 회복성

운영 환경에서는 지표, 추적, 회복성, rate limiting이 필요하다.

- `infra/micrometer`: Micrometer 지표 통합
- `infra/opentelemetry`: OpenTelemetry 추적
- `infra/resilience4j`: 재시도, 회로 차단기, rate limiter 통합
- `infra/bucket4j`: rate limiting 지원
- `utils/measured`: 측정과 로깅 도우미

이 모듈들은 애플리케이션 코드 곳곳에 metric/tracing/retry boilerplate를 흩뿌리지 않고, 공통 패턴으로
운영 관측성과 회복성을 붙일 수 있게 한다.

## 기반 계층

기반 계층은 거의 모든 모듈이 기대는 Kotlin/JVM 공통 기반이다.

### 코어와 유틸리티

- `bluetape4k/core`: 보호 장치, 검증, 확장, 공통 타입
- `bluetape4k/annotations`: API 성숙도 opt-in annotation
- `bluetape4k/logging`: Kotlin-friendly logging
- `utils/*`: 자주 쓰는 유틸리티 모듈

상위 모듈이 공유하는 공통 타입과 유틸리티를 제공한다. 서비스 코드가 같은 검증, 로깅, 확장
패턴을 반복해서 새로 만들지 않게 하는 역할이다.

### 코루틴과 Virtual Threads

코루틴과 Virtual Threads 모듈은 Kotlin 코루틴과 Java Virtual Threads 사이의 실행 모델을 다룬다.

- `bluetape4k/coroutines`: 코루틴 도우미와 suspend-friendly 유틸리티
- `virtualthread/api`: Virtual Threads 추상화의 공통 API
- `virtualthread/jdk21`: Java 21 Virtual Threads 지원
- `virtualthread/jdk25`: Java 25 Virtual Threads 지원

대표 기능은 suspend API, 코루틴 실행 모델, blocking SDK/JDBC를 Virtual Threads 위에서 운용하는
마이그레이션 경로다. 코루틴 우선 코드와 blocking 생태계 사이를 잇는 역할을 한다.

### 테스트

Testing 모듈은 assertion, JUnit 5, Testcontainers, mock server를 한곳에서 제공한다.

- `testing/assertions`: bluetape4k assertion 도우미
- `testing/junit5`: JUnit 5 테스트 유틸리티
- `testing/testcontainers`: Testcontainers singleton launcher
- `testing/mock-web-server`: HTTP 클라이언트 테스트 지원
- `testing/mock-webflux-server`: WebFlux/WebClient 테스트 지원

대표 기능은 assertion과 코루틴 테스트 도우미, Redis/database/messaging Testcontainers launcher, HTTP/WebFlux
mock server다.

### BOM과 버전 관리

생태계가 여러 저장소로 나뉘면 의존성 버전 차이가 쉽게 생긴다. BOM과 dependency catalog는 이
문제를 줄이기 위한 계층이다.

- `bluetape4k-dependencies`: ecosystem-wide dependency alignment
- `bluetape4k/bom`: core repository alignment
- repository-local BOMs: AWS, Exposed, Image, JaVers, Leader, Text, Graph alignment

대표 기능은 Kotlin, Spring Boot, Exposed, AWS SDK, Testcontainers 같은 의존성 조합을 맞추고, 각
저장소가 서로 다른 릴리스 주기로 발전해도 애플리케이션이 안정적인 버전 집합을 가져가게 하는
것이다.

## 어떻게 읽으면 좋은가

처음 보는 팀이라면 Spring Boot 4나 Ktor 3 애플리케이션 경계에서 시작하는 것이 편하다. 그 다음 기반
계층에서 core, coroutine, testing, BOM을 보고, 실제 서비스가 만나는 문제에 따라 데이터 계층과 인프라
계층을 붙인다. leader election, audit trail, image processing, text processing, graph database처럼 특정
도메인 문제가 있다면 도메인 기능 계층으로 내려가면 된다.

Bluetape4k는 하나의 거대한 프레임워크가 아니다. 이미 쓰고 있는 Spring Boot 4/Ktor 3 서비스에 필요한 모듈을
점진적으로 얹는 생태계다. 다음 글부터는 각 계층을 더 작게 나누어, 대표 저장소의 아키텍처와 실제 사용
예제를 살펴본다.


## 대표 module 경로

Data와 Infrastructure의 세부 경로에는 다음 module을 포함한다.

- `examples/ktor-graph-examples`
- `exposed-dao`
- `exposed-cache`
- `exposed-jdbc-caffeine`
- `exposed-jdbc-lettuce`
- `exposed-jdbc-redisson`
- `exposed-r2dbc-caffeine`
- `exposed-r2dbc-lettuce`
- `exposed-r2dbc-redisson`

![계층별 component](/assets/bluetape4k-layer-components-01.png)
![계층 간 flow](/assets/bluetape4k-layer-flow-01.png)
