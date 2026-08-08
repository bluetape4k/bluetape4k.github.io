# README 다이어그램 스타일 피드백

## 배경

workspace README diagram guide에 `exposed-r2dbc-workshop` chapter 10, 11, 12 다이어그램을 비교한 디자인 피드백을 반영해야 했다.

## 결정

Architecture diagram에는 chapter 12 스타일의 component panel 구성을 우선하되 chapter 10/11의 `Architects Daughter` typography를 유지한다. 기본값은 채워진 삼각형 arrow marker로 두고, 기존 chapter 12 sample보다 작게 설정한다.

## 결과

`docs/readme-diagram-samples/README.md`에 panel composition, 더 작은 삼각형 arrow marker, architecture/flow diagram typography 규칙이 문서화됐다.

## 검증

- `git diff --check`를 실행했다.

## 향후 가이드

README architecture image를 갱신할 때는 panel composition에서 시작한 뒤 PNG asset을 렌더링하기 전에 arrow size와 font hierarchy를 조정한다.
