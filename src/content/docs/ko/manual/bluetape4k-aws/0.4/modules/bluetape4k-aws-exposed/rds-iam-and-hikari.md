---
slug: "ko/manual/bluetape4k-aws/0.4/modules/bluetape4k-aws-exposed/rds-iam-and-hikari"
title: RDS IAM과 Hikari
description: 수명이 짧은 RDS IAM token을 Hikari 물리 연결에 안전하게 적용합니다.
manualId: bluetape4k-aws-exposed
chapterId: rds-iam-and-hikari
manual:
  id: "bluetape4k-aws-exposed"
  repository: "bluetape4k-aws"
  group: "database"
  kind: "library"
  sourceCommit: "6e3e90395ce89b999944c6236cd292650585e28f"
  sourcePath: "docs/manual/ko/modules/bluetape4k-aws-exposed/rds-iam-and-hikari.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "be4e6daea5654f84579955307ec56a58c8f405be"
  sourceDir: "aws-exposed"
  layer: "build"
  chapterId: "rds-iam-and-hikari"
  chapterOrder: 2
---


RDS IAM은 정적인 JDBC password 대신 수명이 짧은 서명 token을 사용합니다. 따라서 pool은 물리 연결을 열 때 최신 token을 제공할 수 있어야 합니다.

## 올바른 설정

`authenticationMode = RDS_IAM`으로 지정하고 정적 password는 null로 두세요. region, 실제 RDS endpoint hostname, port, username을 설정해야 합니다. token 서명에는 사용자 정의 DNS alias를 사용할 수 없습니다.

```kotlin
val connection = AwsDatabaseConnectionProperties(
    url = jdbcUrl,
    username = "orders_app",
    authenticationMode = AwsDatabaseAuthenticationMode.RDS_IAM,
    rdsIam = AwsRdsIamAuthenticationProperties(
        region = "ap-northeast-2",
        hostname = "orders.cluster-xxx.ap-northeast-2.rds.amazonaws.com",
        port = 5432,
    ),
)
```

런타임에 `software.amazon.awssdk:rds`를 추가하세요. 서비스 SDK는 `compileOnly`이므로 이 모듈이 없으면 token 생성이 명확한 예외와 함께 실패합니다.

## Token과 pool 수명

AWS token의 최대 수명은 15분입니다. provider는 token을 캐시하고 만료 전에 lock 안에서 갱신합니다. 물리 연결은 여전히 Hikari가 소유합니다. 새 token은 새 연결을 열 때 사용되며 이미 열린 연결에 거꾸로 적용되지 않습니다.

Hikari `maxLifetime`과 데이터베이스의 연결 정책을 함께 정하세요. token이 만료돼도 인증을 마친 기존 연결이 바로 끊기지는 않지만 교체 연결에는 새 token이 필요합니다.

## 보안

생성한 token을 로그나 metric에 남기지 마세요. 실행 identity에는 대상 DB user에 필요한 `rds-db:connect`만 부여합니다. TLS와 서버 인증서 검증은 별도의 JDBC 책임입니다.

## 실패 진단

region, 실제 hostname, port, IAM database user, 런타임 RDS SDK, credentials, clock, network path를 차례로 확인하세요. pool 고갈과 token 생성 실패는 서로 다른 문제로 진단해야 합니다.

## 근거 자료

- [RDS IAM 인증](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-exposed/src/main/kotlin/io/bluetape4k/aws/exposed/AwsRdsIamAuthentication.kt)
- [Hikari data-source factory](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-exposed/src/main/kotlin/io/bluetape4k/aws/exposed/AwsJdbcDataSourceFactory.kt)
- [RDS IAM 테스트](https://github.com/bluetape4k/bluetape4k-aws/blob/0.4.0/aws-exposed/src/test/kotlin/io/bluetape4k/aws/exposed/AwsRdsIamAuthenticationTest.kt)
