# 2026-06-02 blog index proofreading

## Context

After proofreading all published blog article pairs, the remaining blog content surface was the locale-specific blog index page.

## Decision

Keep the page minimal and only refine the Korean and English descriptions and section headings.

## Outcome

Updated both blog index pages while preserving the existing `BlogPostList` components and routes.

## Verification

Run `git diff --check`, `npm run build`, and GitHub Pages Build before merging the PR.

## Next guidance

If the article queue is exhausted, say so explicitly before starting a second proofreading pass.
