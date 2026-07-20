# Reservation Control Plane Article Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publishable Korean-first, bilingual standalone article explaining how the workshop reservation control plane protects finite capacity under concurrent demand.

**Architecture:** The article starts from a last-slot race and follows the authoritative PostgreSQL path, then explains hold/waitlist ownership, HTTP idempotency, Redis fail-open behavior, test evidence, and explicit non-guarantees. Korean is drafted and reviewed locally first; English localization begins only after the Korean review gate.

**Tech Stack:** Astro/Starlight MDX, Kotlin/Spring Boot source links, PostgreSQL/Exposed JDBC, Redis/Lettuce, repository-local npm build.

---

## File Structure

- Create `src/content/docs/ko/blog/reservation-control-plane-postgresql-authority.mdx`: Korean primary article and local review route.
- Create `src/content/docs/blog/reservation-control-plane-postgresql-authority.mdx`: English localization after Korean approval.
- Create `public/assets/reservation-control-plane-postgresql-authority-hero.png`: schema-required shared hero for both locales.
- Modify this plan only to check completed steps and record evidence.
- Do not create architecture diagrams or charts in this iteration; the article uses one schema-required hero plus prose, compact tables, and short Kotlin excerpts.

## Pinned Evidence

- Workshop repository ref: `24bb881e8ef502f0209639870df0b9e102a9840e` on `develop`.
- Module root: `commerce/reservation-control-plane`.
- Style anchors:
  - `src/content/docs/ko/blog/bluetape4k-flow-extensions-workshop.mdx`
  - `src/content/docs/ko/blog/bluetape4k-cache-part4-workshop-examples.mdx`
  - `src/content/docs/ko/blog/bluetape4k-leader-part5-backends-operations-benchmarks.mdx`
- Related published routes:
  - `/ko/blog/clinic-appointment-part4-greedy-vs-global-optimization/`
  - `/ko/blog/transactional-outbox-idempotency-spring-ktor/`
  - `/ko/blog/transactional-outbox-kafka-first-fallback-part2/`
- Deferred related routes: clinic appointment Parts 6 and 7 remain outside this branch until their existing PR is merged.

### Task 1: Lock the claim-to-source ledger

**Files:**
- Read: `/Users/debop/work/bluetape4k/bluetape4k-workshop/commerce/reservation-control-plane/README.ko.md`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-workshop/commerce/reservation-control-plane/src/main/kotlin/io/bluetape4k/workshop/commerce/reservation/**`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-workshop/commerce/reservation-control-plane/src/test/kotlin/io/bluetape4k/workshop/commerce/reservation/**`

- [x] **Step 1: Record the authoritative capacity claim**

Use `CapacityResourceRepository.tryOccupy()` as the smallest proof: one SQL update combines resource state, expected revision, and `occupiedCount < capacity`, then increments both `occupiedCount` and `revision`. Pair it with the transaction in `ReservationCommandService.hold()` so a failed hold insert cannot leave an occupied slot.

- [x] **Step 2: Record the HTTP idempotency claim**

Use `IdempotentReservationCommandService.execute()` and `HttpIdempotencyRepository.acquire()` to distinguish `New`, `Takeover`, `Replay`, `FingerprintConflict`, and `InProgress`. Preserve the actual 90-second lease and 24-hour default retention only if the draft mentions numbers.

- [x] **Step 3: Record the advisory Redis claim**

Use `ReservationAdmissionGate`, `InFlightCommandSuppressor`, and `LettuceSemaphoreAdmissionBackend`. State that Redis errors fall back to the local/PostgreSQL path, while Redis capacity rejection can still shed load before the database. State the no-lease semaphore permit caveat without implying automatic recovery.

- [x] **Step 4: Record the ownership and handoff claim**

Use `WaitlistCommandService` and `ReservationCapacityHandoffService`: resource-first lock order, FIFO `oldestWaiting`, owner digest checks, active offer expiry, accepted offer conversion, and release only when no waiter exists.

- [x] **Step 5: Record test evidence and limits**

Use PostgreSQL HTTP integration tests, `RedisUnavailableBootIntegrationTest`, idempotency repository tests, admission/suppression tests, waitlist tests, expiry sweeper tests, and notification outbox tests. Do not claim multi-region correctness, production load capacity, SLO compliance, production notification delivery, or automatic leaked-permit recovery.

### Task 2: Draft the Korean primary article

**Files:**
- Create: `src/content/docs/ko/blog/reservation-control-plane-postgresql-authority.mdx`

- [x] **Step 1: Add local frontmatter and article chrome**

Use this frontmatter shape with the schema-required hero:

```mdx
---
title: "예약 요청이 몰릴 때 정원을 넘기지 않는 방법"
description: PostgreSQL을 예약 수량의 최종 권한으로 두고 Redis를 보조 장치로 사용하는 reservation-control-plane 예제를 살펴본다.
sidebar:
  order: -202607202130
blog:
  date: 2026-07-20T21:30:00+09:00
  image: /assets/reservation-control-plane-postgresql-authority-hero.png
  imageAlt: 예약 요청 queue와 Redis 보조 gate가 PostgreSQL capacity counter로 모이는 3D miniature workbench
  cardDescription: "동시 요청, 재시도, hold 만료, waitlist, Redis 장애가 겹쳐도 예약 정원을 지키는 경계를 코드와 테스트로 확인합니다."
---

<p class="bt4k-post-meta">2026-07-20 · bluetape4k-workshop · Reservation control plane</p>
```

Place a `bt4k-blog-hero` figure before the post meta. Compare it at equal size with the Flow extensions workshop, transactional outbox/idempotency, and cache workshop heroes.

- [x] **Step 2: Open with the last-slot race**

Describe two users reading the same last available slot, one timing out and retrying, and Redis becoming unavailable during expiry cleanup. End the introduction with the selection rule: PostgreSQL decides durable outcomes; Redis reduces duplicate work and contention.

- [x] **Step 3: Explain the PostgreSQL capacity boundary**

Add a compact Kotlin excerpt based on `tryOccupy()`:

```kotlin
(table.state eq ResourceState.OPEN) and
    (table.revision eq expectedRevision) and
    (table.occupiedCount less table.capacity)
```

Explain why the predicate and increment must share one SQL update and why `ReservationCommandService.hold()` keeps the capacity CAS and hold insert in one transaction.

- [x] **Step 4: Explain hold, waitlist, and offer ownership**

Use one lifecycle table with `hold`, `waitlist entry`, and `offer`. Explain resource-first lock order, owner digest checks, FIFO promotion, finite offer TTL, and the choice between promotion and capacity release.

- [x] **Step 5: Explain idempotency as a state machine**

Use a table for `New/Takeover`, `Replay`, `FingerprintConflict`, and `InProgress`. Explain that the key is scoped by tenant and operation and the fingerprint also binds canonical payload plus owner digest.

- [x] **Step 6: Explain Redis fail-open boundaries**

Use a responsibility table:

| Boundary | Role | Failure result |
| --- | --- | --- |
| node-local bulkhead | protects JDBC concurrency | rejects when local foreground permits are exhausted |
| Redis semaphore | advisory admission | Redis errors fall back locally; permit exhaustion may shed load |
| Redis lock | short in-flight suppression | Redis errors defer to PostgreSQL idempotency |
| PostgreSQL | durable state and capacity authority | command fails rather than mutating in Redis alone |

Call out the `LettuceSemaphore` no-lease caveat and separate correctness from throughput degradation.

- [x] **Step 7: Read failure scenarios through tests**

Connect each test family to one observable claim. Mention the real PostgreSQL/Testcontainers and HTTP server path, Redis-unavailable boot, idempotency outcomes, waitlist ownership, sweeper coordination, and durable notification intent.

- [x] **Step 8: State non-guarantees and link related posts**

List the concrete gaps: multi-region/network partitions, long-running load results, leaked-permit automation, prolonged sweeper outage recovery, PostgreSQL failover policy for in-progress idempotency, SLO/alerts, and authentication binding. Link the published Part 4 and transactional outbox/idempotency posts; do not add broken Part 6/7 links.

- [x] **Step 9: Add full source links**

Link the module README and the exact classes/tests used in the body. Use `https://github.com/bluetape4k/bluetape4k-workshop/blob/develop/...` for files and `tree/develop/...` for the module root.

### Task 3: Review Korean facts and naturalness

**Files:**
- Modify: `src/content/docs/ko/blog/reservation-control-plane-postgresql-authority.mdx`

- [x] **Step 1: Run the factual consistency pass**

Check every class, function, header, status, duration, and source URL against the pinned workshop ref. Remove or qualify unsupported statements.

- [x] **Step 2: Run the Korean naturalness checklist**

Preserve the user wording `현실에서 부딪히는 문제`. Replace abstract noun-heavy headings with concrete problem/action headings. Remove marketing claims, English sentence skeletons, generic conclusions, and unexplained metaphors without changing facts.

- [x] **Step 3: Run static content checks**

Run:

```bash
git diff --check
rg -n '미정|추후 작성|Part 6|Part 7' src/content/docs/ko/blog/reservation-control-plane-postgresql-authority.mdx
```

Expected: `git diff --check` exits 0; the red-flag search returns no unresolved placeholder or unpublished route reference.

### Task 4: Build and expose the Korean review route

**Files:**
- Verify: `src/content/docs/ko/blog/reservation-control-plane-postgresql-authority.mdx`
- Verify: `public/assets/reservation-control-plane-postgresql-authority-hero.png`
- Verify: `dist/ko/blog/reservation-control-plane-postgresql-authority/index.html`

- [x] **Step 1: Build the site**

Run:

```bash
npm run build
```

Expected: Astro check reports 0 errors and the build creates the Korean route.

- [x] **Step 2: Verify the rendered route artifact**

Run:

```bash
test -f dist/ko/blog/reservation-control-plane-postgresql-authority/index.html
rg -n '예약 요청이 몰릴 때 정원을 넘기지 않는 방법|PostgreSQL|Redis' dist/ko/blog/reservation-control-plane-postgresql-authority/index.html
```

Expected: the route exists and contains the article title plus both authority-boundary terms.

- [x] **Step 3: Start the local preview server**

Run:

```bash
npm run dev -- --host 127.0.0.1 --port 4324
curl -I http://127.0.0.1:4324/ko/blog/reservation-control-plane-postgresql-authority/
```

Expected: the Astro development server listens on loopback port 4324 and the article route returns HTTP 200. Report the exact review URL to the user.

- [x] **Step 4: Stop at the Korean review gate**

Do not create the English article until the user reviews the Korean route and approves the wording and structure.

### Task 5: Localize and verify the English article after Korean approval

**Files:**
- Create: `src/content/docs/blog/reservation-control-plane-postgresql-authority.mdx`
- Modify: `src/content/docs/ko/blog/reservation-control-plane-postgresql-authority.mdx` only for approved corrections.

- [ ] **Step 1: Localize the approved Korean article**

Use natural English engineering prose. Preserve technical claims, numbers, identifiers, source links, tables, code excerpts, and non-guarantees. Do not translate Korean phrasing literally.

- [ ] **Step 2: Verify locale parity**

Compare title intent, source links, tables, code, durations, boundaries, and related routes. Korean `/ko/blog/...` and English `/blog/...` must both exist.

- [ ] **Step 3: Build and verify both routes**

Run:

```bash
git diff --check
npm run build
test -f dist/ko/blog/reservation-control-plane-postgresql-authority/index.html
test -f dist/blog/reservation-control-plane-postgresql-authority/index.html
```

Expected: all commands exit 0 and both locale routes are generated.

- [ ] **Step 4: Prepare delivery without publishing**

Commit the bilingual article only after the requested local review. Do not push, create a PR, merge, deploy, or dispatch a release workflow unless the user explicitly asks for that boundary.
