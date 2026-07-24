# Clinic Appointment Part 6·7 Bilingual Diagrams Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Part 6과 Part 7의 텍스트 포함 다이어그램을 한국어·영어 자산으로 분리하고, 각 언어의 지정 글꼴과 의미를 최종 PNG 및 locale 페이지까지 검증한다.

**Architecture:** 현재 영문 SVG를 `-en` canonical source로 보존하고 지정 영문 글꼴로 PNG를 다시 렌더링한다. 접미사가 없는 SVG는 같은 연결 관계와 정보 계층을 유지하면서 한국어로 현지화하되, 의미를 축약하지 않고 필요한 카드·캔버스·연결선 좌표를 확장한다. 영어 MDX만 `-en.png`를 참조하도록 바꾸고 한국어 MDX는 기존 unsuffixed 경로를 유지한다.

**Tech Stack:** Astro Starlight, MDX, SVG, CairoSVG, librsvg, fontconfig, bluetape diagram audit scripts

---

## 파일 구조

### Part 6

- Create: `public/assets/clinic-appointment-part6-rescheduling-flow-01-en.svg` — 기존 영문 문구와 구조를 보존하는 editable canonical SVG
- Create: `public/assets/clinic-appointment-part6-rescheduling-flow-01-en.png` — 지정 영문 글꼴로 렌더링한 2배 PNG
- Modify: `public/assets/clinic-appointment-part6-rescheduling-flow-01.svg` — 한국어 문구, 혼합 글꼴과 필요한 카드·캔버스 조정
- Modify: `public/assets/clinic-appointment-part6-rescheduling-flow-01.png` — 한국어 SVG의 2배 PNG
- Modify: `src/content/docs/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx:125` — 영어 `-en.png` 참조
- Verify: `src/content/docs/ko/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx:130` — 한국어 unsuffixed PNG 참조 유지

### Part 7

- Create: `public/assets/clinic-appointment-part7-development-loop-01-en.svg` — 기존 영문 문구와 구조를 보존하는 editable canonical SVG
- Create: `public/assets/clinic-appointment-part7-development-loop-01-en.png` — 지정 영문 글꼴로 렌더링한 2배 PNG
- Modify: `public/assets/clinic-appointment-part7-development-loop-01.svg` — 한국어 문구, 혼합 글꼴과 필요한 카드·캔버스 조정
- Modify: `public/assets/clinic-appointment-part7-development-loop-01.png` — 한국어 SVG의 2배 PNG
- Modify: `src/content/docs/blog/clinic-appointment-part7-review-and-operational-evolution.mdx:129` — 영어 `-en.png` 참조
- Verify: `src/content/docs/ko/blog/clinic-appointment-part7-review-and-operational-evolution.mdx:132` — 한국어 unsuffixed PNG 참조 유지

### 설계 기준

- Reference: `docs/superpowers/specs/2026-07-24-clinic-parts6-7-bilingual-diagrams-design.md`
- Reference: `docs/lessons/2026-07-21-cairosvg-custom-font-parity.md`

---

### Task 1: Part 6 영문 canonical 자산과 글꼴 고정

**Files:**
- Create: `public/assets/clinic-appointment-part6-rescheduling-flow-01-en.svg`
- Create: `public/assets/clinic-appointment-part6-rescheduling-flow-01-en.png`

- [ ] **Step 1: 영문 locale 자산이 아직 없음을 확인한다**

Run:

```bash
test -f public/assets/clinic-appointment-part6-rescheduling-flow-01-en.svg
```

Expected: exit 1. 구현 전에는 `-en.svg`가 없어야 한다.

- [ ] **Step 2: 현재 영문 SVG를 `-en.svg`로 보존한다**

`apply_patch`로 `public/assets/clinic-appointment-part6-rescheduling-flow-01.svg`의 48줄 전체를 새 `-en.svg`에 동일하게 추가한다. `<title>`, `<desc>`, 모든 visible label, 카드와 `data-connector` 경로는 원본과 byte-for-byte 동일하게 유지한다.

영문 CSS 계약은 다음과 같아야 한다.

```xml
.title{font-family:"Architects Daughter",cursive;font-size:46px;font-weight:700;fill:#f8fafc}
.subtitle{font-family:"Comic Mono",monospace;font-size:19px;fill:#9fb2cc}
.label{font-family:"Architects Daughter",cursive;font-size:27px;font-weight:700;fill:#f8fafc}
.body{font-family:"Comic Mono",monospace;font-size:18px;fill:#d7e3f3}
.small{font-family:"Comic Mono",monospace;font-size:15px;fill:#aebed2}
```

- [ ] **Step 3: 영어 글꼴 설치와 SVG 텍스트를 검사한다**

Run:

```bash
fc-match 'Architects Daughter' | head -n 1
fc-match 'Comic Mono' | head -n 1
xmllint --noout public/assets/clinic-appointment-part6-rescheduling-flow-01-en.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py public/assets/clinic-appointment-part6-rescheduling-flow-01-en.svg
if rg -n '[가-힣]' public/assets/clinic-appointment-part6-rescheduling-flow-01-en.svg; then exit 1; fi
```

Expected:

```text
ArchitectsDaughter-Regular.ttf: "Architects Daughter" "Regular"
ComicMono-Bold.ttf: "Comic Mono" "Bold"
SUMMARY files=1 text_hazards=0 code_without_highlight=0 changed=0
```

XML 오류와 한국어 검색 결과가 없어야 한다.

- [ ] **Step 4: Part 6 영문 PNG를 지정 글꼴로 렌더링한다**

먼저 canonical SVG를 직접 렌더링한다.

```bash
cairosvg public/assets/clinic-appointment-part6-rescheduling-flow-01-en.svg \
  -o public/assets/clinic-appointment-part6-rescheduling-flow-01-en.png \
  -s 2
sips -g pixelWidth -g pixelHeight public/assets/clinic-appointment-part6-rescheduling-flow-01-en.png
```

Expected: `pixelWidth: 3200`, `pixelHeight: 1800`.

원본 크기 이미지에서 지정 글꼴이 대체된 경우에만 writable font cache와 librsvg 중간 SVG 경로를 사용한다.

```bash
diagram_part6_en_tmp=$(mktemp -d)
fc-cache -f
rsvg-convert --format=svg \
  --output="$diagram_part6_en_tmp/part6-en-glyphs.svg" \
  public/assets/clinic-appointment-part6-rescheduling-flow-01-en.svg
cairosvg "$diagram_part6_en_tmp/part6-en-glyphs.svg" \
  -o public/assets/clinic-appointment-part6-rescheduling-flow-01-en.png \
  -s 2
```

Expected: canonical `-en.svg`에는 editable text가 남고 PNG만 librsvg가 해석한 glyph를 사용한다.

- [ ] **Step 5: Part 6 영문 geometry를 감사한다**

Run:

```bash
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py public/assets/clinic-appointment-part6-rescheduling-flow-01-en.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal public/assets/clinic-appointment-part6-rescheduling-flow-01-en.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py public/assets/clinic-appointment-part6-rescheduling-flow-01-en.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py public/assets/clinic-appointment-part6-rescheduling-flow-01-en.svg
```

Expected:

```text
PASS markers=2 connectors=8 cards=9 ... intrusions=0 crossings=0 shared_segments=0
geometry_failures=0
diagram endpoint audit: PASS files=1
diagram mixed-corner audit: PASS files=1 paths=8 q_bends=6 failures=0
```

- [ ] **Step 6: Part 6 영문 PNG를 원본 크기로 확인한다**

Codex `view_image`로 `public/assets/clinic-appointment-part6-rescheduling-flow-01-en.png`를 `original` detail로 연다. 제목과 주요 라벨이 `Architects Daughter`, 나머지가 `Comic Mono`의 실제 글리프로 보이는지, 모든 문구가 잘리지 않는지, 연결선과 카드가 겹치지 않는지 확인한다.

- [ ] **Step 7: Part 6 영문 자산을 커밋한다**

```bash
git add public/assets/clinic-appointment-part6-rescheduling-flow-01-en.svg \
  public/assets/clinic-appointment-part6-rescheduling-flow-01-en.png
git diff --cached --check
git commit -m "Preserve the Part 6 diagram as an English locale asset" \
  -m "Constraint: Render English labels with the bluetape diagram font contract
Rejected: Keep sharing the unsuffixed asset | the Korean page requires an independently localized source
Confidence: high
Scope-risk: narrow
Directive: Keep the canonical SVG text editable even when PNG rendering needs glyph resolution
Tested: XML, text, connector, geometry, endpoint, mixed-corner, font, dimension, and visual checks
Not-tested: Site locale routing is verified after both Part 6 assets exist"
```

Expected: commit succeeds with only the two Part 6 `-en` assets.

---

### Task 2: Part 6 한국어 자산과 locale 참조

**Files:**
- Modify: `public/assets/clinic-appointment-part6-rescheduling-flow-01.svg`
- Modify: `public/assets/clinic-appointment-part6-rescheduling-flow-01.png`
- Modify: `src/content/docs/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx:125`
- Verify: `src/content/docs/ko/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx:130`

- [ ] **Step 1: unsuffixed Part 6 SVG가 아직 영문임을 증명한다**

Run:

```bash
rg -n 'Incidents create a workflow|CLINIC CLOSURE|EQUIPMENT DOWNTIME|DECISION BOUNDARY' \
  public/assets/clinic-appointment-part6-rescheduling-flow-01.svg
```

Expected: 네 영문 문구가 검색된다. 이것이 현지화 전 실패 기준이다.

- [ ] **Step 2: 접근성 텍스트와 한국어 글꼴 클래스를 적용한다**

`apply_patch`로 `<title>`, `<desc>`, CSS를 다음 계약으로 바꾼다.

```xml
<title id="title">휴진과 장비 사용 불가 이후의 운영 재배정</title>
<desc id="desc">병원 휴진 자동화와 장비 충돌 탐지가 명시적인 검토 및 재배정 경계로 이어진다.</desc>
```

```css
.title{font-family:"goorm Sans",sans-serif;font-size:46px;font-weight:700;fill:#f8fafc}
.subtitle{font-family:"goorm Sans",sans-serif;font-size:19px;fill:#9fb2cc}
.label{font-family:"goorm Sans",sans-serif;font-size:27px;font-weight:700;fill:#f8fafc}
.body{font-family:"goorm Sans",sans-serif;font-size:18px;fill:#d7e3f3}
.small{font-family:"goorm Sans",sans-serif;font-size:15px;fill:#aebed2}
.tech{font-family:"goorm Sans Code",monospace}
```

- [ ] **Step 3: Part 6 visible label을 정확한 한국어 문구로 교체한다**

`apply_patch`로 영문 visible text를 아래 순서와 문구로 교체한다. 상태값·서비스명·도구명·약어는 `<tspan class="tech">...</tspan>`으로 감싼다.

```text
사건은 단순히 새 날짜가 아니라 워크플로를 만든다
휴진 자동화와 장비 충돌 탐지는 명시적인 운영 의사결정 경계에서 만난다.
병원 휴진
구현된 재배정 경로
활성 예약
REQUESTED · CONFIRMED · 활성 상태
PENDING_RESCHEDULE + 이력
원래 시간대가 변경된 이유를 보존
순위가 매겨진 후보 저장
SlotCalculationService · 향후 1–30일
DB 트랜잭션 이후 진행 콜백
장비 사용 불가
구현된 탐지 경로
사용 불가 규칙
일회성 · 반복 · SKIP/RESCHEDULE
기간을 펼쳐 겹침 탐색
저장 전 미리보기 또는 저장 후 탐지
tenant 범위 장비 소유권 가드
충돌 예약 반환
이 서비스는 자동 재배정하지 않음
의사결정 경계
검토, 확정, 소통
실행 경로 선택
순위 후보 또는 별도 Solver 실행
tenant 가드로 확정
새 CONFIRMED 예약
원본은 RESCHEDULED · selected
발행과 알림을 분리
현재 휴진 서비스는 이를 발행하지 않음
운영 불변조건: 네트워크 진행 전에 상태와 후보 데이터를 커밋하고,
탐지·승인·영속화·알림을 명시적인 경계로 유지한다.
Solver 결과는 다른 워크플로가 검증하고 영속화하기 전까지 제안일 뿐이다.
```

하단 운영 불변조건은 의미 단위의 두 줄 `<text>` 또는 `<tspan x="96" dy="...">`로 배치한다. `REQUESTED`, `CONFIRMED`, `PENDING_RESCHEDULE`, `SlotCalculationService`, `DB`, `SKIP`, `RESCHEDULE`, `tenant`, `Solver`, `RESCHEDULED`, `selected`에는 `.tech`를 적용한다.

- [ ] **Step 4: 한국어 문구에 맞춰 카드와 캔버스를 조정한다**

문구를 기존 카드에 맞추기 위해 축약하거나 글자 크기를 줄이지 않는다. 먼저 각 카드의 `width`/`height`와 내부 text 좌표를 조정하고, 필요한 경우 세 lane의 `x`, lane 사이 간격, canvas `width`/`viewBox`, 연결선 시작·끝 좌표를 함께 확장한다.

다음 불변조건을 유지한다.

```text
font-size: title 46px, subtitle 19px, label 27px, body 18px, small 15px
card inner horizontal padding: 25px 이상
card inner vertical padding: 20px 이상
connector count: 8
card count: 9
information order: 휴진 경로 → 의사결정 경계, 장비 경로 → 의사결정 경계
```

- [ ] **Step 5: Part 6 한국어 SVG와 글꼴을 검사한다**

Run:

```bash
fc-match 'goorm Sans' | head -n 1
fc-match 'goorm Sans Code' | head -n 1
xmllint --noout public/assets/clinic-appointment-part6-rescheduling-flow-01.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py public/assets/clinic-appointment-part6-rescheduling-flow-01.svg
rg -n '병원 휴진|장비 사용 불가|의사결정 경계|PENDING_RESCHEDULE|SlotCalculationService|RESCHEDULED' \
  public/assets/clinic-appointment-part6-rescheduling-flow-01.svg
if rg -n 'Incidents create a workflow|Implemented reschedule path|Implemented detection path|Review, confirm, communicate' \
  public/assets/clinic-appointment-part6-rescheduling-flow-01.svg; then exit 1; fi
```

Expected:

```text
goorm-sans-bold.ttf: "goorm Sans" "700"
goorm_Sans_Code_400.ttf: "goorm Sans Code" "400"
SUMMARY files=1 text_hazards=0 code_without_highlight=0 changed=0
```

한국어 핵심 문구와 기술 식별자가 검색되고, 일반 영문 문구는 검색되지 않아야 한다.

- [ ] **Step 6: Part 6 한국어 PNG를 2배로 렌더링한다**

```bash
cairosvg public/assets/clinic-appointment-part6-rescheduling-flow-01.svg \
  -o public/assets/clinic-appointment-part6-rescheduling-flow-01.png \
  -s 2
sips -g pixelWidth -g pixelHeight public/assets/clinic-appointment-part6-rescheduling-flow-01.png
```

Expected: PNG의 width와 height가 SVG `width`/`height`의 정확히 2배다. 캔버스를 확장했다면 3200×1800보다 커질 수 있다.

글꼴 대체가 보이면 Task 1과 같은 `mktemp -d` → `fc-cache -f` → `rsvg-convert --format=svg` → `cairosvg -s 2` 경로를 Part 6 한국어 파일에 적용한다.

- [ ] **Step 7: Part 6 한국어 geometry와 원본 크기 PNG를 검사한다**

Run:

```bash
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py public/assets/clinic-appointment-part6-rescheduling-flow-01.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal public/assets/clinic-appointment-part6-rescheduling-flow-01.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py public/assets/clinic-appointment-part6-rescheduling-flow-01.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py public/assets/clinic-appointment-part6-rescheduling-flow-01.svg
```

Expected: connectors=8, cards=9, `intrusions=0`, `crossings=0`, `shared_segments=0`, `geometry_failures=0`, endpoint PASS, mixed-corner `failures=0`.

Codex `view_image`로 한국어 PNG를 `original` detail로 열어 글리프, 카드 여백, 의미 단위 줄바꿈, 하단 문구, 연결선 끝점과 캔버스 경계를 확인한다.

- [ ] **Step 8: 영어 Part 6 MDX만 `-en.png`로 변경한다**

`apply_patch`로 정확히 한 경로만 바꾼다.

```diff
-  <img src="/assets/clinic-appointment-part6-rescheduling-flow-01.png" alt="Diagram showing a clinic closure implementation moving active appointments to pending reschedule and persisting candidates, an equipment downtime implementation returning conflicts, and both paths meeting at review, confirmation, persistence, and notification boundaries" loading="lazy" />
+  <img src="/assets/clinic-appointment-part6-rescheduling-flow-01-en.png" alt="Diagram showing a clinic closure implementation moving active appointments to pending reschedule and persisting candidates, an equipment downtime implementation returning conflicts, and both paths meeting at review, confirmation, persistence, and notification boundaries" loading="lazy" />
```

Run:

```bash
rg -n 'clinic-appointment-part6-rescheduling-flow-01(-en)?\\.png' \
  src/content/docs/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx \
  src/content/docs/ko/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx
```

Expected: 영어 MDX는 `-en.png`, 한국어 MDX는 unsuffixed `.png`를 각각 한 번 참조한다.

- [ ] **Step 9: Part 6 한국어 자산과 locale 참조를 커밋한다**

```bash
git add public/assets/clinic-appointment-part6-rescheduling-flow-01.svg \
  public/assets/clinic-appointment-part6-rescheduling-flow-01.png \
  src/content/docs/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx
git diff --cached --check
git commit -m "Make the Part 6 diagram readable in each locale" \
  -m "Constraint: Preserve Korean meaning even when cards and canvas must expand
Rejected: Shorten Korean labels to retain English card widths | meaning is more important than fixed geometry
Confidence: high
Scope-risk: narrow
Directive: Keep technical identifiers in goorm Sans Code and general Korean prose in goorm Sans
Tested: XML, text, connector, geometry, endpoint, mixed-corner, font, dimension, visual, and locale-reference checks
Not-tested: Full Astro build runs after Part 7 reaches locale parity"
```

Expected: commit succeeds with the Part 6 unsuffixed pair and English MDX reference.

---

### Task 3: Part 7 영문 canonical 자산과 글꼴 고정

**Files:**
- Create: `public/assets/clinic-appointment-part7-development-loop-01-en.svg`
- Create: `public/assets/clinic-appointment-part7-development-loop-01-en.png`

- [ ] **Step 1: 영문 locale 자산이 아직 없음을 확인한다**

Run:

```bash
test -f public/assets/clinic-appointment-part7-development-loop-01-en.svg
```

Expected: exit 1.

- [ ] **Step 2: 현재 영문 SVG를 `-en.svg`로 보존한다**

`apply_patch`로 `public/assets/clinic-appointment-part7-development-loop-01.svg`의 48줄 전체를 새 `-en.svg`에 동일하게 추가한다. `<title>`, `<desc>`, visible label, 6개 `data-connector`와 6개 카드의 좌표를 그대로 유지한다.

영문 CSS 계약은 다음과 같아야 한다.

```xml
.title{font-family:"Architects Daughter",cursive;font-size:46px;font-weight:700;fill:#f8fafc}
.subtitle{font-family:"Comic Mono",monospace;font-size:19px;fill:#9fb2cc}
.label{font-family:"Architects Daughter",cursive;font-size:28px;font-weight:700;fill:#f8fafc}
.body{font-family:"Comic Mono",monospace;font-size:18px;fill:#d7e3f3}
.small{font-family:"Comic Mono",monospace;font-size:15px;fill:#aebed2}
```

- [ ] **Step 3: Part 7 영문 SVG를 검사하고 2배 PNG를 렌더링한다**

Run:

```bash
xmllint --noout public/assets/clinic-appointment-part7-development-loop-01-en.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py public/assets/clinic-appointment-part7-development-loop-01-en.svg
if rg -n '[가-힣]' public/assets/clinic-appointment-part7-development-loop-01-en.svg; then exit 1; fi
cairosvg public/assets/clinic-appointment-part7-development-loop-01-en.svg \
  -o public/assets/clinic-appointment-part7-development-loop-01-en.png \
  -s 2
sips -g pixelWidth -g pixelHeight public/assets/clinic-appointment-part7-development-loop-01-en.png
```

Expected: text audit `text_hazards=0`, `code_without_highlight=0`; 한국어 없음; PNG 3200×1800.

대체 글꼴이 보이면 Task 1의 librsvg 중간 SVG 경로를 Part 7 영문 파일에 적용한다.

- [ ] **Step 4: Part 7 영문 geometry와 원본 크기 PNG를 검사한다**

Run:

```bash
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py public/assets/clinic-appointment-part7-development-loop-01-en.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal public/assets/clinic-appointment-part7-development-loop-01-en.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py public/assets/clinic-appointment-part7-development-loop-01-en.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py public/assets/clinic-appointment-part7-development-loop-01-en.svg
```

Expected:

```text
PASS markers=2 connectors=6 cards=6 ... intrusions=0 crossings=0 shared_segments=0
geometry_failures=0
diagram endpoint audit: PASS files=1
diagram mixed-corner audit: PASS files=1 paths=6 q_bends=0 failures=0
```

Codex `view_image`로 영문 PNG를 `original` detail로 열어 `Architects Daughter`/`Comic Mono` 실제 글리프, 여섯 카드, 중앙 입력 영역과 순환 화살표를 확인한다.

- [ ] **Step 5: Part 7 영문 자산을 커밋한다**

```bash
git add public/assets/clinic-appointment-part7-development-loop-01-en.svg \
  public/assets/clinic-appointment-part7-development-loop-01-en.png
git diff --cached --check
git commit -m "Preserve the Part 7 diagram as an English locale asset" \
  -m "Constraint: Render English labels with the bluetape diagram font contract
Rejected: Keep sharing the unsuffixed asset | the Korean page requires an independently localized source
Confidence: high
Scope-risk: narrow
Directive: Keep the six-step loop and operational input structure unchanged
Tested: XML, text, connector, geometry, endpoint, mixed-corner, font, dimension, and visual checks
Not-tested: Site locale routing is verified after the Korean Part 7 asset exists"
```

Expected: commit succeeds with only the two Part 7 `-en` assets.

---

### Task 4: Part 7 한국어 자산과 locale 참조

**Files:**
- Modify: `public/assets/clinic-appointment-part7-development-loop-01.svg`
- Modify: `public/assets/clinic-appointment-part7-development-loop-01.png`
- Modify: `src/content/docs/blog/clinic-appointment-part7-review-and-operational-evolution.mdx:129`
- Verify: `src/content/docs/ko/blog/clinic-appointment-part7-review-and-operational-evolution.mdx:132`

- [ ] **Step 1: unsuffixed Part 7 SVG가 아직 영문임을 증명한다**

Run:

```bash
rg -n 'Done is a checkpoint|REQUIREMENTS|TESTS / REVIEW|OPERATIONAL INPUTS' \
  public/assets/clinic-appointment-part7-development-loop-01.svg
```

Expected: 네 영문 문구가 검색된다.

- [ ] **Step 2: 접근성 텍스트와 한국어 글꼴 클래스를 적용한다**

`apply_patch`로 다음 값을 사용한다.

```xml
<title id="title">리뷰와 운영이 다음 개발 주기를 만든다</title>
<desc id="desc">요구사항, 설계, 구현, 테스트와 리뷰, 교훈, 새 요구사항이 운영 증거를 입력받는 순환 구조를 이룬다.</desc>
```

```css
.title{font-family:"goorm Sans",sans-serif;font-size:46px;font-weight:700;fill:#f8fafc}
.subtitle{font-family:"goorm Sans",sans-serif;font-size:19px;fill:#9fb2cc}
.label{font-family:"goorm Sans",sans-serif;font-size:28px;font-weight:700;fill:#f8fafc}
.body{font-family:"goorm Sans",sans-serif;font-size:18px;fill:#d7e3f3}
.small{font-family:"goorm Sans",sans-serif;font-size:15px;fill:#aebed2}
.tech{font-family:"goorm Sans Code",monospace}
```

- [ ] **Step 3: Part 7 visible label을 정확한 한국어 문구로 교체한다**

`apply_patch`로 다음 문구를 기존 정보 계층과 순서에 맞춰 넣는다.

```text
완료는 살아 움직이는 개발 루프의 체크포인트다
리뷰 결과와 운영 환경을 닮은 증거는 다음의 작고 검증 가능한 요구사항이 된다.
01 · 요구사항
관찰 가능한 필요를 설명
동작 · 경계 · 인수 증거
02 · 설계 / 계획
가장 작고 안전한 변경 선택
데이터 · API · 마이그레이션 · 검증
03 · 구현
경계를 명시적으로 유지
tenant · 트랜잭션 · 이벤트 · 의존성
04 · 테스트 / 리뷰
발견 사항을 증거로 전환
실패 경로 · 호환성 · P0/P1
05 · 교훈
수정 이유를 기록
결정 · 거부한 경로 · 향후 가드
06 · 새 요구사항
배운 내용을 다시 반영
리뷰 공백 하나를 계약 하나로 전환
운영 입력
tenant 격리
알림
데이터베이스 호환성
성능 / SDK
살아 있는 명세·계획·테스트·리뷰 결과·교훈은 구현이 운영에서 실제로 드러난 사실과 계속 일치하게 한다.
```

`API`, `tenant`, `P0/P1`, `SDK`에는 `.tech`를 적용한다.

- [ ] **Step 4: 한국어 문구에 맞춰 카드와 캔버스를 조정한다**

문구를 줄여 기존 380×160 카드에 억지로 맞추지 않는다. 각 카드의 width/height, 카드 간 간격, 중앙 운영 입력 영역과 순환 연결선을 함께 조정한다. 필요하면 canvas width/height와 `viewBox`를 확장한다.

다음 불변조건을 유지한다.

```text
font-size: title 46px, subtitle 19px, label 28px, body 18px, small 15px
card inner horizontal padding: 30px 이상
card inner vertical padding: 24px 이상
connector count: 6
card count: 6
loop order: 요구사항 → 설계/계획 → 구현 → 테스트/리뷰 → 교훈 → 새 요구사항 → 요구사항
operational inputs: tenant 격리, 알림, 데이터베이스 호환성, 성능/SDK
```

- [ ] **Step 5: Part 7 한국어 SVG와 글꼴을 검사한다**

Run:

```bash
xmllint --noout public/assets/clinic-appointment-part7-development-loop-01.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py public/assets/clinic-appointment-part7-development-loop-01.svg
rg -n '요구사항|설계 / 계획|테스트 / 리뷰|운영 입력|P0/P1|SDK' \
  public/assets/clinic-appointment-part7-development-loop-01.svg
if rg -n 'Done is a checkpoint|Describe the observable need|Turn findings into evidence|OPERATIONAL INPUTS' \
  public/assets/clinic-appointment-part7-development-loop-01.svg; then exit 1; fi
```

Expected: XML 및 text audit 통과, 한국어 핵심 문구와 기술 식별자 검색 성공, 일반 영문 문구 검색 결과 없음.

- [ ] **Step 6: Part 7 한국어 PNG를 2배로 렌더링한다**

```bash
cairosvg public/assets/clinic-appointment-part7-development-loop-01.svg \
  -o public/assets/clinic-appointment-part7-development-loop-01.png \
  -s 2
sips -g pixelWidth -g pixelHeight public/assets/clinic-appointment-part7-development-loop-01.png
```

Expected: PNG의 width와 height가 SVG의 정확히 2배다. 캔버스를 확장했다면 3200×1800보다 커질 수 있다.

대체 글꼴이 보이면 Task 1의 librsvg 중간 SVG 경로를 Part 7 한국어 파일에 적용한다.

- [ ] **Step 7: Part 7 한국어 geometry와 원본 크기 PNG를 검사한다**

Run:

```bash
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py public/assets/clinic-appointment-part7-development-loop-01.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal public/assets/clinic-appointment-part7-development-loop-01.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py public/assets/clinic-appointment-part7-development-loop-01.svg
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py public/assets/clinic-appointment-part7-development-loop-01.svg
```

Expected: connectors=6, cards=6, `intrusions=0`, `crossings=0`, `shared_segments=0`, `geometry_failures=0`, endpoint PASS, mixed-corner `failures=0`.

Codex `view_image`로 한국어 PNG를 `original` detail로 열어 의미가 축약되지 않았는지, 카드·중앙 입력 영역·하단 설명의 여백이 충분한지, 순환 화살표가 확장된 카드 끝점과 맞는지 확인한다.

- [ ] **Step 8: 영어 Part 7 MDX만 `-en.png`로 변경한다**

`apply_patch`로 정확히 한 경로만 바꾼다.

```diff
-  <img src="/assets/clinic-appointment-part7-development-loop-01.png" alt="Diagram showing requirements, design and plan, implementation, tests and review, lessons, and a new requirement in a loop, informed by tenant isolation, notifications, database compatibility, performance, and SDK changes" loading="lazy" />
+  <img src="/assets/clinic-appointment-part7-development-loop-01-en.png" alt="Diagram showing requirements, design and plan, implementation, tests and review, lessons, and a new requirement in a loop, informed by tenant isolation, notifications, database compatibility, performance, and SDK changes" loading="lazy" />
```

Run:

```bash
rg -n 'clinic-appointment-part7-development-loop-01(-en)?\\.png' \
  src/content/docs/blog/clinic-appointment-part7-review-and-operational-evolution.mdx \
  src/content/docs/ko/blog/clinic-appointment-part7-review-and-operational-evolution.mdx
```

Expected: 영어 MDX는 `-en.png`, 한국어 MDX는 unsuffixed `.png`를 각각 한 번 참조한다.

- [ ] **Step 9: Part 7 한국어 자산과 locale 참조를 커밋한다**

```bash
git add public/assets/clinic-appointment-part7-development-loop-01.svg \
  public/assets/clinic-appointment-part7-development-loop-01.png \
  src/content/docs/blog/clinic-appointment-part7-review-and-operational-evolution.mdx
git diff --cached --check
git commit -m "Make the Part 7 diagram readable in each locale" \
  -m "Constraint: Preserve Korean meaning even when cards and canvas must expand
Rejected: Shorten Korean labels to retain English card widths | meaning is more important than fixed geometry
Confidence: high
Scope-risk: narrow
Directive: Keep the six-step loop and technical identifiers intact across localization
Tested: XML, text, connector, geometry, endpoint, mixed-corner, font, dimension, visual, and locale-reference checks
Not-tested: Full Astro build and route smoke checks run in the final verification task"
```

Expected: commit succeeds with the Part 7 unsuffixed pair and English MDX reference.

---

### Task 5: 전체 locale·빌드·경로 검증

**Files:**
- Verify: `public/assets/clinic-appointment-part6-rescheduling-flow-01.svg`
- Verify: `public/assets/clinic-appointment-part6-rescheduling-flow-01.png`
- Verify: `public/assets/clinic-appointment-part6-rescheduling-flow-01-en.svg`
- Verify: `public/assets/clinic-appointment-part6-rescheduling-flow-01-en.png`
- Verify: `public/assets/clinic-appointment-part7-development-loop-01.svg`
- Verify: `public/assets/clinic-appointment-part7-development-loop-01.png`
- Verify: `public/assets/clinic-appointment-part7-development-loop-01-en.svg`
- Verify: `public/assets/clinic-appointment-part7-development-loop-01-en.png`
- Verify: `src/content/docs/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx`
- Verify: `src/content/docs/ko/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx`
- Verify: `src/content/docs/blog/clinic-appointment-part7-review-and-operational-evolution.mdx`
- Verify: `src/content/docs/ko/blog/clinic-appointment-part7-review-and-operational-evolution.mdx`

- [ ] **Step 1: 네 SVG/PNG 쌍과 locale 참조를 함께 검사한다**

Run:

```bash
for asset in \
  public/assets/clinic-appointment-part6-rescheduling-flow-01 \
  public/assets/clinic-appointment-part6-rescheduling-flow-01-en \
  public/assets/clinic-appointment-part7-development-loop-01 \
  public/assets/clinic-appointment-part7-development-loop-01-en
do
  test -f "$asset.svg"
  test -f "$asset.png"
done

rg -n 'clinic-appointment-part6-rescheduling-flow-01-en\\.png' \
  src/content/docs/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx
rg -n 'clinic-appointment-part6-rescheduling-flow-01\\.png' \
  src/content/docs/ko/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx
rg -n 'clinic-appointment-part7-development-loop-01-en\\.png' \
  src/content/docs/blog/clinic-appointment-part7-review-and-operational-evolution.mdx
rg -n 'clinic-appointment-part7-development-loop-01\\.png' \
  src/content/docs/ko/blog/clinic-appointment-part7-review-and-operational-evolution.mdx
```

Expected: 네 asset basename마다 SVG/PNG가 존재하고 네 MDX가 올바른 locale 경로를 한 번씩 출력한다.

- [ ] **Step 2: 네 canonical SVG에 모든 자동 감사를 다시 실행한다**

Run:

```bash
svg_assets=(
  public/assets/clinic-appointment-part6-rescheduling-flow-01.svg
  public/assets/clinic-appointment-part6-rescheduling-flow-01-en.svg
  public/assets/clinic-appointment-part7-development-loop-01.svg
  public/assets/clinic-appointment-part7-development-loop-01-en.svg
)
xmllint --noout "${svg_assets[@]}"
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py "${svg_assets[@]}"
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py "${svg_assets[@]}"
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal "${svg_assets[@]}"
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py "${svg_assets[@]}"
python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py "${svg_assets[@]}"
```

Expected: XML 오류 없음, text audit `files=4`와 failures 0, 각 파일 connector/geometry PASS, endpoint `files=4` PASS, mixed-corner failures 0.

- [ ] **Step 3: 저장소 형식과 Astro 빌드를 검증한다**

Run:

```bash
git diff --check
npm run build
```

Expected: `astro check` diagnostics 0, static build 성공, 명령 exit 0.

- [ ] **Step 4: 빌드 산출물의 locale별 이미지 경로를 검사한다**

Run:

```bash
rg -n 'clinic-appointment-part6-rescheduling-flow-01-en\\.png' \
  dist/blog/clinic-appointment-part6-closure-equipment-rescheduling/index.html
rg -n 'clinic-appointment-part6-rescheduling-flow-01\\.png' \
  dist/ko/blog/clinic-appointment-part6-closure-equipment-rescheduling/index.html
rg -n 'clinic-appointment-part7-development-loop-01-en\\.png' \
  dist/blog/clinic-appointment-part7-review-and-operational-evolution/index.html
rg -n 'clinic-appointment-part7-development-loop-01\\.png' \
  dist/ko/blog/clinic-appointment-part7-review-and-operational-evolution/index.html
```

Expected: 각 locale HTML에서 대응 PNG 경로가 검색된다.

- [ ] **Step 5: 네 페이지와 네 PNG를 HTTP smoke test한다**

한 터미널 세션에서 다음을 실행하고 계속 띄워 둔다.

```bash
npm run preview -- --host 127.0.0.1 --port 4321
```

다른 터미널에서 실행한다.

```bash
for route in \
  /blog/clinic-appointment-part6-closure-equipment-rescheduling/ \
  /ko/blog/clinic-appointment-part6-closure-equipment-rescheduling/ \
  /blog/clinic-appointment-part7-review-and-operational-evolution/ \
  /ko/blog/clinic-appointment-part7-review-and-operational-evolution/ \
  /assets/clinic-appointment-part6-rescheduling-flow-01.png \
  /assets/clinic-appointment-part6-rescheduling-flow-01-en.png \
  /assets/clinic-appointment-part7-development-loop-01.png \
  /assets/clinic-appointment-part7-development-loop-01-en.png
do
  curl --fail --silent --show-error --output /dev/null \
    --write-out '%{http_code} %{url_effective}\n' \
    "http://127.0.0.1:4321$route"
done
```

Expected: 여덟 줄 모두 `200`.

- [ ] **Step 6: 최종 diff와 commit 범위를 검토한다**

Run:

```bash
git status --short --branch
git diff --check
git diff develop...HEAD --stat
git log --oneline --decorate develop..HEAD
```

Expected: 계획·설계 커밋과 Part 6·7 자산/MDX 커밋만 보이고, unstaged 또는 untracked 파일이 없으며, 알려진 검증 실패가 없다.
