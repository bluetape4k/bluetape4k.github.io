# Exposed Part 4~6 교정 배치 Lessons

## 범위

- `bluetape4k-exposed-part4-json-encryption-dialects`
- `bluetape4k-exposed-part5-spring-cache-multitenancy-production`
- `bluetape4k-exposed-part6-ecosystem-integrations`
- 한국어/영어 글, 기술 다이어그램 8종의 KO/EN SVG/PNG

## 사실과 링크 검증

- Exposed 모듈 경로가 `exposed/exposed-*`에서 `exposed/*`로 바뀐 뒤 남아 있던 링크를 현재 `develop` 소스와 맞췄다.
- Part 5의 기존 캐시 처리량은 현재 워크숍 벤치마크와 일치하지 않았다. 2026-07-27 JMH 결과로 본문, 표, 대체 텍스트, KO/EN 차트를 함께 갱신했다.
- Write-Behind의 요청 수락, Write-Through의 DB 반영 완료, Write-Behind의 큐 비우기 완료는 측정 종료 조건이 다르다. 같은 `ops/s` 단위를 사용하더라도 직접적인 우열 비교로 표현하면 안 된다.
- 이번 배치의 GitHub 소스 링크 56개는 로컬 `develop` 체크아웃의 실제 경로와 대조했다.

## 한국어 교정 교훈

- 설명문에서는 `dry-run`, `mock client`, `session`, `catalog`, `connector`, `pushdown`을 각각 `드라이런`, `모의 클라이언트`, `세션`, `카탈로그`, `커넥터`, `푸시다운`으로 쓴다. API와 식별자는 원문을 보존한다.
- 비동기 처리의 성공을 하나의 말로 뭉뚱그리지 않는다. `요청 수락`, `큐 적재`, `DB 반영 완료`, `큐 비우기 완료`처럼 독자가 완료 경계를 알 수 있는 용어를 사용한다.
- 시리즈 하단 링크의 제목도 frontmatter 제목과 함께 교정해야 한다. 링크는 유효해도 제목이 다르면 시리즈 탐색 경험이 어긋난다.

## 다이어그램 교훈

- 기존 Part 6 생성기의 일부 원본 색상은 소문자 16진수라 dark style 변환표를 통과하지 않았다. 원본 팔레트의 대소문자를 모두 처리한 뒤 SVG와 PNG를 다시 생성했다.
- 생성 스크립트 성공만으로 dark style을 증명할 수 없다. KO/EN PNG contact sheet에서 배경, 카드, 텍스트 대비를 확인해야 한다.
- 차트의 값은 원문 표와 함께 갱신해야 한다. 특히 비동기 처리 차트는 값뿐 아니라 완료 경계를 제목, 부제, 라벨에 표시해야 한다.

## 체크리스트 반영

- `bluetape-writer` 한국어 교정 체크리스트에 Exposed 생태계 용어와 비동기 벤치마크 완료 경계 규칙을 추가했다.
- chezmoi 원본을 수정하고 live skill에 적용해 source/live parity를 확인했다.
