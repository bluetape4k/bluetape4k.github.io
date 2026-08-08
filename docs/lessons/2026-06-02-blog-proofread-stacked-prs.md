# 블로그 교정 stacked PR 주기

## 배경

시간순 블로그 교정은 bilingual article pair를 하나씩 처리하고, 완료한 pair마다 별도의 PR을 여는 방식으로 이어가야 한다.

## 결정

blog skill의 naturalness checklist를 교정 gate로 사용한다. 목표는 글을 짧게 만드는 것이 아니라 translationese나 일반적인 AI 문체 없이 개발자가 자연스럽게 읽는 한국어와 영어를 만드는 것이다.

앞선 PR이 아직 열려 있으면 후속 교정 branch를 stack하고, 나중에 순서대로 PR을 merge한다.

## 결과

`introduction-bluetape4k-part1-ecosystem`을 두 locale에서 같은 기술 구조를 유지하며 수정했다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 가이드

각 글은 bilingual pair를 교정하고 PR을 만든 뒤 다음 글을 stacked branch에서 이어간다. 사용자가 대기 중인 PR stack의 merge를 요청하기 전에는 stack을 merge하지 않는다.
