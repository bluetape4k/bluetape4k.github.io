# Clinic Appointment Notification and Reminder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 예약 확정과 알림 전달의 책임을 분리하고, STAFF가 실패 원인과 다음 작업을 한눈에 확인할 수 있도록 운영 확장 6 글을 한국어·영어와 한·영 시각자료로 완성한다.

**Architecture:** 현재 `clinic-appointment` 구현과 운영 런북을 사실의 기준으로 삼는다. 예약 명령은 최소 알림 의도를 아웃박스(outbox)에 기록하고, 알림 서비스가 발송 시점 프로필 조회·선점·provider 호출·결과 저장을 담당한다. 본문에는 A형 운영 대시보드와 조치 큐를 중심에 두고 B형 리마인더 복구 패널을 보조 정보로 배치한다. 코드에 없는 provider 연동·실제 운영 수치·전체 병원 rollout은 합성 시안이나 사실처럼 쓰지 않는다.

**Tech Stack:** Astro/Starlight, MDX, SVG, CairoSVG, Node.js asset generator, Python `bluetape-diagram` audits, npm test/build, local Astro preview

---

## 파일 구조와 범위

- Create: `docs/superpowers/plans/2026-08-17-clinic-appointment-notification-reminder.md` — 이 실행 계획
- Create: `docs/diagrams/clinic-appointment-notification-reminder/flow-01-ko.semantic.json` — 한국어 흐름 의미 원장
- Create: `docs/diagrams/clinic-appointment-notification-reminder/flow-01-en.semantic.json` — 영어 흐름 의미 원장
- Create: `scripts/generate-clinic-appointment-notification-reminder-assets.mjs` — 운영 화면·흐름 SVG 생성기
- Create: `public/assets/clinic-appointment-notification-reminder-hero.png` — 새 hero 이미지
- Create: `public/assets/clinic-appointment-notification-reminder-operations-screen-ko.svg`
- Create: `public/assets/clinic-appointment-notification-reminder-operations-screen-ko.png`
- Create: `public/assets/clinic-appointment-notification-reminder-operations-screen-en.svg`
- Create: `public/assets/clinic-appointment-notification-reminder-operations-screen-en.png`
- Create: `public/assets/clinic-appointment-notification-reminder-flow-01-ko.svg`
- Create: `public/assets/clinic-appointment-notification-reminder-flow-01-ko.png`
- Create: `public/assets/clinic-appointment-notification-reminder-flow-01-en.svg`
- Create: `public/assets/clinic-appointment-notification-reminder-flow-01-en.png`
- Create: `src/content/docs/ko/blog/clinic-appointment-notification-reminder.mdx`
- Create: `src/content/docs/blog/clinic-appointment-notification-reminder.mdx`
- Modify: `src/data/clinic-appointment-series.mjs` — 운영 확장 6 항목 추가
- Modify: `tests/ecosystem/clinic-appointment-series.test.mjs` — 25편·운영 확장 8편 순서와 새 slug 검증
- Modify: `tests/ecosystem/blog-diagram-locales.test.mjs` — 새 흐름 자산 locale parity 검증
- Verify: `tests/ecosystem/diagram-lightbox.test.mjs` — 운영 화면과 흐름 이미지의 확대 보기 동작

기준 저장소는 `bluetape4k/clinic-appointment`의 `develop` `f0c7614beed766efc4b88a1a59aa5c370f8fccf7`이다. Kotlin 제품 코드는 수정하지 않는다. 본문 관련 자료에는 다른 예약서비스 글을 우선 연결하고 GitHub Issue·PR URL은 넣지 않는다. 구현 근거가 필요한 링크는 해당 기준 커밋의 source/docs URL로만 별도 구분한다.

## Task 1: 시리즈 레지스트리와 회귀 테스트를 먼저 고정한다

**Files:**
- Modify: `src/data/clinic-appointment-series.mjs`
- Modify: `tests/ecosystem/clinic-appointment-series.test.mjs`
- Modify: `tests/ecosystem/blog-diagram-locales.test.mjs`

- [ ] 현재 시리즈 항목 수, 대분류, 마지막 slug, 이미지 stem 수를 읽고 실패 기준을 기록한다.
- [ ] 운영 확장 6을 `[운영 확장 6] 알림과 리마인더는 왜 별도 서비스인가`와 영어 대응 제목으로 추가한다. 기존 순서와 `current` slug 계약을 보존한다.
- [ ] 시리즈 테스트를 총 25편, 운영 확장 8편, 마지막 운영 확장 6편으로 갱신하고 새 한국어·영어 slug가 같은 항목을 가리키는지 검증한다.
- [ ] locale diagram 테스트에 새 `flow-01` 한·영 stem을 추가하고 전체 기대 개수를 실제 파일 수와 일치시킨다.
- [ ] 테스트를 실행해 새 글과 자산이 아직 없어서 실패하는 상태를 확인한 뒤 다음 작업으로 넘어간다.

Run:

```bash
npm test -- --runInBand tests/ecosystem/clinic-appointment-series.test.mjs tests/ecosystem/blog-diagram-locales.test.mjs
```

## Task 2: 흐름 의미 원장과 연결 계약을 작성한다

**Files:**
- Create: `docs/diagrams/clinic-appointment-notification-reminder/flow-01-ko.semantic.json`
- Create: `docs/diagrams/clinic-appointment-notification-reminder/flow-01-en.semantic.json`

- [ ] 두 원장에 source repository, source commit, source paths, locale, diagram purpose, node·edge 목록을 기록한다.
- [ ] 노드는 예약 명령 트랜잭션, 알림 아웃박스, 전달 경로 게이트, lease/fencing 선점, 회원 프로필 resolver, typed template renderer, provider channel, durable outcome/STAFF 상태 조회, 리마인더 복구 스캐너, `최종 상태 결정`으로 제한한다.
- [ ] `future`, `due`, `missed`, `already exists` 복구 branch와 `성공`, `억제`, `재시도 대기`, `소진` 결과를 명시하고, 점선이나 허공에서 시작하는 선으로 의미를 전달하지 않는다.
- [ ] 경계 수를 10개 노드·18개 이하 edge·3개 이하 branch·2개 이하 loop로 유지하고 모든 edge에 출발 노드·도착 노드·관계·색·label을 기록한다.
- [ ] 설계 원장과 구현 코드의 차이는 `implemented`, `approved-design`, `operational-mockup` 구분으로 표시한다.

Run:

```bash
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-semantic-audit.py \
  --repo-root . \
  docs/diagrams/clinic-appointment-notification-reminder/flow-01-ko.semantic.json
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-semantic-audit.py \
  --repo-root . \
  docs/diagrams/clinic-appointment-notification-reminder/flow-01-en.semantic.json
```

## Task 3: 결정적인 시각자료 생성기를 구현한다

**Files:**
- Create: `scripts/generate-clinic-appointment-notification-reminder-assets.mjs`
- Create: `public/assets/clinic-appointment-notification-reminder-operations-screen-{ko,en}.svg`
- Create: `public/assets/clinic-appointment-notification-reminder-flow-01-{ko,en}.svg`

- [ ] 기존 static SVG generator 패턴을 따라 실행 위치와 출력 파일을 고정하고, 무작위 값·현재 시각·실제 회원 식별자를 사용하지 않는다.
- [ ] 운영 화면은 상단 카드(발송 가능 대기·재시도 대기·억제·소진), 중앙 조치 큐(상태·reason code·권장 조치·다음 시도 시각), 선택한 scope 상세, 하단 리마인더 복구 결과를 포함한다. 카드 제목과 두 조치 큐 표 제목은 충분한 폭과 행 높이를 확보해 잘리지 않게 한다.
- [ ] 운영 화면은 tenant·clinic과 합성 상태만 표시하고 member·destination·payload·실제 metric은 표시하지 않는다. rollout은 선택한 scope의 route 배지 하나만 사용한다.
- [ ] 흐름 SVG는 모든 연결을 수평·수직 구간과 rounded orthogonal corner로 그린다. 선마다 전용 corridor와 시작·종료 port를 사용하고, 색상과 화살촉 색상을 일치시킨다. shared fan-out bus, 허공 시작, 대각선, 수평 점선의 의미 전달은 금지한다.
- [ ] 한·영 문구는 각각 자연스럽게 현지화하되 상태값·서비스명·약어는 식별 가능한 영문 표기를 유지한다. 한국어 용어는 `아웃박스(outbox)`, `스냅숏`, `최종 상태 결정`, `억제`, `소진`, `재시도 대기`로 통일한다.
- [ ] SVG에는 `<title>`과 `<desc>`를 넣고 `data-connector`, marker 역할, edge 색상 메타데이터를 남긴다.

Run:

```bash
node scripts/generate-clinic-appointment-notification-reminder-assets.mjs
```

## Task 4: 새 hero 이미지를 생성하고 독립적으로 확인한다

**Files:**
- Create: `public/assets/clinic-appointment-notification-reminder-hero.png`

- [ ] `imagegen`으로 알림 outbox 카드, STAFF 조치 큐, 리마인더 복구 패널이 있는 새 3D miniature workbench 장면을 생성한다.
- [ ] 직전 글 hero를 복제하지 않고, 환자 이름·전화번호·이메일·예약번호·긴 문장을 이미지 안에 넣지 않는다.
- [ ] `view_image`로 원본 크기를 확인하고 카드·큐·패널이 구분되며 텍스트가 읽히지 않는 장식 수준인지 확인한다.

## Task 5: SVG·PNG와 diagram 계약을 자산별로 검증한다

**Files:**
- Verify: all new `public/assets/clinic-appointment-notification-reminder-*` SVG/PNG files

- [ ] 각 SVG를 XML과 text hazard 관점에서 검사한다.
- [ ] 각 SVG를 CairoSVG 배율 2로 PNG로 렌더링하고, SVG·PNG 파일명을 locale별로 1:1 대응시킨다.
- [ ] `diagram-semantic-audit.py`, `diagram-svg-text-normalize.py`, `diagram-connector-audit.py`, `diagram-arrowhead-audit.py`, `diagram-endpoint-audit.py`, `diagram-mixed-corner-audit.py`, `diagram-geometry-audit.py --fail-diagonal`, `diagram-visual-audit.py --require-opaque`를 새 흐름과 운영 화면에 각각 실행한다.
- [ ] `view_image`에서 한·영 PNG를 full-size로 열어 카드 제목·조치 큐 표 제목·연결선·화살촉·rounded corner·하단 여백을 확인한다. 실패하면 generator 좌표를 수정하고 해당 자산부터 전체 감사를 다시 실행한다.

Run:

```bash
xmllint --noout public/assets/clinic-appointment-notification-reminder-*.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py \
  public/assets/clinic-appointment-notification-reminder-*.svg
for svg in public/assets/clinic-appointment-notification-reminder-*.svg; do
  cairosvg "$svg" -o "${svg%.svg}.png" -s 2
done
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py \
  public/assets/clinic-appointment-notification-reminder-flow-01-ko.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-arrowhead-audit.py \
  public/assets/clinic-appointment-notification-reminder-flow-01-ko.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py \
  public/assets/clinic-appointment-notification-reminder-flow-01-ko.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py \
  public/assets/clinic-appointment-notification-reminder-flow-01-ko.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal \
  public/assets/clinic-appointment-notification-reminder-flow-01-ko.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-visual-audit.py --require-opaque \
  public/assets/clinic-appointment-notification-reminder-flow-01-ko.svg \
  public/assets/clinic-appointment-notification-reminder-flow-01-ko.png
```

영어 flow와 두 운영 화면에도 같은 감사를 반복하며, 명령 출력과 full-size 시각 확인 결과를 워크플로 evidence로 남긴다.

## Task 6: 한국어 글을 운영 화면 중심으로 작성한다

**Files:**
- Create: `src/content/docs/ko/blog/clinic-appointment-notification-reminder.mdx`

- [ ] 기존 운영 확장 글과 같은 frontmatter 순서·날짜·hero 배치를 사용하고 제목은 `[운영 확장 6] 알림과 리마인더는 왜 별도 서비스인가`로 고정한다.
- [ ] 예약 확정과 알림 전달이 다른 성공이라는 문제에서 시작해, 책임 분리·발송 시점 프로필·STAFF 조치 큐·리마인더 복구·재시도/중복 방지·route gate 순서로 풀어 쓴다.
- [ ] 구현 사실, 승인된 설계, 운영 화면 합성 시안을 표와 문단에서 명시적으로 구분한다.
- [ ] 운영 화면 이미지는 `figure`/기존 lightbox 규칙으로 삽입하고, 흐름 이미지는 `figure.bt4k-sequence`로 넣는다. 두 이미지 모두 절대 `/assets/...` 경로와 자연스러운 alt text를 사용한다.
- [ ] 관련 자료에는 다른 예약서비스 글만 연결하고 Issue·PR URL이 없는지 검사한다. 구현 근거는 기준 커밋의 source/docs 링크를 별도 섹션으로 둔다.
- [ ] 하단에 `<ClinicAppointmentSeries current="clinic-appointment-notification-reminder" locale="ko" />`를 넣는다.

## Task 7: 영어 locale 글을 사실·구조·자산 parity로 작성한다

**Files:**
- Create: `src/content/docs/blog/clinic-appointment-notification-reminder.mdx`

- [ ] 한국어 글과 같은 frontmatter, 날짜, hero, 섹션 순서, 운영 화면·흐름 자산을 사용하되 영어 독자에게 자연스러운 문장으로 작성한다.
- [ ] 한국어 글의 구현 사실·수치·scope·제외 범위를 바꾸지 않는다. `source/docs` URL은 같은 기준 커밋을 가리킨다.
- [ ] 운영 확장 6 제목과 series footer를 영어 locale 계약에 맞게 연결한다.

## Task 8: 링크·시리즈·lightbox 회귀 검증을 보강한다

**Files:**
- Modify: `tests/ecosystem/clinic-appointment-series.test.mjs`
- Modify: `tests/ecosystem/blog-diagram-locales.test.mjs`
- Verify: `tests/ecosystem/diagram-lightbox.test.mjs`

- [ ] 새 slug가 registry·한글 route·영문 route·series footer에 모두 존재하는지 검사한다.
- [ ] 새 글의 관련 자료와 구현 근거에서 `github.com/.../issues` 및 `github.com/.../pull` 문자열이 없는지 확인한다.
- [ ] 운영 화면과 flow PNG가 lightbox selector에 포함되고 localized alt/title 계약을 만족하는지 확인한다.
- [ ] 한·영 글의 헤딩과 이미지 수가 대응하고, hero가 이전 글 asset과 중복되지 않는지 검사한다.

Run:

```bash
rg -n 'github\.com/.+/(issues|pull)' \
  src/content/docs/ko/blog/clinic-appointment-notification-reminder.mdx \
  src/content/docs/blog/clinic-appointment-notification-reminder.mdx
npm test -- --runInBand tests/ecosystem/clinic-appointment-series.test.mjs \
  tests/ecosystem/blog-diagram-locales.test.mjs \
  tests/ecosystem/diagram-lightbox.test.mjs
```

## Task 9: Writer 검토, 빌드, 로컬 미리보기를 수행한다

- [ ] `bluetape-writer`의 용어집·한국어 자연스러움·블로그 체크리스트로 한국어 문장을 다시 읽고, 직역체·모호한 제목·일관되지 않은 용어를 고친다.
- [ ] `npm test`, `npm run check:manual`, `npm run check:visual-companions`, `npm run build:publish`, `git diff --check`를 실행한다.
- [ ] 로컬 서버에서 다음 route를 직접 열어 본문·시리즈 링크·이미지·lightbox를 확인한다.
  - `http://127.0.0.1:4325/ko/blog/clinic-appointment-notification-reminder/`
  - `http://127.0.0.1:4325/blog/clinic-appointment-notification-reminder/`
- [ ] 실패한 검사는 원인을 고친 뒤 해당 검사를 재실행하고, 실행하지 못한 검사는 최종 보고서의 N/A/Blocked 사유로 남긴다.

## Task 10: 배포는 보호된 develop 경로로 완료한다

- [ ] Lore commit protocol을 지킨 한국어가 아닌 영어 commit message로 변경을 커밋한다. intent, constraint, rejected, confidence, scope-risk, directive, tested, not-tested trailer를 포함한다.
- [ ] 브랜치를 원격에 push하고 `develop`을 base로 PR을 만든다. 직접 `develop`에 push하지 않는다.
- [ ] PR body·labels·assignee·CI·review threads를 fresh read-back하고, Pages 배포가 성공하는지 확인한다.
- [ ] merge-ready 상태가 되면 새 merge approval을 별도로 요청한다. 승인 전에는 merge하지 않는다.
- [ ] 승인 후 merge하고 로컬 `develop`을 원격 merge commit까지 동기화한다. 배포 route가 HTTP 200인지 확인하고, 작업 브랜치·worktree를 안전하게 정리한다.

## 완료 기준

- [ ] 새 한·영 article route가 build와 local preview에서 렌더링된다.
- [ ] 운영 화면과 흐름 diagram의 한·영 SVG/PNG가 같은 사실과 의미를 표현하고 모든 diagram audit을 통과한다.
- [ ] 관련 자료에 Issue·PR 링크가 없고, 시리즈 순서와 lightbox 회귀가 통과한다.
- [ ] fresh build·tests·diff-check·route evidence가 수집된다.
- [ ] 배포·원격 동기화·정리까지 끝난 뒤에만 `DONE`으로 보고한다.

