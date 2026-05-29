# Cache series Korean draft

## Context

The cache blog series was drafted Korean-first for `bluetape4k.github.io`, covering cache module overview, Near Cache, Exposed strategies, and workshop examples.

## Decision

Keep the first pass under `src/content/docs/ko/blog/` only. Do not add English default-locale posts until the Korean copy is reviewed.

Use existing blog and root README hero style as the hero reference: miniature workshop desk, blue blueprint mat, taped module blocks, and robot workers. Human-like worker variants were rejected.

## Outcome

Four Korean posts were added with dedicated hero figures, Graphviz-backed body diagrams/charts, code snippets, develop-branch source links, and bottom series links.

The first rendered diagram batch looked too close to raw Graphviz output and had visible routing/label defects. The final batch now uses `scripts/generate-cache-series-diagrams.mjs` to keep `.dot`, `.plain`, and `-sketch.svg` evidence while producing hand-polished SVG/PNG assets for the posts.

Review also caught a semantic issue: Part 3 must use `JdbcCacheRepository`/`AbstractJdbcRedissonRepository` and `exposed-workshop` chapter 11 examples for true read-through/write-through/write-behind. Do not use `bluetape4k-workshop` cache-aside style PUT management as the write-through example. The workshop follow-up is tracked in `bluetape4k-workshop#246`.

## Verification

- `npm run build`
- `git diff --check`
- Manual PNG inspection for all five body diagrams after rendering.
- Benchmark tables/charts were added for Part 2, Part 3, and Part 4 from local source reports.
- Local preview route checks for all four `/ko/blog/bluetape4k-cache-part*/` pages: `status=200`, hero image present, and expected diagram count present.

## Future guard

When writing the English version, translate from the reviewed Korean files into `src/content/docs/blog/` and keep hero/image parity. Do not copy Korean body text into the default locale as a placeholder.

For future blog diagram batches, do not treat Graphviz PNG output as the final asset. Keep Graphviz as route evidence and inspect the rendered PNGs before claiming the diagram set is ready.
