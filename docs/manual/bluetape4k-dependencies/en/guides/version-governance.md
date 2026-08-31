# Version governance and stable promotion

The dependencies repository centralizes resolution policy without removing independent release ownership from the eight upstream repositories.

## Source of truth

`gradle/libs.versions.toml` owns the catalog aliases and imported child BOM versions. `gradle.properties` owns the repository's `baseVersion`. In the current development line:

| Authority | Value |
|---|---|
| `baseVersion` | `2.0.0` |
| catalog self version | `2.0.0` |
| published development BOM | `2.0.0-SNAPSHOT` |
| source `snapshotVersion` | empty; the publish workflow injects `-SNAPSHOT` |

Upstream repositories retain independent version lines. Projects and Exposed are on the `2.0.0-SNAPSHOT` line in this draft; AWS, Image, Text, Graph, Leader, and JaVers are on `1.0.0-SNAPSHOT`. Do not infer a stable child release from the dependencies repository's own version.

## Updating a development line

1. Confirm the upstream artifact and source commit that should be consumed.
2. Update the catalog source-of-truth block, not generated aliases.
3. Regenerate and validate managed aliases and shared-version adoption.
4. Verify the generated BOM/POM and representative downstream graphs.
5. Publish or consume a snapshot only after the exact candidate and metadata are recorded.

The [snapshot consumer checklist](https://github.com/bluetape4k/bluetape4k-dependencies/blob/6073eefe7cd5d7bdf3bb5dec7103ffb5427a4e7b/docs/releases/2026-08-21-dependencies-2.0.0-snapshot-consumer-checklist.md) is the detailed operational record for the current train.

## Promoting to stable

Stable promotion is a separate gate:

1. verify every required upstream stable tag and public artifact;
2. update the child versions and catalog self-version in a reviewed candidate;
3. validate full builds, managed aliases, publication POMs, and representative consumers;
4. publish and verify the exact `2.0.0` tag, GitHub Release, and Maven Central metadata;
5. only after those checks, pin the central manual manifest to `releaseRef: 2.0.0` and its exact `releaseCommit`, set `contentStatus: complete`, and generate the site snapshot.

Until step 5, this manual must remain an in-progress snapshot draft. A site commit and a code release commit are separate provenance and must not be substituted for one another.
