# Part 1 생태계 개요 초안

## 배경

Bluetape4k 소개 시리즈의 첫 초안 글을 준비했다. 사용자는 `docs/drafts`를 자신의 원본 가이드와 향후 글 개요에 사용하고, 생성된 본문은 `docs/blog` 아래에 두기로 명확히 했다.

## 결정

기존 README 다이어그램 자산을 재사용하고 새 다이어그램은 생성하지 않는다. 사이트 로컬 생태계 개요/모듈 차트 이미지는 상대 경로로 참조하고, 저장소별 아키텍처 다이어그램은 `develop` 브랜치의 GitHub raw URL로 참조한다.

## 결과

`docs/blog/introduction-bluetape4k-part1-ecosystem.md`는 Application, Domain Capability, Data, Infrastructure, Foundation 계층으로 생태계를 설명한다. 사이트에는 로컬 초안 미리보기 workflow도 있다. `npm run dev:draft`가 `docs/blog`를 무시되는 Starlight 초안 콘텐츠로 동기화하고, publish build는 빌드 전에 생성된 초안 페이지를 정리한다.

## 검증

`docs/drafts/introduction-bluetape4k-part1-ecosystem.md`를 `HEAD`에서 복원했다. `npm run build:draft`가 `astro check` 0 errors, 0 warnings으로 통과했다. 미리보기 페이지는 `docs/blog`에서 생성됐고, AWS는 Infrastructure 아래에 나타나며, Exposed는 Data 아래에 나타난다. 저장소 수준 아키텍처 이미지는 Part 1에서 제외됐다.

이후 두 개의 개요 다이어그램을 `docs/images/readme-diagrams/` 아래 SVG/PNG 쌍으로 추가했다. 이름은 `bluetape4k-layer-components-01`과 `bluetape4k-layer-flow-01`이다. 개요 표는 가독성을 높이기 위해 `12%`, `38%`, `50%`의 명시적인 열 너비를 사용한다.

## 향후 가이드

후속 편을 추가할 때는 개요 페이지를 가볍게 유지하고, 깊은 사용 예제는 저장소별 후속 글로 옮긴다.
