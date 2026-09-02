# Version governance and stable promotion

The dependencies repository centralizes resolution policy without removing independent release ownership from the eight upstream repositories.

## Source of truth

`gradle/libs.versions.toml` owns the catalog aliases and imported child BOM versions. `gradle.properties` owns the repository's `baseVersion`. In the stable `2.0.0` release:

| Authority | Value |
|---|---|
| `baseVersion` | `2.0.0` |
| catalog self version | `2.0.0` |
| published stable BOM | `2.0.0` |
| source `snapshotVersion` | empty |

Upstream repositories retain independent version lines. Projects and Exposed are on stable `2.0.0`; AWS, Image, Text, Graph, Leader, and JaVers are on stable `1.0.0`. The release catalog records each child version explicitly.

## Updating a development line

1. Confirm the upstream artifact and source commit that should be consumed.
2. Update the catalog source-of-truth block, not generated aliases.
3. Regenerate and validate managed aliases and shared-version adoption.
4. Verify the generated BOM/POM and representative downstream graphs.
5. Publish or consume a snapshot only after the exact candidate and metadata are recorded.

The [2.0.0 release checklist](https://github.com/bluetape4k/bluetape4k-dependencies/blob/3c203aa9f8ba80685aac766c5fb8f24e23d0058e/docs/releases/2026-09-02-dependencies-2.0.0-release-checklist.md) is the detailed operational record for this stable train.

## Promoting to stable

Stable promotion is a separate gate:

1. verify every required upstream stable tag and public artifact;
2. update the child versions and catalog self-version in a reviewed candidate;
3. validate full builds, managed aliases, publication POMs, and representative consumers;
4. publish and verify the exact stable tag, GitHub Release, and Maven Central metadata;
5. only after those checks, pin the central manual manifest to the exact `releaseRef` and `releaseCommit`, set `contentStatus: complete`, and generate the site snapshot.

This `2.0` snapshot completed step 5. A future release repeats the same gate and creates a new immutable version route; a site commit and a code release commit remain separate provenance.
