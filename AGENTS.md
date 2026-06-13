# AGENTS.md - bluetape4k.github.io

This repository inherits the workspace guidance from `../AGENTS.md`.
Read and follow the workspace root guide first. This file only adds
repo-specific layout, commands, domain rules, and local exceptions.


Astro/Starlight site for bluetape4k public documentation and blog posts.

## Scope

This file governs every file in this repository.

## Blog Workflow

- Use `bluetape4k-blog` for blog writing, review, localization, and publishing.
- Use `bluetape4k-diagram` whenever hero figures, diagrams, charts, benchmark visuals, or rendered visual QA are touched.
- For Korean blog prose that reads translated, generic, or LLM-like, use `$humanize-korean` only after technical facts, code links, metrics, and intended meaning are stable.
- Reject or manually repair any humanization result that changes facts, claims, dates, numbers, source links, identifiers, API names, configuration keys, commands, or user-preferred wording.
- Korean posts live under `src/content/docs/ko/blog/`; English posts live under `src/content/docs/blog/`.
- Keep bilingual series in locale parity unless the user explicitly scopes the work to one locale.

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
