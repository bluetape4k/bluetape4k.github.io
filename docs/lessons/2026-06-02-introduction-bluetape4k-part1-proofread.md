# 2026-06-02 Bluetape4k Introduction Part 1 교정

## 배경

생태계 소개 글에는 bilingual route와 유용한 layer 구조가 있었지만 module list 주변 문장이 거친 fragment로 남아 있었다.

## 결정

원래 route, date, hero asset, layer model, 대표 module coverage를 보존하면서 두 locale file을 완전한 개발자 대상 글로 다시 쓴다.

## 결과

한국어·영어 생태계 개요를 Application, Domain Capability, Data, Infrastructure, Foundation 구조로 통일했다. module guide를 짧게 줄이지 않고 넓고 지도 같은 글로 유지했다.

## 검증

PR을 merge하기 전에 `git diff --check`, `npm run build`, GitHub Pages Build를 실행한다.

## 다음 가이드

생태계 개요 글에서는 module coverage를 유지하고 더 명확한 grouping으로 가독성을 높인다. naturalness를 이유로 중요한 module-map 내용을 삭제하지 않는다.
