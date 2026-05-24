# Diagram generation rule refinement

Date: 2026-05-24

## Context

The README diagram generation rules needed tighter defaults for architecture and sequence diagrams after review of the new `bluetape4k-diagram` skill.

## Decision

Architecture diagrams now default to layered architecture, filled triangular arrowheads, and right-angled orthogonal connectors. Sequence diagrams must render conditional branches such as `alt`, `else`, and `opt` explicitly. Generated diagram text uses Comic Mono for detail labels, and localized README files share the same English-label diagram assets by default.

## Outcome

The canonical guide and the Codex/Claude `bluetape4k-diagram` skill now carry the same execution rules, including asset naming, README embed, rendering tool, and validation command guidance.

## Verification

- `git diff --check`
- YAML frontmatter parse for Codex/Claude `bluetape4k-diagram` skill copies

## Future agents

Do not create localized diagram variants unless the image itself must show locale-specific domain terms. Prefer shared English-label PNG/SVG assets across README locales.
