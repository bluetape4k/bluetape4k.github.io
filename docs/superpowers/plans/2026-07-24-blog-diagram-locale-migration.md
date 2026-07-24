# Blog Diagram Locale Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 블로그 본문의 텍스트 포함 기술 다이어그램 150개를 명시적인 영어 `-en`/한국어 `-ko` SVG·PNG 쌍으로 전환하고 locale 교차 참조를 자동으로 차단한다.

**Architecture:** MDX의 `bt4k-architecture`, `bt4k-chart`, `bt4k-sequence` figure를 locale 계약의 기준으로 삼는다. 생성 스크립트가 있는 자산은 bilingual data model과 locale별 render output을 소스로 유지하고, 직접 관리 SVG는 두 canonical SVG로 분리한다. 각 배치는 SVG 검증, 2x PNG 렌더링, full-size 육안 검수, MDX 참조 전환을 한 단위로 끝낸다.

**Tech Stack:** Astro/Starlight MDX, Node.js test runner, SVG, CairoSVG, `bluetape-diagram` audit scripts, GitHub CLI.

---

## 파일 구조와 책임

- `docs/superpowers/specs/2026-07-24-blog-diagram-locale-migration-design.md`
  - 승인된 범위, locale 명명, 시각 규칙, 배치와 완료 조건.
- `docs/superpowers/plans/2026-07-24-blog-diagram-locale-migration.md`
  - 이 실행 계획과 체크 상태.
- `tests/ecosystem/blog-diagram-locales.test.mjs`
  - 모든 기술 figure의 locale suffix, PNG/SVG 쌍, 한·영 글의 stem parity를 검증.
- `scripts/generate-*-assets.mjs`, `scripts/generate-*-diagrams.mjs`
  - 기존 생성형 다이어그램의 영어/한국어 source data와 canonical output.
- `public/assets/*-en.svg`, `public/assets/*-en.png`
  - 영어 canonical source/render.
- `public/assets/*-ko.svg`, `public/assets/*-ko.png`
  - 한국어 canonical source/render.
- `src/content/docs/blog/**/*.mdx`
  - 영어 글에서 `-en.png`만 참조.
- `src/content/docs/ko/blog/**/*.mdx`
  - 한국어 글에서 `-ko.png`만 참조.

## Task 1: Umbrella Issue 생성과 실행 기준 고정

**Files:**
- Reference: `docs/superpowers/specs/2026-07-24-blog-diagram-locale-migration-design.md`
- Reference: `docs/superpowers/plans/2026-07-24-blog-diagram-locale-migration.md`

- [ ] **Step 1: 중복 Issue와 활성 milestone을 다시 확인한다**

Run:

```bash
gh issue list --state all --limit 200 --json number,title,state,url \
  --jq '.[] | select((.title | ascii_downcase) | test("diagram.*locale|localized.*diagram|korean.*diagram"))'
gh api repos/bluetape4k/bluetape4k.github.io/milestones?state=open \
  --jq '.[] | [.number, .title] | @tsv'
```

Expected: 동일 범위의 열린 Issue가 없고, 적용 가능한 문서 milestone의 번호와 제목이 확인된다. 적합한 milestone이 없으면 milestone 없이 생성한다.

- [ ] **Step 2: 영어 umbrella Issue를 생성한다**

Run:

```bash
issue_url="$(
  gh issue create \
    --title "Localize every text-bearing blog diagram" \
    --assignee debop \
    --label documentation \
    --label enhancement \
    --body-file - <<'EOF'
## Context

Most Korean blog posts currently reuse English technical diagrams. Existing localized assets also use inconsistent unsuffixed names, so the locale contract is neither explicit nor enforceable.

## Goal

Provide canonical English and Korean SVG/PNG pairs for every text-bearing technical diagram used by the blog:

- English: `*-en.svg` and `*-en.png`
- Korean: `*-ko.svg` and `*-ko.png`
- English MDX references only `*-en.png`
- Korean MDX references only `*-ko.png`

Meaning and readability take priority over preserving the current card geometry. Technical identifiers remain unchanged, while reader-facing prose is localized naturally.

## Scope

- [ ] standalone / workshop — 42
- [ ] Exposed — 16
- [ ] AWS — 15
- [ ] Graph — 15
- [ ] Leader — 14
- [ ] JaVers — 11
- [ ] Clinic appointment — 10
- [ ] Cache — 8
- [ ] Projects — 8
- [ ] Skills / workflow — 7
- [ ] Text — 4

Total: 150 technical diagrams.

Hero artwork and screenshots are excluded. The reused `bluetape4k-leader-part4-hero.png` figure must be reclassified as hero rather than migrated as a technical diagram.

## Definition of Done

- [ ] All 150 technical diagrams have `-en` and `-ko` SVG/PNG pairs.
- [ ] English assets use the bluetape diagram English font contract.
- [ ] Korean assets use `goorm Sans` and `goorm Sans Code`.
- [ ] Long Korean labels are reflowed or the diagram geometry is redesigned for meaning and readability.
- [ ] Every changed SVG passes structural, font, overflow, endpoint, sequence, and PNG metadata audits as applicable.
- [ ] Every PNG is rendered from its canonical SVG at 2x scale and inspected at full size.
- [ ] Locale contract regression tests pass.
- [ ] `npm test` and `npm run build` pass.
- [ ] Changed English and Korean routes render their locale-specific assets.
EOF
)"
printf '%s\n' "$issue_url"
```

Expected: 새 Issue URL이 출력되고 labels/assignee/body가 요청한 값과 일치한다.

- [ ] **Step 3: Issue metadata를 검증한다**

Run:

```bash
issue_number="${issue_url##*/}"
gh issue view "$issue_number" --json number,title,body,assignees,labels,milestone,url
```

Expected: 제목과 본문은 영어이고 `debop`, `documentation`, `enhancement`가 적용되어 있다.

## Task 2: Locale 계약 회귀 테스트

**Files:**
- Create: `tests/ecosystem/blog-diagram-locales.test.mjs`
- Modify: `tests/ecosystem/diagram-lightbox.test.mjs`

- [ ] **Step 1: suffix와 asset pair를 강제하는 실패 테스트를 작성한다**

`tests/ecosystem/blog-diagram-locales.test.mjs`에 다음 계약을 구현한다.

```js
import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const technicalClasses = new Set(['bt4k-architecture', 'bt4k-chart', 'bt4k-sequence']);

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(target) : [target];
  }));
  return nested.flat();
}

function technicalAssets(source) {
  const assets = [];
  for (const match of source.matchAll(/<figure\b([^>]*)>([\s\S]*?)<\/figure>/g)) {
    const className = match[1].match(/\bclass="([^"]+)"/)?.[1];
    if (!technicalClasses.has(className)) continue;
    const asset = match[2].match(/<img\b[^>]*\bsrc="\/assets\/([^"]+\.png)"/)?.[1];
    assert.ok(asset, `technical figure must contain one local PNG: ${match[0].slice(0, 120)}`);
    assets.push(asset);
  }
  return assets;
}

async function assertAssetPair(asset) {
  const svg = asset.replace(/\.png$/, '.svg');
  await access(path.join(root, 'public/assets', asset));
  await access(path.join(root, 'public/assets', svg));
}

test('blog technical diagrams use explicit locale assets with matching SVG sources', async () => {
  const localeRoots = [
    ['en', path.join(root, 'src/content/docs/blog')],
    ['ko', path.join(root, 'src/content/docs/ko/blog')],
  ];

  for (const [locale, directory] of localeRoots) {
    const files = (await filesUnder(directory)).filter((file) => file.endsWith('.mdx'));
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      for (const asset of technicalAssets(source)) {
        assert.match(asset, new RegExp(`-${locale}\\.png$`), `${file}: ${asset}`);
        await assertAssetPair(asset);
      }
    }
  }
});

test('paired English and Korean posts reference the same technical diagram stems', async () => {
  const englishRoot = path.join(root, 'src/content/docs/blog');
  const koreanRoot = path.join(root, 'src/content/docs/ko/blog');
  const englishFiles = (await filesUnder(englishRoot)).filter((file) => file.endsWith('.mdx'));

  for (const englishFile of englishFiles) {
    const relative = path.relative(englishRoot, englishFile);
    const koreanFile = path.join(koreanRoot, relative);
    try {
      await access(koreanFile);
    } catch {
      continue;
    }
    const english = technicalAssets(await readFile(englishFile, 'utf8'))
      .map((asset) => asset.replace(/-en\.png$/, ''))
      .sort();
    const korean = technicalAssets(await readFile(koreanFile, 'utf8'))
      .map((asset) => asset.replace(/-ko\.png$/, ''))
      .sort();
    assert.deepEqual(korean, english, relative);
  }
});
```

- [ ] **Step 2: 테스트가 현재 자산에서 실패하는지 확인한다**

Run:

```bash
node --test tests/ecosystem/blog-diagram-locales.test.mjs
```

Expected: unsuffixed Korean asset 또는 unsuffixed English asset을 가리키는 첫 MDX에서 FAIL.

- [ ] **Step 3: 잘못 분류된 Leader Part 4 hero figure를 제외 시각으로 고친다**

Modify both:

- `src/content/docs/blog/bluetape4k-leader-part4-spring-ktor-management.mdx`
- `src/content/docs/ko/blog/bluetape4k-leader-part4-spring-ktor-management.mdx`

Change:

```mdx
<figure class="bt4k-blog-hero">
```

`tests/ecosystem/diagram-lightbox.test.mjs`의 image classification test가 `bt4k-blog-hero`를 허용하고 zoom 대상에서 제외하는지 유지한다.

- [ ] **Step 4: 테스트 파일만 커밋한다**

Run:

```bash
git add tests/ecosystem/blog-diagram-locales.test.mjs \
  tests/ecosystem/diagram-lightbox.test.mjs \
  src/content/docs/blog/bluetape4k-leader-part4-spring-ktor-management.mdx \
  src/content/docs/ko/blog/bluetape4k-leader-part4-spring-ktor-management.mdx
git commit -m "Guard locale-specific blog diagram references" \
  -m "Constraint: Hero artwork and screenshots stay outside the technical diagram contract
Confidence: high
Scope-risk: narrow
Directive: Technical figures must reference locale-suffixed PNG and SVG pairs
Tested: Locale contract test fails against the remaining unsuffixed diagram inventory
Not-tested: Full suite remains blocked until all batches migrate"
```

Expected: 테스트는 의도적으로 migration 완료 전까지 red 상태이고 hero 분류 변경만 포함한다.

## Task 3: 공통 생성·검증 계약 적용

**Files:**
- Modify: `scripts/generate-aws-part2-assets.mjs`
- Modify: `scripts/generate-aws-part3-assets.mjs`
- Modify: `scripts/generate-aws-part4-assets.mjs`
- Modify: `scripts/generate-aws-part5-assets.mjs`
- Modify: `scripts/generate-cache-series-diagrams.mjs`
- Modify: `scripts/generate-exposed-part1-assets.mjs`
- Modify: `scripts/generate-graph-series-assets.mjs`
- Modify: `scripts/generate-javers-series-assets.mjs`
- Modify: `scripts/generate-projects-part4-6-assets.mjs`

- [ ] **Step 1: generator data를 locale별 label model로 바꾼다**

각 다이어그램의 독자용 문자열은 아래 shape로 바꾸고 기술 식별자와 benchmark 값은 공통으로 유지한다.

```js
const diagram = {
  name: 'asset-stem',
  labels: {
    en: {
      title: 'English title',
      subtitle: 'English explanation',
    },
    ko: {
      title: '한국어 제목',
      subtitle: '한국어 설명',
    },
  },
};
```

렌더 함수는 `render(diagram, locale)`를 받고 output base를
`` `${diagram.name}-${locale}` ``로 계산한다. 영어 CSS는 `Architects Daughter`,
`Comic Mono`; 한국어 CSS는 `goorm Sans`, `goorm Sans Code`를 사용한다.

- [ ] **Step 2: 모든 generator가 두 locale을 출력하게 한다**

각 generator의 마지막 loop를 다음 계약으로 바꾼다.

```js
for (const diagram of diagrams) {
  for (const locale of ['en', 'ko']) {
    const base = `${out}/${diagram.name}-${locale}`;
    writeFileSync(`${base}.svg`, svg(diagram, locale));
    execFileSync('cairosvg', [
      `${base}.svg`,
      '-o', `${base}.png`,
      '-s', '2',
    ]);
  }
}
```

기존 Graphviz intermediate가 필요한 generator는 `.dot`/`.plain`을 locale suffix와 함께 생성하되 public MDX는 PNG만 참조한다.

- [ ] **Step 3: generator별 단일 샘플로 font와 render 계약을 검증한다**

Run after each generator:

```bash
generated_svgs=($(git diff --name-only -- 'public/assets/*-en.svg' 'public/assets/*-ko.svg'))
xmllint --noout "${generated_svgs[@]}"
rg -L 'Architects Daughter|Comic Mono' public/assets/*-en.svg
rg -L 'goorm Sans|goorm Sans Code' public/assets/*-ko.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py "${generated_svgs[@]}"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py "${generated_svgs[@]}"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py "${generated_svgs[@]}"
file "${generated_svgs[@]/%.svg/.png}"
```

Expected: XML과 connector/geometry/endpoint audit가 PASS하고, `rg -L`은 출력이 없으며,
모든 matching PNG가 유효한 PNG image로 보고된다.

## Task 4: 기존 localized 13쌍과 Korean-only BOM 정규화

**Files:**
- Modify: `public/assets/clinic-appointment-*.svg`
- Modify: `public/assets/clinic-appointment-*.png`
- Modify: `public/assets/bluetape4k-javers-part4-*.svg`
- Modify: `public/assets/bluetape4k-javers-part4-*.png`
- Modify: `public/assets/bluetape4k-dependencies-bom-flow-01.svg`
- Modify: `public/assets/bluetape4k-dependencies-bom-flow-01.png`
- Modify: matching MDX under `src/content/docs/blog/` and `src/content/docs/ko/blog/`

- [ ] **Step 1: 현재 unsuffixed Korean SVG/PNG 13개를 `-ko`로 이동한다**

Clinic 10개와 JaVers Part 4 3개에서 unsuffixed SVG/PNG를 같은 stem의 `-ko`로 이동한다. 기존 `-en` 쌍은 유지하고 font audit을 다시 실행한다.

- [ ] **Step 2: Korean-only BOM flow의 영어 counterpart를 작성한다**

`bluetape4k-dependencies-bom-flow-01-ko.svg/png`는 현재 한국어 내용을 보존해 이름을 바꾸고, 동일한 기술 관계를 영어 독자용으로 표현한 `-en.svg/png`를 작성한다.

- [ ] **Step 3: 양쪽 MDX 참조를 suffix 계약으로 전환한다**

영어는 `-en.png`, 한국어는 `-ko.png`를 참조한다. `data-diagram-title`, `alt`,
`figcaption`은 기존 locale 문구를 보존한다.

- [ ] **Step 4: 14개 stem을 하나씩 audit하고 커밋한다**

Run for every changed stem:

```bash
localized_svgs=($(git diff --name-only -- 'public/assets/clinic-appointment-*.svg' 'public/assets/bluetape4k-javers-part4-*.svg' 'public/assets/bluetape4k-dependencies-bom-flow-01-*.svg'))
xmllint --noout "${localized_svgs[@]}"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py "${localized_svgs[@]}"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py "${localized_svgs[@]}"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py "${localized_svgs[@]}"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py "${localized_svgs[@]}"
```

Expected: 모든 audit PASS, 한국어 PNG full-size 검수에서 잘림·겹침 없음.

## Task 5: standalone / workshop 42개 전환

**Files:**
- Modify: matching `public/assets/*.svg` and `public/assets/*.png`
- Modify: matching paired MDX under `src/content/docs/blog/` and `src/content/docs/ko/blog/`

- [ ] **Step 1:** 승인 명세 inventory에서 `standalone / workshop` 42개 stem을 고정한다.
- [ ] **Step 2:** 각 unsuffixed English SVG/PNG를 `-en`으로 이동한다.
- [ ] **Step 3:** 각 `-ko.svg`를 자연스러운 한국어로 작성하고 긴 문구에 맞춰 card/canvas/connector를 재배치한다.
- [ ] **Step 4:** CairoSVG scale 2로 `-ko.png`를 렌더링한다.
- [ ] **Step 5:** 영어/한국어 MDX를 각각 `-en.png`/`-ko.png`로 바꾼다.
- [ ] **Step 6:** SVG/font/overflow/endpoint/sequence/PNG audit와 full-size 검수를 stem별로 실행한다.
- [ ] **Step 7:** `node --test tests/ecosystem/blog-diagram-locales.test.mjs`의 실패 수가 정확히 42개 stem만큼 감소했는지 확인하고 배치를 커밋한다.

## Task 6: Exposed 16개 전환

**Files:**
- Modify: `scripts/generate-exposed-part1-assets.mjs`
- Modify: matching `public/assets/bluetape4k-exposed-*.svg` and `.png`
- Modify: matching paired Exposed MDX.

- [ ] **Step 1:** 16개 diagram data에 `labels.en`/`labels.ko`를 작성한다.
- [ ] **Step 2:** generator로 `-en`/`-ko` SVG·PNG를 재생성한다.
- [ ] **Step 3:** paired MDX 참조를 locale suffix로 전환한다.
- [ ] **Step 4:** 16개 한국어 render를 full-size로 검사하고 audit을 통과시킨다.
- [ ] **Step 5:** locale test의 remaining failure가 16개 stem만큼 감소했는지 확인하고 커밋한다.

## Task 7: AWS 15개 전환

**Files:**
- Modify: `scripts/generate-aws-part2-assets.mjs`
- Modify: `scripts/generate-aws-part3-assets.mjs`
- Modify: `scripts/generate-aws-part4-assets.mjs`
- Modify: `scripts/generate-aws-part5-assets.mjs`
- Modify: matching `public/assets/bluetape4k-aws-*.svg` and `.png`
- Modify: matching paired AWS MDX.

- [ ] **Step 1:** 15개 diagram source에 locale label을 추가한다.
- [ ] **Step 2:** 네 generator로 두 locale SVG·PNG를 재생성한다.
- [ ] **Step 3:** paired MDX를 locale suffix로 전환한다.
- [ ] **Step 4:** AWS service name, API, benchmark 값은 영어 식별자로 보존했는지 확인한다.
- [ ] **Step 5:** 모든 audit/full-size 검수와 locale test delta를 확인하고 커밋한다.

## Task 8: Graph 15개 전환

**Files:**
- Modify: `scripts/generate-graph-series-assets.mjs`
- Modify: matching `public/assets/bluetape4k-graph-*.svg` and `.png`
- Modify: matching paired Graph MDX.

- [ ] **Step 1:** architecture, selection, ERD, sequence, chart data에 locale label을 추가한다.
- [ ] **Step 2:** Graphviz intermediate와 canonical SVG·PNG를 locale suffix로 생성한다.
- [ ] **Step 3:** paired MDX를 locale suffix로 전환한다.
- [ ] **Step 4:** ERD table text, sequence endpoint, chart axis가 한국어에서도 겹치지 않는지 full-size 검사한다.
- [ ] **Step 5:** 관련 audit과 locale test delta를 확인하고 커밋한다.

## Task 9: Leader 14개 전환

**Files:**
- Modify: `public/assets/bluetape4k-leader-*.svg` and `.png`
- Create: `public/assets/bluetape4k-leader-overview-01-en.svg`
- Create: `public/assets/bluetape4k-leader-overview-01-ko.svg`
- Modify: matching paired Leader MDX.

- [ ] **Step 1:** sibling repo에서 찾은 six `examples-*-architecture-01.svg`를 의미 source로 사용해 locale canonical SVG를 작성한다.
- [ ] **Step 2:** SVG source가 없는 `bluetape4k-leader-overview-01`은 글과 현재 소스 구조를 근거로 새로 그린다.
- [ ] **Step 3:** 나머지 Leader SVG를 `-en`으로 이동하고 한국어 counterpart를 작성한다.
- [ ] **Step 4:** paired MDX를 locale suffix로 전환한다.
- [ ] **Step 5:** backend 비교 chart의 수치와 단위를 보존하고 14개 full-size/audit 검증 후 커밋한다.

## Task 10: JaVers 11개 전환

**Files:**
- Modify: `scripts/generate-javers-series-assets.mjs`
- Modify: matching `public/assets/bluetape4k-javers-*.svg` and `.png`
- Modify: matching paired JaVers MDX.

- [ ] **Step 1:** Part 4의 기존 3쌍은 Task 4 결과를 유지하고 나머지 8개 generator label을 locale별로 작성한다.
- [ ] **Step 2:** 11개 전체에 canonical suffix가 존재하도록 재생성한다.
- [ ] **Step 3:** paired MDX를 locale suffix로 전환한다.
- [ ] **Step 4:** audit/full-size 검수와 locale test delta를 확인하고 커밋한다.

## Task 11: Clinic appointment 10개 전환 확인

**Files:**
- Modify: matching Clinic MDX.
- Verify: `public/assets/clinic-appointment-*-en.svg`
- Verify: `public/assets/clinic-appointment-*-ko.svg`

- [ ] **Step 1:** Task 4에서 이름을 정규화한 10개 쌍의 MDX parity를 확인한다.
- [ ] **Step 2:** Part 6·7을 포함한 한국어 SVG가 `goorm Sans` 계약과 overflow audit을 통과하는지 다시 확인한다.
- [ ] **Step 3:** 10개 full-size render와 locale test delta를 확인하고 커밋한다.

## Task 12: Cache 8개 전환

**Files:**
- Modify: `scripts/generate-cache-series-diagrams.mjs`
- Modify: matching `public/assets/bluetape4k-cache-*.svg` and `.png`
- Modify: matching paired Cache MDX.

- [ ] **Step 1:** 8개 data label을 locale별로 작성하고 cache/API identifiers는 보존한다.
- [ ] **Step 2:** canonical 두 locale SVG·PNG를 재생성한다.
- [ ] **Step 3:** paired MDX를 locale suffix로 전환한다.
- [ ] **Step 4:** audit/full-size 검수와 locale test delta를 확인하고 커밋한다.

## Task 13: Projects 8개 전환

**Files:**
- Modify: `scripts/generate-projects-part4-6-assets.mjs`
- Modify: matching `public/assets/bluetape4k-projects-*.svg` and `.png`
- Modify: matching paired Projects MDX.

- [ ] **Step 1:** 8개 source label을 locale별로 작성한다.
- [ ] **Step 2:** canonical 두 locale SVG·PNG를 재생성한다.
- [ ] **Step 3:** paired MDX를 locale suffix로 전환한다.
- [ ] **Step 4:** Spring Boot, Ktor, module identifiers와 관계가 보존됐는지 확인한다.
- [ ] **Step 5:** audit/full-size 검수와 locale test delta를 확인하고 커밋한다.

## Task 14: Skills / workflow 7개 전환

**Files:**
- Modify: matching `public/assets/*workflow*.svg`, `public/assets/*skill*.svg` and PNG.
- Modify: matching paired Skills/workflow MDX.

- [ ] **Step 1:** run/lane/DoD/skill identifiers를 보존하면서 독자용 문구를 한국어로 작성한다.
- [ ] **Step 2:** canonical 두 locale SVG·PNG를 생성한다.
- [ ] **Step 3:** paired MDX를 locale suffix로 전환한다.
- [ ] **Step 4:** sequence/endpoint audit와 full-size 검수, locale test delta를 확인하고 커밋한다.

## Task 15: Text 4개 전환

**Files:**
- Modify: matching `public/assets/bluetape4k-text-*.svg` and `.png`
- Modify: matching paired Text MDX.

- [ ] **Step 1:** tokenizer/search/storage 기술 식별자를 보존하고 4개 한국어 SVG를 작성한다.
- [ ] **Step 2:** canonical PNG를 렌더링하고 paired MDX를 locale suffix로 전환한다.
- [ ] **Step 3:** audit/full-size 검수와 locale test delta를 확인하고 커밋한다.

## Task 16: 무접미사 자산 제거와 전체 검증

**Files:**
- Delete: migrated unsuffixed technical SVG/PNG under `public/assets/`
- Modify: `tests/ecosystem/blog-diagram-locales.test.mjs` only if final inventory exposes a real contract gap.

- [ ] **Step 1: 내부 참조가 없는 migrated unsuffixed technical assets를 제거한다**

Run before deletion:

```bash
rg -n '/assets/[^"]+(?<!-en)(?<!-ko)\.png' src/content/docs/blog src/content/docs/ko/blog --pcre2
```

Expected: 기술 figure에는 결과가 없고 hero/screenshot만 남는다.

- [ ] **Step 2: locale contract test를 green으로 만든다**

Run:

```bash
node --test tests/ecosystem/blog-diagram-locales.test.mjs
```

Expected: 2 tests PASS, 0 FAIL, 150 technical stems verified.

- [ ] **Step 3: diagram audit 전체를 실행한다**

Run:

```bash
all_locale_svgs=(public/assets/*-en.svg public/assets/*-ko.svg)
xmllint --noout "${all_locale_svgs[@]}"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py "${all_locale_svgs[@]}"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py "${all_locale_svgs[@]}"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py "${all_locale_svgs[@]}"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py "${all_locale_svgs[@]}"
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-sequence-style-audit.py "${all_locale_svgs[@]}"
file public/assets/*-en.png public/assets/*-ko.png
```

Expected: 대상 300 SVG가 XML/audit를 통과하고 matching PNG가 모두 유효한 PNG image로
보고된다. 다이어그램 종류상 적용되지 않는 type-specific audit은 해당 파일 목록을
분리해 실행하고 그 목록과 결과를 PR evidence에 기록한다.

- [ ] **Step 4: 저장소 전체 테스트와 build를 실행한다**

Run:

```bash
git diff --check
npm test
npm run build
```

Expected: diff check clean, 143개 이상의 Node tests PASS, Astro check/build 성공.

- [ ] **Step 5: 변경 route를 locale별로 smoke check한다**

Run:

```bash
npm run preview -- --host 127.0.0.1
```

대표 11개 family의 영어/한국어 route를 열어 image request 200, locale suffix, lightbox title, full-size 확대를 확인한다.

- [ ] **Step 6: 최종 migration commit을 만든다**

```bash
git add public/assets scripts src/content/docs tests docs/superpowers/plans
git commit -m "Complete explicit locale pairs for blog diagrams" \
  -m "Constraint: Meaning and readability take priority over preserving prior diagram geometry
Rejected: Shared English diagrams in Korean posts | They make localization incomplete and hide asset ownership
Confidence: high
Scope-risk: broad
Directive: Keep every technical diagram as explicit en and ko SVG and PNG pairs
Tested: Diagram audits; full-size visual review; npm test; npm run build; representative locale routes
Not-tested: Browser combinations outside the representative desktop and mobile route checks"
```

## Task 17: PR, CI, review와 merge gate

**Files:**
- Reference: all committed changes on `codex/blog-diagram-locale-program`

- [ ] **Step 1: branch를 push하고 영어 PR을 생성한다**

PR body에는 Issue link, batch별 수량, asset 총계, removed unsuffixed count, audit 결과,
full-size review 방식, test/build/route evidence를 기록한다. 마지막 section은 반드시
`## DoD Status`다.

- [ ] **Step 2: Issue metadata를 PR에 맞춘다**

PR assignee, labels, milestone을 Issue와 동일하게 맞춘다.

- [ ] **Step 3: CI와 review thread를 검증한다**

Run:

```bash
gh pr view --json number,url,state,body,assignees,labels,milestone,statusCheckRollup,reviews,reviewDecision
pr_number="$(gh pr view --json number --jq .number)"
gh api graphql -f query='query($owner:String!,$repo:String!,$number:Int!){repository(owner:$owner,name:$repo){pullRequest(number:$number){reviewThreads(first:100){nodes{isResolved}}}}}' \
  -F owner=bluetape4k -F repo=bluetape4k.github.io -F number="$pr_number"
```

Expected: required checks success, unresolved actionable thread 0, PR body final section `## DoD Status`.

- [ ] **Step 4: merge-ready evidence를 사용자에게 보고하고 fresh approval을 받는다**

보고에는 정확한 PR 번호/URL, head SHA, CI, review/thread, test/build/visual 수치를 포함한다.
승인 전에는 merge하지 않는다.

- [ ] **Step 5: 승인 후 merge, deploy 확인, local sync와 worktree cleanup을 완료한다**

병합 후 GitHub Pages deployment가 성공했는지 확인하고 `develop`을 fast-forward sync한다.
merged branch worktree를 제거하고 local/remote parity를 검증한다.

## Self-Review

- Spec coverage: 150개 범위, `-en`/`-ko` naming, font, technical identifier 보존,
  한국어 layout 재설계, PNG-only source 복구, hero 제외, 자동 회귀 테스트, Issue/PR,
  CI/build/route/visual QA가 Task 1~17에 대응한다.
- Placeholder scan: 임시 구현 표기나 나중 작업으로 미루는 지시가 없다.
- Type consistency: test helper `technicalAssets`, locale suffix 제거 규칙,
  generator `labels.en`/`labels.ko`, output `${name}-${locale}` 계약이 전 작업에서
  동일하다.
