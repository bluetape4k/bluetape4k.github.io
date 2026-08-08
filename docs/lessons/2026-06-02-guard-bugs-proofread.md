# Guard bug 교정

## 배경

시간순 blog proofreading stack이 narrative bug-fix retrospective `embarrassing-bugs-that-made-better-guards`까지 진행됐다.

## 결정

다섯 사례 구조, issue link, code snippet, retrospective tone을 유지한다. 한국어 표현이 어색한 곳만 작게 수정하고, 영어 버전은 이미 자연스러우므로 억지로 수정하지 않는다.

## 결과

솔직한 bug-fix narrative를 유지하면서 한국어 글이 더 자연스럽게 읽힌다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 가이드

narrative retrospective 글은 저자의 voice를 유지한다. review에서 의미 있는 문제가 없다면 churn을 만들기 위해 영어를 다시 쓰지 않는다.
