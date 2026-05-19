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
- Use `Comic Mono` for details: member lists, columns, constraints, relation
  labels, step descriptions, captions, and badges.
- Render at source SVG size `1600x1050`; export PNG at width `2400`.

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
- No decorative orbs, gradients, bokeh, fake 3D, or stock imagery.
- Relationship labels may use small white pill backgrounds to avoid line
  collisions.

## Architecture / Flow Diagrams

AI instruction:

> Create a pastel technical infographic from this Mermaid architecture diagram.
> Do not imitate Mermaid. Use compact grouped cards, readable layer bands, and
> restrained connector lines. Convert every label to concise English. Use
> Architects Daughter for large section labels and Comic Mono for details. Keep
> whitespace balanced and avoid oversized empty regions.

Rules:

- Use compact grouped cards or layer bands rather than generic UML boxes.
- Preserve directional flow where it matters, but reduce visual noise.
- Prefer 4-8 prominent groups when the source diagram is large.
- Root README module structure may be rendered like a software stack:
  foundation, core libraries, integrations, applications/examples.

## Class Diagrams

AI instruction:

> Create a pastel UML class diagram, not an architecture diagram. Use UML
> compartment rectangles for class/interface/object boxes. Put class and
> interface names in Architects Daughter and members in Comic Mono. Arrange
> inheritance and implementation vertically. Hollow triangle arrows must point
> to the parent class or implemented interface. Dependency/use arrows must point
> from the using type to the used type.

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

## Sequence Diagrams

AI instruction:

> Create a pastel sequence diagram infographic. Keep lifelines, but group
> messages into numbered horizontal interaction bands. Use Architects Daughter
> for participant labels and title, Comic Mono for message text. Keep dashed
> return paths sparse and only show them when response behavior matters.

Rules:

- Participants remain as lifelines.
- Messages become rounded horizontal bands with numbers and short intent text.
- Use pastel color by interaction kind: request, suspend/work, response.
- Avoid dense arrow clutter; one compact return band is usually enough.

## ERD Diagrams

AI instruction:

> Create a pastel ERD using table compartments similar to the class diagram
> style. Use table names in Architects Daughter and columns/constraints in
> Comic Mono. Show primary keys, foreign keys, unique constraints, and
> cardinality labels. FK arrows must point from child or bridge table to the
> parent primary key table.

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
  `Architects Daughter`; detail text must use `Comic Mono`.
- Korean labels can be clipped or wrapped badly in generated images, so diagram
  images must use English labels even when embedded in `README.ko.md`.
- SVG source should stay in the repository even when README embeds PNG, because
  SVG is easier to edit and regenerate.
- Converting Mermaid directly to pastel SVG is not enough; diagram type must
  influence the layout and semantics.
