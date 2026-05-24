# README Diagram Generation Guide

Date: 2026-05-24
Scope: bluetape4k workspace README diagrams and benchmark chart imagery

This is the canonical generation guide for README visual assets across the
bluetape4k workspace. Keep generation rules here instead of scattering them
through PR notes, lessons, or per-repo scripts.

## Skill Usage And Sync

- Use `$bluetape4k-diagram` for any bluetape4k README diagram work, including
  architecture, sequence, class/UML, ERD, flow, topology, Mermaid/ASCII
  conversion, and benchmark chart imagery.
- When this guide changes, update the `bluetape4k-diagram` skill in the same
  change for both Codex and Claude:
  - `~/.codex/skills/bluetape4k-diagram/SKILL.md`
  - `~/.claude/skills/bluetape4k-diagram/SKILL.md`
  - managed chezmoi sources under `private_dot_codex/private_skills/` and
    `private_dot_claude/private_skills/`
- When `$bluetape4k-diagram` changes for workspace-wide behavior, update this
  guide as the canonical source.

## Goal

Replace Mermaid and ASCII diagrams in README files with deterministic,
professional pastel infographic assets. README files embed PNGs for stable
GitHub rendering, while matching SVG sources stay in the repository for review,
reuse, and regeneration.

Generated diagrams must not look like recolored Mermaid output. Diagram type
must drive the layout, geometry, labels, and connector semantics.

## Output Contract

- Generate both `.svg` and `.png` for every README diagram.
- Embed only `.png` in README files.
- Keep the matching `.svg` next to the PNG.
- Store README diagram assets under `docs/images/readme-diagrams/` unless a
  repo-local rule requires root README assets under `docs/assets/`.
- Store benchmark chart assets under `docs/images/readme-charts/`.
- Use English text inside all generated images, including images embedded in
  localized README files.
- Use content-driven SVG dimensions. Do not force every diagram into one fixed
  aspect ratio.
- Treat current source code as the authority for class/API diagrams. Recovered
  Mermaid history is a source, not proof.

## Source Priority

1. Current source code and public APIs.
2. Current README text and examples.
3. Existing SVG/PNG assets when they are visually sound and concept-equivalent.
4. Recovered Mermaid or ASCII history from git.

If a recovered diagram mentions removed, renamed, deprecated, or internal-only
APIs, rebuild the model from current source or drop the stale element.

## README Placement

- Place architecture/module diagrams near the top, usually after overview or key
  features and before detailed usage examples.
- Place class diagrams near API, repository, domain model, or type hierarchy
  sections.
- Place sequence diagrams near workflow, request lifecycle, transaction flow,
  cache pattern, or operation sections.
- Place ERDs near schema/domain-model sections, before query examples that rely
  on the relationships.
- Place benchmark charts next to the measured result table they summarize.
- Keep a final `Diagrams` section only for explicit diagram galleries or whole
  document summaries.

## Shared Visual Language

- Background: near-white canvas, white rounded outer frame, subtle blue-gray
  border.
- Palette: pastel blue, green, amber, pink, teal, lavender, and soft neutral
  gray. Avoid dark one-note palettes.
- Typography:
  - Use `Architects Daughter` for title, actor, class/table name, panel label,
    and prominent component text.
  - Use a readable Comic-style proportional fallback for details, captions,
    member lists, columns, constraints, and compact annotations.
- Keep all text inside containers. Shorten English labels before shrinking text.
- Title text must fit the canvas. Move parenthetical detail into the subtitle or
  omit it.
- Component text must be vertically centered inside cards.
- Relationship labels may use small white pill backgrounds to avoid line
  collisions.
- Connector paths must have a visible stem. A marker-only arrowhead is failed
  rendering even when the SVG is syntactically valid.
- Do not use decorative orbs, bokeh, fake 3D, stock imagery, or gradient-only
  backgrounds.

## Architecture And Flow Diagrams

Use compact grouped cards, layer bands, or panel composition rather than generic
Mermaid boxes.

- Prefer 4-8 prominent groups for large diagrams.
- Size groups by item count. Do not stretch every section to equal height.
- Prefer chapter-12-style panel composition when comparing frameworks, adapters,
  runtimes, or example variants: large stack/runtime panels with internal
  component cards, local arrows inside panels, and a compact shared band below.
- For component architecture, keep cards close enough to read the flow but leave
  visible connector stems between card boundaries.
- Use filled triangular arrowheads by default:
  `markerWidth=9`, `markerHeight=9`, `refX=8`, `refY=4.5`, path
  `M1,1 L8,4.5 L1,8 Z`.
- Omit hub-to-group connector lines when they create a hairball. Grouping can
  carry structure when explicit lines reduce readability.
- Root README module structure may use a software stack layout: foundation,
  core libraries, integrations, applications/examples.

Prompt shape:

> Create a pastel technical infographic from this architecture diagram. Do not
> imitate Mermaid. Use compact grouped cards, readable layer bands, restrained
> connector lines, English labels, Architects Daughter for large labels, and a
> readable Comic-style fallback for details.

## Component Placement

- Prefer balanced whitespace over rigid symmetry.
- Place related cards near their actual relationship cluster.
- Avoid huge empty quadrants and over-wide single-row pipelines.
- In dense diagrams, use local buses or shared lanes instead of drawing every
  dependency as a long center-crossing curve.
- Card connectors must span the visible gap between cards, not only the midpoint
  of the gap.

## Class Diagrams

Render class diagrams as UML diagrams, not architecture diagrams.

- Use UML compartments: header, fields, operations/notes.
- Use small-radius rectangular boxes (`rx=4`) for class/interface/object boxes.
- Generalization and realization arrows point from child/implementation to
  parent/interface with a hollow triangle at the parent endpoint.
- Dependency/use arrows point from the using type to the used type.
- Prefer vertical inheritance trees. Place unrelated collaborators at the sides.
- Use free placement and orthogonal lanes when it reduces edge overlap.
- Route shared relationships through local buses or section lanes.
- Connector paths must terminate at class box boundaries and must not pass
  through class interiors.
- Verify every displayed class, field, method, and relationship against current
  source before rendering.

Prompt shape:

> Create a pastel UML class diagram. Use UML compartment rectangles. Put class
> and interface names in Architects Daughter and members in a readable
> Comic-style detail font. Arrange inheritance vertically. Hollow triangle
> arrows point to the parent class or implemented interface.

## Sequence Diagrams

Keep lifelines, but make the visual readable as a sequence infographic.

- Use generous outer margins. Participant headers, first/last messages, and
  notes must not hug the frame.
- Keep internal vertical spacing compact. Labels should sit close to their
  arrows; avoid large gaps between a call arrow and its label.
- Participant header labels must be vertically centered with the same baseline
  logic as architecture cards.
- Messages become numbered rounded horizontal interaction bands with short
  English intent text.
- Use pastel color by interaction kind: request, suspend/work, response.
- Keep dashed return paths sparse. Show returns only when response behavior
  matters.
- Self-calls must render as small loop arrows. A self-call must never collapse
  into a zero-length path where only the arrowhead remains.
- Do not impose a fixed height limit. Grow the canvas until the sequence and
  notes fit.
- Notes and summaries must not cover the sequence body.
- If a normalized non-English message becomes empty, use participating
  components as the fallback label, for example `S3Client to LocalStack`.

Prompt shape:

> Create a pastel sequence diagram infographic. Keep lifelines, group messages
> into numbered horizontal interaction bands, use generous outer margins,
> compact internal label-to-arrow spacing, and render self-calls as visible loop
> arrows.

## ERD Diagrams

Use table compartments similar to class diagrams.

- Render tables as compartments: table name, key columns, remaining columns,
  constraints/notes.
- Ignore Mermaid config/init blocks. They are renderer configuration, not
  database tables.
- If Mermaid ERDs list only relationships, derive table boxes from relationship
  endpoints.
- FK arrow direction:
  - child table -> parent table
  - bridge table -> each parent table
- Show bridge tables as first-class tables for many-to-many relationships.
- Prefer free placement and orthogonal FK routing over uniform table grids.
- Use named FK lanes for repeated parent references such as `tenantId`,
  `clinicId`, or `appointmentId`.
- Connector paths must terminate at table boundaries and must not pass through
  table compartments.

Prompt shape:

> Create a pastel ERD using table compartments. Use table names in Architects
> Daughter and columns/constraints in a readable Comic-style detail font. Show
> primary keys, foreign keys, unique constraints, and cardinality labels. FK
> arrows point from child or bridge table to parent tables.

## ASCII Diagram Conversion

Treat ASCII diagrams as source material, not final README content.

- Convert architecture, flow, sequence, ERD, decision-tree, and topology ASCII
  blocks to SVG/PNG assets.
- Leave project directory trees as code blocks unless they are being used as a
  conceptual diagram.
- Reuse an existing concept-equivalent PNG/SVG pair before generating a new
  asset.
- When converting localized ASCII diagrams, normalize labels to concise English
  inside the image and keep surrounding README prose localized.
- Replace ASCII code fences with PNG image links near the same section.

## Benchmark Charts

Benchmark result visuals are charts, not diagrams.

- Use charts only for tables with explicit numeric measurements.
- Preserve measured Markdown tables as the source of truth.
- Choose chart shape from metric shape:
  - ranking/top-N throughput: horizontal bar chart
  - latency by operation: grouped horizontal bars
  - environment or payload-size comparison: grouped bars
  - time-series history: line chart
- Show unit and direction: `higher is better` for throughput, `lower is better`
  for latency.
- Use log scale when values differ by orders of magnitude, and label it.

## Approved Samples

| Kind | PNG | SVG |
|---|---|---|
| Architecture modules | [`projects-module-sample-5-contact-sheet.png`](./projects-module-sample-5-contact-sheet.png) | source assets live in target repos |
| Architecture roots | [`sample-5-contact-sheet.png`](./sample-5-contact-sheet.png) | source assets live in target repos |
| Class diagram | [`class-diagram-style-v3-sample.png`](./class-sequence-style/class-diagram-style-v3-sample.png) | [`class-diagram-style-v3-sample.svg`](./class-sequence-style/class-diagram-style-v3-sample.svg) |
| Sequence diagram | [`sequence-diagram-style-sample.png`](./class-sequence-style/sequence-diagram-style-sample.png) | [`sequence-diagram-style-sample.svg`](./class-sequence-style/sequence-diagram-style-sample.svg) |
| ERD | [`blog-schema-erd-style-sample.png`](./erd-style/blog-schema-erd-style-sample.png) | [`blog-schema-erd-style-sample.svg`](./erd-style/blog-schema-erd-style-sample.svg) |

## Validation Checklist

Before review or PR:

- README image links touched by the work resolve: `missing=0`.
- README files do not embed local `docs/images/readme-diagrams/*.svg` links.
- Every new SVG parses as XML.
- Every new SVG has a rendered PNG.
- Diagram-like ASCII fences are gone unless they are intentional project
  structure listings.
- Architecture diagrams have visible connector stems and no marker-only arrows.
- Sequence diagrams pass:
  - generous outer margin check
  - compact label-to-arrow spacing check
  - participant header baseline check
  - zero-length self-call check
- Class and ERD diagrams have no connector path through box/table interiors.
- Source drift checks pass for deprecated APIs, removed classes, stale field
  names, and relationship directions.
- Visual sanity check passes at README scale and contact-sheet scale:
  - no clipped text
  - no overlapping labels
  - no huge blank regions
  - no dense edge hairballs
  - no notes covering sequence bodies
- `git diff --check` is clean.

Only claim completion after link validation, generated asset validation, and
visual validation all pass.
