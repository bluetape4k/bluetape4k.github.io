# 2026-05-20 — README 개요 시각화 배치

## 배경

README 다이어그램과 차트는 장식용 생성 자산이 아니라 소스에 근거한 문서로 다뤄야 한다. 이번 작업은 2026 reference 문서와 공용 README 다이어그램 스타일 가이드를 사용했지만, 모듈 이름과 그룹의 기준은 소스 코드와 build layout으로 유지했다.

## 결정

root README용 English-only SVG+PNG README 개요 시각화를 추가하고, 개요 다이어그램을 설치·사용·빌드 안내보다 앞에 배치한다. 사용 예제 뒤에 붙어 있던 Architecture/Diagram 섹션은 위로 옮긴다.

## 결과

`bluetape4k.github.io`에 root README 개요 다이어그램과 모듈 구성 차트가 생겼고, README 시각화 배치는 overview-first 규칙을 따른다. 생성된 label 안에는 localized text를 넣지 않는다.

## 검증

- 생성된 SVG 파일을 `xmllint --noout`으로 파싱했다.
- 생성된 PNG 파일을 `rsvg-convert`로 렌더링했다.
- workspace README image-link scan에서 누락된 로컬 이미지가 0개였다.
- workspace Architecture/Diagram ordering scan에서 Installation, Usage, Examples, Build heading 뒤에 남은 섹션이 0개였다.
- 생성된 root overview SVG text에 non-ASCII 문자가 없었다.

## 향후 참고

README 파일의 끝에 아키텍처 다이어그램을 덧붙이지 않는다. 개요나 아키텍처 다이어그램을 위쪽에 두고, 그 다음에 설명하는 섹션 가까이에 class·sequence·ERD·flow 다이어그램을 배치한다.

root overview diagram과 composition chart는 가능하면 BOM을 먼저, Examples 또는 Additional examples를 마지막에 둔다. 중간 그룹은 저장소별 README가 alphabetic grouping을 요구하지 않는 한 source-backed orientation 순서를 유지한다.
