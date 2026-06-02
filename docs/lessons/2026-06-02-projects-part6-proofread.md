# 2026-06-02 Projects Part 6 proofread

## Context

The `bluetape4k-projects` Part 6 blog post closed the Projects series after the Part 5 proofreading PR.

## Decision

Keep the Spring Boot 4 and Ktor 3 application-boundary comparison intact, but make both locales more direct around framework
boundaries, observability ownership, resilience metrics, and wiring order.

## Outcome

Updated the bilingual posts to reduce distracting metaphors and clarify why Spring Boot 4 stays on Jackson 2, why Ktor
observability does not silently own exporters, and why cancellation should not be counted as a resilience failure.

## Verification

Run `git diff --check` and `npm run build` before opening the stacked PR.
