# JaVers Part 4 DB Write-Path Explanation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Explain the database-backed JaVers write path with pseudocode and operational cost conditions while preserving the benchmark's bounded interpretation.

**Architecture:** Insert one focused explanation section after the comparison table in each locale. It compares the work done by the Hibernate Envers and JaVers + Exposed repository paths, then lists the factors that increase the JaVers write cost. The DDD path remains explicitly separate because it also persists source-of-truth aggregate state.

**Tech Stack:** Astro MDX, Markdown tables and fenced text pseudocode, current `bluetape4k-javers` source links, npm site build.

---

### Task 1: Add the Korean write-path explanation

**Files:**
- Modify: `src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx` after the benchmark table ending at line 103

- [x] **Step 1: Add a section that preserves the comparison boundary**

Add `## DB에 저장할 때 JaVers 경로가 더 무거워질 수 있는 이유` after the benchmark interpretation. State that both paths audit changes, but the `javers_exposed_repository` scenario stores JaVers commits and snapshots only; it does not persist the source-of-truth order table.

- [x] **Step 2: Add aligned Envers and JaVers pseudocode**

Add two fenced `text` blocks that describe the exact observed operations:

```text
Hibernate Envers

begin transaction
  persist current entity row
  flush detects the change
  write revision and entity audit rows
commit transaction
```

```text
JaVers + Exposed repository

build JaVers commit from the aggregate
encode the full snapshot state

begin transaction
  check whether commit metadata exists
  insert commit metadata when it is absent
  insert snapshot row with state and changed properties
commit transaction
```

- [x] **Step 3: Explain the observable extra work and DDD exclusion**

Explain that `ExposedCdoSnapshotRepository.saveSnapshot()` encodes the full snapshot, checks commit metadata, and writes metadata plus snapshot rows. State that serialization, metadata lookup, payload size, and JDBC/SQL work can add latency. State that source-table persistence belongs to the separate DDD benchmark path, so it must not be attributed to the repository-only value.

- [x] **Step 4: Add the operational cost-condition table**

Add this reader-facing table after the pseudocode explanation:

| 비용이 커지는 조건 | DB 쓰기 경로에서 늘어나는 일 |
|---|---|
| aggregate 상태가 큼 | 전체 snapshot의 직렬화와 text payload가 커짐 |
| 변경이 잦음 | commit·snapshot 행과 index 갱신이 빠르게 누적됨 |
| commit metadata가 많음 | metadata payload와 조회·인덱스 판단 범위가 넓어짐 |
| 동기 감사 경계를 유지함 | 업무 저장 요청이 audit write 완료를 함께 기다림 |

- [x] **Step 5: Verify Korean source links and Markdown**

Run: `git diff --check` and `rg -n "DB에 저장할 때 JaVers 경로|ExposedCdoSnapshotRepository.saveSnapshot|DDD benchmark" src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx`

Expected: no whitespace errors; the section identifies the repository-only and DDD boundaries.

### Task 2: Localize the same explanation in English

**Files:**
- Modify: `src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx` after the matching comparison table

- [x] **Step 1: Add an equivalent English section**

Add `## Why the JaVers path can cost more when it writes to the database`. Preserve the same comparison boundary and avoid translating Korean sentence structure literally.

- [x] **Step 2: Localize the two pseudocode blocks and cost-condition table**

Use the same operation order, with English headings and this table:

| Cost-increasing condition | Extra work on the database write path |
|---|---|
| Larger aggregate state | More full-snapshot serialization and text payload |
| Frequent changes | Commit and snapshot rows, plus index maintenance, accumulate faster |
| Richer commit metadata | The metadata payload and index/query considerations widen |
| Synchronous audit boundary | The business write waits for the audit write to finish |

- [x] **Step 3: Verify locale parity**

Run a bounded comparison of the Korean and English headings, pseudocode operation order, four cost conditions, and `ExposedCdoSnapshotRepository.saveSnapshot()` / DDD-path caveat.

Expected: both routes make the same technical claims without introducing a library ranking.

### Task 3: Build, inspect, and update the existing PR

**Files:**
- Modify: `docs/superpowers/plans/2026-07-22-javers-part4-db-write-path-explanation.md` by marking completed steps
- Modify: existing pull request #252 body only if its DoD evidence changes

- [x] **Step 1: Run article validation**

Run: `git diff --check`, `npm run build`, and `npm test` from the site worktree.

Expected: no diff whitespace errors, no Astro diagnostics, and all tests pass.

- [x] **Step 2: Check the two rendered routes**

Run the local preview and request both `/ko/blog/bluetape4k-javers-part4-audit-cost/` and `/blog/bluetape4k-javers-part4-audit-cost/`.

Expected: HTTP 200 responses, localized titles, and readable fenced pseudocode in both articles.

- [x] **Step 3: Commit and publish the article update**

Commit the two article files and this plan using the Lore commit protocol, push `docs/issue-193-javers-audit-cost`, and verify PR #252 points at the exact pushed head.

- [x] **Step 4: Refresh PR evidence**

Verify PR #252's assignee, labels, base/head, final `## DoD Status` heading, CI status, and current review state. Do not merge or deploy.

## Plan Self-Review

- Spec coverage: Tasks 1 and 2 cover the requested pseudocode and cost-condition table; Task 3 covers bilingual rendering and PR delivery.
- Placeholder scan: No open implementation placeholders remain; all paths, prose insertion points, commands, and expected results are explicit.
- Consistency: The plan keeps `javers_exposed_repository` separate from `javers_exposed_ddd` in every task and uses the same four operational conditions in both locales.
