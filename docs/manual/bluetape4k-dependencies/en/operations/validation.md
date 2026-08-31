# Validation runbook

Run checks from the `bluetape4k-dependencies` checkout that supplies the catalog and BOM source. Keep the central manual checkout and the code checkout clean when collecting release evidence.

## Catalog and artifact checks

```bash
scripts/sync-managed-catalog.py --check --summary
scripts/verify-managed-artifacts.py --summary
python3 -m unittest tests/test_sync_managed_catalog.py
scripts/sync-shared-versions.py --workspace .. --check --summary
scripts/sync-dependabot-ignores.py --workspace .. --check --summary
```

These checks cover generated aliases, published artifact coordinates, shared-version adoption, and ignore-file parity. They do not prove that a mutable snapshot is safe for a production release.

## Build and snapshot checks

```bash
./gradlew build --no-daemon --no-configuration-cache
curl -fsSL \
  https://central.sonatype.com/repository/maven-snapshots/io/github/bluetape4k/bluetape4k-dependencies/2.0.0-SNAPSHOT/maven-metadata.xml
```

Read the metadata timestamp and build number, then resolve a representative versionless child artifact through the BOM. Record the catalog commit and metadata observation together, but do not collapse them into one release SHA.

## Manual source checks

From the central site checkout:

```bash
git diff --check
npm run check:manual
npm test
npm run build
```

`npm run check:manual` validates the published stable snapshots already registered by the site. This snapshot draft is intentionally source-only and is not added to the stable registry until the promotion gate; validate its manifest, locale parity, and relative links as part of the documentation review.

## Promotion evidence

The stable manual is ready for generation only when the exact stable tag, release commit, public artifact metadata, and downstream validation all agree. If any one is missing, leave `contentStatus: in-progress` and keep `releaseRef`/`releaseCommit` absent from this draft manifest.
