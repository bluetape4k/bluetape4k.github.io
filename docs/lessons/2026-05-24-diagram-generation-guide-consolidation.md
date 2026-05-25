# Diagram Generation Guide Consolidation

## Context

README diagram generation rules had grown through sample docs, review feedback,
and per-repo lessons. Recent work also added sequence geometry and ASCII diagram
conversion rules that needed a single durable home.

## Decision

Originally make `docs/readme-diagram-samples/DIAGRAM_GENERATION_GUIDE.md` the
canonical workspace guide. This was later superseded because organization-wide
guidance belongs in `.github/docs/workspace/DIAGRAM_GENERATION_GUIDE.md`, while
`docs/readme-diagram-samples/README.md` remains a sample index.

## Outcome

The guide now consolidates output contract, source priority, README placement,
shared visual language, architecture/component/class/sequence/ERD rules, ASCII
diagram conversion, benchmark chart handling, approved samples, and validation.

## Verification

- Checked guide and sample README content.
- Verified local Markdown links resolve.
- Ran `git diff --check`.

## Future Rule

Add new diagram-generation decisions to
`.github/docs/workspace/DIAGRAM_GENERATION_GUIDE.md` first. Use website sample
docs for visual examples, not organization-wide policy.
