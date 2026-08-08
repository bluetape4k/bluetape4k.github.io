# 2026-06-02 Projects Part 6 교정

## 배경

`bluetape4k-projects` Part 6 blog 글이 Part 5 교정 PR 뒤에 Projects series를 마무리했다.

## 결정

Spring Boot 4와 Ktor 3 application boundary 비교를 유지하되 두 locale에서 framework boundary, observability ownership, resilience metric, wiring order를 더 직접적으로 표현한다.

## 결과

bilingual 글의 산만한 metaphor를 줄이고 Spring Boot 4가 Jackson 2에 남는 이유, Ktor observability가 exporter를 조용히 소유하지 않는 이유, cancellation을 resilience failure로 세면 안 되는 이유를 명확히 했다.

## 검증

- `git diff --check`
- `npm run build`
