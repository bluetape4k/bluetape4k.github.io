# Kotlin Ecosystem Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat Build/Learn/Apply card grid with a relation-aware Kotlin/JVM journey map and move Go, Rust, and Python into a separate Other languages rail.

**Architecture:** Keep the checked-in JSON catalog as the source of truth, but add an explicit `ecosystem` boundary and stable domain groups. Render the Kotlin nodes as three semantic lanes with relation paths derived from `relations`; render non-Kotlin nodes in a separate navigation landmark. Use CSS for the visual map and a small progressive-enhancement script for focus/hover relation highlighting, while preserving an accessible nested-list fallback.

**Tech Stack:** Astro 5, Starlight, JSON catalog, semantic HTML, CSS custom properties, vanilla browser JavaScript, Node test runner.

---

## File structure

- Modify `src/data/ecosystem/catalog.json`: declare `ecosystem` and normalized domain groups for every node.
- Modify `src/data/ecosystem/schema.mjs`: validate ecosystem boundaries, layer rules, and relation targets.
- Modify `src/components/EcosystemAtlas.astro`: render Kotlin lanes, relation paths, detail panel, and Other languages rail.
- Modify `src/styles/atlas.css`: provide the map grid, route lines, node states, responsive fallback, and accessibility states.
- Modify `tests/ecosystem/catalog.test.mjs`: lock Kotlin and other-language catalog separation.
- Modify `tests/ecosystem/atlas.test.mjs`: lock semantic lanes, relation hooks, and progressive-enhancement behavior.
- Modify `src/content/docs/ecosystem/atlas.mdx` and `src/content/docs/ko/ecosystem/atlas.mdx`: describe the new map and language boundary.

### Task 1: Catalog ecosystem boundaries

**Files:**
- Modify: `src/data/ecosystem/catalog.json`
- Modify: `src/data/ecosystem/schema.mjs`
- Test: `tests/ecosystem/catalog.test.mjs`

- [ ] **Step 1: Write failing catalog tests**

Add assertions that every node has `ecosystem`, that Kotlin nodes use `kotlin`, and that `bluetape-go`, `bluetape-rs`, `bluetape-py`, `bluetape-go-workshop`, and `bluetape-rs-workshop` use `go`, `rust`, or `python`. Assert that non-Kotlin nodes cannot use `apply` and cannot relate to Kotlin nodes.

- [ ] **Step 2: Run the catalog test and verify RED**

Run: `node --test tests/ecosystem/catalog.test.mjs`

Expected: FAIL because `ecosystem` is missing from the existing catalog.

- [ ] **Step 3: Implement the catalog boundary**

Add `ecosystem: "kotlin" | "go" | "rust" | "python"` to each node. Normalize Kotlin groups to `Foundation`, `Data`, `Infrastructure`, `Observability`, `Learning`, and `Applications`; keep Go/Rust/Python groups language-specific. Extend `validateCatalogNode()` and catalog-wide validation to reject unsupported ecosystems and cross-ecosystem relations.

- [ ] **Step 4: Run the catalog tests and verify GREEN**

Run: `node --test tests/ecosystem/catalog.test.mjs`

Expected: all catalog tests pass.

- [ ] **Step 5: Commit**

Commit the catalog, schema, and test changes with a Lore-formatted message explaining the Kotlin boundary.

### Task 2: Semantic staged map and relations

**Files:**
- Modify: `src/components/EcosystemAtlas.astro`
- Test: `tests/ecosystem/atlas.test.mjs`

- [ ] **Step 1: Write failing component tests**

Assert that the rendered source contains a Kotlin map landmark, three lane elements for Build/Learn/Apply, relation hooks (`data-node-id`, `data-relations`, `data-route-from`, `data-route-to`), a live detail panel, and a separate Other languages landmark containing Go/Rust/Python labels.

- [ ] **Step 2: Run the atlas test and verify RED**

Run: `node --test tests/ecosystem/atlas.test.mjs`

Expected: FAIL because the current component only renders three card columns and filters.

- [ ] **Step 3: Implement the staged map**

Partition catalog nodes by `ecosystem`. Render Kotlin Build/Learn/Apply lanes in a single map surface, group nodes within each lane, derive unique relation pairs from Kotlin nodes, and emit decorative route elements keyed by source and target. Add localized map legend, stage copy, and a detail panel that defaults to the Kotlin ecosystem summary. Render Go, Rust, and Python as independent language tracks below the Kotlin map.

- [ ] **Step 4: Add progressive relation highlighting**

Replace the hide/show filter script with focus, pointer, and click handlers that set `data-active-node`, mark related nodes/routes with `data-active`, dim unrelated nodes, and update the localized detail panel. Ensure Escape clears a selection and pointer leave does not clear a keyboard/click selection.

- [ ] **Step 5: Run the atlas test and verify GREEN**

Run: `node --test tests/ecosystem/atlas.test.mjs`

Expected: all atlas component tests pass.

- [ ] **Step 6: Commit**

Commit the component and tests with a Lore-formatted message describing the staged journey interaction.

### Task 3: Visual map system and responsive fallback

**Files:**
- Modify: `src/styles/atlas.css`
- Test: `tests/ecosystem/atlas.test.mjs`

- [ ] **Step 1: Write failing style assertions**

Assert that styles define the three-lane grid, a route layer, active/dimmed node states, a distinct Other languages rail, keyboard focus, high-contrast treatment, reduced motion, and a mobile breakpoint that hides decorative routes and stacks lanes.

- [ ] **Step 2: Run the atlas test and verify RED**

Run: `node --test tests/ecosystem/atlas.test.mjs`

Expected: FAIL because the existing stylesheet defines only a generic three-column card grid.

- [ ] **Step 3: Implement the visual system**

Use CSS grid and custom properties to create a dark technical map with a subtle coordinate grid, stage headers, compact location-like nodes, directional lane connectors, and a visually recessed Other languages rail. Use relation route elements as CSS-drawn horizontal/diagonal paths without authored SVG. Add clear active, related, selected, and dimmed states.

- [ ] **Step 4: Implement responsive and accessibility states**

At the mobile breakpoint, stack the stages, hide decorative route geometry, keep the semantic lists, and preserve node descriptions. Disable transforms under reduced motion and strengthen borders under increased contrast.

- [ ] **Step 5: Run the atlas and catalog tests and verify GREEN**

Run: `node --test tests/ecosystem/*.test.mjs`

Expected: all ecosystem tests pass.

- [ ] **Step 6: Commit**

Commit the stylesheet and test updates with a Lore-formatted message describing the visual hierarchy.

### Task 4: Page copy, integration, and browser verification

**Files:**
- Modify: `src/content/docs/ecosystem/atlas.mdx`
- Modify: `src/content/docs/ko/ecosystem/atlas.mdx`
- Verify: `src/content/docs/index.mdx`
- Verify: `src/content/docs/ko/index.mdx`

- [ ] **Step 1: Write failing page-copy assertions**

Extend the atlas test to require Kotlin/JVM scope text and Other languages explanation in both locale pages.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/ecosystem/atlas.test.mjs`

Expected: FAIL because the current pages describe all repositories as one ecosystem.

- [ ] **Step 3: Update both locale pages**

Explain that the primary map is Kotlin/JVM, that the main journey is Build → Learn → Apply, and that Go/Rust/Python are sibling language ecosystems displayed separately.

- [ ] **Step 4: Run complete automated verification**

Run: `BLUETAPE4K_PROJECTS_SOURCE=/Users/debop/work/bluetape4k/bluetape4k-projects/.worktrees/feature-all-module-manuals npm test`

Run: `npm run check:manual`

Run: `npm run build`

Expected: tests pass, the snapshot reports 90 modules and 186 localized files, and Astro completes the static build.

- [ ] **Step 5: Verify in the browser**

Keep the dev server running at `http://127.0.0.1:4321/`. Verify `/ecosystem/atlas/` and `/ko/ecosystem/atlas/` at desktop and mobile widths. Confirm one relation path highlights by pointer and keyboard, Other languages is visually separate, the mobile layout remains readable, and the console has no errors.

- [ ] **Step 6: Commit**

Commit locale copy and any final integration fixes with a Lore-formatted message recording automated and browser verification.

### Task 5: Final review and branch completion

**Files:**
- Review all changes since `98c964e`.

- [ ] **Step 1: Run spec compliance review**

Confirm the implementation satisfies the approved top-level B flow, deeper A/C structure, and Other languages separation without adding a force-directed graph or new dependency.

- [ ] **Step 2: Run code quality review**

Check semantic HTML, catalog validation, script cleanup, CSS maintainability, localization parity, and test specificity. Resolve every important finding and re-run affected tests.

- [ ] **Step 3: Verify clean completion**

Run: `git diff --check && ~/.local/bin/repo-status`

Expected: no whitespace errors and a clean feature worktree after commits.
