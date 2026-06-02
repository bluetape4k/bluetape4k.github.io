# 2026-06-02 Exposed Part 2 proofread

## Context

The next Exposed blog item after Part 1 was the Korean-only Part 2 article about JDBC repositories and SQL DSL.

## Decision

Keep the Korean article's boundary between visible SQL DSL and thin repository helpers intact, make small Korean
naturalness edits, and add an English counterpart with matching examples, source links, and series navigation.

## Outcome

Added the English Part 2 article, updated the English Part 1 series links to include Part 2, and lightly proofread the
Korean Part 2 article without changing its technical claims.

## Verification

Run `git diff --check` and `npm run build` before opening the stacked PR.
