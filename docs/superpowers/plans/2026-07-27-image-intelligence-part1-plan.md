# 이미지 인텔리전스 Part 1 블로그 작성 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 병합된 `bluetape4k-image` 통합 예제를 근거로, 한 이미지에서 OCR·객체 검출·QR 정보를 함께 추출할 때 필요한 처리 경계를 설명하는 Part 1 한·영 블로그 글과 시각 자료를 작성하고 PR까지 전달한다.

**Architecture:** 한국어 글을 먼저 작성하고 검토받은 뒤 같은 route와 기술 계약으로 영어 글을 만든다. 글은 방문증을 대표 시나리오로 사용하고, 공통 입력 자격 판정과 단일 디코딩, 독립 처리 경로, 부분 실패, 정책 분리를 중심으로 설명한다. 기존 OCR·입력 경계·이미지 성능 글은 반복하지 않고 독자가 더 읽을 자료로 연결한다.

**Tech Stack:** Astro 6, Starlight, MDX, dark-style SVG/PNG diagrams, `bluetape4k-image`, Kotlin, Spring Boot 4, `bluetape4k-workflow`, ZXing

**Delivery Boundary:** Repository `bluetape4k/bluetape4k.github.io`, base `develop`, head `docs/issue-201-image-intelligence-series`, PR creation included, merge and deployment excluded until separately approved.

---

## 파일 구조

**Create**

- `docs/review/2026-07-27-image-intelligence-part1-claim-ledger.md`
  - Part 1의 주장, 구현 근거, 기존 공개 글과 중복 처리 방식을 기록한다.
- `src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx`
  - 사용자 검토를 먼저 받을 한국어 원문이다.
- `src/content/docs/blog/image-intelligence-part1-multi-analysis-boundaries.mdx`
  - 승인된 한국어 글과 기술적으로 일치하는 영어 글이다.
- `public/assets/blog/image-intelligence/part1/image-intelligence-part1-hero.png`
  - locale 공용 대표 이미지다.
- `public/assets/blog/image-intelligence/part1/image-intelligence-processing-flow-01-ko.svg`
- `public/assets/blog/image-intelligence/part1/image-intelligence-processing-flow-01-ko.png`
- `public/assets/blog/image-intelligence/part1/image-intelligence-processing-flow-01-en.svg`
- `public/assets/blog/image-intelligence/part1/image-intelligence-processing-flow-01-en.png`
  - 입력 자격 판정부터 정책 평가까지 보여 주는 중심 다이어그램이다.
- `public/assets/blog/image-intelligence/part1/image-intelligence-visitor-pass-overlay-02-ko.svg`
- `public/assets/blog/image-intelligence/part1/image-intelligence-visitor-pass-overlay-02-ko.png`
- `public/assets/blog/image-intelligence/part1/image-intelligence-visitor-pass-overlay-02-en.svg`
- `public/assets/blog/image-intelligence/part1/image-intelligence-visitor-pass-overlay-02-en.png`
  - 한 방문증에 OCR block, 얼굴 영역, QR 영역이 공존하는 모습을 보여 준다.
- `public/assets/blog/image-intelligence/part1/image-intelligence-result-contracts-03-ko.svg`
- `public/assets/blog/image-intelligence/part1/image-intelligence-result-contracts-03-ko.png`
- `public/assets/blog/image-intelligence/part1/image-intelligence-result-contracts-03-en.svg`
- `public/assets/blog/image-intelligence/part1/image-intelligence-result-contracts-03-en.png`
  - OCR, 객체 검출, 바코드, 정책 계약을 card로 비교한다.
- `docs/review/2026-07-27-image-intelligence-part1-review.md`
  - 사실·한국어·다이어그램·locale parity·route 검증 결과를 기록한다.

**Modify**

- GitHub Issue `bluetape4k.github.io#201`
  - Part 1 PR이 준비되면 Part 1 체크박스와 PR 링크를 갱신한다.

**Do not modify**

- 기존 OCR 글과 이미지 처리 성능 글
- `src/components/DiagramLightbox.astro`와 lightbox 공통 코드
- `bluetape4k-image` 구현
- Part 2부터 Part 7의 본문

---

### Task 1: 기준선과 주장 근거를 고정한다

**Files:**

- Create: `docs/review/2026-07-27-image-intelligence-part1-claim-ledger.md`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/README.ko.md`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/ImageUploadQualifier.kt`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/ImageIntelligenceWorkflow.kt`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/ImageIntelligenceAggregator.kt`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/model/AnalysisModels.kt`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/ImageIntelligenceService.kt`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/GuardedAnalysisRunner.kt`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/config/ImageIntelligenceConfiguration.kt`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/VisitorPassPolicy.kt`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/src/test/kotlin/io/bluetape4k/images/examples/spring/intelligence/ImageIntelligenceCancellationTest.kt`
- Read: `src/content/docs/ko/blog/ocr-api-fallback-contract-bluetape4k-image.mdx`
- Read: `src/content/docs/ko/blog/from-pure-jvm-to-libvips-benchmarking-image-processing.mdx`
- Read: `src/content/docs/ko/blog/bluetape4k-dependencies-1-3-0-input-boundaries.mdx`

- [ ] **Step 1: 구현 기준 SHA와 공개 source URL을 기록한다**

Run:

```bash
git -C /Users/debop/work/bluetape4k/bluetape4k-image rev-parse develop
gh pr view 300 --repo bluetape4k/bluetape4k-image --json state,mergeCommit,url
```

Expected:

```text
develop SHA가 PR #300의 mergeCommit을 포함한다.
PR state는 MERGED다.
```

- [ ] **Step 2: claim ledger를 작성한다**

다음 표를 그대로 사용하되 `근거` 열에는 실제 `develop` source URL을 넣는다.

```markdown
| 본문 주장 | 근거 | 기존 글과의 관계 | 표현 제한 |
|---|---|---|---|
| 업로드 이미지는 분석 전에 공통 자격 판정을 통과한다 | `ImageUploadQualifier.kt` | 입력 경계 글을 링크 | OCR 가능성이나 QR 존재 여부까지 검증한다고 쓰지 않는다 |
| 이미지는 `ImmutableImage`로 한 번 디코딩된다 | `ImageUploadQualifier.kt` | 새 관점 | 원본 upload byte를 처리 경로마다 다시 읽는다고 쓰지 않는다 |
| OCR·객체 검출·QR 작업은 독립적으로 실행된다 | `ImageIntelligenceWorkflow.kt` | 새 관점 | 모든 provider가 production-ready라고 쓰지 않는다 |
| 처리 경로는 `Completed`, `Empty`, `Unavailable`, `Failed`를 구분한다 | `AnalysisModels.kt`, `ImageIntelligenceService.kt` | OCR 글의 범위를 여러 경로로 확장 | 빈 결과와 실패를 합치지 않는다 |
| 집계 상태는 `COMPLETED`, `PARTIAL`, `FAILED`다 | `ImageIntelligenceAggregator.kt` | 새 관점 | `PARTIAL`을 오류 없는 성공으로 표현하지 않는다 |
| 요청 취소는 상위 coroutine으로 전파된다 | `GuardedAnalysisRunner.kt`, cancellation tests | 새 관점 | 취소를 경로별 `Failed`로 포장한다고 쓰지 않는다 |
| 얼굴 검출은 사실이고 얼굴을 가릴지는 정책이다 | `VisitorPassPolicy.kt` | 새 관점 | production ML detector를 번들한다고 쓰지 않는다 |
| `demo`는 fixture OCR·detector와 실제 ZXing을 조합한다 | `ImageIntelligenceConfiguration.kt` | 새 관점 | fixture 결과를 실제 ML 추론 결과처럼 표현하지 않는다 |
```

- [ ] **Step 3: 중복 처리 결정을 기록한다**

claim ledger에 다음 결정을 추가한다.

```markdown
## 기존 공개 글 재사용

- OCR upload guard, Tesseract host dependency, 큰 이미지 전처리: 기존 OCR 글을 링크하고 두 문장 이내로 요약한다.
- pure JVM과 libvips 성능 비교: Part 1에서 수치를 반복하지 않고 backend 비용도 별도 선택이라는 점만 링크한다.
- multipart와 메모리 입력 경계: 공통 자격 판정의 필요성을 설명할 때 링크한다.
```

- [ ] **Step 4: ledger를 검증한다**

Run:

```bash
rg -n 'T''BD|TO''DO|FIX''ME|production-ready|만능' docs/review/2026-07-27-image-intelligence-part1-claim-ledger.md
git diff --check
```

Expected:

```text
미정 항목이 없고, "만능"은 비목표 설명에만 있다.
git diff --check가 출력 없이 성공한다.
```

- [ ] **Step 5: 근거 문서를 커밋한다**

```bash
git add docs/review/2026-07-27-image-intelligence-part1-claim-ledger.md
git commit -m "Ground the image intelligence article in merged behavior" \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: source anchors, duplicate-content ledger, git diff --check"
```

---

### Task 2: 한국어 Part 1의 읽기 흐름을 만든다

**Files:**

- Create: `src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx`
- Reference: `src/content/docs/ko/blog/ocr-api-fallback-contract-bluetape4k-image.mdx`
- Reference: `src/content/docs/ko/blog/clinic-appointment-part4-greedy-vs-global-optimization.mdx`

- [ ] **Step 1: frontmatter와 도입부를 작성한다**

다음 frontmatter를 사용한다.

```yaml
---
title: "이미지 한 장에서 여러 정보를 추출하는 API: OCR·객체 검출·QR 처리의 경계"
description: 방문증 이미지를 예로 들어 입력 자격 판정과 단일 디코딩, OCR·객체 검출·QR 병렬 처리, 부분 실패, 분석 사실과 업무 정책의 분리를 설명합니다.
sidebar:
  order: -202607271200
blog:
  date: 2026-07-27T12:00:00+09:00
  image: /assets/blog/image-intelligence/part1/image-intelligence-part1-hero.png
  imageAlt: 방문증 이미지가 공통 검증을 거친 뒤 OCR, 객체 검출, QR 처리 작업대로 나뉘고 결과가 정책 판단으로 모이는 어두운 3D 작업대
  cardDescription: "한 이미지에 섞인 텍스트, 객체 영역, QR 값을 각각 읽고 부분 실패를 보존한 뒤 업무 정책으로 연결하는 API 경계를 살펴봅니다."
---
```

도입부는 다음 질문과 범위로 시작한다.

```markdown
방문증 한 장에는 이름과 소속, 얼굴 사진, 출입용 QR 코드가 함께 들어 있습니다.
이미지는 하나지만 필요한 답은 하나가 아닙니다.

이 글은 OCR, 객체 검출, QR 판독 기능을 소개하는 목록이 아닙니다. 같은 이미지를
세 처리 경로가 읽을 때 입력을 어디서 검증하고, 한 작업이 실패해도 다른 결과를
어떻게 보존하며, 검출한 사실을 업무 결정과 어떻게 분리할지를 설명합니다.
```

- [ ] **Step 2: 본문 heading 골격을 작성한다**

다음 순서와 문구를 사용한다.

```markdown
## 한 이미지에 정보가 하나만 있는 것은 아니다
## 방문증으로 처리 경계를 고정한다
## 처리 경로는 입력만 같고 답은 다르다
## 먼저 입력 자격을 판정하고 한 번만 디코딩한다
## 독립 작업은 병렬로 실행하고 결과는 따로 남긴다
## 부분 실패를 정상 성공처럼 숨기지 않는다
## 검출한 사실과 업무 정책을 분리한다
## 이 예제가 제공하는 것과 제공하지 않는 것
## 시리즈에서 이어서 볼 내용
## 구현 코드와 자료 살펴보기
```

- [ ] **Step 3: 세 사례 비교표를 작성한다**

```markdown
| 사례 | OCR이 읽는 정보 | 객체 검출이 찾는 영역 | 바코드·QR이 읽는 값 | 정책 예시 |
|---|---|---|---|---|
| 방문증·출입증 | 이름, 소속, 방문 목적 | 얼굴이나 민감 영역 | 출입 식별자 | 허용, 수동 검토, 공개 미리보기 제한 |
| 배송 라벨 | 수취인, 주소, 품목 | 취급 표식이나 문서 영역 | 운송장 번호 | 주소 마스킹, 재촬영 요청 |
| 상품 라벨 | 상품명, 성분, 유통기한 | 로고나 상품 영역 | 상품 코드 | 필수 표시 검토, 등록 보류 |
```

- [ ] **Step 4: 처리 경로 계약 비교표를 작성한다**

```markdown
| 처리 경로 | 대표 결과 | 빈 결과의 의미 | 사용할 수 없음 | 처리 실패 |
|---|---|---|---|---|
| OCR | text, pages, blocks | 읽을 텍스트가 없음 | OCR provider 미설정 | 제한 시간 또는 provider 예외 |
| 객체 검출 | label, category, confidence, region | 찾은 대상이 없음 | detector 미설정 | detector 실행 실패 |
| 바코드·QR | text, format, provider, region | 코드가 없음 | reader 미설정 | 디코더 실행 실패 |
| 정책 | action, reasons | 해당 없음 | 필요한 분석 근거 부족 | 안전한 결정을 만들 수 없음 |
```

- [ ] **Step 5: MDX 구조를 검증한다**

Run:

```bash
rg -n "^## " src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx
rg -n "image-intelligence-part1-hero.png|data-diagram-title" src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx
```

Expected:

```text
10개 본문 heading이 설계 순서대로 나온다.
hero 경로가 1회 나오고 다이어그램 자리는 아직 없으므로 data-diagram-title은 0회다.
```

- [ ] **Step 6: 글 골격을 커밋한다**

```bash
git add src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx
git commit -m "Frame image intelligence around one shared input" \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: frontmatter, heading order, comparison tables"
```

---

### Task 3: 대표 이미지와 한국어 중심 처리 흐름 다이어그램을 만든다

**Files:**

- Create: `public/assets/blog/image-intelligence/part1/image-intelligence-part1-hero.png`
- Create: `public/assets/blog/image-intelligence/part1/image-intelligence-processing-flow-01-ko.svg`
- Create: `public/assets/blog/image-intelligence/part1/image-intelligence-processing-flow-01-ko.png`
- Modify: `src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx`

- [ ] **Step 1: 시각 작업 계약을 로드한다**

Read:

```text
/Users/debop/.codex/skills/.system/imagegen/SKILL.md
/Users/debop/.codex/skills/bluetape-diagram/SKILL.md
```

Expected:

```text
hero는 image generation 계약을, 기술 다이어그램은 bluetape-diagram 계약을 따른다.
```

- [ ] **Step 2: 대표 이미지를 생성하고 비교한다**

사용할 장면:

```text
Dark polished 3D miniature engineering workbench. A visitor pass card enters one
shared validation station, then branches toward three distinct stations labeled
OCR, DETECTION, and QR. Small white-and-blue robotic engineers inspect text,
a face-region frame, and a QR tile. The three outputs converge on a separate
POLICY console. Wide blog hero composition, clear center subject, no tiny prose,
no flat infographic, no logos.
```

같은 크기로 기존 OCR, Timefold, clinic hero와 contact sheet를 만들어 첫 화면의 주제,
로봇 형태, 조명, 여백을 비교한다. 생성 결과가 flat diagram처럼 보이면 폐기한다.

- [ ] **Step 3: 한국어 처리 흐름 SVG를 작성한다**

다음 흐름과 불변식을 포함한다.

```text
이미지 업로드
  -> 입력 자격 판정
     MIME/magic bytes · 파일 크기 · 디코딩 · 가로/세로 · 전체 픽셀 수
  -> ImmutableImage 한 번 생성
     -> OCR: 텍스트·페이지·block
     -> 객체 검출: label·confidence·region
     -> 바코드·QR: text·format·region
  -> 부분 결과 조합
     경로별 Completed · Empty · Unavailable · Failed
  -> 방문증 정책
     ALLOW · MANUAL_REVIEW · REJECT
```

하단 불변식:

```text
입력 자격 판정 실패 시 분석 작업을 시작하지 않는다.
한 처리 경로의 실패가 다른 처리 경로의 결과를 지우지 않는다.
요청 취소는 부분 성공으로 바꾸지 않는다.
```

- [ ] **Step 4: SVG를 PNG로 변환하고 다이어그램 검수를 실행한다**

`bluetape-diagram`이 지정한 renderer와 checklist를 사용한다. 최소 검수 항목:

```text
텍스트 잘림 0
connector가 card 내부를 통과한 횟수 0
잘못된 화살촉 방향 0
label과 connector 겹침 0
shared segment 0
PNG에서 100%와 article-width 가독성 PASS
```

- [ ] **Step 5: 한국어 글에 중심 다이어그램을 삽입한다**

```mdx
<figure
  class="bt4k-architecture"
  data-diagram-title="이미지 인텔리전스 API의 전체 처리 경계"
>
  <img src="/assets/blog/image-intelligence/part1/image-intelligence-processing-flow-01-ko.png" alt="이미지 업로드를 공통 입력 자격 판정과 단일 디코딩으로 검증한 뒤 OCR, 객체 검출, 바코드·QR 작업을 독립 실행하고 부분 결과를 방문증 정책으로 전달하는 처리 흐름" loading="lazy" />
  <figcaption>같은 이미지를 읽더라도 세 처리 경로의 결과와 실패 의미는 다릅니다. 공통 경계는 입력 자격만 판정하고, 업무 결정은 결과 조합 뒤의 정책이 맡습니다.</figcaption>
</figure>
```

- [ ] **Step 6: 대표 이미지와 중심 다이어그램을 커밋한다**

```bash
git add public/assets/blog/image-intelligence/part1/image-intelligence-part1-hero.png \
  public/assets/blog/image-intelligence/part1/image-intelligence-processing-flow-01-ko.svg \
  public/assets/blog/image-intelligence/part1/image-intelligence-processing-flow-01-ko.png \
  src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx
git commit -m "Show image intelligence as separated processing boundaries" \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: hero comparison, SVG and PNG diagram checklist"
```

---

### Task 4: 방문증 중첩 그림과 결과 계약 지도를 만든다

**Files:**

- Create: `public/assets/blog/image-intelligence/part1/image-intelligence-visitor-pass-overlay-02-ko.svg`
- Create: `public/assets/blog/image-intelligence/part1/image-intelligence-visitor-pass-overlay-02-ko.png`
- Create: `public/assets/blog/image-intelligence/part1/image-intelligence-result-contracts-03-ko.svg`
- Create: `public/assets/blog/image-intelligence/part1/image-intelligence-result-contracts-03-ko.png`
- Modify: `src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx`

- [ ] **Step 1: 방문증 중첩 그림을 작성한다**

방문증 card에 다음 영역을 겹쳐 표시한다.

```text
OCR block: Name / Company / Access
객체 검출 region: face, category=FACE, confidence=0.99
QR region: visitor:PASS-001, format=QR_CODE
```

색상은 OCR cyan, 객체 검출 orange, QR green으로 고정한다. 좌표계는 공유하지만
세 결과가 하나의 공통 결과형이 아니라는 설명을 우측 legend에 둔다.

- [ ] **Step 2: 결과 계약 card 지도를 작성한다**

네 card를 다음 필드로 구성한다.

```text
OCR
text · pages · blocks · provider

객체 검출
label · category · confidence · region · detector

바코드·QR
text · format · region · provider

방문증 정책
action · reasons · aggregateStatus
```

세 분석 card에서 정책 card로 향하는 connector를 사용하되, OCR·객체 검출·바코드
사이에 상속이나 동일 타입을 암시하는 connector를 그리지 않는다.

- [ ] **Step 3: 두 SVG를 PNG로 변환하고 검수한다**

Task 3과 같은 다이어그램 checklist를 적용하고 다음 항목을 추가한다.

```text
방문증 overlay의 영역과 legend 색상 일치
QR 영역이 실제 QR처럼 보이되 판독 가능한 값이라고 과장하지 않음
네 계약 card의 field 글자 크기 동일
정책 card로 향하는 화살촉 방향 3개 모두 정확
```

- [ ] **Step 4: 한국어 글에 두 figure를 삽입한다**

각 figure는 `bt4k-architecture`, 고유 `data-diagram-title`, 구체적인 `alt`,
해석을 담은 `figcaption`을 사용한다.

- [ ] **Step 5: 시각 자료를 커밋한다**

```bash
git add public/assets/blog/image-intelligence/part1/image-intelligence-visitor-pass-overlay-02-ko.svg \
  public/assets/blog/image-intelligence/part1/image-intelligence-visitor-pass-overlay-02-ko.png \
  public/assets/blog/image-intelligence/part1/image-intelligence-result-contracts-03-ko.svg \
  public/assets/blog/image-intelligence/part1/image-intelligence-result-contracts-03-ko.png \
  src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx
git commit -m "Compare image analysis facts before policy decisions" \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: overlay legend, connector direction, PNG readability"
```

---

### Task 5: 한국어 본문을 구현 근거로 완성한다

**Files:**

- Modify: `src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx`
- Reference: `docs/review/2026-07-27-image-intelligence-part1-claim-ledger.md`

- [ ] **Step 1: 입력 자격과 단일 디코딩을 설명한다**

다음 의사코드를 사용한다.

```kotlin
val qualified = qualifier.qualify(upload)

val results = workflow.analyze(
    image = qualified.image, // 한 번 디코딩한 ImmutableImage
    requestId = requestId,
)
```

본문은 `qualify`가 OCR 인식률이나 QR 존재 여부를 판단하는 단계가 아니라, 세 분석
작업을 시작해도 되는 입력인지 판정하는 단계라고 명시한다.

- [ ] **Step 2: 병렬 실행과 부분 실패를 설명한다**

다음 축약 의사코드를 사용한다.

```kotlin
suspendParallelFlow("image-intelligence-analysis") {
    task("ocr") { runOcr(image) }
    task("detection") { runDetection(image) }
    task("barcode") { runBarcode(image) }
}
```

`WorkReport.Success`는 업무 분석 성공 상태가 아니라 workflow 작업 자체가 결과를
정상 반환했다는 뜻이며, 경로별 `AnalysisResult.Failed`도 결과로 보존할 수 있다고
설명한다.

- [ ] **Step 3: 집계 응답을 짧게 보여 준다**

세 응답을 전체 JSON으로 복사하지 않고 다음 표로 요약한다.

```markdown
| 집계 상태 | 처리 경로 예 | 정책 해석 |
|---|---|---|
| `COMPLETED` | 세 경로가 `Completed` 또는 `Empty` | 필요한 방문증 정보가 있으면 `ALLOW` |
| `PARTIAL` | OCR `Failed`, 객체 검출·QR `Completed` | 성공 결과는 보존하고 `MANUAL_REVIEW` |
| `FAILED` | 사용할 수 있는 결과가 하나도 없음 | 안전한 판단 근거가 없어 `REJECT` |
```

- [ ] **Step 4: 분석 사실과 정책 분리를 설명한다**

다음 문장을 기준으로 작성한다.

```text
객체 검출기가 얼굴 영역을 찾았다는 것은 분석 사실입니다. 그 얼굴을 가릴지,
원본 접근을 제한할지, 방문증 접수를 수동 검토로 보낼지는 서비스 정책입니다.
```

fixture detector와 production ML runtime의 경계를 같은 문단에서 명시한다.

- [ ] **Step 5: 시리즈 안내와 자료 링크를 작성한다**

자료는 독자에게 필요한 대표 소스만 제공한다.

```markdown
- `spring-boot-image-intelligence-api` README
- `ImageUploadQualifier.kt`
- `ImageIntelligenceWorkflow.kt`
- `ImageAnalysisProviders.kt`
- `VisitorPassPolicy.kt`
- 기존 OCR 운영 글
- 이미지 backend 성능 글
- 입력 경계 글
```

GitHub source URL은 모두 `develop` branch를 가리킨다.

- [ ] **Step 6: 한국어 자연스러움 검수를 실행한다**

다음 표현을 찾아 문맥에 맞게 고친다.

```bash
rg -n "중요합니다|효율적|다양한 장점|~를 통해|할 필요가|주목할|강력|포괄적|나아가|따라서" \
  src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx
```

식별자, 상태 이름, URL, 숫자와 구현 의미는 바꾸지 않는다.

- [ ] **Step 7: 한국어 글을 커밋한다**

```bash
git add src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx
git commit -m "Explain multiple image analyses without collapsing their contracts" \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: claim ledger, source links, Korean naturalness checklist"
```

---

### Task 6: 한국어 route를 빌드하고 사용자 검토를 받는다

**Files:**

- Modify if required: `src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx`
- Modify if required: Korean SVG/PNG assets from Tasks 3 and 4

- [ ] **Step 1: 정적 검증을 실행한다**

Run:

```bash
git diff --check develop...HEAD
rg -n 'data-diagram-title=' src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx
test "$(rg -c 'data-diagram-title=' src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx)" -eq 3
```

Expected:

```text
diff check PASS
서로 다른 다이어그램 제목 3개
```

- [ ] **Step 2: 사이트를 빌드한다**

Run:

```bash
npm run build
```

Expected:

```text
astro check 오류 0
build 성공
```

- [ ] **Step 3: 한국어 route와 asset을 검증한다**

Run:

```bash
test -f dist/ko/blog/image-intelligence-part1-multi-analysis-boundaries/index.html
for asset in \
  image-intelligence-part1-hero.png \
  image-intelligence-processing-flow-01-ko.png \
  image-intelligence-visitor-pass-overlay-02-ko.png \
  image-intelligence-result-contracts-03-ko.png
do
  test -f "dist/assets/blog/image-intelligence/part1/$asset"
done
```

Expected:

```text
한국어 HTML 1개와 게시용 PNG 4개가 모두 존재한다.
```

- [ ] **Step 4: 로컬 서버에서 시각 검토한다**

`npm run dev -- --host 127.0.0.1 --port 4326`으로 서버를 실행하고 다음 route를
in-app browser에서 연다.

```text
/ko/blog/image-intelligence-part1-multi-analysis-boundaries/
```

검토 항목:

```text
대표 이미지가 첫 화면에서 잘리지 않음
다이어그램 3개가 article width에서 읽힘
이미지 클릭과 우측 상단 크게 보기 아이콘이 모두 동작
lightbox 제목이 data-diagram-title과 일치
일반 hero는 lightbox 대상이 아님
mobile 폭에서 표와 code block이 본문을 넘지 않음
```

- [ ] **Step 5: 사용자에게 한국어 글 검토를 요청한다**

사용자가 한국어 본문과 세 다이어그램을 승인하기 전에는 영어 글을 작성하지 않는다.
수정 요청이 있으면 한국어 글과 한국어 asset만 고치고 Steps 1~4를 다시 실행한다.

---

### Task 7: 승인된 한국어 글을 영어로 현지화한다

**Prerequisite:** Task 6 Step 5의 명시적 한국어 승인

**Files:**

- Create: `src/content/docs/blog/image-intelligence-part1-multi-analysis-boundaries.mdx`
- Create: English SVG/PNG assets listed in the file structure

- [ ] **Step 1: 영어 frontmatter를 작성한다**

```yaml
---
title: "Extracting Multiple Kinds of Information from One Image: OCR, Detection, and QR Boundaries"
description: Using a visitor pass, this article separates upload qualification, one decode, parallel OCR, detection, and QR lanes, partial failure, and business policy.
sidebar:
  order: -202607271200
blog:
  date: 2026-07-27T12:00:00+09:00
  image: /assets/blog/image-intelligence/part1/image-intelligence-part1-hero.png
  imageAlt: A visitor-pass image passes through shared qualification, then branches to OCR, detection, and QR workstations before the results reach a policy console
  cardDescription: "See how one API reads text, object regions, and QR values independently, preserves partial failure, and evaluates business policy afterward."
---
```

- [ ] **Step 2: 영어 본문을 자연스럽게 현지화한다**

한국어 heading, 표, 코드, 상태, source link, caveat를 빠뜨리지 않는다. 한국어 문장
구조를 직역하지 않고 engineer-to-engineer 문장으로 다시 쓴다.

- [ ] **Step 3: 영문 다이어그램 3개를 만든다**

한국어 asset과 geometry, card 수, connector, 색상, 정보량을 같게 유지하고 label만
영어로 바꾼다. 같은 diagram checklist와 PNG 검수를 다시 실행한다.

- [ ] **Step 4: locale parity를 검증한다**

다음 표를 `docs/review/2026-07-27-image-intelligence-part1-review.md`에 기록한다.

```markdown
| 항목 | 한국어 | 영어 | 결과 |
|---|---|---|---|
| route | `/ko/blog/image-intelligence-part1-multi-analysis-boundaries/` | `/blog/image-intelligence-part1-multi-analysis-boundaries/` | PASS |
| heading 수 | 10 | 10 | PASS |
| 기술 다이어그램 | 3 | 3 | PASS |
| source link | 동일 대상 | 동일 대상 | PASS |
| 상태 | `COMPLETED/PARTIAL/FAILED` | 동일 | PASS |
| 다음 Part 안내 | Part 2~7 | Part 2~7 | PASS |
```

- [ ] **Step 5: 영어 parity를 커밋한다**

```bash
git add src/content/docs/blog/image-intelligence-part1-multi-analysis-boundaries.mdx \
  public/assets/blog/image-intelligence/part1/*-en.svg \
  public/assets/blog/image-intelligence/part1/*-en.png \
  docs/review/2026-07-27-image-intelligence-part1-review.md
git commit -m "Keep the image intelligence introduction aligned across locales" \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: locale parity matrix, English diagram checklist"
```

---

### Task 8: 최종 검증과 PR 전달을 완료한다

**Files:**

- Modify: `docs/review/2026-07-27-image-intelligence-part1-review.md`
- Modify external: GitHub Issue #201
- Create external: GitHub PR from `docs/issue-201-image-intelligence-series` to `develop`

- [ ] **Step 1: 최종 diff와 링크를 검토한다**

Run:

```bash
git diff --check develop...HEAD
git diff --stat develop...HEAD
rg -n 'bluetape4k-workshop|T''BD|TO''DO|FIX''ME' \
  src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx \
  src/content/docs/blog/image-intelligence-part1-multi-analysis-boundaries.mdx
```

Expected:

```text
diff check PASS
현재 통합 예제를 workshop 구현으로 잘못 링크한 문장 0
미정 항목 0
```

- [ ] **Step 2: 전체 사이트 검증을 실행한다**

Run:

```bash
npm run build
npm test
```

Expected:

```text
Astro check/build PASS
repository tests PASS
```

- [ ] **Step 3: 두 locale route와 모든 asset을 검증한다**

Run:

```bash
test -f dist/ko/blog/image-intelligence-part1-multi-analysis-boundaries/index.html
test -f dist/blog/image-intelligence-part1-multi-analysis-boundaries/index.html
find dist/assets/blog/image-intelligence/part1 -maxdepth 1 -type f | sort
```

Expected:

```text
한국어·영어 HTML이 모두 존재한다.
hero 1개와 locale별 SVG/PNG 다이어그램 12개가 존재한다.
```

- [ ] **Step 4: 최종 리뷰 문서를 완성한다**

다음 결과를 기록한다.

```text
사실 검증 P0=0, P1=0
한국어 자연스러움 KO-01~KO-06 PASS
다이어그램 3종 x 2 locale PASS
locale parity PASS
site build와 tests PASS
known limitation: production ML detector runtime은 application-provided
```

- [ ] **Step 5: 정확한 head를 push하고 PR을 만든다**

```bash
git push -u origin docs/issue-201-image-intelligence-series
gh pr create \
  --repo bluetape4k/bluetape4k.github.io \
  --base develop \
  --head docs/issue-201-image-intelligence-series \
  --title "docs(blog): introduce image intelligence processing boundaries" \
  --assignee debop \
  --label documentation \
  --label enhancement \
  --milestone Backlog \
  --body-file - <<'EOF'
## Summary

- introduce Part 1 of the image intelligence series with a visitor-pass scenario
- explain shared qualification, one decode, independent OCR, detection, and QR lanes
- preserve partial failure and separate analysis facts from business policy
- add Korean and English dark-style diagrams with enlarged-view titles

Part of #201

## Verification

- `npm run build`
- `npm test`
- Korean and English route checks
- diagram SVG/PNG checklist for both locales
- locale parity review

## Known limitation

The example does not bundle a production ML detector runtime. Applications provide that adapter.

## DoD Status

- [x] Korean article reviewed before English localization
- [x] locale routes, claims, links, assets, and navigation aligned
- [x] site build and repository tests pass
- [x] diagrams render as PNG and support enlarged view
- [ ] required CI is green on the exact PR head
- [ ] merge and deployment require separate approval
EOF
```

- [ ] **Step 6: Issue #201의 Part 1 상태를 갱신한다**

Run:

```bash
PR_URL="$(gh pr view docs/issue-201-image-intelligence-series \
  --repo bluetape4k/bluetape4k.github.io --json url --jq .url)"
export PR_URL
gh issue view 201 --repo bluetape4k/bluetape4k.github.io --json body --jq .body |
  python3 -c 'import os,sys; body=sys.stdin.read(); body=body.replace("- [ ] Part 1 —", "- [x] Part 1 —", 1); print(body.replace("## Acceptance criteria", f"Part 1 PR: {os.environ[\"PR_URL\"]}\\n\\n## Acceptance criteria", 1), end="")' |
  gh issue edit 201 --repo bluetape4k/bluetape4k.github.io --body-file -
```

Expected:

```text
Part 1 체크박스가 완료되고 PR URL이 기록된다.
Issue assignee debop, labels documentation/enhancement, milestone Backlog이 유지된다.
```

- [ ] **Step 7: PR live metadata와 CI를 검증한다**

```bash
gh pr view docs/issue-201-image-intelligence-series --repo bluetape4k/bluetape4k.github.io \
  --json body,headRefOid,assignees,labels,milestone,mergeable
gh pr checks docs/issue-201-image-intelligence-series \
  --repo bluetape4k/bluetape4k.github.io --watch
```

Expected:

```text
local SHA = remote branch SHA = PR head SHA
assignee, labels, milestone parity PASS
final H2 = DoD Status
required CI green
unresolved blocker 0
```

- [ ] **Step 8: PR까지만 보고한다**

PR URL, exact head SHA, CI, route, asset, locale parity, 리뷰 결과를 보고한다.
병합과 배포는 실행하지 않고 새 승인을 기다린다.

---

## 계획 자체 검수

- [ ] 설계의 Part 1 요구사항이 Tasks 1~6에 모두 연결된다.
- [ ] 한국어 승인 전 영어 작성을 막는 prerequisite가 있다.
- [ ] 기존 공개 OCR·입력 경계·성능 글을 반복하지 않는 작업이 Task 1과 Task 5에 있다.
- [ ] 대표 이미지와 기술 다이어그램의 생성·검수 계약이 분리되어 있다.
- [ ] 기술 다이어그램 3종은 source SVG와 게시용 PNG를 모두 가진다.
- [ ] 크게 보기 제목, 클릭, 아이콘, hero 제외 검증이 Task 6에 있다.
- [ ] 영어 route, asset, claim, source link parity가 Task 7과 Task 8에 있다.
- [ ] PR target은 `bluetape4k/bluetape4k.github.io`, base `develop`, head `docs/issue-201-image-intelligence-series`로 고정된다.
- [ ] merge와 deployment는 계획 범위에서 제외된다.
