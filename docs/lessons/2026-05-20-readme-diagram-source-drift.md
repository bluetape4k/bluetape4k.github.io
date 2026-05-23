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

## 2026-05-20 Class and ERD routing rule

Class diagrams and ERDs need layout freedom beyond a uniform grid. The style
guide now requires free placement, orthogonal relationship lanes, and rejection
of connector paths that cross through class or table interiors.

Use shared lanes for repeated dependencies such as `clinicId` or a common
interface implementation target. This keeps diagrams reusable for README,
slides, and blog posts because the viewer can read relationship clusters without
decoding a dense arrow bundle.
