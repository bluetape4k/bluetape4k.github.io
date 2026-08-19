# AGENTS.md - bluetape4k.github.io

## Guidance hierarchy

Before applying this repository overlay, read and follow the guidance in this
order:

1. User scope: `${CODEX_HOME:-$HOME/.codex}/AGENTS.md`.
2. Workspace scope: `/Users/debop/work/bluetape4k/.github/docs/workspace/AGENTS.md`.

Apply both broader scopes before repository-specific rules.

This repository inherits the workspace guidance from `../AGENTS.md`.
Read and follow the workspace root guide first. This file only adds
repo-specific layout, commands, domain rules, and local exceptions.


Astro/Starlight site for bluetape4k public documentation and blog posts.

## Scope

This file governs every file in this repository.

## Blog Workflow

- Use `bluetape-writer` for blog writing, review, localization, and publishing.
- Use `bluetape-diagram` whenever hero figures, diagrams, charts, benchmark visuals, or rendered visual QA are touched.
- For Korean blog prose that reads translated, generic, or LLM-like, use `$humanize-korean` only after technical facts, code links, metrics, and intended meaning are stable.
- Reject or manually repair any humanization result that changes facts, claims, dates, numbers, source links, identifiers, API names, configuration keys, commands, or user-preferred wording.
- Korean posts live under `src/content/docs/ko/blog/`; English posts live under `src/content/docs/blog/`.
- Keep bilingual series in locale parity unless the user explicitly scopes the work to one locale.

### Blog issue ownership and PR linkage

- Create the delivery issue for every blog article in `bluetape4k/bluetape4k.github.io`.
- Keep an issue in a source repository such as `clinic-appointment` as domain evidence or implementation scope; link it from the site delivery issue and the site PR, but do not use it as the blog delivery tracker.
- Before drafting or opening a PR, search this repository for an existing issue with the same article title or route. Reuse one issue instead of creating a duplicate; assign the issue to `debop` and preserve the applicable milestone and labels.
- The site issue must link the source issue, its parent Epic when applicable, and the article PR. The PR body must include `Closes #<site-issue-number>` before merge; a cross-repository reference does not replace the same-repository closure link.
- After merge and deployment are verified, read back the PR and site issue, then close the site issue. Leave the source issue open or closed according to the source repository's domain scope.
- New blog work must follow this ownership rule even when the first implementation discussion started in another repository.

## Content Rules

- Public contributor-facing artifacts, PR bodies, commit messages, and release-style notes stay in English.
- Korean blog posts should be natural Korean technical writing, not literal English translation.
- Preserve existing frontmatter shape, hero placement, post meta, figure style, source-link style, and bottom series navigation.
- Generated diagram labels/assets should stay English unless the user explicitly asks otherwise.
- Use absolute `/assets/...` URLs for published static assets.
- Do not edit `docs/drafts` unless the user explicitly asks; assistant-authored publishable posts belong in `src/content/docs/blog` and `src/content/docs/ko/blog`.

## Validation

For content-only blog edits:

1. Run `git diff --check`.
2. Run `npm run build` when frontmatter, links, assets, components, routing, or MDX structure changed.
3. For prose-only edits, at minimum run `npm run build` unless the change is extremely small and the validation gap is reported.
4. Check changed routes when publishing, merging, or touching links/assets.
