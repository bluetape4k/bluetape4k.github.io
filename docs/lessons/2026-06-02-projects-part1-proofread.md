# Projects Part 1 교정

## 배경

교정 stack이 Cache series에서 `bluetape4k-projects` series overview로 이어졌다.

## 결정

module boundary, repository split 기준, source link, series navigation을 유지한다. shared foundation 역할을 더 명확히 표현하고 과도하게 연극적인 metaphor는 피한다.

## 결과

한국어·영어 글이 `projects`를 shared infrastructure로 더 직접적으로 설명하면서 BOM, module adoption, standalone repository boundary에 관한 설명은 유지한다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 가이드

`bluetape4k-projects` overview 글에서는 module ownership을 더 명확하게 만든다. 어떤 capability가 `projects`에 남고 어떤 capability가 독립 저장소에 속하는지 섞지 않는다.
