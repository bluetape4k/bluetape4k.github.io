# bluetape4k-dependencies 2.0.0 Blog Series Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `bluetape4k-dependencies 2.0.0`이 정렬한 신규 기능과 호환성·수명주기·소유권·운영 경계를 네 편의 한·영 기술 글과 공용 hero로 발행 가능한 상태까지 구현한다.

**Architecture:** 한국어 원고를 사실 원본으로 먼저 작성하고, 각 편의 source ledger와 선택 규칙을 고정한 뒤 영어판을 같은 구조로 작성한다. 네 글은 하나의 text-free hero를 공유하며, 기능 주장은 중앙 BOM이 아니라 각 소유 저장소의 immutable release tag와 테스트에 연결한다.

**Tech Stack:** Astro, Starlight, MDX, Node.js test runner, `bluetape-writer`, `bluetape-diagram`, ImageGen

---

## File map

| File | Responsibility |
| --- | --- |
| `tests/ecosystem/dependencies-2-0-series.test.mjs` | 네 편의 locale parity, frontmatter, hero, source provenance, series navigation을 고정한다. |
| `src/content/docs/ko/blog/bluetape4k-dependencies-2-0-part1-compatibility-boundaries.mdx` | Java 25와 migration 경계를 설명하는 한국어 원문이다. |
| `src/content/docs/blog/bluetape4k-dependencies-2-0-part1-compatibility-boundaries.mdx` | Part 1 영어판이다. |
| `src/content/docs/ko/blog/bluetape4k-dependencies-2-0-part2-data-lifecycles.mdx` | tenant, QBE, batch, graph lifecycle을 설명하는 한국어 원문이다. |
| `src/content/docs/blog/bluetape4k-dependencies-2-0-part2-data-lifecycles.mdx` | Part 2 영어판이다. |
| `src/content/docs/ko/blog/bluetape4k-dependencies-2-0-part3-messaging-stream-ownership.mdx` | NATS, AWS stream, SQS/SNS ownership을 설명하는 한국어 원문이다. |
| `src/content/docs/blog/bluetape4k-dependencies-2-0-part3-messaging-stream-ownership.mdx` | Part 3 영어판이다. |
| `src/content/docs/ko/blog/bluetape4k-dependencies-2-0-part4-operational-safety.mdx` | diagnostics, audit, image, text의 fail-closed 경계를 설명하는 한국어 원문이다. |
| `src/content/docs/blog/bluetape4k-dependencies-2-0-part4-operational-safety.mdx` | Part 4 영어판이다. |
| `public/assets/bluetape4k-dependencies-2-0-hero.png` | 네 편이 공유하는 16:9 text-free 3D miniature workbench hero다. |

## Shared article contract

모든 원고는 다음 값을 공유한다.

```yaml
blog:
  date: 2026-09-06T10:00:00+09:00
  image: /assets/bluetape4k-dependencies-2-0-hero.png
  tags: ["dependencies","kotlin","practical-example"]
```

각 글은 hero figure, `bt4k-post-meta`, 실제 upgrade/운영 시나리오, 보장과 비보장, 최소 Kotlin/Gradle 예시, immutable source links, 선택 규칙, 자료, 네 편의 series navigation을 포함한다. 한국어 route는 `/ko/blog/<slug>/`, 영어 route는 `/blog/<slug>/`를 사용한다.

### Task 1: Add the failing series contract test

**Files:**
- Create: `tests/ecosystem/dependencies-2-0-series.test.mjs`

- [x] **Step 1: Write the failing contract test**

```js
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../../', import.meta.url);
const hero = '/assets/bluetape4k-dependencies-2-0-hero.png';
const releases = [
  'bluetape4k-dependencies/releases/tag/2.0.0',
  'bluetape4k-projects/releases/tag/2.0.0',
  'bluetape4k-exposed/releases/tag/2.0.0',
  'bluetape4k-aws/releases/tag/1.0.0',
  'bluetape4k-image/releases/tag/1.0.0',
  'bluetape4k-text/releases/tag/1.0.0',
  'bluetape4k-graph/releases/tag/1.0.0',
  'bluetape4k-javers/releases/tag/1.0.0',
  'bluetape4k-leader/releases/tag/1.0.0',
];
const parts = [
  ['bluetape4k-dependencies-2-0-part1-compatibility-boundaries', 'Java 25와 호환성 경계', 'Java 25 and Compatibility Boundaries'],
  ['bluetape4k-dependencies-2-0-part2-data-lifecycles', '데이터 접근과 처리 수명주기', 'Data Access and Processing Lifecycles'],
  ['bluetape4k-dependencies-2-0-part3-messaging-stream-ownership', '메시징과 스트림의 소유권', 'Ownership in Messaging and Streams'],
  ['bluetape4k-dependencies-2-0-part4-operational-safety', '운영 진단과 안전한 실패', 'Operational Diagnostics and Fail-Closed Boundaries'],
];

async function article(locale, slug) {
  const directory = locale === 'ko' ? 'src/content/docs/ko/blog' : 'src/content/docs/blog';
  return readFile(new URL(`${directory}/${slug}.mdx`, root), 'utf8');
}

test('dependencies 2.0 series keeps locale parity and the shared hero', async () => {
  for (const [slug, koTitle, enTitle] of parts) {
    const [ko, en] = await Promise.all([article('ko', slug), article('en', slug)]);
    assert.match(ko, new RegExp(`^title: "bluetape4k-dependencies 2\\.0\\.0 활용기 Part \\d: ${koTitle}"$`, 'm'));
    assert.match(en, new RegExp(`^title: "bluetape4k-dependencies 2\\.0\\.0 in Practice Part \\d: ${enTitle}"$`, 'm'));
    for (const source of [ko, en]) {
      assert.match(source, new RegExp(`image: ${hero.replaceAll('/', '\\/')}`));
      assert.match(source, /bluetape4k-dependencies\/releases\/tag\/2\.0\.0/);
      for (const [seriesSlug] of parts) assert.match(source, new RegExp(`blog/${seriesSlug}/`));
    }
  }
  await assert.doesNotReject(access(new URL(`public${hero}`, root)));
});

test('dependencies 2.0 series cites every owned release line', async () => {
  const sources = (await Promise.all(parts.flatMap(([slug]) => [article('ko', slug), article('en', slug)]))).join('\n');
  for (const release of releases) assert.match(sources, new RegExp(release.replaceAll('.', '\\.')));
  assert.doesNotMatch(sources, /exactly-once guarantee|exactly-once 보장/);
});
```

- [x] **Step 2: Run the test and confirm the missing-article failure**

Run: `node --test tests/ecosystem/dependencies-2-0-series.test.mjs`

Expected: FAIL with `ENOENT` for the first Part 1 article.

- [x] **Step 3: Commit the failing contract**

```bash
git add tests/ecosystem/dependencies-2-0-series.test.mjs
git commit -m "Lock the dependencies 2.0 series delivery contract" -m "Constraint: Keep four bilingual routes and one shared hero aligned.\nConfidence: high\nScope-risk: narrow\nTested: Contract test fails on the first missing article as expected\nNot-tested: Articles and hero do not exist yet"
```

### Task 2: Write Part 1 in Korean and English

**Files:**
- Create: `src/content/docs/ko/blog/bluetape4k-dependencies-2-0-part1-compatibility-boundaries.mdx`
- Create: `src/content/docs/blog/bluetape4k-dependencies-2-0-part1-compatibility-boundaries.mdx`

- [x] **Step 1: Write the Korean source article**

Use issue `#436` and the design spec. Include these sections in this order: `업그레이드 전에 답할 질문`, `2.0.0이 선택한 릴리스`, `Java 25 바닥선과 Java 21 호환 영역`, `컴파일과 설정에서 드러나는 migration`, `실패를 앞당기는 startup 경계`, `적용 체크리스트`, `자료`, `시리즈 글`.

The frontmatter must use sidebar order `-202609061000`, the shared hero, and tags `dependencies`, `java`, `kotlin`, `migration`, `practical-example`.

- [x] **Step 2: Audit Korean terminology and meaning**

Run: `node ~/.codex/skills/bluetape-writer/scripts/audit-korean-terms.mjs src/content/docs/ko/blog/bluetape4k-dependencies-2-0-part1-compatibility-boundaries.mdx`

Expected: `findings=0` after contextual repairs.

- [x] **Step 3: Write the English parity article**

Keep the same evidence, code, caveats, and navigation. Write natural English rather than translating sentence order.

- [x] **Step 4: Verify Part 1 source links and frontmatter**

Run: `rg -n "releases/tag|issues/|spring\.mongodb\.uri|Java 25|Java 21|virtualthread" src/content/docs/{,ko/}blog/bluetape4k-dependencies-2-0-part1-compatibility-boundaries.mdx`

Expected: both locales include the exact migration tokens and immutable release links.

### Task 3: Write Part 2 in Korean and English

**Files:**
- Create: `src/content/docs/ko/blog/bluetape4k-dependencies-2-0-part2-data-lifecycles.mdx`
- Create: `src/content/docs/blog/bluetape4k-dependencies-2-0-part2-data-lifecycles.mdx`

- [x] **Step 1: Write the Korean source article from issue `#437`**

Use these sections: `수명주기를 하나로 묶지 않는다`, `tenant는 exact match로 닫는다`, `QBE의 projection과 실행 경계`, `batch checkpoint는 commit 뒤에 둔다`, `graph streaming의 boundedness를 따로 증명한다`, `선택 규칙`, `자료`, `시리즈 글`. Include one tenant resolver example and one checkpoint-order pseudocode block.

- [x] **Step 2: Run the Korean terminology audit**

Run the audit script against the Part 2 Korean file and resolve every contextual finding.

- [x] **Step 3: Write the English parity article**

Preserve exact-match/no-fallback, caller-owned transaction, cold `Flow`, fencing, committed checkpoint, and source-bounded execution claims.

- [x] **Step 4: Verify lifecycle claims**

Run: `rg -n "exact.match|fallback|Flow|checkpoint|fencing|bounded|releases/tag" src/content/docs/{,ko/}blog/bluetape4k-dependencies-2-0-part2-data-lifecycles.mdx`

Expected: both locales expose every lifecycle boundary and the Exposed/Graph release links.

### Task 4: Write Part 3 in Korean and English

**Files:**
- Create: `src/content/docs/ko/blog/bluetape4k-dependencies-2-0-part3-messaging-stream-ownership.mdx`
- Create: `src/content/docs/blog/bluetape4k-dependencies-2-0-part3-messaging-stream-ownership.mdx`

- [x] **Step 1: Write the Korean source article from issue `#438`**

Use these sections: `메시지 수신과 업무 성공은 같은 사건이 아니다`, `NATS manual ack`, `DynamoDB Streams와 Kinesis checkpoint`, `SQS의 visibility와 payload 소유권`, `SNS 검증과 Modulith 방향`, `소유권 표`, `자료`, `시리즈 글`. Include an explicit at-least-once/idempotency statement and a small acknowledgement-order example.

- [x] **Step 2: Run the Korean terminology audit**

Run the audit script against the Part 3 Korean file and resolve every contextual finding without altering API identifiers.

- [x] **Step 3: Write the English parity article**

Preserve acknowledgement ordering, inclusive replay, lease/fencing, caller-owned idempotency, `TopicArn` allowlist, and producer/consumer direction.

- [x] **Step 4: Verify ownership claims**

Run: `rg -n "at-least-once|idempoten|ack\(\)|nak\(\)|term\(\)|checkpoint|TopicArn|Modulith|releases/tag" src/content/docs/{,ko/}blog/bluetape4k-dependencies-2-0-part3-messaging-stream-ownership.mdx`

Expected: both locales state guarantees and owner boundaries without an exactly-once claim.

### Task 5: Write Part 4 in Korean and English

**Files:**
- Create: `src/content/docs/ko/blog/bluetape4k-dependencies-2-0-part4-operational-safety.mdx`
- Create: `src/content/docs/blog/bluetape4k-dependencies-2-0-part4-operational-safety.mdx`

- [x] **Step 1: Write the Korean source article from issue `#439`**

Use these sections: `모르는 상태를 정상처럼 보이지 않는다`, `Leader의 bounded UNKNOWN`, `Javers audit chain은 손상 시 멈춘다`, `Image runtime object와 영속 데이터`, `Text model 초기화 비용을 선택한다`, `운영 판단표`, `자료`, `시리즈 글`. Separate `UNKNOWN`, corrupted durable history, runtime collaborators, and versioned serialized data.

- [x] **Step 2: Run the Korean terminology audit**

Run the audit script against the Part 4 Korean file and resolve all findings.

- [x] **Step 3: Write the English parity article**

Keep bounded reason exposure, fail-closed audit behavior, `schemaVersion=1`, bounded decode, `DEFER`, and preload/lazy tradeoffs aligned.

- [x] **Step 4: Verify operational-safety claims**

Run: `rg -n "UNKNOWN|schemaVersion=1|DEFER|preload|lazy|audit|bounded|releases/tag" src/content/docs/{,ko/}blog/bluetape4k-dependencies-2-0-part4-operational-safety.mdx`

Expected: both locales preserve every failure-state distinction and release source.

### Task 6: Generate and validate the shared hero

**Files:**
- Create: `public/assets/bluetape4k-dependencies-2-0-hero.png`

- [x] **Step 1: Load the visual workflow**

Read `bluetape-diagram` and `imagegen` fresh. Inspect the existing `bluetape4k-dependencies-1-3-0-hero.png` plus recent hero references at equal size.

- [x] **Step 2: Generate one text-free 16:9 hero**

Prompt for a polished 3D miniature workbench: one central dependency/BOM board feeding four distinct stations for compatibility, data lifecycle, messaging/streams, and operational safety. Use objects and color rather than generated labels; keep the central board and four stations legible at card size.

- [x] **Step 3: Normalize the asset**

Store the final PNG at exactly `public/assets/bluetape4k-dependencies-2-0-hero.png`. Preserve a 16:9-ish composition consistent with the existing 1672×941 series hero.

- [x] **Step 4: Run visual QA**

Inspect original size and article-card size for crop, focal balance, unreadable pseudo-text, malformed objects, and series consistency. Regenerate when any critical defect remains.

### Task 7: Close the content contract and validate the site

**Files:**
- Modify: `tests/ecosystem/dependencies-2-0-series.test.mjs` only if the implemented contract reveals a test defect; do not weaken required assertions.

- [x] **Step 1: Run all four Korean terminology audits**

```bash
node ~/.codex/skills/bluetape-writer/scripts/audit-korean-terms.mjs \
  src/content/docs/ko/blog/bluetape4k-dependencies-2-0-part{1-compatibility-boundaries,2-data-lifecycles,3-messaging-stream-ownership,4-operational-safety}.mdx
```

Expected: all four files pass with zero findings.

- [x] **Step 2: Run the prohibited-claim scan**

Run: `rg -n "exactly-once guarantee|exactly-once 보장" src/content/docs/{,ko/}blog/bluetape4k-dependencies-2-0-part*.mdx`

Expected: no output; `at-least-once` 설명과 호출자 소유 idempotency만 남는다.

- [x] **Step 3: Run targeted and repository tests**

```bash
node --test tests/ecosystem/dependencies-2-0-series.test.mjs
npm test
```

Expected: all tests pass.

- [x] **Step 4: Build the production site**

Run: `npm run build`

Expected: Astro check and build succeed with no broken MDX imports, frontmatter, or links.

- [x] **Step 5: Verify all generated routes**

For every slug in Task 1, verify both `dist/blog/<slug>/index.html` and `dist/ko/blog/<slug>/index.html` exist and reference `/assets/bluetape4k-dependencies-2-0-hero.png`.

- [x] **Step 6: Run final diff checks**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only the planned test, eight articles, hero, plan, and design artifacts are changed.

- [x] **Step 7: Commit the complete series**

Use an English Lore commit explaining why the source-backed series groups changes by reader decisions. Record targeted tests, full tests, build, route checks, terminology audit, and visual QA in `Tested:`; record any genuine gap in `Not-tested:`.

## Completion boundary

Completion means eight routes, one hero, one contract test, locale parity, immutable release citations, all content/site validations, and a clean committed worktree. Updating issue checkboxes, creating a PR, merging, deployment verification, and closing issues remain separate gates.
