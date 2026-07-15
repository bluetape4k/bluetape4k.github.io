# Bluetape Skills Part 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `bluetape-skills` v1.1.0의 native workflow runtime을 중단된 workflow 복구 문제에 초점을 맞춰 설명하는 한국어·영어 Part 3 글과 dark-style Hero·runtime boundary 다이어그램을 게시 가능한 상태로 만든다.

**Architecture:** `v1.1.0` tag의 release·contract·CLI를 사실 원장으로 고정하고 한국어 원문을 먼저 작성한 뒤 `bluetape-writer` 기준으로 교정한다. 영어판은 검수된 한국어 글에서 현지화하며, Hero와 다이어그램은 같은 dark visual system을 사용하되 Hero는 서사적 3D 장면, 본문 그림은 실행 주체와 기록 책임을 분리하는 정적 architecture diagram으로 만든다.

**Tech Stack:** Astro/Starlight MDX, GitHub release/tag sources, hand-authored SVG, CairoSVG, xmllint, bluetape-diagram audit scripts, image generation, npm

---

## File Map

- Create: `src/content/docs/ko/blog/bluetape-skills-workflow-runtime-recovery.mdx`
  - v1.1.0 복구 흐름을 설명하는 한국어 기준 원문이다.
- Create: `src/content/docs/blog/bluetape-skills-workflow-runtime-recovery.mdx`
  - 한국어 검수 뒤 작성하는 영어 현지화본이다.
- Modify: `src/content/docs/ko/blog/ai-collaboration-environment.mdx`
- Modify: `src/content/docs/blog/ai-collaboration-environment.mdx`
- Modify: `src/content/docs/ko/blog/bluetape-skills-sharing.mdx`
- Modify: `src/content/docs/blog/bluetape-skills-sharing.mdx`
- Modify: `src/content/docs/ko/blog/bluetape-skills-workflow-guide.mdx`
- Modify: `src/content/docs/blog/bluetape-skills-workflow-guide.mdx`
  - 선행 글의 시리즈 목록을 Part 3까지 연결한다.
- Create: `public/assets/bluetape-skills-runtime-recovery-hero.png`
  - 1200x630 dark-style 3D social/Hero asset이다.
- Create: `public/assets/bluetape-skills-native-runtime-boundary-01.svg`
  - native action과 evidence runtime의 책임 경계를 보존하는 원본이다.
- Create: `public/assets/bluetape-skills-native-runtime-boundary-01.png`
  - SVG를 2배 렌더링한 게시용 그림이다.
- Read only: `/Users/debop/work/bluetape4k/bluetape-skills/CHANGELOG.md`
- Read only: `/Users/debop/work/bluetape4k/bluetape-skills/README.ko.md`
- Read only: `/Users/debop/work/bluetape4k/bluetape-skills/skills/bluetape-workflow/references/workflow-manifest.json`
- Read only: `/Users/debop/work/bluetape4k/bluetape-skills/skills/bluetape-workflow/references/liveness-contract.md`
- Read only: `/Users/debop/work/bluetape4k/bluetape-skills/skills/bluetape-workflow/references/topology-contract.md`
- Read only: `/Users/debop/work/bluetape4k/bluetape-skills/skills/bluetape-workflow/scripts/bluetape-flow.py`

## Task 1: Lock the v1.1.0 Fact Ledger

**Files:**
- Read: `/Users/debop/work/bluetape4k/bluetape-skills/CHANGELOG.md`
- Read: `/Users/debop/work/bluetape4k/bluetape-skills/README.ko.md`
- Read: `/Users/debop/work/bluetape4k/bluetape-skills/skills/bluetape-workflow/references/workflow-manifest.json`
- Read: `/Users/debop/work/bluetape4k/bluetape-skills/skills/bluetape-workflow/references/liveness-contract.md`
- Read: `/Users/debop/work/bluetape4k/bluetape-skills/skills/bluetape-workflow/references/topology-contract.md`

- [ ] **Step 1: Verify the release boundary**

Run:

```bash
git -C /Users/debop/work/bluetape4k/bluetape-skills status --short --branch
git -C /Users/debop/work/bluetape4k/bluetape-skills rev-parse v1.1.0^{}
gh release view v1.1.0 --repo bluetape4k/bluetape-skills --json tagName,publishedAt,isDraft,isPrerelease,assets,url
```

Expected: clean `main`; dereferenced tag commit `a63c19e5bc69a39f873b5aa0ea3c97356ea90642`; release published on 2026-07-14 and neither draft nor prerelease.

- [ ] **Step 2: Record the immutable article facts**

Use this exact ledger:

```text
manifest version = 1.1
observe interval = 30 seconds
suspected stall = 120 seconds without a valid lease
maximum silence lease = 600 seconds
probe grace = 60 seconds
heartbeat proves liveness only
completion rule = weakest_required_component
healthy continuation = resume-check plus a new owner epoch
damaged receipt = diagnose, preserve trusted prefix, quarantine, create a distinct recovery run
runtime boundary = Python records guarded intent and bounded observed evidence; Codex main session executes native tools
state writer = bluetape-flow.py only
canonical bundled skills = 14
external companions = code-review and self-audit
```

- [ ] **Step 3: Recheck every number and boundary against the tag**

Run:

```bash
git -C /Users/debop/work/bluetape4k/bluetape-skills show v1.1.0:skills/bluetape-workflow/references/workflow-manifest.json | jq '.manifest_version, .liveness'
git -C /Users/debop/work/bluetape4k/bluetape-skills show v1.1.0:skills/bluetape-workflow/references/liveness-contract.md | rg -n '30|120|600|60|heartbeat|progress'
git -C /Users/debop/work/bluetape4k/bluetape-skills show v1.1.0:skills/bluetape-workflow/references/topology-contract.md | rg -n 'weakest_required_component|resume-check|receipt-diagnose|recovery run|native'
```

Expected: every fact appears in a v1.1.0 source. Do not use live `main` text as the article authority.

## Task 2: Draft the Korean Primary Article

**Files:**
- Create: `src/content/docs/ko/blog/bluetape-skills-workflow-runtime-recovery.mdx`

- [ ] **Step 1: Create the frontmatter and Hero block**

Use this exact shell of metadata and opening structure:

```mdx
---
title: "Bluetape Skills Part 3: 중단된 workflow를 이어서 복구하는 방법"
description: Bluetape Skills 1.1.0의 native workflow runtime이 lane 상태와 liveness, component evidence, receipt를 기록해 중단된 작업을 안전하게 이어 가는 방법을 설명합니다.
sidebar:
  order: -202607152330
blog:
  date: 2026-07-15T23:30:00+09:00
  image: /assets/bluetape-skills-runtime-recovery-hero.png
  imageAlt: 어두운 작업대에서 로봇 개발자가 멈춘 workflow lane의 receipt를 확인하고 파란 recovery bridge를 연결하는 3D 일러스트
  cardDescription: 1.1.0 runtime이 중단된 lane을 판별하고 receipt와 component evidence를 바탕으로 workflow를 복구하는 과정을 설명합니다.
---

<figure class="bt4k-blog-hero">
  <img src="/assets/bluetape-skills-runtime-recovery-hero.png" alt="어두운 작업대에서 로봇 개발자가 멈춘 workflow lane의 receipt를 확인하고 파란 recovery bridge를 연결하는 3D 일러스트" loading="eager" />
  <figcaption>중단된 workflow는 완료 보고가 아니라 남아 있는 상태와 증거를 바탕으로 이어 간다.</figcaption>
</figure>

<p class="bt4k-post-meta">2026-07-15 · Bluetape Skills Part 3</p>
```

- [ ] **Step 2: Write the recovery-first narrative**

Write these headings in order and keep the stated claim under each one:

```text
왜 복구 가능한 workflow가 필요했나
  Part 2 checklist 이후에도 남은 silence, late result, damaged receipt 문제
문서형 checklist에서 native runtime으로
  runtime은 새 orchestrator가 아니라 검증 가능한 상태 기록 계층
run과 lane은 어떻게 움직이나
  approve/start/create/startup-ack, owner epoch, terminal state
liveness는 progress가 아니다
  30/120/600/60 and heartbeat boundary
가장 약한 required component가 완료를 결정한다
  required check/evidence가 빈 component가 전체 완료를 막음
receipt로 중단된 작업을 복구한다
  healthy resume and damaged-chain recovery as separate paths
기록하는 runtime, 실행하는 Codex
  main session owns native actions; Python records intent/evidence only
1.1.0 설치와 검증
  tagged shallow clone, validate, install --force, restart
언제 runtime을 사용해야 하나
  long-running, parallel, handoff, replacement, recovery; not trivial edits
```

- [ ] **Step 3: Add the two bounded command examples**

Use only commands verified by `bluetape-flow.py --help` and keep owner credentials out:

```text
run-approve -> run-start -> lane-create -> lane-start -> native spawn -> startup-ack
liveness-check -> stall-record -> probe-sent -> interrupt-result -> lane-reassign
```

Explain that arrows cross the Python/native boundary: `bluetape-flow.py` records intent, the main session invokes the native action, and the CLI then records bounded observed evidence.

- [ ] **Step 4: Insert the runtime boundary figure and source sections**

Use:

```mdx
<figure class="bt4k-architecture">
  <img src="/assets/bluetape-skills-native-runtime-boundary-01.png" alt="Codex main session이 native agent tool을 직접 실행하고 guarded evidence runtime을 통해 intent와 observed evidence를 manifest, receipt, topology에 기록하는 책임 경계" loading="lazy" />
  <figcaption>실행은 Codex main session이 맡고, runtime은 그 실행의 의도와 관찰 결과를 제한된 증거로 남긴다.</figcaption>
</figure>
```

End with `## 시리즈 글` and `## 출처` containing the repository, v1.1.0 release, issue #5, PR #6, and v1.0.0...v1.1.0 compare links.

- [ ] **Step 5: Commit the sourced Korean draft**

```bash
git add src/content/docs/ko/blog/bluetape-skills-workflow-runtime-recovery.mdx
git commit -m "Explain why interrupted workflows need durable evidence" -m "Constraint: Pin every runtime claim to bluetape-skills v1.1.0" -m "Confidence: high" -m "Scope-risk: narrow" -m "Tested: source ledger and command-name review" -m "Not-tested: prose, visuals, and site build remain in later tasks"
```

## Task 3: Proofread the Korean Article

**Files:**
- Modify: `src/content/docs/ko/blog/bluetape-skills-workflow-runtime-recovery.mdx`

- [ ] **Step 1: Lock facts before prose edits**

Run:

```bash
rg -n '1\.1|30초|120초|600초|60초|heartbeat|weakest_required_component|resume-check|receipt-diagnose|code-review|self-audit' src/content/docs/ko/blog/bluetape-skills-workflow-runtime-recovery.mdx
```

Expected: every ledger item is present with the same meaning before and after proofreading.

- [ ] **Step 2: Apply KO-01 through KO-06 paragraph by paragraph**

Use these fixed decisions:

```text
Preserve: workflow, runtime, lane, receipt, owner epoch, heartbeat, evidence, native tool, command identifiers
Replace: generic promotional claims with observable behavior
Prefer: "기록한다", "막는다", "이어 간다", "분리한다", "확인한다"
Avoid: 과도한 피동형, 불필요한 명사화, 반복되는 "이것은", 문단마다 붙는 "또한/따라서/나아가"
Do not invent: metaphors, performance claims, safety guarantees beyond the contracts
```

- [ ] **Step 3: Run the Korean naturalness scan**

Run:

```bash
rg -n '~를 통해|에 있어서|되어진|할 필요가 있다|또한|따라서|나아가|혁신적|강력한|완벽한|seamless' src/content/docs/ko/blog/bluetape-skills-workflow-runtime-recovery.mdx
```

Expected: no unreviewed match. Read any retained match in its full paragraph and confirm that removing it would reduce precision.

- [ ] **Step 4: Reconcile the fact ledger after proofreading**

Repeat Task 3 Step 1 and compare the command examples and source links with v1.1.0. Expected: no number, identifier, or responsibility boundary changed.

- [ ] **Step 5: Commit the Korean editorial pass**

```bash
git add src/content/docs/ko/blog/bluetape-skills-workflow-runtime-recovery.mdx
git commit -m "Make the recovery guide read like native Korean" -m "Constraint: Preserve v1.1.0 identifiers, numbers, commands, and source links" -m "Confidence: high" -m "Scope-risk: narrow" -m "Tested: KO-01 through KO-06 and fact-ledger reconciliation" -m "Not-tested: English parity and rendered site"
```

## Task 4: Localize English and Extend Series Navigation

**Files:**
- Create: `src/content/docs/blog/bluetape-skills-workflow-runtime-recovery.mdx`
- Modify: `src/content/docs/ko/blog/ai-collaboration-environment.mdx`
- Modify: `src/content/docs/blog/ai-collaboration-environment.mdx`
- Modify: `src/content/docs/ko/blog/bluetape-skills-sharing.mdx`
- Modify: `src/content/docs/blog/bluetape-skills-sharing.mdx`
- Modify: `src/content/docs/ko/blog/bluetape-skills-workflow-guide.mdx`
- Modify: `src/content/docs/blog/bluetape-skills-workflow-guide.mdx`

- [ ] **Step 1: Create the English article from the approved Korean structure**

Use the title `Bluetape Skills Part 3: Recovering and Resuming Interrupted Workflows`, the same date, Hero, facts, commands, diagram, source links, and heading order. Translate meaning rather than Korean syntax; keep identifiers unchanged.

- [ ] **Step 2: Add Part 3 to all six predecessor navigation blocks**

Add these exact links:

```md
- [Bluetape Skills Part 3: 중단된 workflow를 이어서 복구하는 방법](/ko/blog/bluetape-skills-workflow-runtime-recovery/)
- [Bluetape Skills Part 3: Recovering and Resuming Interrupted Workflows](/blog/bluetape-skills-workflow-runtime-recovery/)
```

For the two environment articles, extend the follow-up prose from “Part 2” to “Part 3” and add the same locale-appropriate link.

- [ ] **Step 3: Check locale parity**

Run:

```bash
rg -n '2026-07-15|bluetape-skills-runtime-recovery-hero|30|120|600|60|weakest_required_component|v1.1.0|issues/5|pull/6|compare/v1.0.0...v1.1.0' src/content/docs/{ko/blog,blog}/bluetape-skills-workflow-runtime-recovery.mdx
rg -l 'bluetape-skills-workflow-runtime-recovery' src/content/docs/{ko/blog,blog}/{ai-collaboration-environment,bluetape-skills-sharing,bluetape-skills-workflow-guide}.mdx | sort
```

Expected: both new files contain every fact anchor; all six predecessor files contain Part 3 links.

- [ ] **Step 4: Commit localization and navigation**

```bash
git add src/content/docs/blog/bluetape-skills-workflow-runtime-recovery.mdx src/content/docs/ko/blog/ai-collaboration-environment.mdx src/content/docs/blog/ai-collaboration-environment.mdx src/content/docs/ko/blog/bluetape-skills-sharing.mdx src/content/docs/blog/bluetape-skills-sharing.mdx src/content/docs/ko/blog/bluetape-skills-workflow-guide.mdx src/content/docs/blog/bluetape-skills-workflow-guide.mdx
git commit -m "Carry the recovery guide across both locale routes" -m "Constraint: Keep series order and technical evidence identical across Korean and English" -m "Confidence: high" -m "Scope-risk: narrow" -m "Tested: locale fact anchors and six predecessor navigation links" -m "Not-tested: production rendering remains in the final site gate"
```

## Task 5: Generate and Inspect the Dark Hero

**Files:**
- Create: `public/assets/bluetape-skills-runtime-recovery-hero.png`

- [ ] **Step 1: Generate one text-free 1200x630 composition**

Use this art direction:

```text
Polished cinematic 3D miniature technical workbench in a deep navy and charcoal environment, matching the established Bluetape Skills white-and-blue robotic builders. One workflow lane is paused with a restrained amber warning light. A small robot holds a glowing receipt artifact and reconnects that lane through a luminous blue recovery bridge. Other lanes remain stable in blue and green. Cyan and blue rim lighting, readable silhouettes, controlled highlights, no crushed shadows, no text, no logos, no UI labels, wide social-card composition, clear central recovery subject.
```

- [ ] **Step 2: Normalize dimensions without changing composition**

Run:

```bash
sips -g pixelWidth -g pixelHeight public/assets/bluetape-skills-runtime-recovery-hero.png
```

Expected: `1200x630`. If the generator output differs, use a centered cover crop that preserves the receipt, stopped lane, and blue bridge.

- [ ] **Step 3: Compare with the existing series at full size**

Open the new Hero at original size and compare it with:

```text
public/assets/bluetape-skills-sharing-hero-v2.png
public/assets/bluetape-workflow-guide-hero.png
```

Reject and regenerate if text appears, the subject is ambiguous, amber dominates the frame, shadows hide the robot/receipt/bridge, or the result stops resembling the miniature Bluetape Skills series.

- [ ] **Step 4: Commit the accepted Hero**

```bash
git add public/assets/bluetape-skills-runtime-recovery-hero.png
git commit -m "Give workflow recovery a distinct dark visual identity" -m "Constraint: Preserve the established miniature robot series without text in the asset" -m "Confidence: high" -m "Scope-risk: narrow" -m "Tested: 1200x630 metadata and original-size visual inspection" -m "Not-tested: social crop is covered by the final generated-page inspection"
```

## Task 6: Build and Audit the Dark Runtime Boundary Diagram

**Files:**
- Create: `public/assets/bluetape-skills-native-runtime-boundary-01.svg`
- Create: `public/assets/bluetape-skills-native-runtime-boundary-01.png`

- [ ] **Step 1: Create the dark SVG system**

Create a `1200x720` SVG with `#07111f` canvas, `#10243a` cards, `#6ee7ff` primary action, `#4f8cff` observed evidence, `#f5b942` recovery boundary, and `#4fd18b` verified completion. Use `Architects Daughter` headings and `Comic Mono` labels with readable fallbacks.

- [ ] **Step 2: Add the four responsibility regions**

Place these regions horizontally with generous margins:

```text
Main Session:              x=50  y=160 w=230 h=410
Native Codex Tools:        x=340 y=160 w=230 h=410
Guarded Evidence Runtime:  x=630 y=160 w=250 h=410
Manifest/Receipt/Topology: x=940 y=160 w=210 h=410
```

Show `spawn / send / wait / interrupt` only in Native Codex Tools and show `intent / observed evidence / bounded receipt` only in the runtime/state regions.

- [ ] **Step 3: Draw only the responsibility-correct connectors**

Use rounded orthogonal paths:

```text
Main Session -> Native Codex Tools: cyan solid, Executes native action
Native Codex Tools -> Main Session: blue dashed, Observed result
Main Session -> Guarded Evidence Runtime: cyan solid, Records intent/evidence
Guarded Evidence Runtime -> Manifest/Receipt/Topology: blue solid, Guarded state write
Manifest/Receipt/Topology -> Main Session: amber dashed, Resume/recovery evidence
```

Include a compact legend for solid action, dashed observation/recovery, and green verified terminal state. Do not connect Guarded Evidence Runtime directly to Native Codex Tools.

- [ ] **Step 4: Parse, render, and verify nonzero structure**

Run:

```bash
xmllint --noout public/assets/bluetape-skills-native-runtime-boundary-01.svg
cairosvg public/assets/bluetape-skills-native-runtime-boundary-01.svg -o public/assets/bluetape-skills-native-runtime-boundary-01.png -s 2
sips -g pixelWidth -g pixelHeight public/assets/bluetape-skills-native-runtime-boundary-01.png
rg -c '<path' public/assets/bluetape-skills-native-runtime-boundary-01.svg
rg -c 'marker-end=' public/assets/bluetape-skills-native-runtime-boundary-01.svg
```

Expected: XML PASS; PNG `2400x1440`; at least five connector paths and five arrow markers.

- [ ] **Step 5: Run every applicable bluetape-diagram audit**

Run:

```bash
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py" public/assets/bluetape-skills-native-runtime-boundary-01.svg
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py" --fail-diagonal public/assets/bluetape-skills-native-runtime-boundary-01.svg
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py" public/assets/bluetape-skills-native-runtime-boundary-01.svg
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py" public/assets/bluetape-skills-native-runtime-boundary-01.svg
```

Expected: zero failures for connector, diagonal, endpoint, and mixed-corner checks. Treat zero recognized connectors/cards as an audit incompatibility, not a pass; use the Step 4 counts and inspect the matching SVG elements directly.

- [ ] **Step 6: Inspect the 2400x1440 PNG at original size**

Verify every label, dark-background contrast, legend meaning, arrow direction, perpendicular endpoint, rounded corner, crossing, card intrusion, and outer margin. Reject any diagram that visually implies the Python runtime invokes native tools.

- [ ] **Step 7: Commit the audited diagram pair**

```bash
git add public/assets/bluetape-skills-native-runtime-boundary-01.svg public/assets/bluetape-skills-native-runtime-boundary-01.png
git commit -m "Separate native execution from durable workflow evidence" -m "Constraint: The Python runtime must never appear to invoke Codex native tools" -m "Confidence: high" -m "Scope-risk: narrow" -m "Tested: XML parse, CairoSVG render, connector, geometry, endpoint, mixed-corner, and full-size visual audits" -m "Not-tested: article rendering remains in the site gate"
```

## Task 7: Verify the Published Shape

**Files:**
- Verify: all files from Tasks 2 through 6

- [ ] **Step 1: Run source and whitespace checks**

Run:

```bash
git diff --check develop...HEAD
rg -n 'DRAFT_MARKER|FILL_ME|bright studio' src/content/docs/{ko/blog,blog}/bluetape-skills-workflow-runtime-recovery.mdx public/assets/bluetape-skills-native-runtime-boundary-01.svg
```

Expected: no whitespace errors, draft markers, or superseded bright-style text.

- [ ] **Step 2: Run repository tests and production build**

Run:

```bash
npm test
npm run build
```

Expected: manual/ecosystem tests PASS, `astro check` reports zero errors, production build exits 0.

- [ ] **Step 3: Inspect both generated routes**

Run:

```bash
rg -n 'Bluetape Skills Part 3|bluetape-skills-runtime-recovery-hero|bluetape-skills-native-runtime-boundary-01|weakest_required_component|v1.1.0' dist/ko/blog/bluetape-skills-workflow-runtime-recovery/index.html
rg -n 'Bluetape Skills Part 3|bluetape-skills-runtime-recovery-hero|bluetape-skills-native-runtime-boundary-01|weakest_required_component|v1.1.0' dist/blog/bluetape-skills-workflow-runtime-recovery/index.html
rg -n 'og:image|twitter:image' dist/{ko/blog,blog}/bluetape-skills-workflow-runtime-recovery/index.html
```

Expected: both pages contain the title, Hero, diagram, component rule, v1.1.0 source, and locale-correct OG/Twitter image metadata.

- [ ] **Step 4: Perform the final editorial and visual review**

Confirm:

```text
Korean KO-01..KO-06 = PASS
English/Korean facts and series order = MATCH
Hero original-size inspection = PASS
Diagram checklist and original-size inspection = PASS
P0 = 0
P1 = 0
```

- [ ] **Step 5: Commit any verification-only repairs**

If verification changes files, commit only those repairs:

```bash
git add src/content/docs public/assets
git commit -m "Close the bilingual and rendered-page gaps in Part 3" -m "Constraint: Keep v1.1.0 evidence and the approved dark visual system unchanged" -m "Confidence: high" -m "Scope-risk: narrow" -m "Tested: npm test, npm run build, generated locale routes, OG metadata, and final visual review" -m "Not-tested: live deployment requires a later delivery gate"
```

If no repair was needed, do not create an empty commit.
