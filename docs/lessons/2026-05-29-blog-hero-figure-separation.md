# Blog hero figure separation

## Context

Several blog posts used the first benchmark chart or explanatory diagram as
`bt4k-blog-hero`. That satisfied the presence check but did not match the visual
contract established by the AI collaboration article, where the hero is an
introductory image before the article body.

## Decision

Keep `bt4k-blog-hero` for article-opening editorial imagery only. Benchmark
charts, architecture diagrams, and measurement summaries belong in body figures
such as `bt4k-architecture`, even when they are the most important evidence in
the article.

## Outcome

The English and Korean posts now share the same structure:

1. Frontmatter.
2. Editorial hero figure.
3. Post metadata.
4. Intro copy.
5. Body chart or diagram at the relevant evidence point.

## Verification

- `npm run build`
- `git diff --check`
- Local rendered route check for all English and Korean blog posts confirmed
  that `bt4k-blog-hero` does not point at chart, benchmark, throughput, or
  summary assets.

## Future guard

When adding or translating posts, do not pass a "hero exists" check by moving a
body chart to the top. Create or reuse a dedicated editorial hero image, then
leave data visuals in the body.
