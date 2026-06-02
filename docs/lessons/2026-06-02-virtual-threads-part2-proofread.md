# Virtual Threads Part 2 Proofread

## Context

The chronological proofreading stack moved to
`virtual-threads-part2-workshop-rules` after the Part 1 PR.

## Decision

Keep the rule-oriented article structure and code examples unchanged. Improve
the Korean frontmatter, Korean series links, and a few phrases that were too
loose for a technical article. Apply only small English edits where the wording
was slightly indirect.

## Outcome

The Korean post now uses Korean metadata, `/ko/blog/...` series routes, and
clearer phrasing around practical rules, semaphores, and context handling. The
English post preserves the same claims with more direct wording.

## Verification

- `git diff --check`
- `npm run build`

## Future Guidance

When proofreading workshop-rule posts, keep the examples and rule names stable.
Most value comes from making the surrounding interpretation easier for
developers to read, not from reshaping the article.
