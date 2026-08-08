# Virtual Threads Part 2 교정

## 배경

시간순 교정 stack이 Part 1 PR 뒤 `virtual-threads-part2-workshop-rules`로 이동했다.

## 결정

rule 중심 글 구조와 code example은 유지한다. Korean frontmatter, 한국어 series link, technical article에 너무 느슨했던 일부 표현을 개선한다. 영어는 표현이 약간 간접적이었던 부분만 작게 수정한다.

## 결과

한국어 글이 한국어 metadata, `/ko/blog/...` series route, practical rule·semaphore·context handling을 더 명확히 표현한다. 영어 글은 같은 주장을 더 직접적인 문장으로 유지한다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 가이드

workshop-rule 글에서는 예제와 rule 이름을 안정적으로 유지한다. 대부분의 가치는 글을 재구성하는 데 있지 않고 개발자가 주변 해석을 더 쉽게 읽게 만드는 데 있다.
