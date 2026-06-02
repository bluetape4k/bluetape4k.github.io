# Virtual Threads Part 1 Proofread

## Context

The chronological blog proofreading stack reached `virtual-threads-part1-guide`.
The task was to improve Korean and English expression without changing the
technical meaning.

## Decision

Keep the English post mostly intact because it was already readable, and focus
the Korean pass on localized frontmatter, more natural phrasing, and locale
correct series links.

## Outcome

The Korean post now uses a Korean description, clearer alt/caption wording, and
`/ko/blog/...` links for the Korean series navigation. The English post received
small rhythm edits around the intro, downstream bottleneck, and Kotlin section.

## Verification

- `git diff --check`
- `npm run build`

## Future Guidance

For bilingual blog proofreading, check frontmatter and series links as part of
the prose pass. Locale drift is easy to miss when the visible body text already
reads well.
