# Diagram skill sync

Date: 2026-05-24

## Context

The workspace README diagram guide was updated after `bluetape4k-diagram` became the single execution surface for README diagram generation rules.

## Decision

Keep the canonical guide and the Codex/Claude `bluetape4k-diagram` skills synchronized. Diagram guide changes must include the skill update, and workspace-wide skill behavior changes must update the guide.

## Outcome

The guide now tells agents to use `$bluetape4k-diagram` for README architecture, sequence, class/UML, ERD, flow, topology, Mermaid/ASCII conversion, and benchmark chart imagery.

## Verification

- `git diff --check`

## Future agents

Do not duplicate detailed diagram rules across unrelated bluetape4k skills. Update `bluetape4k-diagram` and the guide together.
