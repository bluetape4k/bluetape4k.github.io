# Graph series writing and diagram review

## Context

The bluetape4k-graph Part 1-4 series went through several review passes for
diagram readability, author voice, bilingual parity, benchmark wording, and
workshop example applicability.

## Decision

Write graph posts as the library author explaining a practical adoption path,
not as a third-party catalog of modules. Each section should start from the
reader's service problem, show the smallest useful example or diagram, then
state the boundary where native graph storage features or another tool is the
better choice.

For diagrams, widen the canvas and boxes before shortening labels. Validate
rendered PNGs individually when a reviewer flags connector visibility, spacing,
or ERD readability. Body diagrams should explain the example case; hero figures
remain editorial 3D workbench images, not architecture diagrams.

## Outcome

The Graph series now keeps Korean and English posts aligned across:

- graph storage selection and Cypher boundaries
- `GraphOperations`, schema, transaction, merge, and execution model guidance
- Graph I/O formats, benchmark context, and mean-only quick-run tables
- workshop scenarios with ERDs and Spring Boot/Ktor integration examples

## Verification

- `git diff --check`
- `npm run build`
- local route checks for Korean and English Graph Part 1-4
- rendered PNG inspection for the updated graph diagrams and ERDs

## Future guidance

Do not ship a graph article that only lists repository examples and links to
README files. Readers need enough scenario explanation in the post itself to
decide whether the pattern applies to their service.

When benchmark result files do not include standard deviation or error values,
do not invent placeholder columns or write third-party notes such as "not in
the original quick-run." State the metric that exists, its run shape, and the
limits of using it.
