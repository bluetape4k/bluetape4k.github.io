# Introduction to Bluetape4k Ecosystem

## Overview
  - Bluetape4k Ecosystem 의 목적을 서술
    - 최근 10여년 간 다양한 서비스를 제작할 때, 필요로 한 기술들을 모아놓은 생태계
    - 바로 쓸 수 있는 라이브러리, 프레임워크, 도구들을 제공하는 생태계

## Components

  - Bluetape4k Ecosystem 은 다양한 컴포넌트로 구성되어 있다.

### Architecture
  - Architecture Diagram 은 전문 Image AI 서비스를 이용하여, 파스텔톤의 Infographic 형태로 시스템 Architecture 를 시각화한다.
    - Hexagonal Architecture 도 좋고, 전통적인 Architecture 도 좋다.
    - 이미지에 쓰이는 단어는 모두 영문을 사용한다
  - bluetape4k-projects, aws, bluetape4k-exposed, javers, image, leader, text 를 기본적인 시스템 Architecture 상에서 적용할 수 있는 부분에 배치시킨다.
  - 최종 서비스 대상은 Spring Boot, Ktor 를 사용한다.
  - RDBMS, NoSQL, Infra 는 대표적인 기술들이다.
    - PostgreSQL, MySQL, Redis, MongoDB, AWS, Kafka, Nats
    - Micrometer, Opentelemetry, Grafana, Prometheus

### Core 
  - Ecosystem 에서 공통으로 사용하는 기능을 제공한다
    - 소소한 Guard pattern 부터, Kotlin 언어의 확장함수를 이용한 편의 함수들, etc.
  - logging, monitoring, tracing 등을 제공한다
  - assertions, junit5 용 테스트 helper, testcontainers 용 다양한 서버를 제공한다.
  - kotlin coroutines 의 성능을 극대화 하기 위한 다양한 기능을 제공한다.
  - Java 21, Java 25 에서 제공하는 Virtual Threads 를 일관된 interface 로 제공한다.
  - 다양한 io 기능을 제공한다 (serialization, compression, json, http, feign, avro, grpc)
  - data (hibernate, cassandra, mongodb) 관련 Utility 제공 
  - cache - 2-tier cache 제공 (Redis, Hazelcast)
  - infra - bucket4j, kafka, nats, micrometer, opentelemery, resilience4j 를 지원하는 기능 제공 
  - utils - 다양한 Utility 제공 (e.g. states, workflows, measured ..)

### AWS
  - AWS SDK 를 사용하여 AWS 서비스를 호출한다.
  - AWS Java SDK, AWS Kotlin SDK 둘 다 지원한다.
  - Spring Boot 를 지원하기 위해서 AWS Java SDK 를 사용한다.
  - Ktor 를 지원하기 위해서 AWS Kotlin SDK 를 사용한다.
  - 지원하는 서비스는 S3, EC2, Lambda, RDS, DynamoDB, SNS, SQS 등이다.

### Exposed
  - JPA 대안이면서, 확장성이 좋은 ORM 라이브러리
  - JDBC 뿐 아니라, R2DBC 를 지원하므로, Kotlin Coroutine 을 사용한 비동기 처리가 가능하다.
  - JDBC 의 경우 Java 21+ 이상에서 Virtual Threads 를 활용하면, 순수 비동기 방식에 버금가는 성능을 제공한다.
  - SQL 쿼리 작성이 간편하다.

### Javers
  - Javers 를 사용하여 객체의 변경 이력을 추적한다.
  - CDC 와 달리 DDD 에서 Aggregate Root 의 이벤트를 추적한다.

### Image
  - scrimage, vips 를 활용하여, 사용처에 따라 알맞는 방식을 선택할 수 있다.
    - scrimage 를 사용하여, 일반적인 이미지 처리 작업을 수행한다.
    - vips 를 사용하여, 고속, 대량의 이미지 처리 작업을 수행한다.
  - IO 활용을 극대화하기 위해 Coroutine 을 사용하여, 비동기 IO 작업을 수행한다.

### Leader
  - ShedLock 에서 제공하는 로컬/분산 락을 제공한다. 
  - Semaphore 기능으로 동시에 여러 Leader 를 선발할 수 있다.
  - 다양한 저장소를 지원한다. (Redis, Hazelcast, Exposed, Mongodb, etc.)

### Text
  - 한국어, 일본어에 대해
    - 텍스트 분석, 토큰화, 형태소 분석 등의 기능 제공
    - 금칙어 처리 제공 (형태소 분석기는 Dictionary 필요, 정규식으로 금칙어 필터링도 가능)

## Usage Scenarios

  - 필요에 따른 추천 
    - 예: Rate Limiting 이 필요한 경우 -> (bluetape4k-bucket4j)
    - 예: 분산 락을 이용하여 배치 서비스를 동시에 실행하지 않도록 제어할 수 있다. -> 사용해야 할 모듈 (bluetape4k-leader)
    - 예: 캐시 성능 극대화 - 2-tier cache (Redis, Hazelcast) -> (bluetape4k-cache-redis, bluetape4k-cache-hazelcast)
    - 예: JPA 대안을 찾고 있다
      - 성능, 학습난이도, 운영성 등의 향상을 위해 Exposed 추천 (bluetape4k-exposed-bom)
      - 추가로 BigQuery 등 다양한 데이터베이스에 대해서도 사용할 수 있다 

## Conclusion
  - 서비스를 만들고, 운영하면서 필요한 기능들을 만들다보니, 체계적인 모듈화가 필요하다는 것을 깨달았다. 
  - 재사용성, 모듈화, 성능, 운영편의성, 안정성을 높히기 위해 많은 노력을 기울였다. 
  - 라이브러리를 직접 사용하지 않더라도, 구현 방식이나 코드를 보고 영감을 얻어 좋은 서비스를 만드는데 도움이 되었으면 좋겠다.
