# README Diagram Style Feedback

## Context

The workspace README diagram guide needed to capture design feedback from
comparing `exposed-r2dbc-workshop` chapter 10, 11, and 12 diagrams.

## Decision

Prefer chapter-12-style component panel composition for architecture diagrams,
but keep `Architects Daughter` typography from chapter 10/11. Use filled
triangular arrowheads by default, sized smaller than the old chapter 12 sample.

## Outcome

`docs/readme-diagram-samples/README.md` now documents panel composition,
smaller triangular arrow markers, and typography rules for architecture/flow
diagrams.

## Verification

- Ran `git diff --check`.

## Future Guidance

When updating README architecture images, start from a panel composition and
then tune arrow size and font hierarchy before rendering PNG assets.
