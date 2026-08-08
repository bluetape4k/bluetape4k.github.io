# 2026-06-02 Exposed Part 3 교정

## 배경

Exposed Part 2가 merge된 뒤 다음 글은 R2DBC, Coroutines, Virtual Threads를 다루는 한국어 전용 Part 3이었다.

## 결정

workload-first selection rule을 유지하고 자연스러움만 작게 다듬는다. 동일한 benchmark 수치, execution-model diagram, source link, locale-local series link를 가진 영어 대응 글을 추가한다.

## 결과

영어 Part 3 글을 추가하고 영어 Part 2 series link에 Part 3을 포함했으며 benchmark claim을 바꾸지 않고 한국어 Part 3을 가볍게 교정했다.

## 검증

stacked PR을 열기 전에 `git diff --check`와 `npm run build`를 실행한다.
