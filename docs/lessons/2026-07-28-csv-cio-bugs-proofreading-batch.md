# CSV·HTTP·버그 회고 한국어 교정 배치

## 맥락

오래된 블로그 글 세 편을 이어서 교정했다.

- `csv-writer-okio-buffered-sink`
- `when-cio-made-http-benchmarks-weird`
- `embarrassing-bugs-that-made-better-guards`

이번 배치의 목적은 본문 문장만 다듬는 것이 아니라, 독자가 보는 차트와 다이어그램까지 현재 블로그
UI 규칙에 맞추는 것이었다. 그래서 한국어 본문, frontmatter, 대체 텍스트, 캡션, 기술 그림의
`data-diagram-title`, 한·영문 SVG/PNG 자산을 함께 정리했다.

## 확인한 문제

기존 글에는 본문 안의 번역체보다 독자-facing 주변 요소에 남은 표현이 더 눈에 띄었다.

| 위치 | 문제 | 수정 방향 |
|---|---|---|
| CSV writer 글 | benchmark figure가 `bt4k-architecture`로 분류됨 | 처리량 비교 차트이므로 `bt4k-chart`로 변경하고 한·영문 확대 제목을 추가 |
| 한국어 caption·alt | `benchmark`, `payload`, `portable`, `semantics`, `guardrail` 등 일반 설명 영어가 남음 | API·식별자는 유지하고 일반 설명은 한국어 기술 용어로 정리 |
| 버그 회고 다이어그램 | light theme/pastel 표현과 한·영문 텍스트가 현재 dark style 기준과 맞지 않음 | dark style로 다시 만들고 한국어·영어 자산을 분리 |
| 차트 SVG 변환 | 색상 일괄 변환 후 일부 label 색이 지나치게 어두워질 수 있음 | SVG 검증 뒤 PNG를 직접 열어 대비와 라벨 여백을 확인 |

## 결정

기술 그림은 내용의 종류에 맞는 figure class를 사용한다. 벤치마크 처리량 비교는 architecture가 아니라
chart다. 이 분류가 틀리면 확대 보기, 테스트, 향후 일괄 점검에서 잘못된 범주로 취급된다.

한국어 교정은 본문만 보지 않는다. frontmatter의 `title`, `description`, `cardDescription`,
`imageAlt`, hero caption, figure caption, 표, 차트 라벨, 다이어그램 제목도 같은 품질 기준으로
교정한다. 코드 식별자와 제품명은 보존하되, 독자에게 설명하는 일반 영어는 한국어 기술 용어로
바꾼다.

이번 배치에서 반복된 대표 표현은 다음과 같다.

- `payload` → `필드 본문`
- `portable` → `이식성이 좋다`
- `semantics` → `의미`
- `benchmark` → `벤치마크`
- `guard`, `guardrail` → `보호 장치`, `방지 장치`, 또는 실제 방지 메커니즘
- `Fast Path` → `고속 경로`

`guard`와 `guardrail`은 이번 PR에서 반복 교정어로 확인되어 `bluetape-writer`의 한국어 자연스러움
체크리스트에도 추가했다. 원본은 chezmoi에 반영했고 live skill 파일과 parity를 확인했다.

## 검증

- 기술 그림 8개 SVG의 XML을 검증했다.
- SVG 8개를 CairoSVG로 PNG 재렌더링했다.
- `diagram-svg-text-normalize.py`로 SVG text hazard와 code highlight 누락이 없음을 확인했다.
- 버그 회고 다이어그램 2개는 connector/geometry/endpoint/mixed-corner audit를 추가로 확인했다. 카드
  rect에는 `card` class를 명시해 generic connector audit가 `cards=4`, `connectors=3`을 직접 집계하게
  했다.
- PNG 8개를 전체 크기로 열어 dark style 대비, 라벨 여백, 한·영문 분리, 카드·화살표 가독성을 확인했다.
- `node --test tests/ecosystem/blog-diagram-locales.test.mjs tests/ecosystem/diagram-lightbox.test.mjs`가 21개 테스트를 통과했다.

## 후속 규칙

교정 PR을 만들 때는 다음 순서를 빠뜨리지 않는다.

1. 오래된 글을 고르기 전에 현재 stacked PR head를 확인한다.
2. 교정 범위를 본문, frontmatter, caption, alt, 표, figure class, diagram title, 한·영문 자산까지 포함한다.
3. 다이어그램 색상 변환 후에는 반드시 PNG를 직접 확인한다. SVG diff만으로 dark style 전환을 완료로 보지 않는다.
4. 반복되는 교정어가 있으면 PR 안의 lessons에 기록하고, 범용 규칙이면 chezmoi 원본의 writer 체크리스트를 보강한 뒤 push까지 완료한다.
5. PR은 이전 교정 PR head를 base로 하는 stacked PR로 만들고, 머지·배포는 사용자가 별도로 승인할 때까지 진행하지 않는다.
