# Manual entry navigation and repository capability design

## Goal

Make the manual sidebar behave like one documentation portal: a reader can
expand any repository and immediately see its complete latest manual tree. The
first page of every repository manual must also explain what the library
provides before asking the reader to choose a module or follow a learning path.

## Approved direction

- Rename `Projects docs` / `Projects 문서` to `Bluetape4k docs` /
  `Bluetape4k 문서` in user-facing navigation.
- Keep `bluetape4k-projects` as the repository identity in routes, provenance,
  source links, and version catalogs.
- Keep all repository groups visible and collapsed except the current one.
- Build the complete latest-version tree for every non-current repository.
  Expanding `Leader docs`, for example, must reveal Manual Home, Getting
  Started, Architecture, Guides, Core, Backends, Frameworks, Modules, and
  Benchmarks without navigating to the Leader home first.
- Keep nested section groups collapsible. “Complete tree” means that all
  first-level sections are immediately available after expanding a repository;
  it does not mean that hundreds of module links are initially open.
- Keep previous, Home, and next navigation scoped to the current repository,
  selected version, and locale.

## Manual home contract

`docs/manual/{en,ko}/index.md` remains the source of truth in each library
repository. Every current manual home must contain these reader-facing units:

1. a direct statement of the problem the repository solves;
2. a scannable `Core capabilities` / `핵심 기능` section;
3. a path from each capability to the relevant guide, architecture page,
   module, or runnable example;
4. a `Where to start` / `어디서 시작할까` section that leads to the minimal
   setup and learning path;
5. the release boundary and cross-repository responsibility boundary already
   required by the versioned manual model.

The capability section is repository-specific:

| Repository | Capabilities exposed on Home |
| --- | --- |
| bluetape4k-projects | Kotlin foundation, coroutines and execution, data access, infrastructure, web frameworks, testing and utilities |
| bluetape4k-exposed | JDBC/R2DBC repositories, transaction boundaries, cache, database adapters, serialization/encryption, Spring Boot/Ktor |
| bluetape4k-aws | Java/Kotlin SDK ergonomics, coroutine adapters, service helpers, Spring Boot/Ktor integration, database configuration, testing/operations |
| bluetape4k-leader | single/group/strategic election, blocking/async/virtual-thread/coroutine execution, lease lifecycle, distributed backends, framework integration, observability |
| bluetape4k-image | immutable image processing, codec/analysis, barcode/CAPTCHA/OCR, libvips JNI/FFM, Ktor/Spring Boot, storage/CDN |
| bluetape4k-graph | common graph model, sync/coroutine APIs, five backends, schema/transactions/traversal, graph I/O, framework integration |
| bluetape4k-javers | audit snapshots/diffs, DDD aggregate history, Exposed persistence, Redis/Kafka projections, failure/observability, runnable comparison material |
| bluetape4k-text | Korean/Japanese tokenization, language detection, dictionary filtering, Aho-Corasick search, input safety, startup/memory operations |

Korean is authored as natural Korean technical prose. English follows the same
information architecture and technical claims without literal translation.

## Publication model

Each repository manual remains canonical under its own `docs/manual/` tree.
After the source repository commits are fixed, the website publisher snapshots
those exact source commits into the corresponding minor-version routes. The
site must not become a second hand-edited source for the same manual bodies.

## Validation

- Pure navigation tests prove every repository owns a complete tree even when
  it is not current, while only the current repository is initially expanded.
- Tests prove non-current repositories use their latest minor version and the
  current repository still uses the selected archived/current version.
- Registry and global navigation labels use `Bluetape4k docs` /
  `Bluetape4k 문서` consistently.
- Each source repository runs its lightweight manual validator and manifest
  check; no Gradle/JVM module test is required for Markdown-only changes.
- The site runs the focused navigation tests, the complete Node test suite,
  snapshot validation, and a production build.
- English/Korean Home pages have matching capability sets and valid internal
  links.

## Exclusions

- No library source, public API, dependency, release tag, or manual version
  change.
- No diagram or asset change.
- No automatic expansion of every nested module group.
- No workshop or dependency-repository manual addition.
- No change to version selector behavior or repository provenance.

