---
slug: "ko/manual/bluetape4k-leader/0.4/guides/identity-state-and-history"
title: "식별자, 상태, 이력"
description: "감사 식별자, 물리 노드 식별자, 상태 스냅숏, 이벤트, 이력이 각각 어떤 질문에 답하는지 구분합니다."
releaseRef: 0.4.0
releaseCommit: 17ab7f872c1f96318c73d3580729cac20a67e017
manual:
  id: "guides/identity-state-and-history"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "9f8a2152256c1a1ccf4fdbb7d731cf7d6273d700"
  sourcePath: "docs/manual/ko/guides/identity-state-and-history.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "docs/manual"
  layer: "build"
---


감사 식별자, 물리 노드 식별자, 상태 스냅숏, 이벤트, 이력이 각각 어떤 질문에 답하는지 구분합니다.

## 식별자를 섞지 않는다

`LeaderLease.auditLeaderId`는 선출 시점의 감사 식별자로, 펜싱 토큰이나 백엔드의 소유자 식별자일 수 있습니다. `nodeId`는 백엔드가 따로 추적할 때 사용하는 물리 프로세스 식별자입니다. 물리 노드 식별자를 증가하는 펜싱 토큰처럼 비교하면 스플릿 브레인 위험이 생깁니다.

## 상태와 이벤트

`state()`와 그룹 상태는 조회 시점에 확인할 수 있는 정보로 만든 스냅숏입니다. 리스너와 실시간 이벤트 `Flow`는 선출, 해제, 건너뛰기 전이를 관찰할 수 있게 합니다. 이 정보는 원자적인 락 획득을 대신하지 않으며 정확한 만료 시각이 없을 수도 있습니다.

## 이력

이력 저장소는 획득, 완료, 실패 기록을 남깁니다. `EXPIRED`는 획득 상태의 `lockedUntil`이 현재보다 과거일 때 조회 시점에 계산하며, v1에서는 정리 작업이 이 값을 저장하지 않습니다. 이력 기록기의 오류는 보호할 업무 로직과 격리되므로 저장소 자체의 상태를 별도로 감시해야 합니다.

## 릴리스 소스

- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderLease.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderLease.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderState.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/LeaderState.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/history/LeaderHistoryStatus.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-core/src/main/kotlin/io/bluetape4k/leader/history/LeaderHistoryStatus.kt)

## 이어서 읽기

- [Bluetape4k Leader 매뉴얼](/ko/manual/bluetape4k-leader/0.4/)
- [관측과 운영](/ko/manual/bluetape4k-leader/0.4/guides/observability-and-operations/)
- [Micrometer 연동](/ko/manual/bluetape4k-leader/0.4/frameworks/micrometer/)
