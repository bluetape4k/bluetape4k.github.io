# Manual top-level navigation design

## Goal

Promote the published manuals from a single Projects link inside Ecosystem to
a first-class site destination between Ecosystem and Blog. Readers must be able
to discover the manual collection before choosing a repository, while every
repository manual keeps its existing versioned tree and reading controls.

## Approved direction

The global information architecture becomes:

1. Start / 시작
2. Ecosystem / 생태계
3. Manuals / 매뉴얼
4. Blog / 블로그

Remove the current `Bluetape4k Manual` item from Ecosystem. It points only to
`bluetape4k-projects` and no longer represents the eight published repository
manuals.

Use `Manuals` in English because the collection contains multiple repository
manuals. Use the natural Korean label `매뉴얼`; the site title already provides
the Bluetape4k context, so repeating the brand in the section label is
unnecessary.

## Global manual home

Add locale-aware collection pages at:

- `/manual/`
- `/ko/manual/`

The collection home is the first item in the new top-level section and is the
canonical entry point for readers who have not chosen a repository. It must:

- explain the difference between Ecosystem, Manuals, and Blog;
- list every published repository from `src/data/manual/repositories.json` in
  registry order;
- show the repository's localized documentation label and latest minor
  version;
- link to the repository's existing unversioned latest-stable route;
- offer a short task-oriented guide so readers can choose a manual by purpose,
  not only by repository name;
- avoid copying module lists or repository-manual bodies that already have a
  canonical source.

The task-oriented guide uses the existing responsibility boundaries:

| Reader goal | Primary manual |
| --- | --- |
| Kotlin foundations, coroutines, data access, infrastructure, web, and testing | Bluetape4k |
| Exposed JDBC/R2DBC repositories and database adapters | Exposed |
| AWS SDK ergonomics and service integration | AWS |
| Distributed leader election, leases, and schedulers | Leader |
| Image processing, codecs, analysis, OCR, and framework integration | Image |
| Graph models, backends, traversal, and graph I/O | Graph |
| Audit history, diffs, snapshots, and projections | Javers |
| Tokenization, language detection, dictionaries, and text search | Text |

Korean copy is authored as natural Korean technical prose. English preserves
the same information architecture and claims without requiring literal
sentence-by-sentence translation.

## Global sidebar contract

On non-manual pages, the static Starlight sidebar shows this structure:

```text
Start
Ecosystem
  Repositories
  Ecosystem Atlas
  Examples
  Version Governance
Manuals
  Manual Home
  Bluetape4k docs
  Exposed docs
  AWS docs
  Leader docs
  Image docs
  Graph docs
  Javers docs
  Text docs
Blog
```

Generate the repository entries from `src/data/manual/repositories.json`
instead of maintaining a second hard-coded repository list. Each entry targets
the repository's existing unversioned route, which continues to resolve to its
latest stable minor version.

On a validated repository-manual route, the existing route middleware remains
authoritative. It replaces the global sidebar with the complete eight-repository
manual tree, expands the current repository, derives the selected version's
document hierarchy, and supplies Home, previous, and next navigation. This
change must not introduce another manual navigation model.

## Component and data boundaries

- `src/data/manual/repositories.json` remains the source of truth for published
  repositories, labels, latest minor versions, and localized routes.
- `astro.config.mjs` derives the new static Manuals section from the registry
  and removes the obsolete Projects-only item from Ecosystem.
- A small manual-directory component renders the shared repository collection
  and task guide for both locale pages.
- `src/starlightRouteData.ts` and `scripts/manual/lib/navigation.mjs` keep their
  current repository-manual behavior unless an integration test exposes a real
  incompatibility.
- Existing redirects, version selectors, release provenance, and generated
  versioned manual pages remain unchanged.

## Failure behavior

Navigation generation is a build contract:

- an empty repository registry fails validation instead of rendering an empty
  Manuals section;
- duplicate repository slugs or routes remain registry validation errors;
- a repository without localized labels, latest minor metadata, or routes does
  not receive a partial card or sidebar item;
- the manual home does not hard-code current release versions, so a registry
  update cannot leave stale visible versions behind;
- the build fails if either locale omits a registered repository.

## Testing and validation

1. Add a focused navigation test proving the top-level order is Start,
   Ecosystem, Manuals, Blog in both locales.
2. Prove Ecosystem no longer contains the Projects-only manual link.
3. Prove Manuals contains Manual Home plus all eight registry repositories in
   registry order with localized labels and unversioned routes.
4. Prove both manual-home pages render every repository and current latest
   minor from the registry.
5. Prove representative manual routes still receive the existing dynamic
   repository tree, version selector, and Home/previous/next navigation.
6. Run the focused tests, complete Node test suite, manual snapshot validation,
   and production Astro build.
7. Perform desktop and narrow-width visual QA on the English and Korean manual
   homes, checking card wrapping, long labels, focus states, and sidebar order.

## Scope exclusions

- No repository-manual body rewrite.
- No change to minor-version snapshots, release provenance, redirects, or
  latest-stable resolution.
- No change to the internal manual tree, version selector, or pagination model.
- No new manual repository, workshop manual, or dependencies manual.
- No redesign of Ecosystem Atlas or Blog.
- No new runtime or build dependency.

## Success criteria

- Manuals is visibly equal in hierarchy to Ecosystem and Blog.
- A reader can open one collection home and choose any of the eight manuals.
- No global navigation item implies that Projects is the only manual.
- Repository names, versions, and routes come from the existing registry.
- Entering a repository manual preserves the complete version-aware manual
  navigation already deployed.
