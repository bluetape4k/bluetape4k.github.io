---
slug: "ko/manual/bluetape4k-dependencies/2.0"
title: "bluetape4k-dependencies 2.0.0 매뉴얼"
manual:
  id: "index"
  repository: "bluetape4k-dependencies"
  group: "overview"
  kind: "guide"
  sourceCommit: "3c203aa9f8ba80685aac766c5fb8f24e23d0058e"
  sourcePath: "docs/manual/bluetape4k-dependencies/ko/index.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "3c203aa9f8ba80685aac766c5fb8f24e23d0058e"
  sourceDir: "docs/manual/bluetape4k-dependencies"
  layer: "build"
---


이 문서는 `bluetape4k-dependencies:2.0.0` 안정 매뉴얼이다. BOM, 서명 tag, GitHub Release, 하위 artifact, downstream 해석을 확인한 뒤 버전이 붙은 snapshot을 생성했다.

`bluetape4k-dependencies`에는 서로 다르지만 함께 쓰는 두 계약이 있다.

- Maven BOM은 실제로 해석되는 의존성 버전을 맞춘다.
- `gradle/libs.versions.toml`은 Bluetape4k 빌드가 사용하는 Gradle alias와 plugin version을 제공한다.

Catalog는 BOM을 대신하지 않는다. 빌드 authoring alias와 BOM의 dependency-management constraint가 모두 필요할 때만 둘을 함께 import한다.

## 목적별 시작점

| 하려는 일 | 먼저 읽을 문서 |
|---|---|
| Gradle 또는 Maven에서 개발 BOM 사용 | [시작하기](/ko/manual/bluetape4k-dependencies/2.0/getting-started/) |
| 여덟 upstream BOM 계열 이해 | [저장소 지도](/ko/manual/bluetape4k-dependencies/2.0/architecture/repository-map/) |
| checkout한 catalog에서 `bt4k` alias 사용 | [Gradle Version Catalog](/ko/manual/bluetape4k-dependencies/2.0/modules/gradle-version-catalog/) |
| 생태계 BOM이 관리하는 범위 이해 | [생태계 BOM](/ko/manual/bluetape4k-dependencies/2.0/modules/ecosystem-bom/) |
| timestamped snapshot 안전하게 사용 | [Snapshot 소비](/ko/manual/bluetape4k-dependencies/2.0/guides/snapshot-consumption/) |
| 버전 변경과 stable 승격 | [버전 거버넌스](/ko/manual/bluetape4k-dependencies/2.0/guides/version-governance/) |
| catalog·publication 변경 검증 | [검증](/ko/manual/bluetape4k-dependencies/2.0/operations/validation/) |

## 안정 릴리스 계열

Catalog source는 `bluetape4k-dependencies = "2.0.0"`을 선언하고, publish workflow가 BOM 좌표에 `-SNAPSHOT`을 붙인다. 따라서 현재 중앙 BOM 좌표는 다음과 같다.

```text
io.github.bluetape4k:bluetape4k-dependencies:2.0.0
```

릴리스 source는 commit [`3c203aa9`](https://github.com/bluetape4k/bluetape4k-dependencies/tree/3c203aa9f8ba80685aac766c5fb8f24e23d0058e)의 tag [`2.0.0`](https://github.com/bluetape4k/bluetape4k-dependencies/tree/2.0.0)이다. Catalog와 공개 BOM은 서로 연결된 계약이지만 dependency resolution에는 BOM을 사용한다.

## 원본과 승격 경계

이 매뉴얼은 중앙 site 저장소의 `docs/manual/bluetape4k-dependencies/`가 소유한다. 생성된 `2.0` 경로는 위 코드 tag에 고정된 불변 릴리스 문서이며, site authoring commit과 code release commit은 별도 provenance로 유지한다.

- [현재 dependencies README](https://github.com/bluetape4k/bluetape4k-dependencies/blob/3c203aa9f8ba80685aac766c5fb8f24e23d0058e/README.ko.md)
- [현재 영문 README](https://github.com/bluetape4k/bluetape4k-dependencies/blob/3c203aa9f8ba80685aac766c5fb8f24e23d0058e/README.md)
- [2.0.0 릴리스 체크리스트](https://github.com/bluetape4k/bluetape4k-dependencies/blob/3c203aa9f8ba80685aac766c5fb8f24e23d0058e/docs/releases/2026-09-02-dependencies-2.0.0-release-checklist.md)
