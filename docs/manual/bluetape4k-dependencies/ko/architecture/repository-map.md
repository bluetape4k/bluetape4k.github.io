# 저장소 지도와 버전 경계

dependencies 저장소는 Bluetape4k 생태계의 중앙 version authority다. runtime 구현을 담지 않고 각 upstream 저장소의 BOM을 import해 일관된 catalog vocabulary를 제공한다.

## 관리하는 하위 BOM

| Upstream 저장소 | Group ID | 하위 BOM | 안정 버전 |
|---|---|---|---:|
| [bluetape4k-projects](https://github.com/bluetape4k/bluetape4k-projects) | `io.github.bluetape4k` | `bluetape4k-bom` | `2.0.0` |
| [bluetape4k-exposed](https://github.com/bluetape4k/bluetape4k-exposed) | `io.github.bluetape4k.exposed` | `bluetape4k-exposed-bom` | `2.0.0` |
| [bluetape4k-aws](https://github.com/bluetape4k/bluetape4k-aws) | `io.github.bluetape4k.aws` | `bluetape4k-aws-bom` | `1.0.0` |
| [bluetape4k-image](https://github.com/bluetape4k/bluetape4k-image) | `io.github.bluetape4k.image` | `bluetape4k-image-bom` | `1.0.0` |
| [bluetape4k-text](https://github.com/bluetape4k/bluetape4k-text) | `io.github.bluetape4k.text` | `bluetape4k-text-bom` | `1.0.0` |
| [bluetape4k-graph](https://github.com/bluetape4k/bluetape4k-graph) | `io.github.bluetape4k.graph` | `bluetape4k-graph-bom` | `1.0.0` |
| [bluetape4k-leader](https://github.com/bluetape4k/bluetape4k-leader) | `io.github.bluetape4k.leader` | `bluetape4k-leader-bom` | `1.0.0` |
| [bluetape4k-javers](https://github.com/bluetape4k/bluetape4k-javers) | `io.github.bluetape4k.javers` | `bluetape4k-javers-bom` | `1.0.0` |

Projects와 Exposed는 안정 `2.0.0` 계열을 사용한다. 독립 하위 저장소는 각자의 안정 `1.0.0` 계열을 사용한다. 이 버전들은 공개된 `bluetape4k-dependencies:2.0.0` BOM이 가져오는 정확한 하위 버전이다.

## 해석 흐름

1. 애플리케이션이 `io.github.bluetape4k:bluetape4k-dependencies:2.0.0`을 platform으로 import한다.
2. 생태계 BOM이 하위 BOM과 중앙 third-party BOM을 import한다.
3. Gradle 또는 Maven이 dependency management를 통해 버전 없는 Bluetape4k 모듈을 해석한다.
4. Bluetape4k 공통 plugin·library alias가 필요한 빌드는 checkout한 `gradle/libs.versions.toml`을 `bt4k`로 import한다.

BOM은 resolved version을 관리하고 catalog는 build authoring name을 관리한다. 어느 쪽도 upstream 구현 저장소의 소유권을 바꾸지 않는다.

## 원본 참조

이 안정 matrix는 release commit [`3c203aa9`](https://github.com/bluetape4k/bluetape4k-dependencies/tree/3c203aa9f8ba80685aac766c5fb8f24e23d0058e)의 catalog를 기준으로 한다. 각 하위 release tag와 공개 artifact는 승격 과정에서 별도로 검증했다.
