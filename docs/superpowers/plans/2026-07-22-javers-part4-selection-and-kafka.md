# JaVers Part 4 선택 기준과 Kafka 경계 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Part 4 독자가 JaVers의 audit semantics와 Kafka projection의 역할을 쓰기 비용과 함께 판단하도록 Korean·English 원고를 보강한다.

**Architecture:** PostgreSQL benchmark와 DB write-path 설명 뒤, audit store·event stream·read projection을 분리하는 결정 섹션을 삽입한다. 현재 Kafka repository의 write-only 및 broker acknowledgement 대기 계약만 현재 기능으로 설명하고, outbox·재시도는 후속 설계로 한정한다.

**Tech Stack:** Astro/Starlight MDX, bilingual technical writing, GitHub source links, npm build/test

---

## File Structure

- Modify: `src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx` — Korean decision section, resources, and Korean technical prose
- Modify: `src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx` — English-equivalent decision section, resources, and natural English localization
- Modify: `docs/superpowers/plans/2026-07-22-javers-part4-selection-and-kafka.md` — completed plan evidence

### Task 1: Verify anchors and current Kafka contract

**Files:**
- Read: `docs/superpowers/specs/2026-07-22-javers-part4-selection-and-kafka-design.md`
- Read: `src/content/docs/ko/blog/bluetape4k-javers-part2-persistence-options.mdx`
- Read: `src/content/docs/ko/blog/bluetape4k-javers-part3-ddd-workshop-example.mdx`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-javers/javers-persistence-kafka/src/main/kotlin/io/bluetape4k/javers/persistence/kafka/repository/KafkaCdoSnapshotRepository.kt`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-javers/javers-persistence-kafka/src/main/kotlin/io/bluetape4k/javers/persistence/kafka/projection/KafkaCdoSnapshotProjector.kt`

- [x] **Step 1: Confirm the edit anchor and series boundary**

Run:

```bash
rg -n -C 3 'DB에 저장할 때 JaVers|Why the JaVers|인덱스|Do Not Add an Index' \
  src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx \
  src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx
```

Expected: both articles place the new section between the DB write-path explanation and the index discussion.

- [x] **Step 2: Confirm the current Kafka semantics from source**

Run:

```bash
rg -n -C 4 'write-only|publish blocks|publishTimeout|RuntimeException|saveSnapshot|loadSnapshots' \
  /Users/debop/work/bluetape4k/bluetape4k-javers/javers-persistence-kafka/src/main/kotlin/io/bluetape4k/javers/persistence/kafka/repository/KafkaCdoSnapshotRepository.kt
```

Expected: the repository is write-only, waits for broker acknowledgement up to the configured timeout, and propagates publish failure.

- [x] **Step 3: Record the source-backed terminology used by both locales**

Use these exact distinctions in the drafts:

```text
audit store: queryable history and object diff
event stream: downstream delivery and replay input
projection: a consumer-built read model or queryable target repository
current Kafka publish: acknowledgement-waiting command-path work, not fire-and-forget
future outbox/retry: a separate delivery-guarantee design, not a current feature
```

- [x] **Step 4: Commit source-boundary notes if they changed**

No commit is expected when this step only rereads existing source. Keep the task evidence in this plan instead.

### Task 2: Add the Korean decision section

**Files:**
- Modify: `src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx` after `## DB에 저장할 때 JaVers 경로가 더 무거워질 수 있는 이유` and before `## 실제 query를 재현하기 전에는 인덱스를 추가하지 않는다`

- [x] **Step 1: Insert the Korean section with a non-promotional selection rule**

Add `## 성능만으로 감사 방식을 고르지 않는 이유` after the write-path conclusion. Explain that JaVers is selected when object-level diff, commit metadata, and an explicit command-side audit boundary are requirements; it is not chosen merely because it creates a history table.

- [x] **Step 2: Add the three-path decision table**

Insert this table, retaining these distinctions while polishing Korean around it:

```markdown
| 경로 | command 완료 시 보장 | Kafka와 조회의 역할 | 잘 맞는 경우 |
|---|---|---|---|
| 원본 상태 + JaVers audit | 현재 상태와 query 가능한 audit를 command 경계에서 남긴다 | Kafka는 선택적인 downstream event다 | 즉시 감사 조회와 객체 diff가 모두 필요하다 |
| 원본 상태 + JaVers audit + Kafka projection | audit를 보존한 뒤 consumer가 read model을 갱신한다 | Kafka는 화면·검색·외부 소비를 분리한다 | 빠른 조회 모델이나 다른 시스템 전달이 필요하다 |
| Kafka snapshot stream + projection 저장소 | Kafka publish acknowledgement까지 성공해야 한다 | Kafka repository는 write-only이고, 조회는 projector의 대상 저장소가 맡는다 | replay 가능한 이벤트 흐름을 별도로 운영할 수 있다 |
```

- [x] **Step 3: Correct the asynchronous-delivery misconception**

Add a short paragraph that says the present `KafkaCdoSnapshotRepository` waits for broker acknowledgement (default maximum 30 seconds) and propagates failures. State that the consumer/projection is asynchronous, but the current publish in the command path is not fire-and-forget. Mention outbox, retry queue, and fail-fast/best-effort policy only as follow-up design choices that must settle loss, duplicate, and replay behavior.

- [x] **Step 4: Add reader-facing resources**

Append Korean labels and links for `KafkaCdoSnapshotRepository.kt` and `KafkaCdoSnapshotProjector.kt` in `## 자료`. Keep existing benchmark/resource links unchanged.

- [x] **Step 5: Review Korean naturalness and source names**

Run:

```bash
rg -n -C 3 '성능만으로|Kafka|acknowledgement|outbox|KafkaCdoSnapshot' \
  src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx
```

Expected: Korean prose consistently distinguishes audit history, Kafka stream, and projection; code identifiers remain exact.

- [x] **Step 6: Commit the Korean draft**

```bash
git add src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx
git commit -m "Explain audit choices beyond JaVers write cost"
```

Expected: one narrow Korean-source commit with Lore trailers.

### Task 3: Localize the English Part 4 with factual parity

**Files:**
- Modify: `src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx` after `## Why the JaVers Path Can Cost More When It Writes to the Database` and before `## Do Not Add an Index Before Reproducing the Query`

- [x] **Step 1: Add the English counterpart**

Use the heading `## Do Not Choose an Audit Strategy from Performance Alone`. Localize the Korean reasoning, rather than translating its sentences literally. Preserve the same three JaVers selection reasons, the three-row comparison, acknowledgement-waiting clarification, and future-only outbox/retry boundary.

- [x] **Step 2: Add English resource links**

Append `Kafka snapshot repository` and `Kafka snapshot projector` source links in `## Resources`, targeting the same `develop` files as the Korean article.

- [x] **Step 3: Compare locale parity**

Run:

```bash
rg -n '성능만으로|Kafka snapshot|Do Not Choose an Audit Strategy|KafkaCdoSnapshot' \
  src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx \
  src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx
```

Expected: both locales expose the decision section and both Kafka source links without changing benchmark values.

- [x] **Step 4: Commit the English localization**

```bash
git add src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx
git commit -m "Keep the JaVers selection guidance bilingual"
```

Expected: one narrow English-localization commit with Lore trailers.

### Task 4: Validate rendered documentation and update PR #252

**Files:**
- Modify: `docs/superpowers/plans/2026-07-22-javers-part4-selection-and-kafka.md`

- [x] **Step 1: Run static and site validation**

Run:

```bash
git diff --check
npm run build
npm test
```

Expected: no whitespace errors, Astro check has zero errors, and all test suites pass.

- [x] **Step 2: Verify both article routes**

Run while the local Astro server is running:

```bash
curl -fsSI http://127.0.0.1:4324/ko/blog/bluetape4k-javers-part4-audit-cost/
curl -fsSI http://127.0.0.1:4324/blog/bluetape4k-javers-part4-audit-cost/
```

Expected: both routes return HTTP 200.

- [x] **Step 3: Record completed plan evidence**

Evidence recorded on 2026-07-22:

```text
git diff --check: PASS
npm run build: Astro check 0 errors, 0 warnings, 0 hints; static build PASS
npm test: 141 passed, 0 failed
source links: GitHub API 200 for KafkaCdoSnapshotRepository.kt and KafkaCdoSnapshotProjector.kt
local preview: http://127.0.0.1:4325/ko/blog/bluetape4k-javers-part4-audit-cost/ -> 200
local preview: http://127.0.0.1:4325/blog/bluetape4k-javers-part4-audit-cost/ -> 200
```

Change every completed checkbox in this plan to `[x]`, recording the exact build/test/route results directly below this step. Do not mark validation complete until fresh commands have passed.

- [x] **Step 4: Commit the verification record**

```bash
git add docs/superpowers/plans/2026-07-22-javers-part4-selection-and-kafka.md
git commit -m "Record JaVers selection guidance verification"
```

Expected: a Lore-trailer commit records the completed plan and exact validation evidence.

- [x] **Step 5: Push and verify PR #252 metadata**

Run:

```bash
git push origin docs/issue-193-javers-audit-cost
gh pr view 252 --json number,headRefOid,baseRefName,body,labels,assignees,mergeStateStatus
```

Expected: PR #252 points to the exact pushed head, retains its issue-derived labels and `debop` assignee, and its final Markdown `##` heading remains `## DoD Status`.

- [x] **Step 6: Preserve the delivery boundary**

Do not merge PR #252 or deploy the site. Report the exact PR head and CI state only after the user explicitly requests that next side effect.

PR evidence at `3690cbe0ffcace3b8a6a76b2530308a9e3b522a1`: base `develop`, assignee `debop`, labels `documentation` and `enhancement`, and a body whose final Markdown heading is `## DoD Status`. CI restarted for that head; merge and deployment were not requested.

### Task 5: Curate reader resources and turn the closing into a decision procedure

**Files:**
- Modify: `src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx` in `## 자료` and `## 마무리`
- Modify: `src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx` in `## Resources` and `## Closing`
- Modify: `docs/superpowers/plans/2026-07-22-javers-part4-selection-and-kafka.md` with fresh validation evidence

- [x] **Step 1: Remove raw benchmark artifacts from both reader-resource lists**

Delete exactly these two links in both locales:

```text
2026-06-08-javers-exposed-ddd-envers-comparison.json
2026-06-08-javers-exposed-commit-metadata-indexes.json
```

Keep the benchmark module, benchmark source, Exposed repository, DDD boundary, Kafka repository, and Kafka projector links.

- [x] **Step 2: Replace the Korean closing prose with a four-step table**

Use `## 마무리` followed by this table and one short paragraph:

```markdown
| 순서 | 결정 | 확인할 근거 |
|---|---|---|
| 1 | 설명 책임이 있는 aggregate와 상태 전이를 고른다 | 장애·분쟁·규제 상황에서 누가 어떤 결정을 설명해야 하는가 |
| 2 | 감사 조회와 화면 조회를 나눈다 | object diff가 필요한지, 별도 read model이 필요한지 |
| 3 | 전달 경계를 정한다 | 동기 audit, Kafka projection, acknowledgement 대기, outbox/retry 설계 여부 |
| 4 | 운영 조건으로 다시 측정한다 | p95·p99, 저장량, 보존 기간, query predicate, index 크기 |
```

The paragraph must state that a benchmark validates these choices against the real workload and that Kafka does not automatically solve audit-query or delivery-guarantee responsibility.

- [x] **Step 3: Localize the same decision procedure in English**

Keep `## Closing` and use these semantic rows:

```markdown
| Step | Decision | Evidence to check |
|---|---|---|
| 1 | Choose the aggregates and transitions that carry an explanation obligation | Who must explain which decision during an incident, dispute, or regulatory review? |
| 2 | Separate audit queries from screen queries | Is an object diff required, and is a separate read model required? |
| 3 | Set the delivery boundary | Synchronous audit, Kafka projection, acknowledgement wait, and outbox/retry design |
| 4 | Measure again under operating conditions | p95/p99, storage volume, retention, query predicates, and index size |
```

Add the English equivalent of the Korean paragraph without literal translation.

- [x] **Step 4: Check resource curation and locale parity**

Run:

```bash
! rg -n '2026-06-08-javers-exposed-(ddd-envers-comparison|commit-metadata-indexes)\\.json' \
  src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx \
  src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx
rg -n '순서 \| 결정 \| 확인할 근거|Step \| Decision \| Evidence to check|Kafka snapshot repository' \
  src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx \
  src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx
```

Expected: no raw JSON reader link remains; both closing tables and source-backed resources exist.

- [x] **Step 5: Run rendered-document validation**

Run:

```bash
git diff --check
npm run build
npm test
```

Expected: no whitespace errors, Astro check has zero errors, and every test passes.

- [x] **Step 6: Verify both local routes and commit the update**

Run while the local preview is running:

```bash
printf 'GET /ko/blog/bluetape4k-javers-part4-audit-cost/ HTTP/1.1\\r\\nHost: 127.0.0.1\\r\\nConnection: close\\r\\n\\r\\n' | nc -w 3 127.0.0.1 4325 | head -n 1
printf 'GET /blog/bluetape4k-javers-part4-audit-cost/ HTTP/1.1\\r\\nHost: 127.0.0.1\\r\\nConnection: close\\r\\n\\r\\n' | nc -w 3 127.0.0.1 4325 | head -n 1
```

Expected: both requests report `HTTP/1.1 200 OK` in the Astro preview log.

Then commit with Lore trailers:

```bash
git add src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx \
  src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx \
  docs/superpowers/plans/2026-07-22-javers-part4-selection-and-kafka.md
git commit -m "Make the Part 4 audit decision process actionable"
```

Evidence recorded on 2026-07-22:

```text
resource curation: PASS; neither raw JSON artifact remains in either article, while the benchmark and source-backed links remain
locale parity: PASS; Korean and English each contain the four-step decision table and the Kafka snapshot repository link
git diff --check: PASS
npm run build: PASS; Astro static build completed
npm test: PASS
local preview: port 4326 returned 200 for /ko/blog/bluetape4k-javers-part4-audit-cost/ and /blog/bluetape4k-javers-part4-audit-cost/
```

### Task 6: Publish the exact documentation head to PR #252

**Files:**
- Modify: `docs/superpowers/plans/2026-07-22-javers-part4-selection-and-kafka.md`

- [x] **Step 1: Push the finalized documentation commit**

```bash
git push origin docs/issue-193-javers-audit-cost
```

Expected: the remote branch advances to the exact documentation head.

- [x] **Step 2: Verify PR authority and preserve the delivery boundary**

```bash
gh pr view 252 --json url,headRefOid,baseRefName,body,labels,assignees,mergeStateStatus,statusCheckRollup
```

Expected: the PR uses `develop` as base, retains `debop`, `documentation`, and `enhancement`, and its final Markdown heading is `## DoD Status`. Do not merge or deploy.

PR evidence after documentation delivery at `450aa0273f417905b6782bf8f5eb3dff8c8bc0a7`: PR #252 targets `develop`, retains assignee `debop` and labels `documentation` and `enhancement`, and its final Markdown heading remains `## DoD Status`. The new Deploy Website Build check is in progress; the PR was not merged and the site was not deployed by this task.

## Plan Self-Review

- Spec coverage: Task 1 grounds the current source contract; Task 2 implements Korean semantics and links; Task 3 preserves bilingual parity; Task 4 validates routes and keeps the existing PR accurate; Task 5 removes raw reader artifacts and makes the closing procedural; Task 6 publishes the exact PR head without merging.
- Scope check: the plan changes only two article files and its evidence record. It does not implement Kafka, outbox, projections, or benchmarks.
- Placeholder scan: no incomplete-marker or deferred-implementation text remains. Future outbox/retry language is explicitly a reader-facing boundary, not a work item.
- Type consistency: `KafkaCdoSnapshotRepository`, `KafkaCdoSnapshotProjector`, `saveSnapshot()`, and `publishTimeout` match the inspected source names.
