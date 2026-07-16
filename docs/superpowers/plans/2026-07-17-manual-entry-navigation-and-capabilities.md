# Manual Entry Navigation and Capabilities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let readers expand any repository manual tree immediately and understand every repository's core capabilities from its Home page.

**Architecture:** The website navigation model derives a complete tree for every repository from the validated latest/selected catalogs, while only the current repository starts expanded. Canonical Home content is edited in each source repository, committed there, and then imported through the existing versioned manual publisher so the website remains a validated snapshot rather than a second source of truth.

**Tech Stack:** Astro 6, Starlight 0.39, Node.js ESM and `node:test`, Markdown, Ruby manual validators, existing manual publication catalogs.

---

### Task 1: Lock the repository-tree behavior and label with tests

**Files:**
- Modify: `tests/manual/navigation.test.mjs`
- Modify: `tests/manual/repositories.test.mjs`

- [ ] Add a navigation assertion that every repository group contains its complete catalog-derived tree, including `getting-started` and nested sections, even when that repository is not current.
- [ ] Preserve assertions that only the current repository is initially expanded and that archived current routes use archived membership.
- [ ] Change the Projects fixture label expectation to `Bluetape4k docs` / `Bluetape4k 문서`.
- [ ] Run `node --test tests/manual/navigation.test.mjs tests/manual/repositories.test.mjs` and confirm the new complete-tree test fails before implementation.

### Task 2: Generate complete trees for non-current repositories

**Files:**
- Modify: `scripts/manual/lib/navigation.mjs`
- Modify: `src/data/manual/repositories.json`
- Modify: `astro.config.mjs`
- Modify: `src/content/docs/ecosystem/version-governance.mdx`
- Modify: `src/content/docs/ko/ecosystem/version-governance.mdx`

- [ ] Replace the current-repository-only tree helper with one repository tree builder that receives `currentId` only for the active repository.
- [ ] Generate all non-current repository entries from their latest catalogs instead of emitting only Manual Home.
- [ ] Keep non-current repository groups collapsed and nested sections collapsed.
- [ ] Rename all current user-facing Projects manual/navigation labels to `Bluetape4k docs` / `Bluetape4k 문서`, while leaving routes and repository identifiers unchanged.
- [ ] Run the focused tests and require all assertions to pass.

### Task 3: Add the shared Home capability contract to canonical manuals

**Files:**
- Modify in each of `bluetape4k-projects`, `bluetape4k-exposed`, `bluetape4k-aws`, `bluetape4k-leader`, `bluetape4k-image`, `bluetape4k-graph`, `bluetape4k-javers`, and `bluetape4k-text`:
  - `docs/manual/en/index.md`
  - `docs/manual/ko/index.md`

- [ ] Add `Core capabilities` / `핵심 기능` directly after the opening explanation and before version/setup detail.
- [ ] Give every capability a concrete link to an existing guide, architecture page, module page, or example.
- [ ] Preserve each repository's pinned release claims, responsibility boundary, source links, and existing diagrams.
- [ ] Compare English and Korean capability sets for exact conceptual parity, then edit Korean sentences for native technical flow.
- [ ] Run `git diff --check` and each repository's existing lightweight Ruby manual validation/export checks; do not run Gradle/JVM module tests for these Markdown-only diffs.
- [ ] Commit each repository independently with the Lore commit protocol so the website can pin an exact source commit.

### Task 4: Publish the canonical Home changes into the website snapshots

**Files:**
- Regenerate the existing website snapshot/catalog/digest files for all eight repositories with `node scripts/manual/sync-manual.mjs --refresh <release> --repository <slug> --source <worktree>`.

- [ ] Refresh repositories sequentially from their committed source worktrees to preserve publication isolation.
- [ ] Verify each refresh reports the expected repository, release, source commit, document count, and no cross-repository mutation.
- [ ] Run `npm run check:manual` and require all eight repositories to validate.

### Task 5: Complete site and content verification

**Files:**
- Review all changed files across the nine repositories.

- [ ] Run `git diff --check` in every repository.
- [ ] Run `node --test tests/manual/navigation.test.mjs tests/manual/repositories.test.mjs`.
- [ ] Run `npm test` and require the full manual/ecosystem test suite to pass.
- [ ] Run `npm run build` and verify representative English/Korean Projects and Leader manual routes are generated.
- [ ] Search generated HTML to prove `Bluetape4k 문서`, Leader `매뉴얼 홈`, `시작하기`, and its section groups are present on a non-Leader manual page.
- [ ] Review final diffs for production-code exclusion, locale parity, stale `Projects docs` labels, invalid links, and P0/P1 findings.
- [ ] Commit the website change with the Lore commit protocol and report source commits, snapshot source commits, validation results, and any PR/merge boundary still pending.

