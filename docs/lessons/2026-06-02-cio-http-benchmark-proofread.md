# CIO HTTP benchmark proofread pass

## Context

The chronological blog proofread stack continued with `when-cio-made-http-benchmarks-weird`, an io/http benchmark note about Ktor CIO, Vert.x pooling, and fair fixtures.

## Decision

Preserve benchmark values, issue and PR links, tables, and the measured-selection guidance. Apply a light prose pass because the post already had a clear narrative and concrete evidence.

## Outcome

The post keeps its practical benchmark story while tightening a few Korean and English expressions that sounded less natural than the surrounding prose.

## Verification

- `git diff --check`
- `npm run build`

## Future guidance

For narrative benchmark posts, do not remove the story. Keep the lesson tied to the measurement evidence and only polish wording that distracts from the technical point.
