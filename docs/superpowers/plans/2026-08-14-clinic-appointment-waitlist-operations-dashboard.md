# 대기 목록 운영 화면 글 구현 계획

> **에이전트 작업 규칙:** 이 계획은 승인된 설계 문서를 작업 단위로 나눈 것이다. 각 단계의 체크박스를 실제 파일·명령·검증 결과와 함께 갱신한다.

**목표:** `STAFF`가 병원 대기 목록에서 지금 확인할 항목과 실행 가능한 다음 명령을 판단할 수 있도록, 한국어 기술문서와 EN/KO 시각 자료를 완성한다.

**구성:** 한국어 글을 먼저 작성하고 사실·자연스러움 검토와 로컬 preview를 거친다. 그 다음 동일한 기술 의미를 영어로 현지화한다. 메인 운영 화면은 정적 SVG→PNG 흐름도, 명령 결과는 시퀀스 SVG→PNG로 만들며, 각 locale에 별도 asset과 semantic ledger를 둔다.

**기술 스택:** Astro/Starlight MDX, Markdown frontmatter, SVG, CairoSVG scale 2, Python diagram audits, `npm run build`, local Astro preview.

**근거 설계:** `docs/superpowers/specs/2026-08-14-clinic-appointment-waitlist-operations-dashboard-design.md`

---

## 파일 및 책임 범위

- 생성: `src/content/docs/ko/blog/clinic-appointment-waitlist-operations-dashboard.mdx` — 한국어 원문과 `/ko/blog/clinic-appointment-waitlist-operations-dashboard/` route.
- 생성: `src/content/docs/blog/clinic-appointment-waitlist-operations-dashboard.mdx` — 한국어 승인 후 영어 현지화와 `/blog/clinic-appointment-waitlist-operations-dashboard/` route.
- 수정: `src/content/docs/ko/blog/clinic-appointment-waitlist-core.mdx` — 새 글의 다음 글 링크와 시리즈 navigation.
- 수정: `src/content/docs/blog/clinic-appointment-waitlist-core.mdx` — 영어 route의 같은 navigation 갱신.
- 생성: `public/assets/clinic-appointment-waitlist-operations-dashboard-hero.png` — 같은 시리즈의 작은 로봇 작업대 분위기를 유지한 hero bitmap.
- 생성: `public/assets/clinic-appointment-waitlist-operations-dashboard-01-{ko,en}.svg` — 지표 → 조치 큐 → 근거 패널 → 명령 결과의 메인 운영 흐름 원본.
- 생성: `public/assets/clinic-appointment-waitlist-operations-dashboard-01-{ko,en}.png` — 위 SVG의 CairoSVG scale 2 게시 raster.
- 생성: `public/assets/clinic-appointment-waitlist-operations-command-01-{ko,en}.svg` — STAFF confirm/replay/processing/conflict 시퀀스 원본.
- 생성: `public/assets/clinic-appointment-waitlist-operations-command-01-{ko,en}.png` — 위 시퀀스 SVG의 CairoSVG scale 2 게시 raster.
- 생성: `docs/review/2026-08-14-clinic-appointment-waitlist-operations-dashboard-01-{ko,en}.semantic.json` — 메인 흐름의 source-backed node/edge ledger.
- 생성: `docs/review/2026-08-14-clinic-appointment-waitlist-operations-command-01-{ko,en}.semantic.json` — 시퀀스의 participant/message/branch ledger.

`clinic-appointment` 소스 저장소의 구현 파일은 읽기 전용 근거로 사용한다. 이 작업은 그 저장소의 코드를 수정하지 않는다.

## Task 1: 사실·용어·라우트 고정

- [x] **Step 1: 승인된 설계와 현재 소스를 다시 대조한다.**

  확인할 파일:

  - `/Users/debop/work/bluetape4k/clinic-appointment/docs/api/waitlist-delivery.md`
  - `/Users/debop/work/bluetape4k/clinic-appointment/docs/requirements/waitlist-delivery.md`
  - `/Users/debop/work/bluetape4k/clinic-appointment/appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/controller/WaitlistController.kt`
  - `/Users/debop/work/bluetape4k/clinic-appointment/appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/dto/WaitlistResponses.kt`
  - `/Users/debop/work/bluetape4k/clinic-appointment/appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/waitlist/WaitlistDeliveryHealthIndicator.kt`
  - `/Users/debop/work/bluetape4k/clinic-appointment/appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/waitlist/WaitlistDeliveryMetrics.kt`
  - `/Users/debop/work/bluetape4k/clinic-appointment/appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/waitlist/WaitlistDeliveryScheduling.kt`

  기록할 사실:

  - base path와 entry/offer 조회·confirm·decline route
  - `Idempotency-Key`, `expectedVersion`, keyset cursor의 제약
  - `201` replay, `202 IDEMPOTENCY_IN_PROGRESS`, `409 OFFER_EXPIRED`/`DECISION_STALE`/`SLOT_OCCUPIED`
  - `active offers`, `active holds`, `expired backlog`, `oldest vacancy age` metric 이름
  - `UP`/`DEGRADED`/`OUT_OF_SERVICE` 임계값
  - `GLOBAL_OFF`·`CLINIC_DISABLED`에서도 expiry/suppression/hold reconcile이 실행되는 순서

  실행:

  ```bash
  git -C /Users/debop/work/bluetape4k/clinic-appointment rev-parse develop
  git -C /Users/debop/work/bluetape4k/clinic-appointment status --short --branch
  ```

  기대 결과: 소스 ref가 기록되고, 읽기 전용 근거 저장소에 사용자 변경이 없으며, 위 목록과 실제 이름이 일치한다. 소스와 설계가 다르면 문장으로 덮지 말고 해당 주장을 보류한다.

  증거: `clinic-appointment` `develop`은 `f783de85efc25e4c8386a34ab6599eca99093eae`이며, 소스 worktree에는 기존 미추적 `.superpowers/`만 있어 보존한다. `WaitlistController`, API 계약, health, metrics, properties, scheduling에서 route·오류·임계값·rollout 순서를 확인했다.

- [x] **Step 2: 한국어 용어표를 고정한다.**

  본문·표·캡션·alt text에서 다음 표현을 일관되게 사용한다.

  | 의미 | 사용할 표현 | 보존할 토큰 |
  | --- | --- | --- |
  | operations dashboard | 대기 목록 운영 화면 | `STAFF` |
  | action queue | 조치 큐 | `queue`는 API/코드 설명에서만 사용 |
  | offer | 대기 제안 | `offerRef`, `WaitlistOfferResponse` |
  | `deliveryState=UNKNOWN` | 전송 결과 미확인 | `deliveryState=UNKNOWN` |
  | evidence panel | 근거 패널 | `policyVersion`, `reasonCode` |
  | terminal outcome decision | 종료 상태 결정 | exact diagram label |
  | idempotency replay | 멱등성 재생 | `Idempotency-Key`, `Idempotent-Replay` |
  | stale/conflict | 오래된 결정 / 버전 충돌 | exact HTTP reason codes |

  `~를 통해`, `~에 있어서`, `~되어진다`, `가지고 있다` 같은 번역투를 초안에서 제거하고 `읽는다`, `검증한다`, `재조회한다`, `차단한다`, `반환한다` 같은 구체적인 동사를 사용한다. “한 빈자리에는 active offer 하나만”처럼 중복 수식을 쓰지 않고 `빈자리의 활성 제안은 하나로 제한한다`로 쓴다.

  증거: 승인된 용어표와 `/Users/debop/.codex/skills/bluetape-writer/references/korean-naturalness-checklist.md`의 보존·자연스러움 규칙을 적용할 초안 기준을 고정했다.

## Task 2: 한국어 기술문서 작성

- [x] **Step 1: 한국어 frontmatter·hero·첫 단락을 작성한다.**

  `src/content/docs/ko/blog/clinic-appointment-waitlist-operations-dashboard.mdx`에 다음 계약을 적용한다.

  ```yaml
  title: "대기 목록 운영 화면은 상태판이 아니라 조치판이다"
  description: 병원 STAFF가 대기 제안의 만료 임박, 전송 결과 미확인, 오래된 결정과 hold 정체를 지표·조치 큐·허용된 명령으로 판단하는 운영 화면 설계를 설명합니다.
  sidebar:
    order: -202608141100
  blog:
    date: 2026-08-14T11:00:00+09:00
    image: /assets/clinic-appointment-waitlist-operations-dashboard-hero.png
    imageAlt: 병원 운영자가 지표와 조치 큐를 확인하고 대기 제안의 다음 명령을 선택하는 작은 로봇 작업대
    cardDescription: "대기 목록을 상태 목록으로 끝내지 않고, 병원 지표·조치 큐·근거·허용된 명령으로 연결하는 운영 화면을 설명합니다."
    tags: ["architecture", "operations", "resilience", "concurrency", "appointment-service", "example"]
  ```

  영문 식별자와 상태는 코드 형식 그대로 두되, 첫 단락에서는 `STAFF`가 “지금 무엇을 먼저 확인할지” 판단해야 하는 구체적인 상황을 제시한다. `중요하다`, `강력하다`, `효율적이다` 같은 평가 대신 `UNKNOWN`을 수락 성공으로 덮으면 어떤 오류가 생기는지 바로 보여준다.

  증거: `src/content/docs/ko/blog/clinic-appointment-waitlist-operations-dashboard.mdx`에 승인된 title, route order, hero path, tags와 운영 상황을 작성했다.

- [x] **Step 2: A 형태의 본문을 작성한다.**

  다음 순서와 독자 질문을 지킨다.

  1. 상태 목록만으로는 만료 임박·`UNKNOWN`·stuck hold의 우선순위를 알 수 없는 운영 상황
  2. 병원 단위 지표와 readiness를 읽는 방법
  3. 만료 임박·전송 결과 미확인·오래된 결정·hold 정체를 조치 큐로 정렬하는 이유
  4. `offerRef`, `entryRef`, `version`, `expiresAt`, `deliveryState`와 제한된 policy 근거를 보여주는 근거 패널
  5. confirm/decline, `Idempotency-Key`, `expectedVersion`, replay/processing/conflict 결과
  6. `GLOBAL_OFF`·`CLINIC_DISABLED`에서도 expiry/suppression/reconcile을 수행하는 recovery 경계
  7. STAFF·개발자·PO·병원 관계자가 같은 화면을 다르게 읽는 방법
  8. 핵심 요약, 근거 자료, 시리즈 navigation

  각 절은 `운영자의 문제 → 최소한의 source-backed 정보 → 해석 → 자동 성공으로 간주하지 않을 조건` 순으로 작성한다. 대시보드가 환자 이름·연락처·clinical note·원시 score vector를 노출하지 않는 이유를 보안 일반론이 아니라 실제 API 응답 경계와 연결한다.

  증거: 한국어 초안에 지표 표, 네 가지 조치 큐 표, 근거 패널 항목, confirm 결과 표, rollout scheduler 순서, 역할별 읽기 표와 근거 링크를 포함했다.

- [x] **Step 3: 한국어 자연스러움 pass를 수행한다.**

  사실을 바꾸지 않은 상태에서 `/Users/debop/.codex/skills/bluetape-writer/references/korean-naturalness-checklist.md`의 KO-01~KO-06을 모두 점검한다.

  - KO-01: source path, 상태명, 숫자, HTTP reason code, URL 보존
  - KO-02: 중요성·효율성 주장 삭제 또는 동작·임계값으로 대체
  - KO-03: 영어 문장 골격, 기계적 `첫째/둘째/셋째`, 명사화와 번역투 제거
  - KO-04: `제안`, `조치 큐`, `근거 패널`, `종료 상태 결정` 용어 일관성 확인
  - KO-05: 독자가 이해하지 못할 비유와 홍보 문장 제거
  - KO-06: frontmatter, 표, 링크 텍스트, 캡션, alt text까지 다시 읽기

  결과를 설계 문서와 이 계획의 검증 기록에 남긴다. 의미가 바뀌는 문장은 되돌리고, 자연스럽게 다듬은 문장만 유지한다.

  증거: frontmatter·본문·표·캡션·alt text를 다시 읽었고 `git diff --no-index --check`와 번역투 차단 패턴 검사에서 오류가 없었다. `Idempotency-Key` 예시는 독자가 재실행 의미를 이해할 수 있도록 구체적인 ASCII key로 작성했다.

- [ ] **Step 4: 선행 글의 시리즈 연결을 갱신한다.**

  `clinic-appointment-waitlist-core.mdx`의 EN/KO 본문 마지막 문장과 `## Series` 목록에 다음 route를 추가한다.

  ```md
  [대기 목록 운영 화면은 상태판이 아니라 조치판이다](/ko/blog/clinic-appointment-waitlist-operations-dashboard/)
  ```

  영어 파일에는 영어 제목과 `/blog/clinic-appointment-waitlist-operations-dashboard/`를 사용한다. 기존 source 링크·문단·시리즈 순서는 보존한다.

## Task 3: Hero와 메인 운영 흐름 다이어그램 작성

- [x] **Step 1: 같은 시리즈 hero와 다이어그램 기준을 확인한다.**

  원본 참고:

  - `public/assets/clinic-appointment-waitlist-core-hero.png`
  - `public/assets/clinic-appointment-waitlist-state-01-ko.png`
  - `public/assets/clinic-appointment-waitlist-claim-01-ko.png`
  - 최근 승인된 시퀀스 참고 PNG 2개: `public/assets/booking-reliability-sequence-01-en.png`, `public/assets/clinic-appointment-desired-visit-date-commitment-sequence-01-ko.png`

  `$bluetape-diagram`의 `references/common.md`, `architecture.md`, `workflow.md`, `sequence.md`, `semantic-ledger.md` 규칙을 적용한다. 메인 화면은 source-backed 정적 운영 흐름이므로 SVG→PNG를 사용하고, HTML workflow companion으로 우회하지 않는다. Hero는 같은 미니어처 작업대 언어를 유지하되 기존 hero를 재사용하지 않고 운영 화면을 주제로 새 bitmap을 만든다.

- [x] **Step 2: hero bitmap을 생성하고 원본 크기로 확인한다.**

  `public/assets/clinic-appointment-waitlist-operations-dashboard-hero.png`를 생성한다. 장면에는 병원 운영 보드, 상단 지표, 전체 폭 조치 큐, 선택된 대기 제안과 작은 데이터베이스 fence를 넣되, 읽어야 하는 긴 문장이나 실제 환자 식별자를 넣지 않는다. 생성 후 `view_image`로 full-size를 확인하고 기존 waitlist hero와 색·조명·미니어처 스케일이 맞는지 기록한다.

- [x] **Step 3: 메인 운영 흐름의 semantic ledger를 작성한다.**

  `docs/review/2026-08-14-clinic-appointment-waitlist-operations-dashboard-01-ko.semantic.json`과 `...-en.semantic.json`을 만들고 `kind: "workflow"`로 선언한다. source revision은 Step 1에서 읽은 `clinic-appointment` `develop` SHA를 기록한다. 노드는 `Clinic readiness`, `운영 지표`, `조치 큐`, `선택 항목 근거`, `허용 명령`, `종료 상태 결정`으로 제한하고, edge는 지표 읽기·큐 선택·근거 조회·명령 실행·결과 표시 관계만 선언한다. `UNKNOWN`·`processing`·`conflict`·`requeue`는 결과 edge로 source path를 각각 기록한다.

  예상 복잡도는 workflow 기본 예산(노드 10, edge 14, branch 3, loop 1) 안에 둔다. 다이어그램의 모호한 수평 점선은 ledger에 넣지 않는다.

- [x] **Step 4: 메인 SVG를 EN/KO 각각 작성한다.**

  `public/assets/clinic-appointment-waitlist-operations-dashboard-01-ko.svg`와 `...-en.svg`를 작성한다.

  - 수직으로 `지표 → 조치 큐 → 근거 패널 → 허용 명령/결과`를 넓은 카드로 배치한다.
  - `OFFERED`에서 수평 점선으로 빠지는 관계를 만들지 않고, `종료 상태 결정`/`terminal outcome decision` 노드를 명시한다.
  - 관측/참조 점선과 상태 변경 실선을 색상·범례로 구분한다.
  - 모든 연결선은 source/target, 둥근 직교 꺾임, 충분한 terminal segment, 역할별 marker를 갖는다.
  - 한국어 라벨은 `goorm Sans`/`goorm Sans Code`, 영어 라벨은 `Architects Daughter`/`Comic Mono` 계열을 사용한다.
  - 카드 하단 여백과 층 사이 수직 간격을 넓혀 레이블·연결선이 겹치지 않게 한다.

- [x] **Step 5: SVG를 PNG로 렌더링하고 메인 흐름을 감사한다.**

  각 locale마다 실행한다.

  ```bash
  xmllint --noout public/assets/clinic-appointment-waitlist-operations-dashboard-01-ko.svg
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py public/assets/clinic-appointment-waitlist-operations-dashboard-01-ko.svg
  cairosvg public/assets/clinic-appointment-waitlist-operations-dashboard-01-ko.svg -o public/assets/clinic-appointment-waitlist-operations-dashboard-01-ko.png -s 2
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-semantic-audit.py --repo-root . --json docs/review/2026-08-14-clinic-appointment-waitlist-operations-dashboard-01-ko.semantic.json
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py public/assets/clinic-appointment-waitlist-operations-dashboard-01-ko.svg
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-arrowhead-audit.py public/assets/clinic-appointment-waitlist-operations-dashboard-01-ko.svg
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal public/assets/clinic-appointment-waitlist-operations-dashboard-01-ko.svg
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py public/assets/clinic-appointment-waitlist-operations-dashboard-01-ko.svg
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py public/assets/clinic-appointment-waitlist-operations-dashboard-01-ko.svg
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-visual-audit.py --require-opaque public/assets/clinic-appointment-waitlist-operations-dashboard-01-ko.png
  ```

  EN에도 같은 명령을 적용한다. `view_image`로 각 PNG를 full-size 한 장씩 확인하고, 메인 화면 축소 시에도 지표·큐·근거·종료 상태 결정이 읽히는지 확인한다. 실패한 선·화살촉·공간은 SVG 원본에서 고친 뒤 PNG와 관련 audit을 다시 실행한다.

  증거: hero는 원본 크기 `view_image` 확인을 마쳤고, EN/KO semantic ledger는
  `diagram-semantic-audit.py`를 통과했다. 메인 SVG/PNG는 XML·text normalize·connector·
  arrowhead·geometry·endpoint·mixed-corner·visual 감사를 통과했으며, 라벨/카드 겹침을
  SVG 원본에서 고친 뒤 다시 통과시켰다.

## Task 4: 명령 결과 시퀀스 다이어그램 작성

- [x] **Step 1: 시퀀스 semantic ledger를 작성한다.**

  `docs/review/2026-08-14-clinic-appointment-waitlist-operations-command-01-{ko,en}.semantic.json`의 `kind`를 `sequence`로 둔다. participant는 `STAFF`, `운영 화면`, `Waitlist API`, `Idempotency/DB fence`, `예약 결과`로 제한하고, message는 선택·version 조회·confirm 요청·첫 성공·같은 key replay·processing 재조회·stale/expired conflict로 source path를 연결한다. sequence 기본 예산(노드 10, edge 18, branch 3, loop 2)을 넘지 않는다.

- [x] **Step 2: EN/KO 시퀀스 SVG를 작성한다.**

  `public/assets/clinic-appointment-waitlist-operations-command-01-ko.svg`와 `...-en.svg`에 다음을 구현한다.

  - participant header, lifeline, activation bar, numbered message pill을 포함한다.
  - call line과 label 사이에 6–12px 이상 간격을 두고, 행 높이를 늘려 레이블이 선과 겹치지 않게 한다.
  - 정상 호출은 muted blue, 결과/상태는 olive green, metadata/재조회는 amber, conflict는 muted red로 나누고 line·label·arrowhead 색을 일치시킨다.
  - `201`, `Idempotent-Replay: true`, `202 IDEMPOTENCY_IN_PROGRESS`, `409 DECISION_STALE`/`OFFER_EXPIRED`/`SLOT_OCCUPIED`를 각각 식별 가능한 branch frame 안에 둔다.
  - branch frame은 투명하게 두고 `종료 상태 결정`/`terminal outcome decision`을 결과 경계에 명시한다.

- [x] **Step 3: 시퀀스 SVG를 PNG로 렌더링하고 전용 감사를 수행한다.**

  ```bash
  xmllint --noout public/assets/clinic-appointment-waitlist-operations-command-01-ko.svg
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py public/assets/clinic-appointment-waitlist-operations-command-01-ko.svg
  cairosvg public/assets/clinic-appointment-waitlist-operations-command-01-ko.svg -o public/assets/clinic-appointment-waitlist-operations-command-01-ko.png -s 2
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-semantic-audit.py --repo-root . --json docs/review/2026-08-14-clinic-appointment-waitlist-operations-command-01-ko.semantic.json
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-sequence-style-audit.py public/assets/clinic-appointment-waitlist-operations-command-01-ko.svg
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py public/assets/clinic-appointment-waitlist-operations-command-01-ko.svg
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-arrowhead-audit.py public/assets/clinic-appointment-waitlist-operations-command-01-ko.svg
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py public/assets/clinic-appointment-waitlist-operations-command-01-ko.svg
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal public/assets/clinic-appointment-waitlist-operations-command-01-ko.svg
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py public/assets/clinic-appointment-waitlist-operations-command-01-ko.svg
  python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-visual-audit.py --require-opaque public/assets/clinic-appointment-waitlist-operations-command-01-ko.png
  ```

  EN에도 같은 명령을 적용한다. `view_image`에서 모든 번호 라벨, call line, branch frame, arrowhead 색, 하단 여백을 원본 크기로 확인한다.

  증거: 두 sequence ledger는 semantic audit을 통과했다. EN/KO SVG/PNG는 XML·text
  normalize·sequence-style·connector·arrowhead·endpoint·geometry·mixed-corner·visual
  감사를 통과했고, full-size 렌더에서 번호 라벨과 call line 사이 간격, 결과 분기,
  `종료 상태 결정`/`terminal outcome decision` 및 하단 여백을 확인했다.

## Task 5: 한국어 글에 시각 자료·근거·시리즈 navigation을 연결한다

- [x] **Step 1: 한국어 MDX에 두 PNG를 삽입한다.**

  본문에는 `/assets/clinic-appointment-waitlist-operations-dashboard-01-ko.png`와 `/assets/clinic-appointment-waitlist-operations-command-01-ko.png`를 각각 `bt4k-architecture`/`bt4k-sequence` figure로 삽입한다. 캡션은 그림이 답하는 운영 질문을 한국어로 설명하고, 생성 로그·audit 결과·내부 증거는 art 안에 넣지 않는다. alt text는 실제 보이는 흐름을 짧게 기술하며 환자 식별자를 만들지 않는다.

- [x] **Step 2: 근거 링크와 시리즈 navigation을 작성한다.**

  다음 source 링크를 한국어 본문에 유지한다.

  - `clinic-appointment` 저장소
  - `docs/api/waitlist-delivery.md`
  - `docs/requirements/waitlist-delivery.md`
  - `docs/superpowers/specs/2026-08-03-issue-170-waitlist-delivery-design.md`
  - `WaitlistController`, `WaitlistResponses`, `WaitlistDeliveryHealthIndicator`, `WaitlistDeliveryMetrics`, `WaitlistDeliveryScheduling`

  현재 구현·승인된 계약·운영 대기를 별도 표로 유지한다. 실제 production allowlist, provider 장애율, 성능 기준 측정 결과가 없으면 완료된 사실처럼 쓰지 않는다.

  증거: 한국어 MDX에 architecture/sequence PNG와 독자용 캡션·alt text를 연결했고,
  구현·계약·운영 대기 표와 source 링크를 유지했다. 선행 waitlist-core EN/KO의 Series에
  새 route를 추가했다.

- [x] **Step 3: 한국어 초안을 읽기 좋은 로컬 화면으로 검증한다.**

  ```bash
  git diff --check
  npm run build
  npm run dev -- --host 127.0.0.1
  curl -I http://127.0.0.1:4321/ko/blog/clinic-appointment-waitlist-operations-dashboard/
  curl -I http://127.0.0.1:4321/ko/blog/clinic-appointment-waitlist-core/
  ```

  기대 결과: build 성공, 두 route `200`, asset URL이 404가 아니며 hero·두 PNG가 실제 페이지에 렌더링된다. 로컬 preview URL은 `http://127.0.0.1:4321/ko/blog/clinic-appointment-waitlist-operations-dashboard/`로 기록한다. `npm run dev`는 검토가 끝날 때까지 유지하고, 종료 후에는 실제 종료 여부를 확인한다.

  증거: `npm run build`가 0 errors로 2472 pages를 생성했다. 현재 작업 서버
  `http://127.0.0.1:4322/ko/blog/clinic-appointment-waitlist-operations-dashboard/`와
  선행 route가 모두 `200`이며, hero와 두 한국어 PNG가 모두 `200 image/png`로
  응답한다. 기본 4321 포트는 기존 프로세스가 점유해 새 서버는 4322에서 검증했다.

- [ ] **Step 4: 한국어 독자 검토 게이트를 기록한다.**

  제목, 첫 단락, 표의 용어, 두 그림, 결론을 다시 읽고 한국어 승인 전에는 영어 route를 완료 상태로 표시하지 않는다. 승인 대기 상태는 `PENDING`으로 남기고, 승인 뒤에만 Task 6으로 진행한다.

## Task 6: 영어 현지화와 locale parity

- [ ] **Step 1: 한국어 승인 후 영어 글을 다시 쓴다.**

  `src/content/docs/blog/clinic-appointment-waitlist-operations-dashboard.mdx`를 한국어 문장의 직역으로 만들지 않는다. 영어 제목은 `A Waitlist Dashboard Should Tell Staff What to Do Next`, 본문은 같은 사례·상태·숫자·HTTP reason code·source link를 유지하되 영어 기술 문체로 다시 작성한다. `terminal outcome decision`은 영어 독자가 이해할 수 있는 명시적 종료 노드로 유지하고, API identifier는 변경하지 않는다.

- [ ] **Step 2: 영어 diagram asset과 figure를 연결한다.**

  EN MDX에서 영문 hero alt text와 다음 PNG를 사용한다.

  - `/assets/clinic-appointment-waitlist-operations-dashboard-01-en.png`
  - `/assets/clinic-appointment-waitlist-operations-command-01-en.png`

  KO PNG를 EN route에서 재사용하지 않는다. EN/KO semantic ledger의 node·edge·branch 수와 source path를 대조한다.

- [ ] **Step 3: locale parity를 확인한다.**

  다음 명령으로 route·asset·핵심 토큰을 비교한다.

  ```bash
  rg -n 'clinic-appointment-waitlist-operations-dashboard|operations-dashboard-01|operations-command-01|Idempotency-Key|DEGRADED|OUT_OF_SERVICE|UNKNOWN|OFFER_EXPIRED|DECISION_STALE|SLOT_OCCUPIED' src/content/docs/blog/clinic-appointment-waitlist-operations-dashboard.mdx src/content/docs/ko/blog/clinic-appointment-waitlist-operations-dashboard.mdx
  npm run build
  curl -I http://127.0.0.1:4321/blog/clinic-appointment-waitlist-operations-dashboard/
  curl -I http://127.0.0.1:4321/ko/blog/clinic-appointment-waitlist-operations-dashboard/
  ```

  기대 결과: EN/KO route가 모두 `200`, 제목·섹션 수·표의 행·source link·시리즈 navigation·asset basename이 대응하고, locale별 reader-facing label만 다르다.

## Task 7: 통합 검증과 완료 판정

- [ ] **Step 1: 전체 사이트·수동 테스트·라우트를 검증한다.**

  ```bash
  git diff --check
  npm test
  npm run build
  npm run check:visual-companions
  ```

  `npm test`의 실패가 새 글과 무관하면 실패 목록과 격리 재실행 결과를 기록한다. 새 route, source link, asset URL, 시리즈 링크가 하나라도 끊기면 완료 판정을 보류한다.

- [ ] **Step 2: 최종 PNG와 글을 원본 크기로 다시 읽는다.**

  `view_image`로 hero와 네 diagram PNG를 각각 한 번씩 열고, 다음을 확인한다.

  - 연결선과 화살촉의 색이 일치한다.
  - 수평 점선이 의미 없는 상태 연결로 보이지 않는다.
  - `종료 상태 결정`/`terminal outcome decision`이 명시적으로 보인다.
  - sequence call line과 label이 겹치지 않는다.
  - 카드 하단 여백과 층 사이 수직 간격이 충분하다.
  - 본문 폭으로 축소해도 큐와 근거 패널의 텍스트가 읽힌다.

- [ ] **Step 3: BLOG/SPW DoD를 기록한다.**

  최종 보고에 다음을 포함한다.

  - `BLOG-01`~`BLOG-09`의 required/N/A 수와 증거
  - `SPW-01`~`SPW-05`, `KO-01`~`KO-06`의 결과
  - EN/KO route와 asset pair 결과
  - source ref, build/test/audit 명령과 결과
  - 한국어 승인 및 영어 현지화 승인 상태
  - 미검증 production rollout·provider·성능 항목

  `Required checks: X/Y; N/A: N; Blocked: 0` 형식으로 계산하며, 미검증 항목을 성공으로 표시하지 않는다.

## 실행 및 커밋 순서

1. Task 1 사실·용어를 고정한다.
2. Task 2 한국어 초안을 작성하고 자연스러움 검토를 마친다.
3. Task 3~4 hero·diagram을 한 asset씩 작성하고 렌더·audit·full-size 검사를 한다.
4. Task 5 한국어 route를 build하고 로컬 URL을 제공한다.
5. 한국어 승인 전까지 EN route를 작성하지 않는다.
6. 승인 후 Task 6 EN 현지화와 parity를 수행한다.
7. Task 7 최종 검증을 통과한 뒤, 각 의미 단위가 드러나는 Lore commit을 만든다.

각 커밋은 변경 파일을 명시하고 다음 trailer를 포함한다.

```text
Constraint: Korean-first article and separate EN/KO visual assets
Rejected: status-only list | It does not answer the next staff action
Confidence: high
Scope-risk: moderate
Directive: Keep terminal outcome decisions explicit and preserve source-backed identifiers
Tested: Record the fresh command and its observed result for this commit
Not-tested: Record each remaining evidence gap or concrete N/A scope
```

## 계획 자체 검토

- 설계의 독자·A 레이아웃·STAFF/ADMIN 경계·명령 결과·rollout off·시각 규칙을 Task 1~6에 모두 매핑했다.
- 미정 기호(`TBD`, `TODO`)나 미정 경로를 사용하지 않았고, 모든 생성·수정 파일과 검증 명령을 구체적으로 적었다.
- `deliveryState=UNKNOWN`, `Idempotency-Key`, `expectedVersion`, `UP`/`DEGRADED`/`OUT_OF_SERVICE`, `OFFER_EXPIRED`/`DECISION_STALE`/`SLOT_OCCUPIED`의 표기가 문서·다이어그램·parity 검사에서 동일하다.
- 한국어 승인 전 영어 현지화를 진행하지 않는 의존 순서를 명시했다.
