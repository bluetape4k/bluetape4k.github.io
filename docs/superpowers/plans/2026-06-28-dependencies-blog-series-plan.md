# dependencies blog series plan

Date: 2026-06-28
Scope: bluetape4k.github.io blog planning for `bluetape4k-dependencies`.
Language: Korean-first drafts, English localization after Korean approval.

## Decision

Split the material into one usage guide and two blog series. Do not mix the
audiences.

### Guide: using `bluetape4k-dependencies`

Audience: application developers who consume bluetape4k libraries.

Purpose: show how to import the BOM and declare versionless bluetape4k modules
in Gradle and Maven.

Published or draft post:

- `bluetape4k-dependencies로 여러 라이브러리 같이 쓰기`
  - File: `src/content/docs/ko/blog/bluetape4k-dependencies-usage-guide.mdx`
  - Route: `/ko/blog/bluetape4k-dependencies-usage-guide/`

This guide must not become an internal catalog/governance article. Ordinary
application developers do not need to know catalog internals. They need to know:

1. Import `io.github.bluetape4k:bluetape4k-dependencies`.
2. Omit versions on bluetape4k module dependencies.
3. Upgrade by changing the BOM version first.
4. Treat per-module version overrides as documented exceptions.

### Series B: `dependencies 1.2.0 -> 1.3.0` library-facing changes

Purpose: use `bluetape4k-dependencies 1.3.0` as the curated entrypoint for the
library releases it pulls together. The article must explain new features,
bug fixes, and design decisions from `projects`, `exposed`, `aws`, `image`,
`text`, `graph`, `leader`, and `javers`. Do not make the article mainly about
the internal structure of `bluetape4k-dependencies`.

Audience: bluetape4k library users and application developers who want to know
what changed in the libraries pulled together by the BOM.

Posts:

1. `bluetape4k-dependencies 1.3.0: 새 기능도 넣고, 똥도 치우고`
2. `bluetape4k-dependencies 1.3.0으로 서비스 조합하기`
   - Reader problem: "I imported the BOM. Which modules should I choose for a
     realistic Spring Boot or Ktor service?"
   - Core angle: compose Exposed, AWS, Leader, and Text in one service without
     hand-picking module versions.
   - Examples: Spring Boot batch/worker service, Ktor API service, dependency
     snippets, and upgrade checks.
3. `운영에서 티 나는 1.3.0 변화`
   - Reader problem: "Which changes help me notice production problems earlier?"
   - Core angle: Exposed cache health, AWS CloudWatch/Logs, leader metrics and
     backend evidence.
   - Examples: Actuator health payload, CloudWatch metric/log path, leader
     backend/metric checks.
4. `입력 경계에서 치운 똥들`
   - Reader problem: "Where do 1.3.0 changes help protect API and file-input
     boundaries?"
   - Core angle: Image OCR and large-file IO, Text tokenizer/blockword safety,
     safe failure mapping, and practical request limits.
   - Examples: OCR preprocessing pipeline, Okio file reads, tokenizer/blockword
     400/413 handling.

First post details:

- Public title pattern: `bluetape4k-dependencies 1.3.0 활용기 Part N: {소제목}`
- First public title: `bluetape4k-dependencies 1.3.0 활용기 Part 1: 새 기능도 넣고 똥도 치우고`
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

### Series A: ecosystem version and release management journey

Audience: developers who build and maintain multiple related libraries, not
ordinary bluetape4k application users.

Purpose: explain why `bluetape4k-dependencies` exists, how the ecosystem moved
from local version drift to shared governance, and what the 1.3.0 release train
taught about release discipline.

Write this as a three-post series:

1. `bluetape4k-dependencies 제작기 Part 1: 왜 BOM이 필요했나`
   - Reader problem: "I maintain several libraries. Why does version alignment
     stop being a local build-file problem?"
   - Explain repository split, duplicated dependency decisions, drift, and why a
     Spring-style BOM becomes necessary.
   - Use `spring-boot-dependencies` / Spring dependency management as the
     familiar analogy.
   - File: `src/content/docs/ko/blog/bluetape4k-dependencies-making-part1-why-bom.mdx`
   - Route: `/ko/blog/bluetape4k-dependencies-making-part1-why-bom/`
2. `bluetape4k-dependencies 제작기 Part 2: 1.0.0 BOM을 공개 계약으로 만들기`
   - Reader problem: "What does it take to turn a group of libraries into a
     consumable BOM contract?"
   - Explain the first public BOM, Maven Central consumer contract, versionless
     module dependencies, and the limited role of Gradle catalog as an internal
     build/development helper.
   - Do not present catalog internals as something application users must know.
   - File: `src/content/docs/ko/blog/bluetape4k-dependencies-making-part2-public-bom.mdx`
   - Route: `/ko/blog/bluetape4k-dependencies-making-part2-public-bom/`
3. `bluetape4k-dependencies 제작기 Part 3: Maven Central에는 롤백 버튼이 없다`
   - Reader problem: "What went wrong once multiple repositories had to be
     released in order?"
   - Explain missing upstream artifacts, dependency-ordered internal releases,
     dependencies BOM published last, and why operator memory is not a release
     gate.
   - Use "Maven Central에는 롤백 버튼이 없다" for the irreversible-release
     framing. Do not use "후회 버튼".
   - File: `src/content/docs/ko/blog/bluetape4k-dependencies-making-part3-release-train.mdx`
   - Route: `/ko/blog/bluetape4k-dependencies-making-part3-release-train/`

This series may use `1.0.x`, `1.1.x`, `1.2.0`, `1.3.0`, and `1.3.1` as
evidence. It should not be framed as the unique value of `1.3.0`.

## Drafting Rules

- Korean-first.
- Tone: practical, engineer-to-engineer, lightly witty, source-backed.
- Shape: reader problem -> concrete issue -> decision -> example -> caveat.
- Do not flatten this into a release-train operation post or a dependencies
  catalog architecture post; keep Series B about the libraries that the
  dependencies BOM version unlocks.
- Do not let Series A become an application-user guide. Series A is for people
  building and releasing multiple related libraries.
- Use natural Korean without replacing valid technical terms. Avoid English
  sentence structure and awkward imported metaphors. Prefer "롤백 버튼" over
  "후회 버튼" when discussing Maven Central release irreversibility.
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
