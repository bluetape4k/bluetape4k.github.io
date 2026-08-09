# 이미지 인텔리전스 Part 4 구현 계획

> **For agentic workers:** 이 계획은 `bluetape-writer`의 기술 블로그 계약과 부모 `bluetape-workflow` Type-E gate를 따라 작업한다. 각 단계는 체크박스로 추적하고, 본문을 수정하기 전에 현재 source와 설계 문서의 claim ledger를 다시 대조한다.

**Goal:** `bluetape4k-image`의 검출 facts와 방문증 처리 policy를 분리해 설명하는 한국어·영어 Part 4 글을 작성하고, 기존 Part 1~3의 series navigation을 새 route에 연결한다.

**Architecture:** 새 MDX route 두 개를 만들고, 기존 Part 1~3의 마지막 series navigation만 실제 Part 4 링크로 갱신한다. 본문은 `ImageDetector`/`DetectionResult`의 사실 계약, `VisitorPassPolicy`의 결정 순서, `SensitiveModerationPolicy`의 renderer-neutral action 경계를 source link와 짧은 코드·표로 설명한다. 사용자가 새 시각 자료를 제외했으므로 새 diagram·chart·hero raster는 만들지 않고 기존 Part 1 hero raster를 재사용한다.

**Tech Stack:** Astro 6, Starlight, MDX, Kotlin source/test links, `npm run build`, `git diff --check`.

---

## 변경 파일 지도

- Create: `src/content/docs/ko/blog/image-intelligence-part4-detection-policy-separation.mdx` — 한국어 primary article.
- Create: `src/content/docs/blog/image-intelligence-part4-detection-policy-separation.mdx` — 한국어 승인 후의 영어 parity article.
- Modify: `src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx` — Part 4 실제 KO 링크.
- Modify: `src/content/docs/ko/blog/image-intelligence-part2-input-qualification-and-single-decode.mdx` — Part 4 실제 KO 링크.
- Modify: `src/content/docs/ko/blog/image-intelligence-part3-ocr-integrated-response.mdx` — Part 4 실제 KO 링크와 연결 문장.
- Modify: `src/content/docs/blog/image-intelligence-part1-multi-analysis-boundaries.mdx` — Part 4 실제 EN 링크.
- Modify: `src/content/docs/blog/image-intelligence-part2-input-qualification-and-single-decode.mdx` — Part 4 실제 EN 링크.
- Modify: `src/content/docs/blog/image-intelligence-part3-ocr-integrated-response.mdx` — Part 4 실제 EN 링크와 연결 문장.
- Do not modify: `public/assets/blog/image-intelligence/**` — 새 diagram·hero·PNG/SVG를 만들지 않고 기존 Part 1 hero만 참조한다.

## Task 1: 구현 기준선과 route 계약을 다시 고정하기

**Files:** read-only source and plan/design documents.

- [ ] **Step 1: 기준선 확인**

  Run from the isolated worktree:

  ```bash
  git status --short --branch
  git log -1 --oneline
  gh issue view 201 --repo bluetape4k/bluetape4k.github.io --json number,title,state,url
  ```

  Expected: branch is `codex/issue-201-image-intelligence-part4-policy-boundaries`, base is the merged `origin/develop`, issue `#201` is open, and no unrelated dirty path is part of the change.

- [ ] **Step 2: source anchors re-read**

  Read these exact current `develop` files before prose editing:

  ```text
  /Users/debop/work/bluetape4k/bluetape4k-image/images/src/main/kotlin/io/bluetape4k/images/detection/ImageDetection.kt
  /Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/VisitorPassPolicy.kt
  /Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/src/test/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/VisitorPassPolicyTest.kt
  /Users/debop/work/bluetape4k/bluetape4k-image/images/src/main/kotlin/io/bluetape4k/images/moderation/SensitiveContentPolicy.kt
  /Users/debop/work/bluetape4k/bluetape4k-image/images/src/main/kotlin/io/bluetape4k/images/moderation/SensitiveContentModels.kt
  ```

  Expected: identifiers and precedence match `docs/superpowers/specs/2026-08-10-image-intelligence-part4-policy-boundaries-design.md`; if source drift appears, stop prose and update the claim ledger or file a source-drift issue.

## Task 2: 한국어 Part 4 초안 작성

**Files:** create `src/content/docs/ko/blog/image-intelligence-part4-detection-policy-separation.mdx`.

- [ ] **Step 1: frontmatter와 기존 hero metadata 작성**

  Use this frontmatter shape and keep API tokens unchanged:

  ```mdx
  ---
  title: "이미지 검출 결과와 처리 정책을 분리하라: 사실·조치·검토의 경계"
  description: 방문증 이미지의 검출 사실을 confidence·geometry·detector 정보로 보존하고, 흐림·거부·격리·수동 검토 정책과 분리하는 방법을 설명합니다.
  sidebar:
    order: -202608101200
  blog:
    date: 2026-08-10T12:00:00+09:00
    image: /assets/blog/image-intelligence/part1/image-intelligence-part1-hero.png
    imageAlt: 방문증 이미지가 OCR, 객체 검출, QR 처리와 별도 정책 판단으로 나뉘는 어두운 3D 작업대
    cardDescription: "검출기가 보고한 사실과 방문증 업무 정책을 분리해 오탐·미탐과 수동 검토 경계를 보존합니다."
    tags: ["architecture","image","kotlin","practical-example","resilience","spring"]
  ---
  ```

  Expected: `blog.image` points to the already-published Part 1 hero, and no new asset path is introduced.

- [ ] **Step 2: 문제와 detector fact 섹션 작성**

  Start with a visitor-pass scenario and then include this shortened source-grounded example:

  ```kotlin
  DetectionResult(
      label = "face",
      category = DetectionCategory.FACE,
      confidence = 0.96,
      detector = DetectorIdentity(name = "fixture-detector"),
      region = faceRegion,
  )
  ```

  Explain that the result preserves label, category, confidence, detector identity, optional geometry, raw backend label, and metadata. State explicitly that it does not select `BLUR`, `MOSAIC`, `REJECT`, `QUARANTINE`, or `MANUAL_REVIEW`.

- [ ] **Step 3: confidence·geometry·오탐/미탐 경계 작성**

  Explain `DetectionOptions(minimumConfidence, categories, labels)` as a deterministic filter, not an accuracy guarantee. Cover pixel/normalized geometry, false positive, false negative, route-specific risk, and application-owned threshold/review policy. Link `ImageDetection.kt` and `ImageDetectionTest.kt`.

- [ ] **Step 4: `VisitorPassPolicy` decision table and code path 작성**

  Include this exact decision order, preserving action tokens:

  | 조건 | action |
  | --- | --- |
  | `SENSITIVE_REGION` detected | `QUARANTINE` |
  | completed barcode contains a non-visitor QR | `REJECT` |
  | OCR/detection/barcode is `Failed` or `Unavailable` | `MANUAL_REVIEW` |
  | exactly one face, exactly one visitor QR, non-blank completed OCR | `ALLOW` |
  | otherwise | `MANUAL_REVIEW` |

  Explain why policy precedence is application-specific and link `VisitorPassPolicy.kt` and `VisitorPassPolicyTest.kt`.

- [ ] **Step 5: `Empty`와 `Failed` 테스트 근거 작성**

  Explain that empty detection means the detector ran and found no result, while failed detection means the provider could not produce a result. Preserve the example reasons `FACE_COUNT_REQUIRES_REVIEW` and `DETECTION_FAILED`; do not collapse them to `[]` or a generic null.

- [ ] **Step 6: moderation action boundary 작성**

  Include a compact action list:

  ```kotlin
  SensitiveTreatmentAction.BLUR
  SensitiveTreatmentAction.MOSAIC
  SensitiveTreatmentAction.SOLID_MASK
  SensitiveTreatmentAction.DROP
  SensitiveTreatmentAction.REJECT
  SensitiveTreatmentAction.QUARANTINE
  SensitiveTreatmentAction.MANUAL_REVIEW
  ```

  Explain renderer-neutral parameters (`blurRadius`, `mosaicBlockSize`, `maskOpacity`, `reviewPriority`, `rejectReason`), action precedence, fail-closed fallback, and the caller-owned rendering/storage/rejection side effects. Preserve the user preference that development terms such as `Circuit Breaker` remain in English if mentioned; avoid translating the token.

- [ ] **Step 7: provider boundary·비목표·시리즈 navigation 작성**

  State that `demo` uses fixture OCR/detection and real ZXing, while production ML detector runtime, model quality, model version, drift monitoring, and process isolation belong to the application. Close with Part 1–7 links, linking Part 1–3 and leaving future Part 5–7 as route-aware links or clearly marked upcoming entries. Link the README.ko.md and preceding Part 2/3 articles without repeating their contracts.

- [ ] **Step 8: 한국어 초안 정적 검증**

  Run:

  ```bash
  git diff --check
  rg -n "ImageDetector|DetectionResult|VisitorPassPolicy|SensitiveTreatmentAction|image-intelligence-part4" src/content/docs/ko/blog/image-intelligence-part4-detection-policy-separation.mdx
  ```

  Expected: no whitespace errors; source identifiers, action tokens, and route are present. Do not start English localization until the Korean draft is reviewed.

## Task 3: 기존 한국어 series navigation 연결

**Files:** modify the KO Part 1, Part 2, and Part 3 files listed in the file map.

- [ ] **Step 1: replace placeholder Part 4 entries**

  Replace each plain Part 4 bullet with:

  ```md
  - [Part 4: 이미지 검출 결과와 처리 정책을 분리하라](/ko/blog/image-intelligence-part4-detection-policy-separation/)
  ```

- [ ] **Step 2: preserve surrounding part order and Part 3 teaser**

  Keep Part 1, Part 2, Part 3, Part 5, Part 6, and Part 7 in the existing order. In Part 3, retain the sentence that says Part 4 examines the policy boundary and make its wording point to the linked route without adding a second explanation of OCR.

- [ ] **Step 3: verify KO link inventory**

  Run:

  ```bash
  rg -n "image-intelligence-part4-detection-policy-separation|Part 4:" src/content/docs/ko/blog/image-intelligence-part{1-multi-analysis-boundaries,2-input-qualification-and-single-decode,3-ocr-integrated-response}.mdx src/content/docs/ko/blog/image-intelligence-part4-detection-policy-separation.mdx
  ```

  Expected: all three existing posts contain the real Part 4 route, and the new post contains its own current Part 4 marker plus future series entries.

## Task 4: 한국어 확인 후 영어 parity 작성

**Files:** create `src/content/docs/blog/image-intelligence-part4-detection-policy-separation.mdx` and modify the EN Part 1–3 files.

- [ ] **Step 1: localize the approved Korean structure**

  Preserve the same route slug, source anchors, field names, action tokens, table rows, caveats, and code snippets. Use English technical prose rather than literal sentence translation. Keep `Circuit Breaker`, `ImageDetector`, `DetectionResult`, `VisitorPassPolicy`, `SensitiveModerationPolicy`, `Empty`, `Failed`, `Unavailable`, and `Manual Review` identifiers as the source contract requires.

- [ ] **Step 2: reuse the same existing hero path**

  Use `/assets/blog/image-intelligence/part1/image-intelligence-part1-hero.png` in English frontmatter and no new EN asset. Keep English `imageAlt` and `cardDescription` semantically aligned with Korean.

- [ ] **Step 3: link EN Part 4 in existing series posts**

  Replace the Part 4 placeholder in EN Part 1–3 with:

  ```md
  - [Part 4: Keep Detection Facts Separate from Processing Policy](/blog/image-intelligence-part4-detection-policy-separation/)
  ```

  Preserve the existing Part 5–7 order and the Part 3 teaser sentence.

- [ ] **Step 4: run parity inventory**

  Run:

  ```bash
  rg -n "image-intelligence-part4-detection-policy-separation|Part 4" src/content/docs/{ko/,}blog/image-intelligence-part{1-multi-analysis-boundaries,2-input-qualification-and-single-decode,3-ocr-integrated-response,4-detection-policy-separation}.mdx
  ```

  Expected: both locales contain one Part 4 route, matching part order, the same source classes/tests, and the same action/state tokens.

## Task 5: site build, routes, links, and no-asset verification

**Files:** no additional source changes unless a validation failure identifies a scoped MDX fix.

- [ ] **Step 1: run whitespace and repository tests**

  ```bash
  git diff --check
  npm test
  ```

  Expected: both commands exit 0. If `npm test` exposes an unrelated pre-existing failure, record the exact test and keep the article gate open only after a targeted content check passes.

- [ ] **Step 2: build the site**

  ```bash
  npm run build
  ```

  Expected: `astro check` and `astro build` complete with exit 0 and the two new route pages are emitted.

- [ ] **Step 3: verify emitted routes and source links**

  ```bash
  test -f dist/ko/blog/image-intelligence-part4-detection-policy-separation/index.html
  test -f dist/blog/image-intelligence-part4-detection-policy-separation/index.html
  rg -n "검출 사실|Detection Facts|VisitorPassPolicy|SensitiveModerationPolicy|QUARANTINE|MANUAL_REVIEW" dist/ko/blog/image-intelligence-part4-detection-policy-separation/index.html dist/blog/image-intelligence-part4-detection-policy-separation/index.html
  ```

  Expected: both route files exist and contain the locale-specific article text plus action/source identifiers.

- [ ] **Step 4: verify navigation and asset scope**

  ```bash
  rg -n "href=\"/(ko/)?blog/image-intelligence-part4-detection-policy-separation/\"" dist/ko/blog/image-intelligence-part{1-multi-analysis-boundaries,2-input-qualification-and-single-decode,3-ocr-integrated-response}/index.html dist/blog/image-intelligence-part{1-multi-analysis-boundaries,2-input-qualification-and-single-decode,3-ocr-integrated-response}/index.html
  git status --short
  git diff --name-only origin/develop...HEAD
  ```

  Expected: all six preceding locale pages link to the new route; changed paths contain only the two new MDX files and six navigation edits (plus the already committed plan/spec outside the article diff); `public/assets/blog/image-intelligence/**` is unchanged.

- [ ] **Step 5: record visual N/A evidence**

  Confirm the user-approved scope: no new diagram, chart, overlay, SVG, or PNG was generated. The existing Part 1 hero path is present and served by the build. Report `BLOG-07` as N/A for generated visual inspection with this concrete evidence.

## Task 6: final review and scoped commit

- [ ] **Step 1: inspect the final diff**

  ```bash
  git diff --stat origin/develop...HEAD
  git diff --check
  git diff -- src/content/docs/ko/blog/image-intelligence-part4-detection-policy-separation.mdx src/content/docs/blog/image-intelligence-part4-detection-policy-separation.mdx
  ```

  Expected: Korean and English articles have the same section order and facts; no unsupported model accuracy, storage, rendering, or deployment claim remains; no unrelated path is changed.

- [ ] **Step 2: commit the article changes**

  Use a Korean Lore commit message:

  ```text
  검출 사실과 처리 정책을 분리해 Part 4의 운영 경계를 설명한다

  Constraint: Issue #201의 Part 4 source-grounded bilingual blog scope and no-new-visual approval
  Rejected: detector 내부에 blur/reject policy를 넣는 구성 | 사실과 업무 결정을 다시 결합함
  Confidence: high
  Scope-risk: narrow
  Directive: production detector 정확도와 side effect는 application 책임으로 유지한다
  Tested: npm test; npm run build; route, navigation, link, diff checks
  Not-tested: new diagram or raster visual inspection (user-approved N/A)
  ```

  Expected: commit contains only the article and navigation changes; the design and plan commits remain separate history entries.

- [ ] **Step 3: report the DoD boundary**

  Report changed files, KO/EN parity, build and route evidence, `BLOG-07` N/A reason, exact head SHA, and that PR/merge/deploy remain outside this request unless separately authorized.
