# Virtual Threads Part 3 교정

## 배경

시간순 교정 stack이 Virtual Threads JDBC/R2DBC benchmark 글로 이동했다.

## 결정

모든 benchmark 수치, 표, 시나리오, 결론을 유지한다. 한국어 localization, 한국어 series route, benchmark 범위와 application-facing 비교를 해석하는 작은 표현만 수정한다.

## 결과

한국어 글이 한국어 metadata와 `/ko/blog/...` series navigation을 사용한다. benchmark 의미는 바꾸지 않고 여러 한국어 표현을 더 자연스럽게 다듬었다. 영어 글은 같은 근거를 유지하면서 문장을 조금 더 직접적으로 만들었다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 가이드

benchmark 글 교정에서 숫자, 시나리오 이름, 결론의 강도를 임의로 "개선"하지 않는다. 새로운 source 근거가 필요하지 않다면 자연스러움 수정은 framing과 interpretation 주변에 둔다.
