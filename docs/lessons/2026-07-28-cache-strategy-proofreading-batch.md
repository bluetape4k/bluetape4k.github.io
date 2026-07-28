# Cache 전략 글 교정 배치 Lessons

## 범위

- `bluetape4k-cache-part3-exposed-strategies`
- `bluetape4k-cache-part4-workshop-examples`

## 확인한 점

- Part 3/4의 최초 공개 순서는 Part 1/2 이후로 맞춰야 하므로 `blog.date`와 `sidebar.order`를 각각 `2026-05-29T18:50:02+09:00`, `2026-05-29T18:50:03+09:00`으로 정렬했다.
- `bluetape4k-exposed`의 현재 소스 경로는 `exposed/cache`, `exposed/jdbc-redisson`이다. 이전 글에 남아 있던 `exposed/exposed-cache`, `exposed/exposed-jdbc-redisson` 링크는 실제 파일이 없어 현재 경로로 교정했다.
- Part 3/4의 기술 다이어그램 3개는 light style 산출물이 남아 있었으므로 dark style KO/EN SVG/PNG로 다시 생성했다.
- Graphviz sidecar(`.dot`, `.plain`, `-sketch.svg`)는 본문과 검증에 더 이상 쓰지 않으므로 제거했다.

## 교정 교훈

- 한국어 글에서는 `cache strategy`, `baseline latency`, `write latency`를 그대로 두기보다 `캐시 전략`, `기준 지연 시간`, `쓰기 지연 시간`처럼 보고서·기술 글에서 쓰는 표현으로 정리한다.
- `fallback`은 코드 식별자일 때만 그대로 두고, 설명문에서는 `대체 경로`처럼 의미를 드러낸다.
- 다이어그램에서 단순 mono 라벨에 `class="code"`를 붙이면 syntax-highlight 검증 대상이 된다. 실제 코드 블록이 아니면 `mono`처럼 별도 class를 사용한다.

## 검증 메모

- `Pillow 11.3.0`을 사용자 Python 환경에 설치해 contact sheet 생성 실패를 해소했다.
- writer 체크리스트는 chezmoi 원본과 live skill에 반영했고, dotfiles commit `c39e0bb`로 push했다.
