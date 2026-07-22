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

- [ ] **Step 1: Confirm the edit anchor and series boundary**

Run:

```bash
rg -n -C 3 'DB에 저장할 때 JaVers|Why the JaVers|인덱스|Do Not Add an Index' \
  src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx \
  src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx
```

Expected: both articles place the new section between the DB write-path explanation and the index discussion.

- [ ] **Step 2: Confirm the current Kafka semantics from source**

Run:

```bash
rg -n -C 4 'write-only|publish blocks|publishTimeout|RuntimeException|saveSnapshot|loadSnapshots' \
  /Users/debop/work/bluetape4k/bluetape4k-javers/javers-persistence-kafka/src/main/kotlin/io/bluetape4k/javers/persistence/kafka/repository/KafkaCdoSnapshotRepository.kt
```

Expected: the repository is write-only, waits for broker acknowledgement up to the configured timeout, and propagates publish failure.

- [ ] **Step 3: Record the source-backed terminology used by both locales**

Use these exact distinctions in the drafts:

```text
audit store: queryable history and object diff
event stream: downstream delivery and replay input
projection: a consumer-built read model or queryable target repository
current Kafka publish: acknowledgement-waiting command-path work, not fire-and-forget
future outbox/retry: a separate delivery-guarantee design, not a current feature
```

- [ ] **Step 4: Commit source-boundary notes if they changed**

No commit is expected when this step only rereads existing source. Keep the task evidence in this plan instead.

### Task 2: Add the Korean decision section

**Files:**
- Modify: `src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx` after `## DB에 저장할 때 JaVers 경로가 더 무거워질 수 있는 이유` and before `## 실제 query를 재현하기 전에는 인덱스를 추가하지 않는다`

- [ ] **Step 1: Insert the Korean section with a non-promotional selection rule**

Add `## 성능만으로 감사 방식을 고르지 않는 이유` after the write-path conclusion. Explain that JaVers is selected when object-level diff, commit metadata, and an explicit command-side audit boundary are requirements; it is not chosen merely because it creates a history table.

- [ ] **Step 2: Add the three-path decision table**

Insert this table, retaining these distinctions while polishing Korean around it:

```markdown
| 경로 | command 완료 시 보장 | Kafka와 조회의 역할 | 잘 맞는 경우 |
|---|---|---|---|
| 원본 상태 + JaVers audit | 현재 상태와 query 가능한 audit를 command 경계에서 남긴다 | Kafka는 선택적인 downstream event다 | 즉시 감사 조회와 객체 diff가 모두 필요하다 |
| 원본 상태 + JaVers audit + Kafka projection | audit를 보존한 뒤 consumer가 read model을 갱신한다 | Kafka는 화면·검색·외부 소비를 분리한다 | 빠른 조회 모델이나 다른 시스템 전달이 필요하다 |
| Kafka snapshot stream + projection 저장소 | Kafka publish acknowledgement까지 성공해야 한다 | Kafka repository는 write-only이고, 조회는 projector의 대상 저장소가 맡는다 | replay 가능한 이벤트 흐름을 별도로 운영할 수 있다 |
```

- [ ] **Step 3: Correct the asynchronous-delivery misconception**

Add a short paragraph that says the present `KafkaCdoSnapshotRepository` waits for broker acknowledgement (default maximum 30 seconds) and propagates failures. State that the consumer/projection is asynchronous, but the current publish in the command path is not fire-and-forget. Mention outbox, retry queue, and fail-fast/best-effort policy only as follow-up design choices that must settle loss, duplicate, and replay behavior.

- [ ] **Step 4: Add reader-facing resources**

Append Korean labels and links for `KafkaCdoSnapshotRepository.kt` and `KafkaCdoSnapshotProjector.kt` in `## 자료`. Keep existing benchmark/resource links unchanged.

- [ ] **Step 5: Review Korean naturalness and source names**

Run:

```bash
rg -n -C 3 '성능만으로|Kafka|acknowledgement|outbox|KafkaCdoSnapshot' \
  src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx
```

Expected: Korean prose consistently distinguishes audit history, Kafka stream, and projection; code identifiers remain exact.

- [ ] **Step 6: Commit the Korean draft**

```bash
git add src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx
git commit -m "Explain audit choices beyond JaVers write cost"
```

Expected: one narrow Korean-source commit with Lore trailers.

### Task 3: Localize the English Part 4 with factual parity

**Files:**
- Modify: `src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx` after `## Why the JaVers Path Can Cost More When It Writes to the Database` and before `## Do Not Add an Index Before Reproducing the Query`

- [ ] **Step 1: Add the English counterpart**

Use the heading `## Do Not Choose an Audit Strategy from Performance Alone`. Localize the Korean reasoning, rather than translating its sentences literally. Preserve the same three JaVers selection reasons, the three-row comparison, acknowledgement-waiting clarification, and future-only outbox/retry boundary.

- [ ] **Step 2: Add English resource links**

Append `Kafka snapshot repository` and `Kafka snapshot projector` source links in `## Resources`, targeting the same `develop` files as the Korean article.

- [ ] **Step 3: Compare locale parity**

Run:

```bash
rg -n '성능만으로|Kafka snapshot|Do Not Choose an Audit Strategy|KafkaCdoSnapshot' \
  src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx \
  src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx
```

Expected: both locales expose the decision section and both Kafka source links without changing benchmark values.

- [ ] **Step 4: Commit the English localization**

```bash
git add src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx
git commit -m "Keep the JaVers selection guidance bilingual"
```

Expected: one narrow English-localization commit with Lore trailers.

### Task 4: Validate rendered documentation and update PR #252

**Files:**
- Modify: `docs/superpowers/plans/2026-07-22-javers-part4-selection-and-kafka.md`

- [ ] **Step 1: Run static and site validation**

Run:

```bash
git diff --check
npm run build
npm test
```

Expected: no whitespace errors, Astro check has zero errors, and all test suites pass.

- [ ] **Step 2: Verify both article routes**

Run while the local Astro server is running:

```bash
curl -fsSI http://127.0.0.1:4324/ko/blog/bluetape4k-javers-part4-audit-cost/
curl -fsSI http://127.0.0.1:4324/blog/bluetape4k-javers-part4-audit-cost/
```

Expected: both routes return HTTP 200.

- [ ] **Step 3: Record completed plan evidence**

Change every completed checkbox in this plan to `[x]`, recording the exact build/test/route results directly below this step. Do not mark validation complete until fresh commands have passed.

- [ ] **Step 4: Commit the verification record**

```bash
git add docs/superpowers/plans/2026-07-22-javers-part4-selection-and-kafka.md
git commit -m "Record JaVers selection guidance verification"
```

Expected: a Lore-trailer commit records the completed plan and exact validation evidence.

- [ ] **Step 5: Push and verify PR #252 metadata**

Run:

```bash
git push origin docs/issue-193-javers-audit-cost
gh pr view 252 --json number,headRefOid,baseRefName,body,labels,assignees,mergeStateStatus
```

Expected: PR #252 points to the exact pushed head, retains its issue-derived labels and `debop` assignee, and its final Markdown `##` heading remains `## DoD Status`.

- [ ] **Step 6: Preserve the delivery boundary**

Do not merge PR #252 or deploy the site. Report the exact PR head and CI state only after the user explicitly requests that next side effect.

## Plan Self-Review

- Spec coverage: Task 1 grounds the current source contract; Task 2 implements Korean semantics and links; Task 3 preserves bilingual parity; Task 4 validates routes and keeps the existing PR accurate.
- Scope check: the plan changes only two article files and its evidence record. It does not implement Kafka, outbox, projections, or benchmarks.
- Placeholder scan: no incomplete-marker or deferred-implementation text remains. Future outbox/retry language is explicitly a reader-facing boundary, not a work item.
- Type consistency: `KafkaCdoSnapshotRepository`, `KafkaCdoSnapshotProjector`, `saveSnapshot()`, and `publishTimeout` match the inspected source names.
