# Guard bugs proofread pass

## Context

The chronological blog proofread stack continued with `embarrassing-bugs-that-made-better-guards`, a narrative bug-fix retrospective.

## Decision

Preserve the five-case structure, issue links, code snippets, and retrospective tone. Apply only small Korean wording fixes where expressions sounded awkward; the English version was already natural enough and did not need forced edits.

## Outcome

The Korean post reads more naturally while keeping the candid bug-fix narrative intact.

## Verification

- `git diff --check`
- `npm run build`

## Future guidance

For narrative retrospective posts, preserve the author's voice. Do not rewrite English just to create churn when review finds no meaningful issue.
