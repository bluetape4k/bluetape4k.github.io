# Shared Diagram Generator Pattern

## Context

Diagram generators are being rewritten across `bluetape4k-*` and `bluetape-*`
repositories even though they repeat the same work: Graphviz evidence, final
SVG/PNG rendering, font binding, README PNG-only validation, geometry summaries,
and rendered PNG inspection.

Search keywords: `diagram generator`, `readme-diagrams`, `Graphviz evidence`,
`geometry-summary`, `Architects Daughter`, `Comic Mono`, `shortConnectors`,
`minConnectorStem`, `bluetape4k-diagram`.

## Evidence

Known generator examples in the workspace:

| Repo | Script |
|---|---|
| `bluetape-go-workshop` | `scripts/generate-*-diagrams.sh` |
| `bluetape-rs-workshop` | `scripts/generate-foundation-diagrams.py` |
| `bluetape4k-leader` | `scripts/generate-example-readme-diagrams.mjs`, `scripts/generate-module-architecture-diagrams.mjs` |
| `bluetape4k-projects` | `scripts/generate-observability-example-diagrams.mjs`, `scripts/generate-reviewed-readme-diagrams.mjs` |
| `bluetape4k.github.io` | `scripts/generate-cache-series-diagrams.mjs` |

## Decision

Before writing a new README diagram generator in any `bluetape4k-*` or
`bluetape-*` repository:

1. Search the workspace for `scripts/generate-*diagram*`.
2. Inspect the nearest rendered baseline PNG, especially `bluetape-go-workshop`
   for workshop diagrams.
3. Reuse the existing generator structure and gates before creating a new
   repo-local generator.
4. Keep repo-local customization as model data and small layout rules.
5. Promote every repeated visual review defect into a generator failure.

## Minimum Generator Contract

Every README node-and-connector generator should:

- discover required tools before rendering
- discover required font files and bind them explicitly
- emit Graphviz evidence:
  - `.dot`
  - `.plain`
  - `*-graphviz.svg`
  - `*-graphviz.png`
- emit final assets:
  - `.svg`
  - `.png`
- keep README embeds PNG-only
- reject final SVGs containing `Inter`, `Arial`, or `Helvetica`
- persist `geometry-summary.txt` or an equivalent tracked summary
- print at least:
  - `nodes`
  - `routes`
  - `segments`
  - `badEndpointAngle`
  - `badBends`
  - `interiorCrossings`
  - `marginImbalance`
  - `margins=L/R/T/B`
  - `titleGap`
  - `fontFallback`

Flow/card diagrams should additionally print and gate:

- `shortConnectors`
- `minConnectorStem`

The generator should fail when a direct card-to-card connector has a stem too
short to remain visible at README scale.

## Validation Commands

```bash
python3 scripts/generate-<subject>-diagrams.py
find docs/images/readme-diagrams -name '*.svg' -print0 | xargs -0 -n1 xmllint --noout
find docs/images/readme-diagrams -name '*.svg' -exec sh -c 'test -f "${1%.svg}.png"' sh {} \;
rg 'docs/images/readme-diagrams/.*\.svg' README*.md examples/*/README*.md && exit 1 || true
rg 'Inter|Arial|Helvetica' docs/images/readme-diagrams/*.svg && exit 1 || true
git diff --check
```

## Outcome

The `bluetape4k-diagram` skill now has
`references/shared-diagram-generator-pattern.md`, and the same guidance is
preserved here so GNO can retrieve it during future diagram work.

