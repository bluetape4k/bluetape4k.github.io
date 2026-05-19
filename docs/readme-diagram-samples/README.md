# README Diagram Image Style Guide

Date: 2026-05-19
Scope: bluetape4k workspace README Mermaid diagram replacement

## Goal

Replace README Mermaid code blocks with deterministic infographic-style PNG
images, while keeping matching SVG source assets for later reuse.

The visual result should not look like a Mermaid theme recolor. It should look
like a professional pastel technical infographic with clear diagram-specific
semantics.

## Output Contract

- Generate both `.svg` and `.png` for every rendered README diagram.
- Embed the `.png` in README files for stable GitHub rendering and font
  behavior.
- Keep the `.svg` next to the PNG so it can be reused or regenerated later.
- Store assets under `docs/images/readme-diagrams/` unless a repo-local rule
  requires root README assets under `docs/assets/`.
- Use English text inside all diagram images, including localized README files.
- Do not include Korean, Japanese, or Chinese labels in generated diagram
  images.
- Use `Architects Daughter` for large visual labels: page title, table name,
  class name, actor name, section name, and note headline.
- Use a readable Comic-style proportional fallback for details when narrow text
  matters: member lists, columns, constraints, relation labels, step
  descriptions, captions, and badges. Do not use a heavy or condensed detail
  font that makes small labels blur together.
- Use content-driven SVG dimensions. Do not force every diagram into the same
  width, height, or aspect ratio. Export PNG at a readable width while preserving
  the natural SVG aspect ratio.

## Approved Samples

These samples are the review baseline for the cross-repository README work.

| Diagram kind | PNG | SVG |
|---|---|---|
| Architecture modules | [`projects-module-sample-5-contact-sheet.png`](./projects-module-sample-5-contact-sheet.png) | source assets live in each target repo |
| Architecture roots | [`sample-5-contact-sheet.png`](./sample-5-contact-sheet.png) | source assets live in each target repo |
| Class diagram | [`class-diagram-style-v3-sample.png`](./class-sequence-style/class-diagram-style-v3-sample.png) | [`class-diagram-style-v3-sample.svg`](./class-sequence-style/class-diagram-style-v3-sample.svg) |
| Sequence diagram | [`sequence-diagram-style-sample.png`](./class-sequence-style/sequence-diagram-style-sample.png) | [`sequence-diagram-style-sample.svg`](./class-sequence-style/sequence-diagram-style-sample.svg) |
| ERD | [`blog-schema-erd-style-sample.png`](./erd-style/blog-schema-erd-style-sample.png) | [`blog-schema-erd-style-sample.svg`](./erd-style/blog-schema-erd-style-sample.svg) |

## Shared Visual Language

- Background: near-white canvas, white rounded outer frame, subtle blue-gray
  border.
- Palette: pastel blue, green, amber, pink, teal, lavender, and soft neutral
  gray. Avoid dark one-note palettes.
- Cards: small radius (`rx=4`) for UML/ERD compartments, larger radius only for
  notes or sequence bands.
- Text must fit inside its container; prefer shorter English labels over dense
  prose.
- Component text must be vertically centered inside cards. Do not top-align
  short component labels and leave a large bottom gap.
- No decorative orbs, gradients, bokeh, fake 3D, or stock imagery.
- Relationship labels may use small white pill backgrounds to avoid line
  collisions.
- Remove low-signal generated labels such as `Object`, `Interface`, `Creates`,
  `Kotlin Object`, temporary IDs, and meaningless path prefixes. Prefer the
  real domain or module name, for example `lettuce`, `redisson`, or `kafka`
  instead of `infra/lettuce`.

## Architecture / Flow Diagrams

AI instruction:

> Create a pastel technical infographic from this Mermaid architecture diagram.
> Do not imitate Mermaid. Use compact grouped cards, readable layer bands, and
> restrained connector lines. Convert every label to concise English. Use
> Architects Daughter for large section labels and the clearest Comic-style
> detail font available. Keep whitespace balanced and avoid oversized empty
> regions.

Rules:

- Use compact grouped cards or layer bands rather than generic UML boxes.
- Preserve directional flow where it matters, but reduce visual noise.
- Prefer 4-8 prominent groups when the source diagram is large.
- Size groups by their actual item count. Small diagrams should stay compact;
  large diagrams may become taller or wider.
- Use masonry-style group placement when group heights differ. Do not stretch
  every section to the same height just to fill a grid.
- Keep enough vertical distance between a root/hub card and grouped sections so
  connector lines clearly descend instead of becoming nearly horizontal.
- When a diagram has many groups, omit hub-to-group connector lines if they
  create a hairball. Use section grouping and local relationships instead.
- Root README module structure may be rendered like a software stack:
  foundation, core libraries, integrations, applications/examples.

## Class Diagrams

AI instruction:

> Create a pastel UML class diagram, not an architecture diagram. Use UML
> compartment rectangles for class/interface/object boxes. Put class and
> interface names in Architects Daughter and members in the clearest Comic-style
> detail font available. Arrange inheritance and implementation vertically.
> Hollow triangle arrows must point to the parent class or implemented
> interface. Dependency/use arrows must point from the using type to the used
> type.

Rules:

- Use UML compartments: header, fields, operations/notes.
- Keep class boxes rectangular with small radius (`rx=4`) so they are visually
  distinct from architecture cards.
- Generalization/realization:
  - child/subclass -> parent/superclass
  - implementing class -> interface
  - hollow triangle marker at the parent/interface endpoint
- Dependency/use:
  - using type -> used type
  - dashed line with open arrow, no composition diamond unless the source
    diagram explicitly models composition.
- Prefer vertical inheritance trees. Only place unrelated collaborators at the
  sides.
- Wrap wide same-depth inheritance rows, usually at four boxes per row, so class
  names and members remain readable.
- Do not invent classes that were not present in the Mermaid source or recovered
  history. If the original source has too little information, render a smaller
  faithful diagram rather than padding the layout.

## Sequence Diagrams

AI instruction:

> Create a pastel sequence diagram infographic. Keep lifelines, but group
> messages into numbered horizontal interaction bands. Use Architects Daughter
> for participant labels and title, and the clearest Comic-style detail font for
> message text. Keep dashed return paths sparse and only show them when response
> behavior matters.

Rules:

- Participants remain as lifelines.
- Messages become rounded horizontal bands with numbers and short intent text.
- Use pastel color by interaction kind: request, suspend/work, response.
- Avoid dense arrow clutter; one compact return band is usually enough.
- Do not impose a fixed height limit. Grow the canvas until the full sequence
  and any notes are visible.
- Keep call labels close to their arrows. Avoid large vertical gaps between a
  call arrow and its label.
- Notes, summaries, or explanation boxes must not cover the sequence body.

## ERD Diagrams

AI instruction:

> Create a pastel ERD using table compartments similar to the class diagram
> style. Use table names in Architects Daughter and columns/constraints in
> the clearest Comic-style detail font available. Show primary keys, foreign
> keys, unique constraints, and cardinality labels. FK arrows must point from
> child or bridge table to the parent primary key table.

Rules:

- Render tables as UML-like compartments: name, key columns, remaining columns,
  constraints/notes.
- FK arrow direction:
  - child table -> parent table
  - bridge table -> each parent table
- Solid relation lines may show cardinality near endpoints.
- Dashed FK arrows show dependency direction and column name.
- For many-to-many relationships, show the bridge table as a first-class table.

## Lessons From Review

- Font choice is part of the design: large visual labels must use
  `Architects Daughter`; detail text must use the clearest Comic-style fallback
  available for the renderer.
- Korean labels can be clipped or wrapped badly in generated images, so diagram
  images must use English labels even when embedded in `README.ko.md`.
- SVG source should stay in the repository even when README embeds PNG, because
  SVG is easier to edit and regenerate.
- Converting Mermaid directly to pastel SVG is not enough; diagram type must
  influence the layout and semantics.
- Link checks alone are not enough. A diagram can be linked correctly while
  still having clipped text, empty layout, overlapping labels, or invented
  filler nodes.

## Validation Checklist

Before asking for review or opening a PR:

- Regenerate every README diagram in the target repo from the current README or
  recovered Mermaid history.
- Confirm every README `docs/images/readme-diagrams/*.png` link exists.
- Confirm README files do not embed `docs/images/readme-diagrams/*.svg`.
- Confirm the renderer reports zero missing Mermaid sources or skipped required
  assets.
- Run a visual sanity check for suspicious output: extreme aspect ratios, tiny
  unreadable text, huge blank areas, dense edge hairballs, clipped right edges,
  overlapping labels, and notes covering sequence bodies.
- Spot-check known risk patterns before user review:
  `testing-junit5-diagram-01`, `testing-testcontainers-diagram-02`, a wide
  class inheritance diagram, a large grouped architecture diagram, and at least
  one sequence diagram.
- Only claim completion after link validation and visual validation both pass.
