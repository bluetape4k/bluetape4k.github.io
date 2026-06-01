# Leader Part 3 blog draft

## Context

Issue #41 asked for Part 3 of the `bluetape4k-leader` blog series covering
`LeaderGroupElector` and strategic election.

## Decision

- Keep the article bilingual because Part 1 and Part 2 already have Korean and
  English route parity.
- Use `public/assets` for all blog assets and absolute `/assets/...` references.
- Treat the hero as a bitmap 3D workbench image, not a diagram.
- For the two explanatory diagrams, keep Graphviz `.dot`, `.plain`, and sketch
  artifacts beside final SVG/PNG assets.

## Outcome

Added Part 3 Korean and English posts, linked Part 1/2 series navigation to the
new route, and added hero plus group/strategic election diagrams.

## Verification

- `git diff --check`
- `npm run build`
- Static preview route checks for `/ko/blog/bluetape4k-leader-part3-group-strategic-election/`
  and `/blog/bluetape4k-leader-part3-group-strategic-election/`
- Rendered PNG inspection for the two diagram assets and a browser screenshot of
  the Korean route.

## Future rule

For follow-up leader-series posts, derive the scope from the open GitHub issue,
then keep bilingual route parity and update earlier series links in the same
change.
