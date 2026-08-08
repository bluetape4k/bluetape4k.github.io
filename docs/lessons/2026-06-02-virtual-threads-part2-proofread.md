# Virtual Threads 2편 교정

## 배경

시간순 교정 스택은 Part 1 PR 이후
`virtual-threads-part2-workshop-rules`로 이동했다.

## 결정

규칙 중심의 article 구조와 code example은 그대로 유지한다. 한국어 frontmatter와
한국어 series link를 개선하고, technical article에 비해 지나치게 느슨했던 표현을
몇 곳 다듬었다. 영어 표현은 다소 간접적이었던 부분만 작게 수정했다.

## 결과

한국어 게시글은 한국어 metadata와 `/ko/blog/...` series route를 사용하며, 실전
규칙·semaphore·context 처리에 관한 표현도 더 명확해졌다. 영문 게시글은 같은
주장을 유지하면서 더 직접적인 문장으로 정리했다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 지침

workshop-rule 게시글을 교정할 때는 example과 rule name을 안정적으로 유지한다.
article 구조를 바꾸기보다 주변 해설을 개발자가 쉽게 읽도록 만드는 데서 가장 큰
가치가 나온다.
