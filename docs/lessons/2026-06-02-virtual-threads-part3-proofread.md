# Virtual Threads Part 3 Proofread

## Context

The chronological proofreading stack moved to the Virtual Threads JDBC/R2DBC
benchmark post.

## Decision

Preserve all benchmark numbers, tables, scenarios, and conclusions. Limit edits
to Korean localization, Korean series routes, and small phrasing changes in the
interpretation around benchmark scope and application-facing comparison.

## Outcome

The Korean post now has Korean metadata and `/ko/blog/...` series navigation.
Several Korean phrases now read more naturally without changing benchmark
meaning. The English post keeps the same evidence and uses slightly more direct
wording.

## Verification

- `git diff --check`
- `npm run build`

## Future Guidance

For benchmark-post proofreading, do not "improve" the numbers, scenario names,
or conclusion strength unless fresh source evidence requires it. Naturalness
edits should stay around framing and interpretation text.
