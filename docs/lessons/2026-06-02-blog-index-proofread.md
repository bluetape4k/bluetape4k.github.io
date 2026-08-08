# 2026-06-02 블로그 색인 교정

## 맥락

게시된 모든 블로그 글 쌍을 교정한 뒤 남은 블로그 콘텐츠 표면은 locale별 블로그 색인 페이지였다.

## 결정

페이지는 간결하게 유지하고 한국어와 영어 description 및 section heading만 다듬는다.

## 결과

기존 `BlogPostList` component와 route를 보존하면서 두 블로그 색인 페이지를 업데이트했다.

## 검증

PR을 merge하기 전에 `git diff --check`, `npm run build`, GitHub Pages Build를 실행한다.

## 다음 guidance

글 목록을 모두 처리했다면 두 번째 교정 pass를 시작하기 전에 그 사실을 명시한다.
