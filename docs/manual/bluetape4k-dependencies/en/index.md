# bluetape4k-dependencies 2.0.0 Manual

This is the stable manual for `bluetape4k-dependencies:2.0.0`. Its BOM, signed tag, GitHub Release, child artifacts, and downstream resolution were verified before this versioned snapshot was generated.

`bluetape4k-dependencies` has two related but different contracts:

- the Maven BOM aligns resolved dependency versions;
- `gradle/libs.versions.toml` supplies the shared Gradle aliases and plugin versions used by Bluetape4k builds.

The catalog does not replace the BOM. Import both only when a build needs the catalog's authoring aliases as well as the BOM's dependency-management constraints.

## Choose a path

| I need to… | Start with |
|---|---|
| consume the development BOM from Gradle or Maven | [Getting started](getting-started.md) |
| understand the eight upstream BOM lines | [Repository map](architecture/repository-map.md) |
| use `bt4k` aliases from a checkout | [Gradle Version Catalog](modules/gradle-version-catalog.md) |
| understand what the ecosystem BOM manages | [Ecosystem BOM](modules/ecosystem-bom.md) |
| consume a timestamped snapshot safely | [Snapshot consumption](guides/snapshot-consumption.md) |
| update versions or promote a release | [Version governance](guides/version-governance.md) |
| verify a catalog or publication change | [Validation](operations/validation.md) |

## Stable release line

The catalog source declares `bluetape4k-dependencies = "2.0.0"`; the publish workflow adds `-SNAPSHOT` to the BOM coordinate. The current central BOM coordinate is therefore:

```text
io.github.bluetape4k:bluetape4k-dependencies:2.0.0
```

The release source is tag [`2.0.0`](https://github.com/bluetape4k/bluetape4k-dependencies/tree/2.0.0) at commit [`3c203aa9`](https://github.com/bluetape4k/bluetape4k-dependencies/tree/3c203aa9f8ba80685aac766c5fb8f24e23d0058e). The catalog and public BOM are related contracts, but consumers must still use the BOM for dependency resolution.

## Source and promotion boundary

This manual is owned by the central site repository under `docs/manual/bluetape4k-dependencies/`. The generated `2.0` route is immutable release documentation pinned to the code tag above; the site authoring commit and code release commit remain separate provenance.

- [Current dependencies README](https://github.com/bluetape4k/bluetape4k-dependencies/blob/3c203aa9f8ba80685aac766c5fb8f24e23d0058e/README.md)
- [Current Korean README](https://github.com/bluetape4k/bluetape4k-dependencies/blob/3c203aa9f8ba80685aac766c5fb8f24e23d0058e/README.ko.md)
- [2.0.0 release checklist](https://github.com/bluetape4k/bluetape4k-dependencies/blob/3c203aa9f8ba80685aac766c5fb8f24e23d0058e/docs/releases/2026-09-02-dependencies-2.0.0-release-checklist.md)
