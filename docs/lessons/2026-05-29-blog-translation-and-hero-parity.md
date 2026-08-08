# 블로그 번역과 hero parity

## 배경

여러 한국어 우선 글을 게시한 뒤에도 기본 `/blog/...` locale에는 한국어 본문이 남아 있었고 `/ko/blog/...`에는 대응하는 localized file이 없었다. 그 결과 사이트는 한국어 route에서 translation-pending 동작을 보였고, 영어 route도 실제로 영어가 아니었다.

## 결정

- `/blog/...`는 영어/default locale로 유지한다.
- `/ko/blog/...`는 한국어 locale로 유지한다.
- default-locale file을 번역하기 전에 한국어 원본을 `src/content/docs/ko/blog/`에 복사해 보존한다.
- 두 locale의 모든 글에 `bt4k-blog-hero` figure를 추가해 도입 이미지 처리를 AI 협업 글과 맞춘다.
- `docs/blog/*.md`는 default-locale 글을 미러링한다.

## 검증

- `npm run build`
- `git diff --check`
- 최근 영어·한국어 blog route의 local preview를 확인했다. `status=200`, `hero=true`, translation-pending text 없음이었다.

## 향후 guard

한국어 우선 블로그 콘텐츠를 게시할 때는 두 locale file을 한 변경으로 만든다.

- `src/content/docs/blog/{slug}.mdx`: 영어
- `src/content/docs/ko/blog/{slug}.mdx`: 한국어

임시 지름길로 default locale에 한국어 text를 남기지 않는다.
