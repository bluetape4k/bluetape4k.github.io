# 2026-06-02 Exposed Part 4 교정

## 배경

Exposed Part 3이 merge된 뒤 다음 글은 JSON column, Tink encrypted column, measured column, PostgreSQL/MySQL8 spatial support, analytics database dialect를 다루는 한국어 전용 Part 4였다.

## 결정

boundary 중심 메시지를 유지하고 자연스러움만 작게 다듬는다. 동일한 code example, dialect link, visual asset, locale-local series link를 가진 영어 대응 글을 추가한다.

## 결과

영어 Part 4 글을 추가하고 영어 Part 3 series link에 Part 4를 포함했으며 source claim을 바꾸지 않고 한국어 Part 4를 가볍게 교정했다.

## 검증

`git diff --check`와 `npm run build`를 실행한 뒤 PR을 연다.
