# Cache Part 3 Proofread

## Context

The next stacked proofreading PR covered the Near Cache + Exposed strategy
article.

## Decision

Preserve cache strategy names, code snippets, source links, benchmark values,
and the cache-aside distinction. Limit edits to expression around consistency,
failure behavior, and the article's hero framing.

## Outcome

The Korean and English posts now phrase the performance/consistency relationship
more naturally, and the consistency target row is clearer without changing
strategy semantics.

## Verification

- `git diff --check`
- `npm run build`

## Future Guidance

For Exposed cache strategy posts, do not blur read-through, write-through,
write-behind, and cache-aside. Proofreading should improve readability while
preserving those boundaries exactly.
