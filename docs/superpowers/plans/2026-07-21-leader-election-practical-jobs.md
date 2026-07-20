# Leader Election Practical Jobs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a bilingual, example-driven article that explains how tenant-scoped aggregation and cluster-wide migration gates need different leader-election boundaries, with source-backed caveats and dark visual assets.

**Architecture:** Treat `bluetape4k-leader` example source and tests as the authority, draft Korean first, then localize the same claims to English. Keep the article independent from the existing five-part leader series, use one shared English-labelled architecture diagram and one shared failover sequence diagram, and stop delivery at a ready PR with exact-head CI evidence.

**Tech Stack:** Astro 6, Starlight, MDX, Kotlin source excerpts and pseudocode, SVG, CairoSVG, `bluetape-writer`, `bluetape-diagram`, image generation, GitHub CLI

---

## File Structure

### Design and plan

- Existing: `docs/superpowers/specs/2026-07-21-leader-election-practical-jobs-design.md`
- Create: `docs/superpowers/plans/2026-07-21-leader-election-practical-jobs.md`

### Articles

- Create: `src/content/docs/ko/blog/leader-election-tenant-jobs-migration-gates.mdx`
- Create: `src/content/docs/blog/leader-election-tenant-jobs-migration-gates.mdx`

The two MDX files own frontmatter, hero and diagram embeds, the example-driven argument, source links, and related-reading links. They share the same slug, date, assets, section order, source targets, provider table rows, and caveats.

### Visual assets

- Create: `public/assets/leader-election-practical-jobs-hero.png`
- Create: `public/assets/leader-election-coordination-scope-01.svg`
- Create: `public/assets/leader-election-coordination-scope-01.png`
- Create: `public/assets/leader-election-lease-failover-sequence-01.svg`
- Create: `public/assets/leader-election-lease-failover-sequence-01.png`

The hero is a polished 3D miniature raster scene. Each diagram keeps editable SVG source and a CairoSVG-rendered PNG; the MDX embeds the PNG.

## Source and Style Anchors

### Primary source

- `/Users/debop/work/bluetape4k/bluetape4k-leader/examples/tenant-aggregator`
- `/Users/debop/work/bluetape4k/bluetape4k-leader/examples/migration-gate`
- `/Users/debop/work/bluetape4k/bluetape4k-leader/examples/cache-warmer`
- `/Users/debop/work/bluetape4k/bluetape4k-leader/examples/webhook-poller`
- `/Users/debop/work/bluetape4k/bluetape4k-leader/examples/k8s-lease`
- `/Users/debop/work/bluetape4k/bluetape4k-leader/examples/prometheus-dashboard`

### Article shape

- `src/content/docs/ko/blog/bluetape4k-leader-part5-backends-operations-benchmarks.mdx`
- `src/content/docs/ko/blog/transactional-outbox-idempotency-spring-ktor.mdx`
- `src/content/docs/ko/blog/coroutine-observability-micrometer-readiness.mdx`
- Matching English routes for bilingual structure

### Visual style

- `public/assets/coroutine-observability-trace-flow-01.png` for dark architecture density and palette
- `/Users/debop/work/bluetape4k/bluetape4k-wiki/docs/diagrams/best-practices/assets/bluetape4k-leader-sequence-02.png` as the catalog reference
- `public/assets/transactional-outbox-idempotency-sequence-01.png` as the approved blog reference
- `public/assets/bluetape4k-leader-part5-hero.png` and nearby workshop heroes for the raster scene family

## Task 1: Lock the factual contract

**Files:**
- Read: `/Users/debop/work/bluetape4k/bluetape4k-leader/examples/tenant-aggregator/src/main/**/*.kt`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-leader/examples/tenant-aggregator/src/test/**/*.kt`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-leader/examples/migration-gate/src/main/**/*.kt`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-leader/examples/migration-gate/src/test/**/*.kt`
- Read: the four supporting example README/source trees listed above

- [ ] **Step 1: Record exact source paths and identifiers**

Run:

```bash
rg -n "class TenantAggregator|data class TenantAggregatorOptions|lockNamePrefix|runIfLeader|aggregateFunction" \
  /Users/debop/work/bluetape4k/bluetape4k-leader/examples/tenant-aggregator/src
rg -n "class MigrationGate|data class MigrationGateOptions|isApplied|markApplied|runIfLeader|migration" \
  /Users/debop/work/bluetape4k/bluetape4k-leader/examples/migration-gate/src
```

Expected: the current class, option, lock-name, persistent-marker, and action boundaries are visible at real paths.

- [ ] **Step 2: Record the test-proved contracts**

Run:

```bash
rg -n "3 인스턴스|정확히 1|aggregate 함수 예외|차순위|동시|마커|Failed|isApplied" \
  /Users/debop/work/bluetape4k/bluetape4k-leader/examples/tenant-aggregator/src/test \
  /Users/debop/work/bluetape4k/bluetape4k-leader/examples/migration-gate/src/test
```

Expected: evidence exists for per-tenant mutual exclusion, cross-tenant progress, retry after action failure, failover, migration-marker checks, and failure mapping. Unsupported wording is removed from the article outline rather than inferred.

- [ ] **Step 3: Lock provider and observability statements**

Run:

```bash
rg -n "Redis|Kubernetes|Lease|Exposed|R2DBC|etcd|Consul|ZooKeeper|DynamoDB|metric|Meter|Counter|Gauge|Prometheus" \
  /Users/debop/work/bluetape4k/bluetape4k-leader/examples/{cache-warmer,webhook-poller,k8s-lease,prometheus-dashboard} \
  src/content/docs/ko/blog/bluetape4k-leader-part5-backends-operations-benchmarks.mdx
```

Expected: every provider or metric statement planned for the article has a current example or existing source-backed article anchor. The table remains a decision guide, not a performance ranking.

- [ ] **Step 4: Confirm no source drift requires a separate issue**

Compare each example README claim with its main source and tests. Expected: either all claims used in the article agree, or any mismatch is excluded and registered as a separate GitHub issue before prose claims are drafted.

## Task 2: Generate and inspect the hero

**Files:**
- Create: `public/assets/leader-election-practical-jobs-hero.png`

- [ ] **Step 1: Open comparable heroes at equal size**

Inspect `public/assets/bluetape4k-leader-part5-hero.png`, `public/assets/transactional-outbox-idempotency-hero.png`, and `public/assets/coroutine-observability-micrometer-readiness-hero.png` in a contact sheet or full-size viewer.

Expected: record the common isometric miniature workbench, robot-worker clarity, navy canvas, teal/purple practical lighting, subject scale, and first-viewport composition.

- [ ] **Step 2: Generate the hero with the image-generation tool**

Use this prompt contract:

```text
Polished 3D miniature engineering workbench scene for a technical blog hero, 16:9.
Three small JVM service-node consoles compete through one coordination console.
On the left, separate tenant A and tenant B job cards can proceed in parallel.
On the right, one guarded database migration gate permits a single path.
Small unmistakably robotic engineers operate the consoles.
Dark navy studio environment, restrained teal, blue, purple, and amber accents,
isometric camera, crisp readable objects, no text, no logo, no watermark,
not a flat diagram, consistent with premium bluetape4k miniature workshop heroes.
```

Expected: a single polished raster scene at the canonical asset path, not a diagram or stock illustration.

- [ ] **Step 3: Inspect and accept the raster asset**

Open the generated PNG at full size and compare it with the three references. Expected: robots are visually robotic; tenant-parallel and migration-gate subjects remain legible at article-card size; no stray text/logo or cropped main subject.

- [ ] **Step 4: Commit the approved hero**

```bash
git add public/assets/leader-election-practical-jobs-hero.png
git commit -m "Give the leader-election example a concrete visual scenario" \
  -m "Constraint: Preserve the established dark miniature workshop hero language." \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: Full-size inspection and comparison against three nearby heroes" \
  -m "Not-tested: Article embedding is verified after the MDX routes exist."
```

## Task 3: Build the coordination-scope architecture diagram

**Files:**
- Create: `public/assets/leader-election-coordination-scope-01.svg`
- Create: `public/assets/leader-election-coordination-scope-01.png`

- [ ] **Step 1: Define the static source model**

Use three horizontal responsibility bands:

```text
Service Nodes: Node A | Node B | Node C
Coordination Provider: tenant:A | tenant:B | migration:global
Guarded State: Tenant A Aggregation | Tenant B Aggregation | Migration + Applied Marker
```

Connect nodes to coordination keys, then keys to guarded jobs. Keep the migration marker in the guarded-state band because it records durable completion rather than lock ownership.

- [ ] **Step 2: Create one dark SVG**

Use a deep navy canvas, dark elevated cards, `Architects Daughter` headings, `Comic Mono` technical labels, teal for tenant A, purple for tenant B, amber for global migration, fixed user-space arrowheads, and English labels shared by both locales. Mark any displayed pseudocode with `data-code-snippet="kotlin"`; ordinary lock names remain monospace labels.

- [ ] **Step 3: Parse, normalize, render, and audit**

```bash
leader_scope_asset=public/assets/leader-election-coordination-scope-01
xmllint --noout "${leader_scope_asset}.svg"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py --check "${leader_scope_asset}.svg"
cairosvg "${leader_scope_asset}.svg" -o "${leader_scope_asset}.png" -s 2
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py "${leader_scope_asset}.svg"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal "${leader_scope_asset}.svg"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py "${leader_scope_asset}.svg"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py "${leader_scope_asset}.svg"
git diff --check -- "${leader_scope_asset}.svg" "${leader_scope_asset}.png"
```

Expected: XML and all audits exit 0; `text_hazards=0`; `code_without_highlight=0`; connectors/cards/paths are nonzero; shared/crossing/label/card intrusion failures are 0; PNG dimensions are twice the SVG viewBox.

- [ ] **Step 4: Inspect the full-size PNG**

Open `public/assets/leader-election-coordination-scope-01.png`. Expected: the static ownership view is understandable without reading the article; connectors attach perpendicularly; no line touches a card corner, card border, label, or lane title; the tenant keys visibly allow separate jobs while the migration key guards one global job.

- [ ] **Step 5: Commit the architecture asset**

```bash
git add public/assets/leader-election-coordination-scope-01.svg public/assets/leader-election-coordination-scope-01.png
git commit -m "Show why coordination scope follows the conflicting work" \
  -m "Constraint: Keep tenant-scoped and global keys distinct without implying a provider ranking." \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: XML, CairoSVG, text, connector, geometry, endpoint, mixed-corner, and full-size PNG checks"
```

## Task 4: Build the lease-failover sequence diagram

**Files:**
- Create: `public/assets/leader-election-lease-failover-sequence-01.svg`
- Create: `public/assets/leader-election-lease-failover-sequence-01.png`

- [ ] **Step 1: Open two authoritative sequence references**

Inspect `/Users/debop/work/bluetape4k/bluetape4k-wiki/docs/diagrams/best-practices/assets/bluetape4k-leader-sequence-02.png` and `public/assets/transactional-outbox-idempotency-sequence-01.png`. Record both paths and use the blog sequence as the palette authority while retaining the leader-specific participant language from the catalog reference.

- [ ] **Step 2: Fix the chronological contract**

Use these participants and visible numbered messages:

```text
Node A | Coordination Provider | Guarded Job | Node B
1 acquire(key, token A)
2 acquired until t+lease
3 run action
4 renew(token A)
5 Node A fails
6 Node B acquire -> busy
7 lease expires
8 Node B acquire(key, token B)
9 run or resume idempotent action
10 persist result / completion marker
```

Put messages 5-9 inside a transparent `alt Node A failure / successor takeover` frame. Add a footer note outside the frame: `Lease expiry permits takeover; it does not prove exactly-once side effects.`

- [ ] **Step 3: Create one sequence SVG**

Include participant headers, lifelines, activation bars, continuous message lanes, visible number pills, explicit per-color `16x16` sequence arrowheads, a transparent branch frame, and sufficient row height for labels. Use shared English labels.

- [ ] **Step 4: Parse, render, and run common plus sequence audits**

```bash
leader_sequence_asset=public/assets/leader-election-lease-failover-sequence-01
xmllint --noout "${leader_sequence_asset}.svg"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py --check "${leader_sequence_asset}.svg"
cairosvg "${leader_sequence_asset}.svg" -o "${leader_sequence_asset}.png" -s 2
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py "${leader_sequence_asset}.svg"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal "${leader_sequence_asset}.svg"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py "${leader_sequence_asset}.svg"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py "${leader_sequence_asset}.svg"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-sequence-style-audit.py "${leader_sequence_asset}.svg"
git diff --check -- "${leader_sequence_asset}.svg" "${leader_sequence_asset}.png"
```

Expected: all commands exit 0; 10 numbered labels are visible; participants, lifelines, activations, branch frame, and per-color markers are detected; frame is transparent; labels do not cover message lines.

- [ ] **Step 5: Inspect and commit the full-size PNG**

Open the final PNG after the last coordinate change. Confirm label order, arrow direction/color, frame padding, footer separation, and failure-to-takeover chronology.

```bash
git add public/assets/leader-election-lease-failover-sequence-01.svg public/assets/leader-election-lease-failover-sequence-01.png
git commit -m "Make lease failover boundaries visible" \
  -m "Constraint: Show takeover without promising exactly-once side effects." \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: XML, CairoSVG, common audits, sequence-style audit, and full-size PNG inspection"
```

## Task 5: Write and review the Korean article

**Files:**
- Create: `src/content/docs/ko/blog/leader-election-tenant-jobs-migration-gates.mdx`

- [ ] **Step 1: Create frontmatter and local article shell**

Use this shape:

```mdx
---
title: "여러 서버가 같은 작업을 실행하지 않게 만드는 방법"
description: "tenant별 집계와 cluster-wide migration gate 예제로 leader election의 범위, lease failover, 완료 마커, provider 선택 기준을 설명합니다."
sidebar:
  order: -202607210900
blog:
  date: 2026-07-21T09:00:00+09:00
  image: /assets/leader-election-practical-jobs-hero.png
  imageAlt: 여러 JVM service node가 tenant job과 하나의 migration gate를 coordination console로 조정하는 3D miniature workbench
  cardDescription: "같은 tenant 작업은 한 번만 실행하고 서로 다른 tenant는 병렬 처리하려면 coordination key부터 달라야 합니다."
---
```

Follow with `bt4k-blog-hero`, `bt4k-post-meta`, problem-first introduction, and no series part number.

- [ ] **Step 2: Write the problem and coordination-scope sections**

Use this section order:

```text
도입: 배포 직후 세 서버가 같은 집계와 migration을 시작한다
## 먼저 충돌 범위를 coordination key로 바꾼다
## tenant별 집계는 같은 tenant만 직렬화한다
## migration은 전역 lock과 완료 마커가 모두 필요하다
```

Embed `/assets/leader-election-coordination-scope-01.png` before the tenant/global comparison. Explain the test contract with arrange/act/assert pseudocode using `shouldBeEqualTo` or the exact assertion style verified from the example tests.

- [ ] **Step 3: Write failover, supporting examples, provider, and operations sections**

Continue with:

```text
## lease가 끝나면 다음 후보가 이어받을 수 있다
## cache warm-up과 webhook polling은 또 다른 범위를 가진다
## provider는 작업의 실패 모델에서 고른다
## leader가 자주 바뀌는지도 운영 신호다
## Sources
## Related reading
```

Embed `/assets/leader-election-lease-failover-sequence-01.png`. Include the five-column scenario/provider table from the design. State explicitly that leader election prevents overlapping ownership but does not by itself prove exactly-once effects, instant failover, or safe long-running work.

- [ ] **Step 4: Verify every link and identifier**

Run targeted `rg` against the finished MDX and the source repo. Expected: every linked GitHub path exists on `develop`; class/function/option/metric names match source; no unsupported benchmark or “latest” claim exists.

- [ ] **Step 5: Apply the Korean naturalness checklist**

Review KO-01 through KO-06 in order. Preserve all source links, dates, identifiers, provider names, lock keys, test contracts, and caveats. Remove translationese, generic claims, invented metaphors, mechanical triplets, and vague conclusions.

- [ ] **Step 6: Build and verify the Korean route**

```bash
git diff --check
npm run build
test -f dist/ko/blog/leader-election-tenant-jobs-migration-gates/index.html
rg -n "leader-election-(practical-jobs-hero|coordination-scope-01|lease-failover-sequence-01)" \
  dist/ko/blog/leader-election-tenant-jobs-migration-gates/index.html
```

Expected: build succeeds, Korean route exists, and all three image assets are embedded.

- [ ] **Step 7: Commit the reviewed Korean article**

```bash
git add src/content/docs/ko/blog/leader-election-tenant-jobs-migration-gates.mdx
git commit -m "Explain how leader scope follows the work that conflicts" \
  -m "Constraint: Ground the article in tenant-aggregator and migration-gate source rather than repeating the leader overview series." \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: Korean naturalness review, git diff check, Astro build, route and asset assertions"
```

## Task 6: Localize and verify the English article

**Files:**
- Create: `src/content/docs/blog/leader-election-tenant-jobs-migration-gates.mdx`

- [ ] **Step 1: Localize the frontmatter and prose naturally**

Use the English title `How to Keep Multiple Servers from Running the Same Job`. Preserve the Korean route's date, slug, source links, assets, section order, pseudocode behavior, table rows, numbers, and caveats. Do not translate Korean sentence rhythm or idioms literally.

- [ ] **Step 2: Compare locale parity**

Create a temporary comparison covering title direction, date, asset URLs, H2 count/order, source URL set, provider table rows, code block count, and exactly-once caveat. Expected: all meaning-bearing fields match; only natural-language wording differs.

- [ ] **Step 3: Build and verify both routes**

```bash
git diff --check
npm run build
test -f dist/blog/leader-election-tenant-jobs-migration-gates/index.html
test -f dist/ko/blog/leader-election-tenant-jobs-migration-gates/index.html
rg -n "leader-election-(practical-jobs-hero|coordination-scope-01|lease-failover-sequence-01)" \
  dist/blog/leader-election-tenant-jobs-migration-gates/index.html \
  dist/ko/blog/leader-election-tenant-jobs-migration-gates/index.html
```

Expected: build succeeds and both rendered routes contain every shared asset.

- [ ] **Step 4: Commit bilingual parity**

```bash
git add src/content/docs/blog/leader-election-tenant-jobs-migration-gates.mdx
git commit -m "Give the leader-election example bilingual parity" \
  -m "Constraint: Preserve Korean-approved claims while localizing English naturally." \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: Locale parity comparison, git diff check, Astro build, both route and asset assertions"
```

## Task 7: Run independent review and final pre-PR verification

**Files:**
- Review: all files changed from `origin/develop...HEAD`

- [ ] **Step 1: Run an independent Korean prose review**

Use a read-only writer/reviewer lane. Require findings first, ranked P0/P1/P2/P3 with exact file and line evidence. The reviewer must verify natural Korean, source-backed claims, title clarity, and that `tenant`, `leader`, `lease`, `lock name`, and `migration` remain consistent.

Expected: P0=0 and P1=0 after corrections and rereview.

- [ ] **Step 2: Run an independent diagram review**

Use a read-only visual/diagram reviewer on both full-size PNGs and their SVG sources. Require evidence for labels, endpoints, marker color/size, frames, spacing, contrast, and article-scale readability.

Expected: P0=0 and P1=0 after one-asset repair loops and renewed audits.

- [ ] **Step 3: Run final scoped checks**

```bash
git diff --check origin/develop...HEAD
npm run build
test -f dist/blog/leader-election-tenant-jobs-migration-gates/index.html
test -f dist/ko/blog/leader-election-tenant-jobs-migration-gates/index.html
git status --short
```

Expected: no diff errors, successful build, both routes exist, and the worktree contains only intentional task changes.

- [ ] **Step 4: Evaluate the lesson gate**

Review the task, final diff, user corrections, failures, and recovery steps. Reuse `bluetape-writer` Korean naturalness and `bluetape-diagram` one-asset/full-size-PNG rules when they already cover all learning. Record N/A only if there is no novel failure, recovery, design, or operational guidance; otherwise create the narrowest durable lesson before PR publication.

- [ ] **Step 5: Commit any final converged correction**

If review changes were needed, commit them with a Lore message whose `Tested:` trailer names the rerun checks. If no changes were needed, record the exact current head as CG-10 evidence without an empty commit.

## Task 8: Create and progress the Issue #192 PR

**Files:**
- Create temporary PR body outside the repository
- No repository file changes unless CI or review requires repair

- [ ] **Step 1: Verify delivery authority and metadata**

Confirm repository `bluetape4k/bluetape4k.github.io`, base `develop`, head `codex/issue-192-leader-election-examples`, Issue #192 labels/assignee/milestone, clean scoped diff, and completed pre-PR checks. The approved plan authorizes PR creation, not merge or deployment.

- [ ] **Step 2: Push and verify the exact remote head**

```bash
git push -u origin codex/issue-192-leader-election-examples
git rev-parse HEAD
git rev-parse origin/codex/issue-192-leader-election-examples
```

Expected: local and remote SHAs are identical.

- [ ] **Step 3: Create the ready PR**

Use an English title and body, include `Closes #192`, apply assignee `debop`, mirror Issue #192 labels and milestone state, and make `## DoD Status` the final H2 section. Record exact validation, bilingual parity, diagram audit, full-size inspection, P0/P1, and head SHA evidence.

- [ ] **Step 4: Wait for exact-head CI and reread live review state**

```bash
gh pr checks --repo bluetape4k/bluetape4k.github.io --watch --interval 10
gh pr view --repo bluetape4k/bluetape4k.github.io \
  --json headRefOid,state,isDraft,mergeable,reviewDecision,statusCheckRollup,reviews
```

Also query unresolved review threads after CI is green. Expected: Build succeeds on the exact head; no unresolved blocking review; deploy remains skipped for the PR as expected.

- [ ] **Step 5: Report merge-ready without merging**

Update the PR DoD table with exact-head CI and review evidence, then report PR URL, SHA, Build status, P0/P1, locale routes, and asset count. Leave CG-16, CG-17, and CG-18 pending for fresh merge approval, merge, and cleanup.
