# Exposed blog series Korean draft

## Context

Drafted the Korean `bluetape4k-exposed` blog series for epic #85, covering the
choice journey, JDBC repositories, R2DBC/coroutines/virtual threads, JSON and
dialects, and production examples.

## Decision

Keep the first deploy Korean-only until the Korean copy is reviewed. The series
should sound like the author's Exposed notes: start from why the library or
extension was needed, then show code, benchmark evidence, and the selection rule.

Use distinct 3D workbench/robot hero figures per part. Body diagrams and charts
must keep source/evidence artifacts next to the final PNG/SVG assets.

## Outcome

Added five Korean posts with source links, benchmark charts, Graphviz-backed
diagrams, and series navigation. Part 5 was reframed around using Exposed to
maximize performance and make cache strategies, multi-tenancy, and
outbox/idempotency easier to implement, rather than only describing failures to
avoid.

## Verification

- `git diff --check`
- `npm run build`
- local route check for Part 5 confirmed the new framing text and absence of
  the old "which failure is this preventing" phrase.

## Future Guard

When adding the English version, translate from the reviewed Korean posts and
keep route parity. For future Exposed posts, inspect source README/examples and
benchmark results before writing, and avoid a detached third-party review tone.
