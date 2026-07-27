# Image Intelligence Part 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 방문증 이미지의 공통 입력 자격 판정과 단일 디코딩 경계를 설명하는 한·영 Part 2 글과 dark-style 기술 다이어그램을 작성해 PR로 전달한다.

**Architecture:** 한국어 글을 현재 `bluetape4k-image` 예제와 테스트에 맞춰 먼저 작성하고 로컬 검토를 받는다. 승인된 한국어를 기준으로 영문 글과 영문 다이어그램을 맞추며, 마지막에는 한국어 번역체 교정과 사이트 빌드·경로·확대 UI·PR metadata를 검증한다.

**Tech Stack:** Astro, Starlight, MDX, SVG, CairoSVG, npm, GitHub CLI

---

## 파일 구조

### 새 파일

- `src/content/docs/ko/blog/image-intelligence-part2-input-qualification-and-single-decode.mdx`
  - 한국어 Part 2 본문과 한국어 시리즈 탐색을 제공한다.
- `src/content/docs/blog/image-intelligence-part2-input-qualification-and-single-decode.mdx`
  - 승인된 한국어 글과 동등한 영문 Part 2 본문을 제공한다.
- `public/assets/blog/image-intelligence/part2/image-intelligence-part2-hero.png`
  - Part 1과 같은 계열의 대표 이미지다. 기술 다이어그램 확대 대상에서는 제외한다.
- `public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01-ko.svg`
- `public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01-ko.png`
- `public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01-en.svg`
- `public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01-en.png`
  - multipart 입력부터 `QualifiedImage`까지 수직 자격 판정 흐름을 보여준다.
- `public/assets/blog/image-intelligence/part2/image-intelligence-single-decode-02-ko.svg`
- `public/assets/blog/image-intelligence/part2/image-intelligence-single-decode-02-ko.png`
- `public/assets/blog/image-intelligence/part2/image-intelligence-single-decode-02-en.svg`
- `public/assets/blog/image-intelligence/part2/image-intelligence-single-decode-02-en.png`
  - 분석기별 반복 디코딩과 공통 단일 디코딩을 비교한다.
- `docs/review/2026-07-27-image-intelligence-part2-claim-ledger.md`
  - 글의 주요 주장과 구현·테스트 근거를 연결한다.
- `docs/review/2026-07-27-image-intelligence-part2-review.md`
  - 스타일, 한국어 교정, 다이어그램, 한영 동등성, 사이트 검증 결과를 기록한다.

### 수정 파일

- `src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx`
  - Part 2 항목을 실제 한국어 경로로 연결한다.
- `src/content/docs/blog/image-intelligence-part1-multi-analysis-boundaries.mdx`
  - Part 2 항목을 실제 영문 경로로 연결한다.
- `docs/superpowers/specs/2026-07-27-image-intelligence-blog-series-design.md`
  - Part 2 전달 결과와 다음 편 연결을 기록한다.

## Task 1: 주장과 근거를 고정한다

**Files:**
- Create: `docs/review/2026-07-27-image-intelligence-part2-claim-ledger.md`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/ImageUploadQualifier.kt`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/src/test/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/ImageUploadQualifierTest.kt`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/service/ImageIntelligenceService.kt`
- Read: `/Users/debop/work/bluetape4k/bluetape4k-image/examples/spring-boot-image-intelligence-api/src/main/kotlin/io/bluetape4k/images/examples/spring/intelligence/web/ImageIntelligenceExceptionHandler.kt`

- [ ] **Step 1: `ImageUploadQualifier`의 실제 판정 순서를 다시 읽는다**

확인할 순서는 다음과 같다.

```text
empty
-> declared media type
-> reported encoded size
-> read bytes
-> actual encoded size
-> file signature
-> declared/actual media-type match
-> dimension probe
-> side and pixel budgets
-> one full decode
-> QualifiedImage
```

- [ ] **Step 2: 테스트가 증명하는 실행 횟수를 기록한다**

다음 주장을 테스트 이름과 연결한다.

```text
valid PNG       -> decodeCalls == 1
media mismatch  -> decodeCalls == 0
encoded overflow -> decodeCalls == 0
side overflow   -> decodeCalls == 0
pixel overflow  -> decodeCalls == 0
cancellation    -> CancellationException rethrown
decoder failure -> stable image_not_decodable message
```

- [ ] **Step 3: 오류 코드와 HTTP 상태를 예외 처리기에서 확인한다**

글에 사용할 표는 구현과 일치해야 한다.

```text
payload_too_large       -> 413
empty_input             -> 400
unsupported_media_type  -> 400
unsupported_image_format -> 400
media_type_mismatch     -> 400
image_not_decodable     -> 400
image_read_failed       -> 400
```

- [ ] **Step 4: claim ledger를 작성한다**

각 행은 다음 열을 사용한다.

```markdown
| 주장 | 구현 근거 | 테스트 근거 | 글에서의 표현 | 상태 |
```

- [ ] **Step 5: 근거 파일을 검증하고 커밋한다**

Run:

```bash
git diff --check
rg -n "decodeCalls|media_type_mismatch|payload_too_large|CancellationException" \
  docs/review/2026-07-27-image-intelligence-part2-claim-ledger.md
```

Expected: whitespace 오류가 없고 네 근거 범주가 모두 검색된다.

Commit:

```bash
git add docs/review/2026-07-27-image-intelligence-part2-claim-ledger.md
git commit
```

## Task 2: 한국어 글의 문제와 처리 경계를 작성한다

**Files:**
- Create: `src/content/docs/ko/blog/image-intelligence-part2-input-qualification-and-single-decode.mdx`
- Modify: `src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx`

- [ ] **Step 1: Part 1과 같은 frontmatter와 대표 이미지 자리를 만든다**

한국어 제목과 설명은 다음 의미를 사용한다.

```yaml
title: "이미지 분석 전에 입력부터 판정하라: 공통 검증과 단일 디코딩"
description: "방문증 이미지 분석 API를 예로 들어 MIME 선언과 실제 시그니처, 압축 크기와 픽셀 예산, 단일 디코딩 경계를 설명합니다."
```

본문 시작은 반복 검증의 문제를 먼저 보여준다.

```text
방문증 이미지 한 장을 OCR, 객체 검출, QR 판독기가 각각 다시 읽는다면
분석기도 세 개지만 입력 경계도 세 개가 됩니다.
```

- [ ] **Step 2: 입력 자격과 분석 결과를 비교하는 표를 작성한다**

표는 다음 네 쌍을 포함한다.

```text
지원 이미지 형식인가      | 읽을 수 있는 글자가 있는가
압축 크기 제한 안인가     | 얼굴이나 민감 영역이 있는가
픽셀 예산 제한 안인가     | QR 값이 있는가
전체 디코딩이 가능한가    | 결과가 비었거나 분석기가 실패했는가
```

- [ ] **Step 3: 실제 판정 순서를 의사코드로 작성한다**

```kotlin
suspend fun qualify(file: MultipartFile): QualifiedImage {
    requireNotEmpty(file)
    val declaredType = requireSupportedMediaType(file.contentType)
    requireEncodedSize(file.size)

    val bytes = readOnce(file)
    requireEncodedSize(bytes.size)
    requireMatchingSignature(declaredType, bytes)

    val dimensions = probeDimensions(bytes)
    requireDecodedBudget(dimensions)

    return QualifiedImage(
        mediaType = declaredType,
        dimensions = dimensions,
        image = decodeOnce(bytes),
    )
}
```

코드 바로 아래에서 실제 소스를 단순화한 의사코드임을 밝힌다.

- [ ] **Step 4: 각 경계의 이유를 설명한다**

다음 내용을 별도 문단으로 쓴다.

```text
multipart가 보고한 크기와 실제 바이트 크기를 모두 확인한다.
파일 이름이나 MIME 선언 대신 실제 파일 시그니처를 확인한다.
압축 바이트 제한과 디코딩된 픽셀 예산은 서로 다른 비용을 막는다.
앞 단계가 실패하면 전체 디코딩과 세 분석기는 실행하지 않는다.
```

- [ ] **Step 5: `QualifiedImage`와 단일 디코딩 불변식을 설명한다**

다음 의사코드를 사용한다.

```kotlin
val qualified = qualifier.qualify(file)

workflow.analyze(
    image = qualified.image,
)
```

OCR, 객체 검출, QR 경로가 같은 `ImmutableImage`를 읽으며 multipart와 원본 바이트를 다시 읽지 않는다고
명시한다.

- [ ] **Step 6: 테스트와 실패 응답 절을 작성한다**

정상 입력은 디코딩 1회, 입력 거부는 디코딩 0회라는 표와 `400`/`413` 오류 표를 작성한다.
`CancellationException`은 요청 입력 오류가 아니므로 다시 던진다는 설명을 포함한다.

- [ ] **Step 7: 자료와 시리즈 탐색을 작성한다**

자료에는 다음 공개 진입점만 둔다.

```text
Spring Boot Image Intelligence API
ImageUploadQualifier
ImageUploadQualifierTest
ImageIntelligenceService
OCR 서비스를 실전에서 운영하기
Kotlin API 입력 경계
Pure JVM에서 libvips로
```

Part 1은 실제 링크로, Part 2는 현재 글로, Part 3은 예정 상태로 표시한다.

- [ ] **Step 8: Part 1의 한국어 Part 2 항목에 실제 링크를 건다**

Target:

```text
/ko/blog/image-intelligence-part2-input-qualification-and-single-decode/
```

- [ ] **Step 9: 한국어 초안 구조를 검증하고 커밋한다**

Run:

```bash
git diff --check
rg -n "입력 자격|단일 디코딩|decodeCalls|CancellationException|Part 3" \
  src/content/docs/ko/blog/image-intelligence-part2-input-qualification-and-single-decode.mdx
```

Expected: 핵심 경계, 실행 횟수, 취소 의미, 다음 편이 모두 검색된다.

Commit:

```bash
git add src/content/docs/ko/blog/image-intelligence-part1-multi-analysis-boundaries.mdx \
  src/content/docs/ko/blog/image-intelligence-part2-input-qualification-and-single-decode.mdx
git commit
```

## Task 3: 대표 이미지와 한국어 다이어그램을 만든다

**Files:**
- Create: `public/assets/blog/image-intelligence/part2/image-intelligence-part2-hero.png`
- Create: `public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01-ko.svg`
- Create: `public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01-ko.png`
- Create: `public/assets/blog/image-intelligence/part2/image-intelligence-single-decode-02-ko.svg`
- Create: `public/assets/blog/image-intelligence/part2/image-intelligence-single-decode-02-ko.png`
- Modify: `src/content/docs/ko/blog/image-intelligence-part2-input-qualification-and-single-decode.mdx`

- [ ] **Step 1: Part 1의 대표 이미지 계열을 확인하고 Part 2 대표 이미지를 생성한다**

표현할 장면:

```text
한 방문증 이미지가 어두운 검수 작업대를 지나 하나의 이미지 객체로 바뀌고,
그 객체가 OCR·객체 검출·QR 작업대로 전달된다.
```

대표 이미지에는 긴 기술 라벨을 넣지 않고 기술 다이어그램 확대 클래스를 사용하지 않는다.

- [ ] **Step 2: 수직 입력 자격 판정 SVG를 작성한다**

카드 순서:

```text
multipart 업로드
-> 선언 미디어 타입·보고 크기
-> 실제 바이트·파일 시그니처
-> 가로·세로·전체 픽셀 수
-> 한 번만 디코딩
-> QualifiedImage
```

거부 경로는 옆으로 짧게 분기하되 본 흐름의 화살촉과 라벨을 가리지 않는다.

- [ ] **Step 3: 첫 SVG를 XML 검증하고 PNG로 변환한다**

Run:

```bash
xmllint --noout public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01-ko.svg
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py" \
  public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01-ko.svg
cairosvg public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01-ko.svg \
  -o public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01-ko.png -s 2
```

Expected: XML과 text hazard 검사가 통과하고 PNG가 생성된다.

- [ ] **Step 4: 첫 PNG를 전체 크기로 확인하고 연결선 감사를 수행한다**

Run:

```bash
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-connector-audit.py" \
  public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01-ko.svg
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-geometry-audit.py" --fail-diagonal \
  public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01-ko.svg
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py" \
  public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01-ko.svg
```

Expected: connector, card, label 수가 0이 아니고 failures=0이다. 전체 크기 PNG에서 글꼴, 화살촉,
라벨, 카드 간격, 여백이 읽기 쉽다.

- [ ] **Step 5: 반복 디코딩과 단일 디코딩 비교 SVG를 작성한다**

왼쪽은 세 분석기가 각각 `read + decode`, 오른쪽은 한 `ImageUploadQualifier`와 한 `ImmutableImage`를
세 분석기가 공유하는 구조로 그린다. 컴포넌트를 연결하는 선은 카드와 충분히 떨어뜨리고 교차하지 않는다.

- [ ] **Step 6: 두 번째 SVG를 검증·변환·감사하고 PNG를 전체 크기로 확인한다**

첫 다이어그램과 같은 XML, text hazard, CairoSVG, connector, geometry, endpoint 검사를 실행한다.
Expected: 반복 디코딩 3개와 단일 디코딩 1개의 차이가 설명문 없이도 보이고 failures=0이다.

- [ ] **Step 7: 한국어 글에 대표 이미지와 두 기술 다이어그램을 삽입한다**

기술 다이어그램은 다음 형태를 사용한다.

```mdx
<figure class="bt4k-architecture" data-diagram-title="입력 자격 판정과 단일 디코딩 흐름">
  <img src="/assets/blog/image-intelligence/part2/..." alt="..." loading="lazy" />
  <figcaption>...</figcaption>
</figure>
```

- [ ] **Step 8: 자산과 글을 검증하고 커밋한다**

Run:

```bash
git diff --check
file public/assets/blog/image-intelligence/part2/*.png
rg -n "data-diagram-title|image-intelligence/part2" \
  src/content/docs/ko/blog/image-intelligence-part2-input-qualification-and-single-decode.mdx
```

Expected: PNG가 유효하고 기술 다이어그램 두 개 모두 제목과 절대 asset 경로를 가진다.

Commit:

```bash
git add public/assets/blog/image-intelligence/part2 \
  src/content/docs/ko/blog/image-intelligence-part2-input-qualification-and-single-decode.mdx
git commit
```

## Task 4: 한국어 글을 로컬에서 검토받는다

**Files:**
- Modify after review: `src/content/docs/ko/blog/image-intelligence-part2-input-qualification-and-single-decode.mdx`
- Modify after review: `public/assets/blog/image-intelligence/part2/*-ko.svg`
- Modify after review: `public/assets/blog/image-intelligence/part2/*-ko.png`

- [ ] **Step 1: 사이트를 빌드한다**

Run:

```bash
npm run build
```

Expected: Astro/Starlight build가 성공하고 한국어 Part 2 경로가 생성된다.

- [ ] **Step 2: 로컬 서버를 실행한다**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected route:

```text
/ko/blog/image-intelligence-part2-input-qualification-and-single-decode/
```

- [ ] **Step 3: 브라우저에서 한국어 글과 다이어그램을 확인한다**

확인 항목:

```text
대표 이미지
첫 화면 제목과 도입부
표와 의사코드
다이어그램 글꼴·화살촉·라벨·간격
다이어그램 클릭과 우측 상단 크게 보기
Part 1 링크와 Part 3 예정 표기
```

- [ ] **Step 4: 사용자 피드백을 반영하고 영향받은 검증을 다시 실행한다**

Expected: 한국어 본문과 한국어 다이어그램이 사용자 승인 상태다.

- [ ] **Step 5: 승인된 한국어 상태를 커밋한다**

Run:

```bash
git diff --check
npm run build
```

Expected: 수정 후에도 diff와 사이트 빌드가 통과한다.

## Task 5: 영어 글과 영어 다이어그램을 맞춘다

**Files:**
- Create: `src/content/docs/blog/image-intelligence-part2-input-qualification-and-single-decode.mdx`
- Create: `public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01-en.svg`
- Create: `public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01-en.png`
- Create: `public/assets/blog/image-intelligence/part2/image-intelligence-single-decode-02-en.svg`
- Create: `public/assets/blog/image-intelligence/part2/image-intelligence-single-decode-02-en.png`
- Modify: `src/content/docs/blog/image-intelligence-part1-multi-analysis-boundaries.mdx`

- [ ] **Step 1: 승인된 한국어 글을 자연스러운 기술 영어로 옮긴다**

영문 제목은 다음 의미를 사용한다.

```yaml
title: "Qualify Before You Analyze: Shared Input Guards and a Single Decode"
```

한국어의 주장, 표, 의사코드, 소스 링크를 보존하되 한국어 어순을 직역하지 않는다.

- [ ] **Step 2: 두 영어 SVG의 라벨을 영어로 작성한다**

구도와 connector 좌표는 승인된 한국어 자산과 같게 유지하고 reader-facing label만 영어로 바꾼다.
영어 글꼴은 제목·heading에 `Architects Daughter`, 본문·식별자에 `Comic Mono`를 사용한다.

- [ ] **Step 3: 영어 SVG를 하나씩 검증·변환·감사한다**

각 자산에 XML, text hazard, CairoSVG `-s 2`, connector, geometry, endpoint 검사를 실행하고 최종 PNG를
전체 크기로 확인한다.

- [ ] **Step 4: Part 1의 영어 Part 2 항목에 실제 링크를 건다**

Target:

```text
/blog/image-intelligence-part2-input-qualification-and-single-decode/
```

- [ ] **Step 5: 한영 동등성 표를 확인한다**

다음 항목을 1:1로 대조한다.

```text
route
Part number
title meaning
claims
pseudocode
tables
source links
diagram count and meaning
Part 1 and Part 3 navigation
```

- [ ] **Step 6: 영어 글과 자산을 검증하고 커밋한다**

Run:

```bash
git diff --check
npm run build
```

Expected: 두 locale 경로와 모든 영어 자산이 생성되고 빌드가 성공한다.

## Task 6: 최종 한국어 교정과 검증 기록을 완성한다

**Files:**
- Modify: `src/content/docs/ko/blog/image-intelligence-part2-input-qualification-and-single-decode.mdx`
- Modify: `src/content/docs/blog/image-intelligence-part2-input-qualification-and-single-decode.mdx`
- Modify: `docs/superpowers/specs/2026-07-27-image-intelligence-blog-series-design.md`
- Create: `docs/review/2026-07-27-image-intelligence-part2-review.md`

- [ ] **Step 1: 한국어 글을 소리 내어 읽는 기준으로 교정한다**

다음을 문장별로 확인한다.

```text
영어 어순을 그대로 옮긴 문장
불필요한 명사 나열
어색한 피동형
기술 용어가 아닌 영문 표현
한 문장에 겹친 여러 판단
같은 의미의 반복 문단
```

API 이름, 식별자, 숫자, 오류 코드, 링크와 기술 의미는 바꾸지 않는다.

- [ ] **Step 2: 교정 뒤 영문과 주장 동등성을 다시 확인한다**

한국어 표현을 자연스럽게 바꾼 결과가 영문과 다른 기술 주장을 만들지 않았는지 claim ledger와 비교한다.

- [ ] **Step 3: 시리즈 설계 문서에 Part 2 결과를 기록한다**

Part 2 한국어·영어 경로, 자산 경로, 주요 근거, Part 3 연결을 기록한다.

- [ ] **Step 4: review 문서에 스타일과 검증 결과를 기록한다**

다음 행을 포함한다.

```markdown
| 항목 | 근거 | 결과 |
| 로컬 글 형태 | Part 1 및 기존 OCR 글과 비교 | PASS |
| 한국어 번역체 교정 | 교정 항목과 의미 보존 확인 | PASS |
| 다이어그램 | XML, CairoSVG, audits, full-size inspection | PASS |
| 한영 동등성 | route, claim, link, asset matrix | PASS |
| 사이트 | build, route, image, enlarged-view | PASS |
```

- [ ] **Step 5: 최종 전체 검증을 실행한다**

Run:

```bash
git diff --check
npm run build
```

Expected: 오류 없이 성공한다.

- [ ] **Step 6: 변경 경로와 최종 diff를 검토한다**

Run:

```bash
repo-status
repo-diff --stat
git diff --name-only develop...HEAD
```

Expected: 승인된 글, 자산, spec/plan/review 파일과 Part 1 탐색 수정만 포함된다.

- [ ] **Step 7: 최종 검증 상태를 커밋한다**

Commit message는 Lore 형식으로 작성하고 `Tested:`에 build, route, diagram audit, locale parity를 기록한다.

## Task 7: 정확한 head로 PR을 전달한다

**Files:**
- Read: `/Users/debop/.codex/skills/bluetape-workflow/templates/pr-body-step-dod.md`

- [ ] **Step 1: 로컬 head와 작업 트리를 확인한다**

Run:

```bash
repo-status
git rev-parse HEAD
```

Expected: 작업 트리가 clean이고 정확한 head SHA가 확인된다.

- [ ] **Step 2: 브랜치를 push하고 remote head를 읽는다**

Run:

```bash
git push -u origin docs/issue-201-image-intelligence-part2
git rev-parse HEAD
git rev-parse origin/docs/issue-201-image-intelligence-part2
```

Expected: local과 remote SHA가 같다.

- [ ] **Step 3: PR을 만들고 Issue #201 metadata를 적용한다**

PR 조건:

```text
repository: bluetape4k/bluetape4k.github.io
base: develop
head: docs/issue-201-image-intelligence-part2
assignee: debop
labels: documentation, enhancement
milestone: Backlog
closing behavior: do not close Issue #201 because Parts 3-7 remain
```

PR 본문 마지막 H2는 반드시 다음과 같다.

```markdown
## DoD Status
```

- [ ] **Step 4: PR을 live query로 다시 확인한다**

Run:

```bash
gh pr view <number> --json url,headRefName,baseRefName,headRefOid,assignees,labels,milestone,body
```

Expected: head/base/SHA/assignee/labels/milestone가 맞고 본문의 마지막 H2가 `## DoD Status`다.

- [ ] **Step 5: exact-head CI와 현재 review 상태를 확인한다**

Run:

```bash
ci-status --watch
gh pr view <number> --json headRefOid,reviewDecision,reviews,statusCheckRollup
```

Expected: exact head의 필수 검사가 성공하고 해결되지 않은 P0/P1 review가 없다.

- [ ] **Step 6: merge-ready 상태만 보고한다**

PR URL, exact head SHA, CI, review, diagram evidence, 한국어 교정, 한영 동등성, 체크리스트 수를 보고한다.
병합과 배포는 실행하지 않고 새로운 명시적 승인을 기다린다.

## 자체 검토

- Spec coverage:
  - 공통 입력 판정, 단일 디코딩, 테스트 실행 횟수, 오류 계약, 기존 글 중복 방지, 다이어그램 2종,
    한국어 우선 검토, 영어 동등성, 최종 한국어 교정, PR-only 전달이 Task 1~7에 모두 연결됐다.
- Placeholder scan:
  - 금지된 자리표시자, 막연한 구현 지시, 근거 없는 테스트 단계가 없다.
- Type consistency:
  - `QualifiedImage`, `ImmutableImage`, `ImageUploadQualifier`, 오류 코드와 경로가 설계와 현재 구현에 맞는다.
- Execution mode:
  - repo 지침에 따라 이 계획은 subagent를 사용하지 않고 현재 세션에서
    `superpowers:executing-plans`로 실행한다.
