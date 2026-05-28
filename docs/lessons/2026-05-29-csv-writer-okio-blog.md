# CSV writer Okio follow-up blog

## Context

PR bluetape4k-projects#675 shipped the #674 UTF-8 `FlowCsvWriter.writeFile`
Okio `BufferedSink` fast path after the earlier CSV reader `UnsafeCursor`
optimization.

## Decision

Publish a follow-up article as a narrative engineering note, not a raw work log:
start from the coroutine `Flow` pipeline, explain why the old character writer
path was the bottleneck, then show the Okio sink fast path and behavior locks.
Add a chart that compares baseline ops/s and Okio ops/s directly, not only the
speedup ratio.

## Outcome

Added bilingual blog posts and a new SVG+PNG chart asset:

- `src/content/docs/blog/csv-writer-okio-buffered-sink.mdx`
- `src/content/docs/ko/blog/csv-writer-okio-buffered-sink.mdx`
- `public/assets/csv-okio-writer-throughput-01.svg`
- `public/assets/csv-okio-writer-throughput-01.png`

## Verification

Rendered the chart with `rsvg-convert` and inspected the PNG. Fixed text overflow
in the first rendered preview before writing the post.

## Future Guard

For benchmark follow-up posts, keep the post story-driven, include a direct
baseline-vs-new chart, and keep source links pinned to the `develop` branch.
