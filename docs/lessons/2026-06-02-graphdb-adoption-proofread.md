# GraphDB 도입 교정

## 배경

시간순 blog proofreading stack이 benchmark 기반 도입 note `when-to-adopt-graphdb`까지 진행됐다.

## 결정

benchmark 수치, 표 구조, code example, link, 좁은 도입 결론을 유지한다. translationese, 일반적인 표현, 어색한 기술 용어를 줄이는 경우에만 한국어·영어 prose를 개선한다.

## 결과

한국어 글이 도입 tradeoff를 더 자연스러운 개발자 대상 prose로 설명한다. 영어 글은 같은 benchmark argument를 유지하면서 딱딱한 표현과 길게 끊기지 않는 문장을 줄였다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 가이드

benchmark 기반 글은 측정값과 caveat를 모두 유지한다. 자연스러움 교정은 decision rule을 명확하게 하되 benchmark 근거보다 주장을 강하게 만들어서는 안 된다.
