# Multi-Repository Manual Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generalize the Projects-only manual pipeline into a registry-backed, repository-isolated publisher and publish the merged `bluetape4k-exposed` 1.11 source manual without changing the existing Projects snapshot or routes.

**Architecture:** A validated repository descriptor is the only authority allowed to cross path, catalog, GitHub release, publication, Astro schema, and UI boundaries. Each repository owns independent catalogs, snapshots, assets, and generation markers, while a global recovery journal serializes publication; the site registry and a repository's first snapshot are committed atomically.

**Tech Stack:** Node.js ESM, `node:test`, Astro 6, Starlight 0.39.2, TypeScript/Zod, JSON catalogs, GitHub REST API, Pagefind

---

## File map

Create:

- `scripts/manual/lib/repositories.mjs`: validate and resolve repository descriptors.
- `tests/manual/repositories.test.mjs`: registry schema, uniqueness, normalization, and rejection tests.
- `src/data/manual/repositories.json`: published repository registry; Task 1 starts with Projects only, and Task 8 adds Exposed in the same commit as its complete snapshot.
- `src/data/manual/bluetape4k-exposed.1.11.manifest.json`: pinned normalized source manifest.
- `src/data/manual/bluetape4k-exposed.1.11.snapshot.json`: pinned content/asset/source digest report.
- `src/data/manual/bluetape4k-exposed.manifest.json`: byte-identical latest manifest alias.
- `src/data/manual/bluetape4k-exposed.snapshot.json`: byte-identical latest snapshot alias.
- `src/data/manual/bluetape4k-exposed.versions.json`: Exposed version catalog.
- `src/data/manual/bluetape4k-exposed.redirects.json`: locale-preserving latest aliases.
- `src/content/docs/manual/bluetape4k-exposed/1.11/**`: generated English manual snapshot.
- `src/content/docs/ko/manual/bluetape4k-exposed/1.11/**`: generated Korean manual snapshot.
- `public/manual-assets/bluetape4k-exposed/1.11/**`: immutable versioned assets.
- `public/manual-assets/bluetape4k-exposed/**`: latest asset aliases.
- `.manual-sync-generation.bluetape4k-exposed.json`: Exposed generation marker.
- `.manual-sync-generation.bluetape4k-projects.json`: renamed Projects generation marker.

Modify:

- `scripts/manual/lib/paths.mjs`: descriptor-aware destinations, routes, and GitHub source URLs.
- `scripts/manual/lib/frontmatter.mjs`: descriptor-aware slug and source/asset/chapter rewriting.
- `scripts/manual/lib/catalog.mjs`: descriptor-aware version, selector, redirect, and unavailable-page logic.
- `scripts/manual/lib/release.mjs`: registry-pinned GitHub identity and tag resolution.
- `scripts/manual/lib/publication.mjs`: repository-scoped staging, backup, marker, and recovery.
- `scripts/manual/sync-manual.mjs`: explicit registry lookup, generic snapshot building, per-repository and aggregate check modes.
- `scripts/manual/validate-snapshot.mjs`: aggregate default and `--repository` single-scope validation.
- `scripts/manual/write-job-summary.mjs`: one row per repository.
- `package.json`: remove the hardcoded Projects argument from `sync:manual`.
- `astro.config.mjs`: combine all registered redirect catalogs and add manual navigation entries.
- `src/content.config.ts`: accept only registry slugs instead of one literal.
- `src/starlightRouteData.ts`: compute archive/Pagefind state from the current page's repository catalog.
- `src/components/ManualHeader.astro`: pass manual repository metadata to the selector.
- `src/components/ManualMobileMenuFooter.astro`: pass manual repository metadata to the selector.
- `src/components/ManualVersionSelector.astro`: load the current repository catalog and label.
- `src/components/ManualPageTitle.astro`: render repository-specific release provenance.
- `src/data/ecosystem/schema.mjs`: validate optional internal manual routes.
- `src/data/ecosystem/catalog.json`: give Projects and Exposed their manual roots.
- `src/components/EcosystemAtlas.astro`: make a published manual the primary action while retaining GitHub.
- `.github/workflows/deploy.yml`: consume aggregate manual validation without adding an expensive code matrix.
- Tests: `tests/manual/{paths,frontmatter,catalog,release,publication,sync,redirects,snapshot,version-ui}.test.mjs` and `tests/ecosystem/{catalog,atlas,manual-map}.test.mjs`.

Keep `src/components/ProjectsManualMap.astro` Projects-specific. It is a visual map for that repository, not the generic publication boundary.

### Task 1: Add the repository registry contract

**Files:**
- Create: `scripts/manual/lib/repositories.mjs`
- Create: `tests/manual/repositories.test.mjs`
- Create: `src/data/manual/repositories.json` with only the already-published Projects descriptor

- [ ] **Step 1: Write failing registry tests**

Use this fixture:

```js
const registry = {
  schema: 1,
  repositories: [
    {
      slug: 'bluetape4k-projects',
      repository: 'bluetape4k/bluetape4k-projects',
      label: { en: 'Projects docs', ko: 'Projects 문서' },
      latestMinor: '1.11',
      route: { en: '/manual/bluetape4k-projects/', ko: '/ko/manual/bluetape4k-projects/' },
    },
    {
      slug: 'bluetape4k-exposed',
      repository: 'bluetape4k/bluetape4k-exposed',
      label: { en: 'Exposed docs', ko: 'Exposed 문서' },
      latestMinor: '1.11',
      route: { en: '/manual/bluetape4k-exposed/', ko: '/ko/manual/bluetape4k-exposed/' },
    },
  ],
};
```

Assert acceptance plus rejection of duplicate slug, duplicate full name, duplicate locale route, `fork/bluetape4k-exposed`, `latestMinor: '1.11.0'`, missing label, and a route whose slug differs from the descriptor.

- [ ] **Step 2: Run the new test and verify RED**

```bash
node --test tests/manual/repositories.test.mjs
```

Expected: FAIL because `scripts/manual/lib/repositories.mjs` does not exist.

- [ ] **Step 3: Implement the registry API**

Export exactly:

```js
export function validateRepositoryRegistry(value) {}
export function loadRepositoryRegistry(url) {}
export function repositoryBySlug(registry, slug) {}
export function repositoryByFullName(registry, fullName) {}
```

`validateRepositoryRegistry()` must return a cloned, normalized registry; permit only `bluetape4k/<slug>` identities; require `slug` to match `^bluetape4k-[a-z0-9-]+$`; require locale routes to equal `/(ko/)?manual/<slug>/`; and reject duplicate identities/routes.

- [ ] **Step 4: Run the test and verify GREEN**

```bash
node --test tests/manual/repositories.test.mjs
```

Expected: all registry tests PASS.

- [ ] **Step 5: Commit a Projects-only production registry**

```json
{
  "schema": 1,
  "repositories": [
    {
      "slug": "bluetape4k-projects",
      "repository": "bluetape4k/bluetape4k-projects",
      "label": { "en": "Projects docs", "ko": "Projects 문서" },
      "latestMinor": "1.11",
      "route": { "en": "/manual/bluetape4k-projects/", "ko": "/ko/manual/bluetape4k-projects/" }
    }
  ]
}
```

- [ ] **Step 6: Commit the pure registry contract**

```bash
git add scripts/manual/lib/repositories.mjs tests/manual/repositories.test.mjs src/data/manual/repositories.json
git commit -m "Establish one authority for every published manual repository" \
  -m "Rejected: Accept any bluetape4k repository string at call sites | Identity must be approved once and propagated as a descriptor." \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: node --test tests/manual/repositories.test.mjs."
```

### Task 2: Generalize pure path, frontmatter, and catalog functions

**Files:**
- Modify: `scripts/manual/lib/paths.mjs`
- Modify: `scripts/manual/lib/frontmatter.mjs`
- Modify: `scripts/manual/lib/catalog.mjs`
- Modify: `tests/manual/paths.test.mjs`
- Modify: `tests/manual/frontmatter.test.mjs`
- Modify: `tests/manual/catalog.test.mjs`

- [ ] **Step 1: Add Exposed failing cases while preserving Projects cases**

The new path expectations are:

```js
assert.equal(
  destinationFor('ko', exposed, 'ko/modules/bluetape4k-exposed-jdbc.md', '1.11'),
  'src/content/docs/ko/manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-jdbc.md',
);
assert.equal(
  manualRouteFor('en', exposed, '1.11', 'guides/jdbc-vs-r2dbc.md'),
  '/manual/bluetape4k-exposed/1.11/guides/jdbc-vs-r2dbc/',
);
assert.equal(
  githubSourceUrlFor({ repository: exposed, releaseRef: '1.11.0', sourcePath: 'exposed/jdbc', kind: 'tree' }),
  'https://github.com/bluetape4k/bluetape4k-exposed/tree/1.11.0/exposed/jdbc',
);
```

Add catalog tests proving that an Exposed catalog cannot be read with the Projects descriptor, selectors never cross repositories, redirects reject a target in another repository, and unavailable pages remain inside Exposed.

- [ ] **Step 2: Run the focused tests and verify RED**

```bash
node --test tests/manual/paths.test.mjs tests/manual/frontmatter.test.mjs tests/manual/catalog.test.mjs
```

Expected: FAIL because existing functions are Projects-specific.

- [ ] **Step 3: Change public signatures to require descriptors**

Use these signatures consistently:

```js
destinationFor(locale, repository, relativePath, minorVersion)
assetDestinationFor(repository, relativePath, minorVersion)
manualRouteFor(locale, repository, minorVersion, relativePath)
githubSourceUrlFor({ repository, releaseRef, sourcePath, kind })
validateVersionCatalog(catalog, repository)
mergeVersionCatalog(previous, entry, repository)
selectorTarget(catalog, request, repository)
loadRedirectCatalog(redirectUrl, repository)
buildRedirectCatalog({ repository, previous, latestEntry, successors })
buildUnavailablePage({ repository, locale, targetMinor, sourceMinor, documentId })
```

`setDocumentSlug()` must accept the descriptor and verify a slug under `manual/<slug>/<minor>` or `ko/manual/<slug>/<minor>`; no function may infer Projects as a default.

- [ ] **Step 4: Run focused and full manual tests**

```bash
node --test tests/manual/paths.test.mjs tests/manual/frontmatter.test.mjs tests/manual/catalog.test.mjs
npm test
```

Expected: focused tests and the existing 86-test baseline all PASS after call sites in tests are updated.

- [ ] **Step 5: Commit the repository-aware pure generation layer**

```bash
git add scripts/manual/lib/paths.mjs scripts/manual/lib/frontmatter.mjs scripts/manual/lib/catalog.mjs tests/manual/paths.test.mjs tests/manual/frontmatter.test.mjs tests/manual/catalog.test.mjs
git commit -m "Keep every generated manual path inside its repository" \
  -m "Constraint: Projects output must remain byte- and route-compatible while Exposed gets a separate namespace." \
  -m "Confidence: high" \
  -m "Scope-risk: moderate" \
  -m "Tested: focused path/frontmatter/catalog tests and npm test."
```

### Task 3: Pin GitHub release resolution to the registry descriptor

**Files:**
- Modify: `scripts/manual/lib/release.mjs`
- Modify: `tests/manual/release.test.mjs`

- [ ] **Step 1: Add failing dual-repository release fixtures**

The fixture must resolve:

```js
await resolveRelease({
  repository: exposed,
  releaseRef: '1.11.0',
  fetchImpl,
});
```

to repository `bluetape4k/bluetape4k-exposed`, minor `1.11`, and commit `0b494a5fd1e083006046764757342b68a397e4c5`. Assert that using the Projects descriptor for the same GitHub payload fails with `REPOSITORY_IDENTITY`, including when only `repository_url` crosses identity.

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/manual/release.test.mjs
```

Expected: new Exposed fixture FAILS under the single `ALLOWED_REPOSITORY` implementation.

- [ ] **Step 3: Thread the descriptor through all release helpers**

`repositoryPath`, `assertPayloadIdentity`, `requestJson`, `resolveCommit`, `safeUrl`, `resolveRelease`, and `assertReleaseUnmoved` must derive the allowed full name from the validated descriptor. Preserve the token sanitizer, annotated-tag depth/cycle protection, draft/prerelease rejection, canonical SHA enforcement, and moved-tag check unchanged in behavior.

- [ ] **Step 4: Run and verify GREEN**

```bash
node --test tests/manual/release.test.mjs
```

Expected: all Projects security regressions and Exposed identity cases PASS.

- [ ] **Step 5: Commit release provenance generalization**

```bash
git add scripts/manual/lib/release.mjs tests/manual/release.test.mjs
git commit -m "Pin release evidence to the selected manual repository" \
  -m "Confidence: high" \
  -m "Scope-risk: moderate" \
  -m "Tested: node --test tests/manual/release.test.mjs."
```

### Task 4: Isolate atomic publication by repository

**Files:**
- Modify: `scripts/manual/lib/publication.mjs`
- Modify: `tests/manual/publication.test.mjs`
- Create: `.manual-sync-generation.bluetape4k-projects.json`
- Delete: `.manual-sync-generation.json`

- [ ] **Step 1: Add failing cross-repository isolation tests**

Tests must prove:

```text
Projects publish -> Exposed publish preserves Projects marker and target bytes.
Exposed rollback -> Projects marker and target digest remain unchanged.
Exposed recovery -> only the Exposed marker is consulted and replaced.
Unknown/traversal scope -> rejected before filesystem mutation.
Staged scope != journal scope -> recovery fails closed.
```

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/manual/publication.test.mjs
```

Expected: cross-repository marker assertions FAIL because the current marker is global.

- [ ] **Step 3: Add repository scope to publication state**

Change the entry point to:

```js
stagePublication({ targetRoot, entries, generationId, scope })
```

Use `.manual-sync-generation.<scope>.json`, `.manual-sync/staging/<scope>/<generationId>`, and `.manual-sync/backups/<scope>/<generationId>`. Keep one global journal/lock, but persist and validate `scope` in the journal and staged object before recovery or replacement.

- [ ] **Step 4: Migrate the committed Projects marker without changing its JSON bytes**

```bash
mv .manual-sync-generation.json .manual-sync-generation.bluetape4k-projects.json
```

Verify its content digest is unchanged across the rename.

- [ ] **Step 5: Run publication tests and commit**

```bash
node --test tests/manual/publication.test.mjs
git add scripts/manual/lib/publication.mjs tests/manual/publication.test.mjs .manual-sync-generation.bluetape4k-projects.json .manual-sync-generation.json
git commit -m "Prevent one manual repository from replacing another's snapshot" \
  -m "Constraint: Publication remains globally serialized but markers and generations are repository-owned." \
  -m "Confidence: high" \
  -m "Scope-risk: moderate" \
  -m "Tested: publication rollback, recovery, forged-journal, and cross-repository isolation tests."
```

### Task 5: Generalize sync, offline validation, and job summaries

**Files:**
- Modify: `scripts/manual/sync-manual.mjs`
- Modify: `scripts/manual/validate-snapshot.mjs`
- Modify: `scripts/manual/write-job-summary.mjs`
- Modify: `package.json`
- Modify: `tests/manual/sync.test.mjs`
- Modify: `tests/manual/snapshot.test.mjs`

- [ ] **Step 1: Add failing multi-repository sync tests**

Add assertions that write mode without `--repository` fails with `CLI_REPOSITORY`; an Exposed fixture writes only Exposed paths; Projects marker/snapshot bytes are identical before and after Exposed sync; aggregate check returns both repository results; one drifted repository fails the aggregate without modifying either; and registry `latestMinor` must equal the versions catalog `latest`.

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/manual/sync.test.mjs tests/manual/snapshot.test.mjs
```

Expected: Exposed and aggregate tests FAIL under the Projects constants.

- [ ] **Step 3: Load one descriptor at the CLI boundary and pass it downward**

`parseArgs()` must require `--repository <slug>` for `latest`, `release`, and `refresh`; `--check` accepts an optional repository and defaults to all registry entries. Replace `repositorySlug` plus `repositoryFullName` with one validated `repository` descriptor in `buildSnapshot(input)`.

Split validation into:

```js
validateCommittedRepository({ targetRoot, repository })
validateCommittedSite({ targetRoot, repository }) // one descriptor or undefined for all
```

The aggregate result must be deterministically ordered by registry order and must never rewrite files.

- [ ] **Step 4: Remove the package-level Projects default**

```json
{
  "scripts": {
    "sync:manual": "node scripts/manual/sync-manual.mjs",
    "check:manual": "node scripts/manual/validate-snapshot.mjs"
  }
}
```

- [ ] **Step 5: Run focused tests and commit**

```bash
node --test tests/manual/sync.test.mjs tests/manual/snapshot.test.mjs
git add scripts/manual/sync-manual.mjs scripts/manual/validate-snapshot.mjs scripts/manual/write-job-summary.mjs package.json tests/manual/sync.test.mjs tests/manual/snapshot.test.mjs
git commit -m "Make manual synchronization explicit and repository-isolated" \
  -m "Rejected: Preserve an implicit Projects default | It can silently publish source bytes into the wrong namespace." \
  -m "Confidence: high" \
  -m "Scope-risk: broad" \
  -m "Tested: multi-repository sync, aggregate check, drift, and isolation tests."
```

### Task 6: Generalize Astro schema, redirect loading, version UI, and provenance

**Files:**
- Modify: `astro.config.mjs`
- Modify: `src/content.config.ts`
- Modify: `src/starlightRouteData.ts`
- Modify: `src/components/ManualHeader.astro`
- Modify: `src/components/ManualMobileMenuFooter.astro`
- Modify: `src/components/ManualVersionSelector.astro`
- Modify: `src/components/ManualPageTitle.astro`
- Modify: `tests/manual/redirects.test.mjs`
- Modify: `tests/manual/version-ui.test.mjs`

- [ ] **Step 1: Add one fixture build containing Projects and Exposed**

The fixture must render these pages in one build:

```text
/manual/bluetape4k-projects/1.11/modules/shared/
/ko/manual/bluetape4k-projects/1.11/modules/shared/
/manual/bluetape4k-exposed/1.11/modules/shared/
/ko/manual/bluetape4k-exposed/1.11/modules/shared/
```

Assert repository-specific labels, version links, release URLs, archive state, Pagefind inclusion, and absence of a selector on malformed or non-manual routes. Add redirect collision and cross-repository target rejection.

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/manual/redirects.test.mjs tests/manual/version-ui.test.mjs
```

Expected: Exposed fixture pages fail schema validation or render Projects labels.

- [ ] **Step 3: Make content metadata registry-backed**

Replace `z.literal('bluetape4k-projects')` with a `z.string().refine()` whose allowed set comes from the validated registry. Keep the existing minor, release, source commit, kind, and layer constraints.

- [ ] **Step 4: Resolve UI state from current manual metadata**

`ManualVersionSelector.astro` and `ManualPageTitle.astro` must use `manual.repository` to load `<slug>.versions.json`, retrieve the registry label and GitHub identity, and generate links. The route repository segment must equal metadata repository; otherwise render no selector and fail no build.

Expected visible strings:

```text
Projects docs 1.11
Projects 문서 1.11
Exposed docs 1.11
Exposed 문서 1.11
Based on Exposed release 1.11.0
Exposed 1.11.0 릴리스 기준
```

- [ ] **Step 5: Combine redirect catalogs safely**

`astro.config.mjs` must load each registered repository's redirect catalog, reject duplicate sources across catalogs, and ensure every destination remains in the same repository and locale.

- [ ] **Step 6: Run fixture builds and commit**

```bash
node --test tests/manual/redirects.test.mjs tests/manual/version-ui.test.mjs
git add astro.config.mjs src/content.config.ts src/starlightRouteData.ts src/components/ManualHeader.astro src/components/ManualMobileMenuFooter.astro src/components/ManualVersionSelector.astro src/components/ManualPageTitle.astro tests/manual/redirects.test.mjs tests/manual/version-ui.test.mjs
git commit -m "Show the correct repository and release on every manual page" \
  -m "Confidence: high" \
  -m "Scope-risk: broad" \
  -m "Tested: dual-repository Astro fixture builds, redirects, Pagefind, and version UI tests."
```

### Task 7: Connect the ecosystem atlas to published manuals

**Files:**
- Modify: `src/data/ecosystem/schema.mjs`
- Modify: `src/data/ecosystem/catalog.json`
- Modify: `src/components/EcosystemAtlas.astro`
- Modify: `tests/ecosystem/catalog.test.mjs`
- Modify: `tests/ecosystem/atlas.test.mjs`
- Modify: `tests/ecosystem/manual-map.test.mjs`

- [ ] **Step 1: Add failing manual-route catalog tests**

Projects and Exposed must accept these exact roots:

```json
{
  "bluetape4k-projects": "/manual/bluetape4k-projects/",
  "bluetape4k-exposed": "/manual/bluetape4k-exposed/"
}
```

Reject external URLs, another node's slug, a versioned route in the catalog, query/fragment values, and locale-prefixed storage values.

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/ecosystem/catalog.test.mjs tests/ecosystem/atlas.test.mjs tests/ecosystem/manual-map.test.mjs
```

Expected: manual-route assertions FAIL before schema/UI support exists.

- [ ] **Step 3: Render manual as the primary action and GitHub as secondary**

Use locale at render time to prefix `/ko` for Korean pages. Do not remove the GitHub repository action. Repositories without a published manual retain GitHub as the primary action.

- [ ] **Step 4: Run and commit**

```bash
node --test tests/ecosystem/catalog.test.mjs tests/ecosystem/atlas.test.mjs tests/ecosystem/manual-map.test.mjs
git add src/data/ecosystem/schema.mjs src/data/ecosystem/catalog.json src/components/EcosystemAtlas.astro tests/ecosystem/catalog.test.mjs tests/ecosystem/atlas.test.mjs tests/ecosystem/manual-map.test.mjs
git commit -m "Lead ecosystem visitors into published repository manuals" \
  -m "Constraint: GitHub remains available as the source action and unpublished repositories do not get dead manual links." \
  -m "Confidence: high" \
  -m "Scope-risk: moderate" \
  -m "Tested: ecosystem schema, atlas, and manual-map tests."
```

### Task 8: Register Projects and Exposed and generate the immutable Exposed snapshot

**Files:**
- Modify: `src/data/manual/repositories.json` to add Exposed atomically with its first snapshot
- Create: all Exposed catalogs, snapshot aliases, content, assets, and marker listed in the file map
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Verify the source PR is merged and pin its authoring commit**

```bash
git -C /Users/debop/work/bluetape4k/bluetape4k-exposed fetch origin --prune
git -C /Users/debop/work/bluetape4k/bluetape4k-exposed rev-parse origin/develop
git -C /Users/debop/work/bluetape4k/bluetape4k-exposed status --short
```

Expected: the merged source commit contains `docs/manual/generated/manifest.json`, the source checkout is clean, and the release tag still resolves to `0b494a5fd1e083006046764757342b68a397e4c5`.

- [ ] **Step 2: Add registry and snapshot in one generation**

Append the approved Exposed descriptor from the Task 1 fixture to `src/data/manual/repositories.json`, then run:

```bash
npm run sync:manual -- \
  --repository bluetape4k-exposed \
  --source /Users/debop/work/bluetape4k/bluetape4k-exposed \
  --refresh 1.11.0
```

Expected: Exposed content is written only below Exposed namespaces; Projects committed files and marker remain byte-identical.

- [ ] **Step 3: Assert provenance, totals, aliases, and isolation**

```bash
jq -e '.repository == "bluetape4k/bluetape4k-exposed" and .releaseRef == "1.11.0" and .releaseCommit == "0b494a5fd1e083006046764757342b68a397e4c5" and (.modules | length) == 40' src/data/manual/bluetape4k-exposed.1.11.manifest.json
cmp src/data/manual/bluetape4k-exposed.1.11.manifest.json src/data/manual/bluetape4k-exposed.manifest.json
cmp src/data/manual/bluetape4k-exposed.1.11.snapshot.json src/data/manual/bluetape4k-exposed.snapshot.json
npm run check:manual -- --repository bluetape4k-projects
npm run check:manual -- --repository bluetape4k-exposed
npm run check:manual
```

Expected: manifest has 40 modules; aliases are byte-identical; all three validation commands exit 0.

- [ ] **Step 4: Keep deployment validation cheap and aggregate**

Update `.github/workflows/deploy.yml` only so the existing manual snapshot gate runs the aggregate `npm run check:manual`. Do not add Kotlin builds, CodeQL, or a duplicate site build.

- [ ] **Step 5: Commit registry and snapshot atomically**

```bash
git add src/data/manual/repositories.json src/data/manual/bluetape4k-exposed* src/content/docs/manual/bluetape4k-exposed src/content/docs/ko/manual/bluetape4k-exposed public/manual-assets/bluetape4k-exposed .manual-sync-generation.bluetape4k-exposed.json .github/workflows/deploy.yml
git commit -m "Publish the stable Exposed manual beside Projects" \
  -m "Constraint: Registry visibility and the first immutable snapshot must enter the site atomically." \
  -m "Confidence: high" \
  -m "Scope-risk: broad" \
  -m "Tested: source provenance, alias byte parity, per-repository and aggregate snapshot checks."
```

### Task 9: Run full regression, review, PR, deploy, and public-route verification

**Files:**
- Modify only files required to correct failures found by this gate

- [ ] **Step 1: Run the full local gate**

```bash
npm test
npm run check:manual
npm run check:manual -- --repository bluetape4k-projects
npm run check:manual -- --repository bluetape4k-exposed
npm run build
git diff --check
```

Expected: all tests pass, aggregate and both scoped checks pass, Astro diagnostics/build pass, and no whitespace errors exist.

- [ ] **Step 2: Prove Projects regression-free behavior**

Compare the Projects manifest, snapshot, version catalog, redirect catalog, content tree, assets, and public routes to the design branch base. Generic refactoring may change implementation code but must not change committed Projects snapshot bytes or routes.

- [ ] **Step 3: Perform independent review**

Review security/path containment, release provenance, rollback/recovery, cross-repository isolation, Astro schema/UI, bilingual routes, Pagefind archive behavior, and deploy gate value. Resolve all P0/P1 findings before PR creation.

- [ ] **Step 4: Create and verify the site PR**

Create the issue and PR against `develop`, assign both to `debop`, copy the issue's labels and milestone to the PR, and ensure the final Markdown section is `## DoD Status`. Capture live numbers from returned URLs:

```bash
ISSUE_URL="$(gh issue create --title 'Publish versioned manuals from multiple repositories' --body 'Generalize the stable manual pipeline and publish Exposed 1.11 without changing Projects routes or snapshot bytes.' --assignee debop)"
ISSUE_NUMBER="${ISSUE_URL##*/}"
PR_URL="$(gh pr create --base develop --head docs/multi-repository-manual-design --title 'Publish Exposed manuals through the shared versioned pipeline' --assignee debop --body "Closes #${ISSUE_NUMBER}

## Summary

Adds repository-isolated manual publishing and the immutable Exposed 1.11 snapshot while preserving Projects.

## DoD Status

- [x] Projects snapshot and routes preserved
- [x] Exposed English and Korean manuals published
- [x] aggregate validation and production build passed")"
PR_NUMBER="${PR_URL##*/}"
gh issue view "$ISSUE_NUMBER" --json labels --jq '.labels[].name' | while IFS= read -r label; do gh pr edit "$PR_NUMBER" --add-label "$label"; done
MILESTONE="$(gh issue view "$ISSUE_NUMBER" --json milestone --jq '.milestone.title // empty')"
test -z "$MILESTONE" || gh pr edit "$PR_NUMBER" --milestone "$MILESTONE"
gh issue view "$ISSUE_NUMBER" --json assignees,labels,milestone,state
gh pr view "$PR_NUMBER" --json assignees,labels,milestone,body,headRefName,baseRefName
gh pr checks "$PR_NUMBER" --watch
```

Merge only after live CI is green.

- [ ] **Step 5: Verify deployment and public routes**

After the Pages workflow succeeds, verify HTTP 200 and content markers for:

```text
https://bluetape4k.github.io/manual/bluetape4k-exposed/1.11/
https://bluetape4k.github.io/ko/manual/bluetape4k-exposed/1.11/
https://bluetape4k.github.io/manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-jdbc/
https://bluetape4k.github.io/ko/manual/bluetape4k-exposed/1.11/modules/bluetape4k-exposed-jdbc/
https://bluetape4k.github.io/manual/bluetape4k-exposed/
https://bluetape4k.github.io/ko/manual/bluetape4k-exposed/
```

Also open one diagram asset and confirm it renders at full size with no clipped text, missing edge, or undersized arrowhead. Only after all source and site DoD evidence is complete may the AWS manual plan begin.
