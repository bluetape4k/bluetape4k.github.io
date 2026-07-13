# Ignite-style Manual Version Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `bluetape4k-projects` minor-version navigation into the Starlight desktop header and mobile menu while replacing broken document-source pills with truthful release provenance.

**Architecture:** Two narrow Starlight component overrides mount the existing catalog-driven selector in desktop and mobile navigation. `ManualVersionSelector.astro` remains the single owner of document-aware version targets, while `ManualPageTitle.astro` is reduced to a quiet release-provenance line. Existing catalog metadata and static Astro generation remain unchanged.

**Tech Stack:** Astro 6.3.1, Starlight 0.39.2, TypeScript, CSS, Node test runner.

---

## File structure

- Create `src/components/ManualHeader.astro`: Starlight header override with the desktop selector after language selection.
- Create `src/components/ManualMobileMenuFooter.astro`: Starlight mobile footer override with a full-width selector above preferences.
- Modify `src/components/ManualVersionSelector.astro`: shared header/mobile presentation and public release link.
- Modify `src/components/ManualPageTitle.astro`: remove title pills and render quiet release provenance.
- Modify `src/styles/manual.css`: header/mobile dropdown, focus, touch, responsive, forced-color, and print styles.
- Modify `astro.config.mjs`: register `Header` and `MobileMenuFooter` overrides.
- Modify `tests/manual/version-ui.test.mjs`: RED/GREEN source contracts and fixture-build behavior.
- Modify `docs/superpowers/checklists/2026-07-13-ignite-style-manual-version-navigation.md`: record gate evidence as each step completes.

No dependency, content snapshot, route catalog, sidebar, blog, diagram, or deployment file changes.

## Acceptance traceability

| Acceptance criterion | Implemented by | Proved by |
| --- | --- | --- |
| Desktop `Manual/매뉴얼 1.11` beside language | Task 2 | source contract + fixture HTML |
| Mobile selector remains available | Task 2 | source contract + fixture HTML |
| Non-manual routes have no selector | Task 2 | fixture non-manual assertion |
| No page-title pills or broken source link | Task 3 | fixture title assertions |
| Exact public release provenance | Tasks 2–3 | release URL assertions |
| Document-aware localized no-JS navigation | Task 2 | existing target assertions + focused build |
| Accessible/responsive/print-safe UI | Task 3 | CSS source assertions + representative route checks |

### Task 1: Lock the navigation and provenance contract in RED

**Complexity:** Medium  
**Depends on:** Approved design spec  
**Write scope:** `tests/manual/version-ui.test.mjs` only  
**Rollback/rerun point:** Revert only this test diff if the failure is not caused by the missing feature.

**Files:**
- Modify: `tests/manual/version-ui.test.mjs`

- [ ] **Step 1: Extend the fixture with the new override files and mappings**

Copy the not-yet-created override files when present so the pre-implementation
run fails through assertions/build status rather than an unhandled filesystem
error:

```js
for (const relative of [
  'src/components/ManualHeader.astro',
  'src/components/ManualMobileMenuFooter.astro',
]) {
  try {
    await cp(path.join(projectRoot, relative), path.join(fixture, relative), { recursive: true });
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}
for (const relative of [
  'src/components/ManualPageTitle.astro',
  'src/components/ManualVersionSelector.astro',
  'src/styles/manual.css',
  'src/starlightRouteData.ts',
  'scripts/manual/lib/catalog.mjs',
  'scripts/manual/lib/paths.mjs',
  'scripts/manual/lib/version.mjs',
]) await cp(path.join(projectRoot, relative), path.join(fixture, relative), { recursive: true });
```

Change the fixture Starlight component mapping to:

```js
components: {
  Header: './src/components/ManualHeader.astro',
  MobileMenuFooter: './src/components/ManualMobileMenuFooter.astro',
  PageTitle: './src/components/ManualPageTitle.astro',
}
```

- [ ] **Step 2: Replace the old page-title selector source contract**

Assert that the selector exposes placement-aware classes and localized copy,
and that the two new overrides mount it in the correct order. Read missing
components as empty strings so RED is an assertion failure:

```js
test('manual selector is mounted beside language selection and in the mobile preferences', async () => {
  const config = await read('astro.config.mjs');
  const readOptional = (relative) => read(relative).catch((error) => {
    if (error?.code === 'ENOENT') return '';
    throw error;
  });
  const header = await readOptional('src/components/ManualHeader.astro');
  const mobile = await readOptional('src/components/ManualMobileMenuFooter.astro');
  const selector = await read('src/components/ManualVersionSelector.astro');

  assert.match(config, /Header:\s*['"]\.\/src\/components\/ManualHeader\.astro['"]/);
  assert.match(config, /MobileMenuFooter:\s*['"]\.\/src\/components\/ManualMobileMenuFooter\.astro['"]/);
  assert.ok(header.indexOf('<LanguageSelect />') < header.indexOf('<ManualVersionSelector'));
  assert.ok(mobile.indexOf('<ManualVersionSelector') < mobile.indexOf('mobile-preferences'));
  assert.match(selector, /placement:\s*'header'\s*\|\s*'mobile'/);
  assert.match(selector, /bt4k-manual-version--/);
  for (const text of ['Manual', '매뉴얼', 'Release', '릴리스']) {
    assert.ok(selector.includes(text), `missing selector copy: ${text}`);
  }
});
```

- [ ] **Step 3: Update fixture HTML assertions for global placement and truthful provenance**

After the existing fixture build, assert:

```js
assert.match(archived, /bt4k-manual-version--header/);
assert.match(archived, /bt4k-manual-version--mobile/);
assert.match(archived, />Manual<\/span>\s*<span>1\.11<\/span>/);
assert.match(latestNewKo, />매뉴얼<\/span>\s*<span>1\.12<\/span>/);
assert.match(latestNew, /releases\/tag\/1\.12\.0/);
assert.match(latestNewKo, /releases\/tag\/1\.12\.0/);
assert.match(latestNew, /Based on release 1\.12\.0/);
assert.match(latestNewKo, /릴리스 1\.12\.0 기준/);
assert.doesNotMatch(latestNew, /Source 1\.12\.0/);
assert.doesNotMatch(latestNewKo, /소스 1\.12\.0/);
assert.doesNotMatch(missingCatalogNonManual, /bt4k-manual-version--(?:header|mobile)/);
```

- [ ] **Step 4: Run the focused test and confirm the intended RED**

Run:

```bash
node --test tests/manual/version-ui.test.mjs
```

Expected: FAIL because `ManualHeader.astro` and
`ManualMobileMenuFooter.astro` do not exist and the old selector/title contract
does not contain placement classes or release provenance.

### Task 2: Implement catalog-driven desktop and mobile version navigation

**Complexity:** Medium  
**Depends on:** Task 1 RED  
**Write scope:** two new components, selector, and Starlight mapping  
**Rollback/rerun point:** Restore these four implementation files, then rerun Task 1 to confirm RED returns.

**Files:**
- Create: `src/components/ManualHeader.astro`
- Create: `src/components/ManualMobileMenuFooter.astro`
- Modify: `src/components/ManualVersionSelector.astro`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Add the desktop header override**

Follow the installed Starlight 0.39.2 `Header.astro` structure exactly for the
default virtual components. Derive manual context once:

```astro
const { starlightRoute } = Astro.locals;
const manual = starlightRoute.entry.data.manual;
const locale = starlightRoute.lang === 'ko' ? 'ko' : 'en';
```

Insert the selector immediately after the language selector:

```astro
<LanguageSelect />
{manual?.minorVersion && (
  <ManualVersionSelector
    entryId={starlightRoute.entry.id}
    locale={locale}
    minorVersion={manual.minorVersion}
    placement="header"
  />
)}
```

Preserve the installed header grid, search visibility, title overflow, social
divider, and `md:sl-flex` desktop breakpoint CSS verbatim.

- [ ] **Step 2: Add the mobile menu footer override**

Derive the same manual context and render the selector before the unchanged
Starlight preference row:

```astro
{manual?.minorVersion && (
  <ManualVersionSelector
    entryId={starlightRoute.entry.id}
    locale={locale}
    minorVersion={manual.minorVersion}
    placement="mobile"
  />
)}
<div class="mobile-preferences sl-flex">
  <div class="social-icons"><SocialIcons /></div>
  <ThemeSelect />
  <LanguageSelect />
</div>
```

Preserve the installed mobile preference CSS verbatim.

- [ ] **Step 3: Make the shared selector placement-aware**

Extend props and render classes:

```astro
interface Props {
  entryId: string;
  locale: 'en' | 'ko';
  minorVersion: string;
  placement: 'header' | 'mobile';
}

const { entryId, locale, minorVersion, placement } = Astro.props;
const kindText = locale === 'ko' ? '매뉴얼' : 'Manual';
const releaseText = locale === 'ko' ? '릴리스' : 'Release';
```

Resolve the current catalog version and public release URL:

```astro
const currentVersion = catalog?.versions.find((item) => item.minorVersion === minorVersion);
const releaseUrl = currentVersion
  ? `https://github.com/bluetape4k/bluetape4k-projects/releases/tag/${encodeURIComponent(currentVersion.releaseRef)}`
  : undefined;
```

Use one native details menu for both placements:

```astro
<details class:list={['bt4k-manual-version', `bt4k-manual-version--${placement}`]}>
  <summary aria-label={summaryLabel}>
    <span>{kindText}</span><span>{minorVersion}</span>
  </summary>
  <div class="bt4k-manual-version__menu">
    <ul>...</ul>
    {releaseUrl && <a class="bt4k-manual-version__release" href={releaseUrl}>{releaseText} {currentVersion.releaseRef} ↗</a>}
  </div>
</details>
```

Keep `selectorTarget(...)`, document membership, stable/archive copy, anchors,
and `aria-current` unchanged.

- [ ] **Step 4: Register both Starlight overrides**

Add to the existing component map:

```js
Header: './src/components/ManualHeader.astro',
MobileMenuFooter: './src/components/ManualMobileMenuFooter.astro',
```

- [ ] **Step 5: Run the focused test**

Run:

```bash
node --test tests/manual/version-ui.test.mjs
```

Expected: selector placement assertions progress; title/style assertions may
remain failing until Task 3.

### Task 3: Replace title pills with quiet release provenance and finish responsive styles

**Complexity:** Medium  
**Depends on:** Task 2  
**Write scope:** page title and manual stylesheet  
**Rollback/rerun point:** Revert these two files and rerun the focused test; navigation placement must remain while provenance/style assertions fail.

**Files:**
- Modify: `src/components/ManualPageTitle.astro`
- Modify: `src/styles/manual.css`

- [ ] **Step 1: Reduce the page-title component to release provenance**

Remove `githubSourceUrlFor`, `ManualVersionSelector`, and the layer/group/version
pill markup. Keep catalog lookup for stable/archive state. Build a safe release
URL from schema-validated `manual.releaseRef`:

```astro
const releaseUrl = manual?.releaseRef
  ? `https://github.com/bluetape4k/bluetape4k-projects/releases/tag/${encodeURIComponent(manual.releaseRef)}`
  : undefined;
const stateText = archived
  ? (locale === 'ko' ? '보존 버전' : 'Archived')
  : (locale === 'ko' ? '최신 안정판' : 'Latest stable');
const releaseLabel = locale === 'ko'
  ? `릴리스 ${manual?.releaseRef} 기준`
  : `Based on release ${manual?.releaseRef}`;
```

Render:

```astro
<DefaultPageTitle />
{manual?.minorVersion && releaseUrl && (
  <p class="bt4k-manual-provenance" aria-label={locale === 'ko' ? '매뉴얼 배포 기준' : 'Manual release provenance'}>
    <span class="bt4k-manual-provenance__state">{stateText}</span>
    <span aria-hidden="true">·</span>
    <a href={releaseUrl}>{releaseLabel}</a>
  </p>
)}
```

- [ ] **Step 2: Replace pill styles with header/mobile selector styles**

Delete `.bt4k-manual-source` rules. Define the shared trigger and dropdown:

```css
.bt4k-manual-version { position: relative; max-inline-size: 100%; }
.bt4k-manual-version summary {
  display: flex;
  align-items: center;
  gap: .4rem;
  min-block-size: 44px;
  padding-inline: .7rem;
  cursor: pointer;
  border: 1px solid var(--sl-color-gray-5);
  border-radius: .5rem;
  color: var(--sl-color-white);
  font-weight: 700;
  list-style: none;
}
.bt4k-manual-version__menu {
  position: absolute;
  z-index: 20;
  inset-block-start: calc(100% + .45rem);
  inset-inline-end: 0;
  inline-size: min(19rem, calc(100vw - 2rem));
  overflow: hidden;
  border: 1px solid var(--sl-color-gray-5);
  border-radius: .65rem;
  background: var(--sl-color-bg-nav);
  box-shadow: var(--sl-shadow-lg);
}
```

Add a full-width mobile variant, quiet provenance, focus-visible, forced-color,
and print rules:

```css
.bt4k-manual-version--mobile { inline-size: 100%; margin-block: .5rem; }
.bt4k-manual-version--mobile summary { justify-content: space-between; inline-size: 100%; }
.bt4k-manual-version--mobile .bt4k-manual-version__menu { inset-inline: 0; inline-size: 100%; }
.bt4k-manual-provenance { display: flex; flex-wrap: wrap; gap: .35rem; margin-block: .45rem 1.25rem; color: var(--sl-color-gray-3); font-size: .78rem; }
.bt4k-manual-provenance a { color: var(--sl-color-text-accent); text-decoration: none; }
@media print {
  .bt4k-manual-version { display: none; }
  .bt4k-manual-provenance a { color: #000; }
}
```

- [ ] **Step 3: Run focused GREEN**

Run:

```bash
node --test tests/manual/version-ui.test.mjs
```

Expected: PASS, including fixture builds, localized HTML, non-manual scoping,
Pagefind behavior, release links, and style contracts.

- [ ] **Step 4: Refactor only while green**

Remove duplicated copy or selectors introduced during Tasks 2–3 without adding
state, helpers, or dependencies. Rerun the focused test after each cleanup.

### Task 4: Verify the complete site contract and final scope

**Complexity:** Medium  
**Depends on:** Task 3 GREEN  
**Write scope:** checklist evidence only unless verification finds a defect  
**Rollback/rerun point:** Any repair returns to the owning task and reruns focused GREEN before broader checks.

**Files:**
- Modify: `docs/superpowers/checklists/2026-07-13-ignite-style-manual-version-navigation.md`

- [ ] **Step 1: Run the full automated suite**

Run:

```bash
npm test
```

Expected: all manual and ecosystem Node tests pass with zero failures.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: Astro check reports zero errors and the production build completes.

- [ ] **Step 3: Inspect representative built routes**

Check the generated Korean manual, English manual, and non-manual pages:

```bash
rg -n "bt4k-manual-version--header|bt4k-manual-version--mobile|매뉴얼|릴리스 1\.11\.0 기준|releases/tag/1\.11\.0" dist/ko/manual/bluetape4k-projects/1.11/modules/bluetape4k-cassandra/index.html
rg -n "bt4k-manual-version--header|bt4k-manual-version--mobile|Manual|Based on release 1\.11\.0|releases/tag/1\.11\.0" dist/manual/bluetape4k-projects/1.11/modules/bluetape4k-cassandra/index.html
! rg -n "bt4k-manual-version--(?:header|mobile)" dist/ko/ecosystem/atlas/index.html
```

Expected: both manual selectors and localized provenance appear on manual
routes; the ecosystem route has no selector.

- [ ] **Step 4: Run final diff hygiene and scoped review**

Run:

```bash
git diff --check
git status --short -- src/components/ManualHeader.astro src/components/ManualMobileMenuFooter.astro src/components/ManualVersionSelector.astro src/components/ManualPageTitle.astro src/styles/manual.css astro.config.mjs tests/manual/version-ui.test.mjs docs/superpowers/specs/2026-07-13-ignite-style-manual-version-navigation-design.md docs/superpowers/plans/2026-07-13-ignite-style-manual-version-navigation-plan.md docs/superpowers/checklists/2026-07-13-ignite-style-manual-version-navigation.md
```

Review behavior, accessibility, mobile/zoom wrapping, localization, release
provenance, non-manual isolation, Starlight override drift, and accidental
changes. Expected: P0=0/P1=0 and only approved files in scope.

- [ ] **Step 5: Reconcile the workflow checklist**

Record every command/result, check all applicable rows, prove N/A rows with
scope evidence, and report:

```text
Required checks: X/Y; N/A: N; Blocked: 0; Unchecked: none
```

## Risk prediction

- **Starlight component drift:** source-contract tests pin the override mapping
  and the existing Starlight 0.39.2 compatibility digest remains in the full
  suite. Rerun Task 1 if Starlight changes.
- **Mobile selector disappearance:** both desktop and mobile HTML markers are
  asserted in the same fixture build. Rerun Tasks 1–3 after footer changes.
- **False document provenance:** only `releases/tag/{releaseRef}` is emitted;
  `Source`/`소스` is explicitly rejected. Rerun Task 1 after metadata changes.
- **Locale or fallback regression:** existing `selectorTarget(...)` is retained
  and Pagefind/fallback fixture assertions stay active. Rerun the whole focused
  test after selector changes.
- **Dirty-worktree contamination:** every final status/diff command is path
  scoped; no broad staging, cleanup, generation, or content sync is allowed.

## Conditional surfaces

- KDoc/public library API: N/A, no library code.
- README locale parity: N/A, no README change.
- Diagrams/assets: N/A, no visual asset change.
- Workflow/catalog/module registration: N/A, Starlight component mapping only.
- Concurrency/cancellation/resources: N/A, static Astro rendering and native
  `<details>` navigation only.
- Heavy integration/performance scan: N/A, no runtime hot path, DB, cache,
  external service, or dependency change.
- External delivery: N/A unless separately authorized.

## Plan review record

The current session reviewed the exact plan sequentially because native
subagent dispatch is disabled for this task. Each lens used the approved spec,
current Starlight 0.39.2 source, repository tests, and dirty-worktree boundary.

| Priority | Lens | Evidence and verdict | Required edit |
| --- | --- | --- | --- |
| — | Performance | Static generation only, no client state or runtime fetch; repeated catalog reads are bounded build-time file reads already used by the site. P0=0/P1=0. | None |
| — | Stability | Native `<details>`, render-nothing catalog fallback, explicit desktop/mobile fixtures, and Starlight drift guard cover lifecycle and integration failure. P0=0/P1=0. | None |
| — | Security | `releaseRef` is catalog/schema validated and URL-encoded; no HTML injection, secret, auth, or external runtime request is added. P0=0/P1=0. | None |
| — | Operator/Ops | No migration or deploy; task-level rollback/rerun points and local-only side-effect boundary are explicit. P0=0/P1=0. | None |
| P1 fixed | Developer/API | Initial RED instructions attempted to read/copy missing component files directly, which could produce an error instead of an assertion failure. | Missing components now read as empty and optional fixture copies ignore only `ENOENT`; all other failures propagate. |
| — | User/caller | Desktop/mobile parity, Korean/English copy, no-JS anchors, 44px targets, non-manual isolation, and truthful release wording map to explicit tests. P0=0/P1=0. | None |
| — | Integration | Every acceptance criterion maps to an ordered task and command; no task depends on later code; irrelevant concurrency/backend/KDoc/README/module hazards have evidence-backed N/A. Latest P0=0/P1=0. | None |
