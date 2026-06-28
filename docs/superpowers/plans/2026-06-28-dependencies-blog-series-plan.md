# dependencies blog series plan

Date: 2026-06-28
Scope: bluetape4k.github.io blog planning for `bluetape4k-dependencies`.
Language: Korean-first drafts, English localization after Korean approval.

## Decision

Split the material into two blog series.

### Series A: ecosystem version and release management journey

Purpose: explain why `bluetape4k-dependencies` exists, how the ecosystem moved
from local version drift to shared governance, and how release-train discipline
evolved.

Candidate posts:

1. Why `bluetape4k-dependencies` exists: local catalog drift, shared versions,
   and the first public BOM.
2. Maven BOM vs Gradle version catalog: what is published to Maven Central and
   what is consumed by git ref or catalog tag.
3. Release train operations: projects, exposed, AWS, image, text, graph,
   leader, javers, and final dependencies BOM.
4. Checklist after the 1.3.0 incident: operator memory is not a release gate.

This series may use `1.0.x`, `1.1.x`, `1.2.0`, `1.3.0`, and `1.3.1` as
evidence. It should not be framed as the unique value of `1.3.0`.

### Series B: `dependencies 1.2.0 -> 1.3.0` library-facing changes

Purpose: use `bluetape4k-dependencies 1.3.0` as the curated entrypoint for the
library releases it pulls together. The article must explain new features,
bug fixes, and design decisions from `projects`, `exposed`, `aws`, `image`,
`text`, `graph`, `leader`, and `javers`. Do not make the article mainly about
the internal structure of `bluetape4k-dependencies`.

First post:

- Working title: `bluetape4k-dependencies 1.3.0: 새 기능보다 흥미로운 버그와 결정들`
- Reader problem: "I know the BOM moved from 1.2.0 to 1.3.0. Which library
  changes should I actually care about, why did they happen, and where can I
  use them?"
- Core material:
  - `projects 1.11.0`: security and correctness hardening across serialization,
    encryption, transport, JDBC/R2DBC, coroutine cancellation, typed-null
    binding, and transaction state.
  - `exposed 1.11.0`: cache consistency health indicators, BigQuery dry-run
    APIs, Trino options, CockroachDB helpers, and focused database compatibility
    boundaries.
  - `aws 0.4.0`: Ktor/Spring CloudWatch and CloudWatch Logs, DAX, IMDS helpers,
    S3 Access Grants, S3 Vectors, and emulator/runtime ownership decisions.
  - `image 0.3.0`: OCR adoption paths and memory-conscious large-file image IO
    backed by Okio.
  - `text 0.2.1`: runnable examples and web-service safety limits for tokenizer
    and blockword APIs.
  - `graph 0.5.1`: patch-line release context plus prior graph examples and
    managed backend work as background, but avoid overstating 0.5.1 if it was
    mainly a patch train.
  - `leader 0.4.0`: runnable backend adoption examples, benchmark evidence, and
    the Fabric8/Vert.x runtime compatibility fix for K3s.
  - `javers 0.2.1`: implementation-scope BOM boundary; use 0.2.0 features as
    context only when explaining what 0.2.1 makes safer to consume.
- Example angle:
  - Ktor application emitting CloudWatch metrics/logs without globally replacing
    logging.
  - OCR preprocessing pipeline reading large files without forcing ByteArray
    first.
  - Exposed cache consistency surfaced through Actuator health.
  - Text tokenizer/blockword endpoints mapping invalid or oversized input to
    400/413 safely.
  - K3s-backed leader election tests isolating the Fabric8-compatible Vert.x 4
    runtime.

## Drafting Rules

- Korean-first.
- Tone: practical, engineer-to-engineer, lightly witty, source-backed.
- Shape: reader problem -> concrete issue -> decision -> example -> caveat.
- Do not flatten this into a release-train operation post or a dependencies
  catalog architecture post; keep Series B about the libraries that the
  dependencies BOM version unlocks.
- After Korean approval, create matching English post and route/asset parity.

## Evidence

- `bluetape4k-dependencies` `CHANGELOG.md` `1.3.0`.
- `bluetape4k-projects` `CHANGELOG.md` `1.11.0` and selected issues such as
  #817.
- `bluetape4k-exposed` `CHANGELOG.md` `1.11.0` and selected issues such as
  #225.
- `bluetape4k-aws` `CHANGELOG.md` `0.4.0` and selected issues such as #201.
- `bluetape4k-image` `CHANGELOG.md` `0.3.0` and selected issues such as #165
  and #171.
- `bluetape4k-text` `CHANGELOG.md` `0.2.1` and selected issues such as #99.
- `bluetape4k-leader` `CHANGELOG.md` `0.4.0` and selected issues such as #480.
- `bluetape4k-graph` and `bluetape4k-javers` changelogs for accurate patch-line
  framing.
