---
slug: "ko/manual/bluetape4k-aws/1.0/modules/aws-ktor-service-coverage-examples"
manualId: "aws-ktor-service-coverage-examples"
id: "aws-ktor-service-coverage-examples"
title: "Ktor 서비스 커버리지 예제"
locale: "ko"
kind: "example"
gradlePath: ":aws-ktor-service-coverage-examples"
sourceDir: "examples/aws-ktor-service-coverage-examples"
releaseRef: "1.0.0"
artifact: null
manual:
  id: "aws-ktor-service-coverage-examples"
  repository: "bluetape4k-aws"
  group: "example-service-coverage"
  kind: "example"
  sourceCommit: "632e0f346b807c4d50e3195f7b2b72082def9460"
  sourcePath: "docs/manual/bluetape4k-aws/ko/modules/aws-ktor-service-coverage-examples.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "632e0f346b807c4d50e3195f7b2b72082def9460"
  sourceDir: "examples/aws-ktor-service-coverage-examples"
  layer: "learn"
---


> 남은 AWS 서비스 플러그인을 실행하는 1.0.0 예제입니다.

## 학습 목표

SES/v2, SNS, CloudWatch, CloudWatch Logs, Kinesis와 STS를 하나의 작은 Ktor 애플리케이션에서 실행한다.

## 이 예제가 맞는 경우

Emulator별 지원 차이에 의존하지 않고 plugin 설치와 request/response mapping을 검증할 때 적합하다.

## 프로젝트 실행 방법

배포하지 않는 예제다. 배포 소스에서 `./gradlew :aws-ktor-service-coverage-examples:test`를 실행한다.

## 익혀야 할 개념

각 plugin은 application이 소유한 operation facade를 주입받는다. Route는 운영 통합과 동일한 application accessor를 호출한다.

## 단계별 실습

1. 여섯 operation facade를 준비한다.
2. `serviceCoverageExampleModule`을 설치한다.
3. `/coverage/*` route를 호출한다.
4. AWS request와 JSON response mapping을 확인한다.

## 진입점과 기대 동작

`ServiceCoverageExampleRoutes.kt`는 email, notification, metric, log, stream record와 caller identity route를 제공한다.

## 권장 실습 순서

STS부터 시작한 뒤 write service를 하나씩 추가해 configuration과 mapping 실패를 분리한다.

## 연동 경계

Host application이 AWS client, endpoint, credentials와 operation facade를 소유한다. Ktor는 plugin 설치와 routing만 담당한다.

## 설정 점검

`ServiceCoverageExampleOptions`에서 CloudWatch namespace, log group과 stream, Kinesis stream name, SNS topic ARN을 지정한다.

## 실패 유형

빈 request field는 validation에서 거부된다. Resource, credentials, endpoint 지원이나 IAM 권한 문제는 주입한 operation을 통해 드러난다.

## 운영

API가 지원되면 repository의 Floci-first 정책을 따르고, 명시적인 지원 공백은 LocalStack 또는 application 소유의 실제 AWS endpoint로 검증한다.

## 경계 테스트

`ServiceCoverageExampleRoutesTest`는 MockK facade로 plugin accessor, JSON mapping, AWS request mapping과 response mapping을 결정적으로 검증한다.

## 다음 학습 경로

S3, SQS, DynamoDB와 Exposed 전용 예제로 이동해 lifecycle과 persistence 시나리오를 더 깊게 다룬다.

## 제약 사항

Emulator parity, 실제 AWS 권한, retry 정책, 운영 observability와 resource provisioning은 이 예제의 검증 범위가 아니다.

## 근거 소스

- [Route와 plugin 설정](https://github.com/bluetape4k/bluetape4k-aws/blob/1.0.0/examples/aws-ktor-service-coverage-examples/src/main/kotlin/io/bluetape4k/aws/examples/ktor/servicecoverage/ServiceCoverageExampleRoutes.kt)
- [결정적인 route 테스트](https://github.com/bluetape4k/bluetape4k-aws/blob/1.0.0/examples/aws-ktor-service-coverage-examples/src/test/kotlin/io/bluetape4k/aws/examples/ktor/servicecoverage/ServiceCoverageExampleRoutesTest.kt)
- [예제 설명](https://github.com/bluetape4k/bluetape4k-aws/blob/1.0.0/examples/aws-ktor-service-coverage-examples/README.ko.md)
