# Projects Part 4-6 blog series

## Context

Completed the `bluetape4k-projects` blog series issues for data/infra,
utilities/adoption, and Spring Boot 4/Ktor application-layer coverage.

## Decision

Keep the series bilingual and source-grounded. Use `bluetape4k-diagram` for new
public assets: each module-map diagram has SVG+PNG output plus Graphviz `.dot`,
`.plain`, sketch SVG/PNG, and a small graph-vs-final summary.

Hero figures are not module-map diagrams. For the `bluetape4k-projects` series,
match the existing 3D workbench/robot diorama style from nearby posts instead
of generating flat SVG flow placeholders.

## Outcome

Added Korean and English posts for Parts 4, 5, and 6, updated the Part 1-3
series navigation, and added reusable asset generation under
`scripts/generate-projects-part4-6-assets.mjs`.

Part 4 points cache readers to the existing cache deep-dive series, and Part 6
uses an explicit operational closing instead of vague "quiet foundation" wording.

## Verification

- `node --check scripts/generate-projects-part4-6-assets.mjs`
- `node scripts/generate-projects-part4-6-assets.mjs`
- rendered PNG contact sheet inspected
- `git diff --check`
- `npm run build` generated all new Korean and English routes
- local preview returned HTTP 200 for the six new post routes and touched assets

## Future Guard

For future `bluetape4k.github.io` series posts, inspect existing hero art before
creating new hero figures, keep `/assets/...` public paths, bilingual route
parity, and diagram evidence files together. Do not leave earlier series posts
pointing at planned links after the target posts exist.
