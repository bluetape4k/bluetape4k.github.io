# Consuming snapshots safely

`2.0.0-SNAPSHOT` is mutable development metadata. Treat repository configuration, artifact availability, and catalog provenance as separate checks.

## Repository and coordinate

Use the Sonatype snapshot repository and the non-timestamped logical version:

```text
Repository: https://central.sonatype.com/repository/maven-snapshots
Coordinate: io.github.bluetape4k:bluetape4k-dependencies:2.0.0-SNAPSHOT
```

Resolvers use `maven-metadata.xml` to select a timestamped POM. Do not copy the timestamped filename into a normal Gradle or Maven dependency declaration, and do not assume that a successful metadata response means every child BOM has already been published.

The metadata endpoint for this draft was read on 2026-08-31 and reported `lastUpdated=20260831003013`, timestamp `20260830.233309`, and build `7`. These values are evidence for that observation only and must be refreshed before a new validation run.

## Gradle cache behavior

```bash
./gradlew --refresh-dependencies dependencies
```

Use `--refresh-dependencies` after confirming the repository and logical snapshot coordinate. It is useful when a new timestamp should replace a cached one; it is not a fix for a wrong repository, a missing child artifact, or a catalog/BOM mismatch.

## Maven cache behavior

Run the representative Maven build with `-U` when a new snapshot timestamp is expected. Keep the snapshot repository disabled for releases and avoid publishing applications that depend on a mutable snapshot.

## Acceptance checks

- the BOM metadata and POM resolve from the snapshot repository;
- the child BOM matrix matches the intended catalog source;
- a versionless representative Bluetape4k module resolves;
- the catalog checkout is an immutable commit and is recorded separately;
- the result is labelled development-only until stable promotion.

For the release boundary and exact commands, see [version governance](version-governance.md) and [validation](../operations/validation.md).
