# Leader Part 4 Blog

## Context

Published Part 4 of the `bluetape4k-leader` blog series for Spring Boot and Ktor integration.
The article needed Korean and English parity, source-backed links, series navigation updates, and visual explanation of the Spring AOP runtime path.

## Decision

Add both localized posts and keep generated technical diagram labels in English.
Use a 3D workbench hero for series visual consistency and a deterministic SVG/PNG sequence diagram for AOP complexity.

## Outcome

Part 4 now covers `@LeaderElection`, `@LeaderGroupElection`, SpEL lock names, failure modes, Micrometer metrics, Ktor plugin scheduling, and management route snapshots.
Part 1-3 navigation now links to the published Part 4 route.

## Verification

- `git diff --check`
- `xmllint --noout public/assets/bluetape4k-leader-spring-aop-sequence-01.svg`
- `rsvg-convert public/assets/bluetape4k-leader-spring-aop-sequence-01.svg -o public/assets/bluetape4k-leader-spring-aop-sequence-01.png`
- `npm run build` with `astro check` reporting 0 errors and 0 warnings
- Local route smoke checks returned HTTP 200 for Korean and English Part 4 pages

## Future Notes

When source links follow `관련 소스:` or `Sources:`, render them as bullet lists from the first draft.
For sequence diagrams, inspect the rendered PNG for label overlap, connector collisions, and clipped text before build-only validation.
