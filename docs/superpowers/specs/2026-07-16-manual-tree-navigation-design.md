# Repository manual tree navigation design

## Goal

Expose every published repository manual through a persistent left-side tree and
give each manual page trustworthy Home, previous, and next navigation. The
result makes the website feel like one documentation portal while keeping
each repository and manual version as an independent reading scope.

## Approved direction

- Show all eight published repositories as top-level entries in the manual
  sidebar.
- Expand the current repository automatically and keep the other repositories
  collapsed.
- Use Starlight's native hierarchical sidebar instead of introducing a parallel
  navigation component.
- Use every repository label as its native expand/collapse control. Put a
  localized Manual Home link first inside each group; the current repository
  targets the selected version and other repositories target their latest
  version.
- Build the expanded current-repository tree from the selected version. An
  archived route therefore shows the archived version's document membership,
  while the seven non-current repositories still link to their latest manuals.
- Add a three-part navigation row at the end of manual content: previous page,
  repository manual Home, and next page.
- Traverse the complete current repository and version reading order, including
  transitions between sections.
- Keep blog, ecosystem, and other non-manual routes on the existing Starlight
  sidebar and pagination behavior.

## Source of truth

Navigation is generated centrally from existing publication data rather than
copied into Markdown frontmatter:

- `src/data/manual/repositories.json` defines the published repository set and
  current minor version for each repository.
- Each repository's `versions.json` defines available versions, release
  provenance, and stable/archive state.
- The selected version's validated document catalog and generated manual files
  define locale-specific membership and routes.
- Directory and document metadata provide section labels and ordering where
  available. A deterministic fallback handles valid content without explicit
  display metadata.

The implementation must not write `prev`, `next`, or sidebar arrays into the
generated Markdown pages. Those values would duplicate catalog state across
more than one thousand files and introduces drift between releases.

## Navigation model

Introduce a central manual-navigation model that accepts the current route and
Starlight entry, validates the route against the publication catalogs, and
derives:

- locale, repository, selected minor version, and current document;
- the eight-repository sidebar tree;
- current repository and current document state;
- the selected repository/version/locale reading order;
- previous and next destinations;
- the selected repository version's manual Home destination;
- selected-version Home for the current repository and latest-manual Home
  destinations for the other repositories.

The model is the only place that interprets publication membership into a UI
order. Sidebar rendering and pagination consume the same derived order so their
behavior cannot disagree.

## Left-side repository tree

### Repository level

The sidebar displays these published repositories in the registry's deliberate
order:

- bluetape4k-projects
- bluetape4k-exposed
- bluetape4k-aws
- bluetape4k-leader
- bluetape4k-image
- bluetape4k-graph
- bluetape4k-javers
- bluetape4k-text

All repository labels remain visible and use Starlight's native group toggle.
The current repository is expanded and each other repository is collapsed. The
first child in every group is `Manual Home` / `매뉴얼 홈`: it targets the
selected version for the current repository and the latest localized manual for
the others. This keeps navigation and toggle semantics distinct and accessible
while exposing the full ecosystem without expanding every repository tree.

### Current repository level

The current repository tree uses native nested Starlight groups. Its first
entry is `Manual Home` / `매뉴얼 홈`, followed by the sections that exist in
the selected catalog. Canonical groups include:

- Getting Started
- Architecture
- Guides
- Modules
- Examples
- repository-specific areas such as Backends or Frameworks
- Operations
- Quality and Benchmarks

Large areas such as Modules remain collapsible and may contain nested groups.
The tree must not expand hundreds of module pages at once. Only groups needed
to reveal the current page are expanded initially; Starlight continues to own
manual expansion state, keyboard behavior, mobile behavior, current-item
highlighting, and persisted state.

An unfamiliar but valid content directory is not discarded. It becomes a
readable title-cased fallback group at its deterministic position. Invalid or
ambiguous duplicate routes fail validation instead of silently disappearing.

## Reading order and pagination

The selected repository/version/locale tree is flattened depth-first into the
manual reading order. Section overview pages precede their children, and the
last page of one section points to the first page of the next section.

Pagination never crosses a repository, minor version, or locale boundary:

- the first page has no previous destination;
- the last page has no next destination;
- intermediate pages expose both destinations;
- Home is always visible and points to the selected repository version's
  localized manual home;
- archived manuals use their own archived document membership and order.

The content footer uses three stable regions:

- left: localized previous label and destination title;
- center: `Manual Home` / `매뉴얼 홈`;
- right: localized next label and destination title.

On narrow screens the regions stack in reading order without truncating page
titles. When either edge destination is absent, the remaining controls keep a
balanced, understandable layout. The Home control is a normal link and does not
depend on client JavaScript.

## Starlight integration

Apply the manual-navigation model in the existing route-data middleware only
when a route belongs to a validated published manual. For those routes:

- replace route data's sidebar with the derived repository tree;
- set `hasSidebar` consistently;
- replace Starlight pagination data with the derived previous and next entries;
- pass the derived manual Home destination to a narrow pagination override or
  wrapper that preserves Starlight's semantics and visual language.

Do not clone the complete Starlight sidebar component. Supplying native
`SidebarEntry[]` data preserves upstream accessibility and responsive behavior
and limits maintenance to the project's information architecture.

Non-manual routes leave route sidebar and pagination data untouched. Existing
manual header version selection remains independent: the header selects a
version, while the left tree and footer navigate within the selected version.

## Localization and accessibility

- Every visible label and accessible name has natural Korean and English copy.
  Korean wording is edited as Korean technical prose, not translated literally.
- Current repository and page states use Starlight's native semantics and
  `aria-current` behavior.
- Collapsible groups retain native keyboard and focus behavior.
- Home, previous, and next controls remain real links with visible focus styles
  and adequate touch targets.
- Long repository, section, and document titles wrap rather than overflow.
- Desktop, mobile menu, reduced-width zoom, forced-color, and print behavior
  stay compatible with the existing manual styles.

## Validation and failure behavior

Navigation generation is a build contract, not a best-effort enhancement. The
build fails with a route-specific diagnostic when:

- a repository registry entry has no usable latest manual;
- a selected manual route is absent from its version and locale catalog;
- two catalog entries resolve to the same route;
- a derived previous or next destination crosses repository, version, or
  locale boundaries;
- a catalog destination has no generated content entry;
- the current page cannot be placed exactly once in the derived reading order.

Valid unknown section names use the fallback group described above. They do not
fail solely because the section taxonomy has not been customized.

## Testing strategy

1. Model tests prove that all eight repositories appear in registry order, only
   the current repository is expanded, and the current document is selected.
2. Locale tests prove complete English/Korean isolation and natural localized
   labels.
3. Reading-order tests cover first, middle, and last pages plus transitions
   between sections and nested groups.
4. Version tests prove that archived and latest manuals use their own membership
   and that non-current repository Home links target latest manual homes.
5. Validation tests cover missing content, duplicate routes, an unplaceable
   current page, and attempted repository/version/locale boundary crossings.
6. Route integration tests prove that blog and ecosystem sidebar/pagination data
   remains unchanged.
7. Existing Node tests plus the new focused tests and a full production Astro
   build guard generated content, redirects, Pagefind behavior, and component
   integration.
8. Visual QA checks representative bluetape4k-text and large
   bluetape4k-projects manuals at desktop and mobile widths, including long
   labels, collapsed groups, current-page revelation, and the three-part footer.

## Scope exclusions

- No new runtime or build dependency.
- No manual body rewrite and no per-page navigation frontmatter.
- No change to repository source-manual publication or release provenance.
- No workshop/dependencies manual expansion.
- No redesign of blog, ecosystem atlas, global header, or version selector.
- No automatic cross-repository learning-path recommendations in this change;
  those can build on the repository tree in a later iteration.

## Risks and mitigations

- **Very large manuals:** keep section/module groups collapsed and derive the
  tree from validated catalogs instead of rendering a flat list.
- **Sidebar and pagination drift:** derive both from one ordered model and test
  section-boundary traversal.
- **Archived-content drift:** use selected-version membership for the current
  repository rather than the latest catalog.
- **Starlight upgrade drift:** inject native route data and keep component
  overrides narrow instead of copying the sidebar implementation.
- **Hidden publication defects:** fail the build with repository, version,
  locale, and route context rather than omitting invalid entries.
- **Poor Korean copy:** maintain explicit localized labels and include Korean
  visual/content review in the acceptance gate.

## Acceptance criteria

- Every published manual page shows all eight repositories in the left sidebar.
- The current repository and current page are discoverable immediately; other
  repositories remain collapsed and their first child links to the latest
  localized manual home.
- The expanded tree reflects the selected version, including archived versions,
  and large module collections remain navigable rather than flat.
- Previous and next traverse the complete selected manual order without crossing
  repository, version, or locale boundaries.
- Manual Home is always available in the content footer and targets the selected
  version's localized home.
- Blog and ecosystem pages retain their existing navigation.
- English and Korean routes have equivalent structure and natural labels.
- Focused tests, the existing test suite, the production build, and desktop and
  mobile visual QA pass.
