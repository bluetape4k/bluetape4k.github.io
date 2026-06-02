# 2026-06-02 Exposed Part 3 proofread

## Context

After Exposed Part 2 was merged, the next article was the Korean-only Part 3 post covering R2DBC, Coroutines, and Virtual
Threads.

## Decision

Keep the Korean article's workload-first selection rule intact, make small naturalness edits, and add an English
counterpart with the same benchmark numbers, execution-model diagram, source links, and locale-local series links.

## Outcome

Added the English Part 3 article, updated the English Part 2 series links to include Part 3, and lightly proofread the
Korean Part 3 article without changing benchmark claims.

## Verification

Run `git diff --check` and `npm run build` before opening the PR.
