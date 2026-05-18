# 2026-05-18 Official Website

## Context

Created the first official bluetape4k website as a separate `bluetape4k.github.io`
repository.

## Decision

Use Astro + Starlight with GitHub Pages. Keep the website as a curated
introduction and ecosystem hub, while detailed API and module documentation stay
in each source repository.

## Outcome

The site includes a landing page, getting started guide, repository overview,
example index, and dependency governance page. Existing repository workbench
images are reused as visual assets.

## Verification

Run `npm run build` before publishing or updating the site.

## Future Rule

Keep the website focused on onboarding and navigation. Do not duplicate long
README or KDoc content unless it is intentionally curated for first-time users.

## 2026-05-18 Content Expansion

Overview content should show the backend library surface by usage area instead
of presenting a single broad "Backend libraries" bucket. Keep version
governance available as a dedicated page, but do not make it a primary Overview
card unless it is the user's immediate onboarding task.

Architecture diagrams on the Overview page should be label-first and sparse.
Move explanatory prose into adjacent cards or body copy instead of placing long
sentences inside the diagram, especially for mobile and embedded SVG rendering.

Repository pages should represent official library and project-entry
repositories. Put workshop, sample, and reference-application repositories on
the Examples page so readers can distinguish runtime libraries from learning
materials. Exclude demo/profile repositories unless they become explicit
user-facing artifacts.

SEO baseline for the official website should include crawler discovery
(`robots.txt` with the sitemap URL), a 1200x630 PNG Open Graph image, global
Open Graph/Twitter metadata, and JSON-LD for Organization, WebSite, and
SoftwareSourceCode. Verify these in `dist/` after `npm run build` before
publishing.
