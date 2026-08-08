# 다이어그램 생성 가이드 통합

## 배경

README 다이어그램 생성 규칙은 샘플 문서, review feedback, 저장소별 lesson을 거치며 커졌고, 최근에는 sequence geometry와 ASCII 다이어그램 변환 규칙도 추가되어 하나의 지속 가능한 위치가 필요했다.

## 결정

처음에는 `docs/readme-diagram-samples/DIAGRAM_GENERATION_GUIDE.md`를 canonical workspace guide로 삼았다. 이후 조직 전체 가이드는 `.github/docs/workspace/DIAGRAM_GENERATION_GUIDE.md`에 있어야 하고 `docs/readme-diagram-samples/README.md`는 sample index로 남아야 하므로 이 결정을 대체했다.

## 결과

가이드가 output contract, source priority, README 배치, 공용 visual language, architecture/component/class/sequence/ERD 규칙, ASCII diagram conversion, benchmark chart 처리, 승인된 샘플, 검증을 통합한다.

## 검증

- 가이드와 sample README 내용을 확인했다.
- 로컬 Markdown link가 해석되는지 검증했다.
- `git diff --check`를 실행했다.

## 향후 규칙

새 다이어그램 생성 결정을 먼저 `.github/docs/workspace/DIAGRAM_GENERATION_GUIDE.md`에 추가한다. 웹사이트 sample 문서는 조직 전체 정책이 아니라 시각적 예제에 사용한다.
