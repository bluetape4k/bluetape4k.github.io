# Part 1 Ecosystem Overview Draft

## Context

Prepared the first draft article for the Bluetape4k introduction series. The
user clarified that `docs/drafts` is reserved for their source guidance and
future article outlines, while generated prose should live under `docs/blog`.

## Decision

Reuse existing README diagram assets instead of generating new diagrams. Site-local
ecosystem overview/module chart images are referenced with relative paths, and
repo-specific architecture diagrams are referenced through GitHub raw URLs from
the `develop` branch.

## Outcome

`docs/blog/introduction-bluetape4k-part1-ecosystem.md` now explains the
ecosystem by layers: Application, Domain Capability, Data, Infrastructure, and
Foundation. The site also has a local draft preview flow: `npm run dev:draft`
syncs `docs/blog` into ignored Starlight draft content, while publish builds
clean the generated draft pages before building.

## Verification

`docs/drafts/introduction-bluetape4k-part1-ecosystem.md` was restored from
`HEAD`. `npm run build:draft` passed with `astro check` reporting 0 errors and
0 warnings. The preview page was generated from `docs/blog`, AWS appears under
Infrastructure, Exposed appears under Data, and repo-level architecture images
are absent from Part 1.
Later edits added two overview diagrams as SVG/PNG pairs under
`docs/images/readme-diagrams/`: `bluetape4k-layer-components-01` and
`bluetape4k-layer-flow-01`. The overview table uses explicit column widths
(`12%`, `38%`, `50%`) for better readability.

## Future Guidance

When adding later parts, keep the overview page lightweight and move deep usage
examples into repo-specific follow-up articles.
