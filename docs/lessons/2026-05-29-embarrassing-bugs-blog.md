# Embarrassing Bugs Blog

## Context

The site needed a blog post based on resolved `bluetape4k-projects` issues where
small or embarrassing mistakes turned into durable tests and release guards.

## Decision

Use five evidence-backed cases from issues #491, #595, #602, #654, and #656/#657,
then close with #497 as the release-gate pattern.

## Outcome

Added a publishable Starlight blog post, a working-source copy under `docs/blog`,
and a pastel summary image asset.

## Verification

Run `npm run build` after editing and preview the image. Keep the prose candid
but grounded in issue, PR, and lesson evidence.

## Future Agents

For candid postmortem-style posts, avoid blaming people. Tie each mistake to a
specific guard: regression test, bounded cleanup, release gate, or lifecycle rule.
