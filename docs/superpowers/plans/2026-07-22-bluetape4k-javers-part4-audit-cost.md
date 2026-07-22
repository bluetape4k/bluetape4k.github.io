# Bluetape4k JaVers Part 4 Audit Cost Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a source-backed Korean and English JaVers Part 4 article that explains audit scope, persistence cost, benchmark limits, and commit metadata index decisions, then deliver it through a verified PR for Issue #193.

**Architecture:** Keep the article decision-first: reader problem, source-backed model, bounded benchmark evidence, interpretation limits, and operational selection rules. Treat the current JaVers repository and committed benchmark JSON as authorities, keep the two benchmark families in separate charts, and preserve bilingual article and series-navigation parity.

**Tech Stack:** Astro/Starlight MDX, Kotlin/JaVers/Exposed source links, committed JSON benchmark artifacts, SVG, CairoSVG PNG rendering, Node.js/npm, GitHub CLI.

---

## File Map

### Create

- `src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx`: Korean primary article.
- `src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx`: Natural English localization.
- `public/assets/bluetape4k-javers-part4-hero.png`: 1672×941 series-matched hero.
- `public/assets/bluetape4k-javers-part4-audit-cost-map-01.svg`: Dark architecture/flow source.
- `public/assets/bluetape4k-javers-part4-audit-cost-map-01.png`: CairoSVG-rendered architecture/flow raster.
- `public/assets/bluetape4k-javers-part4-path-cost-01.svg`: Dark `ms/op` chart source.
- `public/assets/bluetape4k-javers-part4-path-cost-01.png`: CairoSVG-rendered `ms/op` chart raster.
- `public/assets/bluetape4k-javers-part4-metadata-index-01.svg`: Dark `ops/s` chart source.
- `public/assets/bluetape4k-javers-part4-metadata-index-01.png`: CairoSVG-rendered `ops/s` chart raster.

### Modify

- `src/content/docs/ko/blog/bluetape4k-javers-part1-audit-diff-overview.mdx`: Add Korean Part 4 series link.
- `src/content/docs/ko/blog/bluetape4k-javers-part2-persistence-options.mdx`: Add Korean Part 4 series link.
- `src/content/docs/ko/blog/bluetape4k-javers-part3-ddd-workshop-example.mdx`: Add Korean Part 4 series link and replace the stale initial benchmark framing only where Part 4 navigation requires a current caveat.
- `src/content/docs/blog/bluetape4k-javers-part1-audit-diff-overview.mdx`: Add English Part 4 series link.
- `src/content/docs/blog/bluetape4k-javers-part2-persistence-options.mdx`: Add English Part 4 series link.
- `src/content/docs/blog/bluetape4k-javers-part3-ddd-workshop-example.mdx`: Add English Part 4 series link and align the current-evidence caveat with Korean.

### Evidence Sources — Read Only

- `/Users/debop/work/bluetape4k/bluetape4k-javers/benchmark/javers-exposed-benchmark/README.ko.md`
- `/Users/debop/work/bluetape4k/bluetape4k-javers/benchmark/javers-exposed-benchmark/build.gradle.kts`
- `/Users/debop/work/bluetape4k/bluetape4k-javers/benchmark/javers-exposed-benchmark/src/main/kotlin/io/bluetape4k/javers/benchmark/exposed/EnversComparisonBenchmark.kt`
- `/Users/debop/work/bluetape4k/bluetape4k-javers/benchmark/javers-exposed-benchmark/src/main/kotlin/io/bluetape4k/javers/benchmark/exposed/ExposedCommitMetadataIndexBenchmark.kt`
- `/Users/debop/work/bluetape4k/bluetape4k-javers/javers-exposed/src/main/kotlin/io/bluetape4k/javers/persistence/exposed/repository/ExposedCdoSnapshotRepository.kt`
- `/Users/debop/work/bluetape4k/bluetape4k-javers/javers-exposed/src/main/kotlin/io/bluetape4k/javers/persistence/exposed/schema/JaversExposedTables.kt`
- `/Users/debop/work/bluetape4k/bluetape4k-javers/javers-ddd/src/main/kotlin/io/bluetape4k/javers/ddd/AggregateRepository.kt`
- `/Users/debop/work/bluetape4k/bluetape4k-javers/docs/benchmark/2026-06-08-javers-exposed-ddd-envers-comparison.json`
- `/Users/debop/work/bluetape4k/bluetape4k-javers/docs/benchmark/2026-06-08-javers-exposed-commit-metadata-indexes.json`

## Task 1: Lock the Benchmark Evidence Ledger

- [ ] **Step 1: Extract the comparison matrix from the committed artifact**

Run:

```bash
jq -r '.implementations[] as $impl | $impl.results[] | [$impl.name, .scenario, .millisPerOperation] | @tsv' \
  /Users/debop/work/bluetape4k/bluetape4k-javers/docs/benchmark/2026-06-08-javers-exposed-ddd-envers-comparison.json
```

Expected rows include:

```text
Hibernate Envers	insert	4.485782275
JaVers in-memory	insert	0.51002605
JaVers + Exposed repository	audit-query	0.763257275
JaVers + Exposed DDD path	audit-query	0.7044510500000001
```

- [ ] **Step 2: Extract the metadata-index matrix from the committed artifact**

Run:

```bash
jq -r '.[] | [.benchmark | split(".")[-1], .params.variantName, .primaryMetric.score, .primaryMetric.scoreUnit] | @tsv' \
  /Users/debop/work/bluetape4k/bluetape4k-javers/docs/benchmark/2026-06-08-javers-exposed-commit-metadata-indexes.json
```

Expected baseline values are `481.4067 ops/s` for insert, `917.5468 ops/s` for author query, and `916.5247 ops/s` for date-range query.

- [ ] **Step 3: Verify units, environment, and iteration counts**

Run:

```bash
jq '{metric,direction,warmupIterations,measuredIterations,environment}' \
  /Users/debop/work/bluetape4k/bluetape4k-javers/docs/benchmark/2026-06-08-javers-exposed-ddd-envers-comparison.json
jq '.[0] | {jdkVersion,warmupIterations,measurementIterations,scoreUnit:.primaryMetric.scoreUnit}' \
  /Users/debop/work/bluetape4k/bluetape4k-javers/docs/benchmark/2026-06-08-javers-exposed-commit-metadata-indexes.json
```

Expected: comparison is `milliseconds per operation`, lower is better, warmup 5 and measured 40; metadata index is `ops/s`, warmup 1 and measurement 1.

## Task 2: Draft the Korean Part 4 Article

- [ ] **Step 1: Create frontmatter and opening**

Create `src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx` with:

```mdx
---
title: "Bluetape4k JaVers Part 4: 감사 로그는 공짜가 아니다"
description: JaVers와 Exposed로 감사 이력을 저장할 때 생기는 쓰기·조회 비용을 벤치마크로 읽고, 감사 범위와 commit metadata 인덱스를 선택하는 기준을 정리한다.
sidebar:
  order: -202607221700
blog:
  date: 2026-07-22T17:00:00+09:00
  image: /assets/bluetape4k-javers-part4-hero.png
  imageAlt: 작은 로봇 작업자들이 JaVers commit과 snapshot 보관함을 분류하며 비용 계기판을 확인하는 3D 작업대 일러스트
  cardDescription: "감사 범위, snapshot 저장 비용, commit metadata 인덱스를 커밋된 benchmark 근거로 판단한다."
---
```

The opening must lead with a realistic failure: audit is enabled broadly, write volume and history tables grow, and the team later adds indexes without a reproduced query bottleneck.

- [ ] **Step 2: Write the source-model sections**

Use these exact section responsibilities:

```text
## 모든 변경을 남기는 순간 비용 모델이 바뀐다
## 한 번의 변경에서 무엇이 저장되는가
## 비교 전에 측정 경로부터 나눈다
```

The second section embeds `/assets/bluetape4k-javers-part4-audit-cost-map-01.png`. Explain source-of-truth row, JaVers commit metadata, snapshot, domain event, and read model as distinct responsibilities.

- [ ] **Step 3: Write the bounded comparison section**

Use:

```text
## 숫자보다 먼저 benchmark가 포함한 일을 본다
```

Embed `/assets/bluetape4k-javers-part4-path-cost-01.png`. Include a compact table with four paths and three scenarios. State explicitly that the values are committed PostgreSQL documentation evidence, not production capacity, p95, or p99.

- [ ] **Step 4: Write the index-decision section**

Use:

```text
## 조회가 느리다고 인덱스부터 추가하지 않는다
```

Embed `/assets/bluetape4k-javers-part4-metadata-index-01.png`. Show baseline, author, `commit_date`, and both variants. State that one warmup and one measured iteration cannot justify default DDL changes.

- [ ] **Step 5: Write the selection and closing sections**

Use:

```text
## 감사 범위를 결정하는 세 가지 선택지
## 운영에 넣기 전에 확인할 것
## 자료
## 마무리
## 시리즈 링크
```

The selection table compares whole-aggregate audit, selected-aggregate audit, and domain-event separation. The resources list links only the benchmark README, two benchmark sources, Exposed repository, AggregateRepository, and two raw JSON artifacts.

- [ ] **Step 6: Update Korean Part 1–3 navigation**

Append this exact item to each Korean series link block:

```md
- [Part 4: 감사 로그는 공짜가 아니다](/ko/blog/bluetape4k-javers-part4-audit-cost/)
```

- [ ] **Step 7: Verify the Korean source shape**

Run:

```bash
rg -n '^## |bluetape4k-javers-part4|481\.4|917\.5|916\.5|측정 1회|production|p95|p99' \
  src/content/docs/ko/blog/bluetape4k-javers-part{1,2,3,4}-*.mdx
```

Expected: Part 4 contains all required sections, three technical asset references, the bounded-evidence language, and Part 1–3 each link to Part 4.

## Task 3: Create the Series-Matched Hero

- [ ] **Step 1: Inspect the Part 1–3 hero contact sheet**

Use the image inspection surface on:

```text
public/assets/bluetape4k-javers-part1-hero.png
public/assets/bluetape4k-javers-part2-hero.png
public/assets/bluetape4k-javers-part3-hero.png
```

Record the shared visual language: 1672×941, bright studio lighting, white/blue robot workers, miniature workbench, technical props, and no diagram text.

- [ ] **Step 2: Generate the Part 4 hero**

Generate one raster scene with this content contract:

```text
A polished 16:9 3D miniature workbench matching the existing Bluetape4k JaVers series. Small white and cobalt-blue robotic engineers sort audit records into COMMIT, SNAPSHOT, and METADATA storage drawers while checking a subtle cost meter. Bright clean studio lighting, premium toy-diorama materials, shallow depth of field, no human characters, no flat infographic, no large readable text, no logos.
```

- [ ] **Step 3: Normalize and inspect the hero**

Run:

```bash
sips -z 941 1672 public/assets/bluetape4k-javers-part4-hero.png --out public/assets/bluetape4k-javers-part4-hero.png
sips -g pixelWidth -g pixelHeight public/assets/bluetape4k-javers-part4-hero.png
```

Expected: `pixelWidth: 1672`, `pixelHeight: 941`. Inspect it next to Parts 1–3 and reject a flat diagram, human worker, dark scene, or unreadable clutter.

## Task 4: Create the Audit Cost Map

- [ ] **Step 1: Load diagram rules**

Read `bluetape-diagram/references/common.md` and `bluetape-diagram/references/architecture.md`. Record this asset as an architecture/flow diagram whose reader question is “Where do responsibilities and costs split after one aggregate change?”

- [ ] **Step 2: Create the SVG**

Build a dark 1600×980 SVG with cards for `Command`, `Aggregate`, `Source Table`, `JaVers Commit`, `Commit Metadata`, `Snapshot`, `Domain Event`, `Read Model`, and `Audit Query`. Use primary 14×14 arrowheads, orthogonal rounded connectors, no connector/card crossings, and explicit labels `current state`, `audit write`, `history read`, and `projection`.

- [ ] **Step 3: Parse, normalize, and render**

Run:

```bash
xmllint --noout public/assets/bluetape4k-javers-part4-audit-cost-map-01.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py \
  public/assets/bluetape4k-javers-part4-audit-cost-map-01.svg
cairosvg public/assets/bluetape4k-javers-part4-audit-cost-map-01.svg \
  -o public/assets/bluetape4k-javers-part4-audit-cost-map-01.png -s 2
```

Expected: XML parses, text hazards are zero, and PNG is 3200×1960.

- [ ] **Step 4: Audit and inspect**

Run every connector/endpoint/card-intrusion audit required by the loaded references. Inspect the full-size PNG and verify arrowheads, rounded corners, label clearance, branch direction, card spacing, and absence of line overlap.

## Task 5: Create the Two Benchmark Charts

- [ ] **Step 1: Load chart rules**

Read `bluetape-diagram/references/common.md` and `bluetape-diagram/references/chart.md`. Treat the two charts as separate assets with separate units and decision questions.

- [ ] **Step 2: Create the path-cost SVG**

Create a dark 1600×1040 grouped horizontal bar chart from `2026-06-08-javers-exposed-ddd-envers-comparison.json`. Label the unit `ms/op · lower is better`, include insert/update/audit-query, and place the environment and “bounded PostgreSQL documentation benchmark” caveat inside the footer.

- [ ] **Step 3: Render and inspect the path-cost PNG**

Run XML parse, text normalization, chart audit, and:

```bash
cairosvg public/assets/bluetape4k-javers-part4-path-cost-01.svg \
  -o public/assets/bluetape4k-javers-part4-path-cost-01.png -s 2
```

Expected: PNG is 3200×2080, value labels match the committed JSON, and small `0.510`–`12.559` values remain legible without implying identical work per path.

- [ ] **Step 4: Create the metadata-index SVG**

Create a dark 1600×1040 grouped bar chart from `2026-06-08-javers-exposed-commit-metadata-indexes.json`. Label the unit `ops/s · higher is better`, show insert/author query/date-range query, and include `1 warmup × 1 measurement · smoke evidence only` in the chart footer.

- [ ] **Step 5: Render and inspect the metadata-index PNG**

Run XML parse, text normalization, chart audit, and:

```bash
cairosvg public/assets/bluetape4k-javers-part4-metadata-index-01.svg \
  -o public/assets/bluetape4k-javers-part4-metadata-index-01.png -s 2
```

Expected: PNG is 3200×2080; baseline `481.4/917.5/916.5` and both-index `518.6/945.9/873.8` values match the committed JSON.

## Task 6: Review and Commit the Korean Article and Visuals

- [ ] **Step 1: Run the Korean naturalness checklist**

Read `bluetape-writer/references/korean-naturalness-checklist.md`. Remove translated sentence order, noun-heavy prose, repeated conclusions, and generic promotional claims without changing identifiers, numbers, units, URLs, or user-approved wording.

- [ ] **Step 2: Verify content and visual hygiene**

Run:

```bash
git diff --check
rg -n '최고|압도적|무조건 빠르|항상 빠르' \
  src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx \
  public/assets/bluetape4k-javers-part4-*.svg || true
```

Expected: no whitespace errors, placeholders, or unsupported performance superlatives.

- [ ] **Step 3: Commit the Korean and visual slice**

Stage only the Korean Part 1–4 files and Part 4 assets. Commit with a Lore message whose intent is to make audit cost decisions source-backed; record the two unlike benchmark units as a constraint and the visual/build checks completed so far.

## Task 7: Localize English and Restore Locale Parity

- [ ] **Step 1: Create the English article**

Create `src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx` with the same section order, tables, values, source URLs, image paths, and limitations. Use natural English headings rather than literal Korean syntax.

- [ ] **Step 2: Update English Part 1–3 navigation**

Append:

```md
- [Part 4: Audit Logs Are Not Free](/blog/bluetape4k-javers-part4-audit-cost/)
```

to the English Part 1–3 series blocks.

- [ ] **Step 3: Verify locale parity**

Compare both MDX files for heading count, figure count, code-block count, table count, asset references, benchmark values, URLs, and Part 1–4 navigation. Expected: counts and factual sets match even where prose is localized naturally.

- [ ] **Step 4: Commit locale parity**

Stage only the English Part 1–4 files and any Korean correction required for factual parity. Commit with a Lore message whose intent is to make the evidence available in both locales; record that sentence-level wording may differ but identifiers, numbers, links, and assets must match.

## Task 8: Build and Verify Local Routes

- [ ] **Step 1: Run final source checks**

Run:

```bash
git diff --check
npm run build
```

Expected: Astro check reports 0 errors, 0 warnings, and 0 hints; the build completes and includes both Part 4 routes.

- [ ] **Step 2: Start local Astro and probe routes**

Run the dev server on an available loopback port, then probe:

```text
/ko/blog/bluetape4k-javers-part4-audit-cost/
/blog/bluetape4k-javers-part4-audit-cost/
```

Expected: HTTP 200 and rendered HTML contains the locale title, all three technical PNGs, and Part 1–4 navigation.

- [ ] **Step 3: Verify every new asset**

Probe the hero and six SVG/PNG technical asset URLs. Expected: HTTP 200, correct MIME types, and the lightbox recognizes only the three technical PNGs, not the hero.

- [ ] **Step 4: Run final review**

Inspect the complete branch diff. Required verdict: P0=0, P1=0, no unsupported numeric claim, no stale series edge, no broken source URL, and no diagram/checklist gap.

- [ ] **Step 5: Commit final evidence repairs**

If verification required changes, commit only those repairs with a Lore message that states the repaired invariant and exact rerun evidence. If no tracked file changed, record this step as N/A with clean status evidence.

## Task 9: Push and Create the Issue #193 PR

- [ ] **Step 1: Verify exact PR authority and metadata**

Confirm repository `bluetape4k/bluetape4k.github.io`, base `develop`, head `docs/issue-193-javers-audit-cost`, Issue #193 assignee `debop`, labels `documentation` and `enhancement`, and no milestone.

- [ ] **Step 2: Push the exact head**

Push without force and verify local SHA equals `origin/docs/issue-193-javers-audit-cost`.

- [ ] **Step 3: Create and verify the PR**

Create an English PR referencing `Closes #193`, assign `debop`, copy labels, and end the body with `## DoD Status`. Query the live PR body and metadata; the final Markdown `##` heading must be exactly `## DoD Status`.

- [ ] **Step 4: Wait for exact-head CI and current review**

Verify required checks succeed on the PR head. Re-read reviews, comments, and review threads after CI is green. Repair and repush any in-scope failure, then re-run affected local proof.

- [ ] **Step 5: Report merge-ready without merging**

Report PR URL, exact head SHA, CI conclusion, review/thread state, diagram evidence, build/routes/parity evidence, and checklist totals. Leave merge, branch deletion, and deployment pending outside this plan.
