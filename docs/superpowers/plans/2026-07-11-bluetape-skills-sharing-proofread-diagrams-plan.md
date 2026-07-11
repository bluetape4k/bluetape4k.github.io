# Bluetape Skills Part 1 Proofreading and Diagrams Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Part 1 원고를 자연스러운 한국어 기술 문체로 교정하고, 공개 bundle 경계와 source-first 동기화 순서를 설명하는 SVG/PNG 다이어그램 두 개를 추가한다.

**Architecture:** 원고의 사실과 구조를 먼저 고정한 뒤 문장만 교정한다. 다이어그램은 한 자산씩 `SVG 작성 → XML·geometry 검사 → CairoSVG PNG 렌더링 → 원본 크기 육안 검사 → MDX 삽입` 순서로 완료하며, 첫 그림은 정적 경계도, 둘째 그림은 순차 흐름도로 분리한다.

**Tech Stack:** Astro/Starlight MDX, hand-authored SVG, CairoSVG CLI, xmllint, bluetape-diagram audit scripts, npm

---

## File Map

- Modify: `src/content/docs/ko/blog/bluetape-skills-sharing.mdx`
  - 한국어 문체 교정, 첫 다이어그램 삽입, ASCII 흐름을 둘째 다이어그램으로 교체한다.
- Create: `public/assets/bluetape-skills-public-bundle-boundary-01.svg`
  - 공개 bundle과 private runtime의 정적 경계를 표현한다.
- Create: `public/assets/bluetape-skills-public-bundle-boundary-01.png`
  - 첫 SVG의 게시용 2배 렌더링이다.
- Create: `public/assets/bluetape-skills-source-first-sync-01.svg`
  - source-first 동기화와 export/validation의 순서를 표현한다.
- Create: `public/assets/bluetape-skills-source-first-sync-01.png`
  - 둘째 SVG의 게시용 2배 렌더링이다.
- Read only: `/Users/debop/work/bluetape4k/bluetape-skills/skills/manifest.json`
- Read only: `/Users/debop/work/bluetape4k/bluetape-skills/README.ko.md`
- Read only: `/Users/debop/work/bluetape4k/bluetape-skills/scripts/validate.sh`
- Read only: `/Users/debop/work/bluetape4k/bluetape-skills/scripts/install.sh`

## Task 1: Lock Facts and Prose Scope

**Files:**
- Read: `src/content/docs/ko/blog/bluetape-skills-sharing.mdx`
- Read: `/Users/debop/work/bluetape4k/bluetape-skills/skills/manifest.json`
- Read: `/Users/debop/work/bluetape4k/bluetape-skills/README.ko.md`
- Read: `/Users/debop/work/bluetape4k/bluetape-skills/scripts/validate.sh`
- Read: `/Users/debop/work/bluetape4k/bluetape-skills/scripts/install.sh`

- [ ] **Step 1: Record the immutable fact ledger**

Record these exact facts before editing:

```text
canonical skill count = 14
public repository = https://github.com/bluetape4k/bluetape-skills
install commands = ./scripts/validate.sh then ./scripts/install.sh
force update command = ./scripts/install.sh --force
default target = ${CODEX_HOME:-~/.codex}/skills
included = SKILL.md and linked references/templates/scripts
excluded = retired aliases, user memory, rules/hooks, config, plugin caches, secrets
installer behavior = refuse overwrite by default; timestamp backup before --force replacement
```

- [ ] **Step 2: Verify the ledger against current source**

Run:

```bash
jq '.skills | length, .[]' /Users/debop/work/bluetape4k/bluetape-skills/skills/manifest.json
rg -n 'expected_skills|forbidden|PASS:' /Users/debop/work/bluetape4k/bluetape-skills/scripts/validate.sh
rg -n 'refusing to replace|backup_root|--force|CODEX_HOME' /Users/debop/work/bluetape4k/bluetape-skills/scripts/install.sh
```

Expected: count `14`; the 14 canonical names; forbidden private/runtime checks; overwrite refusal and timestamp backup behavior.

- [ ] **Step 3: Freeze article structure**

Preserve these elements without reordering:

```text
frontmatter
hero figure
post meta
problem/improvement table
Action/Evidence/Failure code block
name migration table
installation/update commands
routing code block
series navigation
repository link
```

## Task 2: Proofread the Korean Article

**Files:**
- Modify: `src/content/docs/ko/blog/bluetape-skills-sharing.mdx`

- [ ] **Step 1: Replace translation-shaped framing**

Apply small sentence-level edits with these fixed transformations:

```text
"다른 개발자와 다른 머신에서도 재사용할 수 있도록"
→ "다른 개발자와 여러 머신에서도 재사용할 수 있도록"

"다른 개발자에게 전달된 것은 skill이 아니라 제목과 요약에 가까워진다"
→ "그 상태로 다른 개발자에게 전달하면 실행 절차가 아니라 제목과 요약만 건네는 셈이다"

"자동화에서는 이 당연함이 가장 먼저 빠진다"
→ "하지만 자동화에서는 이런 암묵적인 전제가 가장 먼저 빠진다"

"파일 구조와 검사 command로 바꿨다"
→ "파일 구조와 검사 명령으로 명시했다"
```

- [ ] **Step 2: Repair checklist and migration prose**

Use concrete Korean verbs while preserving identifiers:

```text
dependent step → 뒤따르는 단계
scope evidence → 적용 범위를 증명하는 근거
compatibility alias → 호환용 alias
historical record → 과거 기록
mapping table → 매핑 표
```

Keep `Action`, `Evidence`, `Failure`, `UNKNOWN`, `SKIPPED`, `N/A`, `PASS`, skill names, GNO, and file names exact.

- [ ] **Step 3: Repair install, boundary, and source-first prose**

Use these terminology rules consistently:

```text
canonical skill = canonical skill
public bundle = 공개 묶음
private runtime = 개인 runtime
managed source = managed source
live file/surface = live 파일 / live 영역
validation = 검증
export = export
```

Split sentences carrying more than one causal claim. Remove promotional emphasis and keep the operational reason immediately after each rule.

- [ ] **Step 4: Run the naturalness scan**

Run:

```bash
rg -n '~를 통해|에 있어서|되어진|할 필요가 있다|또한|따라서|나아가|dependent step|scope evidence|earlier gate' src/content/docs/ko/blog/bluetape-skills-sharing.mdx
```

Expected: no unreviewed translationese matches. Any match kept for a technical reason is read in its full paragraph and recorded.

## Task 3: Create the Public Bundle Boundary Diagram

**Files:**
- Create: `public/assets/bluetape-skills-public-bundle-boundary-01.svg`
- Create: `public/assets/bluetape-skills-public-bundle-boundary-01.png`

- [ ] **Step 1: Create the SVG canvas and style system**

Create a `1200x720` SVG with this exact top-level structure:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
  <defs>
    <style>
      .title { font: 700 34px 'Architects Daughter', cursive; fill: #16324f; }
      .subtitle { font: 20px 'Comic Mono', monospace; fill: #516270; }
      .card-title { font: 700 23px 'Architects Daughter', cursive; fill: #16324f; }
      .card-text { font: 17px 'Comic Mono', monospace; fill: #334b5c; }
      .flow { fill: none; stroke: #2f6f9f; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
    </style>
    <marker id="arrow-blue" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto">
      <path d="M0,0 L14,7 L0,14 Z" fill="#2f6f9f"/>
    </marker>
  </defs>
  <rect width="1200" height="720" fill="#f7f4ea"/>
</svg>
```

- [ ] **Step 2: Add the three responsibility regions**

Use these exact boxes:

```text
Canonical Skills Source: x=50 y=150 w=250 h=430 rx=28
Public Bundle:           x=380 y=100 w=440 h=530 rx=32
Private Runtime:         x=900 y=150 w=250 h=430 rx=28
```

Public cards use `#dceeff` fill and `#2f6f9f` stroke. Private cards use `#ffe6df` fill and `#b85b4b` stroke. Source uses `#e8e1f7` fill and `#7357a3` stroke.

- [ ] **Step 3: Add the exact labels and relationships**

Public cards:

```text
SKILL.md
references/
templates/
scripts/
manifest.json
```

Private cards:

```text
memory
rules & hooks
config
plugin caches
secrets
retired aliases
```

Draw one rounded orthogonal arrow from the source region to the public boundary:

```xml
<path class="flow" marker-end="url(#arrow-blue)" d="M300 365 H340 Q360 365 360 345 V320 Q360 300 380 300"/>
```

Do not draw an arrow into the private region. Use the heading `Excluded from Distribution` and spatial separation to express exclusion.

- [ ] **Step 4: Parse and render**

Run:

```bash
xmllint --noout public/assets/bluetape-skills-public-bundle-boundary-01.svg
cairosvg public/assets/bluetape-skills-public-bundle-boundary-01.svg -o public/assets/bluetape-skills-public-bundle-boundary-01.png -s 2
sips -g pixelWidth -g pixelHeight public/assets/bluetape-skills-public-bundle-boundary-01.png
```

Expected: XML PASS and PNG `2400x1440`.

- [ ] **Step 5: Run diagram audits**

Run:

```bash
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py" public/assets/bluetape-skills-public-bundle-boundary-01.svg
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py" --fail-diagonal public/assets/bluetape-skills-public-bundle-boundary-01.svg
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py" public/assets/bluetape-skills-public-bundle-boundary-01.svg
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py" public/assets/bluetape-skills-public-bundle-boundary-01.svg
```

Expected: `connectors>=1`, `cards>=3`, `q_bends>=2`, `failures=0`. If a generic script reports a weak card count because groups are not recognized, count the three region rectangles and eleven item cards with a targeted XML query before continuing.

- [ ] **Step 6: Inspect the full-size PNG**

Open `public/assets/bluetape-skills-public-bundle-boundary-01.png` at original size. Confirm:

```text
labels clipped = 0
card intrusions = 0
wrong arrow direction = 0
sharp bends = 0
unexplained connector colors = 0
public/private ambiguity = 0
```

Return to Step 2 or Step 3 on any failure.

- [ ] **Step 7: Commit the completed first asset**

```bash
git add public/assets/bluetape-skills-public-bundle-boundary-01.svg public/assets/bluetape-skills-public-bundle-boundary-01.png
git commit -m "docs: make the public skill boundary visible"
```

## Task 4: Embed the Public Bundle Diagram

**Files:**
- Modify: `src/content/docs/ko/blog/bluetape-skills-sharing.mdx`

- [ ] **Step 1: Insert the figure after the boundary explanation**

Insert this exact MDX after the paragraph ending with `skill의 계약 일부이기 때문이다.`:

```mdx
<figure class="bt4k-architecture">
  <img src="/assets/bluetape-skills-public-bundle-boundary-01.png" alt="Canonical Skills Source에서 SKILL.md, references, templates, scripts와 manifest를 Public Bundle로 배포하고 memory, rules와 hooks, config, plugin cache, secrets와 retired aliases는 Private Runtime에 남기는 경계" loading="lazy" />
  <figcaption>공개 묶음은 skill 실행에 필요한 계약을 함께 배포하되, 개인 runtime과 호환용 alias는 경계 밖에 둔다.</figcaption>
</figure>
```

- [ ] **Step 2: Verify the embed**

Run:

```bash
rg -n 'bluetape-skills-public-bundle-boundary-01.png|공개 묶음은 skill 실행' src/content/docs/ko/blog/bluetape-skills-sharing.mdx
test -f public/assets/bluetape-skills-public-bundle-boundary-01.svg
test -f public/assets/bluetape-skills-public-bundle-boundary-01.png
```

Expected: one MDX embed and both asset files present.

## Task 5: Create the Source-first Sync Pipeline Diagram

**Files:**
- Create: `public/assets/bluetape-skills-source-first-sync-01.svg`
- Create: `public/assets/bluetape-skills-source-first-sync-01.png`

- [ ] **Step 1: Confirm flow-style architecture semantics**

Use the already loaded architecture reference and record this classification:

```text
reader question = which delivery responsibility must pass before the next responsibility opens?
diagram kind = flow-style architecture pipeline
not a sequence diagram = no runtime participants, calls, returns, branches, lifelines, or activations
layout = two-row responsibility cards with rounded orthogonal progression
```

Expected: architecture rules govern cards, responsibility labels, spacing, and connectors. Do not add fake participants or message lanes merely to visualize order.

- [ ] **Step 2: Create the SVG canvas and eight stages**

Create a `1680x680` SVG using the same style definitions as Task 3. Place two rows of four cards:

```text
Managed Source       x=70   y=170 w=310 h=130
Targeted Apply       x=450  y=170 w=310 h=130
Source / Live Parity x=830  y=170 w=310 h=130
sync-codex --status  x=1210 y=170 w=310 h=130
Codex Self-Audit     x=1210 y=410 w=310 h=130
Commit & Push        x=830  y=410 w=310 h=130
Public Export        x=450  y=410 w=310 h=130
Bundle Validation    x=70   y=410 w=310 h=130
```

This creates a clockwise serpentine flow without diagonal connectors.

- [ ] **Step 3: Add rounded orthogonal connectors**

Use straight horizontal paths within each row and one rounded right-side turn between rows:

```xml
<path class="flow" marker-end="url(#arrow-blue)" d="M380 235 H450"/>
<path class="flow" marker-end="url(#arrow-blue)" d="M760 235 H830"/>
<path class="flow" marker-end="url(#arrow-blue)" d="M1140 235 H1210"/>
<path class="flow" marker-end="url(#arrow-blue)" d="M1365 300 V350 Q1365 370 1345 370 H1325 Q1305 370 1305 390 V410"/>
<path class="flow" marker-end="url(#arrow-blue)" d="M1210 475 H1140"/>
<path class="flow" marker-end="url(#arrow-blue)" d="M830 475 H760"/>
<path class="flow" marker-end="url(#arrow-blue)" d="M450 475 H380"/>
```

For the four bottom-row leftward paths, use a dedicated left-facing marker whose `refX`, polygon direction, size, and color render consistently with the right-facing primary marker.

- [ ] **Step 4: Parse and render**

Run:

```bash
xmllint --noout public/assets/bluetape-skills-source-first-sync-01.svg
cairosvg public/assets/bluetape-skills-source-first-sync-01.svg -o public/assets/bluetape-skills-source-first-sync-01.png -s 2
sips -g pixelWidth -g pixelHeight public/assets/bluetape-skills-source-first-sync-01.png
```

Expected: XML PASS and PNG `3360x1360`.

- [ ] **Step 5: Run connector audits**

Run:

```bash
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py" public/assets/bluetape-skills-source-first-sync-01.svg
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py" --fail-diagonal public/assets/bluetape-skills-source-first-sync-01.svg
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py" public/assets/bluetape-skills-source-first-sync-01.svg
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py" public/assets/bluetape-skills-source-first-sync-01.svg
```

Expected:

```text
connectors = 7
cards = 8
q_bends >= 2
diagonal failures = 0
endpoint failures = 0
mixed-corner failures = 0
```

- [ ] **Step 6: Inspect the full-size PNG**

Confirm:

```text
stage order errors = 0
wrong arrow direction = 0
sharp turns = 0
card or label intrusions = 0
arrowhead color/size mismatch = 0
excess bottom whitespace = 0
```

The right-side turn must curve from the top row toward the lower row; a reverse-direction rounded corner is a failure even if the path contains `Q` commands.

- [ ] **Step 7: Commit the completed second asset**

```bash
git add public/assets/bluetape-skills-source-first-sync-01.svg public/assets/bluetape-skills-source-first-sync-01.png
git commit -m "docs: show the source-first skill delivery path"
```

## Task 6: Replace the ASCII Flow and Complete the Article

**Files:**
- Modify: `src/content/docs/ko/blog/bluetape-skills-sharing.mdx`

- [ ] **Step 1: Replace the source-first ASCII block**

Replace the code block beginning with `chezmoi managed source 수정` with:

```mdx
<figure class="bt4k-architecture">
  <img src="/assets/bluetape-skills-source-first-sync-01.png" alt="Managed Source 수정에서 Targeted Apply, Source와 Live Parity, sync-codex status, Codex Self-Audit, Commit과 Push, Public Export, Bundle Validation으로 이어지는 source-first 동기화 흐름" loading="lazy" />
  <figcaption>Live 파일 하나의 성공이 아니라 managed source부터 공개 bundle 검증까지 이어지는 전체 경로를 동기화 단위로 본다.</figcaption>
</figure>
```

- [ ] **Step 2: Re-read the complete article**

Read the full file from frontmatter through repository link. Confirm every paragraph advances one of these purposes:

```text
problem
operational evidence
interpretation
selection or safety rule
navigation
```

Delete no technical fact from the Task 1 ledger.

- [ ] **Step 3: Verify article shape and assets**

Run:

```bash
rg -n '<figure|<img|<figcaption|```|^## |bluetape-skills-(public-bundle-boundary|source-first-sync)-01.png|ai-collaboration-environment|bluetape-skills-workflow-guide|github.com/bluetape4k/bluetape-skills' src/content/docs/ko/blog/bluetape-skills-sharing.mdx
```

Expected: hero plus two architecture figures, paired code fences, both series links, and one repository link.

- [ ] **Step 4: Commit the completed article**

```bash
git add src/content/docs/ko/blog/bluetape-skills-sharing.mdx
git commit -m "docs: make the Bluetape skill sharing guide easier to follow"
```

## Task 7: Final Validation and Visual Review

**Files:**
- Verify: `src/content/docs/ko/blog/bluetape-skills-sharing.mdx`
- Verify: `public/assets/bluetape-skills-public-bundle-boundary-01.svg`
- Verify: `public/assets/bluetape-skills-public-bundle-boundary-01.png`
- Verify: `public/assets/bluetape-skills-source-first-sync-01.svg`
- Verify: `public/assets/bluetape-skills-source-first-sync-01.png`

- [ ] **Step 1: Run diff hygiene**

```bash
git diff --check HEAD~3..HEAD
git status --short
```

Expected: no whitespace errors; unrelated pre-existing files remain preserved.

- [ ] **Step 2: Build the site**

```bash
npm run build
```

Expected: Astro diagnostics `0 errors`, `0 warnings`, `0 hints`; static build succeeds and includes `/ko/blog/bluetape-skills-sharing/`.

- [ ] **Step 3: Verify the local route and rendered content**

```bash
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4321/ko/blog/bluetape-skills-sharing/
rg -n 'bluetape-skills-public-bundle-boundary-01.png|bluetape-skills-source-first-sync-01.png|P0|bluetape4k/bluetape-skills' dist/ko/blog/bluetape-skills-sharing/index.html
```

Expected: HTTP `200`; both PNG references and repository link in generated HTML. `P0` is not required in Part 1 and a missing match for it is not a failure.

- [ ] **Step 4: Inspect both final PNGs again**

Open both PNG files at original size after the last MDX or coordinate edit. Record dimensions and explicit PASS/FAIL for labels, endpoints, arrowheads, rounded corners, crossings, card intrusion, fonts, and whitespace.

- [ ] **Step 5: Reconcile the checklist totals**

Report:

```text
Required checks: X/Y
N/A: N
Blocked: 0
P0/P1: 0
```

Do not report completion if either image was not inspected after its final coordinate change, either SVG audit has weak unexplained counts, the site build fails, or the local route is not 200.
