# JaVers Part 4 DB Write-Path Explanation Design

## Goal

Explain why the `JaVers + Exposed repository` benchmark path can take longer
than the Hibernate Envers path for database-backed writes, without turning the
committed benchmark into a general library ranking.

## Scope

- Add one Korean section immediately after the Part 4 benchmark result table.
- Add the equivalent English section in the paired article.
- Show two aligned pseudocode blocks: Hibernate Envers and JaVers + Exposed
  repository.
- Add a compact table describing conditions that increase the JaVers write
  path cost: larger aggregate state, more frequent changes, more snapshots,
  and wider commit metadata.
- Link the explanation to the current implementation boundaries:
  `ExposedCdoSnapshotRepository.saveSnapshot()` and
  `AggregateRepository.save()`.

## Non-goals

- Do not change benchmark values, charts, diagrams, or benchmark methodology.
- Do not claim that one library is universally faster.
- Do not add a new visual asset; the comparison is best read linearly as code
  and a small operational table.

## Explanation Model

The Envers path persists a JPA entity and lets Hibernate write its revision and
audit records during the transaction flush. The JaVers + Exposed repository
path first builds a JaVers commit and encoded snapshot, then verifies whether
the commit metadata already exists, persists it when necessary, and writes a
snapshot row containing the encoded full state and changed-property metadata.

The added prose must distinguish these implementation paths from a pure
library-cost comparison. Both paths audit changes; their storage models and
work performed inside a measured operation differ.

## Pseudocode Contract

The Envers pseudocode shows: begin transaction, persist current entity,
Hibernate flush/change detection, write revision and entity audit records,
commit.

The JaVers pseudocode shows: build commit, encode snapshot, begin transaction,
check commit metadata, insert metadata when absent, insert snapshot fields,
commit.

The text below the blocks explains that serialization, metadata existence
checking, extra rows, larger payloads, and JDBC/SQL execution can each add
write-path cost. It also explains that aggregate persistence is an additional
step only on the separate DDD path, not on the repository-only benchmark path.

## Verification

- Verify every pseudocode claim against the benchmark implementation and the
  two linked source classes.
- Verify Korean and English heading, claim, source-link, and table parity.
- Run `git diff --check`, the site build, and both article route checks.
- Update the existing PR without merging or deploying.
