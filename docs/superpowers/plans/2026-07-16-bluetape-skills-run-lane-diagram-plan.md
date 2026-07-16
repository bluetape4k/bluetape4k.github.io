# Bluetape Skills Run and Lane Diagram Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one dark two-panel diagram that explains Run ownership, Lane lifecycle and replacement, then embed it in both Part 3 locales.

**Architecture:** The left panel is a static ownership/topology view in which one Run contains bounded Lanes and completion converges through checks, evidence, and main verification. The right panel is a compact state progression with a recovery branch and a distinct replacement Lane. Both panels share the existing Part 3 dark visual family but keep their visual grammar separate.

**Tech Stack:** Hand-authored SVG, CairoSVG, Astro/Starlight MDX, bluetape-diagram audit scripts, npm/Astro build.

---

## File map

- Create `public/assets/bluetape-skills-run-lane-model-01.svg`: canonical editable diagram source.
- Create `public/assets/bluetape-skills-run-lane-model-01.png`: scale-2 rendered asset embedded by both locales.
- Modify `src/content/docs/ko/blog/bluetape-skills-workflow-runtime-recovery.mdx`: Korean introduction, figure, and source-backed caption.
- Modify `src/content/docs/blog/bluetape-skills-workflow-runtime-recovery.mdx`: English parity introduction, figure, and caption.
- Read only `public/assets/bluetape-skills-native-runtime-boundary-01.svg` and `.png`: approved visual-family references.

### Task 1: Author the two-panel SVG source

**Files:**
- Create: `public/assets/bluetape-skills-run-lane-model-01.svg`
- Reference: `public/assets/bluetape-skills-native-runtime-boundary-01.svg`
- Reference: `docs/superpowers/specs/2026-07-16-bluetape-skills-run-lane-diagram-design.md`

- [ ] **Step 1: Reconfirm the source-backed vocabulary**

```bash
git -C /Users/debop/work/bluetape4k/bluetape-skills show v1.1.0:skills/bluetape-workflow/references/workflow-manifest.json \
  | jq '{run_states, lane_states, completion, completed: .transition_policy.run.evidence_by_target.completed}'
git -C /Users/debop/work/bluetape4k/bluetape-skills show v1.1.0:skills/bluetape-workflow/references/topology-contract.md \
  | rg -n 'weakest_required_component|terminal lane state|required check|evidence|main verification'
git -C /Users/debop/work/bluetape4k/bluetape-skills show v1.1.0:skills/bluetape-workflow/references/liveness-contract.md \
  | rg -n 'distinct lane|parent lineage|lane-complete|Python never invokes'
```

Expected: separate Run/Lane states and evidence for weakest-component completion, distinct replacement identity, lineage, and the native-tool boundary.

- [ ] **Step 2: Inspect the approved dark-family reference**

```bash
sips -g pixelWidth -g pixelHeight public/assets/bluetape-skills-native-runtime-boundary-01.png
rg -n '#07111f|#10243a|#6ee7ff|#4f8cff|#f5b942|#4fd18b|Architects Daughter|Comic Mono' \
  public/assets/bluetape-skills-native-runtime-boundary-01.svg
```

Expected: `2400x1440` and nonzero palette/font matches. Open the PNG at full size and record that its title, cards, and markers remain readable.

- [ ] **Step 3: Create the SVG with these exact semantic groups**

Create a `1600x900` SVG whose top-level groups and visible labels are:

| Group ID | Visible content |
| --- | --- |
| `title` | `Run owns the outcome. Lanes own bounded work.` |
| `run-panel` | `ONE RUN, MULTIPLE LANES`, `Approved objective`, `Owner epoch`, `Required topology` |
| `lane-write-ko` | `write-ko`, `bounded assignment`, `owner + state` |
| `lane-write-en` | `write-en`, `bounded assignment`, `owner + state` |
| `lane-verify-site` | `verify-site`, `bounded assignment`, `owner + state` |
| `completion-gate` | `Required components`, `Checks + evidence`, `Main verification`, `weakest_required_component` |
| `lane-panel` | `ONE LANE, RECOVERY + REPLACEMENT` |
| `happy-path` | `pending`, `starting`, `running`, `completed` |
| `native-ack-note` | `Main session: native spawn + startup-ack` |
| `recovery-path` | `suspected_stall`, `recovering`, `probe ack`, `replaced` |
| `replacement-lane` | `replacement lane`, `new lane id`, `new agent id`, `pending` |
| `lineage` | `parent lineage`, `late result fenced` |
| `completion-strip` | `Lane complete != Run complete`, completion proof list, `RUN COMPLETED` |
| `legend` | cyan assignment, blue evidence, amber recovery, green verified |

Use the approved palette and fonts. Define explicit markers with `markerUnits="userSpaceOnUse"`, `14x14` primary heads, and `10x10` lineage heads. Use only straight or rounded orthogonal paths. Keep the three primary Lane cards equal and do not connect them to each other. Route every Lane into checks/evidence, then main verification. Route `recovering -> running` for probe success and `recovering -> replaced -> replacement lane: pending` for replacement. Keep lineage dashed amber with a solid head. Never connect Lane `completed` directly to `RUN COMPLETED`. Use no icons.

- [ ] **Step 4: Validate the SVG structure**

```bash
xmllint --noout public/assets/bluetape-skills-run-lane-model-01.svg
for id in title run-panel lane-write-ko lane-write-en lane-verify-site completion-gate lane-panel happy-path native-ack-note recovery-path replacement-lane lineage completion-strip legend; do
  rg -q "id=\"$id\"" public/assets/bluetape-skills-run-lane-model-01.svg || exit 1
done
rg -q 'Lane complete != Run complete' public/assets/bluetape-skills-run-lane-model-01.svg
rg -q 'weakest_required_component' public/assets/bluetape-skills-run-lane-model-01.svg
```

Expected: XML validation succeeds and every semantic group and completion label is present.

- [ ] **Step 5: Commit the SVG source**

```bash
git add public/assets/bluetape-skills-run-lane-model-01.svg
git commit -m "docs: clarify run ownership and lane recovery" \
  -m "Constraint: Preserve separate visual grammars for run topology and lane lifecycle.\nConfidence: high\nScope-risk: narrow\nDirective: Never imply that a terminal lane completes the run by itself.\nTested: xmllint and semantic group invariants.\nNot-tested: Rendered geometry and site integration are covered by later tasks."
```

### Task 2: Render and audit the diagram

**Files:**
- Modify: `public/assets/bluetape-skills-run-lane-model-01.svg`
- Create: `public/assets/bluetape-skills-run-lane-model-01.png`

- [ ] **Step 1: Render at scale 2 and verify dimensions**

```bash
cairosvg public/assets/bluetape-skills-run-lane-model-01.svg \
  -o public/assets/bluetape-skills-run-lane-model-01.png -s 2
sips -g pixelWidth -g pixelHeight public/assets/bluetape-skills-run-lane-model-01.png
```

Expected: `3200x1800`.

- [ ] **Step 2: Run the blocking common audits**

```bash
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py" public/assets/bluetape-skills-run-lane-model-01.svg
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py" --fail-diagonal public/assets/bluetape-skills-run-lane-model-01.svg
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py" public/assets/bluetape-skills-run-lane-model-01.svg
python3 "$HOME/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py" public/assets/bluetape-skills-run-lane-model-01.svg
```

Expected: zero blocking failures and meaningful counts. Weak or zero counts require Step 3 evidence.

- [ ] **Step 3: Run fallback semantic invariants**

```bash
test "$(rg -o 'id="(lane-write-ko|lane-write-en|lane-verify-site|replacement-lane)"' public/assets/bluetape-skills-run-lane-model-01.svg | wc -l | tr -d ' ')" -ge 4
test "$(rg -o '>pending<' public/assets/bluetape-skills-run-lane-model-01.svg | wc -l | tr -d ' ')" -ge 2
test "$(rg -o 'marker-end=' public/assets/bluetape-skills-run-lane-model-01.svg | wc -l | tr -d ' ')" -ge 8
rg -q '>suspected_stall<' public/assets/bluetape-skills-run-lane-model-01.svg
rg -q '>recovering<' public/assets/bluetape-skills-run-lane-model-01.svg
rg -q '>replaced<' public/assets/bluetape-skills-run-lane-model-01.svg
rg -q 'parent lineage' public/assets/bluetape-skills-run-lane-model-01.svg
rg -q 'RUN COMPLETED' public/assets/bluetape-skills-run-lane-model-01.svg
```

Expected: all entity, state, lineage, connector, and completion checks exit zero.

- [ ] **Step 4: Inspect the full-size PNG and repair until it passes**

Check original-size readability, clipping, contrast, panel separation, perpendicular endpoints, rounded bends, crossings, card intrusion, solid amber lineage head, legend parity, and balanced whitespace. Confirm Lane `completed` cannot bypass checks/evidence/main verification. After any repair, repeat Steps 1-4.

- [ ] **Step 5: Commit the approved SVG/PNG pair**

```bash
git diff --check -- public/assets/bluetape-skills-run-lane-model-01.svg public/assets/bluetape-skills-run-lane-model-01.png
git add public/assets/bluetape-skills-run-lane-model-01.svg public/assets/bluetape-skills-run-lane-model-01.png
git commit -m "docs: render the run and lane workflow model" \
  -m "Constraint: Keep recovery lineage and completion gates legible at blog width.\nConfidence: high\nScope-risk: narrow\nDirective: Re-render the PNG whenever the SVG source changes.\nTested: XML, CairoSVG, diagram audits, semantic invariants, and full-size visual review."
```

### Task 3: Embed the diagram in both locales

**Files:**
- Modify: `src/content/docs/ko/blog/bluetape-skills-workflow-runtime-recovery.mdx:77`
- Modify: `src/content/docs/blog/bluetape-skills-workflow-runtime-recovery.mdx:83`

- [ ] **Step 1: Insert the Korean figure before the startup command example**

```mdx
run은 승인된 전체 작업을 나타내고, lane은 그 안에서 한 agent나 main session이 맡은 제한된 작업 단위다.
아래 그림의 왼쪽은 하나의 run이 여러 lane으로 나뉘어 결과를 모으는 구조를, 오른쪽은 lane 하나가 정상 실행과
복구·교체를 거치는 흐름을 보여 준다.

<figure class="post-figure">
  <img src="/assets/bluetape-skills-run-lane-model-01.png" alt="하나의 run이 write-ko, write-en, verify-site lane으로 작업을 나누고 required check, component evidence, main verification을 모아 완료되며, lane이 정체되면 별도 ID와 lineage를 가진 replacement lane으로 교체되는 구조" loading="lazy" />
  <figcaption>Run은 전체 결과를 소유하고 lane은 제한된 작업을 소유한다. Lane은 병렬 또는 순차로 실행할 수 있지만, terminal state에 도달한 뒤에도 required check, component evidence, main verification이 모두 있어야 run을 완료할 수 있다. 교체할 때는 기존 lane을 재사용하지 않고 새 lane과 agent id, parent lineage를 기록하며, v1.1.0은 lane당 교체를 한 번으로 제한한다.</figcaption>
</figure>

기본 시작 흐름은 다음과 같다.
```

- [ ] **Step 2: Insert the English parity figure in the same position**

```mdx
A run represents the complete approved task. A lane is a bounded unit of that task assigned to one
agent or to the main session. The left side of the diagram shows one run dividing work across lanes
and collecting their proof; the right side follows one lane through normal execution, recovery, and replacement.

<figure class="post-figure">
  <img src="/assets/bluetape-skills-run-lane-model-01.png" alt="One run dividing work across write-ko, write-en, and verify-site lanes, then collecting required checks, component evidence, and main verification, while a stalled lane is replaced by a distinct lane with a new identity and recorded lineage" loading="lazy" />
  <figcaption>A run owns the complete outcome, while each lane owns bounded work. Lanes may run in parallel or in dependency order, but terminal lane states alone do not complete the run. Required checks, component evidence, and main verification must also be present. Replacement creates a new lane and agent identity with explicit parent lineage, and v1.1.0 permits at most one replacement per lane.</figcaption>
</figure>

The basic startup path is:
```

- [ ] **Step 3: Verify parity and commit**

```bash
test "$(rg -l 'bluetape-skills-run-lane-model-01.png' src/content/docs/{ko/blog,blog}/bluetape-skills-workflow-runtime-recovery.mdx | wc -l | tr -d ' ')" -eq 2
rg -n 'required check|component evidence|main verification|parent lineage' src/content/docs/{ko/blog,blog}/bluetape-skills-workflow-runtime-recovery.mdx
git diff --check
git add src/content/docs/ko/blog/bluetape-skills-workflow-runtime-recovery.mdx src/content/docs/blog/bluetape-skills-workflow-runtime-recovery.mdx
git commit -m "docs: explain run and lane semantics in both locales" \
  -m "Constraint: Keep bilingual claims and visual placement aligned while preserving natural prose.\nConfidence: high\nScope-risk: narrow\nDirective: Keep both locales on the same canonical diagram asset.\nTested: Locale parity search and git diff --check.\nNot-tested: Astro build and rendered route inspection are covered by the final task."
```

Expected: both locale files use the same PNG once and preserve the same completion and lineage claims.

### Task 4: Build and verify both routes

**Files:**
- Verify: `dist/ko/blog/bluetape-skills-workflow-runtime-recovery/index.html`
- Verify: `dist/blog/bluetape-skills-workflow-runtime-recovery/index.html`

- [ ] **Step 1: Run the production build**

```bash
npm run build
```

Expected: `astro check` reports zero errors and Astro completes the build.

- [ ] **Step 2: Verify generated route asset references**

```bash
for page in dist/ko/blog/bluetape-skills-workflow-runtime-recovery/index.html dist/blog/bluetape-skills-workflow-runtime-recovery/index.html; do
  test -s "$page"
  rg -q '/assets/bluetape-skills-run-lane-model-01.png' "$page"
done
test -s dist/assets/bluetape-skills-run-lane-model-01.png || test -s dist/bluetape-skills-run-lane-model-01.png
```

Expected: both pages reference the new PNG and the built asset exists.

- [ ] **Step 3: Run final repository and visual verification**

```bash
git diff --check
repo-status
xmllint --noout public/assets/bluetape-skills-run-lane-model-01.svg
sips -g pixelWidth -g pixelHeight public/assets/bluetape-skills-run-lane-model-01.png
```

Open both diagram PNGs side by side at original size. Confirm family parity, readable text, distinct panels, correct lineage, no direct Lane-complete shortcut, and balanced margins. Review both MDX diffs for natural prose and identical facts. Expected: `P0=0`, `P1=0`.

- [ ] **Step 4: Commit only verification-driven repairs**

If verification changed a file, stage the SVG, PNG, and both MDX files and commit:

```bash
git add public/assets/bluetape-skills-run-lane-model-01.svg public/assets/bluetape-skills-run-lane-model-01.png \
  src/content/docs/ko/blog/bluetape-skills-workflow-runtime-recovery.mdx \
  src/content/docs/blog/bluetape-skills-workflow-runtime-recovery.mdx
git commit -m "docs: finish run and lane visual verification" \
  -m "Constraint: Resolve rendered visual or route defects without changing the approved model.\nConfidence: high\nScope-risk: narrow\nDirective: Preserve SVG and PNG parity.\nTested: npm run build, route checks, diagram audits, and full-size visual review."
```

If no repair was required, do not create an empty commit.
