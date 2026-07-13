# Ignite-style manual version navigation design

## Goal

Make the selected `bluetape4k-projects` manual version a persistent navigation
context, following the Apache Ignite documentation model: users switch minor
manual versions from the global documentation header instead of from a cluster
of page-title pills.

## Approved direction

- On versioned `bluetape4k-projects` manual routes, show `Manual 1.11` or
  `매뉴얼 1.11` beside the language selector in the desktop header.
- Render the same version selector in the mobile menu preference area so the
  control is never lost when the desktop right group is hidden.
- Hide the selector on blog, ecosystem, and other non-versioned routes.
- Keep the route contract minor-versioned, for example
  `/ko/manual/bluetape4k-projects/1.11/...`.
- Show the exact patch release inside each version option and link its public
  provenance to the GitHub release or tag page.
- Remove layer, group, version, and source pills from the page-title area.
- Keep one quiet provenance line under the title: current channel plus exact
  patch release, localized in English and Korean.

## Information model

The selector distinguishes two related values:

- `minorVersion` such as `1.11` is the documentation navigation version and URL
  segment.
- `releaseRef` such as `1.11.0` is the exact published library release used as
  the manual's runtime/source baseline.

The existing version catalog remains the source of truth for both values,
available versions, stable/archive state, and per-locale document membership.
No component maintains an independent hard-coded version list.

## Component design

### `ManualVersionSelector.astro`

Keep the existing no-JavaScript `<details>` navigation and
`selectorTarget(...)` fallback behavior. Extend its presentation contract with
a placement prop:

- `header`: compact trigger suitable for the desktop header.
- `mobile`: full-width trigger suitable for the mobile menu footer.

The component receives the current Starlight entry and locale, reads the
catalog, validates the route, and renders nothing when the current page is not a
versioned manual route or the catalog/document membership is unavailable.

Each menu item contains:

- minor version;
- localized stable/archive state;
- exact `releaseRef`;
- the current-page marker via `aria-current="page"`.

The menu footer links to
`https://github.com/bluetape4k/bluetape4k-projects/releases/tag/{releaseRef}`.
This is public release provenance, not a claim that the manual Markdown exists
at that tag.

### `ManualHeader.astro`

Copy the installed Starlight 0.39.2 header structure narrowly, preserving its
site title, search, social, theme, and language virtual components. Insert the
manual version selector after the language selector in the desktop right group.
Do not change the header on routes where the selector renders nothing.

### `ManualMobileMenuFooter.astro`

Copy the installed Starlight 0.39.2 mobile footer structure narrowly. When the
route is a versioned manual, render a full-width selector row above the existing
social/theme/language preferences. Preserve the default footer on every other
route.

### `ManualPageTitle.astro`

Continue wrapping Starlight's default page title. For versioned manuals, replace
the existing pill collection with a quiet localized provenance line:

- Korean: `최신 안정판 · 릴리스 1.11.0 기준`
- English: `Latest stable · Based on release 1.11.0`

Archived pages use `보존 버전` / `Archived`. The exact release text links to
the public GitHub release/tag page. Do not render a document-source link until a
public commit or ref is proven to contain that document path.

## Interaction and accessibility

- Version switching works without client JavaScript because every target is a
  normal anchor.
- The `<summary>` has a localized accessible name including the current minor
  version.
- Current menu items expose `aria-current="page"`.
- Header and mobile triggers keep a minimum 44px touch target.
- Focus-visible, forced-color, reduced-width/zoom wrapping, and print behavior
  remain explicit in `manual.css`.
- The open menu aligns to the trigger and stays inside the viewport.
- Native `<details>` supplies keyboard toggle and escape-free progressive
  enhancement; no custom focus trap or client state is introduced.

## Responsive behavior

- Desktop (`min-width: 50rem`): selector is in the header right group beside
  the language selector.
- Mobile: the desktop right group remains hidden by Starlight; the selector is
  rendered in the mobile menu footer as a full-width row.
- Print: both selectors are hidden; the quiet release provenance remains plain
  text/link content.

## Localization

All user-facing selector, state, provenance, and accessible-label strings have
English and Korean variants. Korean copy is written as natural technical
Korean rather than as a literal translation.

## Testing strategy

1. Source-contract tests prove both Starlight overrides are registered and the
   selector is mounted after language selection on desktop and in mobile menu
   preferences.
2. Fixture builds prove:
   - versioned English and Korean manuals render both selector placements;
   - non-manual routes render neither selector;
   - version targets keep their existing document-specific fallback behavior;
   - the title shows release provenance and no `Source`/`소스` document link.
3. Style-contract tests cover focus, touch size, forced colors, responsive menu
   layout, and print hiding.
4. The full Node suite and production Astro build guard existing redirects,
   Pagefind behavior, generated content, and site integration.
5. Representative local routes are checked at desktop and mobile widths after
   the build. This visual QA is limited to the approved manual route plus one
   non-manual route to prove selector scoping.

## Scope exclusions

- No new dependency or JavaScript navigation state.
- No version backfill before `1.11`.
- No publishing, commit, push, PR, merge, or deployment.
- No blog, ecosystem atlas, sidebar taxonomy, or manual body rewrite.
- No public `문서 원본` / `Document source` link until the corresponding manual
  source is actually available at a public GitHub ref.

## Risks and mitigations

- **Starlight override drift:** keep copies close to installed 0.39.2 components
  and pin their expected integration in tests.
- **Mobile-only disappearance:** override `MobileMenuFooter` as well as `Header`.
- **Locale route mismatch:** reuse `selectorTarget(...)` and existing catalog
  membership instead of constructing URLs independently.
- **False provenance:** link the exact `releaseRef` to a release/tag page and
  avoid claiming the manual Markdown lives at that ref.
- **Dirty-worktree overlap:** restrict edits to the named components, style,
  Starlight component mapping, and focused UI tests.

## Acceptance criteria

- A versioned Korean manual displays `매뉴얼 1.11` in desktop navigation and a
  corresponding selector in the mobile menu.
- The equivalent English route displays `Manual 1.11`.
- Blog and ecosystem routes do not display manual version navigation.
- The page title has no `Build`, group, overview/version pills, or broken source
  link.
- Exact patch release provenance is visible and links to a public GitHub
  release/tag page.
- Version navigation remains document-aware, localized, accessible, and usable
  without JavaScript.
- Focused tests, the full suite, and the production build pass.
