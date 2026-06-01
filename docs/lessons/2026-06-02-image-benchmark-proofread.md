# Image benchmark proofread pass

## Context

The chronological blog proofread stack continued with `from-pure-jvm-to-libvips-benchmarking-image-processing`, a benchmark-backed image processing note.

## Decision

Preserve benchmark values, source links, runtime caveats, code examples, and adoption guidance. Improve Korean and English phrasing only where it made the service workflow, benchmark limits, or backend choice easier to read.

## Outcome

The post now explains the scrimage/libvips tradeoff with more natural developer-facing wording while keeping the measured Java 25 FFM and Java 21 JNI host-limit caveats intact.

## Verification

- `git diff --check`
- `npm run build`

## Future guidance

For benchmark articles, keep measured numbers and caveats as anchors. Rewrite around them for naturalness, but do not make a benchmark result sound broader than the inputs support.
