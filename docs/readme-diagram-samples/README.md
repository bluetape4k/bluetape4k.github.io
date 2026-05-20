# README Diagram Image Style Guide

Date: 2026-05-20
Scope: bluetape4k workspace README Mermaid diagram and benchmark chart imagery

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
- Render from current README Mermaid blocks when they still exist. When a README
  already embeds diagram images, recover the original Mermaid from git history
  and regenerate the PNG/SVG pair from that source.
- Treat generic section titles such as `Diagram`, `Architecture`, `Class
  Diagram`, `Sequence Diagram`, and `ERD` as fallback-only titles. Replace them
  with module-specific English titles such as `leader Sequence Flow` or
  `text Class Structure`.
- Use `Architects Daughter` for large visual labels: page title, table name,
  class name, actor name, section name, and note headline.
- Use a readable Comic-style proportional fallback for details when narrow text
  matters: member lists, columns, constraints, relation labels, step
  descriptions, captions, and badges. Do not use a heavy or condensed detail
  font that makes small labels blur together.
- Use content-driven SVG dimensions. Do not force every diagram into the same
  width, height, or aspect ratio. Export PNG at a readable width while preserving
  the natural SVG aspect ratio.
- Benchmark result visuals are charts, not diagrams. Store them under
  `docs/images/readme-charts/`, keep SVG and PNG pairs, and embed the PNG.

## README Placement

- Do not append every diagram to a final `Diagrams` section by default. Diagram
  placement must follow the surrounding documentation flow.
- Put the main Architecture or Module Structure diagram near the top, normally
  after the overview/key-features section and before detailed usage examples.
- Put class diagrams next to the API, repository, domain model, or type hierarchy
  section they explain.
- Put sequence diagrams next to the workflow, cache pattern, request lifecycle,
  transaction flow, or operation they explain.
- Put ERDs next to schema/domain-model sections, before query examples that
  rely on those relationships.
- Keep a final `Diagrams` section only when the README is explicitly a diagram
  gallery or when the diagrams summarize the whole document after the detailed
  sections. Otherwise, move diagrams into the relevant section.
- If a recovered Mermaid diagram no longer matches a meaningful README section,
  rebuild the README section first or drop the diagram instead of keeping it as
  a disconnected appendix image.

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
- Title text must fit the canvas. If a title is too long because it includes a
  parenthetical module description, keep the concise title and move or omit the
  parenthetical detail.
- Component text must be vertically centered inside cards. Do not top-align
  short component labels and leave a large bottom gap.
- No decorative orbs, gradients, bokeh, fake 3D, or stock imagery.
- Relationship labels may use small white pill backgrounds to avoid line
  collisions.
- Connector paths must have a visible stem. A marker-only arrow head or a
  near-zero-length line segment is a failed rendering even when the SVG is
  syntactically valid.
- Treat current source code as the authority when Mermaid history and source
  disagree. README diagrams must not promote classes, interfaces, methods, or
  fields that are deprecated, removed, renamed, or no longer part of the public
  usage path.
- If a deprecated compatibility API appears in recovered Mermaid, either omit it
  from the representative diagram or show it only as a small compatibility note.
  Never make it the central class, root node, or largest visual element.
- Before rendering a class/API diagram, grep the current source for every
  displayed class, field, method, and relationship. Use source names such as
  `table` instead of stale names such as `entityTable` when APIs have changed.
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
- Adjacent card connectors must span the visible gap between card boundaries.
  Do not place the path only in the center of the gap; that renders as a bare
  `>` marker at normal README scale.
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
- Keep enough vertical distance between parent and child class rows so
  inheritance and realization arrows show a visible line segment. A triangle
  marker without a readable stem is a failed rendering.
- Do not invent classes that were not present in the Mermaid source or recovered
  history. If the original source has too little information, render a smaller
  faithful diagram rather than padding the layout.
- Do not preserve a recovered Mermaid relationship when current source has made
  it stale. Rebuild the class set and relationships from the current public API
  before generating the final SVG/PNG.

## Sequence Diagrams

AI instruction:

> Create a pastel sequence diagram infographic. Keep lifelines, but group
> messages into numbered horizontal interaction bands. Use Architects Daughter
> for participant labels and title, and the clearest Comic-style detail font for
> message text. Keep dashed return paths sparse and only show them when response
> behavior matters.

Rules:

- Participants remain as lifelines.
- Participant header labels must be vertically centered in their header boxes
  using the same baseline logic as architecture cards.
- Messages become rounded horizontal bands with numbers and short intent text.
- Use pastel color by interaction kind: request, suspend/work, response.
- Avoid dense arrow clutter; one compact return band is usually enough.
- If a non-English message label becomes empty after English normalization, use
  the participating components as the fallback label, for example
  `S3Client to LocalStack`. Do not render meaningless labels such as
  `message`.
- Self-calls must render as a small loop arrow. A sequence message from a
  participant to itself must not collapse into a zero-length path where only
  the arrow head remains.
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
- Ignore Mermaid config/init blocks such as `%%{init: ...}%%`. They are renderer
  configuration, not database tables.
- Some Mermaid ERDs list only relationships and omit table definition blocks.
  In that case, derive table boxes from the relationship endpoints instead of
  skipping the diagram.
- FK arrow direction:
  - child table -> parent table
  - bridge table -> each parent table
- Solid relation lines may show cardinality near endpoints.
- Dashed FK arrows show dependency direction and column name.
- For many-to-many relationships, show the bridge table as a first-class table.

## Benchmark Charts

AI instruction:

> Create a pastel benchmark result chart from the measured table. Do not render
> numeric benchmark results as architecture cards or UML boxes. Use bar or line
> charts according to the metric shape, keep all labels in English, and preserve
> the table as the source of truth in Markdown.

Rules:

- Use charts for benchmark results. Use diagrams only for structure, workflow,
  class relationships, sequence behavior, or schemas.
- Store chart assets under `docs/images/readme-charts/` and embed PNG links.
  Keep SVG next to the PNG for reuse.
- Put charts next to the benchmark result table they summarize. For README
  pages that link to separate benchmark result documents, add charts in the
  linked result document as well as the README summary when useful.
- Search for benchmark result documents by filename and path, including
  `*benchmark*.md`, `*/benchmark*/**/*.md`, and README links to result reports.
- Keep measured tables and raw JMH/Gatling output blocks. The chart is a reading
  aid, not the canonical data source.
- Choose chart shape from the data:
  - ranking or top-N throughput: horizontal bar chart
  - latency comparison by operation: grouped horizontal bars
  - environment or payload-size comparison: grouped bars by environment or
    payload
  - time-series benchmark history: line chart
- Show unit and direction in the chart or nearby caption: `higher is better` for
  throughput and `lower is better` for latency.
- Use log scale when values differ by orders of magnitude, for example L1 cache
  hits versus Redis-backed operations or small R2DBC values beside JDBC values.
  Label the chart as log scale.
- Do not pad a chart with fake categories to fill a fixed layout. Small result
  sets should produce compact charts; large result sets may become taller.
- Avoid overlapping labels by growing the canvas height. A chart that clips the
  last row or puts notes over bars is a failed rendering.
- For literature-review benchmark documents, chart only tables with explicit
  numeric values. Do not turn qualitative claims or relative prose into invented
  numbers.

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
- Benchmark tables should become chart images only when they contain actual
  result data. Explanatory benchmark module README files without measured
  values do not need charts.
- Link checks alone are not enough. A diagram can be linked correctly while
  still having clipped text, empty layout, overlapping labels, or invented
  filler nodes.

## Validation Checklist

Before asking for review or opening a PR:

- Regenerate every README diagram in the target repo from the current README or
  recovered Mermaid history.
- Confirm every README `docs/images/readme-diagrams/*.png` link exists.
- Confirm every benchmark chart `docs/images/readme-charts/*.png` link exists
  when benchmark charts are part of the work.
- Confirm all local README image links touched by the work resolve, including
  legacy relative image links outside `readme-diagrams`.
- Confirm README files do not embed `docs/images/readme-diagrams/*.svg`.
- Confirm the renderer reports zero missing Mermaid sources or skipped required
  assets.
- Confirm Architecture or Module Structure diagrams appear near the top of the
  README, and class/sequence/ERD diagrams appear next to their relevant API,
  workflow, or schema sections rather than being appended mechanically.
- Run a visual sanity check for suspicious output: extreme aspect ratios, tiny
  unreadable text, huge blank areas, dense edge hairballs, clipped right edges,
  truncated titles, overlapping labels, inheritance markers without visible
  stems, and notes covering sequence bodies.
- Run geometry checks for architecture short connectors, sequence participant
  header baseline, and sequence zero-length self-call arrows.
- Run source drift checks for deprecated API names, removed class names, stale
  field names, and relationship directions before accepting generated images.
- For benchmark chart work, scan `*benchmark*.md`, `*/benchmark*/**/*.md`, and
  README-linked benchmark reports for result tables. Skip benchmark module
  overview README files when they describe what will be measured but contain no
  measured values.
- Spot-check known risk patterns before user review:
  `testing-junit5-diagram-01`, `testing-testcontainers-diagram-02`, a wide
  class inheritance diagram, a large grouped architecture diagram, and at least
  one sequence diagram.
- Only claim completion after link validation and visual validation both pass.
