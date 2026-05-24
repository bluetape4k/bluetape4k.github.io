# Diagram Generation Guide Consolidation

## Context

README diagram generation rules had grown through sample docs, review feedback,
and per-repo lessons. Recent work also added sequence geometry and ASCII diagram
conversion rules that needed a single durable home.

## Decision

Make `docs/readme-diagram-samples/DIAGRAM_GENERATION_GUIDE.md` the canonical
workspace guide. Keep `docs/readme-diagram-samples/README.md` as a sample index
that links to the guide instead of carrying the full rule set.

## Outcome

The guide now consolidates output contract, source priority, README placement,
shared visual language, architecture/component/class/sequence/ERD rules, ASCII
diagram conversion, benchmark chart handling, approved samples, and validation.

## Verification

- Checked guide and sample README content.
- Verified local Markdown links resolve.
- Ran `git diff --check`.

## Future Rule

Add new diagram-generation decisions to the canonical guide first. Use lessons
only to record why the rule changed.
