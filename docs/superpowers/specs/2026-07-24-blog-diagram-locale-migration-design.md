# 블로그 다이어그램 locale 분리 설계

## 배경

`bluetape4k.github.io`의 한·영 블로그는 본문 구조와 설명 문구는 locale별로
관리하지만, 다수의 기술 다이어그램은 같은 영문 PNG를 공유한다. 한국어 글에서
영문 다이어그램을 읽어야 하고, 최근 추가한 일부 글만 별도 한글 다이어그램을
제공해 자산 명명과 독자 경험이 일관되지 않다.

이번 작업은 본문 기술 다이어그램을 영어와 한국어 자산으로 분리한다. 기존
레이아웃을 기계적으로 보존하는 것보다 각 locale에서 의미를 정확하고 읽기 쉽게
전달하는 것을 우선한다.

## 목표

1. 독자가 읽는 텍스트가 있는 모든 블로그 기술 다이어그램에 영어와 한국어
   SVG/PNG 쌍을 제공한다.
2. 영어 자산은 `-en`, 한국어 자산은 `-ko` 접미사를 사용한다.
3. 영어 글은 `-en.png`, 한국어 글은 `-ko.png`만 참조한다.
4. 기술 식별자는 보존하고 독자용 설명은 자연스러운 locale 문구로 작성한다.
5. 긴 한국어 문구에 맞춰 card, lane, canvas, connector를 재설계할 수 있다.
6. locale 공유 자산과 무접미사 기술 다이어그램 참조가 다시 생기지 않도록
   자동 검증을 추가한다.

## 제외 범위

- 텍스트가 없는 hero
- `bt4k-blog-hero`, `bt4k-post-hero`로 분류된 장식·대표 이미지
- `bt4k-screenshot` 스크린샷
- 매뉴얼 및 README 전용 다이어그램
- 블로그 본문, 기술 주장, benchmark 수치 자체의 개정
- 이번 프로그램과 무관한 이미지 최적화 또는 스타일 통일

hero에 독자용 텍스트가 있더라도 이 프로그램에서 이미지 생성으로 locale별 hero를
새로 만들지는 않는다. 본문에서 hero를 기술 다이어그램으로 잘못 분류한 경우에는
figure class를 올바르게 고친다.

## 전수 조사 결과

조사 기준은 한국어 및 영어 블로그의 다음 figure class다.

- `bt4k-architecture`
- `bt4k-chart`
- `bt4k-sequence`

초기 자동 조사 결과:

| 항목 | 수량 |
|---|---:|
| 영어 기술 figure 발생 수 | 150 |
| 한국어 기술 figure 발생 수 | 151 |
| 한·영이 같은 영문 자산을 공유 | 137 |
| 이미 locale이 분리됐지만 한국어가 무접미사 | 13 |
| 한국어 글에만 존재 | 1 |
| 한국어 글에서 참조하는 고유 자산 | 151 |
| 같은 stem의 SVG가 저장소에 있음 | 143 |
| 현재 SVG에 한글이 있음 | 13 |
| 현재 한국어 참조가 `-ko`를 사용 | 0 |

자가 검토에서
`public/assets/bluetape4k-leader-part4-hero.png`는 기술 다이어그램이 아니라
본문에 재사용된 3D hero임을 확인했다. 이 figure를 hero로 재분류하고 locale
다이어그램 대상에서 제외한다.

따라서 최종 대상은 기술 다이어그램 150개다.

| 최종 대상 상태 | 수량 |
|---|---:|
| 영문 공유 자산에서 새 한글 자산이 필요 | 136 |
| 이미 한글화됐으나 `-ko` 이름 전환이 필요 | 13 |
| 한국어 글에만 있으며 locale 쌍을 새로 만들어야 함 | 1 |
| 합계 | 150 |

## 자산 명명 계약

기술 다이어그램 stem이 `example-flow-01`이면 canonical 자산은 다음 네 파일이다.

```text
public/assets/example-flow-01-en.svg
public/assets/example-flow-01-en.png
public/assets/example-flow-01-ko.svg
public/assets/example-flow-01-ko.png
```

MDX 참조는 다음과 같다.

```text
English: /assets/example-flow-01-en.png
Korean:  /assets/example-flow-01-ko.png
```

규칙:

- SVG와 PNG에 같은 locale 접미사를 적용한다.
- 영어와 한국어 SVG는 각각 편집 가능한 canonical source다.
- PNG는 대응 SVG에서 `cairosvg ... -s 2`로 렌더링한다.
- 무접미사 자산은 저장소 내부 참조를 모두 전환한 뒤 제거한다.
- locale별 파일이 다른 locale 글에서 참조되면 검증 실패로 처리한다.
- 하나의 SVG에서 `<switch>`나 runtime locale 분기를 사용하지 않는다.

## 문구와 의미 보존

### 번역 대상

- 제목과 부제
- card 제목과 설명
- connector label
- lane, layer, region 이름
- footer와 독자용 주석
- chart legend와 축 설명

### 보존 대상

- class, function, method, bean 이름
- API 경로와 HTTP method
- configuration key
- 명령과 코드
- enum, state, event, metric 이름
- 제품·프레임워크·프로토콜 이름
- benchmark 숫자와 단위

한국어 설명 안에 기술 식별자가 들어갈 때는 식별자를 번역하지 않는다. 필요한 경우
한국어 설명과 식별자를 별도 줄이나 별도 style로 분리한다.

## 시각 설계 원칙

의미 전달이 기존 포맷보다 우선한다.

- 한국어 문구를 맞추기 위해 글꼴 크기를 과도하게 줄이지 않는다.
- 가장 긴 의미 있는 문구를 기준으로 card 폭과 높이를 늘린다.
- card가 늘어나면 canvas, lane, footer, connector port를 함께 이동한다.
- 번역 때문에 기존 좌우 흐름이 읽기 어려워지면 상하 흐름이나 단계 묶음으로
  재구성할 수 있다.
- 정보 계층이 명확해진다면 card 수, 줄 수, group 배치를 locale별로 다르게
  구성할 수 있다.
- source-backed 개념, 관계, 순서, 수치와 제약은 locale별 레이아웃이 달라도
  동일해야 한다.
- 영어 제목·heading은 `Architects Daughter`, 영어 본문·식별자는
  `Comic Mono`를 사용한다.
- 한국어 설명은 `goorm Sans`, 코드·식별자는 `goorm Sans Code`를 사용한다.

## PNG-only 자산 처리

초기 조사에서 SVG가 보이지 않은 자산은 8개였다.

`bluetape4k-leader-part4-hero.png`는 hero로 재분류하므로 대상에서 제외한다.

나머지 7개 중 다음 6개는
`bluetape4k-leader/docs/images/readme-diagrams/`에서 SVG 원본을 복구할 수 있다.

- `examples-batch-scheduler-architecture-01`
- `examples-migration-gate-architecture-01`
- `examples-webhook-poller-architecture-01`
- `examples-cache-warmer-architecture-01`
- `examples-tenant-aggregator-architecture-01`
- `examples-k8s-operator-architecture-01`

`bluetape4k-leader-overview-01`은 저장소와 sibling repository에서 SVG 원본을
찾지 못했다. 이 자산은 글과 현재 소스 구조를 기준으로 새 SVG를 작성하고, 기존
PNG를 source model로 단순 trace하지 않는다.

## 배치 설계

Umbrella Issue 하나에서 다음 11개 배치를 추적한다. 각 배치는 독립적으로
추적·검증하는 단위이며, 하나 이상의 독립 PR로 전달할 수 있다.

| 배치 | 다이어그램 수 |
|---|---:|
| standalone / workshop | 42 |
| Exposed | 16 |
| AWS | 15 |
| Graph | 15 |
| Leader | 14 |
| JaVers | 11 |
| Clinic appointment | 10 |
| Cache | 8 |
| Projects | 8 |
| Skills / workflow | 7 |
| Text | 4 |
| 합계 | 150 |

큰 `standalone / workshop` 배치는 Issue 안에서 article group으로 더 작게
체크하지만 하나의 umbrella 범위를 유지한다. 구현 계획에서는 각 PR의 시각 검수
규모가 과도해지지 않도록 필요하면 배치를 여러 PR로 나눈다. Issue의 완료 조건은
모든 150개 canonical 쌍과 MDX 전환이다.

## 배치별 실행 순서

각 다이어그램은 다음 순서를 독립적으로 완료한다.

1. 대상 한·영 글과 source-backed 의미를 읽는다.
2. 관련 SVG/PNG와 generator 또는 원본 source를 찾는다.
3. 영문 SVG를 `-en.svg`로 정리하고 승인된 영문 글꼴을 적용한다.
4. 한국어 `-ko.svg`를 작성한다.
5. 한국어 의미에 맞춰 card, lane, canvas, connector를 조정한다.
6. XML parse와 text normalization을 실행한다.
7. `-en.png`, `-ko.png`를 CairoSVG scale 2로 렌더링한다.
8. type별 정적 audit를 실행한다.
9. 두 PNG를 full-size로 열어 읽기·간격·연결선을 확인한다.
10. 한·영 MDX를 canonical locale PNG로 전환한다.
11. 자산과 문서 참조 검증을 기록한 뒤 다음 다이어그램으로 이동한다.

## 자동 검증 계약

기존 blog image classification 테스트를 확장해 다음을 검증한다.

1. 기술 figure의 PNG는 `-en.png` 또는 `-ko.png`로 끝난다.
2. 영어 글은 `-en.png`만 참조한다.
3. 한국어 글은 `-ko.png`만 참조한다.
4. 각 기술 PNG에 같은 stem과 locale의 SVG가 존재한다.
5. 동일한 article pair의 기술 figure 개수와 순서가 일치한다.
6. hero와 screenshot은 locale 다이어그램 규칙에서 제외된다.
7. 무접미사 기술 다이어그램 참조는 0개다.

각 배치에서는 추가로 다음 검증을 수행한다.

- `xmllint --noout`
- `diagram-svg-text-normalize.py`
- connector/geometry/endpoint/mixed-corner audit
- diagram kind별 audit
- `git diff --check`
- `npm test`
- `npm run build`
- 변경된 한·영 route와 모든 locale PNG HTTP 200

## GitHub 전달 방식

### Umbrella Issue

Issue는 영어로 작성하고 다음을 포함한다.

- 조사 수치와 최종 150개 대상
- naming contract
- 11개 배치 checklist
- SVG source 복구 예외
- 자동 검증 DoD
- 배치별 PR 링크와 진행 상태

Issue metadata:

- assignee: `debop`
- label: `documentation`
- label: `enhancement`
- milestone: 생성 시점의 활성 문서 로드맵과 중복 Issue를 확인해 적용

### Branch와 PR

기준 branch는 `develop`이다. 배치 branch는 다음 형식을 사용한다.

```text
codex/blog-diagram-locales-<batch>
```

여기서 `<batch>`는 구현 계획에 확정한 영문 소문자 batch slug로 치환한다.

각 PR은 umbrella Issue를 참조하고, 적용한 자산 수, audit 수치, full-size 시각
검수, 테스트, build와 route 결과를 기록한다. PR 본문의 마지막 `##` section은
`## DoD Status`다.

PR 생성은 승인된 프로그램 범위에 포함되지만, 각 PR 병합은 CI와 최신 리뷰를
확인한 merge-ready 보고 뒤 새 사용자 승인을 받아야 한다.

## 실패 처리

- source-backed 의미를 확인할 수 없으면 해당 자산을 임의 번역하지 않고 Issue에
  blocker로 기록한다.
- SVG source가 없으면 sibling source를 먼저 찾고, 없을 때만 새 SVG를 설계한다.
- text normalization이나 CairoSVG가 glyph를 잃으면 canonical SVG는 유지하고
  검증 가능한 렌더링 경로를 사용하되 PNG와 SVG 의미가 같음을 확인한다.
- generic audit가 `WEAK`, `UNAVAILABLE`, `connectors=0`, `cards=0`를 보고하면
  통과로 간주하지 않고 실제 entity·relationship 수를 세는 fallback invariant를
  추가한다.
- full-size PNG가 audit 결과와 충돌하면 PNG 판단을 우선하고 SVG를 수정한다.

## 완료 조건

- 150개 기술 다이어그램에 `-en.svg/png`, `-ko.svg/png` canonical 쌍이 있다.
- 영어 및 한국어 블로그의 기술 figure가 각 locale PNG만 참조한다.
- 무접미사 기술 다이어그램 참조가 0개다.
- hero와 screenshot은 올바른 제외 class로 분류된다.
- 모든 SVG가 parse되고 모든 PNG가 scale 2로 렌더링된다.
- 모든 적용 가능한 audit와 full-size 시각 검수가 통과한다.
- 전체 테스트와 site build가 통과한다.
- 모든 변경 route와 locale asset이 HTTP 200을 반환한다.
- Umbrella Issue의 11개 배치가 완료되고 연결된 PR들의 상태가 기록된다.
