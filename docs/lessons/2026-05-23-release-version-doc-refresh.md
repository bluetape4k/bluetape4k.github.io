# Release Version Documentation Refresh

## Context

The official website still showed the older `bluetape4k-dependencies` 1.0.0 and
Exposed 1.8.0 quick-start examples after the release train published updated
library baselines across the ecosystem.

## Decision

Update the quick-start examples and version governance page to show the current
published baseline:

- `io.github.bluetape4k:bluetape4k-dependencies:1.1.1`
- `io.github.bluetape4k:bluetape4k-bom:1.9.0`
- `io.github.bluetape4k.exposed:bluetape4k-exposed-bom:1.9.0`
- `io.github.bluetape4k.aws:bluetape4k-aws-bom:0.2.0`
- `io.github.bluetape4k.graph:bluetape4k-graph-bom:0.4.0`
- `io.github.bluetape4k.leader:bluetape4k-leader-bom:0.2.0`
- `io.github.bluetape4k.image:bluetape4k-image-bom:0.1.1`
- `io.github.bluetape4k.javers:bluetape4k-javers-bom:0.1.1`
- `io.github.bluetape4k.text:bluetape4k-text-bom:0.1.1`

Keep repository-specific BOM guidance generic unless the site has verified that
the repository-specific BOM coordinate is published and intended for public
quick-start use.

## Outcome

The English and Korean home/getting-started/version-governance pages now point
new users at the latest central dependency BOM, core bluetape4k BOM, and
repository-specific BOM versions. The repository map also shows the latest
release version for each published library repository.

## Verification

- Maven Central `repo1` returned 200 for the published BOM POMs.
- `git diff --check`
- `npm run build`

## Future Guidance

After each release train, update the website quick start and version governance
page in the same release checklist pass. Do not leave old BOM examples in public
entrypoint pages.
