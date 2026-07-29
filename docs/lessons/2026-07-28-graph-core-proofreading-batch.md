# Graph Part 1~3 교정 배치 교훈

## 배경

Graph 시리즈 Part 1~3은 그래프 저장소 선택, 공통 API, 입출력과 벤치마크를
한 흐름으로 설명한다. 이번 교정에서는 문장을 다듬는 데 그치지 않고 현재
`bluetape4k-graph` 구현과 보존된 벤치마크 조건을 다시 대조했다. 한국어와
영어 글의 주장·코드·링크·다이어그램도 같은 근거를 가리키도록 맞췄다.

## 확인한 교정 원칙

### 공통 API와 백엔드 보장을 구분한다

- README의 `best fit` 안내는 후보 선택 기준이지 처리량이나 지연 시간의
  보장이 아니다.
- 메모리 기반 공통 계약 테스트는 API 호환성을 확인할 수 있지만, 운영
  백엔드의 질의 계획·색인·트랜잭션·실패 동작까지 같다는 근거는 아니다.
- 공통 facade가 있어도 schema, transaction, merge 같은 선택 기능과
  backend-native 질의 경로는 구현별로 따로 확인해야 한다.
- bulk 기본 구현이 단건 호출의 순차 반복이라면 일부 쓰기만 반영될 수 있다.
  native batch override도 트랜잭션 경계가 확인되지 않으면 원자적이라고
  표현하지 않는다.

### 보존된 벤치마크와 현재 구현을 분리한다

- JMH annotation보다 실행 명령이 warmup, measurement, fork 설정을
  덮어썼다면 실제 결과는 실행 명령의 조건으로 설명해야 한다.
- `smokeBenchmark`라는 이름만으로 성능 근거라고 판단하지 않는다. 짧은
  smoke 실행은 wiring, benchmark discovery, 결과 파일 생성만 검증할 수 있다.
- 과거 결과의 원인 분석과 현재 소스의 동작을 한 문장에 섞지 않는다.
  현재 성능을 주장하려면 현재 조건으로 다시 측정해야 한다.

### 기술 다이어그램의 UI 계약을 자산과 함께 검증한다

- 기술 다이어그램의 한영 구조는 같게 유지하되, 제목과 카드·연결선의 문구는
  언어별 자산으로 분리한다.
- 확대 UI가 읽는 `data-diagram-title`은 자식 `<img>`가 아니라 기술
  다이어그램을 감싸는 `<figure>`에 둔다.
- 생성 스크립트가 성공했다는 사실만으로 검수를 마치지 않는다. SVG 정적 감사,
  CairoSVG 2배 PNG, contact sheet, 대표 자산 원본 크기 검사를 함께 수행한다.

## 체크리스트 반영

이번 배치에서 반복 적용할 수 있는 규칙을 chezmoi 원본
`bluetape-writer` 한국어 교정 체크리스트에 추가했다.

- backend 선택 안내와 성능 보장의 분리
- 공통 계약 테스트와 운영 backend 동등성의 분리
- bulk fallback, 부분 성공, atomicity 검증
- 선택 capability와 unsupported 동작 검증
- JMH 실제 실행 조건과 smoke task의 증거 범위
- format별 wrapper 계약과 역사적 벤치마크 원인의 분리
- `<figure>` 단위의 locale별 다이어그램 제목

chezmoi apply 후 원본과 live skill의 byte parity를 확인했고, dotfiles
commit `aadba43`을 `origin/main`에 push했다. 별도로 존재하던 live-owned
`config.toml`과 native subagent watchdog drift는 이번 범위 밖이므로
변경하지 않았다.

## 검증 결과

| 항목 | 결과 |
| --- | --- |
| 한국어·영어 글 | Part 1~3 제목·주장·코드·링크·시리즈 탐색 일치 |
| 날짜·순서 | 최초 `blog.date`와 `sidebar.order` 보존 |
| 기술 다이어그램 | 7개 stem, 한영 SVG·PNG 14개 |
| 정적 감사 | connector·endpoint·geometry·corner·sequence 모두 통과 |
| PNG 검사 | 2배 렌더링, contact sheet 14개와 대표 sequence 원본 크기 확인 |
| 대상 테스트 | Node 테스트 22/22 통과 |
| 사이트 검사 | Astro 오류·경고 0, 1,303 pages build |
| 로컬 경로 | 한영 Part 1~3 6개 경로 HTTP 200 |
| stacked PR | #284, base `docs/korean-proofreading-javers-core-batch` |

## 다음 작업에 적용할 지침

Graph Part 4~5를 교정할 때도 공통 API가 제공하는 최소 계약과 backend별
보장을 먼저 나눈다. 다이어그램 생성기의 Part 4~5 출력은 이번 배치에서
재생성하지 않았으므로, 다음 배치에서 해당 글의 근거와 함께 별도로 생성하고
같은 정적·시각 검증을 수행한다.
