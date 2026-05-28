# GraphDB Adoption Blog

## Context

The graph benchmark PR produced a narrow adoption signal: Neo4j won the large
long-chain authorization inheritance row, PostgreSQL CTE still won deep-wide,
AGE timed out on both large adoption scenarios, and Memgraph failed during local
large fixture load after smoke parity.

## Decision

Write the website post before merging the graph benchmark PR, but publish it as
a separate website PR. This keeps the narrative fresh while allowing final link
stabilization after the benchmark PR lands.

## Outcome

Added English and Korean posts about when backend services should adopt GraphDB,
using the benchmark result to separate good GraphDB candidates from ordinary
relational workloads. The post ends with TODO work for hybrid performance
improvements: cache-assisted traversal, materialized views, incremental graph
projections, candidate pruning, online/offline split, correctness validation,
and operational-cost measurement.

## Verification

- `npm run build`

## Next Time

For benchmark-backed public posts, include failed candidates in the main table.
Timeouts and load failures are part of adoption evidence, not footnotes.
