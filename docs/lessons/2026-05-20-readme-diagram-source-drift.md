# README diagram source drift rule

## Context
Generated README diagrams can look good while preserving stale Mermaid content, including deprecated or renamed APIs.

## Decision
The style guide now makes current source code authoritative over recovered Mermaid history for class/API diagrams.

## Outcome
The guide requires source drift checks for deprecated APIs, removed classes, stale field names, and relationship directions before accepting generated SVG/PNG assets.

## Verification
Reviewed the updated guide text and aligned it with the exposed `HasIdentifier` correction.

## Next time
Reject visually polished diagrams when their source model no longer matches the current public API.
