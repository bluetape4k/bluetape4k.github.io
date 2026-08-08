# 다이어그램 생성 규칙 보강

날짜: 2026-05-24

## 배경

새 `bluetape4k-diagram` skill을 review한 뒤 architecture와 sequence diagram의 기본값을 더 엄격하게 해야 했다.

## 결정

Architecture diagram은 layered architecture, 채워진 삼각형 arrowhead, 직각 orthogonal connector를 기본값으로 사용한다. Sequence diagram은 `alt`, `else`, `opt`와 같은 conditional branch를 명시적으로 렌더링해야 한다. 생성된 다이어그램의 상세 label에는 Comic Mono를 사용하고, localized README는 기본적으로 동일한 English-label diagram asset을 공유한다.

## 결과

canonical guide와 Codex/Claude `bluetape4k-diagram` skill이 asset naming, README embed, rendering tool, validation command 안내를 포함한 동일한 실행 규칙을 갖게 됐다.

## 검증

- `git diff --check`
- Codex/Claude `bluetape4k-diagram` skill 복사본의 YAML frontmatter parse

## 향후 agent

이미지 자체에 locale별 domain term이 표시되어야 하는 경우가 아니면 localized diagram variant를 만들지 않는다. README locale 사이에서는 English-label PNG/SVG asset 공유를 우선한다.
