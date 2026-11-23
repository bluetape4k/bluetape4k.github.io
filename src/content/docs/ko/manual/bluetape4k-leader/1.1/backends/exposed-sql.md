---
slug: "ko/manual/bluetape4k-leader/1.1/backends/exposed-sql"
title: "Exposed SQL 백엔드"
description: "블로킹 서비스에는 JDBC를, coroutine-native SQL에는 R2DBC를 사용하고 선출 transaction은 짧게 유지합니다."
releaseRef: 1.1.0
releaseCommit: 88a0dd1642ab19a05c125f6b11b11f7ca42f5ace
manual:
  id: "backends/exposed-sql"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "88a0dd1642ab19a05c125f6b11b11f7ca42f5ace"
  sourcePath: "docs/manual/bluetape4k-leader/ko/backends/exposed-sql.md"
  minorVersion: "1.1"
  releaseRef: "1.1.0"
  releaseCommit: "88a0dd1642ab19a05c125f6b11b11f7ca42f5ace"
  sourceDir: "docs/manual/bluetape4k-leader"
  layer: "build"
---


블로킹 서비스에는 JDBC를, coroutine-native SQL에는 R2DBC를 사용하고 선출 transaction은 짧게 유지합니다.

## 모듈 구분

`leader-exposed-core`는 공통 table과 SQL 개념을 정의합니다. `leader-exposed-jdbc`는 JDBC data source를 위한 블로킹·async elector를, `leader-exposed-r2dbc`는 Exposed R2DBC 기반 suspend elector를 제공합니다. H2, PostgreSQL, MySQL 예제가 있습니다.

## 운영 모델

선출 row에는 owner와 expiry metadata가 저장됩니다. acquire와 release는 짧은 DB 연산이며 업무 로직 전체를 감싸는 transaction이 아닙니다. 작업은 선출 transaction 밖에서 실행하고 contender가 몰릴 때를 고려해 connection pool을 준비합니다. 시계 일관성이 중요하면 DB time 사용을 우선합니다.

## DB server time

노드마다 JVM clock이 다를 수 있으면 Exposed JDBC 또는 R2DBC group elector에
`LeaderGroupElectionOptions.useDbTime = true`를 설정합니다. 이 옵션을 켜면
group acquire, ownership 확인, lease 연장, minimum-lease release, 그리고 각
backend의 DB 기반 active count가 해당 ownership transaction 안에서 한 번
`SELECT CURRENT_TIMESTAMP`를 조회합니다. row 삭제만 하는 release는 시각을
조회하지 않습니다. 기본값은 `false`입니다.

DB 시각을 읽지 못하면 JDBC group state는 `maxLeaders`로 fail-closed 처리하고
`runIfLeader`는 `null`을 반환합니다. R2DBC는 영향을 받은 lock name을 사용할 수
없는 상태로 표시하고, state 조회에서 `maxLeaders`를 보고하며, `runIfLeader`는
`null`을 반환합니다. 이 옵션은 Exposed JDBC/R2DBC group elector에 적용되며 local
또는 Redis group 동작은 바꾸지 않습니다.

failover connection을 포함한 모든 connection이 같은 기준 DB 시각을 읽도록
구성해야 합니다. timestamp timezone과 precision은 provider 및 session 계약에
따르므로 모든 노드에서 일관되게 설정하세요. DB time은 ownership transaction마다
timestamp 조회 왕복을 한 번 추가합니다. 이 비용을 고려해 connection pool 크기를
정하고 retry 대기는 transaction 밖에서 수행하세요. R2DBC의 `activeCount()`는
캐시에 저장된 값이므로 DB의 현재 count를 보장하지 않습니다. DB에서 갱신한 count가
필요하면 `activeCountSuspend()`를 사용합니다. history는 best-effort metadata이며
ownership 결과를 바꾸지 않습니다.

## 선택 규칙

서비스와 transaction stack이 블로킹이면 JDBC를 사용합니다. 호출 경로가 coroutine-native이고 블로킹 bridge를 피해야 하면 R2DBC를 선택합니다. SQL 지연은 네트워크와 container 구성에 민감하므로 저장소의 H2 결과는 로컬 SQL layer baseline으로만 해석합니다.

## 릴리스 provenance

이 페이지는 안정 버전 `1.1.0`을 설명합니다. 아래 모듈 README 링크는 같은
release의 소스를 가리킵니다.

## 릴리스 소스

- [`leader-exposed-core/README.ko.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.1.0/leader-exposed-core/README.ko.md)
- [`leader-exposed-jdbc/README.ko.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.1.0/leader-exposed-jdbc/README.ko.md)
- [`leader-exposed-r2dbc/README.ko.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.1.0/leader-exposed-r2dbc/README.ko.md)

## 이어서 읽기

- [Bluetape4k Leader 매뉴얼](/ko/manual/bluetape4k-leader/1.1/)
- [백엔드 선택](/ko/manual/bluetape4k-leader/1.1/guides/backend-selection/)
- [리더 선출 테스트](/ko/manual/bluetape4k-leader/1.1/guides/testing/)
