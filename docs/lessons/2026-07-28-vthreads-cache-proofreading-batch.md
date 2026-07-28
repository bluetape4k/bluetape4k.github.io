# Virtual Threads 4편과 Cache Part 1/2 교정 lessons

## 범위

- `virtual-threads-part4-java21-java25-spi`
- `bluetape4k-cache-part1-cache-module`
- `bluetape4k-cache-part2-near-cache`
- 한국어/영어 route 쌍, 본문 다이어그램 SVG/PNG, frontmatter `date`/`imageAlt`

## 발행 일자 기준

- Virtual Threads 4편은 최초 공개 배포 실행 `26614179807`의 완료 시각을 기준으로 `2026-05-29T11:24:00+09:00`으로 보정했다.
- Cache Part 1/2는 최초 공개 배포 실행 `26630436259`의 완료 시각을 기준으로 `2026-05-29T18:50:00+09:00`, `2026-05-29T18:50:01+09:00`으로 보정했다.
- 교정 PR 생성일을 `blog.date`에 넣지 않는다. 최초 공개 시각을 찾을 수 있으면 그 값을 기준으로 정렬하고, 같은 분 단위 글은 1초 간격으로 안정적인 순서를 만든다.

## 교정 lessons

- 한국어 기술 글에서는 `application code`, `runtime`, `release`, `compile-time dependency`, `benchmark` 같은 설명용 영어 명사를 그대로 두지 않는다.
- 코드 identifier나 실제 런타임 이름은 보존하되, 설명 문장은 `애플리케이션 코드`, `런타임`, `릴리스`, `컴파일 시점 의존성`, `벤치마크`처럼 기술 문서에서 쓰는 한국어로 정리한다.
- 본문만 교정하면 부족하다. frontmatter `imageAlt`, hero caption, figure `alt`, figure caption, 표 항목까지 같은 기준으로 확인해야 한다.

## 다이어그램 lessons

- 기존 Graphviz sidecar는 이번 dark-style SVG/PNG의 canonical source가 아니다. 교체한 다이어그램에서는 `.dot`, `.plain`, `-sketch.svg`를 제거하고 SVG/PNG와 현재 generator를 기준으로 검증했다.
- connector-heavy SVG는 `diagram-svg-text-normalize.py`, XML 검증, connector/card intrusion, endpoint, mixed-corner 감사를 모두 통과해야 한다. 감사 결과가 깨끗해도 최종 PNG를 full-size로 열어 확인해야 한다.
- chart-only SVG는 connector marker를 갖지 않는 편이 맞다. connector 감사 대신 값 누락 여부와 marker 부재를 별도 invariant로 검증한다.
- Pillow가 없는 기본 Python에서는 contact sheet 생성이 실패할 수 있다. `python3 --user` 범위에 Pillow를 설치하고 같은 Python으로 시각 검증 이미지를 만들었다.

## writer checklist 반영

- `bluetape-writer` 한국어 교정 체크리스트에 `application code`, `runtime`, `release`, `compile-time dependency` 항목을 추가했다.
- chezmoi 원본을 수정한 뒤 live skill에 적용했고, source/live parity와 self-audit를 확인한 뒤 dotfiles commit `1820e84`로 push했다.
