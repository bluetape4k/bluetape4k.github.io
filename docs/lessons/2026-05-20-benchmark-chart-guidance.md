# 2026-05-20 — Benchmark chart guidance

## Context

README visual guidance covered Mermaid-derived diagrams but did not define how
to present numeric benchmark results.

## Decision

Document benchmark result visuals as charts, not diagrams. Store generated chart
SVG/PNG pairs under `docs/images/readme-charts/`, keep Markdown tables as the
source of truth, and use log scale when values span orders of magnitude.

## Outcome

`docs/readme-diagram-samples/README.md` now includes benchmark chart rules,
search scope, placement guidance, and validation checks.

## Verification

- Reviewed the updated style guide section.

## Future

When a benchmark result table is added to a bluetape4k repo, add a chart next to
the table unless the document is only a benchmark module overview with no
measured values.
