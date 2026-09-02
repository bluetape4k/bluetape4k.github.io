# Repository map and version boundaries

The dependencies repository is the central version authority for the Bluetape4k ecosystem. It does not contain the runtime implementations; it imports each upstream repository's BOM and exposes a consistent catalog vocabulary.

## Managed child BOMs

| Upstream repository | Group ID | Child BOM | Stable version |
|---|---|---|---:|
| [bluetape4k-projects](https://github.com/bluetape4k/bluetape4k-projects) | `io.github.bluetape4k` | `bluetape4k-bom` | `2.0.0` |
| [bluetape4k-exposed](https://github.com/bluetape4k/bluetape4k-exposed) | `io.github.bluetape4k.exposed` | `bluetape4k-exposed-bom` | `2.0.0` |
| [bluetape4k-aws](https://github.com/bluetape4k/bluetape4k-aws) | `io.github.bluetape4k.aws` | `bluetape4k-aws-bom` | `1.0.0` |
| [bluetape4k-image](https://github.com/bluetape4k/bluetape4k-image) | `io.github.bluetape4k.image` | `bluetape4k-image-bom` | `1.0.0` |
| [bluetape4k-text](https://github.com/bluetape4k/bluetape4k-text) | `io.github.bluetape4k.text` | `bluetape4k-text-bom` | `1.0.0` |
| [bluetape4k-graph](https://github.com/bluetape4k/bluetape4k-graph) | `io.github.bluetape4k.graph` | `bluetape4k-graph-bom` | `1.0.0` |
| [bluetape4k-leader](https://github.com/bluetape4k/bluetape4k-leader) | `io.github.bluetape4k.leader` | `bluetape4k-leader-bom` | `1.0.0` |
| [bluetape4k-javers](https://github.com/bluetape4k/bluetape4k-javers) | `io.github.bluetape4k.javers` | `bluetape4k-javers-bom` | `1.0.0` |

Projects and Exposed use the `2.0.0` stable line. The independent child repositories use their own `1.0.0` stable line. These are the exact child versions imported by the released `bluetape4k-dependencies:2.0.0` BOM.

## Resolution flow

1. An application imports `io.github.bluetape4k:bluetape4k-dependencies:2.0.0` as a platform.
2. The ecosystem BOM imports the child BOMs and central third-party BOMs.
3. Gradle or Maven resolves a versionless Bluetape4k module through dependency management.
4. A build that also uses Bluetape4k's shared plugin and library aliases imports the checked-out `gradle/libs.versions.toml` as `bt4k`.

The BOM governs resolved versions; the catalog governs build authoring names. Neither artifact changes the ownership of an upstream implementation repository.

## Source references

This stable matrix is based on the catalog at release commit [`3c203aa9`](https://github.com/bluetape4k/bluetape4k-dependencies/tree/3c203aa9f8ba80685aac766c5fb8f24e23d0058e). Each child release tag and public artifact was verified independently during promotion.
