# Cache Part 3 교정

## 배경

다음 stacked proofreading PR은 Near Cache + Exposed strategy 글을 다뤘다.

## 결정

cache strategy 이름, code snippet, source link, benchmark 값, cache-aside 구분을 유지한다. consistency, failure behavior, 글의 hero framing 주변 표현만 제한적으로 수정한다.

## 결과

한국어와 영어 글이 performance/consistency 관계를 더 자연스럽게 표현하고, strategy semantics를 바꾸지 않으면서 consistency target row를 명확하게 보여준다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 가이드

Exposed cache strategy 글에서 read-through, write-through, write-behind, cache-aside를 섞지 않는다. 교정은 이 경계를 정확히 유지하면서 가독성을 높여야 한다.
