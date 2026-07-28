# Virtual Threads 한국어 교정 배치

## 맥락

오래된 Virtual Threads 시리즈 글 세 편을 현재 블로그 교정 기준으로 다시 점검했다.

- `virtual-threads-part1-guide`
- `virtual-threads-part2-workshop-rules`
- `virtual-threads-part3-jdbc-r2dbc-benchmark`

이번 배치는 본문 교정만이 아니라 독자가 보는 주변 요소까지 포함했다. 한국어 frontmatter, 카드 설명,
hero caption, figure caption, 이미지 대체 텍스트, 한·영문 SVG/PNG 자산을 함께 정리했다.

## 확인한 문제

이 글들은 이미 한 번 교정한 이력이 있었지만, 현재 기준으로 보면 독자-facing 표면에 영어 설명어와
light style diagram이 남아 있었다.

| 위치 | 문제 | 수정 방향 |
|---|---|---|
| 한국어 제목·caption | `싸다`, `값싼 thread`처럼 구어적인 비용 표현이 남음 | 기술 문서 문맥에서는 `저비용`, `비용이 낮다`로 정리 |
| 한국어 본문·alt | `blocking code`, `resource limit`, `rule`, `benchmark`, `chart`가 일반 설명어로 남음 | 코드 식별자는 유지하고 설명 문장에서는 `블로킹 코드`, `자원 한도`, `규칙`, `벤치마크`, `차트` 사용 |
| Part 1/2 diagram | dark style 전환 후 generic connector audit가 카드를 인식하지 못함 | card rect에 `card` class를 명시해 connector/card 관계를 검증 가능하게 함 |
| Part 3 chart | 영어 PNG에서 구분 기호와 footer 위치가 실제 raster 결과에서 문제를 만들 수 있음 | SVG text hazard를 제거하고 PNG 전체 크기 실사로 glyph·여백·프레임 충돌을 확인 |

## 결정

한국어 교정은 문장 본문만 보지 않는다. 기술 블로그에서 독자가 실제로 읽는 표면은 title,
description, cardDescription, hero caption, figure caption, image alt, diagram/chart label까지
이어진다. 이 표면에 남은 일반 영어는 API명이나 코드 식별자가 아니라면 한국어 기술 용어로 정리한다.

다만 기계적으로 치환하지 않는다. `Thread`, `Virtual Thread`, `ScopedValue`, `Semaphore`,
`benchmark` annotation, repository path처럼 코드·제품·식별자 성격이 있는 항목은 정확성을 우선해
보존한다. 반대로 설명 문장 안의 `blocking code`, `resource limit`, `rule`, `benchmark`, `chart`는
독자에게 의미를 전달하는 일반어이므로 한국어로 옮긴다.

이번 배치에서 반복된 대표 표현은 다음과 같다.

- `cheap`, `값싼` → `저비용`, `비용이 낮다`
- `blocking code` → `블로킹 코드`
- `resource limit` → `자원 한도`
- `rule` → `규칙`
- `benchmark`, `chart` → `벤치마크`, `차트`

반복 교정어 중 범용성이 있는 항목은 `bluetape-writer`의 한국어 자연스러움 체크리스트에도 추가했다.
원본은 chezmoi source에 반영했고, live skill 파일과 parity를 확인한 뒤 dotfiles에 push했다.

`blog.date`는 교정 PR의 날짜가 아니라 최초 공개 시점에 맞춘다. Virtual Threads 세 편은 PR 연결 없이
`docs: publish virtual threads series` commit이 `develop`에 push되었고, GitHub Actions의
`Deploy Website` run `26614179807`이 `2026-05-29T02:23:57Z`에 성공했다. 따라서 한국 시간 기준
`2026-05-29 11:23:57 +09:00`을 최초 공개 근거로 삼았다. 세 편이 같은 deploy에서 동시에 공개됐지만
목록 정렬 안정성을 위해 Part 1/2/3에 1초 간격을 두었다.

## 다이어그램 검증 메모

Part 1/2는 컴포넌트를 연결하는 선이 있는 technical diagram이다. XML과 text hazard를 확인한 뒤
connector, geometry, endpoint, mixed-corner audit를 모두 통과시켰다.

- Part 1 한·영문: `connectors=5`, `cards=7`
- Part 2 한·영문: `connectors=4`, `cards=6`

Part 3의 두 자산은 연결선 기반 diagram이 아니라 chart다. 그래서 connector 수는 `0`이 정상이다.
대신 SVG XML, text hazard, geometry audit, PNG 전체 크기 실사, 그리고 본문 표와 SVG 수치 일치를
검증했다. Exposed JDBC chart의 `25,400`, `43,487`, `44,161`, `45,431`과 batch chart의 MySQL/PostgreSQL
수치가 본문 표와 일치함을 확인했다.

## 검증

- 한·영문 SVG 8개의 XML을 검증했다.
- SVG 8개를 CairoSVG로 PNG 재렌더링했다.
- `diagram-svg-text-normalize.py`로 text hazard와 code highlight 누락이 없음을 확인했다.
- Part 1/2 한·영문 diagram 4개는 connector/geometry/endpoint/mixed-corner audit를 통과했다.
- Part 3 한·영문 chart 4개는 chart 수치와 PNG 전체 크기 시각 검토를 통과했다.
- `blog.date`는 최초 deploy 완료 시각과 GitHub Actions run URL을 대조했다.
- `bluetape-writer` 체크리스트 변경은 chezmoi source와 live skill parity를 확인하고 dotfiles `cac4244`로 push했다.

## 후속 규칙

Virtual Threads나 성능 글을 교정할 때도 동일한 원칙을 적용한다. API·코드 식별자는 보존하되,
독자에게 설명하는 일반 영어는 한국어 기술 용어로 옮긴다. 비용 표현은 `싸다`, `값싸다`보다
`저비용`, `비용이 낮다`, `고비용`처럼 기술 글에서 쓰는 표현을 우선한다.

Chart는 connector audit 결과만으로 품질을 판단하지 않는다. 수치 일치와 raster 결과의 glyph, label,
frame 여백을 직접 확인한다.
