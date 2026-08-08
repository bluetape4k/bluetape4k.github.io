# 블로그 SNS 미리보기 Hero 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**목표:** 각 블로그 게시물에 이미 있는 Hero 이미지와 alt 텍스트를 SNS 링크 미리보기에 사용하고, 블로그가 아닌 페이지에는 전역 사이트 이미지를 유지한다.

**아키텍처:** `src/lib/` 아래에 순수 head 메타데이터 변환기를 추가하고, `route.entry.data.blog`가 있을 때만 기존 Starlight 라우트 미들웨어에서 호출한다. 전역 Starlight head 설정은 폴백으로 유지하고, Hero 크기가 달라지는 블로그 라우트에서만 고정 이미지 크기를 제거한다.

**기술 스택:** Astro 6, Starlight 0.39.2, TypeScript, Node test runner

---

## 워크플로 체크리스트

- [x] **WF-01 / CG-01 — 분류 및 권위 문서 재확인**
  - **작업:** Type E 유지보수로 분류하고 workspace/repo `AGENTS.md`, `bluetape-workflow`, `bluetape-maintenance`, `bluetape-writer`, 시각 규칙을 읽는다.
  - **근거:** 사용자가 2026-07-15에 권장된 기존 Hero 접근 방식을 승인했으며, 브랜치 생성 전 저장소는 `develop`에서 깨끗했다.
  - **실패 시:** 범위가 메타데이터 동작을 넘어가면 편집 전에 중단한다.
- [x] **CG-02 / E-02 — 현재 및 과거 근거 조회**
  - **작업:** 현재 미들웨어/config/frontmatter를 검사하고 `bluetape4k-docs`와 `bluetape4k-github`를 조회하며 고정된 Starlight head 병합 구현을 확인한다.
  - **근거:** 기존 계획이 이미 social-preview 정렬을 요구하고, 모든 블로그 항목이 `blog.image`를 제공하며, 현재 전역 설정이 이미지를 덮어쓴다.
  - **실패 시:** 게시물별 중복 없이 페이지별 메타데이터를 변경할 수 없으면 중단한다.
- [x] **CG-03 / CG-04 — 경계 보호**
  - **작업:** `fix/blog-social-preview-hero`를 깨끗한 `origin/develop`에서 작업하고, 이중 언어 콘텐츠는 변경하지 않으며 PR/push/merge는 제외한다.
  - **근거:** 범위 파일은 설계/계획, 변환기, 미들웨어, 회귀 테스트다.
  - **실패 시:** 무관한 변경을 보존하고 예상하지 못한 dirty 경로가 있으면 중단한다.
- [x] **E-01 / CG-05 — 라우트 지원 및 재사용**
  - **작업:** 기존 라우트 미들웨어와 블로그 frontmatter를 재사용하고, 의존성을 추가하지 않으며 새 이미지를 생성하지 않는다.
  - **근거:** `src/starlightRouteData.ts`, `src/content.config.ts`, Starlight의 기존 `route.head` 계약.
  - **실패 시:** 새 렌더링 파이프라인이나 중복 frontmatter는 거부한다.
- [x] **CG-07 — RED/GREEN으로 동작 고정**
  - **작업:** 프로덕션 코드보다 먼저 실패하는 메타데이터 변환기 테스트를 작성·실행한 뒤 최소 변환기와 미들웨어 호출을 구현한다.
  - **근거:** RED는 `ERR_MODULE_NOT_FOUND`를 `src/lib/socialPreview.ts`에 대해 보고했고, GREEN은 대상 테스트 2/2를 통과했다.
  - **실패 시:** 구현부터 시작한 코드를 삭제하고 실패 테스트부터 다시 시작한다.
- [x] **E-05 / CG-08 — 유지보수 검증 실행**
  - **작업:** 대상 테스트, `npm test`, `npm run build`, 라우트 수준 HTML 단언, `git diff --check`를 순차적으로 실행한다.
  - **근거:** `npm test` 통과; `npm run build`에서 진단 0건과 1059개 페이지 빌드를 보고; 134개 라우트 감사에서 `failures=0` 보고; `git diff --check` 통과.
  - **실패 시:** 영향을 받은 검사를 수정하고 다시 실행한다.
- [x] **CG-09 / E-06 — 교훈 및 최종 검토**
  - **작업:** 최종 diff에서 재사용 가능한 교훈, P0/P1 결함, 중복 메타데이터, 범위 이탈을 검토한다.
  - **근거:** 기존 ecosystem-atlas social-preview 계획과 블로그 Hero 분리 교훈을 재사용했으며, 이 작업에는 새로운 실패·복구·설계·운영 지침이 없었다. 독립 검토 결과는 P0=0, P1=0, P2=0이었다.
  - **실패 시:** 발견 사항이 수렴할 때까지 완료 상태를 보류한다.
- [x] **CG-10 — 로컬 전달 수렴**
  - **작업:** 검증된 범위 브랜치를 Lore 형식의 메시지로 커밋한다.
  - **근거:** `fix/blog-social-preview-hero`에 Lore 형식의 로컬 커밋을 생성했으며, 최종 보고서에서 정확한 수정 후 head SHA와 깨끗한 범위 상태를 검증한다.
  - **실패 시:** 실패했거나 무관한 변경은 커밋하지 않는다.
- [x] **CG-11 through CG-18 / E-07 / E-08 — PR 전달 브랜치 (N/A)**
  - **작업:** 승인된 요청이 로컬 구현만 지정하고 PR, push, CI, review, merge 대상은 지정하지 않았으므로 N/A로 기록한다.
  - **근거:** 외부 전달 작업은 수행하지 않는다.
  - **실패 시:** 브랜치를 게시하기 전에 명시적인 PR 범위를 확보한다.

### 작업 1: 메타데이터 변환 고정

**파일:**
- 생성: `tests/ecosystem/social-preview.test.mjs`
- 생성: `src/lib/socialPreview.ts`

- [x] **1단계: 실패하는 테스트 작성**

블로그 Hero가 전역 OG/Twitter 이미지와 alt 태그를 교체하고, `twitter:image:alt`를 추가하며, 고정 OG 크기를 제거하고, 입력 배열은 변경하지 않는지 테스트한다.

- [x] **2단계: 테스트를 실행하고 RED 확인**

실행: `node --test tests/ecosystem/social-preview.test.mjs`

예상 결과: `src/lib/socialPreview.ts`가 없으므로 FAIL.

- [x] **3단계: 순수 변환기 구현**

`withBlogSocialPreview(head, blog, site)`를 `src/lib/socialPreview.ts`에서 export한다. `new URL(blog.image, site)`로 절대 이미지 URL을 만들고, 일치하는 meta 항목을 불변 방식으로 교체하며, 누락된 alt 메타데이터를 추가하고, `og:image:width`와 `og:image:height`를 필터링한다.

- [x] **4단계: 대상 테스트를 실행하고 GREEN 확인**

실행: `node --test tests/ecosystem/social-preview.test.mjs`

예상 결과: 모든 social-preview 테스트 통과.

### 작업 2: Starlight 블로그 라우트 연결

**파일:**
- 수정: `src/starlightRouteData.ts`

- [x] **1단계: 기존 미들웨어에서 블로그 메타데이터 읽기**

이미 검증된 `route.entry.data.blog` 객체를 사용한다. 게시물별 `head:` frontmatter는 추가하지 않는다.

- [x] **2단계: 블로그 라우트에만 변환기 적용**

`route.head`에 변환된 배열을 할당한다. `blog`가 있을 때만 적용하고, 그렇지 않으면 전역 폴백을 변경하지 않는다.

- [x] **3단계: 대상 및 전체 Node 테스트 실행**

실행: `node --test tests/ecosystem/social-preview.test.mjs`

실행: `npm test`

예상 결과: 두 명령이 모두 종료 코드 0으로 끝난다.

### 작업 3: 생성된 소셜 메타데이터 입증

**파일:**
- 다음 경로의 생성 파일을 검증한다: `dist/blog/`, `dist/ko/blog/`, `dist/index.html`

- [x] **1단계: 프로덕션 사이트 빌드**

실행: `npm run build`

예상 결과: Astro 검사와 빌드가 종료 코드 0으로 끝난다.

- [x] **2단계: 대표 라우트 검사**

한국어와 영어 Bluetape Skills Part 2 페이지가 `/assets/bluetape-workflow-guide-hero.png`를 절대 OG/Twitter URL로 사용하고, 로케일별 alt 텍스트를 포함하며, 고정 OG 크기를 생략하는지 단언한다. `dist/index.html`에는 `https://bluetape4k.github.io/og-image.png`와 `1200`, `630`이 유지되는지도 단언한다.

- [x] **3단계: 모든 블로그 Hero 자산 검증**

모든 EN/KO 블로그 항목에 존재하는 `blog.image` 자산이 있고, 빌드된 모든 블로그 라우트에 해당 절대 이미지 URL이 포함되는지 확인한다.

- [x] **4단계: 정리 및 검토 완료**

실행: `git diff --check`

그래프 영향 범위를 확인하고 범위 diff를 검토한다. 예상 결과: P0/P1 발견 사항이 없고 무관한 경로도 없다.
