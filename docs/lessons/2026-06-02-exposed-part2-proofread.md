# 2026-06-02 Exposed Part 2 교정

## 배경

Part 1 다음 Exposed blog 항목은 JDBC repository와 SQL DSL을 다루는 한국어 전용 Part 2 글이었다.

## 결정

눈에 보이는 SQL DSL과 얇은 repository helper 사이의 경계를 유지하고 한국어 자연스러움만 작게 다듬는다. 대응하는 예제, source link, series navigation이 있는 영어 글을 추가한다.

## 결과

영어 Part 2 글을 추가하고 영어 Part 1 series link에 Part 2를 포함했으며, 기술 주장을 바꾸지 않고 한국어 Part 2를 가볍게 교정했다.

## 검증

stacked PR을 열기 전에 `git diff --check`와 `npm run build`를 실행한다.
