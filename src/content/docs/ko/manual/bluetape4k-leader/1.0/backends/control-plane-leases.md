---
slug: "ko/manual/bluetape4k-leader/1.0/backends/control-plane-leases"
title: "etcd, Consul, Kubernetes Lease"
description: "control plane이 이미 기준 시스템일 때 그 환경의 native 소유권 기능을 사용합니다."
releaseRef: 1.0.0
releaseCommit: e70146330302758f563a46b7286e3ce25f1bac49
manual:
  id: "backends/control-plane-leases"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/ko/backends/control-plane-leases.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "docs/manual/bluetape4k-leader"
  layer: "build"
---


control plane이 이미 기준 시스템일 때 그 환경의 native 소유권 기능을 사용합니다.

## etcd

Preview 상태인 etcd 백엔드는 v3 Lock service와 lease를 사용하며 단일·그룹 구현을 제공합니다. lease keepalive와 client session 상태가 핵심입니다. 목표 topology에서 compaction, reconnect, quorum 상실을 시험합니다.

## Consul

Preview 상태인 Consul 백엔드는 Session과 KV를 결합합니다. Session 갱신이 liveness를 결정하며 단일·그룹의 블로킹·suspend 경로를 제공합니다. session invalidation과 network partition이 발생하면 소유권을 잃은 것으로 취급합니다.

## Kubernetes

Preview 상태인 Kubernetes 백엔드는 `coordination.k8s.io/v1` Lease resource를 갱신합니다. cluster API의 관리를 받는 controller와 operator에 적합합니다. API server 가용성, RBAC, namespace, lease duration, pod termination grace가 모두 운영 계약에 들어갑니다.

## 선택 경계

스케줄 작업 하나 때문에 별도의 control plane을 도입하지 않습니다. 이미 control plane이 기준 시스템이고 그 가용성 목표가 작업 요구와 맞을 때 선택합니다.

## 릴리스 소스

- [`leader-etcd/README.ko.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-etcd/README.ko.md)
- [`leader-consul/README.ko.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-consul/README.ko.md)
- [`leader-k8s/README.ko.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-k8s/README.ko.md)

## 이어서 읽기

- [Bluetape4k Leader 매뉴얼](/ko/manual/bluetape4k-leader/1.0/)
- [백엔드 선택](/ko/manual/bluetape4k-leader/1.0/guides/backend-selection/)
- [관측과 운영](/ko/manual/bluetape4k-leader/1.0/guides/observability-and-operations/)
