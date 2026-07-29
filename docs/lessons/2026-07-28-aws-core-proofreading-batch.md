# AWS Part 1~3 교정 lessons

## 범위

- `bluetape4k-aws-part1-overview`
- `bluetape4k-aws-part2-core-modules-service-coverage`
- `bluetape4k-aws-part3-spring-boot-ktor-examples`
- 한국어·영어 본문과 기술 다이어그램 9종의 SVG/PNG

## 사실 검증 lessons

- 자연스러운 문장보다 먼저 현재 소스와 설명이 일치하는지 확인해야 한다. 특히 기본값과 대체 경로는
  `defaultXxx` 같은 이름만 보고 추정하지 않고 실제 호출 경로에서 확인한다.
- AWS 클라이언트와 공유 HTTP 엔진은 소유권과 종료 책임이 다를 수 있다. 글과 다이어그램에서는
  생성 주체, 재사용 범위, 종료 주체를 분리해 설명해야 한다.
- 서비스 지원 표는 README만으로 확정하지 않는다. 빌드 의존성과 대표 구현을 함께 대조하고,
  Java SDK와 Kotlin SDK의 지원 범위가 비대칭이면 그 차이를 그대로 보존한다.
- 설명용 AWS 용어는 기술 문서에서 통용되는 한국어를 사용하되, 모듈명·API·설정 키 같은
  식별자는 원문을 유지한다.

## 다이어그램 lessons

- 한국어 자산을 만들 때 영어 SVG를 연속 치환하면 먼저 바뀐 문자열을 다음 치환이 다시 건드릴 수 있다.
  원본에서 독립적으로 변환하고, 생성 후 영어 식별자가 남았는지 정확히 다시 검색한다.
- 일반 connector 감사가 카드 수나 연결선 수를 충분히 인식하지 못하면 통과 결과만으로 품질을
  확정하지 않는다. 다이어그램 유형별 카드·연결선·화살표·단계 번호 불변식을 추가해 확인한다.
- 시퀀스 감사의 선택자는 생성기에서 실제로 쓰는 클래스 이름과 일치해야 한다. 이번 배치에서는
  `label-pill`이 아니라 `labelPill`이므로 선택자를 고쳐 다시 검증했다.
- SVG 정적 감사와 CairoSVG 변환 후에도 한영 PNG 18개를 원본 크기로 열어 글자 잘림,
  연결선 겹침, 여백과 대비를 확인했다.

## 발행 정보와 한영 정합성

- 교정 시점의 날짜로 바꾸지 않고 기존 `blog.date`와 `sidebar.order`를 유지했다.
- 한영 글의 제목, 주장, 수치, 소스 링크, 시리즈 탐색, 다이어그램 수와 구조를 맞췄다.
- 기술 다이어그램에는 언어별 `data-diagram-title`을 제공하고, 대표 이미지는 확대 대상에서 제외했다.

## writer checklist 반영

- 실제 호출 경로를 통한 기본값·대체 경로 검증, 클라이언트와 HTTP 엔진의 소유권 구분,
  README·빌드·구현을 함께 보는 서비스 지원 표 검증 규칙을 추가했다.
- Java SDK와 Kotlin SDK의 비대칭 지원 범위, AWS 한국어 용어, 비연쇄 다이어그램 번역과
  잔여 식별자 재검색 규칙도 체크리스트에 반영했다.
- chezmoi 원본 수정 후 live skill 적용, source/live parity, self-audit와 workflow contract를
  확인하고 dotfiles commit `f7a5ec6`을 push했다.
