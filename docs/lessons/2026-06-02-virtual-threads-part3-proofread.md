# Virtual Threads 3편 교정

## 배경

시간순 교정 스택은 Virtual Threads JDBC/R2DBC benchmark 게시글로 이동했다.

## 결정

모든 benchmark 수치, table, scenario, conclusion을 보존한다. 수정 범위는 한국어
현지화, 한국어 series route, benchmark 범위와 application-facing comparison을
해석하는 문장의 작은 표현 변경으로 제한한다.

## 결과

한국어 게시글은 한국어 metadata와 `/ko/blog/...` series navigation을 사용한다.
benchmark의 의미는 바꾸지 않으면서 여러 한국어 표현을 더 자연스럽게 다듬었다.
영문 게시글은 같은 evidence를 유지하고 조금 더 직접적인 문장을 사용한다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 지침

benchmark 게시글을 교정할 때는 새로운 source evidence가 요구하지 않는 한 수치,
scenario name, conclusion의 강도를 "개선"하지 않는다. 자연스러움을 위한 수정은
문제 제기와 해석을 설명하는 문장 주변에 한정한다.
