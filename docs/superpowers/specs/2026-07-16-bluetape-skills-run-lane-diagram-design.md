# Bluetape Skills Part 3: Run과 Lane 다이어그램 설계

## 목적

`Bluetape Skills Part 3`의 `run과 lane은 어떻게 움직이나` 섹션에 Run과 Lane의 관계를 설명하는
다이어그램을 추가한다. 독자는 그림 한 장으로 다음 두 질문에 답할 수 있어야 한다.

1. 하나의 승인된 Run이 여러 Lane으로 나뉘고, 어떤 조건에서 다시 하나의 완료 판정으로 모이는가?
2. Lane 하나는 어떤 상태를 거치며, 정체된 Lane을 교체할 때 기존 실행과 새 실행을 어떻게 구분하는가?

핵심 문장은 **`Lane complete != Run complete`**다. Lane의 terminal state만으로 Run을 완료하지 않으며,
모든 required component의 terminal lane, required check, evidence와 main verification이 갖춰져야 한다.

## 작업 분류와 범위

- Work type: Type E · Maintenance
- Source repository: `bluetape4k/bluetape-skills`, pinned release tag `v1.1.0`
- Target repository: `bluetape4k/bluetape4k.github.io`
- Target section:
  - `src/content/docs/ko/blog/bluetape-skills-workflow-runtime-recovery.mdx`
  - `src/content/docs/blog/bluetape-skills-workflow-runtime-recovery.mdx`
- Locales: Korean and English parity
- Production code, release, deployment: 범위 밖

## 선택한 구성

하나의 이미지 파일 안에 독립된 두 패널을 둔다. 두 개의 별도 이미지로 나누면 첫 패널을 읽은 뒤 두 번째
패널까지 내려가야 관계를 조합해야 하고, 한 흐름으로 합치면 Run의 정적 구조와 Lane의 시간 순서가 섞인다.
따라서 **두 패널을 한 canvas에 배치하되, 패널별 문법을 분리하는 방식**을 사용한다.

- 왼쪽 패널: architecture/ownership view
- 오른쪽 패널: compact lifecycle/state view
- 중앙 또는 하단 bridge: `Lane complete != Run complete`

다이어그램 전체는 `bluetape-diagram`의 architecture 규칙을 기본으로 사용한다. 오른쪽 패널은 상태 순서를
보여 주지만 participant, lifeline, activation을 사용하는 호출 sequence가 아니므로 full sequence diagram으로
그리지 않는다. 대신 상태 전이를 읽을 수 있는 직교 progression과 recovery branch를 사용하고, sequence
규칙에서는 시간 순서·branch 명확성·marker 색 일치 항목만 적용한다.

## Asset 계약

- SVG source: `public/assets/bluetape-skills-run-lane-model-01.svg`
- Rendered PNG: `public/assets/bluetape-skills-run-lane-model-01.png`
- Canvas: 1600x900 SVG, CairoSVG scale 2로 3200x1800 PNG 생성
- Labels: English
- Embed: 두 locale 모두 `/assets/bluetape-skills-run-lane-model-01.png` 사용
- Placement: Run/Lane 정의 문단 바로 뒤, 시작 명령 예제보다 앞

1600x900은 두 패널의 긴 label과 recovery branch를 축소하지 않고 담기 위한 기준이다. 실제 layout에서
가독성을 확보하기 어렵다면 canvas와 viewBox를 함께 늘릴 수 있지만 16:9 비율과 두 패널의 균형은 유지한다.

## 왼쪽 패널: One Run, Multiple Lanes

### 독자 질문

“승인된 전체 작업과 개별 실행 단위는 어떻게 나뉘며, 무엇이 Run 완료를 막는가?”

### 구조

Run을 바깥 ownership container로 표현하고 다음 정보를 담는다.

- Run: approved objective, owner epoch, required topology
- Lane `write-ko`: bounded assignment, owner, state
- Lane `write-en`: bounded assignment, owner, state
- Lane `verify-site`: bounded assignment, owner, state

세 Lane은 이 Part 3 글 작업의 실제 예를 사용해 추상적인 `Lane A/B/C`보다 역할을 빠르게 이해하게 한다.
Lane 사이에는 동시 실행을 강제하는 화살표를 넣지 않는다. 나란히 배치해 병렬 실행이 가능함을 보여 주되,
dependency가 있으면 순차 실행도 가능하다는 점은 caption에서 보완한다.

각 Lane의 결과는 `Required components`와 `Checks + evidence`로 모이고, 마지막에 `Main verification`을 거쳐
`Run completed`로 이어진다. Run 완료 gate에는 `weakest_required_component`를 작은 subtitle로 표시한다.

### 의미 색상

- cyan: Run에서 Lane으로 내려가는 assignment/ownership
- blue: Lane 결과와 evidence 수집
- green: 검증을 마친 completion
- amber: 아직 충족되지 않은 gate 또는 recovery 필요 상태

## 오른쪽 패널: One Lane, Recovery and Replacement

### 독자 질문

“Lane은 어떤 상태를 지나며, 교체가 필요할 때 왜 새 Lane을 만들어야 하는가?”

### 정상 경로

다음 상태를 한 줄의 주 경로로 표현한다.

`pending -> starting -> running -> completed`

`starting`과 `running` 사이에는 `native spawn + startup-ack`을 짧은 annotation으로 둔다. 이 annotation은
Python runtime이 native tool을 실행한다는 뜻으로 보이지 않게 `Main session`을 명시한다.

### 복구 경로

`running`에서 아래쪽 branch로 분기한다.

`suspected_stall -> recovering -> replaced`

`recovering`에서 probe가 성공하면 `running`으로 돌아갈 수 있다. 교체가 필요하면 기존 Lane은 `replaced`가
되고, 별도의 `replacement lane`이 `pending`에서 시작한다. 두 Lane 사이에는 `parent lineage`를 명시하고,
replacement 쪽에 `new lane id + new agent id`를 표시한다. 기존 Lane의 늦은 결과는 `late result fenced`라는
작은 note로 현재 completion evidence에 바로 들어갈 수 없음을 보여 준다.

교체 횟수 `max_replacements = 1`은 그림을 복잡하게 만들기 때문에 내부 label로 넣지 않고 인접 caption에서
설명한다.

## 두 패널을 잇는 핵심 메시지

두 패널 아래에 다음 completion strip을 둔다.

`Terminal lanes + required checks + component evidence + main verification -> Run completed`

왼쪽의 개별 Lane 완료와 오른쪽의 `completed` state가 이 strip으로 연결된다. 따라서 독자는 Lane 하나가
끝난 것과 Run 전체가 끝난 것을 같은 사건으로 읽지 않는다.

## 시각 스타일

기존 `bluetape-skills-native-runtime-boundary-01`과 같은 dark family를 사용한다.

- canvas: deep navy `#07111f`
- panel/card: navy `#10243a` 계열
- primary cyan: `#6ee7ff`
- evidence blue: `#4f8cff`
- recovery amber: `#f5b942`
- verified green: `#4fd18b`
- title: `Architects Daughter`
- body/identifier: `Comic Mono`

제목은 `Run owns the outcome. Lanes own bounded work.`로 한다. 두 패널의 header와 border를 분리해 왼쪽은
ownership map, 오른쪽은 lifecycle이라는 차이를 즉시 알 수 있게 한다. connector는 수평·수직·rounded
orthogonal path만 사용하고 card 내부, title, border를 지나지 않는다. 같은 의미의 connector와 marker는
같은 색과 크기를 사용한다.

아이콘은 사용하지 않는다. Run, Lane, state는 실제 infrastructure service가 아니라 workflow 개념이므로
텍스트 카드가 더 정확하며, 임의의 기술 logo나 generic server icon은 오해를 만든다.

## 본문 변경

한국어와 영어 글에 각각 한 문단의 소개, PNG embed, caption을 추가한다. 기존 명령 예제와 상세 설명은
삭제하지 않는다.

한국어 caption은 다음 사실을 자연스럽게 설명한다.

- Run은 승인된 전체 결과를 소유하고 Lane은 제한된 작업을 소유한다.
- Lane은 병렬 또는 순차로 실행할 수 있다.
- replacement는 기존 Lane을 재사용하지 않고 lineage가 있는 새 Lane을 만든다.
- Lane terminal state 뒤에도 required check, component evidence, main verification이 필요하다.

영어 문단은 같은 주장과 순서를 유지하되 한국어 문장을 직역하지 않는다. 두 locale의 asset path, 배치,
핵심 용어, 상태 이름은 동일하게 유지한다.

## 금지하는 오해

다이어그램은 다음을 암시하면 안 된다.

- Run 자체가 agent이거나 native action을 실행한다.
- Lane이 단순한 chat thread나 메시지 하나다.
- 모든 Lane은 반드시 병렬로 실행된다.
- `lane-complete`가 즉시 `run-complete`를 뜻한다.
- 교체 agent가 기존 Lane id를 이어받아 같은 실행으로 기록된다.
- heartbeat 또는 liveness만으로 progress나 completion을 증명한다.
- Python runtime이 native spawn, send, wait, interrupt를 호출한다.

## Source 근거

| 시각 주장 | `v1.1.0` 근거 |
| --- | --- |
| Run과 Lane의 상태 및 transition | `skills/bluetape-workflow/references/workflow-manifest.json` |
| Run 완료에 lanes, topology, checks, main verification 필요 | `workflow-manifest.json`의 `transition_policy.run.evidence_by_target.completed` |
| 가장 약한 required component가 전체 완료를 제한 | `skills/bluetape-workflow/references/topology-contract.md` |
| Lane replacement는 distinct lane/agent와 parent lineage 사용 | `skills/bluetape-workflow/references/liveness-contract.md` |
| `lane-complete` 뒤 checks와 component evidence 기록 | `liveness-contract.md` Main-Session Sequence 8 |
| Python은 native collaboration tool을 호출하지 않음 | `liveness-contract.md` 마지막 문단 |

모든 공개 source link는 변경 가능한 `develop`이 아니라 `v1.1.0` tag를 가리킨다.

## 검증 계약

1. 기존 runtime boundary PNG를 full size로 열어 palette, font, title, card, marker family를 비교한다.
2. SVG를 `xmllint --noout`으로 검증한다.
3. CairoSVG scale 2로 PNG를 생성하고 3200x1800 원본 크기로 눈 검수한다.
4. connector, geometry `--fail-diagonal`, endpoint, mixed-corner audit를 실행한다.
5. audit가 SVG 구조를 충분히 읽지 못하면 Run 1개, Lane 4개 이상, 정상 상태 4개, recovery 상태 3개,
   lineage 1개, completion gate 1개의 fallback invariant를 검사한다.
6. 원본 PNG에서 text clipping, contrast, panel 구분, connector 방향, marker 색, border/card 침범,
   crossing, corner, whitespace를 확인한다.
7. EN/KO의 asset path, 배치, alt/caption, 핵심 주장 parity를 비교한다.
8. `git diff --check`를 실행한다.
9. `npm run build`를 실행하고 두 route의 생성 HTML에 새 PNG 경로가 포함되는지 확인한다.

## 완료 조건

- 한 이미지 안의 두 패널로 Run 구조와 Lane 생명주기를 각각 독립적으로 읽을 수 있다.
- `Lane complete != Run complete`가 시각적으로 명확하다.
- replacement가 distinct lane/agent와 lineage를 가진다는 사실이 드러난다.
- 기존 Part 3 dark diagram family와 일관된다.
- 한국어와 영어 글이 같은 asset과 source-backed 주장을 공유한다.
- `bluetape-diagram`의 공통·architecture checklist와 적용 가능한 sequence 항목을 통과한다.
- SVG/PNG, 본문 embed, site build와 route asset 참조가 모두 검증된다.
