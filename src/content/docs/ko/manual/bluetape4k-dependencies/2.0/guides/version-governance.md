---
slug: "ko/manual/bluetape4k-dependencies/2.0/guides/version-governance"
title: "버전 거버넌스와 stable 승격"
manual:
  id: "guides/version-governance"
  repository: "bluetape4k-dependencies"
  group: "overview"
  kind: "guide"
  sourceCommit: "3c203aa9f8ba80685aac766c5fb8f24e23d0058e"
  sourcePath: "docs/manual/bluetape4k-dependencies/ko/guides/version-governance.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "3c203aa9f8ba80685aac766c5fb8f24e23d0058e"
  sourceDir: "docs/manual/bluetape4k-dependencies"
  layer: "build"
---


dependencies 저장소는 여덟 upstream 저장소의 독립적인 release 소유권을 없애지 않으면서 해석 정책을 중앙화한다.

## Source of truth

`gradle/libs.versions.toml`은 catalog alias와 import한 child BOM version을 소유한다. `gradle.properties`의 `baseVersion`은 이 저장소 version을 소유한다. 안정 `2.0.0` 릴리스는 다음과 같다.

| 권위 | 값 |
|---|---|
| `baseVersion` | `2.0.0` |
| catalog self version | `2.0.0` |
| published stable BOM | `2.0.0` |
| source `snapshotVersion` | 비어 있음 |

Upstream 저장소는 독립적인 version line을 유지한다. Projects와 Exposed는 안정 `2.0.0`, AWS·Image·Text·Graph·Leader·JaVers는 안정 `1.0.0`이다. Release catalog가 각 하위 버전을 명시적으로 기록한다.

## 개발선 변경

1. 소비할 upstream artifact와 source commit을 확인한다.
2. 생성 alias가 아닌 catalog source-of-truth block을 변경한다.
3. managed alias와 shared-version adoption을 다시 생성·검증한다.
4. 생성 BOM/POM과 대표 downstream graph를 검증한다.
5. 정확한 candidate와 metadata를 기록한 뒤에만 snapshot을 publish하거나 소비한다.

이 안정 train의 상세 운영 기록은 [2.0.0 릴리스 체크리스트](https://github.com/bluetape4k/bluetape4k-dependencies/blob/3c203aa9f8ba80685aac766c5fb8f24e23d0058e/docs/releases/2026-09-02-dependencies-2.0.0-release-checklist.md)다.

## Stable 승격

Stable 승격은 별도의 gate다.

1. 필요한 upstream stable tag와 public artifact를 모두 확인한다.
2. 검토한 candidate에서 child version과 catalog self-version을 갱신한다.
3. full build, managed alias, publication POM, 대표 consumer를 검증한다.
4. 정확한 stable tag와 GitHub Release, Maven Central metadata를 publish하고 확인한다.
5. 그 뒤에만 중앙 매뉴얼 manifest에 정확한 `releaseRef`와 `releaseCommit`을 기록하고 `contentStatus: complete`로 바꾼 후 site snapshot을 생성한다.

이 `2.0` snapshot은 5단계를 완료했다. 다음 릴리스는 같은 gate를 반복해 새 불변 버전 경로를 만들며, site commit과 code release commit은 별도 provenance로 유지한다.
