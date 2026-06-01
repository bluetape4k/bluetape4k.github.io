# GraphDB adoption proofread pass

## Context

The chronological blog proofread stack continued with `when-to-adopt-graphdb`, a benchmark-backed adoption note.

## Decision

Preserve benchmark numbers, table structure, code examples, links, and the narrow adoption conclusion. Improve only the Korean and English prose where it reduced translationese, generic phrasing, or awkward technical wording.

## Outcome

The Korean post now explains the adoption tradeoff with more natural developer-facing prose. The English post keeps the same benchmark argument while reducing stiff phrasing and long unwrapped sentences.

## Verification

- `git diff --check`
- `npm run build`

## Future guidance

For benchmark-backed posts, keep all measured values and caveats unchanged. Naturalness edits should clarify the decision rule without strengthening the claim beyond the benchmark evidence.
