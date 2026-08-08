# Leader Part 3 블로그 초안

## 배경

Issue #41은 `LeaderGroupElector`와 strategic election을 다루는 `bluetape4k-leader` blog series Part 3을 요청했다.

## 결정

- Part 1과 Part 2에 이미 한국어·영어 route parity가 있으므로 글을 bilingual로 유지한다.
- 모든 blog asset에는 `public/assets`를 사용하고 절대 경로 `/assets/...`로 참조한다.
- hero는 diagram이 아닌 bitmap 3D workbench image로 만든다.
- 설명 diagram 두 개에는 Graphviz `.dot`, `.plain`, sketch artifact를 최종 SVG/PNG asset 옆에 둔다.

## 결과

Part 3 한국어·영어 글을 추가하고 Part 1/2 series navigation을 새 route에 연결했으며 hero와 group/strategic election diagram을 추가했다.

## 검증

- `git diff --check`
- `npm run build`
- `/ko/blog/bluetape4k-leader-part3-group-strategic-election/` 및 `/blog/bluetape4k-leader-part3-group-strategic-election/` static preview route 확인
- 두 diagram asset의 rendered PNG 검사 및 한국어 route browser screenshot

## 향후 규칙

후속 Leader series 글은 열린 GitHub issue에서 범위를 도출하고, bilingual route parity와 이전 series link 갱신을 같은 변경에 포함한다.
