# 다이어그램 skill 동기화

## 배경

`bluetape4k-diagram`이 README 다이어그램 생성 규칙의 단일 실행 표면이 된 뒤 workspace README diagram guide를 갱신했다.

## 결정

canonical guide와 Codex/Claude `bluetape4k-diagram` skill을 동기화한다. 다이어그램 가이드 변경에는 skill 변경을 포함하고, workspace 전체 skill 동작 변경에는 가이드 변경을 포함한다.

## 결과

이제 가이드는 README architecture, sequence, class/UML, ERD, flow, topology, Mermaid/ASCII conversion, benchmark chart image에 `$bluetape4k-diagram`을 사용하도록 agent에게 안내한다.

## 검증

- `git diff --check`

## 향후 agent

관련 없는 bluetape4k skill에 상세한 다이어그램 규칙을 중복하지 않는다. `bluetape4k-diagram`과 가이드를 함께 갱신한다.
