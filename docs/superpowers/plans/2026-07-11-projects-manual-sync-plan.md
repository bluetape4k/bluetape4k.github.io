# Projects Manual Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 검증된 `bluetape4k-projects/docs/manual` 원본을 재현 가능한 bilingual Starlight content snapshot으로 동기화한다.

**Architecture:** source repository가 제공하는 normalized JSON manifest와 Markdown을 Node built-in 도구로 검증·복사한다. snapshot은 source commit SHA와 tree digest를 기록하며, site CI는 같은 SHA의 source checkout과 byte parity를 확인한 뒤에만 빌드한다.

**Tech Stack:** Node.js 26 built-ins, `node:test`, Astro 6, Starlight 0.39, GitHub Actions

---

## 실행 전제

이 계획은 `bluetape4k-projects/docs/superpowers/plans/2026-07-11-all-module-manuals-plan.md`가 완료되고 다음 파일이 존재한 뒤 실행한다.

- `../bluetape4k-projects/docs/manual/generated/manifest.json`
- `../bluetape4k-projects/docs/manual/en/**`
- `../bluetape4k-projects/docs/manual/ko/**`

## 파일 구조

```text
scripts/manual/
├── sync-manual.mjs
├── validate-snapshot.mjs
└── lib/{digest,frontmatter,links,paths}.mjs
tests/manual/
├── sync.test.mjs
├── snapshot.test.mjs
├── locale-parity.test.mjs
└── links.test.mjs
src/data/manual/
├── bluetape4k-projects.manifest.json
└── bluetape4k-projects.snapshot.json
src/content/docs/manual/bluetape4k-projects/**
src/content/docs/ko/manual/bluetape4k-projects/**
```

### Task 1: Snapshot data contract

**Files:**
- Create: `scripts/manual/lib/digest.mjs`
- Create: `scripts/manual/lib/paths.mjs`
- Create: `tests/manual/snapshot.test.mjs`

- [ ] **Step 1: deterministic digest test를 작성한다**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { digestEntries } from '../../scripts/manual/lib/digest.mjs';

test('digest is independent of input order and changes with content', () => {
  const a = digestEntries([{ path: 'b.md', content: 'B' }, { path: 'a.md', content: 'A' }]);
  const b = digestEntries([{ path: 'a.md', content: 'A' }, { path: 'b.md', content: 'B' }]);
  const changed = digestEntries([{ path: 'a.md', content: 'changed' }, { path: 'b.md', content: 'B' }]);
  assert.equal(a, b);
  assert.notEqual(a, changed);
});
```

- [ ] **Step 2: test가 missing module로 실패하는지 확인한다**

Run: `node --test tests/manual/snapshot.test.mjs`

- [ ] **Step 3: path 정규화와 SHA-256 digest를 구현한다**

```js
import { createHash } from 'node:crypto';

export function digestEntries(entries) {
  const hash = createHash('sha256');
  for (const entry of [...entries].sort((a, b) => a.path.localeCompare(b.path))) {
    hash.update(entry.path.replaceAll('\\', '/'));
    hash.update('\0');
    hash.update(entry.content);
    hash.update('\0');
  }
  return hash.digest('hex');
}
```

- [ ] **Step 4: test를 통과시키고 커밋한다**

```bash
node --test tests/manual/snapshot.test.mjs
git add scripts/manual/lib tests/manual/snapshot.test.mjs
git commit -m "test: define reproducible manual snapshot digests" \
  -m "Constraint: Site builds must prove byte parity with a fixed source commit.\nConfidence: high\nScope-risk: narrow\nTested: node --test tests/manual/snapshot.test.mjs"
```

### Task 2: Frontmatter augmentation and locale mapping

**Files:**
- Create: `scripts/manual/lib/frontmatter.mjs`
- Create: `tests/manual/locale-parity.test.mjs`
- Create: `tests/manual/frontmatter.test.mjs`

- [ ] **Step 1: source Markdown을 Starlight document로 변환하는 test를 작성한다**.

Expected frontmatter fields:

```yaml
manual:
  id: bluetape4k-core
  repository: bluetape4k-projects
  group: foundation
  kind: library
  sourceCommit: 40-character-sha
  sourcePath: docs/manual/en/modules/bluetape4k-core.md
  layer: build
```

- [ ] **Step 2: 영문과 한글 manifest ID가 다르면 실패하는 test를 작성한다**.
- [ ] **Step 3: 기존 YAML frontmatter를 보존하면서 `manual` block을 추가하는 transformer를 구현한다**.
- [ ] **Step 4: source locale 경로를 site 경로로 매핑한다**.

```js
export function destinationFor(locale, relativePath) {
  const base = locale === 'ko'
    ? 'src/content/docs/ko/manual/bluetape4k-projects'
    : 'src/content/docs/manual/bluetape4k-projects';
  return `${base}/${relativePath.replace(new RegExp(`^${locale}/`), '')}`;
}
```

- [ ] **Step 5: tests를 실행하고 커밋한다**.

### Task 3: Atomic sync command

**Files:**
- Create: `scripts/manual/sync-manual.mjs`
- Create: `tests/manual/sync.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: 임시 source repository fixture를 만드는 sync test를 작성한다**.

Test cases:

- clean target에 EN/KO 문서와 두 JSON metadata 파일을 생성
- source commit SHA가 snapshot에 기록
- 두 번째 실행이 byte-identical
- `--check`가 clean snapshot에서 0, drift에서 1 반환
- validation 실패 시 기존 target을 변경하지 않음

- [ ] **Step 2: test가 CLI 부재로 실패하는지 확인한다**.

Run: `node --test tests/manual/sync.test.mjs`

- [ ] **Step 3: CLI argument contract를 구현한다**.

```text
node scripts/manual/sync-manual.mjs \
  --source ../bluetape4k-projects \
  --repository bluetape4k-projects \
  [--check]
```

CLI는 `git -C <source> rev-parse HEAD`, normalized manifest, EN/KO files를 읽고 temp directory에서 전체 결과를 생성·검증한 후 target을 교체한다.

- [ ] **Step 4: package scripts를 추가한다**.

```json
{
  "scripts": {
    "sync:manual": "node scripts/manual/sync-manual.mjs --repository bluetape4k-projects",
    "check:manual": "node scripts/manual/validate-snapshot.mjs",
    "test": "node --test tests/manual/*.test.mjs"
  }
}
```

기존 scripts를 삭제하거나 이름을 바꾸지 않는다.

- [ ] **Step 5: tests와 실제 source dry-run을 실행한다**.

```bash
npm test
npm run sync:manual -- --source ../bluetape4k-projects --check
```

- [ ] **Step 6: 커밋한다**.

### Task 4: Snapshot validator and link contract

**Files:**
- Create: `scripts/manual/validate-snapshot.mjs`
- Create: `scripts/manual/lib/links.mjs`
- Create: `tests/manual/links.test.mjs`
- Modify: `src/content.config.ts`

- [ ] **Step 1: duplicate manual ID, broken relative link, missing source/test/workshop link, digest mismatch tests를 작성한다**.
- [ ] **Step 2: tests가 실패하는지 확인한다**.
- [ ] **Step 3: normalized manifest와 generated content를 대조하는 validator를 구현한다**.
- [ ] **Step 4: Starlight schema에 manual metadata를 추가한다**.

```ts
manual: z.object({
  id: z.string(),
  repository: z.literal('bluetape4k-projects'),
  group: z.string(),
  kind: z.enum(['library', 'example', 'benchmark']),
  sourceCommit: z.string().regex(/^[0-9a-f]{40}$/),
  sourcePath: z.string(),
  layer: z.enum(['build', 'learn', 'apply']),
}).optional(),
```

- [ ] **Step 5: `npm test`, `npm run check:manual`, `npm run build`를 실행한다**.
- [ ] **Step 6: 커밋한다**.

### Task 5: Import the first complete snapshot

**Files:**
- Create: `src/data/manual/bluetape4k-projects.manifest.json`
- Create: `src/data/manual/bluetape4k-projects.snapshot.json`
- Create: `src/content/docs/manual/bluetape4k-projects/**`
- Create: `src/content/docs/ko/manual/bluetape4k-projects/**`

- [ ] **Step 1: source repository가 clean하고 manual validator를 통과하는지 확인한다**.
- [ ] **Step 2: sync를 실행한다**.

```bash
npm run sync:manual -- --source ../bluetape4k-projects
```

- [ ] **Step 3: target 문서 수가 source와 일치하는지 확인한다**.

Expected: 90 EN + 90 KO module documents plus localized landing, architecture, and guide documents.

- [ ] **Step 4: snapshot과 build를 검증한다**.

```bash
npm test
npm run check:manual
npm run build
git diff --check
```

- [ ] **Step 5: generated snapshot을 한 커밋으로 기록한다**.

### Task 6: GitHub Pages source parity gate

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Modify: `package.json`

- [ ] **Step 1: deploy workflow가 manual check 없이 build하는 현재 상태를 확인한다**.
- [ ] **Step 2: site checkout 다음에 source repository checkout을 추가한다**.

```yaml
- name: Read manual source commit
  id: manual-source
  run: echo "sha=$(node -p "require('./src/data/manual/bluetape4k-projects.snapshot.json').sourceCommit")" >> "$GITHUB_OUTPUT"
- uses: actions/checkout@v7
  with:
    repository: bluetape4k/bluetape4k-projects
    ref: ${{ steps.manual-source.outputs.sha }}
    path: .manual-source/bluetape4k-projects
```

- [ ] **Step 3: build 전에 byte parity와 tests를 실행한다**.

```yaml
- name: Verify manual snapshot
  run: npm run sync:manual -- --source .manual-source/bluetape4k-projects --check
- name: Test manual tooling
  run: npm test
- name: Validate manual snapshot
  run: npm run check:manual
```

- [ ] **Step 4: 최신 `develop`과의 drift를 별도 check로 추가한다**.

고정 SHA parity가 통과한 뒤 `git ls-remote https://github.com/bluetape4k/bluetape4k-projects.git refs/heads/develop`과 snapshot SHA를 비교한다. 다르면 `Manual snapshot is stale`로 실패한다.

- [ ] **Step 5: workflow syntax, tests, build를 검증한다**.

```bash
actionlint .github/workflows/deploy.yml
npm test
npm run check:manual
npm run build
```

- [ ] **Step 6: 커밋한다**.

### Task 7: Sync completion proof

**Files:**
- No new files

- [ ] **Step 1: clean source checkout에서 sync `--check`를 실행한다**.
- [ ] **Step 2: 모든 Node tests와 snapshot validator를 실행한다**.
- [ ] **Step 3: Astro build와 `git diff --check`를 실행한다**.
- [ ] **Step 4: 대표 EN/KO generated page의 source SHA, locale pair, related links를 확인한다**.
- [ ] **Step 5: PR body의 마지막 section을 `## DoD Status`로 작성한다**.
