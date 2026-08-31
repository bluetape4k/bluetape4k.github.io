# bluetape4k-dependencies 2.0.0-SNAPSHOT Manual

This is an in-progress central authoring draft for the `2.0.0-SNAPSHOT` development line. It is not a stable `2.0.0` manual: no future stable tag or release commit is asserted here. A versioned site snapshot will be generated only after the stable artifact and tag have been verified.

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

## Current development line

The catalog source declares `bluetape4k-dependencies = "2.0.0"`; the publish workflow adds `-SNAPSHOT` to the BOM coordinate. The current central BOM coordinate is therefore:

```text
io.github.bluetape4k:bluetape4k-dependencies:2.0.0-SNAPSHOT
```

The source snapshot used for this draft is [`6073eefe`](https://github.com/bluetape4k/bluetape4k-dependencies/tree/6073eefe7cd5d7bdf3bb5dec7103ffb5427a4e7b). Snapshot metadata is intentionally time-sensitive; use the repository and metadata checks in the snapshot guide before relying on it.

## Source and promotion boundary

This manual is owned by the central site repository under `docs/manual/bluetape4k-dependencies/`. It is source-only while the target is a snapshot. The future stable promotion will pin a new manifest to the exact `2.0.0` tag and release commit, regenerate the site snapshot, and then retain this source as the provenance for that published manual.

- [Current dependencies README](https://github.com/bluetape4k/bluetape4k-dependencies/blob/6073eefe7cd5d7bdf3bb5dec7103ffb5427a4e7b/README.md)
- [Current Korean README](https://github.com/bluetape4k/bluetape4k-dependencies/blob/6073eefe7cd5d7bdf3bb5dec7103ffb5427a4e7b/README.ko.md)
- [Snapshot consumer checklist](https://github.com/bluetape4k/bluetape4k-dependencies/blob/6073eefe7cd5d7bdf3bb5dec7103ffb5427a4e7b/docs/releases/2026-08-21-dependencies-2.0.0-snapshot-consumer-checklist.md)
