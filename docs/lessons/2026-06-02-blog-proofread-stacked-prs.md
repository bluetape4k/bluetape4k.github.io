# Blog proofread stacked PR cadence

## Context

The chronological blog proofread pass should continue one bilingual article pair at a time, with each completed pair opened as its own PR.

## Decision

Use the blog skill's naturalness checklist as the proofreading gate. The goal is not shorter prose; the goal is Korean and English that read naturally to developers without translationese or generic AI-style phrasing.

Stack follow-up proofread branches when earlier PRs are still open, then merge the PRs later in order.

## Outcome

`introduction-bluetape4k-part1-ecosystem` was revised in both Korean and English with the same technical structure preserved.

## Verification

- `git diff --check`
- `npm run build`

## Future guidance

For each article, correct one bilingual pair, create a PR, then continue with the next article on a stacked branch. Do not merge the stack until the user asks to merge the queued PRs.
