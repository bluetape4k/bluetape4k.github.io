# Architecture map font and routing fix

## Context

The public homepage embedded `public/assets/bluetape4k-architecture-map.svg`
with `Inter, Arial, sans-serif` inline font families instead of the
`bluetape4k-diagram` visual language.

## Decision

Use `Architects Daughter` for title and prominent card labels, and `Comic Mono`
for subtitles and detail text. While fixing the asset, also correct connector
routes whose arrowheads ended in the middle of the diagram instead of on a
target node boundary.

## Outcome

The Architecture Position Map now uses the standard diagram fonts and explicit
orthogonal connector lanes. The lower `Foundation Modules` and
`Example Applications` connectors terminate at the `Application Runtime` card
instead of at an intermediate coordinate.

Follow-up layout review moved `Application Runtime` from a top hub into the
visual center of the map. The four service-layer families now sit around the
runtime card, which better matches the intended mental model: a Kotlin backend
application composes edge, persistence, integration, and operations libraries
through the runtime layer.

## Verification

- `xmllint --noout public/assets/bluetape4k-architecture-map.svg`
- no remaining `Inter, Arial` or `font-family="Inter"` in the SVG
- rendered PNG inspected visually
- `npm run build`
- after the center-hub layout change, rendered PNG inspected again and the
  lower connector lane was moved below the `Operations` card to avoid crossing a
  component interior
