---
slug: "ko/manual/bluetape4k-javers/0.2/guides/learning-path"
title: "학습 경로"
manual:
  id: "guides/learning-path"
  repository: "bluetape4k-javers"
  group: "overview"
  kind: "guide"
  sourceCommit: "08744a8df1e25bb3170c6b45d49afe5c96ca72b2"
  sourcePath: "docs/manual/ko/guides/learning-path.md"
  minorVersion: "0.2"
  releaseRef: "0.2.1"
  releaseCommit: "bffe19439ca891fa5301a76421bdef7ba75252a0"
  sourceDir: "docs/manual"
  layer: "build"
---


맡은 역할에 따라 필요한 순서만 골라 읽을 수 있습니다.

## 애플리케이션 개발자

[시작하기](/ko/manual/bluetape4k-javers/0.2/getting-started/)에서 영속 저장소 하나를 구성합니다. 이어서 [감사 모델](/ko/manual/bluetape4k-javers/0.2/architecture/audit-model/)을 읽으면 스냅샷과 업무 행, 섀도와 현재 엔티티를 구분할 수 있습니다. 마지막으로 [DDD와 CQRS](/ko/manual/bluetape4k-javers/0.2/guides/ddd-and-cqrs/)에서 업무 저장, 감사 커밋, 이벤트 발행, 프로젝션 갱신 순서와 운영용 아웃박스가 메워야 할 틈을 확인합니다.

## 영속 연동 담당자

[저장소 지도](/ko/manual/bluetape4k-javers/0.2/architecture/repository-map/)와 [영속 방식 선택](/ko/manual/bluetape4k-javers/0.2/persistence/selection-guide/)을 먼저 읽으세요. Exposed 문서는 스키마와 트랜잭션 책임을, Redis 문서는 Lettuce와 Redisson 차이를, Kafka 문서는 쓰기 전용 계약을 설명합니다. [실패 계약](/ko/manual/bluetape4k-javers/0.2/operations/failure-contracts/)까지 읽은 뒤 두 번째 목적지를 연결해야 재시도 기준을 정할 수 있습니다.

## 운영자와 테스트 담당자

[관측](/ko/manual/bluetape4k-javers/0.2/operations/observability/)에서 커밋 실패, 넓은 조회 비용, Kafka 지연, 프로젝션 불일치 신호를 고릅니다. [테스트](/ko/manual/bluetape4k-javers/0.2/guides/testing/)는 이 위험을 단위 테스트, DB, Testcontainers 검증으로 나눕니다. 전체 흐름의 실행 기준은 [`OrderProjectionFlowTest`](https://github.com/bluetape4k/bluetape4k-javers/blob/bffe19439ca891fa5301a76421bdef7ba75252a0/examples/javers-exposed-ddd/src/test/kotlin/io/bluetape4k/javers/examples/exposedddd/OrderProjectionFlowTest.kt)입니다.

공통 기반은 [Projects 매뉴얼](https://bluetape4k.github.io/ko/manual/bluetape4k-projects/)과 [Exposed 매뉴얼](https://bluetape4k.github.io/ko/manual/bluetape4k-exposed/)로 이어집니다.
