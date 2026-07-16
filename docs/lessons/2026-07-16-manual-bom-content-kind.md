# Manual BOM Content Kind Boundary

## Context

The Javers manual inventory classifies its repository BOM as `bom`. The website
content schema accepts user-facing manual kinds such as `library`, but does not
accept `bom` as an Astro content kind.

## Root Cause

The manual sync pipeline copied the repository inventory kind directly into
generated page frontmatter. This coupled the source repository taxonomy to the
website presentation schema and caused the Astro build to reject the Javers BOM
page.

## Decision

- Preserve `bom` in release snapshots and source manifests. It is valid source
  metadata and part of the published release inventory.
- Map `bom` to `library` only when generating website page frontmatter.
- Keep the normalization at the rendering boundary instead of weakening the
  website schema or rewriting repository-owned metadata.
- Cover this boundary with a regression test before adding another repository
  that publishes a BOM manual.

## Verification

```bash
node --test tests/manual/frontmatter.test.mjs
npm run check:manual -- --repository bluetape4k-javers
npm run build
```

## Future Rule

When a repository inventory introduces a richer source kind, first decide
whether it is source taxonomy or a user-facing website content kind. Preserve
source taxonomy in provenance artifacts and add an explicit, tested mapping at
the generated frontmatter boundary when the site needs a narrower vocabulary.
