---
slug: "manual/bluetape4k-dependencies/2.0/operations/validation"
title: "Validation runbook"
manual:
  id: "operations/validation"
  repository: "bluetape4k-dependencies"
  group: "overview"
  kind: "guide"
  sourceCommit: "3c203aa9f8ba80685aac766c5fb8f24e23d0058e"
  sourcePath: "docs/manual/bluetape4k-dependencies/en/operations/validation.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "3c203aa9f8ba80685aac766c5fb8f24e23d0058e"
  sourceDir: "docs/manual/bluetape4k-dependencies"
  layer: "build"
---


Run checks from the `bluetape4k-dependencies` checkout that supplies the catalog and BOM source. Keep the central manual checkout and the code checkout clean when collecting release evidence.

## Catalog and artifact checks

```bash
scripts/sync-managed-catalog.py --check --summary
scripts/verify-managed-artifacts.py --summary
python3 -m unittest tests/test_sync_managed_catalog.py
scripts/sync-shared-versions.py --workspace .. --check --summary
scripts/sync-dependabot-ignores.py --workspace .. --check --summary
```

These checks cover generated aliases, published artifact coordinates, shared-version adoption, and ignore-file parity. They complement, but do not replace, public release and provenance checks.

## Build and stable artifact checks

```bash
./gradlew build --no-daemon --no-configuration-cache
curl -fsSL \
  https://repo1.maven.org/maven2/io/github/bluetape4k/bluetape4k-dependencies/2.0.0/bluetape4k-dependencies-2.0.0.pom
```

Resolve a representative versionless child artifact through the BOM and compare the public POM with the release catalog. Record the code tag, site authoring commit, and artifact observation separately.

## Manual source checks

From the central site checkout:

```bash
git diff --check
npm run check:manual
npm test
npm run build
```

`npm run check:manual` validates the registered stable snapshots, generated manifests, locale parity, and public routing contract.

## Promotion evidence

This manual was generated only after the exact `2.0.0` tag, release commit, public artifact metadata, and downstream validation agreed. A future release must repeat the same gate instead of rewriting this `2.0` snapshot.
