# Leader Part 5 blog

## Context

Part 5 of the bluetape4k-leader blog series needed bilingual publishable posts covering storage backends, operational features, benchmark interpretation, and examples. The user specifically wanted source links as bullets and prior series navigation fixed.

## Decision

Use the publishable site paths, not `docs/drafts`. Keep Korean and English posts structurally parallel. Use a hand-authored SVG/PNG backend-picker plus copied benchmark chart SVG/PNG assets from the leader repository.

## Outcome

Added Part 5 Korean and English posts, backend-picker assets, distributed throughput/latency chart assets, and updated the existing Part 1-4 series links to point at Part 5.

## Verification

Run `xmllint` on the new SVG, inspect rendered PNGs for label/connector overlap, run `git diff --check`, and build the Astro site.

## Future note

For future leader series posts, verify benchmark claims against `bluetape4k-leader/benchmark/README.md` and keep benchmark caveats visible near the chart, not only in source links.
