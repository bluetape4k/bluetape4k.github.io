# io/http Benchmark Blog

## Context

The site needed a blog-style article about `bluetape4k-projects` `io/http`
performance work, using issue, PR, and benchmark evidence.

## Decision

Use the existing benchmark charts from `bluetape4k-projects` as public site
assets, and frame the article around the initially disappointing Ktor CIO result
that led to fairer measurement.

## Outcome

Added a publishable Starlight blog post plus a working-source copy under
`docs/blog`. The article links the #589 epic, #590 and #587 issues, PR #593,
PR #594, and the benchmark report.

## Verification

Run the site build after editing and keep the article short enough to be readable
as a narrative post, not a benchmark report duplicate.

## Future Agents

For benchmark blog posts, lead with the surprising engineering story and keep
tables selective. Link the full benchmark report for exhaustive rows.
