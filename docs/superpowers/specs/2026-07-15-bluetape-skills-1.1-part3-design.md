# Bluetape Skills Part 3: 1.1.0 Native Workflow Runtime 글 설계

## 목적

`Bluetape Skills` 1.1.0이 추가한 Phase 2 native workflow runtime을 기존 시리즈의 세 번째 글로 설명한다.
주요 독자는 Part 1에서 skill 배포 구조를, Part 2에서 분류·승인·checklist gate를 읽은 개발자다. 이번 글은
긴 작업이나 native subagent 작업이 중단됐을 때 무엇을 근거로 상태를 판단하고, 어떻게 이어서 실행하거나
별도 recovery run으로 복구하는지 보여 준다.

글의 중심은 **중단된 workflow를 이어서 복구하는 방법**이다. `bluetape-flow.py`가 Codex native agent
도구를 대신하지 않고 main session이 수행한 coordination을 기록·검증한다는 실행 경계도 독립 섹션으로
간략하지만 명확하게 설명한다.

## 작업 분류와 범위

- Work type: Type E · Maintenance
- Source repository: `bluetape4k/bluetape-skills`, pinned release tag `v1.1.0`
- Target repository: `bluetape4k/bluetape4k.github.io`
- Primary locale: Korean
- Required parity locale: English
- Production code or release changes: 없음
- PR, merge, deploy: 별도 delivery gate 전까지 범위 밖

## 공개 경로와 파일

| 역할 | 한국어 | 영어 |
| --- | --- | --- |
| 새 글 | `src/content/docs/ko/blog/bluetape-skills-workflow-runtime-recovery.mdx` | `src/content/docs/blog/bluetape-skills-workflow-runtime-recovery.mdx` |
| 공개 route | `/ko/blog/bluetape-skills-workflow-runtime-recovery/` | `/blog/bluetape-skills-workflow-runtime-recovery/` |
| 제목 | `Bluetape Skills Part 3: 중단된 workflow를 이어서 복구하는 방법` | `Bluetape Skills Part 3: Recovering and Resuming Interrupted Workflows` |

두 locale은 동일한 Part 번호, 기술 주장, 숫자, source link, Hero, 본문 다이어그램, 시리즈 순서를 유지한다.
한국어 원문을 먼저 완성하고 사실·문체 검토 뒤 영어를 자연스럽게 현지화한다.

한국어 교정은 사실을 고정한 뒤 수행한다. 먼저 identifier, 숫자, 명령, 링크를 source와 대조해 잠그고,
그다음 문단별로 번역투, 불필요한 명사화, 주어 반복, 과도한 피동형, 추상적인 홍보 문구를 걷어 낸다.
독자가 실제로 무엇을 보고 어떤 판단을 내려야 하는지 구체적인 동사와 짧은 문장으로 설명한다. 다만 자연스럽게
보이기 위해 사실, 사용자 표현, 코드 용어를 바꾸거나 근거 없는 비유를 새로 만들지 않는다. 한국어 원문의
KO-01~KO-06 검수를 마친 뒤에만 영어 현지화를 시작한다.

## 독자 문제와 핵심 논지

Part 2의 checklist는 무엇을 확인해야 하는지와 gate 순서를 설명했다. 그러나 작업이 길어지고 여러 lane이
생기면 다음 문제가 남는다.

1. agent의 침묵이 정상적인 장기 작업인지 stall인지 구분하기 어렵다.
2. heartbeat나 완료 보고가 실제 component evidence로 오인될 수 있다.
3. 세션 handoff나 agent replacement 뒤 이전 owner의 결과가 현재 상태를 덮을 수 있다.
4. receipt가 손상됐을 때 기록을 잘라내고 계속하면 provenance를 신뢰할 수 없다.
5. 일부 lane만 끝났는데 전체 작업이 완료된 것처럼 닫힐 수 있다.

1.1.0 runtime은 이 문제를 새 orchestrator로 해결하지 않는다. Manifest 1.1이 run, lane, liveness,
topology, receipt, evidence 한도를 계약으로 고정하고, guarded CLI가 main session이 관찰한 native action을
fail-closed 방식으로 기록한다. 전체 완료는 설명이나 heartbeat가 아니라 가장 약한 required component의
terminal lane, required check, evidence coverage로 판정한다.

## 글의 구성

### 1. 왜 복구 가능한 workflow가 필요했나

- Part 2의 마지막 지점에서 시작한다.
- 긴 작업, 여러 subagent, 세션 중단을 실제 운영 문제로 제시한다.
- “agent가 끝났다고 말함”과 “완료에 필요한 증거가 모두 있음”을 구분한다.

### 2. 문서형 checklist에서 native runtime으로

- 1.0.0은 14개 canonical skill과 reference·template·script를 공유 가능한 bundle로 만들었다.
- 1.1.0은 Phase 2 runtime, Manifest 1.1, topology/liveness/receipt contract를 추가했다.
- runtime의 목적은 절차를 더 길게 만드는 것이 아니라 중단 뒤에도 검증 가능한 상태를 남기는 것이다.

### 3. run과 lane의 수명주기

- `run-approve -> run-start -> lane-create -> lane-start`의 최소 흐름을 설명한다.
- native spawn은 `lane-start` 기록 뒤 main session이 직접 수행하고, 관찰한 결과로 `startup-ack`을 남긴다.
- lane terminal state, replacement lineage, late result fencing을 설명한다.
- 전체 CLI command catalog를 나열하지 않고 독자가 복구 흐름을 이해하는 데 필요한 명령만 사용한다.

### 4. liveness는 progress가 아니다

- active native subagent는 30초 간격으로 관찰한다.
- 120초 침묵은 lease가 없다면 suspected stall 후보가 된다.
- 한 silence lease는 최대 600초이고, fresh bounded evidence와 이유가 있어야 갱신한다.
- suspected stall 뒤 probe grace는 60초다.
- heartbeat는 liveness만 증명하며 progress, changed path, check, component, completion evidence가 아니다.

### 5. 가장 약한 required component가 완료를 결정한다

- topology component의 `required`, `owner_lane`, `required_checks`, `dependencies`, `evidence_refs`,
  `coverage_state`를 독자 관점에서 설명한다.
- `weakest_required_component` 규칙을 작은 예제로 보여 준다.
- 한 lane이 끝나도 required check나 evidence가 비어 있으면 전체 run은 완료할 수 없음을 강조한다.

### 6. receipt를 이용한 중단·손상 복구

- healthy run은 `resume-check` 뒤 owner epoch를 올려 resume한다.
- 이전 owner handle은 fencing되고 제거되며 이전 agent가 현재 state를 수정하지 못한다.
- 손상된 receipt는 `receipt-diagnose`로 trusted prefix와 첫 손상 지점을 읽는다.
- 기존 chain을 truncate·edit·continue하지 않는다.
- 진단 checksum과 승인 근거를 사용해 immutable quarantine copy와 별도 recovery run을 만든다.

### 7. 기록하는 runtime, 실행하는 Codex

- 이 섹션은 보조 논지지만 독립 heading으로 둔다.
- Python runtime은 native `spawn`, `send`, `wait`, `interrupt`를 호출하지 않는다.
- main session이 intent를 먼저 기록하고 native tool을 실행한 뒤 bounded observed evidence를 기록한다.
- `.bluetape` state는 `bluetape-flow.py`만 쓰며 수동 편집은 지원하지 않는다.
- owner credential, raw prompt, secret, 무제한 tool output을 receipt에 넣지 않는 경계를 설명한다.

### 8. 1.1.0 설치와 검증

- `v1.1.0` tag를 별도 디렉터리에 shallow clone한다.
- `./scripts/validate.sh` 뒤 `./scripts/install.sh --force`로 기존 skill을 백업하며 교체한다.
- 설치 후 Codex를 재시작한다.
- `code-review`와 `self-audit`는 외부 companion skill이며 bundle에 포함되지 않는다.
- release note의 `133 tests / 151 subtests`, `83 files parity`는 당시 release-candidate 검증 결과로만
  소개하고 현재 독립 재검증 결과처럼 표현하지 않는다.

### 9. 언제 runtime을 사용해야 하나

- 간단한 문서 수정이나 한 agent의 짧은 작업에는 runtime state가 과한 비용일 수 있다.
- 장기 작업, 병렬 lane, 명시적 handoff, replacement, 손상 복구, component 단위 완료 판정이 필요한 작업에
  적합하다.
- 마무리는 추상적인 전망 대신 독자가 적용할 수 있는 선택 기준으로 끝낸다.

## 기술 예제

본문은 두 개의 짧은 text 예제를 사용한다.

1. `run-approve`부터 `startup-ack`까지의 정상 시작 흐름.
2. `liveness-check -> stall-record -> probe-sent -> interrupt-result -> lane-reassign`의 복구 흐름.

실제 owner token이나 내부 path를 예제에 넣지 않는다. 전체 command option을 복제하지 않고 source link로
연결한다. JSON 예제가 필요하면 topology contract의 고정 shape에서 최소 필드만 사용한다.

## 시각 설계

### Hero

- Path: `public/assets/bluetape-skills-runtime-recovery-hero.png`
- Size: 1200x630 PNG
- Style: Part 1·2의 polished 3D miniature workbench와 white/blue robotic builders를 잇되, deep navy와 charcoal을
  바탕으로 한 cinematic dark technical environment
- Lighting: cyan/blue rim light를 주조명으로 쓰고 stall/recovery 지점에만 amber를 제한적으로 사용한다. 어두운
  부분이 뭉개지지 않도록 주 피사체와 작업대의 형태를 읽을 수 있는 대비를 확보한다.
- Scene: Part 2 router 작업대의 한 lane이 amber 상태로 멈추고, 로봇이 glowing receipt를 들고 blue recovery
  bridge를 연결한다. 나머지 lane은 blue/green 정상 상태를 유지한다.
- Text in image: 없음
- First-viewport subject: 멈춘 lane과 receipt 기반 복구 연결

한국어와 영어 글은 같은 Hero를 공유하고 locale별 alt와 figcaption만 자연스럽게 작성한다. 기존 Part 1·2
Hero와 같은 크기의 contact sheet로 비교해 generic stock, flat diagram, 과도한 amber 비중을 거른다.

### 본문 다이어그램

- Source: `public/assets/bluetape-skills-native-runtime-boundary-01.svg`
- Rendered asset: `public/assets/bluetape-skills-native-runtime-boundary-01.png`
- Kind: architecture/flow
- Labels: English
- Reader question: “누가 native action을 실행하고, 무엇이 intent와 observed evidence를 기록하는가?”
- Required boundary: Main Session -> Native Codex Tools, Main Session -> Guarded CLI -> Manifest/Receipt/Topology
- Forbidden implication: Python runtime이 native agent tool을 직접 호출하는 것처럼 보이면 안 된다.

이 그림은 시간 순서를 설명하는 sequence diagram이 아니라 실행 주체와 기록 책임을 구분하는 정적 architecture
diagram이다. `Main Session`, `Native Codex Tools`, `Guarded Evidence Runtime`, `Manifest / Receipt / Topology`
네 영역을 가로 방향으로 배치한다. Main Session에서 Native Codex Tools로 향하는 실행 경로와 Main Session에서
Guarded CLI를 거쳐 state로 향하는 기록 경로를 분리하고, 관찰 결과가 evidence runtime으로 돌아오는 방향도
명확히 표시한다.

다이어그램도 Hero와 같은 dark style을 사용한다. canvas는 deep navy/charcoal, layer card는 배경보다 한 단계
밝은 navy로 두고 다음 색을 일관된 의미로 사용한다.

- cyan: main session이 시작하는 primary action
- blue: 관찰된 evidence와 state 기록
- amber: stall, probe, recovery 경계
- green: 검증된 terminal/completion 상태

색과 dashed line의 의미는 그림 안의 작은 legend 또는 바로 인접한 caption에서 설명한다. connector는
orthogonal/rounded path로 그리고 card 내부를 가로지르거나 label과 충돌하지 않게 한다. typography는 기존
다이어그램 자산과 호환되는 `Architects Daughter`와 `Comic Mono` 계열을 우선 사용하되, 실제 렌더링에서
fallback까지 확인한다. 모든 label은 dark background에서 충분한 contrast를 가져야 하며 text clipping은
허용하지 않는다.

SVG를 CairoSVG scale 2로 PNG로 렌더링하고 최종 PNG를 full size로 검사한다. 글에는 PNG를 embed하고 SVG는
source asset으로 함께 보존한다. `bluetape-diagram` checklist에 따라 XML parse, connector audit, geometry audit
(`--fail-diagonal`), endpoint audit, mixed-corner audit를 수행한다. 감사 도구가 해당 SVG 구조를 완전히 해석하지
못하면 빈 성공 결과를 통과로 간주하지 않고, path/marker/count의 의미 있는 nonzero invariant를 별도로 검사한다.

원본 크기 눈 검수에서는 label의 가독성과 clipping, 색 의미와 legend의 일치, connector 방향, 직교 endpoint,
corner 품질, 교차선, card 침범, canvas margin과 여백 균형을 확인한다. Hero도 1200x630 원본과 기존 시리즈
contact sheet를 함께 보고 dark tone이 지나치게 탁하거나 recovery subject가 묻히지 않는지 검수한다.

## 시리즈 내비게이션

다음 EN/KO 글의 시리즈 목록에 Part 3를 추가한다.

- `ai-collaboration-environment.mdx`
- `bluetape-skills-sharing.mdx`
- `bluetape-skills-workflow-guide.mdx`
- 새 Part 3 글

각 locale에서 선행 글과 Part 1·2·3 링크가 같은 순서로 나타나야 한다. Part 3에는 `v1.1.0` release,
repository, issue `#5`, PR `#6`, `v1.0.0...v1.1.0` compare link를 source section에 제공한다.

## 근거와 주장 제한

모든 1.1.0 구현 link는 변경될 수 있는 `develop`이 아니라 글의 기준점인 `v1.1.0` tag를 가리킨다.

| 주장 | 근거 |
| --- | --- |
| 1.1.0 release date와 release assets | GitHub Release `v1.1.0` |
| Phase 2 runtime과 Manifest 1.1 | `CHANGELOG.md`, `README.ko.md`, `workflow-manifest.json` at `v1.1.0` |
| 30/120/600/60 liveness 숫자 | `liveness-contract.md`, `workflow-manifest.json` at `v1.1.0` |
| weakest required component 완료 규칙 | `topology-contract.md` at `v1.1.0` |
| guarded command와 recovery/handoff/live report | `topology-contract.md`, `bluetape-flow.py` at `v1.1.0` |
| 공개 bundle과 external companion 경계 | `skills/manifest.json`, README at `v1.1.0` |
| release 당시 검증 숫자 | GitHub Release body와 PR `#6` |

다음 표현은 사용하지 않는다.

- GitHub가 검증한 signed tag
- Git tag가 기술적으로 immutable하다는 단정
- Python runtime이 native agent tool을 실행한다는 설명
- release 당시 검증 숫자를 이번 글 작업에서 새로 재검증했다는 표현
- heartbeat만으로 progress나 completion을 증명한다는 설명

## 검증 계약

1. 한국어 identifier·숫자·명령·링크를 source와 대조해 고정한다.
2. `bluetape-writer`의 KO-01~KO-06 기준으로 문단별 자연스러움을 검수하고 번역투, 불필요한 명사화,
   주어 반복, 과도한 피동형, 추상적인 홍보 문구를 제거한다.
3. 한국어 사실·문체 검토를 통과한 뒤 영어를 현지화한다.
4. EN/KO frontmatter, title, Part 번호, date, image, source link, 숫자, navigation parity 확인.
5. Hero 1200x630 확인, 기존 시리즈 contact-sheet 비교, 원본 크기 dark-style 눈 검수.
6. 다이어그램에 `xmllint --noout`, CairoSVG scale 2 render, connector audit, geometry audit
   (`--fail-diagonal`), endpoint audit, mixed-corner audit를 수행하고 각 결과의 meaningful nonzero invariant를
   확인한다.
7. 렌더링한 다이어그램 PNG를 원본 크기로 열어 text, contrast, legend, connector, endpoint, corner,
   crossing, card intrusion, margin을 눈으로 검사한다.
8. `git diff --check`와 새 route·asset reference 검색.
9. `npm test`와 `npm run build` 실행.
10. 생성된 EN/KO HTML에서 title, Hero, diagram, series link, OG image metadata 확인.
11. 최종 review에서 P0=0, P1=0 확인.

## 완료 조건

- Part 3가 1번 방향을 중심으로 2번 실행 경계를 독립 섹션에 포함한다.
- 근거 없는 기술 주장과 release 검증 과장이 없다.
- 한국어와 영어 글이 같은 내용을 자연스럽게 전달한다.
- Part 1·2의 시각 언어를 dark style로 확장한 Hero와 source-backed runtime boundary diagram이 있다.
- 한국어 원문은 사실을 보존하면서 `bluetape-writer`의 자연스러움 검수를 통과한다.
- runtime boundary diagram은 `bluetape-diagram` checklist와 원본 크기 눈 검수를 모두 통과한다.
- 선행 글을 포함한 네 글의 EN/KO 시리즈 링크가 Part 3까지 이어진다.
- 전체 site test와 production build가 통과하고 두 공개 route의 생성 HTML이 검증된다.
