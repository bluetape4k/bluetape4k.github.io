# Blog Social Preview Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use each blog post's existing Hero image and alt text in SNS link previews while retaining the global site image for non-blog pages.

**Architecture:** Add a pure head-metadata transformer under `src/lib/` and call it from the existing Starlight route middleware only when `route.entry.data.blog` exists. Keep the global Starlight head configuration as the fallback and remove its fixed image dimensions only from blog routes whose Hero sizes vary.

**Tech Stack:** Astro 6, Starlight 0.39.2, TypeScript, Node test runner

---

## Workflow checklist

- [x] **WF-01 / CG-01 — Classify and re-read authority**
  - **Action:** Route as Type E maintenance and read workspace/repo `AGENTS.md`, `bluetape-workflow`, `bluetape-maintenance`, `bluetape-writer`, and visual rules.
  - **Evidence:** User approved the recommended existing-Hero approach on 2026-07-15; repository was clean on `develop` before branch creation.
  - **Failure:** Stop before editing if scope expands beyond metadata behavior.
- [x] **CG-02 / E-02 — Query current and historical evidence**
  - **Action:** Inspect current middleware/config/frontmatter, query `bluetape4k-docs` and `bluetape4k-github`, and inspect the pinned Starlight head merge implementation.
  - **Evidence:** Existing plan already calls for social-preview alignment; all blog entries provide `blog.image`; global config currently overrides the image.
  - **Failure:** Stop if per-page metadata cannot be changed without per-post duplication.
- [x] **CG-03 / CG-04 — Protect boundaries**
  - **Action:** Work on `fix/blog-social-preview-hero` from clean `origin/develop`; keep bilingual content unchanged and exclude PR/push/merge.
  - **Evidence:** Scoped files are the design/plan, transformer, middleware, and regression test.
  - **Failure:** Preserve unrelated work and stop on an unexpected dirty path.
- [x] **E-01 / CG-05 — Route support and reuse**
  - **Action:** Reuse the existing route middleware and blog frontmatter; add no dependency and generate no new image.
  - **Evidence:** `src/starlightRouteData.ts`, `src/content.config.ts`, and Starlight's existing `route.head` contract.
  - **Failure:** Reject a new rendering pipeline or duplicated frontmatter.
- [x] **CG-07 — Lock behavior with RED/GREEN**
  - **Action:** Write and run a failing metadata-transformer test before production code, then implement the minimum transformer and middleware call.
  - **Evidence:** RED failed with `ERR_MODULE_NOT_FOUND` for `src/lib/socialPreview.ts`; GREEN passed 2/2 targeted tests.
  - **Failure:** Delete implementation-first code and restart with the failing test.
- [x] **E-05 / CG-08 — Run maintenance verification**
  - **Action:** Run targeted test, `npm test`, `npm run build`, route-level HTML assertions, and `git diff --check` sequentially.
  - **Evidence:** `npm test` passed; `npm run build` reported 0 diagnostics and built 1059 pages; the 134-route audit reported `failures=0`; `git diff --check` passed.
  - **Failure:** Repair and rerun affected checks.
- [x] **CG-09 / E-06 — Lesson and final review**
  - **Action:** Review the final diff for a reusable lesson, P0/P1 defects, duplicate metadata, and scope drift.
  - **Evidence:** Reused the existing ecosystem-atlas social-preview plan and blog Hero separation lesson; the task introduced no novel failure, recovery, design, or operational guidance. Independent review reported P0=0, P1=0, P2=0.
  - **Failure:** Keep completion pending until findings converge.
- [x] **CG-10 — Converge local delivery**
  - **Action:** Commit the verified scoped branch with a Lore-format message.
  - **Evidence:** Lore-format local commit created on `fix/blog-social-preview-hero`; the exact amended head SHA and clean scoped status are verified in the final report.
  - **Failure:** Do not commit failing or unrelated changes.
- [x] **CG-11 through CG-18 / E-07 / E-08 — PR delivery branch (N/A)**
  - **Action:** Record N/A because the approved request names local implementation but no PR, push, CI, review, or merge target.
  - **Evidence:** No external delivery action is performed.
  - **Failure:** Obtain explicit PR scope before publishing any branch.

### Task 1: Lock the metadata transformation

**Files:**
- Create: `tests/ecosystem/social-preview.test.mjs`
- Create: `src/lib/socialPreview.ts`

- [x] **Step 1: Write the failing test**

Test that a blog Hero replaces the global OG/Twitter image and alt tags, adds `twitter:image:alt`, removes fixed OG dimensions, and leaves the input array unchanged.

- [x] **Step 2: Run the test and verify RED**

Run: `node --test tests/ecosystem/social-preview.test.mjs`

Expected: FAIL because `src/lib/socialPreview.ts` does not exist.

- [x] **Step 3: Implement the pure transformer**

Export `withBlogSocialPreview(head, blog, site)` from `src/lib/socialPreview.ts`. Build the absolute image URL with `new URL(blog.image, site)`, replace matching meta entries immutably, add missing alt metadata, and filter `og:image:width` plus `og:image:height`.

- [x] **Step 4: Run the targeted test and verify GREEN**

Run: `node --test tests/ecosystem/social-preview.test.mjs`

Expected: all social-preview tests pass.

### Task 2: Connect Starlight blog routes

**Files:**
- Modify: `src/starlightRouteData.ts`

- [x] **Step 1: Read blog metadata in the existing middleware**

Use the already validated `route.entry.data.blog` object. Do not add per-post `head:` frontmatter.

- [x] **Step 2: Apply the transformer only for blog routes**

Assign the transformed array to `route.head` when `blog` exists; otherwise leave the global fallback untouched.

- [x] **Step 3: Run targeted and full Node tests**

Run: `node --test tests/ecosystem/social-preview.test.mjs`

Run: `npm test`

Expected: both commands exit zero.

### Task 3: Prove generated social metadata

**Files:**
- Verify generated files under: `dist/blog/`, `dist/ko/blog/`, and `dist/index.html`

- [x] **Step 1: Build the production site**

Run: `npm run build`

Expected: Astro check and build exit zero.

- [x] **Step 2: Inspect representative routes**

Assert that the Korean and English Bluetape Skills Part 2 pages use `/assets/bluetape-workflow-guide-hero.png` as an absolute OG/Twitter URL, carry locale-specific alt text, and omit fixed OG dimensions. Assert that `dist/index.html` retains `https://bluetape4k.github.io/og-image.png` with `1200` and `630`.

- [x] **Step 3: Verify all blog Hero assets**

Check every EN/KO blog entry has an existing `blog.image` asset and every built blog route contains that absolute image URL.

- [x] **Step 4: Finish hygiene and review**

Run: `git diff --check`

Run the graph impact check and review the scoped diff. Expected: no P0/P1 finding and no unrelated path.
