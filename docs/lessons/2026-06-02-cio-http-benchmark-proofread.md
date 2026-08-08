# CIO HTTP benchmark 교정

## 배경

시간순 blog proofreading stack이 Ktor CIO, Vert.x pooling, 공정한 fixture를 다루는 io/http benchmark note `when-cio-made-http-benchmarks-weird`까지 진행됐다.

## 결정

benchmark 값, issue와 PR link, 표, 측정에 따른 선택 가이드를 유지한다. 글에 이미 분명한 narrative와 구체적인 근거가 있으므로 가벼운 prose pass만 적용한다.

## 결과

실용적인 benchmark story는 유지하면서 주변 문장보다 덜 자연스럽던 한국어·영어 표현을 일부 다듬었다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 가이드

narrative benchmark 글의 story를 제거하지 않는다. lesson을 measurement 근거에 묶고 기술적 요점을 흐리는 표현만 다듬는다.
