# Bluetape Skills Part 1 교정과 다이어그램 설계

## 배경

`Bluetape Skills Part 1: 팀과 공유하고 설치하는 방법`은 개인 Codex 환경에서 발전한 Bluetape skill을 다른
개발자와 다른 머신에 안전하게 배포하는 방법을 설명한다. 현재 원고에는 필요한 사실과 절차가 들어 있지만,
영문 기술 용어가 한국어 문장 구조에 그대로 섞인 부분이 있어 한 차례 자연스러운 한국어 교정이 필요하다.

또한 다음 두 핵심 개념은 본문과 표만으로는 관계를 한눈에 파악하기 어렵다.

1. 공개 bundle에 포함할 항목과 개인 runtime에 남길 항목의 경계
2. chezmoi managed source에서 공개 bundle 검증까지 이어지는 source-first 동기화 순서

## 목표

- 사실, 식별자, 명령, 링크, 수치와 기존 글의 기술적 범위를 바꾸지 않고 한국어 문장을 자연스럽게 다듬는다.
- 서로 다른 독자 질문에 답하는 다이어그램 두 개를 추가한다.
- Part 2 다이어그램과 같은 시각 계열을 유지하되, 각 그림의 의미에 맞는 레이아웃을 사용한다.
- SVG source와 2배 PNG를 함께 보관하고, 실제 게시 글에는 PNG를 삽입한다.

## 범위

### 포함

- `src/content/docs/ko/blog/bluetape-skills-sharing.mdx`의 한국어 문체 교정
- 공개 bundle 경계 다이어그램 SVG/PNG 제작과 삽입
- source-first 동기화 흐름 다이어그램 SVG/PNG 제작과 삽입
- 관련 링크, 이미지, 시리즈 navigation과 로컬 route 검증

### 제외

- 영어 글 신규 작성 또는 locale parity 확장
- hero image 교체
- `bluetape-skills` 저장소의 skill, installer, validator 변경
- Part 2 원고나 기존 Part 2 다이어그램 수정
- PR 생성, merge 또는 게시

## 사실 기준

원고와 다이어그램의 source model은 다음 현재 파일에서 확인한다.

- `/Users/debop/work/bluetape4k/bluetape-skills/skills/manifest.json`
- `/Users/debop/work/bluetape4k/bluetape-skills/README.ko.md`
- `/Users/debop/work/bluetape4k/bluetape-skills/scripts/validate.sh`
- `/Users/debop/work/bluetape4k/bluetape-skills/scripts/install.sh`
- `src/content/docs/ko/blog/bluetape-skills-sharing.mdx`
- `src/content/docs/ko/blog/bluetape-skills-workflow-guide.mdx`

현재 확인된 공개 bundle은 canonical skill 14개를 배포한다. `SKILL.md`와 연결된 `references`, `templates`,
`scripts`는 skill 디렉터리의 일부로 배포한다. Retired aliases, user memory, rules와 hooks, configuration,
plugin caches는 의도적으로 제외한다. Installer는 기존 canonical skill을 기본적으로 덮어쓰지 않으며,
`--force`일 때 timestamp backup을 만든 뒤 교체한다.

## 다이어그램 1: Public Bundle Boundary

### 독자 질문

다른 개발자에게 무엇을 배포하고, 무엇을 개인 Codex 환경에 남겨야 하는가?

### 위치

`공개 묶음과 개인 설정의 경계` 절에서 포함·제외 원칙을 설명한 문단 뒤에 배치한다.

### 파일

- `public/assets/bluetape-skills-public-bundle-boundary-01.svg`
- `public/assets/bluetape-skills-public-bundle-boundary-01.png`

### 구조

정적 아키텍처 다이어그램으로 표현한다.

- 왼쪽: `Canonical Skills Source`
- 가운데 공개 경계: `Public Bundle`
  - `SKILL.md`
  - `references/`
  - `templates/`
  - `scripts/`
  - `manifest.json`
- 오른쪽 또는 아래의 분리된 개인 경계: `Private Runtime · Excluded`
  - `memory`
  - `rules & hooks`
  - `config`
  - `plugin caches`
  - `secrets`
  - `retired aliases`

공개 bundle로 향하는 관계와 제외 경계를 색상과 공간으로 구분한다. 색상 의미가 생기면 그림 안에 간결한
legend를 둔다. 제외 항목으로 향하는 화살표는 배포 흐름처럼 보이지 않게 구성한다.

## 다이어그램 2: Source-first Sync Pipeline

### 독자 질문

로컬 skill 변경을 다른 세션과 다른 개발자에게 안전하게 전달하려면 어떤 순서로 검증해야 하는가?

### 위치

`Live 파일 수정에서 source-first 관리로 바꿨다` 절의 기존 ASCII 흐름을 대체한다.

### 파일

- `public/assets/bluetape-skills-source-first-sync-01.svg`
- `public/assets/bluetape-skills-source-first-sync-01.png`

### 흐름

왼쪽에서 오른쪽으로 읽는 순차 흐름도로 표현한다.

1. `Managed Source`
2. `Targeted Apply`
3. `Source / Live Parity`
4. `sync-codex --status`
5. `Codex Self-Audit`
6. `Commit & Push`
7. `Public Export`
8. `Bundle Validation`

단계는 둥근 직교 연결선으로 잇는다. 모든 bend는 진행 방향에 맞는 곡률을 사용하고, 카드 경계에는 수직으로
붙는다. 연결선이 겹치는 것은 의미가 분명하고 카드나 레이블을 침범하지 않는 경우 허용한다.

## 시각 언어

- Part 2 다이어그램과 같은 밝은 캔버스, 청색 계열 테두리, 절제된 의미 색상을 사용한다.
- `Architects Daughter`와 `Comic Mono`를 사용한다.
- 모든 레이블은 영어로 작성한다.
- 카드 제목과 보조 문구의 위계를 분명히 하고, 글자를 줄여 넣기보다 카드 크기를 늘린다.
- 화살표는 같은 역할끼리 크기와 색상을 통일한다.
- 연결선은 수평·수직·둥근 직교선으로 제한한다.
- 독자가 읽을 내용만 그림 안에 넣고 검증 로그나 제작 메모는 넣지 않는다.

## 한국어 교정 원칙

- `bluetape-writer`의 blog style과 Korean naturalness checklist를 적용한다.
- 원문의 사실, 숫자, 명령, 식별자, 링크, 파일명과 불확실성은 유지한다.
- `~를 통해`, 명사형 나열, 영문 문장 골격, 반복되는 연결어를 자연스러운 한국어 동사 중심 문장으로 고친다.
- `canonical`, `skill`, `reference`, `manifest`, `runtime`처럼 글 전체에서 의미를 고정한 용어는 억지로 번역하지
  않되, 조사가 겹치거나 문장이 끊기는 부분은 다듬는다.
- 홍보 문구를 추가하지 않고 실제 운영 문제와 해결 장치의 관계를 선명하게 만든다.
- 기존 frontmatter, hero, 표, code block, repository link와 series navigation 구조는 유지한다.

## 검증

각 다이어그램은 한 개씩 다음 순서로 완료한다.

1. SVG 수정
2. `xmllint --noout`
3. `cairosvg <svg> -o <png> -s 2`
4. connector, geometry, endpoint, mixed-corner audit
5. 원본 크기 PNG 육안 검사
6. MDX embed와 SVG/PNG 경로 확인

전체 변경은 다음으로 닫는다.

- `git diff --check`
- `npm run build`
- `http://127.0.0.1:4321/ko/blog/bluetape-skills-sharing/` HTTP 200 확인
- 두 PNG가 실제 route에 렌더링되는지 확인
- Part 1과 Part 2, 선행 글, repository 링크 확인

## 완료 조건

- Part 1 원고가 자연스러운 한국어 기술 문체로 읽힌다.
- 의미가 바뀐 문장, 달라진 숫자·명령·링크·식별자가 없다.
- 두 다이어그램이 각각 한 가지 독자 질문에 답한다.
- 두 SVG가 XML과 모든 적용 가능한 연결선 검사를 통과한다.
- 2배 PNG 두 개를 원본 크기로 확인했고 clipping, 잘못된 곡률, 날카로운 bend, 카드 침범, 잘못된 arrowhead가 없다.
- 사이트 build가 오류·경고 없이 성공하고 로컬 route와 모든 링크·이미지가 정상이다.
