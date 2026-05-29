# Blog translation and hero parity

## Context

After publishing several Korean-first posts, the default `/blog/...` locale still contained
Korean body text while `/ko/blog/...` lacked matching localized files. The site therefore showed
translation-pending behavior on Korean routes and English routes were not actually English.

## Decision

- Keep `/blog/...` as the English/default locale.
- Keep `/ko/blog/...` as the Korean locale.
- Preserve Korean originals by copying them under `src/content/docs/ko/blog/` before translating
  default-locale files.
- Add a `bt4k-blog-hero` figure to every blog post in both locales so the opening image
  treatment matches the AI collaboration posts.
- Keep `docs/blog/*.md` mirrored from default-locale posts.

## Verification

- `npm run build`
- `git diff --check`
- Local preview checks for recent English and Korean blog routes:
  `status=200`, `hero=true`, and no translation-pending text.

## Future Guard

When publishing Korean-first blog content, create both locale files in the same change:

- `src/content/docs/blog/{slug}.mdx` in English.
- `src/content/docs/ko/blog/{slug}.mdx` in Korean.

Do not leave Korean text in the default locale as a temporary shortcut.
