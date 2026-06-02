# Cache Part 2 Proofread

## Context

After merging and syncing the previous proofreading stack, the next article was
the Near Cache benchmark post.

## Decision

Preserve the benchmark table, source links, and drawer/warehouse metaphor. Apply
only small expression edits around remote-cache cost, invalidation semantics,
and benchmark interpretation.

## Outcome

The Korean post now explains remote access cost and Pub/Sub invalidation more
naturally. The English post uses more direct wording for remote access,
invalidation, and benchmark-environment interpretation.

## Verification

- `git diff --check`
- `npm run build`

## Future Guidance

For Near Cache posts, keep benchmark values and metric direction untouched
unless fresh source evidence changes them. Most proofreading value is in making
invalidation and remote-cost wording precise.
