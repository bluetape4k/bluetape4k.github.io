# Korean Blog Proofreading Batch 01 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** 게시일이 가장 오래된 한국어 블로그 글 두 편을 자연스러운 기술 한국어로 교정하고, 포함된 기술 다이어그램을 locale별 dark style 자산으로 검증한다.

**Architecture:** 글의 주장·수치·식별자·링크를 보존한 채 문장 단위로 교정한다. ai-collaboration-process는 -en과 -ko SVG를 각각 editable source로 유지하고, 같은 여섯 단계와 feedback 관계를 dark style PNG로 렌더링한다. 반복 문제는 증거를 분류한 뒤 조건을 충족할 때만 chezmoi 관리 원본의 bluetape-writer 체크리스트에 RED/GREEN으로 반영한다.

**Tech Stack:** Astro Starlight, MDX, SVG, CairoSVG, Node.js test runner, bluetape-writer, bluetape-diagram, chezmoi

---

## 파일 구조

- Modify: src/content/docs/ko/blog/ai-assisted-library-development.mdx — 첫 번째 글의 기술 한국어 교정. hero는 바꾸지 않는다.
- Modify: src/content/docs/ko/blog/ai-collaboration-environment.mdx — 두 번째 글의 한국어 교정과 figure metadata 동기화.
- Modify: src/content/docs/blog/ai-collaboration-environment.mdx — 영어 figure의 title UI만 동기화한다.
- Modify: public/assets/ai-collaboration-process-ko.svg, public/assets/ai-collaboration-process-ko.png — 한국어 dark SVG와 CairoSVG PNG.
- Modify: public/assets/ai-collaboration-process-en.svg, public/assets/ai-collaboration-process-en.png — 영어 dark SVG와 CairoSVG PNG.
- Modify: tests/ecosystem/diagram-lightbox.test.mjs — 새 figure title이 기술 다이어그램에만 적용되는지 회귀 검증.
- Conditionally modify: /Users/debop/.local/share/chezmoi/private_dot_codex/skills/bluetape-writer/references/korean-naturalness-checklist.md — 반복 또는 중대한 교정 문제가 입증될 때만 갱신한다.

## 공통 불변식

- 숫자, 날짜, 버전, 명령, 경로, URL, 코드, API, 클래스·함수·설정 키, 제품·프레임워크 이름은 바꾸지 않는다.
- 대표 이미지와 일반 스크린샷은 dark style·locale 분리 대상이 아니다.
- 기술 figure는 bt4k-architecture에 남기며 한국어 글은 -ko.png, 영어 글은 -en.png를 참조한다.
- SVG는 원본이며 PNG는 CairoSVG -s 2 검토 결과물이다.
- 다이어그램의 정보 모델은 Goal → Context → Routing → Execution → Verification → Memory → Goal로 유지한다.

### Task 1: 교정 기준과 의미 보존 장부를 고정한다

**Files:**

- Read: docs/superpowers/specs/2026-07-27-korean-blog-proofreading-batch-01-design.md
- Read: src/content/docs/ko/blog/ai-assisted-library-development.mdx
- Read: src/content/docs/ko/blog/ai-collaboration-environment.mdx
- Read: public/assets/ai-collaboration-process-{ko,en}.svg

- [ ] **Step 1: 시작 조건과 범위를 다시 확인한다**

Run:

    git status --short
    git log -1 --oneline
    sed -n '1,240p' docs/superpowers/specs/2026-07-27-korean-blog-proofreading-batch-01-design.md

Expected: docs/korean-proofreading-batch-01 branch에서 설계 문서 외의 기존 사용자 변경은 없다.

- [ ] **Step 2: 보존해야 할 근거 문자열을 기록한다**

Run:

    rg -n 'Spring Boot 3/4|Exposed JDBC/R2DBC|Testcontainers|libvips|Type A Full Feature|\.omx/state|docs/lessons' \
      src/content/docs/ko/blog/ai-assisted-library-development.mdx \
      src/content/docs/ko/blog/ai-collaboration-environment.mdx

Expected: 다음 항목이 교정 전후에 모두 남는다.

    Claude Code, Codex, bluetape4k, Spring Boot 3/4, Ktor, Exposed JDBC/R2DBC,
    GitHub Actions, Dependabot, Testcontainers, libvips, AGENTS.md, CLAUDE.md,
    qmd, memory, hooks, Type A Full Feature, B Fast Track, C Bug Fix,
    D Code Review, E Maintenance, P Publish, F Self Improve

- [ ] **Step 3: 다이어그램의 reader question을 고정한다**

ai-collaboration-process는 시간순 API 호출이 아니라 AI 협업 환경을 이루는 여섯 책임과 feedback 관계를 설명하는 flow-style architecture다. bt4k-architecture, common.md, architecture.md 규칙을 적용한다.

### Task 2: 첫 번째 글을 자연스러운 기술 한국어로 교정한다

**Files:**

- Modify: src/content/docs/ko/blog/ai-assisted-library-development.mdx

- [ ] **Step 1: 번역체·구어체 후보를 식별한다**

Run:

    rg -n 'repository|workflow|coverage|edge case|research|pilot|module|public API|benchmark|latency|allocation|learning path|guardrail' \
      src/content/docs/ko/blog/ai-assisted-library-development.mdx

Expected: 독자용 설명에 남은 일반 영문과 직역 어순 후보만 표시한다. backtick 식별자와 제품 이름은 제외한다.

- [ ] **Step 2: 문장만 최소 범위로 교정한다**

apply_patch로 일반 독자용 표현을 문맥에 맞는 기술 한국어로 바꾼다.

    repository → 저장소              workflow → 작업 흐름 또는 워크플로
    test coverage → 테스트 범위      edge case → 경계 사례
    research/pilot → 조사/시범 구현  learning path → 학습 경로
    guardrail → 보호 장치 또는 방지 장치

“도움이 됐다”, “바로”, “금방”처럼 구어적 연결이 반복되면 주체·행위·근거가 드러나는 문장으로 바꾼다. hero의 src, 영어 alt, 대표 이미지는 건드리지 않는다.

- [ ] **Step 3: 보존 항목과 diff를 검토한다**

Run:

    git diff -- src/content/docs/ko/blog/ai-assisted-library-development.mdx
    rg -n 'Spring Boot 3/4|Exposed JDBC/R2DBC|Testcontainers|libvips|Type A Full Feature|Type E Maintenance|P Publish|F Self Improve' \
      src/content/docs/ko/blog/ai-assisted-library-development.mdx
    git diff --check

Expected: 기술 근거는 남고 변경은 한국어 설명에 한정된다.

- [ ] **Step 4: 첫 번째 글을 독립 커밋한다**

Run:

    git add src/content/docs/ko/blog/ai-assisted-library-development.mdx
    git diff --cached --check
    git commit -m "Clarify the Korean AI collaboration retrospective" \
      -m "Constraint: Preserve the original technical claims and identifiers.
    Rejected: Rewrite the article around current workflow terminology | this batch only proofreads the published account.
    Confidence: high
    Scope-risk: narrow
    Directive: Keep hero imagery and its English prompt-derived text outside the proofreading scope.
    Tested: diff review; invariant search; git diff --check
    Not-tested: Site rendering is verified after the paired diagram work."

Expected: commit에는 첫 번째 한국어 MDX만 들어 있다.

### Task 3: 두 번째 글의 본문과 figure 문구를 교정한다

**Files:**

- Modify: src/content/docs/ko/blog/ai-collaboration-environment.mdx
- Modify: src/content/docs/blog/ai-collaboration-environment.mdx

- [ ] **Step 1: 본문과 figure의 용어를 통일한다**

| 대상 | 표기 |
|---|---|
| workflow routing | 작업 분류와 경로 선택 |
| skill routing | skill 선택 |
| memory promotion | memory 승격 |
| durable configuration | 지속 가능한 설정 |
| runtime artifact | 실행 중 생성되는 산출물 |
| native subagent | 기본 제공 하위 에이전트 |

코드·파일명·명령·제품 이름은 번역하지 않는다. 일반 명사 repository, module, public API, edge case는 자연스러운 한국어가 가능한 문맥에서 영문으로 남기지 않는다.

- [ ] **Step 2: 한국어 figure metadata를 동기화한다**

apply_patch로 한국어 글의 제목, 설명, card description, hero caption, figure alt, figcaption을 본문 용어와 맞춘다. 기술 figure는 다음 속성을 가진다.

    <figure
      class="bt4k-architecture"
      data-diagram-title="AI 협업 환경의 반복 구조"
    >

alt는 여섯 단계를 설명하고, 캡션은 검증의 교훈이 다음 작업의 의도와 맥락으로 되돌아감을 설명한다.

- [ ] **Step 3: 영어 글의 title UI만 동등하게 맞춘다**

영어 본문은 이번 교정 범위가 아니므로 문장을 고치지 않는다. 영어 figure에는 다음 속성만 추가한다.

    <figure
      class="bt4k-architecture"
      data-diagram-title="The recurring structure of an AI collaboration environment"
    >

- [ ] **Step 4: locale figure 계약을 확인한다**

먼저 `tests/ecosystem/diagram-lightbox.test.mjs`에 한국어와 영어 글을 읽는 fixture와 아래 assertion을 추가한다. hero에는 `data-diagram-title`이 없어야 한다는 기존 규칙도 두 글에서 확인한다.

    assert.match(koAiEnvironment, /class="bt4k-architecture"\s+data-diagram-title="AI 협업 환경의 반복 구조"/);
    assert.match(enAiEnvironment, /class="bt4k-architecture"\s+data-diagram-title="The recurring structure of an AI collaboration environment"/);
    assert.doesNotMatch(koAiEnvironment, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
    assert.doesNotMatch(enAiEnvironment, /class="bt4k-blog-hero"[^>]*data-diagram-title/);

Run:

    rg -n 'data-diagram-title|ai-collaboration-process-(en|ko)\.png' \
      src/content/docs/blog/ai-collaboration-environment.mdx \
      src/content/docs/ko/blog/ai-collaboration-environment.mdx
    node --test tests/ecosystem/blog-diagram-locales.test.mjs tests/ecosystem/diagram-lightbox.test.mjs

Expected: 한국어는 -ko.png, 영어는 -en.png를 각각 한 번 참조하고 title UI contract를 충족한다.

### Task 4: 한국어와 영어 SVG를 dark style로 재설계한다

**Files:**

- Modify: public/assets/ai-collaboration-process-ko.svg
- Modify: public/assets/ai-collaboration-process-en.svg

- [ ] **Step 1: locale별 텍스트와 공통 의미를 고정한다**

두 SVG는 다음을 같은 순서로 보여야 한다.

    01 Goal       → desired outcome, constraints, success condition, stop condition
    02 Context    → AGENTS.md, CLAUDE.md, qmd, repository docs and code
    03 Routing    → workflow lane, skill, bounded agent work
    04 Execution  → edit, test, review, ownership boundary
    05 Verification → diagnostics, build, target tests, review, evidence
    06 Memory     → lessons, specs, plans, decisions in durable documentation
    Memory → Goal → lessons from verification shape the next task

한국어 제목은 AI 협업 환경의 반복 구조, 부제는 의도·맥락·분류·실행·검증·memory가 다음 작업의 기준을 다시 만듭니다.로 한다. 영어는 이 의미를 자연스러운 기술 영어로 쓴다.

- [ ] **Step 2: dark theme·글꼴·균형 잡힌 layout을 적용한다**

    <svg width="1600" height="1040" viewBox="0 0 1600 1040" role="img" aria-labelledby="title desc">
      <!-- dark background, title region, six cards, feedback route, footer invariant -->
    </svg>

#0b1220 배경, #12213a 카드, #263954 테두리, #e6edf7 본문, #9fb2cc 보조 문구를 baseline으로 사용한다. 한국어에는 goorm Sans, goorm Sans Code; 영어에는 Architects Daughter, Comic Mono를 쓴다. 제목 40px, 단계 제목 25px, 본문 17px보다 글자를 줄이지 않는다. 상단 네 카드와 하단 두 카드는 같은 좌우 여백을 가지며 footer는 읽을 수 있는 독립 영역으로 둔다.

- [ ] **Step 3: 연결선의 명시적 기하 불변식을 적용한다**

    connector count: 6
    stage card count: 6
    primary arrowhead: 14×14 solid marker
    card inner horizontal padding: 32px 이상
    card inner vertical padding: 28px 이상

Goal → Context → Routing → Execution → Verification → Memory는 카드 경계에 직교로 붙이고, Memory → Goal feedback은 별도의 카드 경계 route로 둔다. 연결선은 카드·본문·footer를 통과하지 않으며 설명하지 못하는 label은 추가하지 않는다.

- [ ] **Step 4: SVG source를 검사한다**

Run:

    xmllint --noout public/assets/ai-collaboration-process-ko.svg
    xmllint --noout public/assets/ai-collaboration-process-en.svg
    python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py \
      public/assets/ai-collaboration-process-ko.svg \
      public/assets/ai-collaboration-process-en.svg
    rg -n 'AI 협업 환경의 반복 구조|목표|맥락|분류|실행|검증|memory' \
      public/assets/ai-collaboration-process-ko.svg
    if rg -n '[가-힣]' public/assets/ai-collaboration-process-en.svg; then exit 1; fi

Expected: XML 및 text-normalize 검사에 통과하고, 한국어 SVG에는 여섯 단계가, 영어 SVG에는 한글 없는 locale text가 있다.

### Task 5: PNG를 렌더링하고 다이어그램 품질을 검증한다

**Files:**

- Modify: public/assets/ai-collaboration-process-ko.png
- Modify: public/assets/ai-collaboration-process-en.png

- [ ] **Step 1: PNG를 canonical SVG에서 2배 렌더링한다**

Run:

    cairosvg public/assets/ai-collaboration-process-ko.svg \
      -o public/assets/ai-collaboration-process-ko.png -s 2
    cairosvg public/assets/ai-collaboration-process-en.svg \
      -o public/assets/ai-collaboration-process-en.png -s 2
    sips -g pixelWidth -g pixelHeight public/assets/ai-collaboration-process-ko.png
    sips -g pixelWidth -g pixelHeight public/assets/ai-collaboration-process-en.png

Expected: 두 PNG 모두 3200×2080이다. 글꼴 대체가 보이면 fc-cache -f와 rsvg-convert --format=svg를 temporary directory에 적용하고 canonical SVG text는 유지한다.

- [ ] **Step 2: connector·endpoint·corner geometry를 감사한다**

Run:

    python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py public/assets/ai-collaboration-process-ko.svg public/assets/ai-collaboration-process-en.svg
    python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal public/assets/ai-collaboration-process-ko.svg public/assets/ai-collaboration-process-en.svg
    python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py public/assets/ai-collaboration-process-ko.svg public/assets/ai-collaboration-process-en.svg
    python3 ~/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py public/assets/ai-collaboration-process-ko.svg public/assets/ai-collaboration-process-en.svg

Expected: 각 SVG가 connectors=6, cards=6, shared_segments=0, label_cards=0, label_labels=0, label_connectors=0, geometry_failures=0, endpoint PASS, mixed-corner failures=0을 만족한다. generic audit가 WEAK이면 <path class="connector">와 <rect class="card">를 직접 세는 fallback을 기록한다.

- [ ] **Step 3: 전체 크기 PNG를 직접 확인한다**

Codex view_image를 original detail로 열어 다음을 확인한다.

    public/assets/ai-collaboration-process-ko.png
    public/assets/ai-collaboration-process-en.png

글꼴, 잘림, 카드 여백, 동일 역할 화살촉, endpoint, feedback route, footer, 좌우·하단 여백을 확인한다. PNG가 scripts 결과와 다르면 SVG를 다시 고친다.

- [ ] **Step 4: prose와 diagram 변경을 독립 커밋한다**

Run:

    git add public/assets/ai-collaboration-process-ko.svg public/assets/ai-collaboration-process-ko.png \
      public/assets/ai-collaboration-process-en.svg public/assets/ai-collaboration-process-en.png \
      src/content/docs/ko/blog/ai-collaboration-environment.mdx \
      src/content/docs/blog/ai-collaboration-environment.mdx
    git diff --cached --check
    git commit -m "Localize the AI collaboration process in a dark visual style" \
      -m "Constraint: Keep the six collaboration responsibilities and feedback loop equivalent in both locales.
    Rejected: Keep the light shared diagram | locale text and current technical-diagram presentation require independent dark assets.
    Confidence: high
    Scope-risk: moderate
    Directive: Treat the SVG as canonical and inspect each rendered PNG at full size.
    Tested: XML; text; CairoSVG; dimensions; connector; geometry; endpoint; mixed-corner; locale; visual checks
    Not-tested: Complete site build and local browser review run after prose and skill checks converge."

Expected: commit에는 두 locale SVG/PNG와 두 locale MDX만 포함된다.

### Task 6: 반복된 교정 문제만 writer 체크리스트에 반영한다

**Files:**

- Conditionally modify: /Users/debop/.local/share/chezmoi/private_dot_codex/skills/bluetape-writer/references/korean-naturalness-checklist.md
- Conditionally modify: 해당 skill의 기존 test 또는 pressure-scenario surface

- [ ] **Step 1: diff를 유형별로 분류한다**

Run:

    git diff develop...HEAD -- src/content/docs/ko/blog/ai-assisted-library-development.mdx src/content/docs/ko/blog/ai-collaboration-environment.mdx

각 교정은 직역 어순, 일반 영문 남용, 구어체, 명사 나열, 용어 불일치, 과도한 반복 중 하나로 분류한다.

- [ ] **Step 2: 채택 또는 N/A를 증거로 결정한다**

같은 문제가 두 글에 반복되거나, 기존 체크리스트가 놓친 중대한 의미 왜곡이 있을 때만 규칙을 추가한다. 그렇지 않으면 기존 체크리스트 항목, 반복되지 않은 이유, 의미 왜곡이 없었던 이유를 최종 기록에 N/A로 남기고 live skill을 수정하지 않는다.

- [ ] **Step 3: 채택 시 RED → 최소 규칙 → GREEN을 수행한다**

기존 checklist만으로 문제를 놓치는 한국어 압박 입력과 기대 실패를 먼저 만든다. 그 뒤 관리 원본에 한 규칙과 한 예시만 추가하고, backtick 식별자·제품명·정착 기술 용어를 보존하는 반대 사례도 실행한다. RED/GREEN 없이 checklist 문구만 추가하지 않는다.

- [ ] **Step 4: chezmoi source-first 동기화를 증명한다**

Run:

    chezmoi source-path ~/.codex/skills/bluetape-writer/references/korean-naturalness-checklist.md
    chezmoi target-path /Users/debop/.local/share/chezmoi/private_dot_codex/skills/bluetape-writer/references/korean-naturalness-checklist.md
    chezmoi diff
    chezmoi apply
    diff -u /Users/debop/.local/share/chezmoi/private_dot_codex/skills/bluetape-writer/references/korean-naturalness-checklist.md ~/.codex/skills/bluetape-writer/references/korean-naturalness-checklist.md

Expected: source/live가 같고 source repository 변경은 별도 커밋으로 남는다. 채택하지 않았다면 이 단계는 N/A다.

### Task 7: 최종 한국어 교정, 사이트 검증, 로컬 검토를 마친다

**Files:**

- Verify: 두 한국어 MDX, 두 locale SVG/PNG, tests/ecosystem/blog-diagram-locales.test.mjs, tests/ecosystem/diagram-lightbox.test.mjs

- [ ] **Step 1: 최종 한국어 교정 pass를 수행한다**

두 글을 처음부터 끝까지 읽으며 번역체 어순, 일반 영문, 구어체, 불필요한 피동형, 명사 나열, 겹친 판단, 중복 문단, 본문과 figure의 용어 불일치를 확인한다. 코드·링크·수치에는 손대지 않는다.

- [ ] **Step 2: 자동 검증과 build를 실행한다**

Run:

    node --test tests/ecosystem/blog-diagram-locales.test.mjs tests/ecosystem/diagram-lightbox.test.mjs
    npm test
    npm run build
    git diff --check
    git status --short

Expected: targeted test, 전체 test, Astro check/build, diff check가 통과한다. 기존 dependency audit 결과는 범위 밖이므로 npm audit fix를 실행하지 않는다.

- [ ] **Step 3: 로컬에서 두 한국어 페이지를 검토한다**

Run:

    npm run dev -- --host 127.0.0.1

Verify:

    /ko/blog/ai-assisted-library-development/
    /ko/blog/ai-collaboration-environment/

Expected: 한국어 본문, dark 기술 다이어그램, figure title, 클릭 확대와 크게 보기 아이콘이 정상이다. hero와 스크린샷에는 확대 UI가 생기지 않는다.

- [ ] **Step 4: 최종 커밋과 로컬 검토 상태를 보고한다**

Run:

    git status --short
    git log --oneline develop..HEAD

Expected: 계획·교정·다이어그램 커밋이 확인된다. 로컬 URL, 변경 파일, PNG audit, checklist 채택/N/A, 검증 결과를 보고하고, PR·병합·배포는 사용자 별도 승인 전까지 하지 않는다.

## Plan Self-Review

| 설계 요구 | 구현 task |
|---|---|
| 오래된 두 한국어 글 처리 | Task 1–3, 7 |
| 사실과 기술 의미 보존 | Task 1–3, 7 |
| hero·스크린샷 제외 | 공통 불변식, Task 2, 7 |
| 다이어그램 한국어 교정과 dark style | Task 3–5 |
| locale별 SVG·PNG | Task 3–5 |
| 다이어그램 제목·크게 보기 UI | Task 3, 7 |
| 반복 문제의 checklist 개선 | Task 6 |
| RED/GREEN 및 chezmoi source-first | Task 6 |
| 로컬 검토만, PR·병합·배포 보류 | Task 7 |

미완성 표식, 추상적인 검증 지시, 이전 task를 참조하는 축약 지시를 사용하지 않았다. 자산 이름, figure class, PNG 크기와 locale 경로는 모든 task에서 일관된다.
